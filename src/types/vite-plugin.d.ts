interface MockForgeOption {
  mockDataDir?: string;
  port?: number;
}

export function mockForge(option?: MockForgeOption): any;
