import type { Configuration } from "@azure/msal-browser";

const microsoftClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID || "";

export const isMicrosoftAuthConfigured = Boolean(microsoftClientId);

export const msalConfig: Configuration = {
  auth: {
    clientId: microsoftClientId,
    authority: `https://login.microsoftonline.com/common`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
};

export const microsoftLoginRequest = {
  scopes: ["openid", "profile", "email"],
};
