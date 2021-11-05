#!/usr/bin/env node
const args = process.argv.slice(2);

const option = args[0] ?? "<none>";

if (!["start", "build", "test"].includes(option)) {
  console.log(`Unknown option: ${option}`);
} else {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require(`./scripts/${option}`);
}
