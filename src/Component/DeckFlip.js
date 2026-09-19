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
  const [modDeck, setModDeck] = useState(buildBaseDeck);
  const [drawnCards, setDrawnCards] = useState([]);
  const [chosenIndex, setChosenIndex] = useState(null);
  const [discardPile, setDiscardPile] = useState([]);
  const [rollStack, setRollStack] = useState([]);
  const [showRoll, setShowRoll] = useState(true);

  const countModDeck = () => {
    // Tally IDs
    const counts = modDeck.reduce((acc, card) => {
      acc[card.ID] = (acc[card.ID] || 0) + 1;
      return acc;
    }, {});

    // Convert to array of { card, count }
    return Object.entries(counts).map(([id, count]) => ({
      card: cardsById[id],
      count,
    }));
  };

  const resetDeck0 = () => {
    setDecklist(modDeck);
    setDiscardPile([]);
    setDrawnCards([]);
    setRollStack([]);
    setChosenIndex(null);
  };

  // Normal draw: one card
  const drawCard = () => {
    let result = drawWithReshuffle(decklist, discardPile, 1);
    if (result.cards.length === 0) return;

    const rolls = [];
    let { cards, deck, discard } = result;

    while (cards[0].Roll) {
      rolls.push(cards[0]);
      // Continue from the *local* deck/discard, not the stale state
      result = drawWithReshuffle(deck, discard, 1);
      if (result.cards.length === 0) break; // safety: deck + discard empty
      cards = result.cards;
      deck = result.deck;
      discard = result.discard;
    }

    setRollStack(rolls);
    setShowRoll(true);
    setDrawnCards(cards);
    setChosenIndex(null);
    setDecklist(deck);
    setDiscardPile([...discard, ...rolls, ...cards]);
  };

  // Draw `count` cards, reshuffling the discard pile into the deck if needed.
  // Returns { cards, deck, discard } — the new state of all three.
  const drawWithReshuffle = (deck, discard, count) => {
    let currentDeck = [...deck];
    let currentDiscard = [...discard];
    const drawn = [];

    for (let i = 0; i < count; i++) {
      if (currentDeck.length === 0) {
        if (currentDiscard.length === 0) break; // truly nothing left
        currentDeck = shuffle(currentDiscard);
        currentDiscard = [];
      }

      const idx = Math.floor(Math.random() * currentDeck.length);
      drawn.push(currentDeck[idx]);
      currentDeck = [
        ...currentDeck.slice(0, idx),
        ...currentDeck.slice(idx + 1),
      ];
    }

    return { cards: drawn, deck: currentDeck, discard: currentDiscard };
  };

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Add one card object (or an ID) to the deck
  // const addCard = (cardOrId) => {
  //   const card = typeof cardOrId === "number" ? cardsById[cardOrId] : cardOrId;
  //   if (!card) {
  //     console.warn("Unknown card:", cardOrId);
  //     return;
  //   }
  //   setDecklist((prev) => [...prev, card]);
  // };

  //  Remove one occurrence of a card by ID
  // const removeCard = (id) => {
  //   setDecklist((prev) => {
  //     const idx = prev.findIndex((c) => c.ID === id);
  //     if (idx === -1) return prev; // nothing to remove
  //     return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
  //   });
  // };

  // Shared adv/dis logic
  const drawAdvDis = (mode) => {
    setRollStack([]);
    let result = drawWithReshuffle(decklist, discardPile, 1); // Draw first card
    if (result.cards.length === 0) return;

    const rolls = [];
    let { cards, deck, discard } = result;

    while (cards[0].Roll) {
      // If rolling modifier drawn, draw until non-rolling
      rolls.push(cards[0]);
      // Continue from the *local* deck/discard, not the stale state
      result = drawWithReshuffle(deck, discard, 1);
      if (result.cards.length === 0) break; // safety: deck + discard empty
      cards = result.cards;
      deck = result.deck;
      discard = result.discard;
    }
    //console.log(rolls);

    const first = cards[0]; // Regard only the last non-rolling card as the first card

    // After slot 1, consumed cards = rolls + the final non-roll card
    const deckAfterFirst = deck;
    const discardAfterFirst = [...discard, ...rolls, ...cards];

    // Draw second card, continuing from the *local* deck/discard after slot 1
    result = drawWithReshuffle(deckAfterFirst, discardAfterFirst, 1);
    if (result.cards.length === 0) return;

    const second = result.cards[0];
    const a = first.Value;
    const b = second.Value;

    const winner = mode === "advantage" ? (b > a ? 1 : 0) : b < a ? 1 : 0;

    // Commit all state once, at the end
    setRollStack(rolls);
    setDrawnCards([first, second]);
    setChosenIndex(winner);
    setDecklist(result.deck);
    setDiscardPile([...result.discard, ...result.cards]);
    mode === "advantage" ? setShowRoll(true) : setShowRoll(false);
  };

  const handleAdvantage = () => drawAdvDis("advantage");
  const handleDisadvantage = () => drawAdvDis("disadvantage");

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
        <div className="body-column">
          <div className="body-column1">
            <h4>Perks count:</h4>
          </div>
          <div className="body-column2">
            <h3>Roll Simulation</h3>
            <button onClick={resetDeck0} style={{ width: "10vw" }}>
              Reset Deck
            </button>
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
              <div className="drawn-cards">
                {rollStack.length > 0 && showRoll && (
                  <div>
                    {rollStack.map((card, i) => (
                      <img
                        key={i}
                        src={cardImages[getImageKey(card)]}
                        alt={card.Name}
                        className={
                          chosenIndex !== null
                            ? "drawn-card chosen"
                            : "drawn-card"
                        }
                      />
                    ))}
                  </div>
                )}
                {drawnCards.map((card, i) => (
                  <img
                    key={i}
                    src={cardImages[getImageKey(card)]}
                    alt={card.Name}
                    className={
                      chosenIndex !== null && i === chosenIndex
                        ? "drawn-card chosen"
                        : "drawn-card"
                    }
                    style={{ marginRight: "20px" }}
                  />
                ))}
              </div>
            )}
            <p>Cards remaining: {decklist.length}</p>
          </div>
          <div className="body-column3">
            <h3>Deck Composition</h3>
            <table className="my-table">
              <thead></thead>
              <tbody>
                {countModDeck().map((row, i) => (
                  <tr key={i}>
                    <td>
                      <img
                        src={cardImages[getImageKey(row.card)]}
                        alt={row.card.Name}
                        style={{width:"8vw",margin:"2px"}}
                      />
                    </td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Link to={`${process.env.PUBLIC_URL}/`} className="home-link">
          Back
        </Link>{" "}
      </div>
    </div>
  );
}

export default DeckFlip;
