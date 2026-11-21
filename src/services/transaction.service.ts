import { getDatabase } from "../database/database";

import {
  getAllTransactions,
  getTransactionById,
  insertTransaction,
  updateTransaction as updateTransactionRepository,
  removeTransaction,
} from "../repositories/transaction.repository";

import type {
  CreateTransactionData,
  UpdateTransactionData,
} from "../repositories/transaction.repository";

import type { Transaction } from "../types";
import { toCents } from "../utils/money";

export async function getTransactions(): Promise<Transaction[]> {
  const db = await getDatabase();

  return getAllTransactions(db);
}

export async function getTransaction(id: number): Promise<Transaction | null> {
  const db = await getDatabase();

  return getTransactionById(db, id);
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

export async function updateTransaction(
  id: number,
  data: {
    type: "income" | "expense";
    description: string;
    amount: number;
    date: string;
    notes?: string;
  },
): Promise<void> {
  const description = data.description.trim();

  if (!description) {
    throw new Error("Debes ingresar una descripción.");
  }

  if (!data.date) {
    throw new Error("Debes seleccionar una fecha.");
  }

  const amount = toCents(data.amount);

  const db = await getDatabase();

  const existingTransaction = await getTransactionById(db, id);

  if (!existingTransaction) {
    throw new Error("El movimiento no existe.");
  }

  if (existingTransaction.obligation_id !== null) {
    throw new Error(
      "Este movimiento pertenece a un pago de una cuota y no puede editarse desde Movimientos.",
    );
  }

  const transactionData: UpdateTransactionData = {
    type: data.type,
    description,
    amount,
    date: data.date,
    notes: data.notes?.trim() || null,
  };

  const updated = await updateTransactionRepository(db, id, transactionData);

  if (!updated) {
    throw new Error("No se pudo actualizar el movimiento.");
  }
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDatabase();

  const existingTransaction = await getTransactionById(db, id);

  if (!existingTransaction) {
    throw new Error("El movimiento no existe.");
  }

  if (existingTransaction.obligation_id !== null) {
    throw new Error(
      "Este movimiento pertenece a un pago de una cuota y no puede eliminarse desde Movimientos.",
    );
  }

  await removeTransaction(db, id);
}
