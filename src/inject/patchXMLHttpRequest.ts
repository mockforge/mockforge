import {
  ISimulatedRequestHandler,
  RequestParameters,
} from "./RequestSimulator";

export function patchXMLHttpRequest(mock: ISimulatedRequestHandler) {
  const OriginalXHR = window.XMLHttpRequest;
  (window as any).XMLHttpRequest = function () {
    const xhr = new OriginalXHR();
    const originalOpen = xhr.open;
    const originalSetRequestHeader = xhr.setRequestHeader;
    const originalSend = xhr.send;

    const requestOption: Partial<RequestParameters> = {
      body: null,
    };
    xhr.open = function (method, url) {
      requestOption.method = method;
      requestOption.url = url;
      //@ts-expect-error
      return originalOpen.apply(this, arguments);
    };

    xhr.setRequestHeader = function (header, value) {
      if (!requestOption.headers) {
        requestOption.headers = {};
      }
      requestOption.headers[header] = value;
      //@ts-expect-error
      return originalSetRequestHeader.apply(this, arguments);
    };

    xhr.send = function (body) {
      const that = this;
      requestOption.body = body;
      mock
        .handleSimulatedRequest(requestOption)
        .catch(() => {
          //@ts-expect-error
          originalSend.apply(this, arguments);
        })
        .then((res) => {
          setTimeout(() => {
            //@ts-expect-error
            that.status = 200;
            //@ts-expect-error
            this.responseText = res?.data;
            //@ts-expect-error
            that.onreadystatechange();
          }, 0);
        });
    };

    return xhr;
  };
}
