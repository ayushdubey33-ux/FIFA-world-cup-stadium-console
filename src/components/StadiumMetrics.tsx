import React from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Flame, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Coffee, 
  ShieldAlert,
  Footprints,
  Sparkles
} from "lucide-react";
import { SimulationState } from "../types";

interface StadiumMetricsProps {
  state: SimulationState;
  onSimulateEvent: (type: string, details?: any) => void;
}

export const StadiumMetrics: React.FC<StadiumMetricsProps> = ({ state }) => {
  const activeIncidentsCount = state.incidents.filter((i) => i.status !== "Resolved").length;

  return (
    <div className="space-y-6">
      {/* Dynamic Stadium-Wide Message Banner - Re-styled as Immersive Intelligence Feed */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-slate-950 via-slate-900/40 to-slate-950 border border-slate-800 rounded-2xl p-5 overflow-hidden shadow-inner shadow-cyan-500/5"
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#06b6d4_0,_transparent_70%)]"></div>
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Sparkles className="w-20 h-20 text-cyan-400" />
        </div>
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="bg-cyan-950/40 text-cyan-400 p-2.5 rounded-xl border border-cyan-800/30 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-display">Live Stadium Broadcast Feed</span>
            <p className="text-slate-100 font-medium text-sm sm:text-base mt-1 tracking-tight leading-relaxed">
              "{state.stadiumMessage}"
            </p>
          </div>
        </div>
      </motion.div>

      {/* Top Level KPI Grid - Immersive Styling */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Match Day Phase */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4.5 flex items-center justify-between shadow-inner shadow-cyan-500/2">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Match Day Status</span>
            <span className="text-base sm:text-lg font-bold text-cyan-400 font-display tracking-tight uppercase">
              {state.matchStatus}
            </span>
          </div>
          <div className="bg-cyan-950/40 text-cyan-400 p-2.5 rounded-xl border border-cyan-800/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Attendance Occupancy */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4.5 flex items-center justify-between shadow-inner shadow-cyan-500/2">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Live Capacity</span>
            <span className="text-base sm:text-lg font-bold text-slate-100 font-display tracking-tight">
              {state.overallOccupancy}% <span className="text-xs text-slate-400 font-mono font-normal">({Math.floor(70000 * (state.overallOccupancy / 100)).toLocaleString()})</span>
            </span>
          </div>
          <div className="bg-blue-950/40 text-blue-400 p-2.5 rounded-xl border border-blue-800/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Ambient Temperature */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4.5 flex items-center justify-between shadow-inner shadow-cyan-500/2">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Climate Index</span>
            <span className="text-base sm:text-lg font-bold text-slate-100 font-display tracking-tight">
              {state.temperature}°F <span className="text-xs text-slate-400 font-normal">/ Outdoor</span>
            </span>
          </div>
          <div className="bg-amber-950/40 text-amber-400 p-2.5 rounded-xl border border-amber-800/20">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Active Incidents */}
        <div className={`bg-slate-900/60 border rounded-2xl p-4.5 flex items-center justify-between shadow-inner transition-colors ${
          activeIncidentsCount > 0 ? "border-rose-500/40 bg-rose-950/10 shadow-rose-500/5" : "border-slate-800 shadow-cyan-500/2"
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Active Incidents</span>
            <span className={`text-base sm:text-lg font-bold font-display tracking-tight ${
              activeIncidentsCount > 0 ? "text-rose-400 animate-pulse" : "text-slate-100"
            }`}>
              {activeIncidentsCount} Alerts active
            </span>
          </div>
          <div className={`p-2.5 rounded-xl border ${
            activeIncidentsCount > 0 ? "bg-rose-950/60 text-rose-400 border-rose-800/30" : "bg-slate-800/40 text-slate-400 border-slate-700/20"
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid of Main Sectors (Dynamic Density visualizers) */}
      <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 shadow-inner shadow-cyan-500/2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          Sectored Crowd Densities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {state.sectors.map((sector) => {
            const isHigh = sector.density >= 90;
            const isMedium = sector.density >= 75 && sector.density < 90;
            
            return (
              <div 
                key={sector.id} 
                className="bg-slate-900/40 border border-slate-800 rounded-xl p-4.5 space-y-3.5 relative overflow-hidden"
              >
                {/* Visual density warning glow */}
                {isHigh && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-500" />
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm sm:text-base">{sector.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Sect: {sector.sections}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isHigh ? "bg-rose-500/10 text-rose-400 border border-rose-800/30" :
                    isMedium ? "bg-amber-500/10 text-amber-400 border border-amber-800/30" : "bg-cyan-500/10 text-cyan-400 border border-cyan-800/30"
                  }`}>
                    {sector.density}% Density
                  </span>
                </div>

                {/* Progress Bar of density */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${sector.density}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${
                        isHigh ? "bg-gradient-to-r from-orange-500 to-rose-500" :
                        isMedium ? "bg-gradient-to-r from-yellow-500 to-amber-500" : "bg-gradient-to-r from-cyan-500 to-blue-500"
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>{sector.currentFans.toLocaleString()} Active</span>
                    <span>Cap: {(sector.capacity / 1000).toFixed(0)}k</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1.5 text-xs text-slate-400 italic">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                  <span className="truncate">Vibe: {sector.vibe}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gates and Concessions status (Two-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gates queue status (7 Columns) */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-inner shadow-cyan-500/2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-bold text-slate-100 font-display flex items-center gap-2 text-sm">
              <Footprints className="w-5 h-5 text-cyan-400" />
              FIFA Ticket Access Gates & queues
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Avg. Flow Rate</span>
          </div>

          <div className="space-y-3">
            {state.gates.map((gate) => {
              const isCongested = gate.avgWaitTime >= 20;
              const isRestricted = gate.status === "Restricted";
              
              return (
                <div 
                  key={gate.id}
                  className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {/* Status Dot */}
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full ${
                        isRestricted ? "bg-rose-500" :
                        isCongested ? "bg-amber-500" : "bg-cyan-500"
                      }`} />
                      <div className={`absolute -inset-1 rounded-full opacity-30 animate-pulse ${
                        isRestricted ? "bg-rose-500" :
                        isCongested ? "bg-amber-500" : "bg-cyan-500"
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 text-sm">{gate.name}</span>
                        <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.2 rounded uppercase ${
                          isRestricted ? "bg-rose-500/20 text-rose-300 border border-rose-800/25" : "bg-cyan-500/20 text-cyan-300 border border-cyan-800/25"
                        }`}>
                          {gate.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 font-mono">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>Line: {gate.queueLength} fans</span>
                        <span className="text-slate-600">•</span>
                        <span>Speed: {gate.processingRate}/min</span>
                      </div>
                    </div>
                  </div>

                  {/* Wait Time Display */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/40">
                    <span className="text-[10px] uppercase font-bold text-slate-500 sm:hidden">Est. Access Wait</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-4 h-4 ${isCongested ? "text-rose-400 animate-pulse" : "text-cyan-400"}`} />
                      <span className={`font-mono text-sm sm:text-base font-bold ${
                        isCongested ? "text-rose-400" : "text-slate-200"
                      }`}>
                        {gate.avgWaitTime} mins
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Food & Concession times (5 Columns) */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-inner shadow-cyan-500/2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-bold text-slate-100 font-display flex items-center gap-2 text-sm">
              <Coffee className="w-5 h-5 text-cyan-400" />
              Concessions Wait Times
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Live Load</span>
          </div>

          <div className="space-y-3">
            {state.concessions.map((c) => {
              const isCritical = c.status === "Critical";
              const isBusy = c.status === "Busy";
              
              return (
                <div 
                  key={c.id}
                  className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3 flex items-center justify-between hover:bg-slate-900/30 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-200 text-sm font-semibold">{c.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({c.section})</span>
                    </div>
                    <span className="text-xs text-slate-400 block capitalize">{c.type} Point</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded ${
                      isCritical ? "bg-rose-500/20 text-rose-400 border border-rose-800/25" :
                      isBusy ? "bg-amber-500/20 text-amber-400 border border-amber-800/25" : "bg-cyan-500/20 text-cyan-400 border border-cyan-800/25"
                    }`}>
                      {c.status}
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-200">
                      {c.waitTime}m
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
