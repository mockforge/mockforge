import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";

const clinetId = Math.random().toString(36).substring(2, 15);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App clinetId={clinetId}></App>
  </StrictMode>
);
