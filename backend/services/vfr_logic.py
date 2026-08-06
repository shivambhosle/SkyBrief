def evaluate_vfr(parsed):
    verdict = "GO"
    risk_level = "Low"
    reasons = []
    recommendation = "Weather suitable for normal VFR operations."

    visibility = parsed.get("visibility_km")
    ceiling = parsed.get("ceiling_ft")
    category = parsed.get("flight_category")

    if visibility is not None:

        if visibility < 5:
            verdict = "CAUTION"
            risk_level = "Medium"
            reasons.append(
                f"Visibility reduced ({visibility} km)"
            )
            recommendation = (
                "Exercise caution. Consider delaying VFR departure."
            )

        if visibility < 1.6:
            verdict = "NO-GO"
            risk_level = "High"
            reasons.append(
                f"Visibility critically low ({visibility} km)"
            )
            recommendation = (
                "VFR operations not recommended."
            )

    if ceiling is not None:

        if ceiling < 1000:
            verdict = "NO-GO"
            risk_level = "High"
            reasons.append(
                f"Low cloud ceiling ({ceiling} ft)"
            )
            recommendation = (
                "Delay departure or fly IFR if qualified."
            )

        elif ceiling < 1500 and verdict != "NO-GO":
            verdict = "CAUTION"
            risk_level = "Medium"
            reasons.append(
                f"Marginal ceiling ({ceiling} ft)"
            )
            recommendation = (
                "Monitor conditions carefully."
            )

    if category == "IFR" and verdict != "NO-GO":
        verdict = "CAUTION"
        risk_level = "Medium"

        if "IFR conditions" not in reasons:
            reasons.append("IFR flight category")

    return {
        "verdict": verdict,
        "risk_level": risk_level,
        "reasons": reasons,
        "recommendation": recommendation
    }