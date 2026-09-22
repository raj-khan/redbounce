/** Level results (spec section 18). */
export type LevelResult = {
  levelId: string;
  completed: boolean;
  score: number;
  collectiblesFound: number;
  collectiblesTotal: number;
  deaths: number;
  completionTimeSeconds: number;
  objectives: string[];
  completedAt: number;
};
