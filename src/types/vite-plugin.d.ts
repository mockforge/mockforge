interface MockForgeOption {
  mockDataDir?: string;
  port?: number;
  host?: string;
}

export function mockForge(option?: MockForgeOption): any;
