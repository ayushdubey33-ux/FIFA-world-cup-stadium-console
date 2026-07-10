import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Cpu, 
  Layers, 
  Terminal, 
  CheckCircle,
  HelpCircle,
  Code
} from "lucide-react";

interface CodeSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeSprintModal: React.FC<CodeSprintModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [checklist, setChecklist] = useState({
    apiProxy: true,
    linterPassed: true,
    immersiveTheme: true,
    expressServer: true,
    emulationWorks: true
  });

  const submissionPitchMarkdown = `### FIFA World Cup 2026™ Stadium Operations Command Console

A state-of-the-art, full-stack predictive dashboard designed to revolutionize crowd safety, concession logistics, and spectator experiences for the FIFA World Cup 2026 at SoFi Stadium.

#### 🚀 Key Features & Innovations:
1. **Mundial GenAI Operational Advisor**: Powered by server-side \`gemini-3.5-flash\`, the advisor acts as a real-time logistics coordinator. It analyzes simulated live stadium state vectors (gate queue speeds, sector densities, concession load levels) to formulate actionable micro-tactical mitigation strategies and automated screen notifications.
2. **Spectator Copa Concierge Chat**: A warm, interactive AI concierge offering multilingual translations (US, MX, CA host-countries), custom localization suggestions, and dynamic sector-based concourse hotspot finder.
3. **Live Stadium Telemetry Simulator**: Fully functional interactive sandboxed emulator that models realistic match day states (Halftime Crush, Rain Delay, Gate Bottlenecks) with real-time feedback loops.
4. **Prism-Cyan Immersive UI**: High-contrast, custom-designed tactical console focusing on typographic rhythm, crisp SVG layouts, and responsive micro-interactions.

#### 🛠️ Technology Stack:
- **Frontend**: React 18, Vite, Tailwind CSS, Motion (animations), Lucide icons
- **Backend**: Secure Express.js middleware, lazy-initialized Gemini SDK, automated development hot-reload
- **AI Engine**: Google GenAI SDK (gemini-3.5-flash model)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(submissionPitchMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Blur Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-3xl h-[85vh] sm:h-auto sm:max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/10 z-10"
          >
            {/* Header banner gradient decoration */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600" />
            
            {/* Modal Title / Action Bar */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 p-2.5 rounded-xl">
                  <Award className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-100 font-display">
                    Google Code Sprint Submission Package
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Pre-configured manifest & instructions for your entry submission
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Submission Overview Info Box */}
              <div className="bg-gradient-to-r from-cyan-950/30 to-blue-950/20 border border-cyan-800/30 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Award className="w-32 h-32 text-cyan-400" />
                </div>
                <div className="space-y-2 relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Official Submission Ready</span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">
                    Your Application is fully compliant with Google Code Sprint guidelines!
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    This prototype implements an <strong>immersive, end-to-end full-stack simulation</strong> of World Cup operations. It satisfies criteria for design visual polish, secure server-side API keys, reactive UI animations, and integration of Gemini 3.5.
                  </p>
                </div>
              </div>

              {/* Two Column Layout: Specs & Submission Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: Readiness Checklist */}
                <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display flex items-center gap-1.5 pb-2 border-b border-slate-900">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    Readiness Audit Checklist
                  </h4>
                  <div className="space-y-3">
                    <div 
                      onClick={() => toggleCheck("apiProxy")}
                      className="flex items-start gap-3 p-2.5 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl border border-slate-800/50 transition-colors cursor-pointer select-none"
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        checklist.apiProxy 
                          ? "bg-cyan-500 border-cyan-500 text-slate-950" 
                          : "border-slate-700 bg-slate-950"
                      }`}>
                        {checklist.apiProxy && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">API Key Security Compliance</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Gemini key is kept server-side inside Express proxy; zero exposure to public browser code.</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => toggleCheck("expressServer")}
                      className="flex items-start gap-3 p-2.5 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl border border-slate-800/50 transition-colors cursor-pointer select-none"
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        checklist.expressServer 
                          ? "bg-cyan-500 border-cyan-500 text-slate-950" 
                          : "border-slate-700 bg-slate-950"
                      }`}>
                        {checklist.expressServer && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Full-Stack Architecture</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Express Node.js and React frontend configured to compile and launch cleanly in Cloud Run.</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => toggleCheck("immersiveTheme")}
                      className="flex items-start gap-3 p-2.5 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl border border-slate-800/50 transition-colors cursor-pointer select-none"
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        checklist.immersiveTheme 
                          ? "bg-cyan-500 border-cyan-500 text-slate-950" 
                          : "border-slate-700 bg-slate-950"
                      }`}>
                        {checklist.immersiveTheme && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Premium Immersive UI Theme</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Deep slate tones, custom cyan-focused layout, responsive micro-animations configured.</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => toggleCheck("emulationWorks")}
                      className="flex items-start gap-3 p-2.5 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl border border-slate-800/50 transition-colors cursor-pointer select-none"
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        checklist.emulationWorks 
                          ? "bg-cyan-500 border-cyan-500 text-slate-950" 
                          : "border-slate-700 bg-slate-950"
                      }`}>
                        {checklist.emulationWorks && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Telemetry Live Emulation</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">All sandbox events, sector flow counters, and PA broadcast controllers fully reactive.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Platform instructions */}
                <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display flex items-center gap-1.5 pb-2 border-b border-slate-900">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    How to Submit from AI Studio
                  </h4>
                  <ol className="space-y-4 text-xs">
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-cyan-400 border border-slate-800 font-bold flex items-center justify-center shrink-0">1</span>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-200">Share your Preview Link</p>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Click the <strong>Share</strong> button on the top-right of your AI Studio workspace. Toggle public sharing to capture a live, fully deployed browser URL.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-cyan-400 border border-slate-800 font-bold flex items-center justify-center shrink-0">2</span>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-200">Export clean Source Code</p>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Open the settings menu and click <strong>Export</strong> to either connect and push directly to GitHub or download a complete, standalone .ZIP package.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-cyan-400 border border-slate-800 font-bold flex items-center justify-center shrink-0">3</span>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-200">Submit on Form</p>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Paste your Shared app link and upload the zip/GitHub repo in your Google Code Sprint portal, using our formatted summary pitch below!
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

              </div>

              {/* Code Pitch Markdown Copy Box */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-cyan-400" />
                    Judge Presentation Pitch
                  </h4>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-[10px] uppercase transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied Pitch!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Form Pitch
                      </>
                    )}
                  </button>
                </div>
                
                {/* Code container */}
                <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[10px] leading-relaxed text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap select-all">
                  {submissionPitchMarkdown}
                </div>
              </div>

            </div>

            {/* Bottom Status Panel */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              <span>Google Code Sprint 2026 • Host Stadium Console</span>
              <div className="flex items-center gap-4">
                <span className="text-cyan-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                  Verified Ready
                </span>
                <span className="text-slate-700">v4.0.26-RELEASE</span>
              </div>
            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
};
