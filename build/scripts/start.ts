process.env.NODE_ENV = "development";
import { createProgram } from "@build/lib/backend";
import { convertSchemasToJson } from "@build/lib/graphQLParser";
import { __dist } from "@build/paths";
import { createWebpackCompiler, createWebpackDevServerConfig } from "@lib/webpack";
import { DEBUG, INFO, WARN } from "@logger";
import type { ChildProcess } from "child_process";
import { spawn } from "child_process";
import * as path from "path";
import * as WebpackDevServer from "webpack-dev-server";

DEBUG`Setting ${"NODE_ENV"} to ${"development"}`;

let dontStartFrontend = false;
let dontStartBackend = false;

if (process.argv.includes("--noFrontend")) {
  DEBUG`Found flag ${"--noFrontend"}`;
  INFO("Not starting frontend");
  dontStartFrontend = true;
} else {
  DEBUG`Didn't find flag ${"--noFrontend"}`;
}
if (process.argv.includes("--noBackend")) {
  DEBUG`Found flag ${"--noBackend"}`;
  INFO("Not starting backend");
  dontStartBackend = true;
} else {
  DEBUG`Didn't find flag ${"--noBackend"}`;
}

if (dontStartFrontend && dontStartBackend) {
  WARN("Neither starting frontend nor backend");
}

function startFrontend() {
  DEBUG("Creating frontend webpack compiler");
  const devServer = new WebpackDevServer(createWebpackDevServerConfig(), createWebpackCompiler());
  INFO("Starting webpack dev server");
  void devServer.start();
}

function startBackend() {
  let backendProcess: ChildProcess | undefined;

  function startServer() {
    backendProcess = spawn("node", [path.resolve(__dist.backend, "core", "index.js")]);
    backendProcess.stdout?.on("data", data => {
      console.log(data.toString());
    });
    backendProcess.stderr?.on("data", data => {
      console.error(data.toString());
    });
  }

  function restartServer() {
    if (backendProcess) {
      INFO("Restarting backend server");
      backendProcess.kill();
    } else {
      INFO("Starting backend server");
    }
    startServer();
  }

  DEBUG("Creating backend typescript compiler");
  const program = createProgram(true, restartServer);
  INFO("Starting backend typescript compiler");
  program.emit();
  INFO("Converting GraphQL schemas to json");
  convertSchemasToJson();
  INFO("Converting finished");
}

if (!dontStartFrontend) startFrontend();
if (!dontStartBackend) startBackend();
