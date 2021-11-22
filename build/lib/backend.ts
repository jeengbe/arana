import { __core, __dist, __modules, __src } from "@build/paths";
import * as fs from "fs";
import * as path from "path";
import * as tts from "ttypescript";
import type * as ts from "typescript";
import { DEBUG, WARN } from "./logger";
import { getInstalledModules } from "./manager";


export function getRootFiles() {
  DEBUG("Finding all entry points");
  const files = [path.resolve(__core.backend, "index.ts")];
  for (const { id, vendor, name } of getInstalledModules("backend")) {
    DEBUG`Checking entries for ${id}`;
    // All entry points for this module
    const moduleEntries: string[] = [];

    const _module = path.resolve(__modules.backend, `@${vendor}`, name);

    // Check each type of file that we use as entry point in the bundle
    for (const file of [path.resolve(_module, "schema.ts")]) {
      if (fs.existsSync(file)) {
        // moduleEntries.push(file);
      }
    }
    if (moduleEntries.length > 0) {
      files.push(...moduleEntries);
    } else {
      WARN`No entry points found for ${id}`;
    }
  }

  return files;
}

export function getCompilerOptions(): ts.CompilerOptions {
  return tts.getParsedCommandLineOfConfigFile(path.resolve(__src.backend, "tsconfig.json"), {
    outDir: path.resolve(__dist.backend),
    preserveWatchOutput: true
  }, tts.sys as any)?.options!;
}

export function createProgram(watch?: true, restart?: () => void): ts.Program;
export function createProgram(watch?: false): ts.Program;
export function createProgram(watch = false, restart?: () => void) {
  if (watch) {
    const host = tts.createWatchCompilerHost(getRootFiles(), getCompilerOptions(), tts.sys);
    const afterCB = host.afterProgramCreate?.bind(host);
    host.afterProgramCreate = (...args: any[]) => {
      // @ts-expect-error
      afterCB?.(...args);
      restart?.();
    };

    return tts.createWatchProgram(host).getProgram();
  }
  const host = tts.createCompilerHost(getCompilerOptions());
  return tts.createProgram(getRootFiles(), getCompilerOptions(), host);
}
