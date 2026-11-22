import type { SQLiteDatabase } from "expo-sqlite";

export async function runMigrations(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");

  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(`
      BEGIN;

      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL
          CHECK(type IN ('income', 'expense')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE recurring_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        name TEXT NOT NULL,
        amount INTEGER NOT NULL CHECK(amount > 0),
        start_date TEXT NOT NULL,
        due_day INTEGER NOT NULL CHECK(due_day BETWEEN 1 AND 31),
        frequency TEXT NOT NULL DEFAULT 'monthly' CHECK(frequency IN ('monthly', 'once')),
        active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0, 1)),
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE obligations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recurring_rule_id INTEGER NOT NULL,
        period TEXT NOT NULL,
        amount_due INTEGER NOT NULL CHECK(amount_due > 0),
        due_date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (recurring_rule_id)
          REFERENCES recurring_rules(id)
          ON DELETE RESTRICT,

        UNIQUE(recurring_rule_id, period)
      );

      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        description TEXT NOT NULL,
        amount INTEGER NOT NULL CHECK(amount > 0),
        date TEXT NOT NULL,
        category_id INTEGER,
        obligation_id INTEGER,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (category_id)
          REFERENCES categories(id)
          ON DELETE SET NULL,

        FOREIGN KEY (obligation_id)
          REFERENCES obligations(id)
          ON DELETE RESTRICT
      );

      CREATE INDEX idx_transactions_date
        ON transactions(date);

      CREATE INDEX idx_transactions_type
        ON transactions(type);

      CREATE INDEX idx_obligations_rule_period
        ON obligations(recurring_rule_id, period);

      CREATE INDEX idx_transactions_obligation
        ON transactions(obligation_id);

      PRAGMA user_version = 1;

      COMMIT;
    `);
  }
}
