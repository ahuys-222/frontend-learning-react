/* ============================================================
   JavaScript 基础 + ES6 — React 前置技能
   打开浏览器控制台（F12 → Console）看 console.log 输出
   边看边改，实验是最好的学习方式
   ============================================================ */

// ==================== 1. 变量声明 ====================
// ❌ 不要再用 var — 作用域混乱，有提升（hoisting）问题
// ✅ 用 const（不变的）和 let（会变的）

function demoVariables() {
  const name = "张三";       // const：声明后不能重新赋值
  let age = 25;              // let：可以重新赋值

  // name = "李四";          // ❌ 报错！const 不能改
  age = 26;                  // ✅ let 可以改

  // 作用域演示
  if (true) {
    const blockScoped = "我只在这个块里有效";
    let alsoBlockScoped = "我也是块作用域";
    var functionScoped = "我是函数作用域，外面也能访问（危险的）"; // eslint-disable-line
  }
  // console.log(blockScoped); // ❌ 报错！访问不到

  console.log("=== 变量演示 ===");
  console.log("name:", name, "| age:", age);
  console.log("var 泄漏到块外:", functionScoped);
  console.log("结论：用 const 声明不变的，用 let 声明会变的，不用 var");
}

// ==================== 2. 函数 — 三种写法 ====================
// 普通函数声明
function multiply(a, b) {
  return a * b;
}

// 函数表达式
const divide = function (a, b) {
  return a / b;
};

// 箭头函数（React 中最常用）
const add = (a, b) => a + b;                    // 单行可以省略 {} 和 return
const greet = (name) => `你好，${name}`;         // 一个参数可以省略 ()
const noArgs = () => "没有参数的箭头函数";

function demoFunctions() {
  console.log("=== 函数演示 ===");
  console.log("普通函数 multiply(3, 4):", multiply(3, 4));
  console.log("函数表达式 divide(10, 2):", divide(10, 2));
  console.log("箭头函数 add(5, 6):", add(5, 6));
  console.log("箭头函数 greet:", greet("张三"));
  console.log("箭头函数 noArgs:", noArgs());

  // ⚠️ 箭头函数 vs 普通函数的关键区别：this 指向
  // 箭头函数没有自己的 this，继承外层作用域的 this
  // React 类组件中这很重要，但函数组件 + hooks 时代这已经不是问题了
}

// ==================== 3. 数组方法（最重要！React 每天都在用） ====================

function demoArrays() {
  const numbers = [1, 2, 3, 4, 5, 6];
  const users = [
    { name: "张三", age: 25, active: true },
    { name: "李四", age: 17, active: false },
    { name: "王五", age: 30, active: true },
    { name: "赵六", age: 22, active: false },
  ];

  // map — 把数组的每个元素转换成新东西（React 渲染列表的核心）
  const doubled = numbers.map((n) => n * 2);
  const names = users.map((user) => user.name);

  // filter — 筛选出符合条件的元素
  const adults = users.filter((user) => user.age >= 18);
  const activeUsers = users.filter((user) => user.active);

  // find — 找到第一个符合条件的元素
  const wangwu = users.find((user) => user.name === "王五");

  // some — 是否至少有一个满足条件
  const hasUnderage = users.some((user) => user.age < 18);

  // every — 是否全部满足条件
  const allActive = users.every((user) => user.active);

  // reduce — 累积计算（求和、统计等）
  const totalAge = users.reduce((sum, user) => sum + user.age, 0);

  console.log("=== 数组方法演示 ===");
  console.log("原始数组:", numbers);
  console.log("map 翻倍:", doubled);
  console.log("map 取名字:", names);
  console.log("filter 成年人:", adults);
  console.log("find 找到王五:", wangwu);
  console.log("some 有未成年人:", hasUnderage);
  console.log("every 全部活跃:", allActive);
  console.log("reduce 年龄总和:", totalAge);

  // 显示在页面上
  const output = document.getElementById("array-demo-output");
  output.innerHTML = `
    <p><strong>原始:</strong> [${numbers}]</p>
    <p><strong>map 翻倍:</strong> [${doubled}]</p>
    <p><strong>filter 成年人:</strong> ${JSON.stringify(adults)}</p>
    <p><strong>find 王五:</strong> ${JSON.stringify(wangwu)}</p>
    <p><strong>reduce 总年龄:</strong> ${totalAge}</p>
  `;
}

// ==================== 4. 解构赋值 & 展开运算符 ====================

function demoDestructuring() {
  // 对象解构 — React props 的核心模式
  const user = { name: "张三", age: 25, city: "北京", job: "前端" };
  const { name, age, city } = user;
  // 等价于：const name = user.name; const age = user.age; const city = user.city;

  // 解构时重命名
  const { name: userName, job: occupation } = user;

  // 解构时给默认值
  const { hobby = "编程" } = user; // user 里没 hobby，用默认值

  // 数组解构 — React useState 的返回值就是这样用的
  const colors = ["红", "绿", "蓝"];
  const [first, second, third] = colors;
  // 等价于：const first = colors[0]; const second = colors[1];

  // 跳过某些元素
  const [, , onlyBlue] = colors;

  // 展开运算符（spread）...
  const newUser = { ...user, age: 26, country: "中国" }; // 复制并覆盖/新增属性
  const moreColors = [...colors, "黄", "紫"];           // 数组也一样
  const merged = [...colors, ...moreColors];             // 合并数组

  console.log("=== 解构 & 展开演示 ===");
  console.log("对象解构:", name, age, city);
  console.log("重命名:", userName, occupation);
  console.log("默认值:", hobby);
  console.log("数组解构:", first, second, third);
  console.log("跳过元素:", onlyBlue);
  console.log("展开对象:", newUser);
  console.log("展开数组:", moreColors);
}

