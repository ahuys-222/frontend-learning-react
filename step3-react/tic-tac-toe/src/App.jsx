// 从 React 库中导入 useState Hook —— React 提供的"状态记忆"函数
import { useState } from "react";
// 导入同目录下的 CSS 样式文件，让 JSX 中的 className 能匹配到样式
import "./App.css";

// ======================= Square 组件：单个格子 =======================
// 接收 4 个 props（父组件传来的数据），用解构语法直接取出
// value: 格子里显示的内容（"X" / "O" / null）
// onSquareClick: 点击格子时触发的回调函数
// isWinner: 这个格子是否在胜利线上（true/false）
// isFilled: 这个格子是否已经被下过（true/false）
function Square({ value, onSquareClick, isWinner, isFilled }) {
  // return 后面跟括号表示返回括号内的 JSX 元素
  return (
    // <button> 是可点击的按钮元素，这里用作棋盘格子
    <button
      // className 在 JSX 中等同于 HTML 的 class 属性
      // 用数组装多个类名，最后拼成一个字符串 "square square-x square-winner ..."
      className={[
        "square",                              // 基础样式，每个格子都有
        value === "X" ? "square-x" : "",       // 如果值是 X → 加蓝色样式，否则不加
        value === "O" ? "square-o" : "",       // 如果值是 O → 加金色样式，否则不加
        isWinner ? "square-winner" : "",       // 如果在胜利线上 → 加高亮样式
        isFilled ? "square-filled" : "",       // 如果已落子 → 加填充样式
      ]
        .filter(Boolean)   // 过滤掉数组里的空字符串 ""，只保留有值的类名
        .join(" ")}        // 用空格把类名拼起来，例如 "square square-x square-filled"
      // 点击事件：触发父组件传下来的回调
      onClick={onSquareClick}
      // aria-label 是无障碍属性，屏幕阅读器会读出这段文字
      // 有值就读 "棋子 X"，没值就读 "空格子"
      aria-label={value ? `棋子 ${value}` : "空格子"}
    >
      {/* <span> 包裹文字，方便单独做微调（CSS 里用它做了 -2px 上移） */}
      <span>{value}</span>
    </button>
  );
}

