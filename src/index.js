import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import MainRouter from "./routes/MainRouter";

const APP_STORAGE_VERSION = "v2"; // change this when schema changes
const storedVersion = localStorage.getItem("app_storage_version");

if (storedVersion !== APP_STORAGE_VERSION) {
  console.log("Version mismatch. Clearing localStorage.");
  localStorage.clear(); // or selectively clear specific keys
  localStorage.setItem("app_storage_version", APP_STORAGE_VERSION);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MainRouter />
  </React.StrictMode>
);

reportWebVitals();
