process.env.NODE_ENV = "development";

import { createWebpackCompiler, createWebpackDevServerConfig } from "@lib/webpack";
import { INFO } from "@logger";
import * as WebpackDevServer from "webpack-dev-server";

const devServer = new WebpackDevServer(createWebpackDevServerConfig(), createWebpackCompiler());

async function startServer() {
  INFO("Starting server");
  await devServer.start();
}

void startServer();
