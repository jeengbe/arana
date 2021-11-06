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
export function ERROR(strings: string): void;
export function ERROR(strings: string | TemplateStringsArray, ...rest: any[]): void {
  if (!mayLog(LogLevel.ERROR)) return;

  if (typeof strings === "string") {
    console.log(`${chalk.red("[E]")} ${strings}`);
  } else {
    console.log(`${chalk.red("[E]")} ${strings.map((string, index) => string + (rest[index] ? inspect(rest[index], { colors: true }) : "")).join("")}`);
  }
}
