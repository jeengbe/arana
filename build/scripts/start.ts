process.env.NODE_ENV = "development";
import { createWebpackCompiler, createWebpackDevServerConfig } from "@lib/webpack";
import { DEBUG, INFO } from "@logger";
import * as WebpackDevServer from "webpack-dev-server";

DEBUG`Setting ${"NODE_ENV"} to ${"development"}`;

const devServer = new WebpackDevServer(createWebpackDevServerConfig(), createWebpackCompiler());

async function startServer() {
  INFO("Starting server");
  await devServer.start();
}

void startServer();
