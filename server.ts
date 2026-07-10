import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure the Gemini API client is initialized server-side only
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is not defined. AI features will run in fallback mock mode.");
}

const app = express();
const PORT = 3000;

app.use(express.json());

// IN-MEMORY STADIUM OPERATIONAL STATE
interface Sector {
  id: string;
  name: string;
  sections: string;
  density: number; // 0 - 100
  capacity: number;
  currentFans: number;
  vibe: string;
}

interface Gate {
  id: string;
  name: string;
  status: "Open" | "Closed" | "Restricted";
  queueLength: number;
  processingRate: number; // fans/min
  avgWaitTime: number; // minutes
}

interface Concession {
  id: string;
  name: string;
  section: string;
  type: "Food" | "Drink" | "Merchandise" | "Restroom";
  waitTime: number; // minutes
  status: "Normal" | "Busy" | "Critical";
}

interface StaffMember {
  id: string;
  name: string;
  role: "Security" | "Medical" | "Crowd Control" | "Technical" | "Volunteer";
  status: "Idle" | "Dispatched" | "Standby";
  location: string;
}

interface Incident {
  id: string;
  type: "Medical" | "Security" | "Crowd Congestion" | "Technical" | "Concession Queue";
  title: string;
  location: string;
  severity: "High" | "Medium" | "Low";
  status: "Active" | "Responding" | "Resolved";
  description: string;
  timestamp: string;
}

interface SimulationState {
  matchStatus: "Pre-Match Rush" | "First Half" | "Halftime Crush" | "Second Half" | "Post-Match Outflow" | "Normal Play";
  overallOccupancy: number; // percentage
  temperature: number; // F
  incidents: Incident[];
  sectors: Sector[];
  gates: Gate[];
  concessions: Concession[];
  staff: StaffMember[];
  stadiumMessage: string;
}

// Default initial state for SoFi Stadium
let stadiumState: SimulationState = {
  matchStatus: "Pre-Match Rush",
  overallOccupancy: 88,
  temperature: 74,
  stadiumMessage: "Welcome to SoFi Stadium for the 2026 FIFA World Cup! Please proceed to your nearest designated gate.",
  sectors: [
    { id: "S1", name: "North Sector", sections: "100-105, 200-208, 300-310", density: 85, capacity: 18000, currentFans: 15300, vibe: "Enthusiastic (USA fans)" },
    { id: "S2", name: "East Sector", sections: "106-115, 209-218, 311-322", density: 70, capacity: 17000, currentFans: 11900, vibe: "High Energy (Mexico fans)" },
    { id: "S3", name: "South Sector", sections: "116-125, 219-228, 323-335", density: 92, capacity: 18000, currentFans: 16560, vibe: "Noisy (Canada fans)" },
    { id: "S4", name: "West Sector", sections: "126-135, 229-238, 336-348", density: 65, capacity: 17000, currentFans: 11050, vibe: "Focused & Calm" },
  ],
  gates: [
    { id: "G_A", name: "Gate A (North Entrance)", status: "Open", queueLength: 320, processingRate: 45, avgWaitTime: 7 },
    { id: "G_B", name: "Gate B (Northeast Entrance)", status: "Open", queueLength: 480, processingRate: 40, avgWaitTime: 12 },
    { id: "G_C", name: "Gate C (East Entrance)", status: "Restricted", queueLength: 680, processingRate: 20, avgWaitTime: 34 }, // Restricted due to scanner malfunction
    { id: "G_D", name: "Gate D (South Entrance)", status: "Open", queueLength: 290, processingRate: 50, avgWaitTime: 6 },
    { id: "G_E", name: "Gate E (Southwest Entrance)", status: "Open", queueLength: 150, processingRate: 45, avgWaitTime: 3 },
    { id: "G_F", name: "Gate F (West Entrance)", status: "Open", queueLength: 180, processingRate: 45, avgWaitTime: 4 },
  ],
  concessions: [
    { id: "C1", name: "Copa Bites (Tacos)", section: "Section 112", type: "Food", waitTime: 15, status: "Busy" },
    { id: "C2", name: "Maple Syrup & Grill", section: "Section 218", type: "Food", waitTime: 8, status: "Normal" },
    { id: "C3", name: "Stars & Stripes Pub", section: "Section 102", type: "Drink", waitTime: 22, status: "Critical" },
    { id: "C4", name: "Mundial Souvenirs", section: "Gate A Plaza", type: "Merchandise", waitTime: 18, status: "Busy" },
    { id: "C5", name: "Family Restrooms A", section: "Section 120", type: "Restroom", waitTime: 5, status: "Normal" },
    { id: "C6", name: "Family Restrooms B", section: "Section 235", type: "Restroom", waitTime: 14, status: "Busy" },
  ],
  staff: [
    { id: "ST_1", name: "Medical Team Alpha", role: "Medical", status: "Idle", location: "North Clinic" },
    { id: "ST_2", name: "Medical Team Beta", role: "Medical", status: "Idle", location: "South Clinic" },
    { id: "ST_3", name: "Security Squad 1", role: "Security", status: "Dispatched", location: "Gate C Entrance" },
    { id: "ST_4", name: "Security Squad 2", role: "Security", status: "Idle", location: "West Concourse" },
    { id: "ST_5", name: "Crowd Control Group A", role: "Crowd Control", status: "Idle", location: "Gate B" },
    { id: "ST_6", name: "Crowd Control Group B", role: "Crowd Control", status: "Dispatched", location: "Section 116 Concourse" },
    { id: "ST_7", name: "Technical Support Unit 1", role: "Technical", status: "Idle", location: "Main Server Room" },
    { id: "ST_8", name: "Volunteer Guides Team 5", role: "Volunteer", status: "Idle", location: "Gate D Information Desk" },
  ],
  incidents: [
    {
      id: "INC_1",
      type: "Technical",
      title: "Gate C Card Scanners Offline",
      location: "Gate C Entrance",
      severity: "High",
      status: "Active",
      description: "Network glitch caused 3 automated turnstiles to reject ticket barcodes. Queue has surged to 680+ fans.",
      timestamp: "21:05",
    },
    {
      id: "INC_2",
      type: "Crowd Congestion",
      title: "Concourse Bottleneck Section 112",
      location: "Section 112 (Near Copa Bites)",
      severity: "Medium",
      status: "Active",
      description: "Severe merging of food line queues and crowd foot traffic heading to seats in Section 110-115.",
      timestamp: "21:10",
    },
  ],
};

