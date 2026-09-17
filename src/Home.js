//import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
//import logo from './logo.svg';
import "./App.css";

// Placeholder class names — replace with real ones later
const CLASS_NAMES = [
  "Brute",
  "Tinkerer",
  "Spellweaver",
  "Scoundrel",
  "Cragheart",
  "Mindthief",
];
const HIDDEN_CLASS = [
  "Sunkeeper",
  "Quartermaster",
  "Summoner",
  "Nightshroud",
  "Plagueherald",
  "Berserker",
  "Soothsayer",
  "Elementalist",
  "BeastTyrant",
  "Doomstalker",
  "Sawbones",
  "Diviner",
  //"Bladeswarm",
];

function Home() {
  const [showHidden, setShowHidden] = useState(false);
  const [selClass, setSelClass] = useState(null);
  const navigate = useNavigate();

  const imageContext = require.context(
    "./Class", // Folder path
    false, // Don't look in subdirectories
    /\.(jpg)$/, // File extensions to match
  );
  const images = imageContext.keys().reduce((acc, key) => {
    const name = key.replace("./", "").replace(/\..+$/, "").replace(/\s+/g, "");

    acc[name] = imageContext(key);

    return acc;
  }, {});

  const showClass = (classNm) => {
    return (
      <div
        key={classNm}
        className="class-box"
        onClick={() => setSelClass(classNm)}
        style={{
          outline: selClass === classNm ? "5px solid gold" : "none",
        }}
      >
        <img src={images[classNm]} alt={classNm} className="class-image" />
        {classNm}
      </div>
    );
  };

  const handleProceed = () => {
    if (!selClass) {
      alert("Please select a class before proceeding.");
      return;
    }
    // Encode in case a class name has spaces or special chars (e.g. "Beast Tyrant")
    navigate(`/${encodeURIComponent(selClass)}`);
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}

        <h2>Gloomhaven attack modifier deck simulator</h2>
      </header>
      <main className="App-body">
        <h3 style={{ margin: 0 }}>Select class:</h3>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: 0,
          }}
        >
          <input
            type="checkbox"
            checked={showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
          />
          Show hidden class
        </label>

        <div className="class-grid">
          {CLASS_NAMES.map((classNm) => showClass(classNm))}
        </div>
        {showHidden ? (
          <div className="class-grid">
            {HIDDEN_CLASS.map((classNm) => showClass(classNm))}
          </div>
        ) : (
          <div></div>
        )}

        <button onClick={handleProceed}>Proceed</button>
      </main>
    </div>
  );
}

export default Home;
