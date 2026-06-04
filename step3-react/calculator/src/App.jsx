import { useState } from "react";

// ======================= 按钮布局 =======================
// 把按钮排成二维数组，每一行是一个数组，方便用两层 map 渲染
const BUTTONS = [
  ["AC", "+/-", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];

export default function App() {
  const [display, setDisplay] = useState("0");       // 屏幕上显示的内容
  const [prevValue, setPrevValue] = useState(null);  // 上一步存的值（用于运算）
  const [operator, setOperator] = useState(null);    // 当前选中的运算符（+ - × ÷）
  const [resetDisplay, setResetDisplay] = useState(false); // 下次按数字是否需要清屏

  // ======================= 处理数字点击 =======================
  function handleNumber(num) {
    // 两种清屏的情况：①刚算完需要清屏 ②当前显示就是 "0"
    if (resetDisplay || display === "0") {
      setDisplay(num);            // 直接换掉
      setResetDisplay(false);     // 取消清屏标记，后续数字正常拼接
    } else {
      setDisplay(display + num);  // 拼接：比如 "12" + "3" = "123"
    }
  }

  // ======================= 处理小数点 =======================
  function handleDot() {
    if (resetDisplay) {
      setDisplay("0.");
      setResetDisplay(false);
      return;
    }
    if (display.includes(".")) return; // 已经有小数点了，不管
    setDisplay(display + ".");
  }

  // ======================= 处理运算符 =======================
  function handleOperator(op) {
    // 如果已经有老运算符 → 先算出结果再存新运算符（比如 1+2 后再按 -，应该先算 3）
    if (operator && !resetDisplay) {
      const result = calculate(prevValue, display, operator);
      setDisplay(result);
      setPrevValue(result);
    } else {
      setPrevValue(display);
    }
    setOperator(op);
    setResetDisplay(true); // 清屏，准备输入第二个数
  }

  // ======================= 处理等号 =======================
  function handleEquals() {
    if (operator === null || resetDisplay) return; // 没选运算符，或者刚选完还没输数字 → 不管
    const result = calculate(prevValue, display, operator);
    setDisplay(result);
    setPrevValue(null);
    setOperator(null);
    setResetDisplay(true); // 下次按数字会清屏（因为这是新一次计算的开头）
  }

  // ======================= 处理清空 =======================
  function handleClear() {
    setDisplay("0");
    setPrevValue(null);
    setOperator(null);
    setResetDisplay(false);
  }

  // ======================= 处理正负号 =======================
  function handleToggleSign() {
    if (display === "0") return;            // 0 没有正负
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
  }

  // ======================= 处理百分比 =======================
  function handlePercent() {
    setDisplay(String(Number(display) / 100));
  }

  // ======================= 按钮点击总入口 =======================
  // 所有按钮点完都到这，根据内容判断该调哪个函数
  function handleButtonClick(label) {
    // isNaN 判断是不是"非数字"："7"→不执行、"+"→执行
    if (!isNaN(label)) {
      handleNumber(label);
    } else if (label === "AC") {
      handleClear();
    } else if (label === "+/-") {
      handleToggleSign();
    } else if (label === "%") {
      handlePercent();
    } else if (label === ".") {
      handleDot();
    } else if (label === "=") {
      handleEquals();
    } else {
      // 剩下的就是 + - × ÷
      handleOperator(label);
    }
  }

  // ======================= 判断按钮的样式类型 =======================
  function getButtonClass(label) {
    if (label === "0") return "btn-zero";                           // 0 占两格宽
    if (["AC", "+/-", "%"].includes(label)) return "btn-gray";     // 顶部功能键：灰色
    if (["÷", "×", "-", "+", "="].includes(label)) return "btn-orange"; // 运算符：橙色
    return "btn-dark";                                              // 数字键：深色
  }

  return (
    <div className="calculator">
      {/* ===== 显示屏 ===== */}
      <div className="display">{display}</div>

      {/* ===== 按钮键盘 ===== */}
      <div className="keypad">
        {/* 两层 map：行 → 列，井字棋里用过一样的模式 */}
        {BUTTONS.map((row, rowIndex) => (
          <div className="keypad-row" key={rowIndex}>
            {row.map((label) => (
              <button
                key={label}
                className={`btn ${getButtonClass(label)}`}
                onClick={() => handleButtonClick(label)}
              >
                {label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================= 工具函数：执行运算 =======================
// a 和 b 是字符串，op 是运算符符号，返回字符串结果
function calculate(a, b, op) {
  const numA = Number(a);
  const numB = Number(b);
  let result;

  switch (op) {
    case "+": result = numA + numB; break;
    case "-": result = numA - numB; break;
    case "×": result = numA * numB; break;
    case "÷":
      if (numB === 0) return "Error";                  // 除以 0 保护
      result = numA / numB;
      break;
    default: return b;
  }

  // 浮点数精度处理：比如 0.1+0.2=0.30000000000000004，四舍五入到 10 位
  result = Math.round(result * 1e10) / 1e10;
  // 去掉末尾无意义的 0：比如 "5.00"→"5"，但 "0.5" 原样保留
  return String(Number(result));
}
