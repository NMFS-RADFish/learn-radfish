import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/theme.css";
import App from "./App";
import { Application } from "@nmfs-radfish/radfish";
import { IndexedDBConnector } from "@nmfs-radfish/radfish/storage";

const root = ReactDOM.createRoot(document.getElementById("root"));
const app = new Application({
  serviceWorker: {
    url: "/service-worker.js",
  },
  stores: {
    trip: {
      connector: new IndexedDBConnector("learn-radfish"),
      collections: {
        Form: {
          schema: {
            fields: {
              id: {
                type: "string",
                primaryKey: true,
              },
              step: {
                type: "number",
                required: true,
                default: 1
              },
              status: {
                type: "string",
                required: true,
                default: "none",
              },
            },
          },
        },
      },
    },
  }
});

app.on("ready", async () => {
  root.render(
    <React.StrictMode>
      <App application={app} />
    </React.StrictMode>,
  );
});
