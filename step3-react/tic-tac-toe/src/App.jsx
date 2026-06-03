import { useState } from "react";

/* ============================================================
   React 入门：井字棋（Tic-Tac-Toe）
   基于 React 官方教程，涵盖核心概念：
   - 组件（Component）
   - JSX
   - Props（属性传递）
   - useState（状态管理）
   - 不可变更新（immutable update）
   - 列表渲染（map）
   - 条件渲染
   - 状态提升（lifting state up）
   ============================================================ */

// ==================== Square 组件 ====================
// 职责：渲染一个格子。通过 props 接收值和点击事件。
// 这是一个"受控组件"——它不管理自己的状态，完全由父组件控制。
function Square({ value, onSquareClick, isWinner }) {
  return (
    <button
      className={`square ${isWinner ? "square-winner" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

// ==================== Board 组件 ====================
// 职责：渲染 3×3 棋盘。接收 squares 数组和 onPlay 回调。
function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }

  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const winnerLine = winnerInfo ? winnerInfo.line : [];

  let status;
  if (winner) {
    status = `胜者：${winner}`;
  } else if (squares.every(Boolean)) {
    status = "平局！";
  } else {
    status = `下一步：${xIsNext ? "X" : "O"}`;
  }

  return (
    <>
      <div className="status">{status}</div>
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
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

// ==================== Game 组件（顶层） ====================
// 职责：管理整个游戏的状态——当前棋盘、历史记录、轮到谁
// 这叫做"状态提升"：把共享状态放在最近的公共祖先组件中
export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [ascending, setAscending] = useState(true);

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

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
    if (move === currentMove) {
      description = move > 0 ? `你在第 ${move} 步` : "游戏开始";
      return (
        <li key={move}>
          <span className="current-move">{description}</span>
        </li>
      );
    } else if (move > 0) {
      const prevSquares = history[move - 1];
      const changedIndex = squares.findIndex(
        (sq, i) => sq !== prevSquares[i]
      );
      const row = Math.floor(changedIndex / 3) + 1;
      const col = (changedIndex % 3) + 1;
      description = `跳到第 ${move} 步 (${row},${col})`;
    } else {
      description = "回到开始";
    }

    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  const displayedMoves = ascending ? moves : [...moves].reverse();

  return (
    <>
      <header className="app-header">
        <h1>React 入门：井字棋</h1>
        <p>
          打开 <code>src/App.jsx</code> 对照学习 — 组件、Props、useState、不可变更新
        </p>
      </header>
      <div className="game">
        <div className="game-board">
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
        </div>
        <div className="game-info">
          <button onClick={() => setAscending(!ascending)}>
            {ascending ? "↓ 降序排列" : "↑ 升序排列"}
          </button>
          <ol>{displayedMoves}</ol>
        </div>
      </div>
    </>
  );
}

// ==================== 工具函数 ====================
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
