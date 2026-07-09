import sys
import os
import hashlib
import zipfile
import re
import xml.etree.ElementTree as ET
from datetime import datetime
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QPushButton, QFileDialog, QLabel, 
                             QTextEdit, QTableWidget, QTableWidgetItem, QHeaderView, QGroupBox)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont, QColor
import pypdf
import numpy as np


# AI/ML module (offline placeholder classifier)
try:
    from ml_tamper_model import predict_risk
except Exception:
    predict_risk = None


class ForensicEngine:
    """Core Analytics Engine implementing deterministic forensic checks."""
    
    @staticmethod
    def calculate_sha256(file_path):
        """Generates an immutable digital fingerprint (SHA-256)."""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    @classmethod
    def analyze_pdf(cls, file_path):
        """Applies rule-based parsing to isolate PDF structural anomalies."""
        anomalies = []
        findings = {}
        
        try:
            # 1. Basic Metadata Extraction
            with open(file_path, 'rb') as f:
                reader = pypdf.PdfReader(f)
                metadata = reader.metadata
                findings['Author'] = metadata.get('/Author', 'Unknown')
                findings['Creator'] = metadata.get('/Creator', 'Unknown')
                findings['Producer'] = metadata.get('/Producer', 'Unknown')
                
            # 2. Structural Alterations Check: PDF Incremental Updates / Trailer Anomalies
            with open(file_path, 'rb') as f:
                content = f.read()
                # Counts how many times the end-of-file trailer appears
                eof_count = len(re.findall(b'%%EOF', content))
                findings['Incremental Updates Count'] = eof_count - 1
                if eof_count > 1:
                    anomalies.append(f"CRITICAL: PDF contains {eof_count-1} incremental update layer(s). Hidden revision histories or injected scripts may be present.")
                
                # Check for active JavaScript/Macros flags
                if b'/JavaScript' in content or b'/JS' in content:
                    anomalies.append("WARNING: Active executable JavaScript streams discovered embedded inside the PDF dictionary structure.")
                    
        except Exception as e:
            anomalies.append(f"PARSING ERROR: Failed to decode binary stream safely. Reason: {str(e)}")
            
        return findings, anomalies

    @classmethod
    def analyze_docx(cls, file_path):
        """Unpacks Open XML Word Processing elements within ephemeral buffers."""
        anomalies = []
        findings = {}
        
        try:
            with zipfile.ZipFile(file_path, 'r') as z:
                # 1. Chronological Mismatch Rule (core.xml vs OS Filesystem)
                if 'docProps/core.xml' in z.namelist():
                    core_xml_content = z.read('docProps/core.xml')
                    root = ET.fromstring(core_xml_content)
                    
                    # Namespaces for OOXML Core Properties
                    ns = {
                        'cp': 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties',
                        'dcterms': 'http://purl.org/dc/terms/',
                        'dc': 'http://purl.org/dc/elements/1.1/'
                    }
                    
                    created_el = root.find('.//dcterms:created', ns)
                    modified_el = root.find('.//dcterms:modified', ns)
                    creator_el = root.find('.//dc:creator', ns)
                    
                    xml_created = created_el.text if created_el is not None else "Unknown"
                    xml_modified = modified_el.text if modified_el is not None else "Unknown"
                    findings['Author'] = creator_el.text if creator_el is not None else "Unknown"
                    findings['Internal Created Time'] = xml_created
                    findings['Internal Modified Time'] = xml_modified
                    
                    # Validate if modification timestamp predates creation logs (Timestomping)
                    if xml_created != "Unknown" and xml_modified != "Unknown":
                        try:
                            # Clean timestamp strings for parsing
                            c_date = datetime.fromisoformat(xml_created.replace('Z', '+00:00'))
                            m_date = datetime.fromisoformat(xml_modified.replace('Z', '+00:00'))
                            if m_date < c_date:
                                anomalies.append("CRITICAL (Timestomping): The internal XML modification date predates its creation log. Timeline manipulation detected.")
                        except ValueError:
                            pass
                
                # 2. Hidden Content / Tracked Changes Discrepancy Extraction
                if 'word/document.xml' in z.namelist():
                    doc_content = z.read('word/document.xml').decode('utf-8')
                    # Look for tracking XML nodes like <w:ins> (insertions) or <w:del> (deletions)
                    has_tracked_ins = '<w:ins' in doc_content
                    has_tracked_del = '<w:del' in doc_content
                    
                    if has_tracked_ins or has_tracked_del:
                        anomalies.append("WARNING: Document contains active unfinalized or masked Tracked Changes revisions.")
                        
        except Exception as e:
            anomalies.append(f"SANDBOX ERROR: Safe structural extraction failed. Reason: {str(e)}")
            
        return findings, anomalies

