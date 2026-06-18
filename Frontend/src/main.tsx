import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="243760969382-42potra683hsmdquehmfbsv12m71tduk.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>,
);
