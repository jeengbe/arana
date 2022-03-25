import { DEBUG as logDebug, enableBuffer, ERROR as logError, flushBuffer } from "@logger";
import { parse as parseEnv } from "dotenv";
import * as fs from "fs";

interface Environment {
  /**
   * The application environment
   * @default "production"
   */
  NODE_ENV: "development" | "production" | "test";

  /**
   * The public path for building Arana
   * @default "/"
   */
  PUBLIC_PATH: string;

  /**
   * The host used by the development server
   * @default undefined
   */
  HOST?: string;

  /**
   * The port used by the development server
   * @default "8080"
   */
  PORT: string;

  /**
   * Whether to open the browser when starting the development server\
   * Values `"true"` and `"false"` will be converted to boolean, all other values specify the path that is opened on start
   * @default "false"
   */
  OPEN: "true" | "false" | string;

  /**
   * Whether to enable HTTPS for the development server
   * @default "false"
   */
  DEV_SERVER_SSL: "true" | "false";

  /**
   * The path to the SSL certificate used by the development server
   * @default undefined
   */
  DEV_SERVER_SSL_CRT?: string;

  /**
   * The path to the SSL key used by the development server
   * @default undefined
   */
  DEV_SERVER_SSL_KEY?: string;

  /**
   * The log level for scripts\
   * Note that errors are always output to console
   * @default "WARN"
   */
  LOG_LEVEL: keyof typeof LogLevel;
}

export enum LogLevel {
  DEBUG = 3,
  INFO = 2,
  WARN = 1,
  ERROR = 0
}

enableBuffer();

const variables: Record<keyof Environment, {
  validate?: string[] | ((value?: string) => any);
  fallback: string | undefined;
}> = {
  NODE_ENV: {
    validate: ["development", "production", "test"],
    fallback: "production"
  },
  PUBLIC_PATH: {
    fallback: "/"
  },
  HOST: {
    fallback: undefined
  },
  PORT: {
    validate: val => val && /^\d+$/.test(val),
    fallback: "8081"
  },
  OPEN: {
    fallback: "false"
  },
  DEV_SERVER_SSL: {
    validate: ["true", "false"],
    fallback: "false"
  },
  DEV_SERVER_SSL_CRT: {
    fallback: undefined
  },
  DEV_SERVER_SSL_KEY: {
    fallback: undefined
  },
  LOG_LEVEL: {
    validate: ["ERROR", "WARN", "INFO", "DEBUG"],
    fallback: "WARN"
  }
};

const { env } = process;
const parsed = parseEnv(fs.readFileSync(`${__dirname}/../.env`));

for (const [key, { validate, fallback }] of Object.entries(variables)) {
  if (key in env) {
    logDebug`Not setting ${key} as it is already set`;
    continue;
  }
  if (!(key in parsed)) {
    logDebug`Setting ${key} to default value ${fallback}`;
    env[key] = fallback;
    continue;
  }
  const value = parsed[key];
  if (validate === undefined || (typeof validate === "function" ? Boolean(validate(value)) : validate.includes(value))) {
    logDebug`Setting ${key} to ${value}`;
    env[key] = value;
    continue;
  } else {
    logError`Invalid ${key}: ${value}. Defaulting to ${fallback}`;
    env[key] = fallback;
  }
}

flushBuffer();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Node does this so we need it too
  namespace NodeJS {
    interface ProcessEnv extends Environment { }
  }
}
