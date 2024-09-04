import fs from "fs/promises";
import os from "os";
import path from "path";
import { MockForgeSDK } from "../../../sdk/node/sdk.js";
import { createMockForgeSDKTests } from "../utils.js";

let tempDir: string;

createMockForgeSDKTests(
  async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "mock-forge-sdk-test-"));
    return new MockForgeSDK(tempDir);
  },
  async () => {
    if (tempDir.includes("mock-forge-sdk-test-")) {
      await fs.rm(tempDir, { recursive: true });
    }
  }
);
