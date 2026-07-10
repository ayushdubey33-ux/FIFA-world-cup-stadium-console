import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Send, 
  Map, 
  Languages, 
  Navigation, 
  Coffee, 
  Clock, 
  Compass, 
  Smile,
  Globe
} from "lucide-react";
import { SimulationState, ChatMessage } from "../types";

interface FanTabProps {
  state: SimulationState;
}

const PRESET_PHRASES = [
  { text: "Where is my seat?", category: "Navigation" },
  { text: "How do I get to SoFi Stadium from LAX?", category: "Transit" },
  { text: "What are the stadium bag policies?", category: "Rules" },
  { text: "Where can I get Copa Bites tacos?", category: "Food" }
];

const TRANSLATION_CARDS = [
  {
    phrase: "Goaaaalll!",
    english: "Goaaaalll!",
    spanish: "¡Gooooooool!",
    french: "But!",
    pronunciation: "Goh-oh-ohl / Bee-oot"
  },
  {
    phrase: "Where is the bathroom?",
    english: "Where is the restroom?",
    spanish: "¿Dónde están los baños?",
    french: "Où sont les toilettes?",
    pronunciation: "Don-deh ehs-tan lohs bah-nyos / Oo sohn ley twah-let"
  },
  {
    phrase: "Can I get some water?",
    english: "Can I have some water, please?",
    spanish: "¿Me da un agua, por favor?",
    french: "Puis-je avoir de l'eau, s'il vous plaît?",
    pronunciation: "Meh dah oon ah-gwah por fah-vor / Pwee-juh ah-vwar duh loh"
  },
  {
    phrase: "Long live football!",
    english: "Long live soccer!",
    spanish: "¡Que viva el fútbol!",
    french: "Vive le football!",
    pronunciation: "Keh bee-bah ehl foot-bohl / Weev luh foot-bal"
  }
];

