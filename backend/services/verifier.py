"""
Verification layer for LLM-generated plain-English weather briefings.
Validates that numeric claims match parsed weather data and flags forbidden phrases.
"""

import re
from typing import List, Dict, Any, Tuple, Set, Optional
from schemas.briefing import LLMBriefingOutput, VerificationResult

# Forbidden phrases that make flight-safety, go/no-go, or clearance claims
FORBIDDEN_PHRASES = [
    "safe to fly",
    "unsafe to fly",
    "safe for flight",
    "cleared to fly",
    "cleared for takeoff",
    "cleared for departure",
    "cleared for approach",
    "cleared to land",
    "cleared flight",
    "go for flight",
    "flight is safe",
    "flight is unsafe",
    "flight is permitted",
    "flight permitted",
    "approved for flight",
    "recommend go",
    "recommend no-go",
    "decision: go",
    "decision: no-go",
    "go decision",
    "no-go decision",
]


def check_forbidden_phrases(text: str) -> List[str]:
    """Scan text for forbidden safety/decision phrases."""
    violations = []
    text_lower = text.lower()
    for phrase in FORBIDDEN_PHRASES:
        if phrase in text_lower:
            violations.append(f"Forbidden phrase detected: '{phrase}'")
    return violations


def _extract_all_text(output: LLMBriefingOutput) -> str:
    """Concatenate all fields of LLMBriefingOutput for inspection."""
    parts = [
        output.summary,
        output.wind_summary,
        output.visibility_category,
        output.ceiling_category,
    ]
    parts.extend(output.hazards or [])
    parts.extend(output.data_gaps or [])
    return " ".join(parts)


def _get_valid_numeric_context(parsed_data: Dict[str, Any], report_type: str = "METAR") -> Dict[str, Any]:
    """Extract valid numeric reference values from parsed weather data."""
    context: Dict[str, Any] = {
        "wind_dirs": set(),
        "wind_speeds": set(),
        "wind_gusts": set(),
        "visibilities_km": set(),
        "ceilings_ft": set(),
        "temps_c": set(),
        "dewpoints_c": set(),
        "pressures_hpa": set(),
        "cloud_bases_ft": set(),
    }

    if report_type.upper() == "METAR":
        wdir = parsed_data.get("wind_dir_deg")
        if wdir is not None and str(wdir).isdigit():
            context["wind_dirs"].add(int(wdir))

        wspd = parsed_data.get("wind_speed_kt")
        if wspd is not None:
            try:
                context["wind_speeds"].add(float(wspd))
            except (ValueError, TypeError):
                pass

        wgst = parsed_data.get("wind_gust_kt")
        if wgst is not None:
            try:
                context["wind_gusts"].add(float(wgst))
            except (ValueError, TypeError):
                pass

        vis = parsed_data.get("visibility_km")
        if vis is not None:
            try:
                context["visibilities_km"].add(round(float(vis), 1))
            except (ValueError, TypeError):
                pass

        ceil = parsed_data.get("ceiling_ft")
        if ceil is not None:
            try:
                context["ceilings_ft"].add(int(ceil))
            except (ValueError, TypeError):
                pass

        temp = parsed_data.get("temperature_c")
        if temp is not None:
            try:
                context["temps_c"].add(float(temp))
            except (ValueError, TypeError):
                pass

        dewp = parsed_data.get("dewpoint_c")
        if dewp is not None:
            try:
                context["dewpoints_c"].add(float(dewp))
            except (ValueError, TypeError):
                pass

        altim = parsed_data.get("pressure_hpa")
        if altim is not None:
            try:
                context["pressures_hpa"].add(float(altim))
            except (ValueError, TypeError):
                pass

        for c in parsed_data.get("cloud_layers", []):
            m = re.search(r"\d{3}", str(c))
            if m:
                # E.g. FEW030 -> base in hundreds of feet = 3000 ft
                context["cloud_bases_ft"].add(int(m.group(0)) * 100)

    elif report_type.upper() == "TAF":
        for period in parsed_data.get("forecast_periods", []):
            wdir = period.get("wind_dir_deg")
            if wdir is not None and str(wdir).isdigit():
                context["wind_dirs"].add(int(wdir))

            wspd = period.get("wind_speed_kt")
            if wspd is not None:
                try:
                    context["wind_speeds"].add(float(wspd))
                except (ValueError, TypeError):
                    pass

            wgst = period.get("wind_gust_kt")
            if wgst is not None:
                try:
                    context["wind_gusts"].add(float(wgst))
                except (ValueError, TypeError):
                    pass

            vis = period.get("visibility_km")
            if vis is not None:
                try:
                    context["visibilities_km"].add(round(float(vis), 1))
                except (ValueError, TypeError):
                    pass

            for c in period.get("clouds", []):
                m = re.search(r"\d{3}", str(c))
                if m:
                    base_ft = int(m.group(0)) * 100
                    context["cloud_bases_ft"].add(base_ft)
                    if str(c).startswith(("BKN", "OVC")):
                        context["ceilings_ft"].add(base_ft)

    return context


