import { __dist, __src } from "@build/paths";
import * as path from "path";
import * as tts from "ttypescript";
import type * as ts from "typescript";

export function getCompilerOptions(): ts.CompilerOptions {
  return tts.getParsedCommandLineOfConfigFile(path.resolve(__src.webserver, "tsconfig.json"), {
    outDir: path.resolve(__dist.webserver),
    preserveWatchOutput: true
  }, tts.sys as any)?.options!;
}

export function createProgram(watch?: true, restart?: () => void): ts.Program;
export function createProgram(watch?: false): ts.Program;
export function createProgram(watch = false, restart?: () => void) {
  if (watch) {
    const host = tts.createWatchCompilerHost([path.resolve(__src.webserver, "index.ts")], getCompilerOptions(), tts.sys);
    const afterCB = host.afterProgramCreate?.bind(host);
    host.afterProgramCreate = (...args: any[]) => {
      // @ts-expect-error
      afterCB?.(...args);
      restart?.();
    };

    return tts.createWatchProgram(host).getProgram();
  }
  const host = tts.createCompilerHost(getCompilerOptions());
  return tts.createProgram([path.resolve(__src.webserver, "index.ts")], getCompilerOptions(), host);
}