class ForensicDocApp(QMainWindow):
    """User Interface wrapping analytical engines into plain-English verification briefs."""
    
    def _add_location_row(self, indicator: str, match_count: str, offsets: str):
        row = self.table_locations.rowCount()
        self.table_locations.insertRow(row)
        self.table_locations.setItem(row, 0, QTableWidgetItem(str(indicator)))
        self.table_locations.setItem(row, 1, QTableWidgetItem(str(match_count)))
        self.table_locations.setItem(row, 2, QTableWidgetItem(str(offsets)))


    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("ForensicDoc: Local Document Tamper Detection Framework")
        self.setGeometry(100, 100, 950, 650)
        self.init_ui()
        
    def init_ui(self):
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QVBoxLayout(main_widget)
        
        # Header Branding block
        header_lbl = QLabel("ForensicDoc Validation Dashboard")
        header_lbl.setFont(QFont("Arial", 16, QFont.Bold))
        header_lbl.setStyleSheet("color: #2c3e50; margin-bottom: 5px;")
        layout.addWidget(header_lbl)
        
        subheader_lbl = QLabel("Local-First Secure Desktop Forensic Analysis Engine (RA 10173 Compliant)")
        subheader_lbl.setFont(QFont("Arial", 9, QFont.StyleItalic))
        subheader_lbl.setStyleSheet("color: #7f8c8d; margin-bottom: 15px;")
        layout.addWidget(subheader_lbl)
        
        # File Operations Box
        file_group = QGroupBox("Target Document Selection")
        file_layout = QHBoxLayout()
        self.btn_browse = QPushButton("Ingest Document (PDF / DOCX)")
        self.btn_browse.setStyleSheet("background-color: #3498db; color: white; font-weight: bold; padding: 8px;")
        self.btn_browse.clicked.connect(self.browse_file)
        self.lbl_file_path = QLabel("No document ingested yet.")
        self.lbl_file_path.setWordWrap(True)
        file_layout.addWidget(self.btn_browse)
        file_layout.addWidget(self.lbl_file_path, 1)
        file_group.setLayout(file_layout)
        layout.addWidget(file_group)
        
        # Core Manifest Metadata Table
        self.meta_group = QGroupBox("Extracted Structural Properties Manifest")
        meta_layout = QVBoxLayout()
        self.table_meta = QTableWidget(0, 2)
        self.table_meta.setHorizontalHeaderLabels(["Forensic Key Attribute", "Extracted Safe Value"])
        self.table_meta.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        meta_layout.addWidget(self.table_meta)
        self.meta_group.setLayout(meta_layout)
        layout.addWidget(self.meta_group)

        # PDF "Exploited/Edited" Heuristic Locations (new layer below the metadata table)
        self.locations_group = QGroupBox("Exploited / Edited Part Locations (Heuristic)")
        loc_layout = QVBoxLayout()

        self.table_locations = QTableWidget(0, 3)
        self.table_locations.setHorizontalHeaderLabels(["Indicator", "Match Count", "Offsets (bytes)"])
        self.table_locations.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table_locations.setWordWrap(True)

        loc_layout.addWidget(self.table_locations)
        self.locations_group.setLayout(loc_layout)
        layout.addWidget(self.locations_group)

        # Automated Tamper Alerts Dashboard
        alert_group = QGroupBox("Plain-Language Validation Reports & Structural Anomalies")
        alert_layout = QVBoxLayout()
        self.txt_alerts = QTextEdit()
        self.txt_alerts.setReadOnly(True)
        self.txt_alerts.setFont(QFont("Courier New", 10))
        alert_layout.addWidget(self.txt_alerts)
        alert_group.setLayout(alert_layout)
        layout.addWidget(alert_group)


    def browse_file(self):
        file_filter = "Supported Files (*.pdf *.docx)"
        file_path, _ = QFileDialog.getOpenFileName(self, "Open Document Unit", "", file_filter)
        
        if file_path:
            self.lbl_file_path.setText(f"Active Unit: {file_path}")
            self.process_document(file_path)
            
    def process_document(self, file_path):
        # Generate initial system immutable fingerprint
        sha256_sig = ForensicEngine.calculate_sha256(file_path)
        _, ext = os.path.splitext(file_path.lower())
        
        meta_props = {
            "Analysis Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Target File Name": os.path.basename(file_path),
            "Cryptographic Signature (SHA-256)": sha256_sig,
            "Document Architecture Class": ext.upper()[1:]
        }
        
        anomalies = []

        # Feature values for ML risk scoring (default 0)
        incremental_updates = 0
        js_detected = 0
        internal_modified_before_created = 0
        tracked_changes = 0
        sha_changed_flag = 0

        if ext == '.pdf':
            pdf_props, pdf_anomalies = ForensicEngine.analyze_pdf(file_path)
            meta_props.update(pdf_props)
            anomalies.extend(pdf_anomalies)

            incremental_updates = max(0, int(pdf_props.get('Incremental Updates Count', 0)))
            # crude JS detection aligned to deterministic checks
            with open(file_path, 'rb') as f:
                content = f.read()
            js_detected = 1 if (b'/JavaScript' in content or b'/JS' in content) else 0

            # Populate the new "Exploited / Edited" locations table (heuristic byte offsets)
            self.table_locations.setRowCount(0)

            # Offsets for %%EOF occurrences
            eof_offsets = [m.start() for m in re.finditer(b'%%EOF', content)]
            self._add_location_row(
                indicator='%%EOF occurrences (revision/trailer markers)',
                match_count=str(len(eof_offsets)),
                offsets='; '.join(map(str, eof_offsets[:50])) + (' ...' if len(eof_offsets) > 50 else '')
            )


            # Offsets for JavaScript and JS tokens
            js_offsets = [m.start() for m in re.finditer(b'/JavaScript', content)]
            self._add_location_row(
                indicator='/JavaScript occurrences (script streams)',
                match_count=str(len(js_offsets)),
                offsets='; '.join(map(str, js_offsets[:50])) + (' ...' if len(js_offsets) > 50 else '')
            )

            js_short_offsets = [m.start() for m in re.finditer(b'/JS', content)]
            self._add_location_row(
                indicator='/JS occurrences (script references)',
                match_count=str(len(js_short_offsets)),
                offsets='; '.join(map(str, js_short_offsets[:50])) + (' ...' if len(js_short_offsets) > 50 else '')
            )

        elif ext == '.docx':
            # Hide/clear locations for non-PDF
            self.table_locations.setRowCount(0)

            docx_props, docx_anomalies = ForensicEngine.analyze_docx(file_path)
            meta_props.update(docx_props)
            anomalies.extend(docx_anomalies)

            # Re-scan to populate the remaining ML features
            with zipfile.ZipFile(file_path, 'r') as z:
                # timestomping heuristic
                internal_created = docx_props.get('Internal Created Time', 'Unknown')
                internal_modified = docx_props.get('Internal Modified Time', 'Unknown')
                try:
                    if internal_created != 'Unknown' and internal_modified != 'Unknown':
                        c_date = datetime.fromisoformat(internal_created.replace('Z', '+00:00'))
                        m_date = datetime.fromisoformat(internal_modified.replace('Z', '+00:00'))
                        internal_modified_before_created = 1 if (m_date < c_date) else 0
                except Exception:
                    pass

                # tracked changes heuristic
                if 'word/document.xml' in z.namelist():
                    doc_content = z.read('word/document.xml').decode('utf-8', errors='ignore')
                    tracked_changes = 1 if ('<w:ins' in doc_content or '<w:del' in doc_content) else 0

        elif ext == '.docx':
            docx_props, docx_anomalies = ForensicEngine.analyze_docx(file_path)
            meta_props.update(docx_props)
            anomalies.extend(docx_anomalies)

            # Re-scan to populate the remaining ML features
            with zipfile.ZipFile(file_path, 'r') as z:
                # timestomping heuristic
                internal_created = docx_props.get('Internal Created Time', 'Unknown')
                internal_modified = docx_props.get('Internal Modified Time', 'Unknown')
                try:
                    if internal_created != 'Unknown' and internal_modified != 'Unknown':
                        c_date = datetime.fromisoformat(internal_created.replace('Z', '+00:00'))
                        m_date = datetime.fromisoformat(internal_modified.replace('Z', '+00:00'))
                        internal_modified_before_created = 1 if (m_date < c_date) else 0
                except Exception:
                    pass

                # tracked changes heuristic
                if 'word/document.xml' in z.namelist():
                    doc_content = z.read('word/document.xml').decode('utf-8', errors='ignore')
                    tracked_changes = 1 if ('<w:ins' in doc_content or '<w:del' in doc_content) else 0


        elif ext == '.docx':
            docx_props, docx_anomalies = ForensicEngine.analyze_docx(file_path)
            meta_props.update(docx_props)
            anomalies.extend(docx_anomalies)

            # Re-scan to populate the remaining ML features
            with zipfile.ZipFile(file_path, 'r') as z:
                # timestomping heuristic
                internal_created = docx_props.get('Internal Created Time', 'Unknown')
                internal_modified = docx_props.get('Internal Modified Time', 'Unknown')
                try:
                    if internal_created != 'Unknown' and internal_modified != 'Unknown':
                        c_date = datetime.fromisoformat(internal_created.replace('Z', '+00:00'))
                        m_date = datetime.fromisoformat(internal_modified.replace('Z', '+00:00'))
                        internal_modified_before_created = 1 if (m_date < c_date) else 0
                except Exception:
                    pass

                # tracked changes heuristic
                if 'word/document.xml' in z.namelist():
                    doc_content = z.read('word/document.xml').decode('utf-8', errors='ignore')
                    tracked_changes = 1 if ('<w:ins' in doc_content or '<w:del' in doc_content) else 0

        # Placeholder: without prior known-good baseline, sha_changed_flag is not meaningful.
        sha_changed_flag = 0

        # ML risk score (prototype mode: do not crash the app if ML is unavailable)
        # You asked to hide AI fields for now (no API yet). So we only attempt ML silently,
        # and if it fails, we keep the UI running without any AI-related meta rows.
        if predict_risk is not None:
            try:
                features = np.array([
                    incremental_updates,
                    js_detected,
                    internal_modified_before_created,
                    tracked_changes,
                    sha_changed_flag
                ], dtype=float)

                risk_score = predict_risk(features)
                # Prototype: hide AI fields regardless of prediction result
                _ = risk_score
            except Exception:
                # Prototype: ignore ML errors entirely
                pass
            
        # Update Metadata Manifest Table
        self.table_meta.setRowCount(0)
        for row_idx, (key, val) in enumerate(meta_props.items()):
            self.table_meta.insertRow(row_idx)
            self.table_meta.setItem(row_idx, 0, QTableWidgetItem(str(key)))
            self.table_meta.setItem(row_idx, 1, QTableWidgetItem(str(val)))
            
        # Compile Plain English Briefing narrative
        self.txt_alerts.clear()
        if not anomalies:
            self.txt_alerts.setStyleSheet("QTextEdit { background-color: #ecf0f1; color: #27ae60; }")
            self.txt_alerts.setText("SUCCESS: No common deterministic tampering indicators detected. Document structure appears cohesive.")
        else:
            self.txt_alerts.setStyleSheet("QTextEdit { background-color: #fce4d6; color: #c0392b; }")
            report_text = f"ATTENTION: Tamper Detection Flags Isolated!\n{'='*60}\n\n"
            for index, bug in enumerate(anomalies, 1):
                report_text += f"[{index}] {bug}\n\n"
            self.txt_alerts.setText(report_text)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = ForensicDocApp()
    window.show()
    sys.exit(app.exec_())