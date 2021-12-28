import { Database } from "arangojs";
import type { AqlQuery } from "arangojs/aql";
import type { ArrayCursor } from "arangojs/cursor";
import type { QueryOptions } from "arangojs/database";
export const db = new Database({
  url: "http://localhost:8888",
  databaseName: "_system"
});

db.useBasicAuth("root", "root");

export function query(q: AqlQuery, options?: QueryOptions): Promise<ArrayCursor<any>> {
  return db.query(q, options);
}
