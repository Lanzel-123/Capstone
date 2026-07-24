import React, { useState, useEffect } from 'react';

export default function LiveApp() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('forensicdoc_theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('forensicdoc_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
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

  // Only the main outer page background toggles between Light (slate-100) and Dark (slate-950)
  const pageBgClass = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900';

  // Feature containers remain 100% SOLID, bright, opaque gold (no transparency) in both modes
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
  const innerItemBg = 'bg-[#F5C738] border border-[#a67c0c] text-slate-950 font-bold';
  const italicText = 'text-slate-800 italic font-semibold';

  const rightPanelHeading = 'text-slate-950 font-mono text-2xl font-extrabold';
  const rightPanelText = 'text-slate-900 font-semibold leading-7';

  const toggleBtnClass = 'bg-slate-950 text-amber-300 border-2 border-amber-400 hover:bg-slate-800 shadow-md';

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-200 selection:bg-[#D4A017]/40 selection:text-slate-900 ${pageBgClass}`}>
      <header className={`sticky top-0 z-50 transition-colors duration-200 ${headerBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className={`text-xl ${headerTitleClass}`}>FORENSICDOC LIVE 2</h1>
            <p className={`text-xs ${headerSubClass}`}>Municipal Document Integrity Registry • Reload Check</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${toggleBtnClass}`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
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

      <main className="flex-1 w-full mx-auto p-6 dashboard-grid">
        <section className="dashboard-left">
          <div className={`border rounded-3xl p-6 transition-colors duration-200 ${cardIngestionBg}`}>
            <h2 className={`text-sm mb-4 ${headingClass}`}>1. Document Ingestion</h2>
            <label className={`border-2 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition group ${dropzoneBg}`}>
              <span className={`text-base ${dropzoneTextPrimary}`}>Upload Documents LIVE</span>
              <span className={`text-sm mt-2 ${dropzoneTextSecondary}`}>Accepts PDF or DOCX files</span>
              <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className={`border rounded-3xl p-6 transition-colors duration-200 ${cardExploreBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
              <div>
                <h2 className={`text-sm ${headingClass}`}>Dashboard Explore</h2>
                <p className={`text-sm mt-2 ${labelClass}`}>Search, filter, and inspect events for forensic documents.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleApply}
                  className={`rounded-3xl px-5 py-2 text-sm transition ${applyBtnClass}`}
                >
                  Apply
                </button>
                <button
                  onClick={handleReset}
                  className={`rounded-3xl px-5 py-2 text-sm transition ${resetBtnClass}`}
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-3">
                <label className={`block text-[10px] uppercase tracking-widest font-bold font-mono ${labelClass}`}>Search Results Input</label>
                <input
                  placeholder="Type a keyword, filename, or anomaly"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className={`w-full rounded-3xl px-4 py-3 text-sm transition ${inputClass}`}
                />
              </div>
              <div className="space-y-3">
                <label className={`block text-[10px] uppercase tracking-widest font-bold font-mono ${labelClass}`}>Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full rounded-3xl px-4 py-3 text-sm transition ${inputClass}`}
                >
                  <option className={optionClass}>All</option>
                  <option className={optionClass}>SECURE</option>
                  <option className={optionClass}>SUSPICIOUS</option>
                  <option className={optionClass}>HIGH RISK</option>
                </select>
              </div>
            </div>

            <div className="space-y-6 mt-6">
              <div className="space-y-3">
                <div className={`text-[11px] uppercase tracking-widest font-bold font-mono ${labelClass}`}>
                  Search Results {appliedSearch && `for "${appliedSearch}"`}
                </div>
                <div className={`rounded-3xl border p-4 space-y-3 ${innerBoxBg}`}>
                  {appliedSearch ? (
                    <>
                      <div className={`rounded-3xl p-4 text-sm break-words ${innerItemBg}`}>Manila_Procurement_Contract_2025_signed.pdf</div>
                      <div className={`rounded-3xl p-4 text-sm ${innerItemBg}`}>City_Resolution_No_402.docx</div>
                    </>
                  ) : (
                    <div className={`rounded-3xl p-4 text-xs ${italicText}`}>Enter a search query and click Apply to see results.</div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div className={`text-[11px] uppercase tracking-widest font-bold font-mono ${labelClass}`}>Events</div>
                <div className={`rounded-3xl border p-4 space-y-3 ${innerBoxBg}`}>
                  {uploadedFile ? (
                    <div className={`rounded-3xl p-4 text-sm ${innerItemBg}`}>
                      ✓ Uploaded: <span className="font-semibold">{uploadedFile.name}</span>
                    </div>
                  ) : null}
                  {appliedSearch && (
                    <div className={`rounded-3xl p-4 text-sm ${innerItemBg}`}>
                      🔍 Search applied: <span className="font-semibold">"{appliedSearch}"</span> {statusFilter !== 'All' && `[${statusFilter}]`}
                    </div>
                  )}
                  {!uploadedFile && !appliedSearch && (
                    <div className={`rounded-3xl p-4 text-sm ${innerItemBg}`}>Dashboard ready for Explore mode.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-right">
          <div className={`border rounded-3xl p-10 h-full flex flex-col justify-center transition-colors duration-200 ${rightPanelBg}`}>
            <div className="w-full">
              {uploadedFile ? (
                <>
                  <h3 className={`text-2xl font-bold font-mono mb-4 ${rightPanelHeading}`}>Document Uploaded</h3>
                  <p className={`text-base mb-4 ${rightPanelText}`}>
                    <span className="font-semibold">{uploadedFile.name}</span> ({(uploadedFile.size / 1024).toFixed(2)} KB)
                  </p>
                  <p className={`text-sm ${rightPanelText}`}>Ready for forensic analysis and document integrity assessment.</p>
                </>
              ) : (
                <>
                  <h3 className={`text-2xl font-bold font-mono mb-4 ${rightPanelHeading}`}>Awaiting Document Ingestion</h3>
                  <p className={`text-base ${rightPanelText}`}>Choose a scenario on the left, or upload a PDF/DOCX for sandbox assessment.</p>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}



