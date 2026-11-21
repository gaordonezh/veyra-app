import type { SQLiteDatabase } from "expo-sqlite";
import type { Transaction } from "../types";

export interface CreateTransactionData {
  type: "income" | "expense";
  description: string;
  amount: number;
  date: string;
  notes?: string | null;
}

export type UpdateTransactionData = CreateTransactionData;

export async function getAllTransactions(
  db: SQLiteDatabase,
): Promise<Transaction[]> {
  return db.getAllAsync<Transaction>(
    `SELECT *
     FROM transactions
     ORDER BY date DESC, id DESC`,
  );
}

export async function getTransactionById(
  db: SQLiteDatabase,
  id: number,
): Promise<Transaction | null> {
  return db.getFirstAsync<Transaction>(
    `SELECT *
     FROM transactions
     WHERE id = ?`,
    id,
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

export async function updateTransaction(
  db: SQLiteDatabase,
  id: number,
  data: UpdateTransactionData,
): Promise<boolean> {
  const result = await db.runAsync(
    `UPDATE transactions
     SET
       type = ?,
       description = ?,
       amount = ?,
       date = ?,
       notes = ?
     WHERE id = ?
       AND obligation_id IS NULL`,
    data.type,
    data.description,
    data.amount,
    data.date,
    data.notes ?? null,
    id,
  );

  return result.changes > 0;
}

export async function removeTransaction(
  db: SQLiteDatabase,
  id: number,
): Promise<void> {
  await db.runAsync(`DELETE FROM transactions WHERE id = ?`, id);
}
