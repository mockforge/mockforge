import { join } from "path";
import { createMockForgeServer } from "../server/node/server";

interface MockForgeOption {
  baseDir?: string;
  port?: number;
}

export default function mockPlugin(options: MockForgeOption) {
  const { baseDir } = options;
  const finalBaseDir = baseDir || join(process.cwd(), ".mockforge");
  let isMockEnabled = false;

  let port: number | null = null;
  // import meta 计算
  const __dirname = new URL(".", import.meta.url).pathname;
  return {
    name: "vite-plugin-mock",

    configResolved(config) {
      if (process.env.MOCK_FORGE && config.command === "serve") {
        isMockEnabled = true;
      }
    },

    async configureServer() {
      port = await createMockForgeServer({
        baseDir: finalBaseDir,
        static: join(__dirname, "ui"),
      });
    },

    transformIndexHtml(html) {
      if (isMockEnabled && port !== null) {
        const randomId = Math.random().toString(36).substring(2, 15);
        const serverURL = `ws://localhost:${port}`;
        const injection = `
            <script id="mockforge-request-simulator" clientId="${randomId}" serverURL="${serverURL}">
            </script>
          `;
        return html.replace("</head>", `${injection}</head>`);
      }
      return html;
    },
  };
}
