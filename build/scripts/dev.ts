process.env.NODE_ENV = "development";
import { createProgram as createBackendProgram } from "@build/compilers/backend";
import { createWebpackCompiler, createWebpackDevServerConfig } from "@build/compilers/frontend";
import { createProgram as createWebserverProgram } from "@build/compilers/webserver";
import { __dist } from "@build/paths";
import { shouldInclude } from "@lib/args";
import { DEBUG, INFO, WARN } from "@logger";
import type { ChildProcess } from "child_process";
import { spawn } from "child_process";
import * as path from "path";
import * as WebpackDevServer from "webpack-dev-server";

DEBUG`Setting ${"NODE_ENV"} to ${"development"}`;

const tempIncludes = shouldInclude();
const { shouldIncludeFrontend, shouldIncludeBackend } = tempIncludes;
let { shouldIncludeWebserver } = tempIncludes;

if (shouldIncludeFrontend && shouldIncludeWebserver) {
  WARN("Both frontend and webserver are enabled, disabling webserver");
  INFO("This is because webpack dev server stores files in memory, and the webserver will not be able to serve them");
  INFO`If you want to work on both the webserver and the frontend, you should run ${"npm run dev-webserver"} together with ${"npm run build-frontend-watch"}`;
  shouldIncludeWebserver = false;
}

function devFrontend() {
  DEBUG("Creating frontend webpack compiler");
  const devServer = new WebpackDevServer(createWebpackDevServerConfig(), createWebpackCompiler());
  INFO("Starting webpack dev server");
  void devServer.start();
}

function devBackend() {
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
  const program = createBackendProgram(true, restartServer);
  INFO("Starting backend typescript compiler");
  program.emit();
}

function devWebserver() {
  let webserverProcess: ChildProcess | undefined;

  function startServer() {
    webserverProcess = spawn("node", [path.resolve(__dist.webserver, "index.js")]);
    webserverProcess.stdout?.on("data", process.stdout.write.bind(process.stdout));
    webserverProcess.stderr?.on("data", process.stderr.write.bind(process.stderr));
  }

  function restartServer() {
    if (webserverProcess) {
      INFO("Restarting webserver");
      webserverProcess.kill();
    } else {
      INFO("Starting webserver");
    }
    startServer();
  }

  DEBUG("Creating webserver typescript compiler");
  const program = createWebserverProgram(true, restartServer);
  INFO("Starting webserver typescript compiler");
  program.emit();
}

if (shouldIncludeFrontend) devFrontend();
if (shouldIncludeBackend) devBackend();
if (shouldIncludeWebserver) devWebserver();
