import { readFile } from "fs/promises";
import { join } from "path";
import { createMockForgeServer } from "../server/node/server";

interface MockForgeOption {
  baseDir?: string;
  port?: number;
}

export default function mockPlugin(options: MockForgeOption) {
  const { baseDir } = options || {};
  const finalBaseDir = baseDir || join(process.cwd(), ".mockforge");
  let isMockEnabled = false;

  let port: number | null = null;
  // import meta 计算
  const __dirname = new URL(".", import.meta.url).pathname;

  return {
    name: "vite-plugin-mock",
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
            <script src="${scriptUrl}" id="mockforge-request-simulator" clientId="${randomId}" serverURL="${serverURL}">
            </script>
          `;
        return html.replace("</head>", `${injection}</head>`);
      }
      return html;
    },
  };
}
