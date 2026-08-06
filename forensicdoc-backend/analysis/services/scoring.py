def calculate_verdict_and_score(findings: list[dict]) -> tuple[str, float]:
    """
    Deterministic scoring.
    Returns (verdict, risk_score 0-100)
    """
    if not findings:
        return "AUTHENTIC", 5.0

    severity_weights = {
        "LOW": 10,
        "MEDIUM": 25,
        "HIGH": 45,
        "CRITICAL": 70,
    }

    score = 0.0
    for f in findings:
        score += severity_weights.get(f.get("severity", "LOW"), 10)

    # Cap at 100
    score = min(score, 100.0)

    if score >= 70:
        verdict = "TAMPERED"
    elif score >= 35:
        verdict = "SUSPICIOUS"
    elif score >= 15:
        verdict = "SUSPICIOUS"
    else:
        verdict = "AUTHENTIC"

    return verdict, score
