export type Category = 'Alimentação' | 'Transporte' | 'Lazer' | 'Saúde' | 'Educação' | 'Moradia' | 'Serviços' | 'Outros';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  date: string;
  isFixed?: boolean;
}

export interface FixedExpense {
  id: string;
  description: string;
  amount: number;
  category: Category;
}

export interface MonthlySalary {
  month: string; // YYYY-MM
  amount: number;
}

export type GoalType = 'Financeira' | 'Pessoal';
export type GoalStatus = 'Em andamento' | 'Concluída';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: GoalType;
  target_amount?: number;
  current_amount?: number;
  deadline?: string;
  status: GoalStatus;
  created_at: string;
}

export const CATEGORIES: Category[] = [
  'Alimentação',
  'Transporte',
  'Lazer',
  'Saúde',
  'Educação',
  'Moradia',
  'Serviços',
  'Outros'
];

export const CATEGORY_COLORS: Record<Category, string> = {
  'Alimentação': '#f59e0b', // Amber
  'Transporte': '#6366f1', // Indigo
  'Lazer': '#ec4899', // Pink
  'Saúde': '#ef4444', // Red
  'Educação': '#8b5cf6', // Violet
  'Moradia': '#10b981', // Emerald
  'Serviços': '#06b6d4', // Cyan
  'Outros': '#64748b', // Slate
};
