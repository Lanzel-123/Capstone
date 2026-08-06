import React, { useState, useEffect } from 'react';
import { login, fetchDocuments, uploadDocument, fetchAnalysis, getStoredToken, setStoredToken } from './api';

export default function LiveApp() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [appliedSearch, setAppliedSearch] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [apiError, setApiError] = useState('');
  const [userStatus, setUserStatus] = useState('Checking backend connection...');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('forensicdoc_theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('forensicdoc_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Initial load: authenticate & load live document registry
  useEffect(() => {
    initBackend();
  }, []);

  const initBackend = async () => {
    setApiError('');
    try {
      if (!getStoredToken()) {
        setUserStatus('Authenticating with Django backend...');
        await login('officer', 'officerpassword123');
      }
      setIsAuthenticated(true);
      setUserStatus('Connected as Records Officer (officer)');
      await loadDocuments();
    } catch (err) {
      console.error('Backend init error:', err);
      setIsAuthenticated(false);
      setUserStatus('Backend offline or credentials invalid');
      setApiError(err.message || 'Cannot connect to http://127.0.0.1:8000');
    }
  };

  const loadDocuments = async () => {
    setIsFetching(true);
    try {
      const data = await fetchDocuments();
      setDocuments(data);
      if (data.length > 0 && !selectedDoc) {
        selectDocument(data[0]);
      }
    } catch (err) {
      console.error('Error loading documents:', err);
      setApiError(err.message);
    } finally {
      setIsFetching(false);
    }
  };

  const selectDocument = async (doc) => {
    setSelectedDoc(doc);
    setAnalysisData(null);
    setApiError('');
    try {
      const analysis = await fetchAnalysis(doc.id);
      setAnalysisData(analysis);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setApiError(`Could not load analysis for ${doc.original_filename}: ${err.message}`);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setApiError('');
    try {
      const uploadedDoc = await uploadDocument(file, 'Records Management', 'Uploaded via Live Dashboard');
      // Refresh documents list
      const docs = await fetchDocuments();
      setDocuments(docs);
      // Select the newly uploaded document & fetch analysis
      await selectDocument(uploadedDoc);
    } catch (err) {
      console.error('Upload failed:', err);
      setApiError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleApply = () => {
    setAppliedSearch(searchInput);
  };

  const handleReset = () => {
    setSearchInput('');
    setStatusFilter('All');
    setAppliedSearch('');
  };

  const handleRelogin = async () => {
    setStoredToken(null);
    await initBackend();
  };

  // Filter documents based on applied search and status filter
  const filteredDocuments = documents.filter((doc) => {
    const query = appliedSearch.toLowerCase().trim();
    const matchesQuery =
      !query ||
      doc.original_filename.toLowerCase().includes(query) ||
      (doc.sha256_hash && doc.sha256_hash.toLowerCase().includes(query)) ||
      (doc.lgu_unit && doc.lgu_unit.toLowerCase().includes(query));

    let matchesStatus = true;
    if (statusFilter === 'SECURE') {
      matchesStatus = doc.status === 'COMPLETED';
    } else if (statusFilter === 'SUSPICIOUS') {
      matchesStatus = doc.status === 'QUEUED' || doc.status === 'ANALYSING';
    } else if (statusFilter === 'HIGH RISK') {
      matchesStatus = doc.status === 'FAILED';
    }

    return matchesQuery && matchesStatus;
  });

  // Dynamic Theme Classes
  const pageBgClass = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900';
  const headerBgClass = 'bg-[#D4A017] border-b-2 border-[#a67c0c] text-slate-950 shadow-md';
  const headerTitleClass = 'text-slate-950 font-bold tracking-wider';
  const headerSubClass = 'text-slate-900 font-mono font-semibold';

  const cardIngestionBg = 'bg-[#E5B422] border-2 border-[#b88a10] text-slate-950 shadow-lg rounded-3xl';
  const cardExploreBg = 'bg-[#E5B422] border-2 border-[#b88a10] text-slate-950 shadow-lg rounded-3xl';
  const rightPanelBg = 'bg-[#E5B422] border-2 border-[#b88a10] text-slate-950 shadow-lg rounded-3xl';

  const headingClass = 'text-slate-950 font-mono font-extrabold uppercase tracking-widest text-sm';
  const labelClass = 'text-slate-950 font-bold text-xs uppercase tracking-wider';

  const dropzoneBg = 'bg-white border-2 border-dashed border-[#a67c0c] hover:bg-amber-50 text-slate-950 shadow-sm';
  const dropzoneTextPrimary = 'text-slate-950 font-extrabold text-base';
  const dropzoneTextSecondary = 'text-slate-800 font-semibold text-sm';

  const inputClass = 'bg-white border-2 border-[#a67c0c] text-slate-950 font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#946e09]';
  const optionClass = 'bg-white text-slate-950 font-semibold';

  const applyBtnClass = 'bg-slate-950 hover:bg-slate-800 text-amber-300 font-extrabold shadow-md';
  const resetBtnClass = 'bg-white hover:bg-amber-50 border-2 border-[#a67c0c] text-slate-950 font-extrabold shadow-sm';

  const innerBoxBg = 'bg-white/95 border-2 border-[#a67c0c] shadow-sm';
  const innerItemBg = 'bg-[#F5C738] border border-[#a67c0c] text-slate-950 font-bold hover:bg-[#eab92d] cursor-pointer transition';
  const italicText = 'text-slate-800 italic font-semibold';

  const rightPanelHeading = 'text-slate-950 font-mono text-2xl font-extrabold';
  const rightPanelText = 'text-slate-900 font-semibold leading-7';
  const toggleBtnClass = 'bg-slate-950 text-amber-300 border-2 border-amber-400 hover:bg-slate-800 shadow-md';

  const getVerdictBadge = (verdict, score) => {
    if (verdict === 'AUTHENTIC') {
      return { label: 'AUTHENTIC • SECURE', color: 'bg-emerald-600 text-white border-emerald-700' };
    }
    if (verdict === 'SUSPICIOUS') {
      return { label: 'SUSPICIOUS • WARNING', color: 'bg-amber-600 text-white border-amber-700' };
    }
    if (verdict === 'TAMPERED') {
      return { label: 'TAMPERED • HIGH RISK', color: 'bg-red-600 text-white border-red-700' };
    }
    return { label: verdict || 'ANALYZING', color: 'bg-slate-700 text-amber-300 border-slate-800' };
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-700 text-white';
      case 'HIGH':
        return 'bg-red-600 text-white';
      case 'MEDIUM':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-200 selection:bg-[#D4A017]/40 selection:text-slate-900 ${pageBgClass}`}>
      {/* --- HEADER --- */}
      <header className={`sticky top-0 z-50 transition-colors duration-200 ${headerBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl ${headerTitleClass}`}>FORENSICDOC LIVE</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-950 text-amber-400 border border-amber-500">
                Django REST Connected
              </span>
            </div>
            <p className={`text-xs ${headerSubClass}`}>Municipal Document Integrity Registry • Live Analysis</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-mono font-extrabold text-slate-950">{userStatus}</p>
            </div>
            <button
              onClick={handleRelogin}
              className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-950 text-amber-300 hover:bg-slate-800 transition"
              title="Reconnect to Backend API"
            >
              🔄 Reconnect
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${toggleBtnClass}`}
            >
              {isDarkMode ? (
                <>
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* --- ERROR BANNER --- */}
      {apiError && (
        <div className="bg-red-600 text-white px-4 py-3 text-sm font-semibold flex justify-between items-center shadow-md">
          <span>⚠️ {apiError}</span>
          <button onClick={() => setApiError('')} className="font-bold underline text-xs">Dismiss</button>
        </div>
      )}

      {/* --- MAIN DASHBOARD GRID --- */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 dashboard-grid grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* --- LEFT SECTION (6 cols) --- */}
        <section className="lg:col-span-6 space-y-6">
          {/* 1. DOCUMENT INGESTION CARD */}
          <div className={`border rounded-3xl p-6 transition-colors duration-200 ${cardIngestionBg}`}>
            <h2 className={`text-sm mb-4 ${headingClass}`}>1. Document Ingestion</h2>
            <label className={`border-2 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition group relative ${dropzoneBg}`}>
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-bold text-slate-950">Uploading to Django & Running Forensic Engines...</span>
                </div>
              ) : (
                <>
                  <span className={`text-base ${dropzoneTextPrimary}`}>Upload Documents LIVE</span>
                  <span className={`text-sm mt-2 ${dropzoneTextSecondary}`}>Accepts PDF or DOCX files</span>
                  <input type="file" accept=".pdf,.docx,.doc" onChange={handleFileUpload} className="hidden" />
                </>
              )}
            </label>
          </div>

          {/* 2. DASHBOARD EXPLORE CARD */}
          <div className={`border rounded-3xl p-6 transition-colors duration-200 ${cardExploreBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className={`text-sm ${headingClass}`}>2. Registry & Explore</h2>
                <p className={`text-sm mt-1 ${labelClass}`}>Search, filter, and select live forensic documents.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleApply} className={`rounded-3xl px-4 py-2 text-xs transition ${applyBtnClass}`}>
                  Apply
                </button>
                <button onClick={handleReset} className={`rounded-3xl px-4 py-2 text-xs transition ${resetBtnClass}`}>
                  Reset
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <label className={`block text-[10px] uppercase tracking-widest font-bold font-mono ${labelClass}`}>Search Input</label>
                <input
                  placeholder="Type filename, SHA-256, or LGU unit"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                  className={`w-full rounded-3xl px-4 py-2.5 text-sm transition ${inputClass}`}
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-[10px] uppercase tracking-widest font-bold font-mono ${labelClass}`}>Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full rounded-3xl px-4 py-2.5 text-sm transition ${inputClass}`}
                >
                  <option className={optionClass} value="All">All Documents ({documents.length})</option>
                  <option className={optionClass} value="SECURE">Completed</option>
                  <option className={optionClass} value="SUSPICIOUS">Queued / Processing</option>
                  <option className={optionClass} value="HIGH RISK">Failed</option>
                </select>
              </div>
            </div>

            {/* DOCUMENT LIST DISPLAY */}
            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <div className={`text-[11px] uppercase tracking-widest font-bold font-mono ${labelClass}`}>
                  Live Registry Documents ({filteredDocuments.length})
                </div>
                {isFetching && <span className="text-xs font-mono font-bold animate-pulse text-slate-900">Loading...</span>}
              </div>

              <div className={`rounded-3xl border p-4 space-y-3 max-h-80 overflow-y-auto ${innerBoxBg}`}>
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => {
                    const isSelected = selectedDoc?.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => selectDocument(doc)}
                        className={`rounded-2xl p-4 transition text-sm flex justify-between items-center gap-3 ${isSelected
                            ? 'bg-slate-950 text-amber-300 border-2 border-amber-400 font-extrabold shadow-md'
                            : innerItemBg
                          }`}
                      >
                        <div className="truncate">
                          <p className="font-bold truncate">{doc.original_filename}</p>
                          <p className="text-[10px] opacity-80 font-mono truncate">
                            SHA: {doc.sha256_hash ? doc.sha256_hash.substring(0, 16) + '...' : 'Calculating...'}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-full bg-slate-900/20 uppercase">
                          {doc.status}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className={`rounded-3xl p-4 text-xs text-center ${italicText}`}>
                    {documents.length === 0 ? 'No documents in Django database yet. Upload a PDF/DOCX above!' : 'No matching documents found.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* --- RIGHT SECTION (6 cols): FORENSIC REPORT & INSPECTION PANEL --- */}
        <section className="lg:col-span-6">
          <div className={`border rounded-3xl p-8 min-h-full flex flex-col transition-colors duration-200 ${rightPanelBg}`}>
            {selectedDoc ? (
              <div className="space-y-6 w-full">
                {/* DOCUMENT TITLE & BADGE */}
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-900">
                        Document Details
                      </span>
                      <h3 className={`text-xl font-bold font-mono ${rightPanelHeading} break-all`}>
                        {selectedDoc.original_filename}
                      </h3>
                    </div>

                    {analysisData && (
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-mono font-extrabold border uppercase shadow-sm ${getVerdictBadge(analysisData.verdict, analysisData.risk_score).color
                          }`}
                      >
                        {getVerdictBadge(analysisData.verdict, analysisData.risk_score).label}
                      </span>
                    )}
                  </div>

                  {/* METADATA STRIP */}
                  <div className="mt-4 p-4 rounded-2xl bg-white/95 border border-[#a67c0c] space-y-2 text-xs font-mono text-slate-950 shadow-sm">
                    <div className="flex justify-between border-b pb-1">
                      <span className="font-bold">SHA-256 Hash:</span>
                      <span className="font-mono text-[11px] truncate max-w-[240px]" title={selectedDoc.sha256_hash}>
                        {selectedDoc.sha256_hash || 'Calculating...'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="font-bold">File Size:</span>
                      <span>{(selectedDoc.file_size / 1024).toFixed(2)} KB</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="font-bold">Uploaded By:</span>
                      <span>{selectedDoc.uploader_username || 'Officer'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Upload Date:</span>
                      <span>{new Date(selectedDoc.uploaded_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* RISK SCORE & ANALYSIS DETAILS */}
                {analysisData ? (
                  <div className="space-y-4">
                    {/* RISK SCORE BAR */}
                    <div className="p-4 rounded-2xl bg-slate-950 text-amber-300 border-2 border-amber-400">
                      <div className="flex justify-between items-center mb-2 font-mono text-xs font-bold">
                        <span>FORENSIC RISK SCORE:</span>
                        <span className="text-base font-extrabold">{analysisData.risk_score?.toFixed(1)} / 100</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${analysisData.risk_score >= 70
                              ? 'bg-red-500'
                              : analysisData.risk_score >= 35
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          style={{ width: `${Math.min(analysisData.risk_score || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* FINDINGS LIST */}
                    <div>
                      <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-950 mb-3">
                        Forensic Engine Findings ({analysisData.findings?.length || 0})
                      </h4>

                      <div className="space-y-3 max-h-72 overflow-y-auto">
                        {analysisData.findings && analysisData.findings.length > 0 ? (
                          analysisData.findings.map((f, i) => (
                            <div key={f.id || i} className="p-4 rounded-2xl bg-white border border-[#a67c0c] shadow-sm text-slate-950 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800">
                                  {f.category}
                                </span>
                                <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${getSeverityBadge(f.severity)}`}>
                                  {f.severity}
                                </span>
                              </div>
                              <h5 className="font-extrabold text-sm text-slate-950">{f.title}</h5>
                              <p className="text-xs text-slate-800 leading-relaxed">{f.description}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 rounded-2xl bg-white/95 border border-[#a67c0c] text-xs font-bold text-slate-800 text-center">
                            ✓ No anomalies detected by Python pypdf / docx engines. Document structure is verified.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-white/90 border border-[#a67c0c] text-center space-y-3">
                    <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-bold font-mono text-slate-950">Fetching analysis job from Django REST API...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="my-auto text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-950 text-amber-300 mx-auto flex items-center justify-center text-2xl font-bold shadow-lg">
                  📋
                </div>
                <h3 className={`text-2xl font-bold font-mono ${rightPanelHeading}`}>Awaiting Selection</h3>
                <p className={`text-base ${rightPanelText} max-w-sm mx-auto`}>
                  Upload a PDF or DOCX file on the left, or select an existing document from the registry to inspect live forensic analysis.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
