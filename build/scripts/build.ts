process.env.NODE_ENV = "production";
import { createProgram as createBackendProgram } from "@build/compilers/backend";
import { createWebpackCompiler } from "@build/compilers/frontend";
import { createProgram as createWebserverProgram } from "@build/compilers/webserver";
import { shouldInclude } from "@lib/args";
import { DEBUG, INFO } from "@logger";
import type * as webpack from "webpack";

DEBUG`Setting ${"NODE_ENV"} to ${"production"}`;

const { shouldIncludeFrontend, shouldIncludeBackend, shouldIncludeWebserver } = shouldInclude();

async function buildFrontend() {
  INFO("Creating frontend webpack compiler");
  const webpack = createWebpackCompiler();
  INFO("Building frontend");
  await new Promise((resolve: (error: Error | undefined, stats: webpack.Stats | undefined) => void) => webpack.run(resolve));
  INFO("Building frontend finished");
}

function buildBackend() {
  INFO("Creating backend typescript compiler");
  const program = createBackendProgram();
  INFO("Building backend");
  program.emit();
  INFO("Building backend finished");
}

function buildWebserver() {
  INFO("Creating webserver typescript compiler");
  const program = createWebserverProgram();
  INFO("Building webserver");
  program.emit();
  INFO("Building webserver finished");
}

if (shouldIncludeFrontend) void buildFrontend();
if (shouldIncludeBackend) buildBackend();
if (shouldIncludeWebserver) buildWebserver();
