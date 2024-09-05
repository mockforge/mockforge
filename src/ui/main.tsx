import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserMockForgeStateService } from "./service/service";

const xxx = new BrowserMockForgeStateService("");

console.log(await xxx.getMockForgeState());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div>11</div>
  </StrictMode>
);
