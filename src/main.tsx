import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import "./index.css";
import { StrictMode } from "react";
import App from "./App";

const queryClient = new QueryClient();

// biome-ignore lint/style/noNonNullAssertion: The element with id 'root' is guaranteed to exist in the DOM
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
