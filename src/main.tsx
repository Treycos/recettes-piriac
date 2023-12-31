import { MantineProvider } from "@mantine/core";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";

import "./index.css";
import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/spotlight/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider>
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
