export interface Sector {
  id: string;
  name: string;
  sections: string;
  density: number; // 0 - 100
  capacity: number;
  currentFans: number;
  vibe: string;
}

export interface Gate {
  id: string;
  name: string;
  status: "Open" | "Closed" | "Restricted";
  queueLength: number;
  processingRate: number;
  avgWaitTime: number;
}

export interface Concession {
  id: string;
  name: string;
  section: string;
  type: "Food" | "Drink" | "Merchandise" | "Restroom";
  waitTime: number;
  status: "Normal" | "Busy" | "Critical";
}

export interface StaffMember {
  id: string;
  name: string;
  role: "Security" | "Medical" | "Crowd Control" | "Technical" | "Volunteer";
  status: "Idle" | "Dispatched" | "Standby";
  location: string;
}

export interface Incident {
  id: string;
  type: "Medical" | "Security" | "Crowd Congestion" | "Technical" | "Concession Queue";
  title: string;
  location: string;
  severity: "High" | "Medium" | "Low";
  status: "Active" | "Responding" | "Resolved";
  description: string;
  timestamp: string;
}

export interface SimulationState {
  matchStatus: "Pre-Match Rush" | "First Half" | "Halftime Crush" | "Second Half" | "Post-Match Outflow" | "Normal Play";
  overallOccupancy: number;
  temperature: number;
  stadiumMessage: string;
  sectors: Sector[];
  gates: Gate[];
  concessions: Concession[];
  staff: StaffMember[];
  incidents: Incident[];
}

export interface Recommendation {
  id: string;
  type: "crowd" | "staff" | "concession" | "security" | "safety";
  title: string;
  description: string;
  urgency: "high" | "medium" | "low";
  impact: string;
  executed?: boolean;
}

export interface StaffDispatchRecommendation {
  unit: string;
  destination: string;
  reason: string;
  priority: "high" | "medium" | "low";
  executed?: boolean;
}

export interface GenAIPlan {
  analysis: string;
  recommendations: Recommendation[];
  staffDispatches: StaffDispatchRecommendation[];
  stadiumMessage: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  isTranslation?: boolean;
  translations?: {
    phrase: string;
    english: string;
    spanish: string;
    french: string;
    pronunciation: string;
  };
}
