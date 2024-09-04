import express, { Request, Response } from "express";
import { createServer } from "node:http";
import { MockForgeStateService } from "./service.js";
import { RPCRequestBody, RPCResponse } from "./common/rpc.js";

interface createMockForgeServerOption {
  baseDir: string;
}

export function createMockForgeServer(option: createMockForgeServerOption) {
  const app = express();
  const server = createServer(app);
  app.use(express.json());

  const mockForgeStateService = new MockForgeStateService(option.baseDir);
  app.post("/rpc", async (req: Request, res: Response) => {
    const requestBody = req.body as RPCRequestBody;
    const { method, args, clientId } = requestBody;

    let response: RPCResponse;

    try {
      const serviceMethod = mockForgeStateService[
        method as keyof MockForgeStateService
      ] as Function;
      if (typeof serviceMethod !== "function") {
        throw new Error(`Unknown method: ${method}`);
      }
      const result = await serviceMethod.apply(mockForgeStateService, args);
      response = {
        success: true,
        data: result,
        clientId,
      };
    } catch (error) {
      console.error(`Error processing RPC request: ${error}`);
      response = {
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
        clientId,
      };
    }
    res.json(response);
  });

  server.listen(50930, () => {
    console.log("server running at http://localhost:50930");
  });
}
