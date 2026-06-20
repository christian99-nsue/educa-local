import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MsalProvider } from "@azure/msal-react";
import { EventType, PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";
import "./i18n";

const msalInstance = new PublicClientApplication(msalConfig);

if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
  msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload && "account" in event.payload) {
    msalInstance.setActiveAccount(event.payload.account);
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="243760969382-42potra683hsmdquehmfbsv12m71tduk.apps.googleusercontent.com">
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </GoogleOAuthProvider>,
);
