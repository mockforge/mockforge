import express, { Request, Response } from "express";
import getPort from "get-port";
import { createServer } from "node:http";
import { RPCRequestBody, RPCResponse } from "./../common/rpc.js";
import { MockForgeStateService } from "./service.js";

interface CreateMockForgeServerOption {
  baseDir: string;
  port?: number;
}

export async function createMockForgeServer(
  option: CreateMockForgeServerOption
): Promise<number> {
  const serverPort = await getPort({ port: option.port || 50830 });

  return new Promise((resolve, reject) => {
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
        response = {
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error),
          clientId,
        };
      }
      res.json(response);
    });

    server.listen(serverPort, () => {
      const address = server.address();
      if (address && typeof address === "object") {
        resolve(address.port);
      } else {
        reject(new Error("Failed to get server address"));
      }
    });
    server.on("error", (error) => {
      reject(error);
    });
  });
}