def verify_numeric_claims(text: str, parsed_data: Dict[str, Any], report_type: str = "METAR") -> List[str]:
    """
    Extract specific numeric claims (wind direction, speed, gust, temperature,
    visibility, ceiling) from LLM text and verify against ground truth parsed fields.
    """
    mismatches: List[str] = []
    context = _get_valid_numeric_context(parsed_data, report_type)

    # 1. Wind Gust Claims
    # Matches: "gusts to 25 kt", "gusting up to 25 knots", "gusts of 30kt"
    gust_patterns = [
        re.compile(r"\b(?:gusts?(?:\s+up)?\s+to|gusting\s+(?:up\s+to|at|to)|gusts?\s+of)\s+(\d{1,3})\s*(?:kt|kts|knots?)\b", re.IGNORECASE),
        re.compile(r"\b(\d{1,3})\s*(?:kt|kts|knots?)\s*gusts?\b", re.IGNORECASE),
    ]
    gust_spans: List[Tuple[int, int]] = []
    found_gusts = set()
    for pattern in gust_patterns:
        for match in pattern.finditer(text):
            found_gusts.add(float(match.group(1)))
            gust_spans.append((match.start(), match.end()))

    for gust_val in found_gusts:
        if not context["wind_gusts"]:
            mismatches.append(f"Claimed wind gust of {int(gust_val)} kt, but no gusts were reported in parsed data.")
        elif gust_val not in context["wind_gusts"]:
            expected = ", ".join(f"{int(g)} kt" for g in context["wind_gusts"])
            mismatches.append(f"Claimed wind gust of {int(gust_val)} kt does not match parsed data ({expected}).")

    # 2. Wind Speed Claims (excluding gusts)
    # Matches: "wind at 12 knots", "winds 15 kt", "10 kt", "10 knots"
    speed_pattern = re.compile(r"\b(\d{1,3})\s*(?:kt|kts|knots?)\b", re.IGNORECASE)
    for match in speed_pattern.finditer(text):
        m_start, m_end = match.start(), match.end()
        # Check if this occurrence was part of a gust match or preceded by 'gust'
        is_in_gust = any(g_start <= m_start and m_end <= g_end for g_start, g_end in gust_spans)
        preceding = text[max(0, m_start - 20):m_start].lower()
        if is_in_gust or "gust" in preceding:
            continue

        val = float(match.group(1))
        if not context["wind_speeds"]:
            mismatches.append(f"Claimed wind speed of {int(val)} kt, but wind speed was not reported in parsed data.")
        elif val not in context["wind_speeds"]:
            expected = ", ".join(f"{int(s)} kt" for s in context["wind_speeds"])
            mismatches.append(f"Claimed wind speed of {int(val)} kt does not match parsed data ({expected}).")

    # 3. Wind Direction Claims
    # Matches: "from 240 degrees", "240°", "from 180° at", "winds from 320"
    dir_patterns = [
        re.compile(r"\b(?:from|direction)\s+(\d{3})(?:°|\s*degrees?)?\b", re.IGNORECASE),
        re.compile(r"\b(\d{3})°(?:\s+at|\s*,|\b)", re.IGNORECASE),
    ]
    for pattern in dir_patterns:
        for match in pattern.finditer(text):
            val = int(match.group(1))
            # Directions must be valid headings 000-360
            if 0 <= val <= 360:
                if not context["wind_dirs"]:
                    mismatches.append(f"Claimed wind direction {val:03d}°, but wind direction is VRB/unspecified in parsed data.")
                elif val not in context["wind_dirs"]:
                    expected = ", ".join(f"{d:03d}°" for d in context["wind_dirs"])
                    mismatches.append(f"Claimed wind direction {val:03d}° does not match parsed data ({expected}).")

    # 4. Temperature Claims
    # Matches: "15°C", "15 °C", "15 degrees Celsius", "-3°C"
    temp_pattern = re.compile(r"(-?\d{1,2})\s*(?:°\s*C\b|degrees?\s*celsius\b)", re.IGNORECASE)
    for match in temp_pattern.finditer(text):
        val = float(match.group(1))
        all_temps = context["temps_c"].union(context["dewpoints_c"])
        if not all_temps:
            mismatches.append(f"Claimed temperature {int(val)}°C, but temperature was not reported in parsed data.")
        elif val not in all_temps:
            expected = ", ".join(f"{int(t)}°C" for t in context["temps_c"])
            mismatches.append(f"Claimed temperature {int(val)}°C does not match parsed temperature ({expected}).")

    # 5. Visibility Claims (km)
    # Matches: "6 km", "10 kilometers", "9.5 km", "visibility of 8km"
    vis_km_pattern = re.compile(r"\b(\d+(?:\.\d+)?)\s*(?:km|kilometers?|kilometres?)\b", re.IGNORECASE)
    for match in vis_km_pattern.finditer(text):
        val = float(match.group(1))
        if not context["visibilities_km"]:
            mismatches.append(f"Claimed visibility {val} km, but visibility was not reported in parsed data.")
        else:
            # Allow tolerance of +/- 0.5 km due to unit conversions
            matched = any(abs(val - v) <= 0.5 for v in context["visibilities_km"])
            if not matched:
                expected = ", ".join(f"{v} km" for v in context["visibilities_km"])
                mismatches.append(f"Claimed visibility {val} km does not match parsed visibility ({expected}).")

    # 6. Ceiling / Cloud Base Claims (ft)
    # Matches: "ceiling at 2500 feet", "2,500 ft", "3000 ft", "broken clouds at 1500 feet"
    alt_pattern = re.compile(r"\b(\d{1,2}),?(\d{3})\s*(?:ft|feet)\b", re.IGNORECASE)
    all_altitudes = context["ceilings_ft"].union(context["cloud_bases_ft"])
    for match in alt_pattern.finditer(text):
        val = int(match.group(1) + match.group(2))
        # Ignore common non-cloud numbers if any (e.g. 10,000 ft standard pressure altitude context if any)
        if all_altitudes and val not in all_altitudes:
            expected = ", ".join(f"{a} ft" for a in sorted(all_altitudes))
            mismatches.append(f"Claimed altitude/ceiling {val} ft does not match reported cloud bases/ceiling ({expected}).")
        elif not all_altitudes:
            mismatches.append(f"Claimed cloud base/ceiling of {val} ft, but no cloud ceiling was reported in parsed data.")

    return mismatches


def verify_briefing(
    output: LLMBriefingOutput,
    parsed_data: Dict[str, Any],
    report_type: str = "METAR"
) -> VerificationResult:
    """
    Comprehensive verification combining forbidden phrase detection
    and numeric claims verification.
    """
    full_text = _extract_all_text(output)

    # 1. Check for forbidden phrases
    forbidden_violations = check_forbidden_phrases(full_text)

    # 2. Check numeric fidelity against ground-truth parsed data
    numeric_mismatches = verify_numeric_claims(full_text, parsed_data, report_type)

    all_mismatches = forbidden_violations + numeric_mismatches
    passed = len(all_mismatches) == 0

    return VerificationResult(
        passed=passed,
        mismatches=all_mismatches
    )
