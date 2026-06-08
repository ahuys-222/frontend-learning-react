// ======================= 共享类型 =======================

/** 一条记账记录 */
export interface ExpenseItem {
  id: number;
  amount: number;
  category: string;
  note: string;
  date: string;
}

/** 分类定义 */
export interface Category {
  key: string;
  icon: string;
  color: string;
}

/** 用户信息（登录成功后存 localStorage 的） */
export interface AuthUser {
  token: string;
  userId: number;
  username: string;
}

/** 待办事项 */
export interface TodoItem {
  id: number;
  text: string;
  done: boolean;
}
