import { __src } from "@paths";
import * as glob from "glob";
import * as path from "path";
import * as tts from "ttypescript";
// First, we parse all files in `modules/*/*/api/*.ts`
// We add the gained information to a list in memory
// Then, we generate the respective `*.d.ts` files in `modules/*/*/types/*.d.ts`
// Last, we add the appropriate references to the file in `core/proxy.ts`

const compilerOptions = tts.getParsedCommandLineOfConfigFile(path.resolve(__src.backend, "tsconfig.json"), {}, tts.sys as any)?.options!;

const program = tts.createProgram(
  [...glob.sync(path.join(__src.backend, "modules/**/*/*/api/*.ts")), ...glob.sync(path.join(__src.backend, "core/*.ts"))],
  compilerOptions,
  tts.createCompilerHost(compilerOptions)
);
const checker = program.getTypeChecker();
