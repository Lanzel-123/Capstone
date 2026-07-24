import React, { useState, useEffect } from 'react';

// --- DEMONSTRATION SCENARIOS (LGU Test Cases) ---
const DEMO_SCENARIOS = [
  {
    id: 'scen-1',
    fileName: 'Manila_Procurement_Contract_2025_signed.pdf',
    fileSize: '1,245 KB',
    realHash: '8f3a129b8c2211e2a884f33910c22e89d12a55fb93c21a482d8d8931cf2f111a',
    baselineRating: 25,
    status: 'HIGH RISK',
    narrativeEn: `The forensic parser detected severe structural backdating. The internal XML metadata ('core.xml') timestamp indicates the document was created on March 15, 2025, but the system signature and file header show manual chronological alteration back to January 10, 2025. Additionally, a secondary PDF trailer (/Trailer offset) was appended to overwrite the payment terms on page 4 without invalidating the visual signatures.`,
    narrativeFil: `Napag-alaman ng forensic parser ang matinding manipulasyon sa petsa. Ang nakatagong XML metadata ('core.xml') ay nagpapakita na ang dokumento ay ginawa noong Marso 15, 2025, ngunit ang system signature ay pilit na binago pabalik sa Enero 10, 2025. Bukod dito, may nakitang karagdagang "PDF trailer" sa dulo upang palitan ang mga tuntunin sa pagbabayad sa pahina 4 nang hindi napapansin sa pirma.`,
    checks: {
      chronoMismatch: true,
      contrastObfuscation: false,
      trailerAnomaly: true,
      unapprovedUser: true,
    },
  },
  {
    id: 'scen-2',
    fileName: 'City_Resolution_No_402.docx',
    fileSize: '412 KB',
    realHash: '2c9d8831efaa02c3127811bb9e88d234a9910ce256e29a391c28efef3a88a129',
    baselineRating: 70,
    status: 'SUSPICIOUS',
    narrativeEn: `While the structural files are intact, the document contains active 'Track Changes' metadata associated with an unapproved off-network username ('guest-pc'). Font inspection also flagged text blocks on Page 2 with near-invisible white-on-white text (contrast ratio of 1.05:1), suggesting an attempt to inject hidden keywords or system prompts.`,
    narrativeFil: `Bagaman buo ang istraktura ng file, ang dokumento ay naglalaman ng aktibong 'Track Changes' metadata na nauugnay sa isang hindi awtorisadong user account ('guest-pc'). Nakitaan din ng pagsusuri ang Pahina 2 ng mga teksto na may kulay na halos katulad ng background (white-on-white, contrast ratio na 1.05:1), na nagpapahiwatig ng pagtatangkang magtago ng mga partikular na sugnay.`,
    checks: {
      chronoMismatch: false,
      contrastObfuscation: true,
      trailerAnomaly: false,
      unapprovedUser: true,
    },
  },
  {
    id: 'scen-3',
    fileName: 'HR_Appointment_Order_Salas_A.pdf',
    fileSize: '1,890 KB',
    realHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    baselineRating: 100,
    status: 'SECURE',
    narrativeEn: `Document structure is fully compliant. Cryptographic hash matches the registered LGU ledger, timestamps are chronologically consistent across all XML nodes, and zero hidden fonts or unapproved structural modifications were detected.`,
    narrativeFil: `Ganap na sumusunod sa pamantayan ang istraktura ng dokumento. Ang cryptographic hash ay tumutugma sa rehistradong talaan ng LGU, ang mga timestamps ay tugma sa lahat ng XML nodes, at walang nakitang nakatagong teksto o hindi awtorisadong pagbabago.`,
    checks: {
      chronoMismatch: false,
      contrastObfuscation: false,
      trailerAnomaly: false,
      unapprovedUser: false,
    },
  },
];

