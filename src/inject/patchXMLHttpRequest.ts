import { ISimulatedRequestHandler } from "./RequestSimulator";
//@ts-expect-error
import fakeXhr from "nise/lib/fake-xhr";

export function patchXMLHttpRequest(mock: ISimulatedRequestHandler) {
  const OriginalXMLHttpRequest = globalThis.XMLHttpRequest;
  const ss = fakeXhr.useFakeXMLHttpRequest();
  ss.onCreate = function (xhr: any) {
    setTimeout(() => {
      const mockRes = mock.handleSimulatedRequest({
        url: xhr.url,
        method: xhr.method,
        body: xhr.requestBody,
        headers: xhr.requestHeaders,
      });
      if (!mockRes) {
        const originalXhr = new OriginalXMLHttpRequest();
        originalXhr.onreadystatechange = function () {
          if (originalXhr.readyState === XMLHttpRequest.DONE) {
            const arr = originalXhr
              .getAllResponseHeaders()
              .trim()
              .split(/[\r\n]+/);

            const headerMap: Record<string, string> = {};
            arr.forEach((line) => {
              const parts = line.split(": ");
              const header = parts.shift()!;
              const value = parts.join(": ");
              headerMap[header] = value;
            });

            xhr.respond(
              originalXhr.status,
              headerMap,
              originalXhr.responseText
            );
          }
        };

        originalXhr.open(xhr.method, xhr.url, xhr.async);
        Object.keys(xhr.requestHeaders).forEach((key: string) => {
          originalXhr.setRequestHeader(key, xhr.requestHeaders[key]);
        });
        originalXhr.withCredentials = xhr.withCredentials;
        originalXhr.send(xhr.requestBody);
        return;
      } else {
        xhr.respond(200, { "Content-Type": "application/json" }, mockRes.body);
      }
    }, 0);
  };
}
