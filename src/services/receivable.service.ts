import { getDatabase } from "../database/database";
import { toCents } from "../utils/money";
import type { ObligationStatus, RecurringFrecuency } from "../types";

export interface Receivable {
  id: number;
  name: string;
  amount: number;
  start_date: string;
  due_day: number;
  active: number;
  frequency: RecurringFrecuency;
  notes: string | null;
  total_pending: number;
  installment_count: number;
}

export interface ReceivableObligation {
  id: number;
  recurring_rule_id: number;
  period: string;
  amount_due: number;
  due_date: string;
  amount_paid: number;
  amount_pending: number;
  status: ObligationStatus;
}

export interface ReceivableDetails {
  id: number;
  name: string;
  amount: number;
  start_date: string;
  due_day: number;
  active: number;
  notes: string | null;
  obligations: ReceivableObligation[];
}

export interface CreateReceivableData {
  name: string;
  amount: number;
  startDate: string;
  dueDay: number;
  frequency?: RecurringFrecuency;
  notes?: string;
}

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPeriodDate(period: string, day: number): string {
  const [year, month] = period.split("-").map(Number);

  const lastDay = new Date(year, month, 0).getDate();
  const validDay = Math.min(day, lastDay);

  return `${year}-${String(month).padStart(2, "0")}-${String(validDay).padStart(2, "0")}`;
}

function getStatus(amountDue: number, amountPaid: number): ObligationStatus {
  if (amountPaid <= 0) return "pending";
  if (amountPaid < amountDue) return "partial";
  if (amountPaid === amountDue) return "paid";
  return "overpaid";
}

/**
 * Genera las cuotas mensuales que correspondan.
 * INSERT OR IGNORE evita duplicar cuotas.
 */

async function generateObligations(ruleId?: number): Promise<void> {
  const db = await getDatabase();

  const rules = ruleId
    ? await db.getAllAsync<{
        id: number;
        start_date: string;
        due_day: number;
        frequency: RecurringFrecuency;
      }>(
        `SELECT id, start_date, due_day, frequency
         FROM recurring_rules
         WHERE id = ? AND type = 'income' AND active = 1`,
        ruleId,
      )
    : await db.getAllAsync<{
        id: number;
        start_date: string;
        due_day: number;
        frequency: RecurringFrecuency;
      }>(
        `SELECT id, start_date, due_day, frequency
         FROM recurring_rules
         WHERE type = 'income' AND active = 1`,
      );

  const today = getLocalDateString(new Date());

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentPeriod = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;

  for (const rule of rules) {
    if (rule.frequency === "once") {
      if (rule.start_date > today) continue;

      await db.runAsync(
        `INSERT OR IGNORE INTO obligations (
          recurring_rule_id,
          period,
          amount_due,
          due_date
        )
        SELECT id, ?, amount, ?
        FROM recurring_rules
        WHERE id = ?`,
        rule.start_date.slice(0, 7),
        rule.start_date,
        rule.id,
      );

      continue;
    }

    const originalStartPeriod = rule.start_date.slice(0, 7);

    const existingObligations = await db.getFirstAsync<{
      first_period: string | null;
    }>(
      `SELECT MIN(period) AS first_period
       FROM obligations
       WHERE recurring_rule_id = ?`,
      rule.id,
    );

    const firstExistingPeriod = existingObligations?.first_period;

    const startPeriod = firstExistingPeriod && firstExistingPeriod > originalStartPeriod ? firstExistingPeriod : originalStartPeriod;

    if (startPeriod > currentPeriod) continue;

    const [startYear, startMonth] = startPeriod.split("-").map(Number);

    let year = startYear;
    let month = startMonth;

    while (year < currentYear || (year === currentYear && month <= currentMonth)) {
      const period = `${year}-${String(month).padStart(2, "0")}`;
      const dueDate = getPeriodDate(period, rule.due_day);

      await db.runAsync(
        `INSERT OR IGNORE INTO obligations (
          recurring_rule_id,
          period,
          amount_due,
          due_date
        )
        SELECT id, ?, amount, ?
        FROM recurring_rules
        WHERE id = ?`,
        period,
        dueDate,
        rule.id,
      );

      month++;

      if (month > 12) {
        month = 1;
        year++;
      }
    }
  }
}

export async function createReceivable(data: CreateReceivableData): Promise<number> {
  const name = data.name.trim();
  const frequency = data.frequency ?? "monthly";

  if (!name) {
    throw new Error("Debes ingresar la descripción.");
  }

  if (!data.startDate) {
    throw new Error("Debes seleccionar una fecha de inicio.");
  }

  if (!Number.isInteger(data.dueDay) || data.dueDay < 1 || data.dueDay > 31) {
    throw new Error("El día de vencimiento debe estar entre 1 y 31.");
  }

  const amount = toCents(data.amount);
  const db = await getDatabase();

  let ruleId = 0;

  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      `INSERT INTO recurring_rules (
        type, name, amount, start_date, due_day, frequency, notes
      ) VALUES ('income', ?, ?, ?, ?, ?, ?)`,
      name,
      amount,
      data.startDate,
      data.dueDay,
      frequency,
      data.notes?.trim() || null,
    );

    ruleId = result.lastInsertRowId;

    if (frequency === "once") {
      await db.runAsync(
        `INSERT INTO transactions (
          type, description, amount, date
        ) VALUES ('expense', ?, ?, ?)`,
        `Préstamo otorgado a ${name}`,
        amount,
        data.startDate,
      );
    }
  });

  await generateObligations(ruleId);

  return ruleId;
}

