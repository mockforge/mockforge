import type { InitialState } from "../server/common/service";

export function getInitialStateSync(
  baseUrl: string,
  clientId: string
): InitialState {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${baseUrl}/api/v1/mockforge/rpc`, false); // 设置为同步请求
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.timeout = 2000;
  const data = JSON.stringify({
    method: "getInitialState",
    args: [],
    clientId: clientId,
  });

  xhr.send(data);
  if (xhr.status !== 200) {
    throw new Error(`HTTP error! status: ${xhr.status}`);
  }
  try {
    return JSON.parse(xhr.responseText);
  } catch (e) {
    throw new Error("Failed to parse response as JSON");
  }
}
