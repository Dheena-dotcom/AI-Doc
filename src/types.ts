export interface DiagnosisResult {
  potentialConditions: {
    name: string;
    likelihood: 'Low' | 'Moderate' | 'High';
    description: string;
    commonSymptoms: string[];
  }[];
  severity: 'Low' | 'Medium' | 'High' | 'Emergency';
  recommendation: string;
  disclaimer: string;
}

export interface SymptomEntry {
  id: string;
  timestamp: number;
  symptoms: string;
  result: DiagnosisResult;
}
