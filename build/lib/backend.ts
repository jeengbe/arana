import { __core, __dist } from "@build/paths";
import * as path from "path";
import * as tts from "ttypescript/lib/typescript";
import type * as ts from "typescript";

export function getRootFiles() {
  return [path.join(__core.backend, "index.ts")];
}

export function getCompilerOptions(): ts.CompilerOptions {
  return {
    outDir: path.resolve(__dist.backend),
    preserveWatchOutput: true,
    ...tts.readConfigFile(path.join(__core.backend, "tsconfig.json"), tts.sys.readFile.bind(null)).config
  };
}

export function createProgram(watch?: true, restart?: () => void): void;
export function createProgram(watch?: false): void;
export function createProgram(watch = false, restart?: () => void) {
  if (watch) {
    const host = tts.createWatchCompilerHost(getRootFiles(), getCompilerOptions(), tts.sys);
    const afterCB = host.afterProgramCreate?.bind(host);
    host.afterProgramCreate = (...args) => {
      afterCB?.(...args);
      restart?.();
    };

    tts.createWatchProgram(host).getProgram().emit();
  } else {
    const host = tts.createCompilerHost(getCompilerOptions());
    tts.createProgram(getRootFiles(), getCompilerOptions(), host).emit();
  }
}
