interface MockForgeOption {
  mockDataDir?: string;
  port?: number;
}

export function MockForgeWebpackPlugin(option?: MockForgeOption): any;
