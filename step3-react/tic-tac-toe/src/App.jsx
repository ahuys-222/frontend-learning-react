import { useState } from "react";
import "./App.css";

function Square({ value, onSquareClick, isWinner, isFilled }) {
  return (
    <button
      className={[
        "square",
        value === "X" ? "square-x" : "",
        value === "O" ? "square-o" : "",
        isWinner ? "square-winner" : "",
        isFilled ? "square-filled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onSquareClick}
      aria-label={value ? `棋子 ${value}` : "空格子"}
    >
      <span>{value}</span>
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }

  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo?.winner ?? null;
  const winnerLine = winnerInfo?.line ?? [];
  const isDraw = !winner && squares.every(Boolean);

  let status;
  let statusTone = "status-neutral";
  if (winner) {
    status = `胜者 ${winner}`;
    statusTone = "status-winner";
  } else if (isDraw) {
    status = "平局";
    statusTone = "status-draw";
  } else {
    status = `下一步：${xIsNext ? "X" : "O"}`;
  }

  return (
    <>
      <div className={`status ${statusTone}`}>
        <span className="status-label">{status}</span>
        <span className="status-subtitle">
          {winner ? "连成三子，比赛结束" : isDraw ? "双方都很稳，这盘握手言和" : "点击任意空格继续"}
        </span>
      </div>

      <div className="board-shell" aria-label="井字棋棋盘">
        {[0, 1, 2].map((row) => (
          <div className="board-row" key={row}>
            {[0, 1, 2].map((col) => {
              const i = row * 3 + col;
              return (
                <Square
                  key={i}
                  value={squares[i]}
                  onSquareClick={() => handleClick(i)}
                  isWinner={winnerLine.includes(i)}
                  isFilled={Boolean(squares[i])}
                />
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [ascending, setAscending] = useState(true);

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const winnerInfo = calculateWinner(currentSquares);
  const winner = winnerInfo?.winner ?? null;
  const isDraw = !winner && currentSquares.every(Boolean);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(move) {
    setCurrentMove(move);
  }

  const moves = history.map((squares, move) => {
    let description;

    if (move === 0) {
      description = "回到开局";
    } else {
      const prevSquares = history[move - 1];
      const changedIndex = squares.findIndex((sq, i) => sq !== prevSquares[i]);
      const row = Math.floor(changedIndex / 3) + 1;
      const col = (changedIndex % 3) + 1;
      description = `第 ${move} 步 (${row}, ${col})`;
    }

    const isCurrent = move === currentMove;

    return (
      <li key={move}>
        {isCurrent ? (
          <span className="current-move" aria-current="step">
            {move === 0 ? "游戏开始" : `当前：${description}`}
          </span>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  const displayedMoves = ascending ? moves : [...moves].reverse();

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Tic Tac Toe</p>
        <h1>把一个简单的井字棋，做得更有气质一点</h1>
        <p className="hero-copy">
          保留原来的 React 逻辑，重新打磨成更干净的卡片布局、玻璃拟态质感和更有层次的棋盘体验。
        </p>
      </section>

      <section className="game">
        <div className="game-board-panel">
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
        </div>

        <aside className="game-info-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">比赛信息</p>
              <h2>{winner ? "对局已分胜负" : isDraw ? "对局结束" : "实时回放"}</h2>
            </div>

            <button className="toggle-button" onClick={() => setAscending((value) => !value)}>
              {ascending ? "降序" : "升序"}
            </button>
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <span>回合</span>
              <strong>{currentMove}</strong>
            </div>
            <div className="summary-card">
              <span>轮到</span>
              <strong>{winner || isDraw ? "-" : xIsNext ? "X" : "O"}</strong>
            </div>
          </div>

          <ol className="history-list">{displayedMoves}</ol>
        </aside>
      </section>
    </main>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }

  return null;
}
