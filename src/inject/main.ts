import { BrowserMockForgeEventListener } from "../ui/service/event";
import { BrowserMockForgeStateService } from "../ui/service/service";
import { getInitialStateSync } from "./getInitialStateSync";
import { patchXMLHttpRequest } from "./patchXMLHttpRequest";
import { RequestSimulator } from "./RequestSimulator";

async function initAndInject() {
  const requestSimulatorElement = document.getElementById(
    "mockforge-request-simulator"
  );
  if (!requestSimulatorElement) {
    console.error("Mockforge Request Simulator: Script tag not found");
    return;
  }
  const clientId = requestSimulatorElement.getAttribute("clientId");
  const serverURL = requestSimulatorElement.getAttribute("serverURL");
  if (!clientId || !serverURL) {
    return;
  }
  const requestSimulator = new RequestSimulator();
  try {
    const initState = getInitialStateSync(serverURL, clientId);
    requestSimulator.setApiList(initState.mockAPIs);
    requestSimulator.setState(initState.mockState);
    //拦截 xml
    patchXMLHttpRequest(requestSimulator);
  } catch (error) {
    console.error(
      "Mockforge Request Simulator: Failed to get mock state",
      error
    );
  }

  try {
    const browserMockForgeEventListener = new BrowserMockForgeEventListener(
      serverURL,
      clientId
    );
    const browserMockForgeStateService = new BrowserMockForgeStateService(
      serverURL,
      clientId
    );
    await browserMockForgeEventListener.connect();
    browserMockForgeEventListener.handleEvent((event) => {
      if (event.type === "http-mock-api-change") {
        browserMockForgeStateService.listMockAPIs().then((state) => {
          requestSimulator.setApiList(state);
        });
      }
      if (event.type === "mock-forge-state-change") {
        browserMockForgeStateService.getMockForgeState().then((state) => {
          requestSimulator.setState(state);
        });
      }
    });
  } catch (error) {
    console.error(
      "Mockforge Request Simulator: Failed to get mock state",
      error
    );
  }
}

initAndInject();
