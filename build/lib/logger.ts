import { UserError } from "@lib/UserError";
import { LogLevel } from "@settings";
import * as chalk from "chalk";
import { inspect } from "util";

function mayLog(level: LogLevel) {
  const { LOG_LEVEL } = process.env;

  return level <= ["ERROR", "WARN", "INFO", "DEBUG"].indexOf(LOG_LEVEL);
}

export function DEBUG(strings: TemplateStringsArray, ...rest: any[]): void;
export function DEBUG(strings: string): void;
export function DEBUG(strings: string | TemplateStringsArray, ...rest: any[]): void {
  if (!mayLog(LogLevel.DEBUG)) return;

  if (typeof strings === "string") {
    console.log(`${chalk.gray("[D]")} ${strings}`);
  } else {
    console.log(`${chalk.gray("[D]")} ${strings.map((string, index) => string + (rest[index] ? inspect(rest[index], { colors: true }) : "")).join("")}`);
  }
}

export function INFO(strings: TemplateStringsArray, ...rest: any[]): void;
export function INFO(strings: string): void;
export function INFO(strings: string | TemplateStringsArray, ...rest: any[]): void {
  if (!mayLog(LogLevel.INFO)) return;

  if (typeof strings === "string") {
    console.log(`${chalk.blue("[I]")} ${strings}`);
  } else {
    console.log(`${chalk.blue("[I]")} ${strings.map((string, index) => string + (rest[index] ? inspect(rest[index], { colors: true }) : "")).join("")}`);
  }
}

export function WARN(strings: TemplateStringsArray, ...rest: any[]): void;
export function WARN(strings: string): void;
export function WARN(strings: string | TemplateStringsArray, ...rest: any[]): void {
  if (!mayLog(LogLevel.WARN)) return;

  if (typeof strings === "string") {
    console.log(`${chalk.yellow("[W]")} ${strings}`);
  } else {
    console.log(`${chalk.yellow("[W]")} ${strings.map((string, index) => string + (rest[index] ? inspect(rest[index], { colors: true }) : "")).join("")}`);
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
  } else if (typeof strings === "string") {
    console.log(`${chalk.red("[E]")} ${strings}`);
  } else {
    console.log(`${chalk.red("[E]")} ${strings.map((string, index) => string + (rest[index] ? inspect(rest[index], { colors: true }) : "")).join("")}`);
  }
}
