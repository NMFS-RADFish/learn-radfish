import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/theme.css";
import App from "./App";
import { Application } from "@nmfs-radfish/radfish";
import { IndexedDBConnector } from "@nmfs-radfish/radfish/storage";

const root = ReactDOM.createRoot(document.getElementById("root"));
// Create RADFish Application instance with IndexedDB store
const app = new Application({
  serviceWorker: {
    url:
      import.meta.env.MODE === "development"
        ? "/mockServiceWorker.js"
        : "/service-worker.js",
  },
  mocks: {
    handlers: import("../mocks/browser.js"),
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
                default: 1 // Track the current step (1: Start, 2: Catch, 3: End, 4: Review)
              },
              status: {
                type: "string",
                required: true,
                default: "none", // none, in-progress, Not Submitted, submitted
              },
              tripDate: {
                type: "string",
                required: true,
              },
              startTime: {
                type: "string",
                required: true,
              },
              startWeather: {
                type: "string",
                required: true,
              },
              endWeather: {
                type: "string",
                required: true,
              },
              endTime: {
                type: "string",
                required: true,
              },
            },
          },
        },
        Catch: {
          schema: {
            fields: {
              id: {
                type: "string",
                primaryKey: true,
              },
              species: {
                type: "string",
                required: true,
              },
              weight: {
                type: "number",
                required: true,
              },
              length: {
                type: "number",
                required: true,
              },
              latitude: {
                type: "number",
              },
              longitude: {
                type: "number",
              },
              time: {
                type: "string",
                required: true,
              },
              tripId: {
                type: "string",
                required: true,
              }
            },
          },
        },
      },
    },
  },
});

app.on("ready", async () => {
    root.render(
      <React.StrictMode>
        <App application={app} />
      </React.StrictMode>,
    );
});
