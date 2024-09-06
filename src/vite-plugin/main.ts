import { join } from "path";
import { createMockForgeServer } from "../server/node/server";

interface MockForgeOption {
  mockDataDir?: string;
  port?: number;
}

export function mockForge(options: MockForgeOption) {
  const { mockDataDir } = options || {};
  const finalBaseDir = mockDataDir || join(process.cwd(), ".mockForge");
  let isMockEnabled = false;

  let port: number | null = null;
  const __dirname = new URL(".", import.meta.url).pathname;
  return {
    name: "vite-plugin-mock-forge",
    configResolved(config: any) {
      if (process.env.MOCK_FORGE && config.command === "serve") {
        isMockEnabled = true;
      }
    },
    async configureServer() {
      port = await createMockForgeServer({
        baseDir: finalBaseDir,
        static: [join(__dirname, "ui"), join(__dirname, "inject")],
      });
      console.log("[MockForge] start at http://localhost:" + port);
    },

    transformIndexHtml(html: string) {
      if (isMockEnabled && port !== null) {
        const randomId = Math.random().toString(36).substring(2, 15);
        const serverURL = `http://localhost:${port}`;
        const scriptUrl = `http://localhost:${port}/inject.js`;
        const injection = `
            <script src="${scriptUrl}" id="mock-forge-request-simulator" clientId="${randomId}" serverURL="${serverURL}">
            </script>
          `;
        return html.replace("</head>", `${injection}</head>`);
      }
      return html;
    },
  };
}
