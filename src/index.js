import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { /*HashRouter ,*/ BrowserRouter } from 'react-router-dom';

//import { Auth0Provider } from "@auth0/auth0-react";
//import { PlayerProvider } from "./PlayerContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
//   <Auth0Provider
//     domain={process.env.REACT_APP_AUTH0_DOMAIN}
//     clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
//     scope="read:current_user update:current_user_metadata"
//     authorizationParams={{
//       redirect_uri: window.location.origin,

//       audience: process.env.REACT_APP_API_AUDIENCE,
//     }}
//   >
//     <PlayerProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      /*<HashRouter>
        <App />
      </HashRouter>*/
 //   </PlayerProvider>
//  </Auth0Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
