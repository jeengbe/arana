process.env.NODE_ENV = "production";
import { createProgram } from "@build/lib/backend";
import { createWebpackCompiler } from "@lib/webpack";
import { DEBUG, INFO } from "@logger";
import type * as webpack from "webpack";

DEBUG`Setting ${"NODE_ENV"} to ${"production"}`;

async function buildFrontend() {
  const webpack = createWebpackCompiler();
  INFO("Building frontend");
  await new Promise((resolve: (error: Error | undefined, stats: webpack.Stats | undefined) => void) => webpack.run(resolve));
  INFO("Build frontend finished");
}

async function buildBackend() {
  INFO("Bulding backend");

  createProgram();

  INFO("Build backend finished");
}

// void buildFrontend();
void buildBackend();
