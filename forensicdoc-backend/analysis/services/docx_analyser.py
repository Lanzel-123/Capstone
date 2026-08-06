from docx import Document as DocxDocument
from zipfile import ZipFile
from pathlib import Path
import re


def analyse_docx(file_path: str) -> list[dict]:
    """Detect structural and revision-related anomalies in DOCX files."""
    findings = []

    try:
        # 1. Basic document properties
        doc = DocxDocument(file_path)
        core_props = doc.core_properties

        if core_props.modified and core_props.created:
            if core_props.modified < core_props.created:
                findings.append({
                    "category": "metadata",
                    "title": "DOCX chronological anomaly",
                    "description": f"Modified date ({core_props.modified}) is earlier than created date ({core_props.created}).",
                    "severity": "HIGH",
                    "details": {
                        "created": str(core_props.created),
                        "modified": str(core_props.modified),
                    },
                })

        # 2. Check for tracked changes / revisions by inspecting the ZIP package
        with ZipFile(file_path, "r") as z:
            namelist = z.namelist()

            # Tracked changes live in word/document.xml and sometimes word/comments*.xml
            if "word/document.xml" in namelist:
                content = z.read("word/document.xml").decode("utf-8", errors="ignore")

                # Look for w:ins, w:del, w:rPrChange etc.
                if re.search(r"w:(ins|del|rPrChange|pPrChange|sectPrChange)", content):
                    findings.append({
                        "category": "structural",
                        "title": "Tracked changes / revisions detected",
                        "description": "The document contains tracked changes or revision marks. These may have been hidden or partially cleaned.",
                        "severity": "MEDIUM",
                        "details": {},
                    })

            # 3. Unusual relationship files or embedded objects
            rels = [n for n in namelist if n.endswith(".rels")]
            if len(rels) > 15:  # arbitrary but useful heuristic
                findings.append({
                    "category": "structural",
                    "title": "Unusually high number of relationship files",
                    "description": f"Found {len(rels)} .rels files. This can indicate complex embedded objects or manipulation.",
                    "severity": "LOW",
                    "details": {"rels_count": len(rels)},
                })

    except Exception as e:
        findings.append({
            "category": "structural",
            "title": "DOCX parsing failed",
            "description": f"Could not fully parse DOCX: {str(e)}",
            "severity": "HIGH",
            "details": {"error": str(e)},
        })

    return findings
