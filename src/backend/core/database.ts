import { Database } from "arangojs";
export const db = new Database({
  url: "http://localhost:8888",
  databaseName: "_system"
});

db.useBasicAuth("root", "root");
