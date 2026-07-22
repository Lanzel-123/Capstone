import React from 'react';

export default function LiveApp() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-[#D4A017]/40 selection:text-slate-900">
      <header className="border-b border-[#D4A017] bg-[#D4A017] text-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-wider text-slate-900">FORENSICDOC LIVE 2</h1>
            <p className="text-xs text-slate-800 font-mono">Municipal Document Integrity Registry • Reload Check</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto p-6 dashboard-grid">
        <section className="dashboard-left">
          <div className="bg-[#D4A017]/20 border border-[#D4A017] rounded-3xl p-6 shadow-sm shadow-[#D4A017]/20">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4 font-mono">1. Document Ingestion</h2>
            <label className="border-2 border-dashed border-[#D4A017] rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition group bg-[#D4A017]/15 hover:bg-[#D4A017]/20">
              <span className="text-base font-semibold text-slate-900">Upload Documents LIVE</span>
              <span className="text-sm text-slate-700 mt-2">Accepts PDF or DOCX files</span>
              <input type="file" accept=".pdf,.docx" className="hidden" />
            </label>
          </div>

          <div className="bg-[#D4A017]/10 border border-[#D4A017] rounded-3xl p-6 shadow-sm shadow-[#D4A017]/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 font-mono">Dashboard Explore</h2>
                <p className="text-sm text-slate-700 mt-2">Search, filter, and inspect events for forensic documents.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-3xl bg-[#D4A017] text-slate-900 px-5 py-2 text-sm font-bold">Apply</button>
                <button className="rounded-3xl bg-[#D4A017]/20 text-slate-900 px-5 py-2 text-sm font-bold border border-[#D4A017]">Reset</button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest text-slate-700 font-bold font-mono">Search Results Input</label>
                <input
                  placeholder="Type a keyword, filename, or anomaly"
                  className="w-full rounded-3xl border border-[#D4A017] bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest text-slate-700 font-bold font-mono">Status Filter</label>
                <select className="w-full rounded-3xl border border-[#D4A017] bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none">
                  <option>All</option>
                  <option>SECURE</option>
                  <option>SUSPICIOUS</option>
                  <option>HIGH RISK</option>
                </select>
              </div>
            </div>

            <div className="space-y-6 mt-6">
              <div className="space-y-3">
                <div className="text-[11px] uppercase tracking-widest text-slate-700 font-bold font-mono">Search Results</div>
                <div className="rounded-3xl border border-[#D4A017] bg-[#D4A017]/10 p-4 space-y-3">
                  <div className="rounded-3xl bg-[#D4A017]/20 p-4 text-sm text-slate-900 break-words">Manila_Procurement_Contract_2025_signed.pdf</div>
                  <div className="rounded-3xl bg-[#D4A017]/20 p-4 text-sm text-slate-900">City_Resolution_No_402.docx</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-[11px] uppercase tracking-widest text-slate-700 font-bold font-mono">Events</div>
                <div className="rounded-3xl border border-[#D4A017] bg-[#D4A017]/10 p-4 space-y-3">
                  <div className="rounded-3xl bg-[#D4A017]/20 p-4 text-sm text-slate-900">Dashboard ready for Explore mode.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-right">
          <div className="bg-[#D4A017]/20 border border-[#D4A017] rounded-3xl p-10 shadow-sm shadow-[#D4A017]/20 h-full flex flex-col justify-center">
            <div className="w-full">
              <h3 className="text-2xl font-bold text-slate-900 font-mono mb-4">Awaiting Document Ingestion</h3>
              <p className="text-base text-slate-700 leading-7">Choose a scenario on the left, or upload a PDF/DOCX for sandbox assessment.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