// ======================= Board 组件：3×3 棋盘 =======================
// xIsNext: 当前轮到谁（true = X, false = O）
// squares: 当前 9 个格子的数组，如 ["X", null, "O", ...]
// onPlay: 下完一步后通知父组件的回调
function Board({ xIsNext, squares, onPlay }) {
  // --- 点击格子的处理逻辑 ---
  function handleClick(i) {
    // 如果已经有人赢了 → 直接返回，不许继续下
    // 如果当前格子已经有值 → 直接返回，不许覆盖
    if (calculateWinner(squares) || squares[i]) return;
    // .slice() 无参调用 = 浅拷贝整个数组（不动原数组，React 要求不可变更新）
    const nextSquares = squares.slice();
    // 根据 xIsNext 决定填 "X" 还是 "O"
    nextSquares[i] = xIsNext ? "X" : "O";
    // 把新数组交给父组件 Game 处理
    onPlay(nextSquares);
  }

  // --- 判断当前棋盘状态 ---
  const winnerInfo = calculateWinner(squares);     // 调用判胜函数，返回 {winner, line} 或 null
  const winner = winnerInfo?.winner ?? null;        // 可选链 ?. 防止 null 报错；?? 表示如果是 undefined/null 就用 null
  const winnerLine = winnerInfo?.line ?? [];         // 胜利线的三个格子索引，如 [0,1,2]，没赢就是空数组
  const isDraw = !winner && squares.every(Boolean);  // 没赢 + 每个格子都有值 = 平局

  // --- 根据状态决定显示什么文字 ---
  let status;                            // 主状态文字
  let statusTone = "status-neutral";     // 状态色调（默认中性）
  if (winner) {
    status = `胜者 ${winner}`;           // 有人赢 → "胜者 X"
    statusTone = "status-winner";        // 金色高亮
  } else if (isDraw) {
    status = "平局";                     // 平局
    statusTone = "status-draw";          // 绿色
  } else {
    status = `下一步：${xIsNext ? "X" : "O"}`;  // 进行中 → "下一步：X"
  }

  // --- 渲染棋盘 ---
  return (
    // <> 是 Fragment（片段）的简写，用来包裹多个元素而不产生多余的 DOM 节点
    <>
      {/* 状态栏：显示当前谁赢/平局/轮到谁 */}
      <div className={`status ${statusTone}`}>
        <span className="status-label">{status}</span>
        <span className="status-subtitle">
          {/* 三元表达式嵌套：赢 → 提示1，平 → 提示2，否则 → 提示3 */}
          {winner ? "连成三子，比赛结束" : isDraw ? "双方都很稳，这盘握手言和" : "点击任意空格继续"}
        </span>
      </div>

      {/* board-shell 是棋盘的外壳容器（带背景和圆角） */}
      <div className="board-shell" aria-label="井字棋棋盘">
        {/* 第一层 map：生成 3 行（row = 0, 1, 2） */}
        {[0, 1, 2].map((row) => (
          <div className="board-row" key={row}>
            {/* 第二层 map：每行生成 3 列（col = 0, 1, 2） */}
            {[0, 1, 2].map((col) => {
              // 把二维坐标 (row, col) 转成一维索引 i（0~8）
              const i = row * 3 + col;
              return (
                <Square
                  key={i}                           // React 列表渲染要求的唯一 key
                  value={squares[i]}                // 当前格子的值（"X"/"O"/null）
                  onSquareClick={() => handleClick(i)}  // 点击时调用 handleClick 并传入索引
                  isWinner={winnerLine.includes(i)} // 当前格子索引是否在胜利线数组中
                  isFilled={Boolean(squares[i])}    // 把值转成布尔值（null → false, "X" → true）
                />
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

// ======================= Game 组件：整个应用的总控（默认导出） =======================
// export default 表示这个组件可以被其他文件 import 使用
export default function Game() {
  // --- 三个状态（state），React 会在它们变化时自动重新渲染 ---
  // history: 每一步的棋盘快照数组。初始值 = 一个包含 9 个 null 的数组（空棋盘）
  const [history, setHistory] = useState([Array(9).fill(null)]);
  // currentMove: 当前查看的是第几步（0 = 开局）
  const [currentMove, setCurrentMove] = useState(0);
  // ascending: 历史记录是升序（true）还是降序（false）
  const [ascending, setAscending] = useState(true);

  // --- 派生值：不需要 useState，直接从现有 state 计算 ---
  // 步数是偶数 → X 走；奇数 → O 走（0%2=0, 1%2=1, 2%2=0...）
  const xIsNext = currentMove % 2 === 0;
  // 根据 currentMove 从历史中取出对应的棋盘快照
  const currentSquares = history[currentMove];
  // 判断当前棋盘是否有人赢了
  const winnerInfo = calculateWinner(currentSquares);
  const winner = winnerInfo?.winner ?? null;
  // 没赢 + 所有格子都有值 = 平局
  const isDraw = !winner && currentSquares.every(Boolean);

  // --- 处理下棋：Board 调用 onPlay 时会传回新的 squares 数组 ---
  function handlePlay(nextSquares) {
    // history.slice(0, currentMove + 1)：截断历史
    // 如果当前在第 3 步查看历史，此时下棋 → 第 4 步之后的历史全部丢弃
    // [...截断部分, nextSquares]：把新棋盘追加到末尾
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);                          // 更新历史记录
    setCurrentMove(nextHistory.length - 1);           // 跳到最新一步
  }

  // --- 时间旅行：跳到历史中的某一步 ---
  function jumpTo(move) {
    setCurrentMove(move);  // 只需更新步数，棋盘会自动从 history 中取对应的快照
  }

  // --- 生成历史记录列表 ---
  // history.map 遍历每一步，生成对应的 <li> 元素
  const moves = history.map((squares, move) => {
    let description;  // 每一步的描述文字

    if (move === 0) {
      description = "回到开局";              // 第 0 步是空棋盘
    } else {
      const prevSquares = history[move - 1];  // 上一步的棋盘
      // findIndex 找到这次变化发生在哪个格子（值和上一步不同的那个）
      const changedIndex = squares.findIndex((sq, i) => sq !== prevSquares[i]);
      // 把一维索引 0~8 转成人类可读的行列 (从 1 开始)
      const row = Math.floor(changedIndex / 3) + 1;  // 0,1,2 → 转成 1,2,3 行
      const col = (changedIndex % 3) + 1;             // 0,1,2 → 转成 1,2,3 列
      description = `第 ${move} 步 (${row}, ${col})`; // 例如 "第 1 步 (2, 3)"
    }

    const isCurrent = move === currentMove;  // 这一步是不是当前正在查看的

    return (
      <li key={move}>
        {/* 当前步 → 显示为不可点击的文字；其他步 → 显示为可点击的按钮 */}
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

  // 根据 ascending 状态决定正序还是倒序显示
  const displayedMoves = ascending ? moves : [...moves].reverse();

  // --- 渲染整个页面 ---
  return (
    <main className="app">
      {/* 顶部标题区（Hero） */}
      <section className="hero">
        <p className="eyebrow">Tic Tac Toe</p>
        <h1>简单的井字棋</h1>
        <p className="hero-copy">
          实验 React 逻辑，同时打造更优质的棋盘体验。
        </p>
      </section>

      {/* 游戏主区域：棋盘 + 侧边栏 */}
      <section className="game">
        {/* 左侧：棋盘面板（毛玻璃卡片） */}
        <div className="game-board-panel">
          {/* 把状态数据和方法传给 Board 组件 */}
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
        </div>

        {/* 右侧：信息面板 */}
        <aside className="game-info-panel">
          {/* 面板头部：标题 + 排序切换按钮 */}
          <div className="panel-header">
            <div>
              <p className="panel-kicker">比赛信息</p>
              {/* 根据赢/平/进行中动态显示标题 */}
              <h2>{winner ? "对局已分胜负" : isDraw ? "对局结束" : "实时回放"}</h2>
            </div>
            {/* 点击按钮切换升序/降序，setAscending 用函数式更新取反 */}
            <button className="toggle-button" onClick={() => setAscending((value) => !value)}>
              {ascending ? "降序" : "升序"}
            </button>
          </div>

          {/* 摘要卡片：显示回合数和当前轮到谁 */}
          <div className="summary-cards">
            <div className="summary-card">
              <span>回合</span>
              <strong>{currentMove}</strong>
            </div>
            <div className="summary-card">
              <span>轮到</span>
              {/* 赢了或平局显示 "-"，否则显示当前玩家 */}
              <strong>{winner || isDraw ? "-" : xIsNext ? "X" : "O"}</strong>
            </div>
          </div>

          {/* 有序列表：历史记录，点击可跳转到任意一步 */}
          <ol className="history-list">{displayedMoves}</ol>
        </aside>
      </section>
    </main>
  );
}

// ======================= 工具函数：判断胜负 =======================
// 不是组件！只是一个普通的纯函数，放在组件外面
// squares: 当前 9 个格子的数组
// 返回值：{ winner: "X", line: [0,1,2] } 或 null
function calculateWinner(squares) {
  // 8 条可能的连线：3 横 + 3 竖 + 2 对角
  const lines = [
    [0, 1, 2],  // 第 1 行
    [3, 4, 5],  // 第 2 行
    [6, 7, 8],  // 第 3 行
    [0, 3, 6],  // 第 1 列
    [1, 4, 7],  // 第 2 列
    [2, 5, 8],  // 第 3 列
    [0, 4, 8],  // 左上到右下对角
    [2, 4, 6],  // 右上到左下对角
  ];

  // 遍历 8 条线，用解构语法取出三个索引
  for (const [a, b, c] of lines) {
    // 检查三个格子：①不为 null、②三个值都相同
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      // 返回赢家和胜利线（供 Board 高亮格子用）
      return { winner: squares[a], line: [a, b, c] };
    }
  }

  // 没有赢家 → 返回 null
  return null;
}
