interface MockForgeOption {
  mockDataDir?: string;
  port?: number;
}

declare function mockForge(option: MockForgeOption): any;
