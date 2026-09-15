import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import "./DeckFlip.css";
import cardBack from "./CardImages/Cardback.png";
import cardData from "./CardList.json";

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

// Build an ID → object lookup once at module scope
const cardsById = cardData.reduce((acc, card) => {
  acc[card.ID] = card;
  return acc;
}, {});

// The fixed recipe (IDs, with duplicates)
const BASE_DECK_IDS = [
  0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 4, 5, 5, 5, 5, 5, 6, 8,
];

// Turn IDs → objects
const buildBaseDeck = () => BASE_DECK_IDS.map((id) => cardsById[id]);

function DeckFlip() {
  const { name } = useParams();
  const key = (name || "").replace(/\s+/g, ""); // sanitize the same way
  const [decklist, setDecklist] = useState(buildBaseDeck);
  const [drawnCards, setDrawnCards] = useState([]);

  // Reset to the base recipe
  const resetDeck0 = () => {
    setDecklist(buildBaseDeck());
    setDrawnCards([]);
  };

  // Add one card object (or an ID) to the deck
  const addCard = (cardOrId) => {
    const card = typeof cardOrId === "number" ? cardsById[cardOrId] : cardOrId;
    if (!card) {
      console.warn("Unknown card:", cardOrId);
      return;
    }
    setDecklist((prev) => [...prev, card]);
  };

  // Remove one occurrence of a card by ID
  const removeCard = (id) => {
    setDecklist((prev) => {
      const idx = prev.findIndex((c) => c.ID === id);
      if (idx === -1) return prev; // nothing to remove
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

  const drawCard = () => {
    if (decklist.length === 0) return;

    // Work on a local copy so we can chain draws within one click
    let remaining = [...decklist];
    const newDraws = [];

    while (remaining.length > 0) {
      const idx = Math.floor(Math.random() * remaining.length);
      const card = remaining[idx];

      newDraws.push(card);
      remaining = [...remaining.slice(0, idx), ...remaining.slice(idx + 1)];

      if (!card.Roll) break; // stop once a non-roll card is drawn
    }

    setDrawnCards(newDraws);
    setDecklist(remaining);
  };
  const handleAdvantage = () => {};
  const handleDisadvantage = () => {};

  const getImageKey = (card) => {
    if (!card) return null;
    return card.Class === "Base"
      ? card.Name.replace(/\s+/g, "")
      : `${card.Class}/${card.Name}`.replace(/\s+/g, "");
  };

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
          <button onClick={resetDeck0}>Reset</button>
          <br />
          <div className="draw-area">
            <button className="draw-btn" onClick={handleAdvantage}>
              Advantage
            </button>

            <img
              src={cardBack}
              alt="deck"
              onClick={drawCard}
              className="card-back"
            />

            <button className="draw-btn" onClick={handleDisadvantage}>
              Disadvantage
            </button>
          </div>
          <br />
          {drawnCards.length > 0 && (
            <div>
              {drawnCards.map((card, i) => (
                <img
                  key={i}
                  src={cardImages[getImageKey(card)]}
                  alt={card.Name}
                />
              ))}
            </div>
          )}
          <p>Cards remaining: {decklist.length}</p>
        </div>
        <Link to={`${process.env.PUBLIC_URL}/`} className="home-link">
          Back
        </Link>{" "}
      </div>
    </div>
  );
}

export default DeckFlip;
