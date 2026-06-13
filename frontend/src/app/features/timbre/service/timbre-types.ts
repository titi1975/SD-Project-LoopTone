export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  audioName?: string;
  analysisSummary?: string;
  adjustments?: string[];
  missingElements?: string[];
  createdAt: string;
};

export type TimbreProject = {
  id: string;
  title: string;
  artist: string;
  song: string;
  instrument: string;
  equipmentId: string;
  analysisSummary: string;
  adjustments: string[];
  missingElements: string[];
  messages?: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

export type TimbreAnalysisResponse = {
  analysisSummary: string;
  adjustments: string[];
  missingElements: string[];
};
