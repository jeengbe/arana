import { UserError } from "@lib/UserError";
import { LogLevel } from "@settings";
import * as chalk from "chalk";
import { inspect } from "util";

function shouldPrint(level: LogLevel) {
  const { LOG_LEVEL } = process.env;

  return level <= ["ERROR", "WARN", "INFO", "DEBUG"].indexOf(LOG_LEVEL);
}

let shouldBuffer = false;
const messageBuffer: string[] = [];

export function enableBuffer() {
  shouldBuffer = true;
}

export function flushBuffer() {
  if (shouldBuffer) {
    messageBuffer.forEach(line => console.log(line));
    messageBuffer.length = 0;
    shouldBuffer = false;
  }
}

export function DEBUG(strings: TemplateStringsArray, ...rest: any[]): void;
export function DEBUG(strings: string): void;
export function DEBUG(strings: string | TemplateStringsArray, ...rest: any[]): void {
  if (!shouldPrint(LogLevel.DEBUG)) return;

  let message;
  if (typeof strings === "string") {
    message = `${chalk.gray("[D]")} ${strings}`;
  } else {
    message = `${chalk.gray("[D]")} ${strings.map((string, index) => string + (rest[index] ? inspect(rest[index], { colors: true, depth: null }) : "")).join("")}`;
  }

  if (shouldBuffer) {
    messageBuffer.push(message);
  } else {
    console.log(message);
  }
}

export function INFO(strings: TemplateStringsArray, ...rest: any[]): void;
export function INFO(strings: string): void;
export function INFO(strings: string | TemplateStringsArray, ...rest: any[]): void {
  if (!shouldPrint(LogLevel.INFO)) return;

  let message;
  if (typeof strings === "string") {
    message = `${chalk.blue("[I]")} ${strings}`;
  } else {
    message = `${chalk.blue("[I]")} ${strings.map((string, index) => string + (rest[index] ? inspect(rest[index], { colors: true }) : "")).join("")}`;
  }

  if (shouldBuffer) {
    messageBuffer.push(message);
  } else {
    console.log(message);
  }
}

export function WARN(strings: TemplateStringsArray, ...rest: any[]): void;
export function WARN(strings: string): void;
export function WARN(strings: string | TemplateStringsArray, ...rest: any[]): void {
  if (!shouldPrint(LogLevel.WARN)) return;

  let message;
  if (typeof strings === "string") {
    message = `${chalk.yellow("[W]")} ${strings}`;
  } else {
    message = `${chalk.yellow("[W]")} ${strings.map((string, index) => string + (rest[index] ? inspect(rest[index], { colors: true }) : "")).join("")}`;
  }

  if (shouldBuffer) {
    messageBuffer.push(message);
  } else {
    console.log(message);
  }
}

export function ERROR(strings: TemplateStringsArray, ...rest: any[]): void;
export function ERROR(strings: string | Error): void;
export function ERROR(strings: string | TemplateStringsArray | Error, ...rest: any[]): void {
  if (strings instanceof Error) {
    ERROR(strings.message);
    if (!(strings instanceof UserError)) {
      const { stack } = strings;
      if (stack !== undefined) {
        const matches = /\(.*[\\/]bin[\\/](?<fileName>.*?)\.js/gm.exec(stack)?.groups;
        if (matches !== undefined && "fileName" in matches) {
          const { fileName } = matches;
          // We're safe to assume that we only use .ts files, which all sit in build/**
          ERROR`\tin ${`build/${fileName.replace(/\\/g, "/")}.ts`}`;
        } else {
          DEBUG`Unable to determine file name from error\n${strings}`;
        }
      } else {
        DEBUG`Unable to determine file name from error\n${strings}`;
      }
    }
  } else {
    let message;
    if (typeof strings === "string") {
      message = `${chalk.red("[E]")} ${strings}`;
    } else {
      message = `${chalk.red("[E]")} ${strings.map((string, index) => string + (rest[index] ? inspect(rest[index], { colors: true }) : "")).join("")}`;
    }

    if (shouldBuffer) {
      messageBuffer.push(message);
    } else {
      console.log(message);
    }
  }
}
