import subprocess
import json
from pathlib import Path


def extract_metadata(file_path: str) -> dict:
    """Extract metadata using ExifTool. Returns a dict of tags."""
    try:
        result = subprocess.run(
            ["exiftool", "-json", "-G", str(file_path)],
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode != 0:
            return {"error": result.stderr.strip() or "ExifTool failed"}

        data = json.loads(result.stdout)
        return data[0] if data else {}
    except Exception as e:
        return {"error": str(e)}


def check_chronological_anomalies(metadata: dict) -> list[dict]:
    """Basic timestomping / chronological consistency checks."""
    findings = []

    # Common date fields (ExifTool group prefixes vary)
    created = None
    modified = None

    for key, value in metadata.items():
        key_lower = key.lower()
        if "createdate" in key_lower or "create date" in key_lower or "dcterms:created" in key_lower:
            created = value
        if "modifydate" in key_lower or "modify date" in key_lower or "dcterms:modified" in key_lower:
            modified = value

    if created and modified:
        # Very simple string comparison – real systems parse dates properly
        if str(modified) < str(created):
            findings.append({
                "category": "metadata",
                "title": "Chronological anomaly detected",
                "description": f"Modification date ({modified}) is earlier than creation date ({created}). Possible timestomping.",
                "severity": "HIGH",
                "details": {"created": created, "modified": modified},
            })

    # Missing important metadata can also be suspicious
    if not created and not modified:
        findings.append({
            "category": "metadata",
            "title": "Missing creation/modification timestamps",
            "description": "No clear creation or modification timestamps found in metadata.",
            "severity": "MEDIUM",
            "details": {},
        })

    return findings
