def evaluate_route(departure, destination):
    """
    Compare departure and destination weather
    and generate an operational route decision.
    """

    verdict = "GO"
    risk_level = "Low"
    reasons = []

    airports = [
        ("Departure", departure),
        ("Destination", destination),
    ]

    for name, airport in airports:

        visibility = airport.get("visibility_km")
        category = airport.get("flight_category")
        ceiling = airport.get("ceiling_ft")

        if visibility is not None:

            if visibility < 5:
                verdict = "CAUTION"
                risk_level = "Medium"
                reasons.append(
                    f"{name}: Reduced visibility ({visibility} km)"
                )

            if visibility < 1.6:
                verdict = "NO-GO"
                risk_level = "High"
                reasons.append(
                    f"{name}: Critical visibility ({visibility} km)"
                )

        if ceiling is not None:

            if ceiling < 1000:
                verdict = "NO-GO"
                risk_level = "High"
                reasons.append(
                    f"{name}: Ceiling {ceiling} ft"
                )

            elif ceiling < 1500 and verdict != "NO-GO":
                verdict = "CAUTION"
                risk_level = "Medium"
                reasons.append(
                    f"{name}: Low ceiling ({ceiling} ft)"
                )

        if category == "IFR":
            verdict = "NO-GO"
            risk_level = "High"
            reasons.append(
                f"{name}: IFR conditions"
            )

    if not reasons:
        reasons.append("Suitable weather at both airports.")

    return {
        "verdict": verdict,
        "risk_level": risk_level,
        "reasons": reasons
    }