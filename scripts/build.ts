import * as esbuild from 'esbuild';
import { cp, rm } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const distDir = join(__dirname, '..', 'dist');
const jsonSchemaDir = join(__dirname, '..', 'json-schema');
const srcDir = join(__dirname, '..', 'src');

async function build() {
  try {
    await rm(distDir, { recursive: true, force: true });
    await rm(jsonSchemaDir, { recursive: true, force: true });
    console.log('Cleaned dist,jsonSchema directory');
  } catch (err) {
    console.error('Error cleaning dist,jsonSchema directory:', err);
  }

  // 构建配置
  const commonConfig = {
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ['node16'],
    external: ['express', 'ws', 'html-webpack-plugin', 'debug'],
  };

  async function buildPlugin(main: string, name: string) {
    await esbuild.build({
      ...commonConfig,
      platform: 'node',
      format: 'cjs',
      entryPoints: [main],
      outfile: join(distDir, name + '.cjs'),
    });
    await esbuild.build({
      ...commonConfig,
      platform: 'node',
      format: 'esm',
      entryPoints: [main],
      outfile: join(distDir, name + '.mjs'),
    });
  }

  try {
    // 构建 inject.js
    await esbuild.build({
      ...commonConfig,
      platform: 'node',
      format: 'esm',
      entryPoints: [join(srcDir, 'inject', 'main.ts')],
      outfile: join(distDir, 'inject/inject.js'),
    });
    console.log('Built inject.js');
    await buildPlugin(join(srcDir, 'extension', 'vite-plugin', 'main.ts'), 'vite-plugin');
    await buildPlugin(join(srcDir, 'extension', 'webpack', 'main.ts'), 'webpack5-plugin');
    await buildPlugin(join(srcDir, 'server', 'main.ts'), 'server');
    console.log('Built vite-plugin.js');
    console.log('Build completed successfully');
    try {
      await cp(join(srcDir, 'jsonSchema'), jsonSchemaDir, {
        recursive: true,
      });
      console.log('Copied types directory');
    } catch (err) {
      console.error('Error copying types directory:', err);
    }
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

build();
