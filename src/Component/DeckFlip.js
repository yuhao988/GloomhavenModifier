import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import "./DeckFlip.css";
import cardBack from "./CardImages/Cardback.png";
import cardData from "./CardList.json";
import { buildClassDeck, PerkTable } from "./PerkTable";

const imageContext = require.context("../Class", false, /\.(jpg)$/);
const cardImageContext = require.context("./CardImages", true, /\.(png)$/);

const images = imageContext.keys().reduce((acc, key) => {
  const name = key.replace("./", "").replace(/\..+$/, "").replace(/\s+/g, "");
  acc[name] = imageContext(key);
  return acc;
}, {});

const cardImages = cardImageContext.keys().reduce((acc, key) => {
  const code = key.replace("./", "").replace(/\..+$/, "").replace(/\s+/g, "");
  acc[code] = cardImageContext(key);
  return acc;
}, {});

const cardsById = cardData.reduce((acc, card) => {
  acc[card.ID] = card;
  return acc;
}, {});

function DeckFlip() {
  const { name } = useParams();
  const key = (name || "").replace(/\s+/g, "");

  // ---- Perk state + derived deck ----
  const [checkedBoxes, setCheckedBoxes] = useState([]);
  const [modDeck, setModDeck] = useState(() => buildClassDeck(name, []));

  // ---- Draw state ----
  const [drawnCards, setDrawnCards] = useState([]);
  const [chosenIndex, setChosenIndex] = useState(null);
  const [discardPile, setDiscardPile] = useState([]);
  const [rollStack, setRollStack] = useState([]);
  const [showRoll, setShowRoll] = useState(true);

  // Scene mods: [blessCount, curseCount, minus1Count]
  const [sceneMod, setSceneMod] = useState([0, 0, 0]);

  // Build the full deck: base + perks + scene mods.
  // Defaults to current state, but accepts explicit overrides for handlers
  // that update both state and deck in the same tick.
  const buildFullDeck = (perks = checkedBoxes, mods = sceneMod) => {
    const deck = buildClassDeck(name, perks);
    const extra = [];
    for (let i = 0; i < mods[0]; i++) extra.push(cardsById[1]); // Bless
    for (let i = 0; i < mods[1]; i++) extra.push(cardsById[2]); // Curse
    for (let i = 0; i < mods[2]; i++) extra.push(cardsById[5]); // -1
    return [...deck, ...extra];
  };

  // Count cards by ID in the full deck (ignores drawn/discard)
  const countModDeck = () => {
    const source = buildFullDeck();
    const counts = source.reduce((acc, card) => {
      acc[card.ID] = (acc[card.ID] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([id, count]) => ({ card: cardsById[id], count }))
      .sort((a, b) => a.card.ID - b.card.ID);
  };

  const resetDrawPiles = () => {
    setDiscardPile([]);
    setDrawnCards([]);
    setRollStack([]);
    setChosenIndex(null);
  };

  const toggleBox = (boxId) => {
    setCheckedBoxes((prev) => {
      const next = prev.includes(boxId)
        ? prev.filter((b) => b !== boxId)
        : [...prev, boxId];
      setModDeck(buildFullDeck(next, sceneMod));
      resetDrawPiles();
      return next;
    });
  };

  // Reset Deck: remove scene mods, keep perks
  const resetDeck = () => {
    const clearedMods = [0, 0, 0];
    setSceneMod(clearedMods);
    setModDeck(buildFullDeck(checkedBoxes, clearedMods));
    resetDrawPiles();
  };

  // Reshuffle: keep perks AND scene mods, just return drawn cards to the deck
  const reshuffleDeck = () => {
    setModDeck(buildFullDeck(checkedBoxes, sceneMod));
    resetDrawPiles();
  };

  // Reset Perks: clear all boxes, keep scene mods
  const resetPerks = () => {
    setCheckedBoxes([]);
    setModDeck(buildFullDeck([], sceneMod));
    resetDrawPiles();
  };

  // Add one scene modifier at the given index (0=Bless, 1=Curse, 2=-1)
  const addSceneMod = (index) => {
    const next = [...sceneMod];
    next[index] += 1;
    setSceneMod(next);
    setModDeck(buildFullDeck(checkedBoxes, next));
  };

  // Draw `count` cards, reshuffling discard into deck if needed
  const drawWithReshuffle = (deck, discard, count) => {
    let currentDeck = [...deck];
    let currentDiscard = [...discard];
    const drawn = [];

    for (let i = 0; i < count; i++) {
      if (currentDeck.length === 0) {
        if (currentDiscard.length === 0) break;
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

  // Normal draw: one card, chaining through roll modifiers
  const drawCard = () => {
    let result = drawWithReshuffle(modDeck, discardPile, 1);
    if (result.cards.length === 0) return;

    const rolls = [];
    let { cards, deck, discard } = result;

    while (cards[0].Roll) {
      rolls.push(cards[0]);
      result = drawWithReshuffle(deck, discard, 1);
      if (result.cards.length === 0) break;
      cards = result.cards;
      deck = result.deck;
      discard = result.discard;
    }

    setRollStack(rolls);
    setShowRoll(true);
    setDrawnCards(cards);
    setChosenIndex(null);
    setModDeck(deck);
    setDiscardPile([...discard, ...rolls, ...cards]);
  };

  // Adv/Dis: draw two slots, pick higher/lower Value
  const drawAdvDis = (mode) => {
    setRollStack([]);
    let result = drawWithReshuffle(modDeck, discardPile, 1);
    if (result.cards.length === 0) return;

    const rolls = [];
    let { cards, deck, discard } = result;

    while (cards[0].Roll) {
      rolls.push(cards[0]);
      result = drawWithReshuffle(deck, discard, 1);
      if (result.cards.length === 0) break;
      cards = result.cards;
      deck = result.deck;
      discard = result.discard;
    }

    const first = cards[0];
    const deckAfterFirst = deck;
    const discardAfterFirst = [...discard, ...rolls, ...cards];

    result = drawWithReshuffle(deckAfterFirst, discardAfterFirst, 1);
    if (result.cards.length === 0) return;

    const second = result.cards[0];
    const a = first.Value;
    const b = second.Value;

    let winner;
    if (mode === "advantage") {
      if (b > a) {
        winner = 1;
      } else if (a === b) {
        if (!second.Effect) {
          winner = 0;
        } else if (!first.Effect) {
          winner = 1;
        } else {
          winner = 0;
        }
      } else {
        winner = 0;
      }
    } else {
      if (b > a) {
        winner = 0;
      } else if (a === b) {
        if (!first.Effect) {
          winner = 0;
        } else if (!second.Effect) {
          winner = 1;
        } else {
          winner = 0;
        }
      } else {
        winner = 1;
      }
    }

    setRollStack(rolls);
    setDrawnCards([first, second]);
    setChosenIndex(winner);
    setModDeck(result.deck);
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

  const perkCount = checkedBoxes.length;

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
            <h4>Perks count: {perkCount}</h4>
            <PerkTable
              charClass={name}
              checkedBoxIds={checkedBoxes}
              onToggleBox={toggleBox}
            />
            <button onClick={resetPerks} style={{ marginTop: "8px" }}>
              Reset Perks
            </button>
          </div>

          <div className="body-column2">
            <h3>Roll Simulation</h3>
            <p>Cards remaining: {modDeck.length}</p>
            <button onClick={resetDeck} style={{ width: "10vw" }}>
              Reset Deck
            </button>
            <button
              onClick={reshuffleDeck}
              style={{ width: "10vw", marginLeft: "8px" }}
            >
              Reshuffle
            </button>

            <table style={{ margin: "0 auto" }}>
              <thead>
                <tr>
                  <th>
                    <button
                      onClick={() => addSceneMod(0)}
                      style={{ width: "8vw", margin: "5px" }}
                    >
                      Add Bless
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => addSceneMod(1)}
                      style={{ width: "8vw", margin: "5px" }}
                    >
                      Add Curse
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => addSceneMod(2)}
                      style={{ width: "8vw", margin: "5px" }}
                    >
                      Add -1
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: "center" }}>{sceneMod[0]}</td>
                  <td style={{ textAlign: "center" }}>{sceneMod[1]}</td>
                  <td style={{ textAlign: "center" }}>{sceneMod[2]}</td>
                </tr>
              </tbody>
            </table>

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
          </div>

          <div className="body-column3">
            <h3>Deck Composition</h3>
            <table className="my-table">
              <thead></thead>
              <tbody>
                {countModDeck().map((row) => (
                  <tr key={row.card.ID}>
                    <td>
                      <img
                        src={cardImages[getImageKey(row.card)]}
                        alt={row.card.Name}
                        style={{ width: "5vw", margin: "2px" }}
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
        </Link>
      </div>
    </div>
  );
}

export default DeckFlip;