// SIMULATION ENGINE ENDPOINTS
app.get("/api/stadium/status", (req, res) => {
  res.json(stadiumState);
});

app.post("/api/stadium/reset", (req, res) => {
  stadiumState = {
    matchStatus: "Pre-Match Rush",
    overallOccupancy: 85,
    temperature: 74,
    stadiumMessage: "Welcome to SoFi Stadium for the 2026 FIFA World Cup! Please proceed to your nearest designated gate.",
    sectors: [
      { id: "S1", name: "North Sector", sections: "100-105, 200-208, 300-310", density: 85, capacity: 18000, currentFans: 15300, vibe: "Enthusiastic (USA fans)" },
      { id: "S2", name: "East Sector", sections: "106-115, 209-218, 311-322", density: 70, capacity: 17000, currentFans: 11900, vibe: "High Energy (Mexico fans)" },
      { id: "S3", name: "South Sector", sections: "116-125, 219-228, 323-335", density: 92, capacity: 18000, currentFans: 16560, vibe: "Noisy (Canada fans)" },
      { id: "S4", name: "West Sector", sections: "126-135, 229-238, 336-348", density: 65, capacity: 17000, currentFans: 11050, vibe: "Focused & Calm" },
    ],
    gates: [
      { id: "G_A", name: "Gate A (North Entrance)", status: "Open", queueLength: 320, processingRate: 45, avgWaitTime: 7 },
      { id: "G_B", name: "Gate B (Northeast Entrance)", status: "Open", queueLength: 480, processingRate: 40, avgWaitTime: 12 },
      { id: "G_C", name: "Gate C (East Entrance)", status: "Restricted", queueLength: 680, processingRate: 20, avgWaitTime: 34 },
      { id: "G_D", name: "Gate D (South Entrance)", status: "Open", queueLength: 290, processingRate: 50, avgWaitTime: 6 },
      { id: "G_E", name: "Gate E (Southwest Entrance)", status: "Open", queueLength: 150, processingRate: 45, avgWaitTime: 3 },
      { id: "G_F", name: "Gate F (West Entrance)", status: "Open", queueLength: 180, processingRate: 45, avgWaitTime: 4 },
    ],
    concessions: [
      { id: "C1", name: "Copa Bites (Tacos)", section: "Section 112", type: "Food", waitTime: 15, status: "Busy" },
      { id: "C2", name: "Maple Syrup & Grill", section: "Section 218", type: "Food", waitTime: 8, status: "Normal" },
      { id: "C3", name: "Stars & Stripes Pub", section: "Section 102", type: "Drink", waitTime: 22, status: "Critical" },
      { id: "C4", name: "Mundial Souvenirs", section: "Gate A Plaza", type: "Merchandise", waitTime: 18, status: "Busy" },
      { id: "C5", name: "Family Restrooms A", section: "Section 120", type: "Restroom", waitTime: 5, status: "Normal" },
      { id: "C6", name: "Family Restrooms B", section: "Section 235", type: "Restroom", waitTime: 14, status: "Busy" },
    ],
    staff: [
      { id: "ST_1", name: "Medical Team Alpha", role: "Medical", status: "Idle", location: "North Clinic" },
      { id: "ST_2", name: "Medical Team Beta", role: "Medical", status: "Idle", location: "South Clinic" },
      { id: "ST_3", name: "Security Squad 1", role: "Security", status: "Dispatched", location: "Gate C Entrance" },
      { id: "ST_4", name: "Security Squad 2", role: "Security", status: "Idle", location: "West Concourse" },
      { id: "ST_5", name: "Crowd Control Group A", role: "Crowd Control", status: "Idle", location: "Gate B" },
      { id: "ST_6", name: "Crowd Control Group B", role: "Crowd Control", status: "Dispatched", location: "Section 116 Concourse" },
      { id: "ST_7", name: "Technical Support Unit 1", role: "Technical", status: "Idle", location: "Main Server Room" },
      { id: "ST_8", name: "Volunteer Guides Team 5", role: "Volunteer", status: "Idle", location: "Gate D Information Desk" },
    ],
    incidents: [
      {
        id: "INC_1",
        type: "Technical",
        title: "Gate C Card Scanners Offline",
        location: "Gate C Entrance",
        severity: "High",
        status: "Active",
        description: "Network glitch caused 3 automated turnstiles to reject ticket barcodes. Queue has surged to 680+ fans.",
        timestamp: "21:05",
      },
      {
        id: "INC_2",
        type: "Crowd Congestion",
        title: "Concourse Bottleneck Section 112",
        location: "Section 112 (Near Copa Bites)",
        severity: "Medium",
        status: "Active",
        description: "Severe merging of food line queues and crowd foot traffic heading to seats in Section 110-115.",
        timestamp: "21:10",
      },
    ],
  };
  res.json({ success: true, state: stadiumState });
});