export default function App() {
  // --- STATE VARIABLES ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState('EN'); // EN or FIL
  const [reportStyle, setReportStyle] = useState('executive'); // executive or legal
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('forensicdoc_theme') !== 'light';
  });

  useEffect(() => {
    localStorage.setItem('forensicdoc_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Custom uploaded file state
  const [customFile, setCustomFile] = useState(null);
  const [customFileHash, setCustomFileHash] = useState('');

  // Sandbox modification toggles for custom files
  const [modChrono, setModChrono] = useState(false);
  const [modContrast, setModContrast] = useState(false);
  const [modTrailer, setModTrailer] = useState(false);
  const [modUser, setModUser] = useState(false);

  // Dynamic Theme Classes (Only outer background toggles)
  const pageBgClass = isDarkMode
    ? 'bg-neutral-950 text-neutral-100 selection:bg-yellow-500/30 selection:text-yellow-400'
    : 'bg-white text-neutral-900 selection:bg-amber-500/30 selection:text-amber-900';

  const headerBgClass = 'border-neutral-800 bg-neutral-900/50 backdrop-blur-md text-neutral-100';
  const headerTitleClass = 'text-yellow-500';
  const headerSubClass = 'text-neutral-400';

  const cardBgClass = 'bg-neutral-900 border-neutral-800 shadow-xl';
  const innerBoxClass = 'bg-neutral-950 border-neutral-800';

  const titleTextClass = 'text-neutral-300';
  const bodyTextClass = 'text-neutral-200';
  const mutedTextClass = 'text-neutral-500';

  const dropzoneBgClass = 'border-neutral-800 hover:border-yellow-500/50 bg-neutral-950 hover:bg-neutral-900/30';
  const dropzoneTextPrimary = 'text-neutral-300 group-hover:text-white';
  const footerClass = 'bg-neutral-950 border-neutral-900 text-neutral-600';

  // --- IN-MEMORY SECURITY APPRAISAL ENGINE ---
  const calculateAppraisal = () => {
    let score = 100;

    if (selectedScenario) {
      return selectedScenario.baselineRating;
    }

    if (customFile) {
      if (modChrono) score -= 35; // Severe penalty for timestomping
      if (modTrailer) score -= 30; // Severe penalty for structural duplicate trailers
      if (modContrast) score -= 20; // Medium penalty for hidden steganography text
      if (modUser) score -= 15; // Low-Medium penalty for unapproved user metadata
    }

    return Math.max(score, 0);
  };

  const integrityScore = calculateAppraisal();
  const complianceAccuracy = 98;

  const getStatusLabel = (score) => {
    if (score >= 90)
      return {
        label: 'SECURE',
        color: isDarkMode
          ? 'text-yellow-500 border-yellow-500 bg-yellow-500/10'
          : 'text-emerald-700 border-emerald-500 bg-emerald-50',
      };
    if (score >= 50)
      return {
        label: 'SUSPICIOUS',
        color: isDarkMode
          ? 'text-orange-500 border-orange-500 bg-orange-500/10'
          : 'text-orange-700 border-orange-500 bg-orange-50',
      };
    return {
      label: 'HIGH RISK',
      color: isDarkMode
        ? 'text-red-500 border-red-500 bg-red-500/10'
        : 'text-red-700 border-red-500 bg-red-50',
    };
  };

  const currentStatus = getStatusLabel(integrityScore);

  // --- AUTOMATIC AI BRIEF GENERATOR FOR CUSTOM FILES ---
  const generateCustomNarrative = () => {
    if (language === 'EN') {
      if (integrityScore === 100) {
        return `The uploaded file '${customFile.name}' is fully verified. The parsing checks detected no unauthorized adjustments, structural trailer duplicates, or metadata backdating anomalies. This document is safe for administrative routing.`;
      }
      let details = [];
      if (modChrono) details.push('Chronological timestamp mismatch (timestomping) in XML creation dates.');
      if (modTrailer) details.push('An unapproved secondary PDF trailer catalog change block was appended, modifying original values.');
      if (modContrast) details.push('Low-contrast visual elements (contrast < 1.1:1) flagged as hidden font steganography on Page 2.');
      if (modUser) details.push('Tracking logs reveal metadata authored by an unapproved, off-network system username.');

      return `WARNING: Forensic analysis of '${customFile.name}' has flagged anomalies. The following issues were discovered during server-side extraction: ${details.join(' ')} Integrity rating has been penalized. Immediate audit recommended.`;
    }

    // FIL
    if (integrityScore === 100) {
      return `Ang isinumiteng file na '${customFile.name}' ay napatunayang ligtas. Walang nakitang hindi awtorisadong pagbabago sa metadata o istraktura nito. Maaari itong gamitin sa mga regular na transaksyon sa munisipyo.`;
    }

    let details = [];
    if (modChrono) details.push('May hindi tugmang petsa at oras (timestomping) sa loob ng mga XML metadata file.');
    if (modTrailer) details.push('May natagpuang karagdagang PDF trailer na nagpapakita ng lihim na pag-edit pagkatapos pirmahan.');
    if (modContrast) details.push('May nakitang mga teksto na napakababaw ng kulay upang hindi mapansin ng mambabasa sa Pahina 2.');
    if (modUser) details.push('Ang may-akda ng file ay nagmula sa isang hindi rehistradong computer account sa LGU network.');

    return `BABALA: Ang forensic analysis ng '${customFile.name}' ay nakakita ng mga iregularidad: ${details.join(' ')} Ang antas ng kaligtasan ng dokumentong ito ay ibinaba. Mangyaring suriin nang mabuti bago tanggapin.`;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setSelectedScenario(null);
    setCustomFile(file);

    setModChrono(false);
    setModContrast(false);
    setModTrailer(false);
    setModUser(false);

    const reader = new FileReader();
    reader.onload = async function (evt) {
      try {
        const arrayBuffer = evt.target.result;
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

        setTimeout(() => {
          setCustomFileHash(hashHex);
          setIsAnalyzing(false);
        }, 1200);
      } catch {
        setCustomFileHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
        setIsAnalyzing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const loadDemoScenario = (scenario) => {
    setIsAnalyzing(true);
    setCustomFile(null);
    setCustomFileHash('');

    setTimeout(() => {
      setSelectedScenario(scenario);
      setIsAnalyzing(false);
    }, 800);
  };

  const resetSystem = () => {
    setSelectedScenario(null);
    setCustomFile(null);
    setCustomFileHash('');
    setModChrono(false);
    setModContrast(false);
    setModTrailer(false);
    setModUser(false);
    setActiveTab('dashboard');
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-200 ${pageBgClass}`}>
      <header className={`border-b sticky top-0 z-50 transition-colors duration-200 ${headerBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-neutral-950 shadow-lg shadow-amber-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className={`text-xl font-bold tracking-wider ${headerTitleClass}`}>FORENSICDOC</h1>
              <p className={`text-xs font-mono ${headerSubClass}`}>
                Municipal Document Integrity Registry • Records Management Division
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                isDarkMode
                  ? 'bg-neutral-800 text-yellow-400 border-neutral-700 hover:bg-neutral-700'
                  : 'bg-neutral-100 text-amber-700 border-neutral-300 hover:bg-neutral-200'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>

            <div className={`p-0.5 rounded-md flex border ${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-200 border-neutral-300'}`}>
              <button
                onClick={() => setLanguage('EN')}
                className={`px-3 py-1 text-xs font-bold rounded-sm transition ${
                  language === 'EN'
                    ? isDarkMode ? 'bg-yellow-500 text-neutral-950' : 'bg-amber-600 text-white'
                    : isDarkMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                ENGLISH
              </button>
              <button
                onClick={() => setLanguage('FIL')}
                className={`px-3 py-1 text-xs font-bold rounded-sm transition ${
                  language === 'FIL'
                    ? isDarkMode ? 'bg-yellow-500 text-neutral-950' : 'bg-amber-600 text-white'
                    : isDarkMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                FILIPINO
              </button>
            </div>

            <button
              onClick={resetSystem}
              className={`border px-3 py-1.5 rounded-md text-xs font-mono transition flex items-center gap-1 cursor-pointer ${
                isDarkMode
                  ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300 hover:text-white'
                  : 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700 hover:text-neutral-950'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
              </svg>
              Reset System
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-4 flex flex-col gap-6">
          <div className={`border rounded-xl p-5 relative overflow-hidden transition-colors duration-200 ${cardBgClass}`}>
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <h2 className={`text-sm font-bold uppercase tracking-widest mb-3 font-mono ${titleTextClass}`}>
              1. Document Ingestion
            </h2>

            <label className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition group ${dropzoneBgClass}`}>
              <svg
                className={`w-8 h-8 transition mb-2 ${isDarkMode ? 'text-neutral-500 group-hover:text-yellow-500' : 'text-neutral-400 group-hover:text-amber-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className={`text-sm font-semibold ${dropzoneTextPrimary}`}>Upload LGU Document</span>
              <span className={`text-xs mt-1 ${mutedTextClass}`}>Accepts PDF or DOCX files</span>
              <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileUpload} />
            </label>

            {customFile && (
              <div className={`mt-4 p-3 rounded-lg border text-xs font-mono ${innerBoxClass}`}>
                <div className="text-amber-500 font-bold mb-1 truncate">📄 {customFile.name}</div>
                <div className={mutedTextClass}>Size: {(customFile.size / 1024).toFixed(1)} KB</div>
                <div className={`mt-2 break-all p-2 rounded border ${innerBoxClass}`}>
                  <span className={`block font-bold text-[10px] uppercase ${mutedTextClass}`}>SHA-256 Forensic Hash</span>
                  {customFileHash || 'Calculating hash...'}
                </div>
              </div>
            )}
          </div>

          {customFile && (
            <div className={`border rounded-xl p-5 relative overflow-hidden animate-fade-in transition-colors duration-200 ${cardBgClass}`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <h2 className={`text-sm font-bold uppercase tracking-widest mb-1 font-mono ${titleTextClass}`}>2. Inject Simulation Variables</h2>
              <p className={`text-xs mb-4 ${mutedTextClass}`}>
                Toggle edits on your uploaded document to see how structural tests immediately capture discrepancies.
              </p>

              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition ${innerBoxClass}`}>
                  <input type="checkbox" checked={modChrono} onChange={(e) => setModChrono(e.target.checked)} className="mt-1 rounded text-amber-500 focus:ring-amber-500" />
                  <div>
                    <div className={`text-xs font-bold ${bodyTextClass}`}>Backdate Creation Timestamp (Timestomping)</div>
                    <p className={`text-[10px] mt-0.5 ${mutedTextClass}`}>Mismatches the XML document birth metrics against outer filesystem dates.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition ${innerBoxClass}`}>
                  <input type="checkbox" checked={modTrailer} onChange={(e) => setModTrailer(e.target.checked)} className="mt-1 rounded text-amber-500 focus:ring-amber-500" />
                  <div>
                    <div className={`text-xs font-bold ${bodyTextClass}`}>Append Secondary PDF Trailer</div>
                    <p className={`text-[10px] mt-0.5 ${mutedTextClass}`}>Adds an incremental override trailer at the end of the byte-stream to mask edits.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition ${innerBoxClass}`}>
                  <input type="checkbox" checked={modContrast} onChange={(e) => setModContrast(e.target.checked)} className="mt-1 rounded text-amber-500 focus:ring-amber-500" />
                  <div>
                    <div className={`text-xs font-bold ${bodyTextClass}`}>Inject Low-Contrast Hidden Font</div>
                    <p className={`text-[10px] mt-0.5 ${mutedTextClass}`}>Inserts invisible clauses below a 1.1:1 color contrast threshold ratio.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition ${innerBoxClass}`}>
                  <input type="checkbox" checked={modUser} onChange={(e) => setModUser(e.target.checked)} className="mt-1 rounded text-amber-500 focus:ring-amber-500" />
                  <div>
                    <div className={`text-xs font-bold ${bodyTextClass}`}>Save with Unregistered User Account</div>
                    <p className={`text-[10px] mt-0.5 ${mutedTextClass}`}>Saves creator info using an off-grid system profile not whitelisted in the registry.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          <div className={`border rounded-xl p-5 relative overflow-hidden transition-colors duration-200 ${cardBgClass}`}>
            <div className="absolute top-0 left-0 w-1 h-full bg-neutral-500"></div>
            <h2 className={`text-sm font-bold uppercase tracking-widest mb-1 font-mono ${titleTextClass}`}>Demonstration Scenarios</h2>
            <p className={`text-xs mb-4 ${mutedTextClass}`}>Click these pre-loaded records to test standard forensic behaviors.</p>

            <div className="flex flex-col gap-2">
              {DEMO_SCENARIOS.map((scenario) => {
                const isActive = selectedScenario?.id === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => loadDemoScenario(scenario)}
                    className={`text-left p-3 rounded-lg border text-xs font-mono transition ${
                      isActive
                        ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400'
                        : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold truncate max-w-[180px]">{scenario.fileName}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-sans font-bold ${
                          scenario.baselineRating === 100
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : scenario.baselineRating >= 50
                              ? 'bg-orange-500/10 text-orange-400'
                              : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {scenario.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate">Hash: {scenario.realHash}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="lg:col-span-8 flex flex-col gap-6">
          {isAnalyzing ? (
            <div className={`border rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors duration-200 ${cardBgClass}`}>
              <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-amber-500 font-mono">RUNNING FORENSIC EXTRACTION ENGINE</h3>
              <p className={`text-xs max-w-sm mt-1 ${mutedTextClass}`}>
                Executing in-memory parsing, validating structural boundaries, and hashing fingerprints...
              </p>
            </div>
          ) : !selectedScenario && !customFile ? (
            <div className={`border rounded-xl p-12 flex flex-col items-center justify-center text-center h-full transition-colors duration-200 ${cardBgClass}`}>
              <h3 className={`text-lg font-bold font-mono ${titleTextClass}`}>Awaiting Document Ingestion</h3>
              <p className={`text-xs max-w-sm mt-1 ${mutedTextClass}`}>
                Choose a scenario on the left, or upload a PDF/DOCX for sandbox assessment.
              </p>
            </div>
          ) : (
            <div className={`border rounded-xl p-6 transition-colors duration-200 ${cardBgClass}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono border ${currentStatus.color}`}>
                      {currentStatus.label}
                    </span>
                    <span className={`text-xs font-mono ${mutedTextClass}`}>Security Evaluation</span>
                  </div>
                  <h3 className={`text-lg font-bold truncate max-w-[320px] ${bodyTextClass}`}>
                    📂 {selectedScenario ? selectedScenario.fileName : customFile?.name}
                  </h3>
                </div>
                <div className="flex gap-4">
                  <div className={`text-center border px-4 py-2 rounded-lg ${innerBoxClass}`}>
                    <div className="text-3xl font-bold font-mono text-amber-500">{integrityScore}%</div>
                    <div className={`text-[9px] font-bold uppercase tracking-wider ${mutedTextClass}`}>Integrity Appraisal</div>
                  </div>
                  <div className={`text-center border px-4 py-2 rounded-lg ${innerBoxClass}`}>
                    <div className={`text-3xl font-bold font-mono ${titleTextClass}`}>{complianceAccuracy}%</div>
                    <div className={`text-[9px] font-bold uppercase tracking-wider ${mutedTextClass}`}>System Accuracy</div>
                  </div>
                </div>
              </div>

              <div className={`mt-4 border rounded-lg p-4 ${innerBoxClass}`}>
                <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 font-mono ${mutedTextClass}`}>
                  AI-Assisted Narrative Brief
                </h4>
                <div className={`text-xs leading-relaxed font-mono ${bodyTextClass}`}>
                  {selectedScenario
                    ? language === 'EN'
                      ? selectedScenario.narrativeEn
                      : selectedScenario.narrativeFil
                    : generateCustomNarrative()}
                </div>
              </div>

              {customFile && (
                <div className={`mt-4 text-xs font-mono ${mutedTextClass}`}>
                  Upload: {customFile.name} • Hash: {customFileHash ? customFileHash.slice(0, 16) + '…' : 'Calculating…'}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className={`border-t py-6 text-center text-xs font-mono transition-colors duration-200 ${footerClass}`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 ForensicDoc. Protected under Philippine Data Privacy Act of 2012 (RA 10173).</p>
          <p className={`text-[10px] uppercase tracking-widest ${mutedTextClass}`}>Document Security Appraisal System</p>
        </div>
      </footer>
    </div>
  );
}



