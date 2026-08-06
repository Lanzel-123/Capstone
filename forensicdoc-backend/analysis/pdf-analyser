from pypdf import PdfReader
from pathlib import Path


def analyse_pdf(file_path: str) -> list[dict]:
    """Detect common PDF structural anomalies relevant to tampering."""
    findings = []

    try:
        reader = PdfReader(file_path)
        trailer = reader.trailer
        root = trailer.get("/Root", {})

        # 1. Multiple revisions / incremental updates
        # pypdf exposes the number of revisions indirectly via xmp or by checking history
        if hasattr(reader, "xmp_metadata") and reader.xmp_metadata:
            # Just a placeholder signal – real incremental detection is more involved
            pass

        # 2. Check for JavaScript (often used in malicious docs)
        if "/JavaScript" in str(root) or "/JS" in str(root):
            findings.append({
                "category": "structural",
                "title": "Embedded JavaScript detected",
                "description": "The PDF contains JavaScript. This can be legitimate but is also commonly used in malicious or altered documents.",
                "severity": "MEDIUM",
                "details": {},
            })

        # 3. Check for embedded files
        if "/Names" in root and "/EmbeddedFiles" in str(root.get("/Names", {})):
            findings.append({
                "category": "structural",
                "title": "Embedded files present",
                "description": "The PDF contains embedded files. This may indicate hidden content.",
                "severity": "MEDIUM",
                "details": {},
            })

        # 4. Very basic trailer / ID check
        if "/ID" not in trailer:
            findings.append({
                "category": "structural",
                "title": "Missing document ID in trailer",
                "description": "PDF trailer does not contain an /ID entry. This can occur after certain editing tools rewrite the file.",
                "severity": "LOW",
                "details": {},
            })

        # 5. Encryption / permissions anomalies can be added later

    except Exception as e:
        findings.append({
            "category": "structural",
            "title": "PDF parsing failed",
            "description": f"Could not fully parse PDF structure: {str(e)}",
            "severity": "HIGH",
            "details": {"error": str(e)},
        })

    return findings
