import fs from "fs/promises";
import os from "os";
import path from "path";
import { createMockForgeServer } from "../../../server/node/server.js";
import { createMockForgeSDKTests } from "../../createMockForgeSDKTests.js";
import { BrowserMockForgeStateService } from "../../../server/browser/service.js";

let tempDir: string;

createMockForgeSDKTests(
  async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "mock-forge-sdk-test-"));
    const port = await createMockForgeServer({
      baseDir: tempDir,
    });
    return new BrowserMockForgeStateService("http://localhost:" + port);
  },
  async () => {
    if (tempDir.includes("mock-forge-sdk-test-")) {
      await fs.rm(tempDir, { recursive: true });
    }
  }
);