// ==================== 5. 模板字符串 ====================

function demoTemplateLiterals() {
  const name = "张三";
  const items = 3;
  const price = 99;

  // 旧写法（字符串拼接 — 容易出错）
  const old = name + "买了" + items + "件商品，共" + items * price + "元";

  // 模板字符串 — 清晰直观
  const modern = `${name}买了${items}件商品，共${items * price}元`;

  // 多行字符串 — 不需要 \n
  const multiline = `
    第一行
    第二行
    第三行
    ${name}在这里
  `;

  console.log("=== 模板字符串演示 ===");
  console.log("旧写法:", old);
  console.log("模板字符串:", modern);
  console.log("多行:", multiline);
}

// ==================== 6. 异步编程 ====================

// 模拟网络请求（2秒后返回数据）
function fetchUserData() {
  return new Promise((resolve, reject) => {
    console.log("开始请求…");
    setTimeout(() => {
      // 模拟：90% 成功率
      if (Math.random() > 0.1) {
        resolve({ id: 1, name: "张三", email: "zhangsan@example.com" });
      } else {
        reject(new Error("网络错误"));
      }
    }, 2000);
  });
}

// async/await 写法 — React 中请求数据的标准方式
async function demoAsync() {
  const output = document.getElementById("async-demo-output");
  output.textContent = "请求中…⏳";

  try {
    // await 会"暂停"执行，等待 Promise 完成
    const user = await fetchUserData();
    console.log("=== 异步演示（成功）===");
    console.log("获取到的用户:", user);
    output.innerHTML = `<span style="color: #059669;">获取成功：${user.name} — ${user.email}</span>`;
  } catch (error) {
    console.log("=== 异步演示（失败）===");
    console.error(error);
    output.innerHTML = `<span style="color: #dc2626;">获取失败：${error.message}</span>`;
  }
}

// ==================== 7. DOM 操作 ====================

function demoDOM() {
  // 获取元素
  const target = document.getElementById("dom-target");

  // 修改内容 — textContent（纯文本，安全）vs innerHTML（HTML，小心 XSS）
  target.textContent = "已改变！" + new Date().toLocaleTimeString();

  // 修改样式
  target.style.color = "#3b82f6";
  target.style.fontSize = "1.3em";

  // 修改 class
  target.classList.toggle("changed");
}

function demoDOMCreate() {
  // 创建新元素
  const newEl = document.createElement("p");
  newEl.textContent = "我是动态创建的！时间：" + new Date().toLocaleTimeString();
  newEl.style.background = "#dbeafe";
  newEl.style.padding = "8px";
  newEl.style.borderRadius = "6px";

  // 插入到 DOM 中
  const parent = document.getElementById("dom-target").parentElement;
  parent.appendChild(newEl);
}

// ==================== 8. 事件处理 ====================

// 页面加载完成后绑定事件
document.addEventListener("DOMContentLoaded", () => {
  const area = document.getElementById("event-area");
  const log = document.getElementById("event-log");

  if (!area || !log) return;

  // mouseenter — 鼠标进入
  area.addEventListener("mouseenter", () => {
    area.style.background = "#3b82f6";
    area.style.color = "white";
    log.textContent = "👆 鼠标进入了区域";
  });

  // mouseleave — 鼠标离开
  area.addEventListener("mouseleave", () => {
    area.style.background = "#e2e8f0";
    area.style.color = "#1e293b";
    log.textContent = "👋 鼠标离开了区域";
  });

  // click — 点击
  area.addEventListener("click", (event) => {
    // event 对象包含事件的所有信息
    log.textContent = `🎯 点击位置：(${event.clientX}, ${event.clientY}) — 事件目标：${event.target.tagName}`;
  });
});

// ==================== 综合练习：Todo ====================

let todos = []; // 用数组存储待办事项

function renderTodos() {
  const list = document.getElementById("todo-list");
  const count = document.getElementById("todo-count");

  // 用 map 把数据转成 HTML 列表
  list.innerHTML = todos
    .map(
      (todo, index) => `
      <li style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0;">
        <span style="${todo.done ? "text-decoration: line-through; color: #94a3b8;" : ""}">
          ${todo.text}
        </span>
        <span>
          <button onclick="toggleTodo(${index})" class="btn-small">
            ${todo.done ? "撤销" : "完成"}
          </button>
          <button onclick="deleteTodo(${index})" class="btn-small btn-danger">删除</button>
        </span>
      </li>
    `
    )
    .join(""); // join 把数组变成字符串

  const remaining = todos.filter((t) => !t.done).length;
  count.textContent = `共 ${todos.length} 项，${remaining} 项未完成`;
}

function addTodo() {
  const input = document.getElementById("todo-input");
  const text = input.value.trim();
  if (!text) return;

  // 不直接修改原数组 — 创建新数组（React 的核心思想：不可变更新）
  todos = [...todos, { text, done: false }];
  input.value = "";
  renderTodos();
}

function toggleTodo(index) {
  // 用 map 创建新数组，只修改目标项
  todos = todos.map((todo, i) =>
    i === index ? { ...todo, done: !todo.done } : todo
  );
  renderTodos();
}

function deleteTodo(index) {
  // 用 filter 移除目标项
  todos = todos.filter((_, i) => i !== index);
  renderTodos();
}
