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
            xhr.respond(
              originalXhr.status,
              originalXhr.getAllResponseHeaders(),
              originalXhr.responseText
            );
          }
        };
        originalXhr.open(xhr.method, xhr.url, xhr.async);
        originalXhr.send(xhr.requestBody);
        return;
      } else {
        xhr.respond(200, { "Content-Type": "application/json" }, mockRes.body);
      }
    }, 0);
  };
}