// Post an event trigger to dynamically mutate metrics
app.post("/api/stadium/simulate", (req, res) => {
  const { eventType, details } = req.body;

  switch (eventType) {
    case "halftime":
      stadiumState.matchStatus = "Halftime Crush";
      stadiumState.concessions.forEach((c) => {
        if (c.type === "Food" || c.type === "Drink") {
          c.waitTime = Math.floor(c.waitTime * 1.8 + 5);
          c.status = c.waitTime > 20 ? "Critical" : "Busy";
        } else if (c.type === "Restroom") {
          c.waitTime = Math.floor(c.waitTime * 2.2);
          c.status = c.waitTime > 15 ? "Critical" : "Busy";
        }
      });
      stadiumState.sectors.forEach((s) => {
        s.density = Math.min(100, Math.floor(s.density * 1.15));
      });
      stadiumState.stadiumMessage = "🚨 HALFTIME CRUSH IS IN EFFECT. Support concession kiosks are open at Sector 4 West Concourse. Avoid heavy lines in Sector 3.";
      break;

    case "rain_delay":
      stadiumState.temperature = 65;
      stadiumState.concessions.forEach((c) => {
        if (c.type === "Merchandise") {
          c.waitTime = Math.min(30, c.waitTime + 10);
          c.name = "Mundial Souvenirs & Ponchos";
          c.status = "Critical";
        }
      });
      stadiumState.sectors.forEach((s) => {
        s.vibe = s.vibe + " (Anxious - Rain Alert)";
      });
      // Add a medical or technical slip hazard incident
      stadiumState.incidents.push({
        id: `INC_${Date.now()}`,
        type: "Medical",
        title: "Slippery Deck Hazard Section 228",
        location: "Section 228 Concourse",
        severity: "Medium",
        status: "Active",
        description: "Sudden rain has caused slippery walking surfaces on outdoor stairwells. Crowds slowing down significantly.",
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      });
      stadiumState.stadiumMessage = "⛈️ WEATHER NOTICE: Heavy rain forecasted. Covered concourses may become crowded. Walk slowly on outdoor stairs.";
      break;

    case "match_end":
      stadiumState.matchStatus = "Post-Match Outflow";
      stadiumState.sectors.forEach((s) => {
        s.density = Math.max(10, Math.floor(s.density * 0.4));
      });
      stadiumState.gates.forEach((g) => {
        g.queueLength = Math.floor(g.queueLength * 2.5 + 200);
        g.avgWaitTime = Math.floor(g.queueLength / g.processingRate);
      });
      stadiumState.stadiumMessage = "⚽ THANK YOU FOR ATTENDING THE FIFA WORLD CUP 2026! Please follow directional signs to Ride-Share points and Metro Transit platforms.";
      break;

    case "dispatch_staff":
      const { staffId, location } = details;
      const sMember = stadiumState.staff.find((s) => s.id === staffId);
      if (sMember) {
        sMember.status = "Dispatched";
        sMember.location = location;
      }
      break;

    case "resolve_incident":
      const { incidentId } = details;
      stadiumState.incidents = stadiumState.incidents.map((inc) => {
        if (inc.id === incidentId) {
          // Resolve metrics associated
          if (inc.type === "Technical" && inc.location === "Gate C Entrance") {
            const gateC = stadiumState.gates.find((g) => g.id === "G_C");
            if (gateC) {
              gateC.status = "Open";
              gateC.processingRate = 45;
              gateC.queueLength = Math.max(50, gateC.queueLength - 300);
              gateC.avgWaitTime = Math.floor(gateC.queueLength / gateC.processingRate);
            }
          }
          return { ...inc, status: "Resolved" };
        }
        return inc;
      });
      break;

    default:
      // General dynamic updates over time
      stadiumState.gates.forEach((g) => {
        if (g.status === "Open" && g.queueLength > 20) {
          g.queueLength = Math.max(10, g.queueLength - Math.floor(g.processingRate * 0.8) + Math.floor(Math.random() * 20));
          g.avgWaitTime = Math.max(1, Math.floor(g.queueLength / g.processingRate));
        }
      });
      break;
  }

  res.json(stadiumState);
});

