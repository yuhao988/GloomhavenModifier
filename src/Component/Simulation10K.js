import Modal from "react-modal";
import { useState } from "react";
import "./Modal.css";

export function Simulation10K(prop) {
  const { isOpen, onClose, importDeck } = prop;

  const [baseDamage, setBaseDamage] = useState(0);
  const [enemyShield, setEnemyShield] = useState(0);
  const [result, setResult] = useState(null);
  const [trials, setTrials] = useState(10000);
  const [average, setAverage] = useState(null);

  const handleCloseModal = () => {
    onClose();
  };

  const handleIntChange = (setter, min, max) => (e) => {
    const raw = e.target.value;
    if (raw === "") {
      setter("");
      return;
    }
    if (!/^\d+$/.test(raw)) return;
    const n = parseInt(raw, 10);
    if (n < min || n > max) return;
    setter(n);
  };

  // Draw once, apply special cases, return final damage
  const simulateOneDraw = (deck, dmg, shield) => {
    if (deck.length === 0) return null;
    const card = deck[Math.floor(Math.random() * deck.length)];
    const value = card.Value;

    if (value === -99) return 0;
    if (value === 99) return dmg * 2 - shield;
    return dmg + value - shield;
  };

  // Run a single simulation and display the result
  const runSingle = () => {
    const dmg = Number(baseDamage) || 0;
    const shield = Number(enemyShield) || 0;
    const out = simulateOneDraw(importDeck, dmg, shield);
    setResult(out);
    setAverage(null);
  };

  // Optional: run N trials, display the average
  const runAverage = () => {
    const dmg = Number(baseDamage) || 0;
    const shield = Number(enemyShield) || 0;
    const n = trials;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const out = simulateOneDraw(importDeck, dmg, shield);
      if (out !== null) sum += out;
    }
    setAverage(sum / n);
    setResult(null);
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <button onClick={handleCloseModal} className="modal-close-button">
        X
      </button>

      <p>Base damage (include Poison and item effects):</p>
      <input
        type="number"
        min={0}
        max={99}
        value={baseDamage}
        onChange={handleIntChange(setBaseDamage, 0, 99)}
        style={{ width: "6ch", marginBottom: "12px" }}
      />

      <p>Enemy Shield:</p>
      <input
        type="number"
        min={0}
        max={10}
        value={enemyShield}
        onChange={handleIntChange(setEnemyShield, 0, 10)}
        style={{ width: "6ch", marginBottom: "12px" }}
      />

      <br />
      <button onClick={runSingle} style={{ marginRight: "8px" }}>
        Simulate Draw
      </button>
      <button onClick={runAverage}>Average over {trials}</button>

      {result !== null && (
        <p style={{ marginTop: "12px" }}>
          Damage dealt: <strong>{result}</strong>
        </p>
      )}
      {average !== null && (
        <p style={{ marginTop: "12px" }}>
          Average damage over {trials} draws:{" "}
          <strong>{average.toFixed(2)}</strong>
        </p>
      )}
    </Modal>
  );
}
