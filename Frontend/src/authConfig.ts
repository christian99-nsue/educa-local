import { LogLevel } from "@azure/msal-browser";
import type { Configuration } from "@azure/msal-browser";

const microsoftClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID || "";
const microsoftTenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID || "common";

export const isMicrosoftAuthConfigured = Boolean(microsoftClientId);

export const msalConfig: Configuration = {
  auth: {
    clientId: microsoftClientId,
    authority: `https://login.microsoftonline.com/${microsoftTenantId}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;

        if (level === LogLevel.Error) console.error(message);
        if (level === LogLevel.Warning) console.warn(message);
      },
    },
  },
};

export const microsoftLoginRequest = {
  scopes: ["openid", "profile", "email"],
};



