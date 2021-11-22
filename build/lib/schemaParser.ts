import { __modules } from "@build/paths";
import * as fs from "fs";
import * as path from "path";
import * as tts from "ttypescript";
import * as ts from "typescript";
import { parseModule } from "./graphQLParser";
import type { Module } from "./manager";
import { getInstalledModules } from "./manager";

export interface Type {
  name: string;
  description?: string;
  fields: Field[];
}

export interface Field {
  name: string;
  type: ValueType;
  description?: string;
  args: Arg[];
}

export interface Arg {
  name: string;
  type: ValueType;
  description?: string;
}

export type ValueType = {
  type: string;
  nullable: boolean;
} & ({
  type: "intrinsic";
  intrinsicType: "string" | "int" | "float" | "boolean";
} | {
  type: "array";
  arrayType: ValueType;
} | {
  type: "custom";
  customType: string;
} | {
  type: "void";
});

function getObjectName(node: ts.ClassDeclaration): string | undefined {
  return node.name?.text;
}

function getClassByName(src: ts.SourceFile, name: string): ts.ClassDeclaration | undefined {
  return src.statements.find(node => node.kind === ts.SyntaxKind.ClassDeclaration && getObjectName(node as ts.ClassDeclaration) === name) as ts.ClassDeclaration | undefined;
}

export class SchemaParser {
  protected readonly types: Record<string, Type> = {};

  public addModule(...modules: Module[]): void {
    for (const module of modules) {
      parseModule(module);
    }
  }

  public parseModule(module: Module): void {
    const entryFilePath = path.resolve(__modules.backend, module.id, "schema.ts");
    // get depending classes, interfaces and types
    // recursively parse those and their dependencies

    const src = tts.createSourceFile(entryFilePath, fs.readFileSync(entryFilePath, "utf-8"), tts.ScriptTarget.ES2020);
    const queryClass = getClassByName(src, "Query");

    const objects: Record<string, any> = {};
    const objectsToCheck = [queryClass];

    while (objectsToCheck.length > 0) {
      const objectToCheck = objectsToCheck.pop()!;
      // We can be sure that all objects have a name
      const objectName = getObjectName(objectToCheck)!;
      if (objectName in objects) continue; // We already got this
      // Get dependencies
      const dependencies = getDependencies(objectToCheck);
      const dependenciesInFiles = getFilesOfDependencies(dependencies, src);
      objectsToCheck.push(...getObjectsInDependencies(dependenciesInFiles));
    }
  }
}

const parser = new SchemaParser();

parser.addModule(...getInstalledModules("backend"));
