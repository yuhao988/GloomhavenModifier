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

  const countModDeck = () => {
    const source = buildClassDeck(name, checkedBoxes);
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
      setModDeck(buildClassDeck(name, next));
      resetDrawPiles();
      return next;
    });
  };

  // Reset Deck: keep perks, restore deck from current checked set
  const resetDeck = () => {
    setModDeck(buildClassDeck(name, checkedBoxes));
    resetDrawPiles();
  };

  // Reset Perks: clear all boxes, rebuild base deck, reset piles
  const resetPerks = () => {
    setCheckedBoxes([]);
    setModDeck(buildClassDeck(name, []));
    resetDrawPiles();
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
    const winner = mode === "advantage" ? (b > a ? 1 : 0) : b < a ? 1 : 0;

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