export interface UpdateReceivableData {
  id: number;
  name: string;
  amount: number;
  startDate: string;
  dueDay: number;
  frequency?: RecurringFrecuency;
  notes?: string;
}

export async function updateReceivable(data: UpdateReceivableData): Promise<void> {
  if (!Number.isInteger(data.id) || data.id <= 0) {
    throw new Error("La cuenta seleccionada no es válida.");
  }

  const name = data.name.trim();

  if (!name) {
    throw new Error("Debes ingresar el nombre de la persona.");
  }

  if (!data.startDate) {
    throw new Error("Debes seleccionar una fecha de inicio.");
  }

  if (!Number.isInteger(data.dueDay) || data.dueDay < 1 || data.dueDay > 31) {
    throw new Error("El día de vencimiento debe estar entre 1 y 31.");
  }

  const amount = toCents(data.amount);
  const db = await getDatabase();

  const result = await db.runAsync(
    `UPDATE recurring_rules
     SET
       name = ?,
       amount = ?,
       start_date = ?,
       due_day = ?,
       frequency = COALESCE(?, frequency),
       notes = ?
     WHERE id = ? AND type = 'income'`,
    name,
    amount,
    data.startDate,
    data.dueDay,
    data.frequency ?? null,
    data.notes?.trim() || null,
    data.id,
  );

  if (result.changes === 0) {
    throw new Error("No se encontró la cuenta por cobrar.");
  }
}

export async function getReceivables(): Promise<Receivable[]> {
  await generateObligations();

  const db = await getDatabase();

  return db.getAllAsync<Receivable>(
    `SELECT
      r.id,
      r.name,
      r.amount,
      r.start_date,
      r.due_day,
      r.frequency,
      r.active,
      r.notes,
      COALESCE(
        SUM(o.amount_due - COALESCE(p.amount_paid, 0)), 0
      ) AS total_pending,
      COUNT(o.id) AS installment_count

    FROM recurring_rules r

    LEFT JOIN obligations o
      ON o.recurring_rule_id = r.id

    LEFT JOIN (
      SELECT obligation_id, SUM(amount) AS amount_paid
      FROM transactions
      WHERE obligation_id IS NOT NULL
      GROUP BY obligation_id
    ) p ON p.obligation_id = o.id

    WHERE r.type = 'income' AND r.active = 1

    GROUP BY r.id
    ORDER BY r.created_at DESC, r.id DESC`,
  );
}

export async function getReceivableDetails(id: number): Promise<ReceivableDetails | null> {
  await generateObligations(id);

  const db = await getDatabase();

  const rule = await db.getFirstAsync<Omit<ReceivableDetails, "obligations">>(
    `SELECT id, name, amount, start_date, due_day, frequency, active, notes
     FROM recurring_rules
     WHERE id = ? AND type = 'income'`,
    id,
  );

  if (!rule) return null;

  const rows = await db.getAllAsync<{
    id: number;
    recurring_rule_id: number;
    period: string;
    amount_due: number;
    due_date: string;
    amount_paid: number;
  }>(
    `SELECT
      o.id,
      o.recurring_rule_id,
      o.period,
      o.amount_due,
      o.due_date,
      COALESCE(SUM(t.amount), 0) AS amount_paid

    FROM obligations o

    LEFT JOIN transactions t
      ON t.obligation_id = o.id

    WHERE o.recurring_rule_id = ?

    GROUP BY o.id
    ORDER BY o.created_at DESC, o.id DESC`,
    id,
  );

  const obligations: ReceivableObligation[] = rows.map((row) => {
    const amountPending = Math.max(0, row.amount_due - row.amount_paid);

    return {
      ...row,
      amount_pending: amountPending,
      status: getStatus(row.amount_due, row.amount_paid),
    };
  });

  return {
    ...rule,
    obligations,
  };
}

export async function registerReceivablePayment(obligationId: number, amount: number, date = getLocalDateString(new Date())): Promise<void> {
  const amountInCents = toCents(amount);
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    const obligation = await db.getFirstAsync<{
      amount_due: number;
      name: string;
      period: string;
    }>(
      `SELECT o.amount_due, r.name, o.period
       FROM obligations o
       INNER JOIN recurring_rules r
         ON r.id = o.recurring_rule_id
       WHERE o.id = ? AND r.type = 'income'`,
      obligationId,
    );

    if (!obligation) {
      throw new Error("No se encontró la cuota seleccionada.");
    }

    const paid = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM transactions
       WHERE obligation_id = ?`,
      obligationId,
    );

    const pending = obligation.amount_due - (paid?.total ?? 0);

    if (pending <= 0) {
      throw new Error("Esta cuota ya está pagada.");
    }

    if (amountInCents > pending) {
      throw new Error("El abono no puede superar el importe pendiente.");
    }

    await db.runAsync(
      `INSERT INTO transactions (
        type,
        description,
        amount,
        date,
        obligation_id
      ) VALUES ('income', ?, ?, ?, ?)`,
      `Pago de ${obligation.name} - ${obligation.period}`,
      amountInCents,
      date,
      obligationId,
    );
  });
}
