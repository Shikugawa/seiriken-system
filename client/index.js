import ReactDOM from "react-dom";
import React from "react";
import { App } from "./components/App";
import { CookiesProvider } from "react-cookie";

ReactDOM.render(
  <CookiesProvider>
    <App />
  </CookiesProvider>, document.querySelector('#container')
);