import pytest
from schemas.briefing import LLMBriefingOutput
from services.verifier import verify_briefing, check_forbidden_phrases, verify_numeric_claims


def test_forbidden_phrases_detection():
    text_safe = "Conditions are VFR with clear skies and calm winds."
    assert check_forbidden_phrases(text_safe) == []

    text_violation_1 = "The weather is calm and it is safe to fly today."
    violations_1 = check_forbidden_phrases(text_violation_1)
    assert any("safe to fly" in v for v in violations_1)

    text_violation_2 = "Aircraft is cleared for takeoff on runway 27."
    violations_2 = check_forbidden_phrases(text_violation_2)
    assert any("cleared for takeoff" in v for v in violations_2)

    text_violation_3 = "Pilot decision: GO based on current observations."
    violations_3 = check_forbidden_phrases(text_violation_3)
    assert any("decision: go" in v for v in violations_3)


def test_verifier_passes_on_accurate_briefing():
    parsed_metar = {
        "wind_dir_deg": 270,
        "wind_speed_kt": 15,
        "wind_gust_kt": 25,
        "visibility_km": 10.0,
        "ceiling_ft": 2500,
        "temperature_c": 18,
        "dewpoint_c": 12,
        "cloud_layers": ["BKN025"],
    }

    output = LLMBriefingOutput(
        summary="Winds are from 270° at 15 kt gusting to 25 kt with visibility of 10 km and a ceiling of 2500 ft.",
        wind_summary="From 270° at 15 kt with gusts to 25 kt.",
        visibility_category="Good",
        ceiling_category="Marginal",
        hazards=["Gusty winds"],
        data_gaps=[]
    )

    result = verify_briefing(output, parsed_metar, report_type="METAR")
    assert result.passed is True
    assert result.mismatches == []


def test_verifier_flags_wrong_wind_speed():
    parsed_metar = {
        "wind_dir_deg": 270,
        "wind_speed_kt": 15,
        "visibility_km": 10.0,
        "ceiling_ft": 3000,
        "cloud_layers": ["BKN030"],
    }

    # Output claims 35 kt instead of 15 kt
    output = LLMBriefingOutput(
        summary="Winds from 270° at 35 kt.",
        wind_summary="From 270° at 35 kt.",
        visibility_category="Good",
        ceiling_category="Clear",
        hazards=["High wind"],
        data_gaps=[]
    )

    result = verify_briefing(output, parsed_metar, report_type="METAR")
    assert result.passed is False
    assert any("Claimed wind speed of 35 kt does not match" in m for m in result.mismatches)


def test_verifier_flags_hallucinated_gust():
    parsed_metar = {
        "wind_dir_deg": 90,
        "wind_speed_kt": 8,
        "wind_gust_kt": None,
        "visibility_km": 10.0,
    }

    output = LLMBriefingOutput(
        summary="Winds at 8 kt gusting to 20 kt.",
        wind_summary="8 kt with gusts to 20 kt.",
        visibility_category="Good",
        ceiling_category="Clear",
        hazards=[],
        data_gaps=[]
    )

    result = verify_briefing(output, parsed_metar, report_type="METAR")
    assert result.passed is False
    assert any("Claimed wind gust of 20 kt, but no gusts were reported" in m for m in result.mismatches)


def test_verifier_flags_missing_visibility_claim():
    parsed_metar = {
        "wind_dir_deg": 180,
        "wind_speed_kt": 5,
        "visibility_km": None,
    }

    output = LLMBriefingOutput(
        summary="Visibility is reported at 8 km.",
        wind_summary="180 at 5 kt",
        visibility_category="Unknown",
        ceiling_category="Unknown",
        hazards=[],
        data_gaps=["Visibility"]
    )

    result = verify_briefing(output, parsed_metar, report_type="METAR")
    assert result.passed is False
    assert any("Claimed visibility 8.0 km, but visibility was not reported" in m for m in result.mismatches)


def test_verifier_flags_forbidden_phrase_in_summary():
    parsed_metar = {
        "wind_dir_deg": 180,
        "wind_speed_kt": 5,
        "visibility_km": 10.0,
    }

    output = LLMBriefingOutput(
        summary="Conditions are calm and safe to fly for all general aviation.",
        wind_summary="Winds from 180° at 5 kt",
        visibility_category="Good",
        ceiling_category="Clear",
        hazards=[],
        data_gaps=[]
    )

    result = verify_briefing(output, parsed_metar, report_type="METAR")
    assert result.passed is False
    assert any("safe to fly" in m for m in result.mismatches)
