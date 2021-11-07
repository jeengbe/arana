#!/usr/bin/env node

import { ERROR } from "@logger";
import "./settings";

const args = process.argv.slice(2);
const option = args[0] ?? "<none>";

if (!["start", "build", "test"].includes(option)) {
  ERROR`Unknown option: ${option}`;
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
