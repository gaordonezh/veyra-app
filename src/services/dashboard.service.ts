import { getDatabase } from "../database/database";

export interface DashboardSummary {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  recentTransactions: {
    id: number;
    type: "income" | "expense";
    description: string;
    amount: number;
    date: string;
  }[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const db = await getDatabase();

  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const monthStart = `${year}-${month}-01`;

  const nextMonthDate = new Date(year, now.getMonth() + 1, 1);
  const nextMonth = `${nextMonthDate.getFullYear()}-${String(
    nextMonthDate.getMonth() + 1,
  ).padStart(2, "0")}-01`;

  const totals = await db.getFirstAsync<{
    balance: number;
    monthlyIncome: number;
    monthlyExpense: number;
  }>(
    `SELECT
      COALESCE(
        SUM(CASE
          WHEN type = 'income' THEN amount
          WHEN type = 'expense' THEN -amount
          ELSE 0
        END), 0
      ) AS balance,

      COALESCE(
        SUM(CASE
          WHEN type = 'income'
            AND date >= ? AND date < ?
          THEN amount
          ELSE 0
        END), 0
      ) AS monthlyIncome,

      COALESCE(
        SUM(CASE
          WHEN type = 'expense'
            AND date >= ? AND date < ?
          THEN amount
          ELSE 0
        END), 0
      ) AS monthlyExpense

    FROM transactions`,
    monthStart,
    nextMonth,
    monthStart,
    nextMonth,
  );

  const recentTransactions = await db.getAllAsync<
    DashboardSummary["recentTransactions"][number]
  >(
    `SELECT id, type, description, amount, date
     FROM transactions
     ORDER BY created_at DESC, id DESC
     LIMIT 5`,
  );

  return {
    balance: totals?.balance ?? 0,
    monthlyIncome: totals?.monthlyIncome ?? 0,
    monthlyExpense: totals?.monthlyExpense ?? 0,
    recentTransactions,
  };
}
