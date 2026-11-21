import { getDatabase } from "../database/database";
import {
  getAllTransactions,
  insertTransaction,
  removeTransaction,
} from "../repositories/transaction.repository";
import type { CreateTransactionData } from "../repositories/transaction.repository";
import type { Transaction } from "../types";
import { toCents } from "../utils/money";

export async function getTransactions(): Promise<Transaction[]> {
  const db = await getDatabase();

  return getAllTransactions(db);
}

export async function createTransaction(data: {
  type: "income" | "expense";
  description: string;
  amount: number;
  date: string;
  notes?: string;
}): Promise<number> {
  const description = data.description.trim();

  if (!description) {
    throw new Error("Debes ingresar una descripción.");
  }

  if (!data.date) {
    throw new Error("Debes seleccionar una fecha.");
  }

  const amount = toCents(data.amount);

  const db = await getDatabase();

  const transactionData: CreateTransactionData = {
    type: data.type,
    description,
    amount,
    date: data.date,
    notes: data.notes?.trim() || null,
  };

  return insertTransaction(db, transactionData);
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDatabase();

  await removeTransaction(db, id);
}
