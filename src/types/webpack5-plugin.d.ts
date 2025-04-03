interface MockForgeOption {
  mockDataDir?: string;
  port?: number;
  host?: string;
}

export function MockForgeWebpackPlugin(option?: MockForgeOption): any;
