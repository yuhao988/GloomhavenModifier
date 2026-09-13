import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import "./DeckFlip.css";

function DeckFlip() {
  const { name } = useParams();

  const imageContext = require.context(
    "../Class", // Folder path
    false, // Don't look in subdirectories
    /\.(jpg)$/, // File extensions to match
  );
  const images = imageContext.keys().reduce((acc, key) => {
    const name = key.replace("./", "").replace(/\..+$/, "").replace(/\s+/g, "");

    acc[name] = imageContext(key);

    return acc;
  }, {});

  return (
    <div>
      <header className="page-header">
        <h1>
          <img src={images[name]} alt={name} className="class-image" />
          {name}
        </h1>
      </header>
      <div className="page-body">
        <div></div>
        <Link to={`${process.env.PUBLIC_URL}/`} className="home-link">
          Back
        </Link>{" "}
      </div>
    </div>
  );
}

export default DeckFlip;
