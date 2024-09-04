import isValidFilename from "valid-filename";
import { HttpMethod } from "./types.js";

const JoinChar = "__";

export const METADATA_FILENAME = "__metadata__.json";

export function encodeHttpApiPath(method: string, apiPath: string): string {
  const normalizedPath = apiPath
    .split("/")
    .filter((segment) => segment.length > 0)
    .join(JoinChar);

  return `${JoinChar}${method.toUpperCase()}${JoinChar}${normalizedPath}${JoinChar}`;
}

export function decodeHttpApiPath(dirname: string): [HttpMethod, string] {
  if (!dirname.startsWith(JoinChar) || !dirname.endsWith(JoinChar)) {
    throw new Error("Invalid dirname format");
  }
  const trimmedDirname = dirname.slice(JoinChar.length, -JoinChar.length);
  const parts = trimmedDirname.split(JoinChar);
  const method = parts.shift();
  if (!method) {
    throw new Error("Method is missing from dirname");
  }
  const pathname = "/" + parts.join("/");
  return [method.toUpperCase() as HttpMethod, pathname];
}

export function checkDirAndFileName(originalName: string) {
  const trimName = originalName.trim();

  // 检查前后是否有空白字符
  if (trimName !== originalName) {
    return false;
  }

  // 检查文件名是否为空
  if (trimName.length === 0) {
    return false;
  }

  // 检查文件名是否符合其他有效性规则
  return isValidFilename(trimName);
}
