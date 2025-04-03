export interface CreateMockForgeServerOption {
  port?: number;
  host?: string;
  service?: MockForgeService;
}

export interface CreateMockForgeServerResult {
  port: number;
  stop: () => void;
}

export function createMockForgeServer(option: CreateMockForgeServerOption): Promise<CreateMockForgeServerResult>;
