def evaluate_taf(forecast):

    overall_verdict = "GO"
    risk_level = "Low"
    worst_period = None

    summary = []

    for period in forecast["forecast_periods"]:

        verdict = "GO"
        reasons = []

        visibility = period.get("visibility_km")
        weather = (period.get("weather") or "").upper()
        gust = period.get("wind_gust_kt")
        clouds = period.get("clouds") or []

        # -------------------------
        # Visibility
        # -------------------------

        if visibility is not None:

            if visibility < 3:
                verdict = "NO-GO"
                reasons.append(
                    f"Visibility {visibility} km"
                )

            elif visibility < 5:
                verdict = "CAUTION"
                reasons.append(
                    f"Reduced visibility ({visibility} km)"
                )

        # -------------------------
        # Thunderstorm
        # -------------------------

        if "TS" in weather:

            verdict = "NO-GO"

            reasons.append(
                "Thunderstorm forecast"
            )

        # -------------------------
        # Heavy Rain
        # -------------------------

        if "+RA" in weather or "+SHRA" in weather:

            verdict = "NO-GO"

            reasons.append(
                "Heavy precipitation"
            )

        # -------------------------
        # Gusts
        # -------------------------

        if gust and gust > 25:

            if verdict != "NO-GO":
                verdict = "CAUTION"

            reasons.append(
                f"Gusts {gust} kt"
            )

        # -------------------------
        # CB / TCU
        # -------------------------

        for cloud in clouds:

            if "CB" in cloud:

                if verdict != "NO-GO":
                    verdict = "CAUTION"

                reasons.append(
                    "Cumulonimbus forecast"
                )

            if "TCU" in cloud:

                if verdict != "NO-GO":
                    verdict = "CAUTION"

                reasons.append(
                    "Towering cumulus"
                )

        # -------------------------
        # Overall Decision
        # -------------------------

        if verdict == "NO-GO":

            overall_verdict = "NO-GO"
            risk_level = "High"
            worst_period = period["type"]

        elif verdict == "CAUTION" and overall_verdict == "GO":

            overall_verdict = "CAUTION"
            risk_level = "Medium"

            if worst_period is None:
                worst_period = period["type"]

        summary.append({

            "type": period["type"],

            "from": period["from"],

            "to": period["to"],

            "verdict": verdict,

            "reasons": reasons

        })

    return {

        "overall_verdict": overall_verdict,

        "risk_level": risk_level,

        "worst_period": worst_period,

        "forecast_summary": summary

    }