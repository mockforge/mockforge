import { join } from 'path';
import { createMockForgeServer } from '../../server/node/server.ts';
import { vitePluginDebugLog } from '../../logger/node.ts';
import { getDirname } from '../node/dirname.ts';

interface MockForgeOption {
  mockDataDir?: string;
  port?: number;
  host?: string;
}

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
      vitePluginDebugLog('plugin enable: ', isMockEnabled);
    },
    async configureServer() {
      if (isMockEnabled) {
        const result = await createMockForgeServer({
          baseDir: finalBaseDir,
          static: [join(getDirname(), 'ui'), join(getDirname(), 'inject')],
          port: options?.port,
          host: options?.host,
        });
        port = result.port;
        console.log('[MockForge] start at http://localhost:' + port);
      }
    },
    transformIndexHtml(html: string) {
      if (isMockEnabled && port !== null) {
        const randomId = Math.random().toString(36).substring(2, 15);
        const serverURL = `http://localhost:${port}`;
        const scriptUrl = `http://localhost:${port}/inject.js`;
        const injection = `<script src="${scriptUrl}" id="mock-forge-request-simulator" clientId="${randomId}" serverURL="${serverURL}"></script>`;
        vitePluginDebugLog('inject script:', injection);
        return html.replace('</head>', `${injection}</head>`);
      }
      return html;
    },
  };
}