// GEN AI OPERATOR ASSISTANT ROUTE (With structured schema)
app.post("/api/gemini/operations-chat", async (req, res) => {
  const { query, state } = req.body;

  if (!ai) {
    // Elegant fallback simulation
    return res.json({
      recommendations: [
        {
          id: "FALLBACK-001",
          type: "crowd",
          title: "[MOCK API KEY] Crowd Diversion from Gate C",
          description: "Since no API Key is set or Gemini is loading, here is a fallback: Redirect Gate C inbound fans to Gate B and E. Broadcast map notifications through the fan app.",
          urgency: "high",
          impact: "Reduces Gate C wait time by 15 mins."
        },
        {
          id: "FALLBACK-002",
          type: "staff",
          title: "[MOCK API KEY] Dispatch Technical Unit 1",
          description: "Deploy Technical Support Unit 1 to Gate C turnstiles to address card barcode scanners offline.",
          urgency: "high",
          impact: "Restores processing rate back to normal (45 fans/min)."
        }
      ],
      staffDispatches: [
        {
          unit: "Technical Support Unit 1",
          destination: "Gate C Entrance",
          reason: "Repair barcode scanning hardware issue.",
          priority: "high"
        }
      ],
      stadiumMessage: "⚽ OPERATIONAL BROADCAST: Gate C is experiencing slight delays. Incoming fans are highly advised to use Gates B and E.",
      analysis: "This is a simulated response indicating that no GEMINI_API_KEY was found in environment. Please supply one in Secrets panel to unlock full intelligent routing and live plan synthesis."
    });
  }

  try {
    const prompt = `
You are the Executive GenAI Stadium Operations Strategist for the FIFA World Cup 2026 at SoFi Stadium.
Analyze the following current real-time stadium metrics and active incidents, then respond to the user's operational query:

CURRENT METRICS:
- Match Status: ${state.matchStatus}
- Occupancy: ${state.overallOccupancy}%
- Temperature: ${state.temperature}°F
- Sctors Status: ${JSON.stringify(state.sectors)}
- Gates Status: ${JSON.stringify(state.gates)}
- Concession/Services Status: ${JSON.stringify(state.concessions)}
- Available Staff: ${JSON.stringify(state.staff)}
- Active Incidents: ${JSON.stringify(state.incidents)}

OPERATOR QUERY: "${query}"

Return a highly structured JSON object detailing specific actions to mitigate bottlenecks, dispatch staff, broadcast notices, and optimize flow. Use the requested schema strictly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["recommendations", "staffDispatches", "stadiumMessage", "analysis"],
          properties: {
            analysis: {
              type: Type.STRING,
              description: "Brief executive analysis of current stadium bottlenecks or requirements based on the user's query."
            },
            recommendations: {
              type: Type.ARRAY,
              description: "List of tactical recommendations with type, urgency, description, and impact details.",
              items: {
                type: Type.OBJECT,
                required: ["id", "type", "title", "description", "urgency", "impact"],
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, description: "One of: crowd, staff, concession, security, safety" },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  urgency: { type: Type.STRING, description: "high, medium, or low" },
                  impact: { type: Type.STRING, description: "Quantitative or qualitative predicted impact on the simulator metrics." }
                }
              }
            },
            staffDispatches: {
              type: Type.ARRAY,
              description: "Specific personnel deployments to resolve active issues.",
              items: {
                type: Type.OBJECT,
                required: ["unit", "destination", "reason", "priority"],
                properties: {
                  unit: { type: Type.STRING },
                  destination: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  priority: { type: Type.STRING, description: "high, medium, or low" }
                }
              }
            },
            stadiumMessage: {
              type: Type.STRING,
              description: "The ideal stadium-wide public address or digital board broadcast script to direct fans."
            }
          }
        }
      }
    });

    const resultText = response.text ? response.text.trim() : "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Gemini Operations Planner error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GEN AI COPA FAN ASSISTANT ROUTE (With context awareness and Multi-lingual Translation Card)
app.post("/api/gemini/fan-chat", async (req, res) => {
  const { message, chatHistory, fanLocation } = req.body;

  if (!ai) {
    return res.json({
      reply: `⚽ **Copa Assist [MOCK MODE]**: Welcome! Since no Gemini API key is configured in this workspace, I am operating in sandbox mode. \n\n**SoFi Stadium Quick-Guide:**\n- **Nearest Entrance:** ${fanLocation || "Gate A"}\n- **Bag Policy:** Clear bags only (12x6x12 inches maximum size).\n- **Transport:** Metro C Line shuttle leaves continuously from Hawthorne/Lennox Station.\n- **Featured Concession:** Try the spectacular *Copa Bites Tacos* at Section 112!\n\nHow can I help you support your country today? Feel free to ask about directions, rules, or select a soccer phrase to translate into English, Spanish, or French!`,
      groundingSources: [],
    });
  }

  try {
    const systemPrompt = `
You are "Copa", the friendly, highly intelligent AI Concierge for fans attending the FIFA World Cup 2026 at SoFi Stadium (Los Angeles).
Your goal is to optimize their match day experience with real-time transit guides, bag policy details, custom concession finders, restroom waiting indicators, and multi-lingual services.

STADIUM CONTEXT:
- Venue: SoFi Stadium, Los Angeles, CA.
- FIFA World Cup 2026 Host Languages: English, Spanish, French.
- Fan's Current Location: ${fanLocation || "Not specified (assume Main Plaza)"}.
- Bag Policy: Clear bag policy strictly enforced (maximum size 12x6x12 inches). No large backpacks, coolers, or professional cameras.
- Concessions: Copa Bites (Tacos, Section 112), Maple Syrup & Grill (Section 218), Stars & Stripes Pub (Section 102), Mundial Souvenirs (Gate A Plaza).
- Transit: Free shuttle to Metro K and C line stations. Dedicated ride-share lots are at Lot N and Lot P.

Keep your tone welcoming, energetic, and helpful, like a premium World Cup host. If fans ask for translations, provide clean phonetic pronunciations in English, Spanish, and French, styled inside an elegant translation card format. Use markdown formatting beautifully. Always sign off with a cheerful sporty remark!`;

    // Reconstruct conversation history
    const contents = chatHistory ? chatHistory.map((ch: any) => ({
      role: ch.sender === "user" ? "user" : "model",
      parts: [{ text: ch.text }]
    })) : [];

    // Append the new query
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({
      reply: response.text || "I'm having trouble retrieving information right now, but please ask again!",
    });
  } catch (error: any) {
    console.error("Gemini Fan Assistant error:", error);
    res.status(500).json({ error: error.message });
  }
});

// VITE MIDDLEWARE AND SPA ROUTING SETUP
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FIFA 2026 Stadium Console server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
