import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  AlertTriangle, 
  Send, 
  Cpu, 
  CheckCircle, 
  RefreshCw, 
  UserCheck, 
  Tv, 
  SlidersHorizontal,
  CloudRain,
  Flag,
  Coffee,
  ListRestart,
  Activity,
  Play,
  Check,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { SimulationState, GenAIPlan, Recommendation, StaffDispatchRecommendation } from "../types";

interface OperationsTabProps {
  state: SimulationState;
  onSimulateEvent: (type: string, details?: any) => void;
  onResetSimulation: () => void;
  onBroadcastMessage: (msg: string) => void;
}

const PRESET_QUERIES = [
  "Draft safety protocols for the reported slipperiness in Section 228 and formulate crowd redirection.",
  "Gate C network card scanners are offline. Formulate an entrance redirection and staff dispatch plan.",
  "Stars & Stripes Pub (Section 102) queues are critical. Recommend tactical pricing or staff dispatching."
];

export const OperationsTab: React.FC<OperationsTabProps> = ({ 
  state, 
  onSimulateEvent, 
  onResetSimulation,
  onBroadcastMessage
}) => {
  const [operatorQuery, setOperatorQuery] = useState("");
  const [isAiPlanning, setIsAiPlanning] = useState(false);
  const [aiPlan, setAiPlan] = useState<GenAIPlan | null>(null);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  const fetchGenAIPlan = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsAiPlanning(true);
    setAiPlan(null);
    setExecutionMessage(null);

    try {
      const response = await fetch("/api/gemini/operations-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText, state }),
      });
      const data = await response.json();
      setAiPlan(data);
    } catch (error) {
      console.error("Failed to generate AI plan:", error);
    } finally {
      setIsAiPlanning(false);
    }
  };

  const handleExecuteRecommendation = (rec: Recommendation) => {
    // Dynamically apply recommendation to simulator state
    if (rec.type === "crowd") {
      // Simulate crowd redirecting
      onSimulateEvent("general_update", { msg: "Crowd reroute initiated." });
    } else if (rec.type === "staff") {
      // Dispatch a standby or idle staff member to this area
      const idleStaff = state.staff.find((s) => s.status === "Idle");
      if (idleStaff) {
        onSimulateEvent("dispatch_staff", { staffId: idleStaff.id, location: rec.title });
      }
    }
    
    // Mark as executed locally
    if (aiPlan) {
      const updatedRecs = aiPlan.recommendations.map((r) => 
        r.id === rec.id ? { ...r, executed: true } : r
      );
      setAiPlan({ ...aiPlan, recommendations: updatedRecs });
    }

    setExecutionMessage(`Tactical Action Executed: "${rec.title}"`);
    setTimeout(() => setExecutionMessage(null), 3000);
  };

  const handleExecuteDispatch = (dispatch: StaffDispatchRecommendation, index: number) => {
    // Find matching staff role or unit
    const matchingStaff = state.staff.find(
      (s) => s.role.toLowerCase() === dispatch.unit.toLowerCase().replace("team", "").replace("squad", "").trim() || s.status === "Idle"
    );

    if (matchingStaff) {
      onSimulateEvent("dispatch_staff", { staffId: matchingStaff.id, location: dispatch.destination });
    }

    if (aiPlan) {
      const updatedDispatches = [...aiPlan.staffDispatches];
      updatedDispatches[index] = { ...updatedDispatches[index], executed: true };
      setAiPlan({ ...aiPlan, staffDispatches: updatedDispatches });
    }

    setExecutionMessage(`Dispatched: ${dispatch.unit} ➡️ ${dispatch.destination}`);
    setTimeout(() => setExecutionMessage(null), 3000);
  };

  const handleBroadcastToScreens = () => {
    if (aiPlan?.stadiumMessage) {
      onBroadcastMessage(aiPlan.stadiumMessage);
      setExecutionMessage("Broadcast message updated on stadium monitors!");
      setTimeout(() => setExecutionMessage(null), 3000);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Simulation Controls & Incident Board (Left Column: 5 Cols) */}
      <div className="xl:col-span-5 space-y-6">
        {/* Interactive Event Simulator */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-inner shadow-cyan-500/2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-bold text-slate-100 font-display flex items-center gap-2 text-sm sm:text-base">
              <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
              Event Simulation Sandbox
            </h3>
            <button 
              onClick={onResetSimulation}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 hover:border-cyan-500/30 transition-colors"
            >
              <ListRestart className="w-3.5 h-3.5" />
              Reset State
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Trigger dynamic simulated event scenarios to see queues, densities, and incident reports change. Use the AI Advisor to resolve bottlenecks!
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => onSimulateEvent("halftime")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                state.matchStatus === "Halftime Crush"
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500"
                  : "bg-slate-950/70 text-slate-300 border-slate-800 hover:border-cyan-500/30 hover:bg-slate-950"
              }`}
            >
              <Coffee className="w-4 h-4" />
              Halftime Crush
            </button>

            <button
              onClick={() => onSimulateEvent("rain_delay")}
              className="flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold uppercase tracking-wider bg-slate-950/70 text-slate-300 border-slate-800 hover:border-cyan-500/30 hover:bg-slate-950 transition-all cursor-pointer"
            >
              <CloudRain className="w-4 h-4" />
              Trigger Rain Delay
            </button>

            <button
              onClick={() => onSimulateEvent("match_end")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                state.matchStatus === "Post-Match Outflow"
                  ? "bg-rose-500/20 text-rose-400 border-rose-500"
                  : "bg-slate-950/70 text-slate-300 border-slate-800 hover:border-rose-500/30 hover:bg-slate-950"
              }`}
            >
              <Flag className="w-4 h-4" />
              Match Whistle (Exit)
            </button>

            <button
              onClick={() => onSimulateEvent("general_update")}
              className="flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold uppercase tracking-wider bg-slate-950/70 text-slate-300 border-slate-800 hover:border-cyan-500/30 hover:bg-slate-950 transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              Step simulation
            </button>
          </div>
        </div>

        {/* Live Operational Incidents */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-inner shadow-cyan-500/2 space-y-4">
          <h3 className="font-bold text-slate-100 font-display flex items-center gap-2 pb-2 border-b border-slate-800 text-sm sm:text-base">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Active Operations Incidents
          </h3>

          {state.incidents.length === 0 ? (
            <div className="text-center py-6 bg-slate-950/35 rounded-xl border border-dashed border-slate-800">
              <ShieldCheck className="w-8 h-8 text-cyan-500 mx-auto opacity-70 mb-2" />
              <p className="text-xs text-slate-300 font-semibold">Stadium fully secure</p>
              <p className="text-[11px] text-slate-500 mt-0.5">No critical logs reported</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {state.incidents.map((incident) => {
                const isHigh = incident.severity === "High";
                const isResolved = incident.status === "Resolved";
                
                return (
                  <div 
                    key={incident.id}
                    className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${
                      isResolved 
                        ? "bg-slate-950/20 border-slate-900 opacity-60" 
                        : isHigh 
                          ? "bg-rose-950/10 border-rose-500/30" 
                          : "bg-amber-950/10 border-amber-500/30"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 text-xs sm:text-sm">{incident.title}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded shrink-0 ${
                            isResolved ? "bg-slate-800 text-slate-400" : isHigh ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {incident.severity}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{incident.location} • {incident.timestamp}</span>
                      </div>
                      
                      {!isResolved && (
                        <button
                          onClick={() => onSimulateEvent("resolve_incident", { incidentId: incident.id })}
                          className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/30 hover:border-cyan-500 text-cyan-400 rounded transition-all cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {incident.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Command Console (Right Column: 7 Cols) */}
      <div className="xl:col-span-7 space-y-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-inner shadow-cyan-500/5 flex flex-col h-full min-h-[500px]">
          {/* Header */}
          <div className="flex justify-between items-start pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-slate-100 font-display flex items-center gap-2 text-sm sm:text-base">
                <Cpu className="w-5 h-5 text-cyan-400" />
                Mundial GenAI Operational Advisor
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                FIFA Stadium logistics coordinator. Enter questions or tactical incident alerts.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                gemini-3.5-flash
              </span>
            </div>
          </div>

          {/* Quick Query presets */}
          <div className="py-3 flex flex-wrap gap-2">
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setOperatorQuery(preset);
                  fetchGenAIPlan(preset);
                }}
                className="text-[11px] text-left px-2.5 py-1.5 bg-slate-900/40 hover:bg-slate-900 hover:text-cyan-300 rounded-lg border border-slate-800/80 hover:border-cyan-500/20 transition-all cursor-pointer text-slate-300 line-clamp-1"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Chat Form */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={operatorQuery}
              onChange={(e) => setOperatorQuery(e.target.value)}
              placeholder="e.g., Gate C scanner offline. Provide mitigation flow..."
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchGenAIPlan(operatorQuery);
              }}
              className="flex-1 bg-slate-950 text-slate-100 text-xs sm:text-sm border border-slate-800 hover:border-slate-700 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 outline-none transition-colors"
            />
            <button
              onClick={() => fetchGenAIPlan(operatorQuery)}
              disabled={isAiPlanning || !operatorQuery.trim()}
              className="px-4 bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {isAiPlanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Generate Plan
                </>
              )}
            </button>
          </div>

          {/* Execution feedback toast message */}
          {executionMessage && (
            <div className="bg-cyan-500 text-slate-950 font-semibold text-xs py-2 px-3 rounded-lg shadow-md mb-4 animate-fade-in flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              {executionMessage}
            </div>
          )}

          {/* AI Plan Render Board */}
          <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4 pr-1">
            {isAiPlanning ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-display">
                  Gemini analyzing stadium vectors and queue densities...
                </p>
              </div>
            ) : aiPlan ? (
              <div className="space-y-4 animate-fade-in">
                {/* Executive Summary */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-display">
                    Executive Operational Assessment
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {aiPlan.analysis}
                  </p>
                </div>

                {/* Recommendations */}
                {aiPlan.recommendations && aiPlan.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-display">
                      Tactical Recommendations
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {aiPlan.recommendations.map((rec) => (
                        <div 
                          key={rec.id}
                          className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-800 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-slate-200">{rec.title}</span>
                              <span className={`text-[9px] font-bold px-1.5 rounded uppercase ${
                                rec.urgency === "high" ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                              }`}>
                                {rec.urgency}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">{rec.description}</p>
                            <p className="text-[11px] text-cyan-400 font-semibold font-mono">Impact: {rec.impact}</p>
                          </div>

                          <button
                            onClick={() => handleExecuteRecommendation(rec)}
                            disabled={rec.executed}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                              rec.executed 
                                ? "bg-slate-800 text-slate-500" 
                                : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                            }`}
                          >
                            {rec.executed ? "Executed" : "Execute"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Staff Deployment Orders */}
                {aiPlan.staffDispatches && aiPlan.staffDispatches.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-display">
                      Staff Deployment Dispatch Orders
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {aiPlan.staffDispatches.map((dispatch, idx) => (
                        <div 
                          key={idx}
                          className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-3 flex justify-between items-center gap-2 hover:border-slate-800 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-200 text-xs block">{dispatch.unit}</span>
                            <span className="text-[11px] text-slate-400 font-mono">Destination: {dispatch.destination}</span>
                            <span className="text-[10px] text-slate-500 block leading-tight">{dispatch.reason}</span>
                          </div>

                          <button
                            onClick={() => handleExecuteDispatch(dispatch, idx)}
                            disabled={dispatch.executed}
                            className={`p-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                              dispatch.executed 
                                ? "text-slate-600 bg-slate-900" 
                                : "text-cyan-400 hover:text-slate-950 bg-cyan-500/10 hover:bg-cyan-500"
                            }`}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Broadcast Script */}
                {aiPlan.stadiumMessage && (
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-display">
                        Public Address / Screen Message Draft
                      </h4>
                      <button
                        onClick={handleBroadcastToScreens}
                        className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-cyan-500/15 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 rounded transition-all cursor-pointer border border-cyan-500/20"
                      >
                        Push to Monitors
                      </button>
                    </div>
                    <blockquote className="text-xs text-slate-300 italic border-l-2 border-cyan-500 pl-3">
                      "{aiPlan.stadiumMessage}"
                    </blockquote>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-2 border border-dashed border-slate-800/60 rounded-2xl bg-slate-950/20">
                <HelpCircle className="w-12 h-12 mx-auto text-slate-600 opacity-70" />
                <p className="text-xs sm:text-sm font-semibold font-display">No plan generated yet</p>
                <p className="text-xs max-w-xs mx-auto">
                  Select a scenario preset above or type a command to ask Gemini to generate an operational mitigation strategy.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
