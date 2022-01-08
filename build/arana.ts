#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("source-map-support").install();

import { ERROR, INFO } from "@logger";
import "./settings";


const args = process.argv.slice(2);
const option = args[0] ?? "<none>";

if (!["dev", "build", "test"].includes(option)) {
  ERROR`Unknown option: ${option}`;
} else if (args.includes("--noCatch")) {
  INFO`Found flag ${"--noCatch"}. Letting errors fall through.`;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require(`./scripts/${option}`);
} else {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(`./scripts/${option}`);
  } catch (err) {
    if (err instanceof Error) {
      ERROR(err);
    } else {
      ERROR`Unknown error: ${err}`;
    }
  }
}
