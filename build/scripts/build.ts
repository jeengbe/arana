process.env.NODE_ENV = "production";
import { createProgram } from "@build/lib/backend";
import { createWebpackCompiler } from "@lib/webpack";
import { DEBUG, INFO, WARN } from "@logger";
import type * as webpack from "webpack";

DEBUG`Setting ${"NODE_ENV"} to ${"production"}`;


let dontBuildFrontend = false;
let dontBuildBackend = false;

if (process.argv.includes("--noFrontend")) {
  DEBUG`Found flag ${"--noFrontend"}`;
  INFO("Not building frontend");
  dontBuildFrontend = true;
} else {
  DEBUG`Didn't find flag ${"--noFrontend"}`;
}
if (process.argv.includes("--noBackend")) {
  DEBUG`Found flag ${"--noBackend"}`;
  INFO("Not building backend");
  dontBuildBackend = true;
} else {
  DEBUG`Didn't find flag ${"--noBackend"}`;
}

if (dontBuildFrontend && dontBuildBackend) {
  WARN("Neither building frontend nor backend");
}

async function buildFrontend() {
  INFO("Creating frontend webpack compiler");
  const webpack = createWebpackCompiler();
  INFO("Building frontend");
  await new Promise((resolve: (error: Error | undefined, stats: webpack.Stats | undefined) => void) => webpack.run(resolve));
  INFO("Building frontend finished");
}

function buildBackend() {
  INFO("Creating backend typescript compiler");
  const program = createProgram();
  INFO("Building backend");
  program.emit();
  INFO("Building backend finished");
}

if (!dontBuildFrontend) void buildFrontend();
if (!dontBuildBackend) buildBackend();
