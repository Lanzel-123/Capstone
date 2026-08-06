import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from rest_framework.test import APIClient
from accounts.models import User
from django.core.files.uploadedfile import SimpleUploadedFile

def test_full_pipeline():
    print("--- 1. Setting up API Client & User ---")
    client = APIClient()
    user = User.objects.get(username="officer")
    client.force_authenticate(user=user)

    print("--- 2. Simulating Document Upload ---")
    dummy_pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R /JavaScript 3 0 R >>\nendobj\n"
    sample_file = SimpleUploadedFile("Manila_Contract_Test.pdf", dummy_pdf_content, content_type="application/pdf")

    response = client.post("/api/documents/upload/", {"file": sample_file}, format="multipart")
    print("Upload status code:", response.status_code)
    assert response.status_code == 201, f"Upload failed: {response.data}"
    
    doc_id = response.data.get("id")
    print(f"Document created! ID: {doc_id}")
    print(f"SHA-256 Hash: {response.data.get('sha256_hash')}")
    print(f"Document Status: {response.data.get('status')}")

    print("\n--- 3. Fetching Forensic Analysis Results ---")
    analysis_res = client.get(f"/api/documents/{doc_id}/analysis/")
    print("Analysis API status code:", analysis_res.status_code)
    assert analysis_res.status_code == 200, f"Analysis failed: {analysis_res.data}"

    data = analysis_res.data
    print(f"Verdict: {data.get('verdict')}")
    print(f"Risk Score: {data.get('risk_score')}")
    print(f"Status: {data.get('status')}")
    print(f"Findings Count: {len(data.get('findings', []))}")
    for idx, finding in enumerate(data.get('findings', []), 1):
        print(f"  [{idx}] {finding.get('category').upper()}: {finding.get('title')} ({finding.get('severity')})")
        print(f"      {finding.get('description')}")

    print("\n[SUCCESS] BACKEND PIPELINE TEST PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_pipeline()
