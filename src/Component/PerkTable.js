import cardData from "./CardList.json";
import "./DeckFlip.css" ;

const cardsById = cardData.reduce((acc, card) => {
  acc[card.ID] = card;
  return acc;
}, {});

const BASE_DECK_IDS = [
  0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 4, 5, 5, 5, 5, 5, 6,
];

const buildBaseDeck = () => BASE_DECK_IDS.map((id) => cardsById[id]);

const addCard = (decklist, id) => {
  const card = cardsById[id];
  if (!card) return decklist;
  return [...decklist, card];
};

const removeCard = (decklist, id) => {
  const idx = decklist.findIndex((c) => c.ID === id);
  if (idx === -1) return decklist;
  return [...decklist.slice(0, idx), ...decklist.slice(idx + 1)];
};

// Each perk is a GROUP of checkboxes. Each checkbox has its own unique id.
// boxId is globally unique within a class.
// ops applies the same way per checked box.
export const PERKS_BY_CLASS = {
  Brute: [
    {
      label: "Remove 2 {-1} cards",
      ops: [{ remove: 5, times: 2 }],
      boxes: [{ id: "brute-0-a" }],
    },

    {
      label: "Replace 1 {-1} card with 1 {+1} card",
      ops: [
        { add: 3, times: 1 },
        { remove: 5, times: 1 },
      ],
      boxes: [{ id: "brute-1-a" }],
    },
    {
      label: "Add 2 {+1} cards",
      ops: [{ add: 3, times: 2 }],
      boxes: [{ id: "brute-2-a" },{ id: "brute-2-b" }],
    },
    {
      label: "Add 1 {+3} card",
      ops: [{ add: 7, times: 1 }],
      boxes: [{ id: "brute-3-a" }],
    },
    {
      label: "Add 3 {Rolling Push1} cards",
      ops: [{ add: 12, times: 3 }],
      boxes: [{ id: "brute-4-a" },{ id: "brute-4-b" }],
    },
    {
      label: "Add 2 {Rolling Pierce3} cards",
      ops: [{ add: 11, times: 2 }],
      boxes: [{ id: "brute-5-a" }],
    },
    {
      label: "Add 2 {Rolling Stun} cards",
      ops: [{ add: 13, times: 2 }],
      boxes: [{ id: "brute-6-a" },{ id: "brute-6-b" }],
    },
    {
      label: "Add 1 {Rolling Disarm} and 1 {Rolling Muddle} cards",
      ops: [{ add: 9, times: 1 },{ add: 10, times: 1 }],
      boxes: [{ id: "brute-7-a" }],
    },
    {
      label: "Add 1  {Rolling Add Target} card",
      ops: [{ add: 8, times: 1 }],
      boxes: [{ id: "brute-8-a" },{ id: "brute-8-b" }],
    },
    {
      label: "Add 1 {Shield 1 Self} card",
      ops: [{ add: 14, times: 1 }],
      boxes: [{ id: "brute-9-a" }],
    },
    {
      label: "Ignore negative itemm effects and add 1 {+1} card",
      ops: [{ add: 3, times: 1 }],
      boxes: [{ id: "brute-10-a" }],
    },
  ],
  Tinkerer: [
    {
      label: "Remove 2 {-1} cards",
      ops: [{ remove: 5, times: 2 }],
      boxes: [{ id: "tink-0-a" },{ id: "tink-0-b" }],
    },

    {
      label: "Replace 1 {-2} card with 1 {+0} card",
      ops: [
        { add: 0, times: 1 },
        { remove: 6, times: 1 },
      ],
      boxes: [{ id: "tink-1-a" }],
    },
    {
      label: "Ignore negative scenario effects (No effect on deck)",
      ops: [],
      boxes: [{ id: "tink-10-a" }],
    },]
};

// Apply all checked boxes' effects to a deck
export function buildClassDeck(charClass, checkedBoxIds = []) {
  let deck = buildBaseDeck();
  const perks = PERKS_BY_CLASS[charClass] || [];

  for (const perk of perks) {
    for (const box of perk.boxes) {
      if (!checkedBoxIds.includes(box.id)) continue;

      for (const op of perk.ops) {
        const times = op.times ?? 1;
        for (let i = 0; i < times; i++) {
          if (op.remove !== undefined) deck = removeCard(deck, op.remove);
          if (op.add !== undefined) deck = addCard(deck, op.add);
        }
      }
    }
  }
  return deck;
}

export function PerkTable({ charClass, checkedBoxIds, onToggleBox }) {
  const perks = PERKS_BY_CLASS[charClass] || [];
  if (perks.length === 0) return null;

  return (
    <table className="perk-table">
      <thead></thead>
      <tbody>
        {perks.map((perk, perkIdx) => (
          <tr key={perkIdx}>
            <td>
              {perk.boxes.map((box) => (
                <input
                  key={box.id}
                  type="checkbox"
                  checked={checkedBoxIds.includes(box.id)}
                  onChange={() => onToggleBox(box.id)}
                  style={{ marginRight: "3px" }}
                />
              ))}
            </td>
            <td>
              <p>{perk.label}</p>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
