# SkyBrief: LLM-Powered Plain-English Aviation Weather Briefing

## System Architecture & Technical Design Document

---

## 1. Executive Summary & Objective

**SkyBrief** is an aviation weather analysis platform providing pilots, flight instructors, and aviation students with real-time decoded weather data. While raw METAR and TAF reports are concise and standardized, interpreting dense strings under pre-flight time pressure can lead to cognitive overload and misinterpretation.

The **LLM Plain-English Briefing** module translates already-parsed meteorological data into a plain-English briefing without compromising flight safety.

### Core Architectural Principle
> **The LLM is strictly an explanatory engine, NEVER a parser or computational engine.**  
> Ground-truth meteorological parameters (wind vectors, cloud ceilings, visibility minima, temperatures) are determined entirely by deterministic Python services (`parser.py`, `taf_parser.py`, `vfr_logic.py`). The LLM only receives structured data and is never permitted to calculate values, decode raw tokens, or render go/no-go flight safety decisions.

---

## 2. System Architecture & Flow

```
┌────────────────────────────────────────────────────────┐
│                   React + Vite UI                      │
│        (PlainEnglishBriefing.jsx & Badges)             │
└───────────────────────────┬────────────────────────────┘
                            │ POST /api/briefing/summary
                            │ { icao: "KJFK", report_type: "METAR" }
                            ▼
┌────────────────────────────────────────────────────────┐
│                   FastAPI Backend                      │
│            (routers/briefing_summary.py)               │
│             Rate Limiting via SlowAPI                  │
└─────────────┬────────────────────────────┬─────────────┘
              │ 1. Fetch & Parse           │
              ▼                            │
┌───────────────────────────┐              │
│ Deterministic Weather Svc │              │
│ (awc.py, parser.py,       │              │
│  taf.py, taf_parser.py)   │              │
└─────────────┬─────────────┘              │
              │ Structured Weather Dict    │
              ▼                            │
┌──────────────────────────────────────────┴─────────────┐
│                 LLM Briefing Service                   │
│             (services/llm_briefing.py)                 │
│  - Gemini API (google-genai SDK)                       │
│  - Structured Output Schema Enforcement                │
│  - <untrusted_remarks> Injection Defense               │
│  - 10s Timeout + 1 Automatic Retry + Safe Fallback     │
└─────────────────────────────┬──────────────────────────┘
                              │ LLMBriefingOutput JSON
                              ▼
┌────────────────────────────────────────────────────────┐
│              Deterministic Verification Layer          │
│                 (services/verifier.py)                 │
│  - Extracts claimed numbers (wind, vis, ceil, temp)    │
│  - Cross-references against parsed ground-truth dict   │
│  - Scans for forbidden phrases ("safe to fly", etc.)   │
└─────────────────────────────┬──────────────────────────┘
                              │ VerificationResult { passed, mismatches }
                              ▼
┌────────────────────────────────────────────────────────┐
│                   Frontend Rendering                   │
│  - "AI-generated · Verify against official data" pill  │
│  - Verification Status Badge (Passed vs Discrepancies) │
│  - Plain-English breakdown cards (Wind, Vis, Ceiling)  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Design

### 3.1 Backend Endpoint (`POST /api/briefing/summary`)
- **Route**: Mounted under `/api/briefing/summary`.
- **Validation**:
  - `icao`: Strictly validated against `^[A-Za-z]{4}$`.
  - `report_type`: Validated against `Literal["METAR", "TAF"]`.
- **Reusability**: Directly reuses `get_metar()`, `parse_metar()`, `get_taf()`, and `parse_taf()` from `services/`.
- **Security & Rate Limiting**: Protected by `slowapi` at 30 requests/minute per client IP to prevent quota depletion and denial-of-service.

### 3.2 LLM Service (`services/llm_briefing.py`)
- **Model**: Configured via `GEMINI_MODEL` (default: `gemini-2.5-flash`), with authentication via `GEMINI_API_KEY`. Keys are never hardcoded and never logged.
- **Resilience**:
  - Configured with a 12-second timeout.
  - Automatic single retry on network timeouts, transient 429/503 errors, or schema validation errors.
  - Non-blocking fallback: If the API key is not configured or the service is unreachable, returns a structured fallback payload directing the pilot to the official parsed table. The core application never crashes.

### 3.3 Prompt Engineering & Few-Shot Design
The LLM is governed by system instructions and 3 curated few-shot examples:
1. **Normal Weather (KJFK)**: Demonstrates concise synthesis of standard VFR parameters.
2. **Gusting Winds & Overcast (KORD)**: Demonstrates handling of gust deltas and ceiling classifications.
3. **Missing Visibility / Sensor Failure (EGLL)**: Demonstrates handling missing fields by reporting "unknown" rather than fabricating data.

#### Anti-Prompt Injection Defense
Remarks in aviation weather (the `RMK` block) often contain unformatted text from automated systems, human observers, or sensor maintenance notes. If an attacker inputs an arbitrary ICAO or tampers with remarks, malicious instructions could attempt to subvert the LLM.
- **Defense**: Any text following `RMK` is wrapped inside `<untrusted_remarks>...</untrusted_remarks>` XML tags. The system prompt explicitly instructs the LLM that text within these tags is untrusted external data and must never be interpreted as operational instructions.

### 3.4 Verification Layer (`services/verifier.py`)
To prevent hallucinations from reaching the pilot unnoticed, every generated briefing is evaluated by a deterministic verification engine before transmission:
1. **Numeric Claim Extraction**:
   - Wind direction (`\b(?:from|direction)\s+(\d{3})(?:°|\s*degrees?)?\b`)
   - Wind speed (`\b(\d{1,3})\s*(?:kt|kts|knots?)\b`)
   - Wind gusts (`\b(?:gusts?(?:\s+up)?\s+to|gusting\s+(?:up\s+to|at|to)|gusts?\s+of)\s+(\d{1,3})\s*(?:kt|kts|knots?)\b`)
   - Visibility in kilometers / statute miles
   - Cloud ceiling / base in feet (`\b(\d{1,2}),?(\d{3})\s*(?:ft|feet)\b`)
   - Temperatures and dewpoints in Celsius
2. **Ground-Truth Cross-Referencing**:
   - Compares extracted numbers against the valid values in `parsed_data`.
   - If the LLM claims a gust of 25 kt when the METAR reported no gusts, a mismatch is flagged.
   - If the LLM claims visibility of 10 km when visibility was omitted/sensor inoperative, a mismatch is flagged.
3. **Forbidden Phrase Scanner**:
   - Scans for regulatory and flight safety claims: `"safe to fly"`, `"unsafe to fly"`, `"cleared to fly"`, `"cleared for takeoff"`, `"flight is safe"`, `"go decision"`, etc.
   - Any match fails the verification check.

### 3.5 Frontend Integration (`PlainEnglishBriefing.jsx`)
- Matches SkyBrief's aviation console dark UI (`bg-slate-900`, `border-slate-700`, `text-sky-400`).
- Prominently displays an **"AI-generated · Verify against official data"** badge.
- Displays a real-time verification pill:
  - Green (`Verified against parsed data`) when all claims match.
  - Red / Amber (`Mismatches Found (N)`) with an interactive collapsible inspector detailing exact discrepancies if any occur.

---

## 4. Evaluation Suite (`eval/cases.json` & `eval/run_eval.py`)

The evaluation testbed comprises 20 edge-case aviation weather reports:
1. `CASE_01_CAVOK`: Ceiling and visibility OK (unlimited).
2. `CASE_02_MISSING_VISIBILITY`: Sensor inoperative (`VISNO`).
3. `CASE_03_VRB_WIND`: Light and variable wind vector.
4. `CASE_04_GUSTS`: Strong crosswind with 35 kt gusts.
5. `CASE_05_TEMPO_GROUPS`: TAF temporary thunderstorm group.
6. `CASE_06_BECMG_GROUPS`: TAF gradual frontal change group.
7. `CASE_07_NSC`: Nil significant cloud report.
8. `CASE_08_MULTI_PERIOD_TAF`: 4-period diurnal forecast progression.
9. `CASE_09_INJECTION_REMARKS`: Adversarial prompt-injection attempt inside `RMK`.
10. `CASE_10_CALM_WINDS`: Zero knot wind condition (`00000KT`).
11. `CASE_11_LOW_IFR_FOG`: 200 ft vertical visibility and dense fog.
12. `CASE_12_SUBZERO_FREEZING_PRECIP`: Subzero temperatures with freezing drizzle.
13. `CASE_13_SEVERE_CONVECTIVE_TS`: Severe thunderstorms with 50 kt squall gusts.
14. `CASE_14_MARGINAL_VFR`: Reduced haze visibility and low broken ceiling.
15. `CASE_15_MOUNTAIN_HIGH_ELEVATION`: High elevation airport (7,820 ft).
16. `CASE_16_DIRECTION_VARIABLE_LIMITS`: Variable wind direction (`080V160`).
17. `CASE_17_TAF_PROBABILITY_GROUP`: Probability group (`PROB30 TEMPO`).
18. `CASE_18_MISSING_TEMP_DEWP`: Inoperative temperature sensor (`/////`).
19. `CASE_19_SHIFTING_FRONTAL_WINDS`: Frontal wind shift (`FROPA`).
20. `CASE_20_UNUSUAL_SENSOR_REMARK`: Sensor frost accumulation note.

---

## 5. Assumptions, Limitations & Failure Modes

### Assumptions
- **Pre-parsed Reliability**: The underlying deterministic parsers (`parser.py`, `taf_parser.py`) accurately map standard ICAO/WMO codes to SI or standard aviation units (km, ft, kt, °C).
- **Advisory Role**: The briefing is strictly supplementary. Operational decisions must be based on approved FAA/EASA certified flight planning tools and official flight service station briefings.

### Known Limitations & Failure Modes
1. **Subjective Qualitative Language**: While numeric claims are verified, qualitative adjectives (e.g., describing 14 kt as "brisk" vs "moderate") are subjective and cannot be strictly verified by regex.
2. **Compound Multi-Day TAF Horizons**: For long-duration 30-hour TAFs with many BECMG/TEMPO groups, LLMs may over-summarize intermediate periods. The UI addresses this by keeping the full parsed timeline visible directly below.
3. **API Rate Quotas & Outages**: External Gemini API service disruptions are mitigated by the deterministic fallback mode, ensuring zero downtime for the main application.
