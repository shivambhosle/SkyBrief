def evaluate_vfr(parsed):
    verdict = "GO"
    reasons = []

    visibility = parsed.get("visibility_km")
    ceiling = parsed.get("ceiling_ft")

    if visibility is not None:

        if visibility < 5:
            verdict = "CAUTION"
            reasons.append(
                f"Visibility {visibility} km below VFR minimum"
            )

        if visibility < 1.6:
            verdict = "NO-GO"
            reasons.append(
                f"Visibility critically low ({visibility} km)"
            )

    if ceiling is not None:

        if ceiling < 1000:
            verdict = "NO-GO"
            reasons.append(
                f"Ceiling {ceiling} ft"
            )

        elif ceiling < 1500:
            verdict = "CAUTION"
            reasons.append(
                f"Low ceiling {ceiling} ft"
            )

    return {
        "verdict": verdict,
        "reasons": reasons
    }