export const FanTab: React.FC<FanTabProps> = ({ state }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "⚽ **¡Hola! Bonjour! Welcome to Copa Assist!** I'm your interactive AI Host for the 2026 FIFA World Cup here at SoFi Stadium.\n\nI can help you navigate to your seats, check real-time gate queues, find food stalls, and translate soccer chants. \n\n**Select your current stadium sector on the map** to localise your directions, or ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("S1"); // Default: North Sector
  const [isTyping, setIsTyping] = useState(false);
  const [activeTranslationIdx, setActiveTranslationIdx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const activeSectorObj = state.sectors.find(s => s.id === selectedSector);
      const sectorLabel = activeSectorObj ? `${activeSectorObj.name} (Sections ${activeSectorObj.sections})` : "General Plaza";

      const chatHistory = messages.slice(-10); // Send recent context

      const response = await fetch("/api/gemini/fan-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          chatHistory,
          fanLocation: sectorLabel
        })
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error("Failed to fetch chat response:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: "bot",
          text: "⚽ **Copa Assist Alert**: I'm experiencing some network connection issues. Rest assured SoFi Stadium services are fully operational. Please proceed directly to Gate A or Gate F for assistance!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Click handler on the interactive map
  const handleSectorClick = (sectorId: string) => {
    setSelectedSector(sectorId);
    const sectorObj = state.sectors.find((s) => s.id === sectorId);
    if (sectorObj) {
      // Add a quick system log into chat to notify user
      const infoMsg: ChatMessage = {
        id: `sys_${Date.now()}`,
        sender: "bot",
        text: `📍 *Location updated:* You are now viewing the **${sectorObj.name}** concourse. Copa is localized to help you near sections **${sectorObj.sections}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, infoMsg]);
    }
  };

  // Find nearby concessions based on current selected sector sections
  const getNearbyConcessions = () => {
    const activeSectorObj = state.sectors.find(s => s.id === selectedSector);
    if (!activeSectorObj) return [];
    
    // Sort concessions or grab ones matching sector vibe or section closeness
    if (selectedSector === "S1") {
      return state.concessions.filter(c => c.section.includes("102") || c.section.includes("Plaza") || c.type === "Restroom");
    } else if (selectedSector === "S2") {
      return state.concessions.filter(c => c.section.includes("112") || c.section.includes("218"));
    } else if (selectedSector === "S3") {
      return state.concessions.filter(c => c.section.includes("120") || c.section.includes("235"));
    } else {
      return state.concessions.filter(c => c.section.includes("235") || c.section.includes("102") || c.type === "Food");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left Column: Map & Local Amenities (7 Columns) */}
      <div className="xl:col-span-7 space-y-6">
        
        {/* Interactive Stadium Map Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-inner shadow-cyan-500/2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-bold text-slate-100 font-display flex items-center gap-2 text-sm sm:text-base">
              <Map className="w-5 h-5 text-cyan-400" />
              Interactive Concourse Hotspot Finder
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Click a sector to locate closest amenities</span>
          </div>

          {/* Styled SVG Interactive Stadium Layout */}
          <div className="relative bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-800/80">
            
            <div className="w-full max-w-[360px] aspect-square relative flex items-center justify-center">
              {/* Outer boundary of stadium */}
              <div className="absolute inset-0 rounded-full border border-slate-800/80 bg-slate-900/20 shadow-inner" />
              
              {/* Blueprint pitch in the middle */}
              <div className="w-24 h-16 bg-cyan-950/20 border border-cyan-800/40 rounded flex items-center justify-center rotate-45 relative overflow-hidden z-10 shadow-inner">
                {/* Midfield line */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-cyan-500/30" />
                <div className="w-6 h-6 border border-cyan-500/30 rounded-full" />
              </div>

              {/* Clickable Sector Wedges (S1 North, S2 East, S3 South, S4 West) */}
              
              {/* NORTH SECTOR (Top) */}
              <button
                onClick={() => handleSectorClick("S1")}
                className={`absolute top-4 left-1/4 right-1/4 h-20 rounded-t-full border transition-all cursor-pointer ${
                  selectedSector === "S1" 
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-inner shadow-cyan-500/10" 
                    : "bg-slate-900/45 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center mt-3">
                  <span className="text-xs font-bold font-display uppercase tracking-wider">North Sector</span>
                  <span className="text-[9px] font-mono opacity-80">Sections 100-110</span>
                </div>
              </button>

              {/* SOUTH SECTOR (Bottom) */}
              <button
                onClick={() => handleSectorClick("S3")}
                className={`absolute bottom-4 left-1/4 right-1/4 h-20 rounded-b-full border transition-all cursor-pointer ${
                  selectedSector === "S3" 
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-inner shadow-cyan-500/10" 
                    : "bg-slate-900/45 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center mb-3">
                  <span className="text-xs font-bold font-display uppercase tracking-wider">South Sector</span>
                  <span className="text-[9px] font-mono opacity-80">Sections 116-125</span>
                </div>
              </button>

              {/* EAST SECTOR (Right) */}
              <button
                onClick={() => handleSectorClick("S2")}
                className={`absolute right-4 top-1/4 bottom-1/4 w-20 rounded-r-full border transition-all cursor-pointer ${
                  selectedSector === "S2" 
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-inner shadow-cyan-500/10" 
                    : "bg-slate-900/45 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center pr-3 rotate-90">
                  <span className="text-xs font-bold font-display uppercase tracking-wider">East Sector</span>
                  <span className="text-[9px] font-mono opacity-80">Sections 106-115</span>
                </div>
              </button>

              {/* WEST SECTOR (Left) */}
              <button
                onClick={() => handleSectorClick("S4")}
                className={`absolute left-4 top-1/4 bottom-1/4 w-20 rounded-l-full border transition-all cursor-pointer ${
                  selectedSector === "S4" 
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-inner shadow-cyan-500/10" 
                    : "bg-slate-900/45 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center pl-3 -rotate-90">
                  <span className="text-xs font-bold font-display uppercase tracking-wider">West Sector</span>
                  <span className="text-[9px] font-mono opacity-80">Sections 126-135</span>
                </div>
              </button>
            </div>

            {/* Selected Sector Context Box */}
            <div className="w-full mt-4 bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Navigation className="w-4 h-4 text-cyan-400 animate-bounce" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-display">Active Localization Context</span>
                  <span className="text-slate-100 font-bold text-sm sm:text-base">
                    {state.sectors.find(s => s.id === selectedSector)?.name} Concourse
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono font-bold bg-slate-950 px-2.5 py-1 border border-slate-800 rounded text-cyan-400">
                  Vibe: {state.sectors.find(s => s.id === selectedSector)?.vibe.split(" ")[0] || "Excited"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Amenities details based on active sector */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-inner shadow-cyan-500/2 space-y-4">
          <h3 className="font-bold text-slate-100 font-display flex items-center gap-2 pb-2 border-b border-slate-800 text-sm sm:text-base">
            <Compass className="w-5 h-5 text-cyan-400" />
            Amenities Closest to your Section
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {getNearbyConcessions().map((c) => (
              <div 
                key={c.id}
                className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3.5 flex items-center justify-between hover:bg-slate-900/20 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-slate-200 text-xs sm:text-sm">{c.name}</span>
                  </div>
                  <span className="text-xs text-slate-400 block font-mono">Located near {c.section}</span>
                </div>
                
                <div className="text-right space-y-1 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 block border border-slate-800">
                    {c.type}
                  </span>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span className="font-mono text-xs font-bold text-slate-100">{c.waitTime}m wait</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: AI Assistant Chat & Translation helper (5 Columns) */}
      <div className="xl:col-span-5 space-y-6">
        
        {/* Chat box container */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-inner shadow-cyan-500/5 flex flex-col h-[520px]">
          {/* Chat header */}
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-cyan-950/40 flex items-center justify-center text-cyan-400 border border-cyan-800/30">
                  <Smile className="w-5 h-5 animate-pulse" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-cyan-500 rounded-full border border-slate-900" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm sm:text-base font-display">Copa Concierge</h3>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Online • Host AI</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">SoFi Stadium Guide</span>
          </div>

          {/* Quick presets for rapid chat interaction */}
          <div className="py-2.5 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0 border-b border-slate-800/40">
            {PRESET_PHRASES.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(phrase.text)}
                className="text-[10px] shrink-0 px-2.5 py-1.5 bg-slate-950/70 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/20 rounded-lg text-slate-300 transition-colors cursor-pointer"
              >
                {phrase.text}
              </button>
            ))}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div 
                  key={msg.id}
                  className={`flex ${isBot ? "justify-start" : "justify-end"} animate-fade-in`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 ${
                    isBot 
                      ? "bg-slate-950/60 text-slate-100 border border-slate-800/80 rounded-tl-none" 
                      : "bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-semibold rounded-tr-none shadow-lg shadow-cyan-500/10"
                  }`}>
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                    <span className={`text-[9px] block text-right font-mono ${
                      isBot ? "text-slate-500" : "text-slate-950/60"
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input text form */}
          <div className="pt-3 border-t border-slate-800 shrink-0 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Copa about transit, food close by, rules..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage(inputValue);
              }}
              className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2 outline-none focus:border-cyan-500/50 text-xs sm:text-sm"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim()}
              className="p-2.5 bg-cyan-500 text-slate-950 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl hover:bg-cyan-400 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Translation Card Helper */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-inner shadow-cyan-500/2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-bold text-slate-100 font-display flex items-center gap-2 text-sm sm:text-base">
              <Languages className="w-5 h-5 text-cyan-400" />
              FIFA 2026 Multilingual Phrase Book
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono font-semibold uppercase">US • MX • CA</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {TRANSLATION_CARDS.map((card, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTranslationIdx(activeTranslationIdx === idx ? null : idx)}
                className={`p-3 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
                  activeTranslationIdx === idx 
                    ? "bg-cyan-500/10 border-cyan-500/40" 
                    : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-slate-200 font-bold text-xs sm:text-sm">{card.phrase}</span>
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-500 block">Click to reveal pronunciations</span>
                
                {activeTranslationIdx === idx && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300"
                  >
                    <div><span className="font-semibold text-[10px] text-blue-400 uppercase">English:</span> {card.english}</div>
                    <div><span className="font-semibold text-[10px] text-amber-400 uppercase">Spanish:</span> {card.spanish}</div>
                    <div><span className="font-semibold text-[10px] text-rose-400 uppercase">French:</span> {card.french}</div>
                    <div className="pt-1 text-[10px] text-slate-500 italic">Pronounce: {card.pronunciation}</div>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
