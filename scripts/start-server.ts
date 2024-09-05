import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createMockForgeServer } from "../src/server/node/server";
import { mkdir } from "node:fs/promises";

// 获取当前模块文件的路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 构建目标目录路径
const baseDir = join(__dirname, "cache", "mock");

// 确保目标目录存在
async function ensureDirectory(path) {
  try {
    await mkdir(path, { recursive: true });
    console.log(`Directory ${path} created or already exists.`);
  } catch (error) {
    console.error(`Error creating directory ${path}:`, error);
  }
}

// 创建服务器
async function setupServer() {
  await ensureDirectory(baseDir);
  createMockForgeServer({
    baseDir: baseDir,
    port: 17930,
  });
}

// 执行服务器设置
setupServer();
