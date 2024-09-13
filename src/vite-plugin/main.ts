import { join } from 'path';
import { createMockForgeServer } from '../server/node/server';

interface MockForgeOption {
  mockDataDir?: string;
  port?: number;
}

const getDirname = () => {
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  } else if (typeof import.meta !== 'undefined' && import.meta.url) {
    return new URL('.', import.meta.url).pathname;
  }
  return process.cwd();
};

export function mockForge(options?: MockForgeOption) {
  const { mockDataDir } = options || {};
  const finalBaseDir = mockDataDir || join(process.cwd(), '.mockforge');
  let isMockEnabled = false;

  let port: number | null = null;
  return {
    name: 'vite-plugin-mock-forge',
    configResolved(config: any) {
      if (process.env.MOCK_FORGE && config.command === 'serve') {
        isMockEnabled = true;
      }
    },
    async configureServer() {
      port = await createMockForgeServer({
        baseDir: finalBaseDir,
        static: [join(getDirname(), 'ui'), join(getDirname(), 'inject')],
        port: options?.port,
      });
      console.log('[MockForge] start at http://localhost:' + port);
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
        return html.replace('</head>', `${injection}</head>`);
      }
      return html;
    },
  };
}
