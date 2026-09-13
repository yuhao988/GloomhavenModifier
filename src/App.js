import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Modal from "react-modal"; // Import the Modal component
import "./App.css";
import Error from "./Error";
import Home from "./Home";
import DeckFlip from "./Component/DeckFlip";

function App() {
  // Set the app element when the component mounts
  useEffect(() => {
    Modal.setAppElement("#root"); // Replace "#root" with your actual root element id
  }, []);

  return (
    <div className="App">
      <div className="main-content">
        <Routes>
          <Route path={`${process.env.PUBLIC_URL}/`} element={<Home />} />
          <Route path={`${process.env.PUBLIC_URL}/:name`} element={<DeckFlip />} />
          <Route path={`${process.env.PUBLIC_URL}/*`} element={<Error />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
