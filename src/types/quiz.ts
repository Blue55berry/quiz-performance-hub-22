
export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQuestion {
  id: number;
  language: string;
  text: string;
  options: MCQOption[];
  correctAnswer: string;
}

export interface CodingQuestion {
  id: number;
  language: string;
  text: string;
  starterCode: string;
  testCases: string;
  sampleSolution?: string;
}

export interface TestResult {
  passed: boolean;
  message: string;
  output?: string;
  expected?: string;
  details?: string[];
}
