import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { createMockForgeServer } from '../../server/node/server.ts';
import { getDirname } from '../node/dirname.ts';

interface MockForgeOption {
  mockDataDir?: string;
  port?: number;
  host?: string;
}

export class MockForgeWebpackPlugin {
  private options: MockForgeOption;
  private port: number | null;
  private isMockEnabled: boolean;

  constructor(options: MockForgeOption = {}) {
    this.options = options;
    this.port = null;
    this.isMockEnabled = false;
  }

  apply(compiler: any): void {
    const { mockDataDir } = this.options;
    const finalBaseDir = mockDataDir || path.join(process.cwd(), '.mockforge');

    compiler.hooks.environment.tap('MockForgeWebpackPlugin', () => {
      if (process.env.MOCK_FORGE) {
        this.isMockEnabled = true;
      }
    });

    compiler.hooks.afterEnvironment.tap('MockForgeWebpackPlugin', async () => {
      if (this.isMockEnabled) {
        const result = await createMockForgeServer({
          baseDir: finalBaseDir,
          static: [path.join(getDirname(), 'ui'), path.join(getDirname(), 'inject')],
          port: this.options.port,
          host: this.options.host,
        });
        this.port = result.port;
        console.log('[MockForge] start at http://localhost:' + this.port);
      }
    });

    compiler.hooks.compilation.tap('MockForgeWebpackPlugin', (compilation: any) => {
      const handle = (data: any, cb: any) => {
        if (this.isMockEnabled && this.port !== null) {
          const host = this.options.host || 'localhost';
          const randomId = Math.random().toString(36).substring(2, 15);
          const serverURL = `http://${host}:${this.port}`;
          const scriptUrl = `http://${host}:${this.port}/inject.js`;
          const injection = `
          <script src="${scriptUrl}" id="mock-forge-request-simulator" clientId="${randomId}" serverURL="${serverURL}">
          </script>
        `;
          data.html = data.html.replace('</head>', `${injection}</head>`);
        }
        cb(null, data);
      };

      if (
        HtmlWebpackPlugin &&
        typeof HtmlWebpackPlugin.getHooks === 'function' &&
        HtmlWebpackPlugin.getHooks(compilation) &&
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit
      ) {
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('MockForgeWebpackPlugin', handle);
        return;
      }

      if (compilation?.hooks?.htmlWebpackPluginBeforeHtmlProcessing?.tapAsync) {
        compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync('MockForgeWebpackPlugin', handle);
        return;
      }
    });
  }
}
