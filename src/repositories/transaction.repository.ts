import type { SQLiteDatabase } from "expo-sqlite";
import { Transaction } from "../types";

export interface CreateTransactionData {
  type: "income" | "expense";
  description: string;
  amount: number;
  date: string;
  notes?: string | null;
}

export async function getAllTransactions(
  db: SQLiteDatabase,
): Promise<Transaction[]> {
  return db.getAllAsync<Transaction>(
    `SELECT *
     FROM transactions
     ORDER BY date DESC, id DESC`,
  );
}

export async function insertTransaction(
  db: SQLiteDatabase,
  data: CreateTransactionData,
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO transactions (
      type,
      description,
      amount,
      date,
      notes
    ) VALUES (?, ?, ?, ?, ?)`,
    data.type,
    data.description,
    data.amount,
    data.date,
    data.notes ?? null,
  );

  return result.lastInsertRowId;
}

export async function removeTransaction(
  db: SQLiteDatabase,
  id: number,
): Promise<void> {
  await db.runAsync(`DELETE FROM transactions WHERE id = ?`, id);
}
