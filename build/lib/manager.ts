import { __base } from "@paths";
import * as fs from "fs";
import * as path from "path";

export interface Module {
  id: string;
  vendor: string;
  name: string;
  isFrontend: boolean;
  isBackend: boolean;
}

const MODULES_FILE_LOCATION = path.resolve(__base, "modules.json");

/**
 * Return all installed modules
 */
export function getInstalledModules(side: "frontend" | "backend" | "both" = "both") {
  let filter: ((module: Module) => boolean) = () => true;
  if (side === "frontend") filter = ({ isFrontend }) => isFrontend;
  if (side === "backend") filter = ({ isBackend }) => isBackend;

  if (!fs.existsSync(MODULES_FILE_LOCATION)) {
    fs.writeFileSync(MODULES_FILE_LOCATION, "[]");
  }
  const allModules = JSON.parse(fs.readFileSync(MODULES_FILE_LOCATION, "utf-8")) as Module[];

  return allModules.filter(filter);
}
