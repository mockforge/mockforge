import type { InitialState } from '../server/common/service';

export function getInitialStateSync(baseUrl: string, _clientId: string): InitialState {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `${baseUrl}/api/v1/mockforge/state`, false); // 设置为同步请求
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send();
  if (xhr.status !== 200) {
    throw new Error(`HTTP error! status: ${xhr.status}`);
  }
  try {
    return JSON.parse(xhr.responseText);
  } catch (e) {
    throw new Error('Failed to parse response as JSON');
  }
}
