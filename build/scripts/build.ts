process.env.NODE_ENV = "production";
import { createWebpackCompiler } from "@lib/webpack";
import { DEBUG, INFO } from "@logger";
import type * as webpack from "webpack";

DEBUG`Setting ${"NODE_ENV"} to ${"production"}`;

async function build() {
  const webpack = createWebpackCompiler();
  INFO("Building");
  await new Promise((resolve: (error: Error | undefined, stats: webpack.Stats | undefined) => void) => webpack.run(resolve));
  INFO("Build finished");
}

void build();
