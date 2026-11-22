export type TransactionType = "income" | "expense";

export type ObligationStatus = "pending" | "partial" | "paid" | "overpaid";
export type RecurringFrecuency = "monthly" | "once";

export interface Transaction {
  id: number;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  category_id: number | null;
  obligation_id: number | null;
  notes: string | null;
}

export interface RecurringRule {
  id: number;
  type: TransactionType;
  name: string;
  amount: number;
  start_date: string;
  due_day: number;
  frequency: RecurringFrecuency;
  active: boolean;
  notes: string | null;
}

export interface Obligation {
  id: number;
  recurring_rule_id: number;
  period: string;
  amount_due: number;
  due_date: string;
}

export interface ObligationSummary extends Obligation {
  amount_paid: number;
  amount_pending: number;
  status: ObligationStatus;
}

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
}
