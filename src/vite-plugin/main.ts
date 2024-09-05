import { join } from "path";
import { createMockForgeServer } from "../server/node/server";
import { readFile } from "fs/promises";

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

  let injectScript: string | null = null;
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
        static: join(__dirname, "ui"),
      });
      injectScript = await readFile(join(__dirname, "inject.js"), "utf-8");
      console.log("[MockForge] start at http://localhost:" + port);
    },

    transformIndexHtml(html: string) {
      if (isMockEnabled && port !== null) {
        const randomId = Math.random().toString(36).substring(2, 15);
        const serverURL = `http://localhost:${port}`;
        const injection = `
            <script id="mockforge-request-simulator" clientId="${randomId}" serverURL="${serverURL}">
            ${injectScript}
            </script>
          `;
        return html.replace("</head>", `${injection}</head>`);
      }
      return html;
    },
  };
}
