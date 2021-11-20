process.env.NODE_ENV = "development";
import { createProgram } from "@build/lib/backend";
import { __dist } from "@build/paths";
import { createWebpackCompiler, createWebpackDevServerConfig } from "@lib/webpack";
import { DEBUG, INFO } from "@logger";
import type { ChildProcess } from "child_process";
import { spawn } from "child_process";
import * as path from "path";
import * as WebpackDevServer from "webpack-dev-server";

DEBUG`Setting ${"NODE_ENV"} to ${"development"}`;


async function startFrontend() {
  const devServer = new WebpackDevServer(createWebpackDevServerConfig(), createWebpackCompiler());

  INFO("Starting frontend server");
  await devServer.start();
}

async function startBackend() {
  let serverProcess: ChildProcess | undefined;

  function startServer() {
    INFO("Starting backend server");
    serverProcess = spawn("node", [path.resolve(__dist.backend, "core", "index.js")]);
    serverProcess.stdout!.on("data", (data) => {
      console.log(data.toString());
    });
    serverProcess.stderr!.on("data", (data) => {
      console.error(data.toString());
    });
  }

  function restart() {
    if (serverProcess) serverProcess.kill();
    startServer();
  }

  INFO("Compiling backend");

  const program = createProgram(true, restart);
}

// void startFrontend();
void startBackend();
