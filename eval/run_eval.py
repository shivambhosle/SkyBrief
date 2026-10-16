"""
Automated Evaluation Runner for SkyBrief Plain-English LLM Briefings.
Executes all 20 test cases from eval/cases.json through the real FastAPI endpoint,
runs verification checks, measures pass rates, and writes real outputs to eval/results.md.
"""

import sys
import os
import json
import time
from datetime import datetime, UTC
from pathlib import Path
from unittest.mock import patch, AsyncMock

# Add backend directory to sys.path so backend modules can be imported
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from main import app
from schemas.briefing import BriefingSummaryResponse, LLMBriefingOutput
from services.verifier import check_forbidden_phrases


def run_evaluation():
    cases_file = Path(__file__).resolve().parent / "cases.json"
    results_file = Path(__file__).resolve().parent / "results.md"

    if not cases_file.exists():
        print(f"Error: cases.json not found at {cases_file}")
        sys.exit(1)

    with open(cases_file, "r", encoding="utf-8") as f:
        cases = json.load(f)

    client = TestClient(app)
    results = []

    print(f"Starting evaluation of {len(cases)} cases through /api/briefing/summary...")
    start_time = time.time()

    for idx, case in enumerate(cases, 1):
        case_id = case["id"]
        case_name = case["name"]
        icao = case["icao"]
        report_type = case["report_type"]
        raw_dict = case["raw_dict"]

        print(f"[{idx:02d}/{len(cases):02d}] Evaluating {case_id} ({icao} {report_type})...", end=" ")

        passed = False
        reasons = []
        status_code = None
        response_data = None
        verifier_passed = False
        forbidden_phrases_found = []
        is_valid_json_schema = False

        try:
            # Patch external fetcher so the endpoint receives the test case's raw dictionary
            target_patch = (
                "routers.briefing_summary.get_metar"
                if report_type == "METAR"
                else "routers.briefing_summary.get_taf"
            )

            with patch(target_patch, new_callable=AsyncMock) as mock_fetch:
                mock_fetch.return_value = raw_dict

                response = client.post(
                    "/api/briefing/summary",
                    json={"icao": icao, "report_type": report_type}
                )
                status_code = response.status_code

                if status_code != 200:
                    reasons.append(f"HTTP {status_code}: {response.text}")
                else:
                    response_json = response.json()
                    # Validate schema with Pydantic
                    validated_resp = BriefingSummaryResponse.model_validate(response_json)
                    is_valid_json_schema = True
                    response_data = validated_resp

                    verifier_result = validated_resp.verification
                    verifier_passed = verifier_result.passed

                    # Check forbidden phrases across all fields
                    text_parts = [
                        validated_resp.summary.summary,
                        validated_resp.summary.wind_summary,
                        validated_resp.summary.visibility_category,
                        validated_resp.summary.ceiling_category,
                    ] + validated_resp.summary.hazards + validated_resp.summary.data_gaps
                    all_text = " ".join(text_parts)
                    forbidden_phrases_found = check_forbidden_phrases(all_text)

                    if not is_valid_json_schema:
                        reasons.append("Response failed Pydantic schema validation.")
                    if not verifier_passed:
                        reasons.append(f"Verifier mismatches: {'; '.join(verifier_result.mismatches)}")
                    if forbidden_phrases_found:
                        reasons.append(f"Forbidden phrases detected: {'; '.join(forbidden_phrases_found)}")

                    if is_valid_json_schema and verifier_passed and not forbidden_phrases_found:
                        passed = True

        except Exception as exc:
            reasons.append(f"Unhandled exception during evaluation: {str(exc)}")

        if passed:
            print("PASSED")
        else:
            print(f"FAILED ({', '.join(reasons)})")

        results.append({
            "id": case_id,
            "name": case_name,
            "icao": icao,
            "report_type": report_type,
            "status_code": status_code,
            "passed": passed,
            "reasons": reasons,
            "is_valid_json_schema": is_valid_json_schema,
            "verifier_passed": verifier_passed,
            "forbidden_phrases": forbidden_phrases_found,
            "summary_text": response_data.summary.summary if response_data else None,
            "wind_summary": response_data.summary.wind_summary if response_data else None,
            "status": response_data.status if response_data else "error",
        })

    elapsed_time = round(time.time() - start_time, 2)
    total = len(results)
    passed_count = sum(1 for r in results if r["passed"])
    failed_count = total - passed_count
    pass_rate = round((passed_count / total) * 100, 1)

    print(f"\nEvaluation Complete in {elapsed_time}s! Pass Rate: {passed_count}/{total} ({pass_rate}%)")

    # Generate Markdown Report
    timestamp_str = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S UTC")
    report_lines = [
        "# SkyBrief LLM Plain-English Briefing — Evaluation Report",
        "",
        f"**Run Timestamp:** `{timestamp_str}`  ",
        f"**Total Cases Evaluated:** `{total}`  ",
        f"**Passed:** `{passed_count}`  ",
        f"**Failed:** `{failed_count}`  ",
        f"**Pass Rate:** **`{pass_rate}%`**  ",
        f"**Execution Duration:** `{elapsed_time}s`  ",
        "",
        "## Evaluation Criteria",
        "A test case passes if and only if all three strict requirements are satisfied:",
        "1. **Valid JSON Schema**: HTTP response status is `200` and validates cleanly against `BriefingSummaryResponse` and `LLMBriefingOutput` Pydantic models.",
        "2. **Verifier Passed**: Automated numeric verification discovers 0 discrepancies between claimed weather metrics and ground-truth parsed data.",
        "3. **No Forbidden Phrases**: Text contains 0 flight-safety or dispatch clearance phrases (e.g. `'safe to fly'`, `'cleared'`, `'go decision'`).",
        "",
        "## Summary Metrics",
        "| Metric | Value |",
        "|---|---|",
        f"| Total Test Cases | {total} |",
        f"| Successful Passes | {passed_count} |",
        f"| Failures / Violations | {failed_count} |",
        f"| Overall Pass Rate | **{pass_rate}%** |",
        "",
        "## Detailed Per-Case Results",
        "",
        "| Case ID | Type | ICAO | Name | Schema Valid | Verifier | Forbidden Phrases | Overall |",
        "|---|---|---|---|---|---|---|---|",
    ]

    for r in results:
        status_badge = "PASS" if r["passed"] else "FAIL"
        schema_badge = "Yes" if r["is_valid_json_schema"] else "No"
        verifier_badge = "Pass" if r["verifier_passed"] else "Fail"
        forbidden_badge = "None" if not r["forbidden_phrases"] else f"Found ({len(r['forbidden_phrases'])})"
        report_lines.append(
            f"| `{r['id']}` | {r['report_type']} | **{r['icao']}** | {r['name']} | {schema_badge} | {verifier_badge} | {forbidden_badge} | **{status_badge}** |"
        )

    if failed_count > 0:
        report_lines.extend([
            "",
            "## Case Failures and Discrepancy Diagnostics",
            "",
        ])
        for r in results:
            if not r["passed"]:
                report_lines.append(f"### {r['id']} ({r['icao']} {r['report_type']}) - {r['name']}")
                report_lines.append(f"- **HTTP Status Code:** `{r['status_code']}`")
                report_lines.append(f"- **Reasons for Failure:**")
                for reason in r["reasons"]:
                    report_lines.append(f"  - {reason}")
                if r["summary_text"]:
                    report_lines.append(f"- **Generated Summary:** \"{r['summary_text']}\"")
                report_lines.append("")

    report_lines.extend([
        "",
        "## Generated Sample Outputs",
        "",
    ])

    for r in results[:5]:
        report_lines.append(f"#### Case: `{r['id']}` ({r['name']})")
        report_lines.append(f"- **Summary:** \"{r['summary_text']}\"")
        report_lines.append(f"- **Wind Summary:** \"{r['wind_summary']}\"")
        report_lines.append(f"- **Mode / Status:** `{r['status']}`")
        report_lines.append("")

    with open(results_file, "w", encoding="utf-8") as rf:
        rf.write("\n".join(report_lines))

    print(f"Results successfully saved to {results_file}")
    return pass_rate


if __name__ == "__main__":
    run_evaluation()
