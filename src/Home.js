//import { Link } from "react-router-dom";

import React from "react";
import logo from './logo.svg';
import "./App.css";

export function paragraphBreak(text) {
  if (typeof text !== "string") {
    console.warn("Expected string, got:", typeof text);
    return text || "";
  }

  // Split text at <br /> tags and map to JSX elements
  const parts = text.split(/<br\s*\/?>/i);

  return parts.map((part, index) => (
    <React.Fragment key={index}>
      {<br />}
      {part}
      {index < parts.length - 1 && <br />} {/* Add JSX <br> between parts*/}
    </React.Fragment>
  ));
}

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>A base app that can be used to build new projects or use as testground for packages</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default Home;
