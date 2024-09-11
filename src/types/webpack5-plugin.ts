interface MockForgeOption {
  mockDataDir?: string;
  port?: number;
}

declare function MockForgeWebpackPlugin(option: MockForgeOption): any;
