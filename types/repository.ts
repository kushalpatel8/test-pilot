export interface ConnectedRepository {
  id: string;
  userId: string;
  githubRepositoryId: string;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  isConnected: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    testRuns: number;
  };
  latestRun?: {
    id: string;
    status: string;
    createdAt: Date;
    passedTests: number;
    failedTests: number;
    totalTests: number;
  } | null;
}

export interface RunChecksConfig {
  runLint: boolean;
  runTypeCheck: boolean;
  runUnitTests: boolean;
  runApiTests: boolean;
}
