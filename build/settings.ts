import * as chalk from "chalk";
import { parse } from "dotenv";
import * as fs from "fs";
import { inspect } from "util";

export enum LogLevel {
  DEBUG = 3,
  INFO = 2,
  WARN = 1,
  ERROR = 0
}

function ERR(strings: TemplateStringsArray, ...rest: any[]): void {
  console.log(`${chalk.red("[E]")} ${strings.map((string, index) => string + (rest[index] ? inspect(rest[index], { colors: true }) : "")).join("")}`);
}
export function DBG(strings: TemplateStringsArray, ...rest: any[]): void {
  console.log(`${chalk.gray("[D]")} ${strings.map((string, index) => string + (rest[index] ? inspect(rest[index], { colors: true }) : "")).join("")}`);
}

const parsed = parse(fs.readFileSync(`${__dirname}/../.env`));

const DEFAULT_PORT = "80";
const DEFAULT_LOG_LEVEL = "WARN";

const {
  PUBLIC_PATH = "/",
  DEV_SERVER_SSL_CRT = undefined,
  DEV_SERVER_SSL_KEY = undefined
} = parsed;

let {
  DEV_SERVER_SSL = "false",
  NODE_ENV = "production",
  PORT = DEFAULT_PORT,
  LOG_LEVEL = DEFAULT_LOG_LEVEL
} = parsed;

if (!["development", "production", "test"].includes(NODE_ENV)) {
  ERR`Invalid NODE_ENV: ${NODE_ENV}. Defaulting to ${"production"}`;
  NODE_ENV = "production";
}

if (Number(PORT) < 0 || Number(PORT) > 65535) {
  ERR`Invalid PORT range: ${PORT}. Defaulting to ${DEFAULT_PORT}`;
  PORT = DEFAULT_PORT;
}

if (!["true", "false"].includes(DEV_SERVER_SSL)) {
  ERR`Invalid DEV_SERVER_SSL: ${DEV_SERVER_SSL}. Defaulting to ${"false"}`;
  DEV_SERVER_SSL = "false";
}

if (!["ERROR", "WARN", "INFO", "DEBUG"].includes(LOG_LEVEL)) {
  ERR`Invalid LOG_LEVEL: ${LOG_LEVEL}. Defaulting to ${DEFAULT_LOG_LEVEL}`;
  LOG_LEVEL = DEFAULT_LOG_LEVEL;
}

const addEnv = {
  NODE_ENV,
  PUBLIC_PATH,
  PORT,
  DEV_SERVER_SSL,
  DEV_SERVER_SSL_CRT,
  DEV_SERVER_SSL_KEY,
  LOG_LEVEL
};

Object.assign(process.env, addEnv);

if (LogLevel.DEBUG <= ["ERROR", "WARN", "INFO", "DEBUG"].indexOf(LOG_LEVEL)) {
  DBG`Set environment variables: ${addEnv}`;
}


declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      PUBLIC_PATH: string;
      PORT: string;
      DEV_SERVER_SSL: "true" | "false";
      DEV_SERVER_SSL_CRT?: string;
      DEV_SERVER_SSL_KEY?: string;
      LOG_LEVEL: keyof typeof LogLevel;
    }
  }
}
