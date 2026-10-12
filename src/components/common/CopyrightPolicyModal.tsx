import React from 'react';
import { X, ShieldCheck, FileText, Scale, CheckCircle2 } from 'lucide-react';

interface CopyrightPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CopyrightPolicyModal: React.FC<CopyrightPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0B1220] p-6 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Copyright &amp; Intellectual Property Policy</h3>
              <p className="text-xs text-slate-400">EcoRoute AI &mdash; Waste Collection Optimizer &middot; Effective 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Policy Content */}
        <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-slate-300 leading-relaxed">
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span>1. Ownership &amp; Proprietary Rights</span>
            </h4>
            <p>
              All software components, source code, heuristic routing algorithms, scoring formulas, user interface
              designs, graphics, and documentation embodied in <strong>EcoRoute AI</strong> are the intellectual property
              of the EcoRoute AI development team and are protected under Indian and international copyright, trademark,
              and intellectual property laws.
            </p>
            <p className="text-slate-400 font-mono text-[11px]">
              &copy; 2026 EcoRoute AI. All rights reserved.
            </p>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>2. Academic &amp; Demonstration License</span>
            </h4>
            <p>
              EcoRoute AI is presented as an academic research prototype and collegiate hackathon project. Evaluators,
              judges, municipal reviewers, and conference attendees are granted a revocable, non-exclusive license to test,
              review, and interact with the demonstration platform strictly for evaluation, research, and non-commercial assessment.
            </p>
            <p>
              Unauthorized commercial exploitation, re-licensing, sub-licensing, mass extraction, or mirror distribution
              of the underlying routing engines without prior written authorization is prohibited.
            </p>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-400" />
              <span>3. Third-Party Trademarks &amp; Open-Source Attributions</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>
                <strong>OpenStreetMap &amp; Leaflet:</strong> Cartographic data is &copy; OpenStreetMap contributors, licensed
                under the Open Database License (ODbL). Map rendering components use the Leaflet open-source library.
              </li>
              <li>
                <strong>Supabase:</strong> Supabase, its APIs, and associated branding are trademarks of Supabase, Inc.
              </li>
              <li>
                <strong>Google:</strong> Google and the Google OAuth mark are registered trademarks of Google LLC.
              </li>
              <li>
                <strong>Lucide Icons &amp; Recharts:</strong> Icon assets and charting modules are distributed under their respective open-source MIT licenses.
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-white">4. Simulated Data Disclaimer</h4>
            <p>
              Sensor readings, fill percentages, and coordinate sets in the Hyderabad IT corridor demonstration are
              synthesized simulation values created for algorithmic testing and UI demonstration. They do not claim
              live telematics or proprietary civic municipal telemetry from the Greater Hyderabad Municipal Corporation (GHMC).
            </p>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-white">5. Copyright Inquiries &amp; DMCA Compliance</h4>
            <p>
              If you believe any content or code contained within this prototype infringes upon a copyright or intellectual
              property right you own or control, please submit an infringement notice including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Exact location / file identifier within the EcoRoute AI application.</li>
              <li>Sufficient contact information (name, organization, email, and phone number).</li>
            </ul>
            <p className="mt-2 text-[11px] text-slate-400">
              Direct inquiries to the project maintainers via the AI Studio submission portal or official repository.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
          <span className="text-[11px] text-slate-500 font-mono">
            EcoRoute AI Legal &middot; Policy Version 1.2
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
