import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite/next";
const expo = openDatabaseSync("db.db");
const db = drizzle(expo);

const runMigrate = async () => {
  await migrate(db, { migrationsFolder: "./migrations" });
};

runMigrate();
