import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import "./DeckFlip.css";

const imageContext = require.context(
  "../Class", // Folder path
  false, // Don't look in subdirectories
  /\.(jpg)$/, // File extensions to match
);

const cardImageContext = require.context(
  "./CardImages", // Folder path
  true, //  Look in subdirectories
  /\.(png)$/, // File extensions to match
);

const images = imageContext.keys().reduce((acc, key) => {
  const name = key.replace("./", "").replace(/\..+$/, "").replace(/\s+/g, ""); // strips spaces: "Beast Tyrant" → "BeastTyrant"

  acc[name] = imageContext(key);
  return acc;
}, {});

const cardImages = cardImageContext.keys().reduce((acc, key) => {
  const code = key.replace("./", "").replace(/\..+$/, "").replace(/\s+/g, ""); // strips spaces: "Beast Tyrant" → "BeastTyrant"

  acc[code] = cardImageContext(key);
  return acc;
}, {});

function DeckFlip() {
  const { name } = useParams();
  const key = (name || "").replace(/\s+/g, ""); // sanitize the same way


  return (
    <div>
      <header className="page-header">
        <h1>
          <img src={images[key]} alt={name} className="class-image" />

          {name}
        </h1>
      </header>
      <div className="page-body">
        <div>
          <img src={cardImages["Base0"]} alt="image1" />
          <img src={cardImages[`${name}/TinkerAdTar`]} alt="image1" />
        </div>
        <Link to={`${process.env.PUBLIC_URL}/`} className="home-link">
          Back
        </Link>{" "}
      </div>
    </div>
  );
}

export default DeckFlip;
