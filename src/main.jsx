import { GoogleOAuthProvider } from "@react-oauth/google";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="678553599072-5ncop5mo1558m4sdvrim2iidscj1224t.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);