import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Trophy, 
  Sliders, 
  Compass, 
  RefreshCw, 
  Clock, 
  MapPin, 
  Sparkles,
  Tv,
  HelpCircle,
  Activity,
  UserCheck,
  ShieldCheck,
  Award
} from "lucide-react";
import { SimulationState } from "./types";
import { StadiumMetrics } from "./components/StadiumMetrics";
import { OperationsTab } from "./components/OperationsTab";
import { FanTab } from "./components/FanTab";
import { CodeSprintModal } from "./components/CodeSprintModal";

export default function App() {
  const [activeTab, setActiveTab] = useState<"operations" | "fan">("operations");
  const [stadiumState, setStadiumState] = useState<SimulationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [isCodeSprintOpen, setIsCodeSprintOpen] = useState(false);

  // Periodically refresh current actual local time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial state from the Express backend
  const fetchStadiumState = async () => {
    try {
      const response = await fetch("/api/stadium/status");
      const data = await response.json();
      setStadiumState(data);
    } catch (error) {
      console.error("Failed to load stadium status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStadiumState();
    
    // Auto-step simulation slightly every 30 seconds to keep metrics changing/alive
    const interval = setInterval(() => {
      handleSimulateEvent("general_update");
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Dispatch interactive simulated state transitions
  const handleSimulateEvent = async (type: string, details?: any) => {
    try {
      const response = await fetch("/api/stadium/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: type, details }),
      });
      const updatedState = await response.json();
      setStadiumState(updatedState);
    } catch (error) {
      console.error("Simulation event trigger failed:", error);
    }
  };

  // Reset simulation back to defaults
  const handleResetSimulation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stadium/reset", { method: "POST" });
      const data = await response.json();
      setStadiumState(data.state);
    } catch (error) {
      console.error("Failed to reset simulator state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Broadcast tactical announcements to screens
  const handleBroadcastMessage = (message: string) => {
    if (stadiumState) {
      setStadiumState({
        ...stadiumState,
        stadiumMessage: message
      });
    }
  };

  if (isLoading || !stadiumState) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-cyan-400" />
        </div>
        <p className="text-slate-400 font-display text-sm font-semibold tracking-wide animate-pulse">
          Starting FIFA World Cup 2026 Core Operations Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      
      {/* Premium Header Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-900 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Logo / Title Pairings */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-600 to-blue-500 p-2 rounded-xl shadow-lg shadow-cyan-500/15">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-base sm:text-lg tracking-tight text-slate-100">
                  FIFA World Cup 2026 Stadium Console
                </h1>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-bold px-1.5 py-0.2 rounded border border-cyan-500/20">
                  Live SoFi Stadium
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                GenAI Operations Command Center & Fan Companion
              </p>
            </div>
          </div>

          {/* Time & Connectivity Widgets */}
          <div className="flex items-center gap-4 self-end sm:self-auto">
            {/* Live Clock */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800/80 rounded-xl px-3 py-1.5 shadow-inner">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs sm:text-sm font-mono font-bold text-slate-200">
                {currentTime || "21:15:20"} <span className="text-[10px] text-slate-500 font-normal">PDT</span>
              </span>
            </div>

            {/* Google Code Sprint Submission Trigger */}
            <button
              onClick={() => setIsCodeSprintOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/10 cursor-pointer"
              title="Google Code Sprint submission details"
            >
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Submit App</span>
            </button>

            {/* Quick Manual Refresh Indicator */}
            <button 
              onClick={fetchStadiumState}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Refresh stadium telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        
        {/* Primary View Selector & System Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/40 p-2 border border-slate-900 rounded-2xl">
          {/* Sub-navigation Toggles */}
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab("operations")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "operations"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Sliders className="w-4 h-4" />
              Stadium Control Center
            </button>
            <button
              onClick={() => setActiveTab("fan")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "fan"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Compass className="w-4 h-4" />
              Fan Assistant Mode
            </button>
          </div>

          {/* Quick System Health */}
          <div className="flex items-center gap-2.5 px-3 py-1 bg-slate-950/65 rounded-xl border border-slate-800/40 text-xs text-slate-400 self-start sm:self-auto font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse-ring shrink-0" />
            <span>Mundial Telemetry Status: <span className="text-cyan-400 font-bold">OPTIMAL</span></span>
          </div>
        </div>

        {/* Live Stadium Metrics Overview (Always visible on top of sub-tabs as a dashboard anchor) */}
        <StadiumMetrics 
          state={stadiumState} 
          onSimulateEvent={handleSimulateEvent}
        />

        {/* Dynamic Inner Tab Router */}
        <div className="pt-2">
          {activeTab === "operations" ? (
            <OperationsTab 
              state={stadiumState} 
              onSimulateEvent={handleSimulateEvent}
              onResetSimulation={handleResetSimulation}
              onBroadcastMessage={handleBroadcastMessage}
            />
          ) : (
            <FanTab 
              state={stadiumState}
            />
          )}
        </div>

      </main>

      {/* Standard Humble Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 mt-12 text-center text-slate-500 text-xs space-y-1 shrink-0">
        <p>⚽ FIFA World Cup 2026™ Operations & Spectator Intelligent Support Network</p>
        <p className="text-[10px] text-slate-600 font-mono">SoFi Stadium Command Console • Powered by Gemini 3.5 Flash & Full-Stack Node.js Architecture</p>
      </footer>

      {/* Code Sprint Helper Modal Overlay */}
      <CodeSprintModal 
        isOpen={isCodeSprintOpen} 
        onClose={() => setIsCodeSprintOpen(false)} 
      />

    </div>
  );
}
