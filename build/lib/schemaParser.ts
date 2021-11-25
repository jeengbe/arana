import { __modules } from "@build/paths";
import * as fs from "fs";
import * as path from "path";
import * as tts from "ttypescript";
import * as ts from "typescript";
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

function getObjectName(node: tsType): string | undefined {
  return node.name?.text;
}

function getClassByName(src: ts.SourceFile, name: string): ts.ClassDeclaration | undefined {
  return src.statements.find(node => node.kind === ts.SyntaxKind.ClassDeclaration && getObjectName(node as ts.ClassDeclaration) === name) as ts.ClassDeclaration | undefined;
}

function getObjectMethods(object: tsType): ts.MethodDeclaration[] | ts.MethodSignature[] {
  if (ts.isClassDeclaration(object)) {
    return object.members.filter(member => ts.isMethodDeclaration(member)) as ts.MethodDeclaration[];
  } else if (ts.isInterfaceDeclaration(object)) {
    return object.members.filter(member => member.kind === ts.SyntaxKind.MethodSignature) as ts.MethodSignature[];
  }
  return [];
}

function getObjectProperties(object: tsType): ts.PropertyDeclaration[] | ts.PropertySignature[] {

}

type tsType = ts.ClassDeclaration | ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.EnumDeclaration;

const types: Record<string, Type> = {};
const parsing: string[] = [];

function parseType(src: ts.SourceFile, object: tsType): void {
  const name = getObjectName(object);
  if (!name) {
    throw new Error("Unnamed object");
  }
  if (name in types || parsing.includes(name)) {
    // We have already parsed this type or are currently parsing it (circular dependency)
    return;
  }

  parsing.push(name);

  const methods = getObjectMethods(object);
  const properties = getObjectProperties(object, true);

  const methodsAndPropertiesOrderedByLineNumber = methods.concat(properties).sort((a, b) => a.getStart() - b.getStart());

  const type: Type = {
    name,
    description: getObjectDescription(object),
    fields: []
  };

  for (const methodOrProperty of methodsAndPropertiesOrderedByLineNumber) {
    if (ts.isMethodDeclaration(methodOrProperty)) {
      resolveMethodDepencies(methodOrProperty);
      type.fields.push({
        name: getMethodName(methodOrProperty),
        description: getMethodDescription(methodOrProperty),
        type: getMethodType(methodOrProperty),
        args: getMethodArgs(methodOrProperty)
      });
    } else {
      resolveFieldDepencies(methodOrProperty);
      type.fields.push({
        name: getFieldName(methodOrProperty),
        description: getFieldDescription(methodOrProperty),
        type: getFieldType(methodOrProperty),
        args: []
      });
    }
  }

  Object.assign(types[name], type);
}

function parseModule(module: Module): void {
  const entryFilePath = path.resolve(__modules.backend, module.id, "schema.ts");

  const src = tts.createSourceFile(entryFilePath, fs.readFileSync(entryFilePath, "utf-8"), tts.ScriptTarget.ES2020);
  const queryClass = getClassByName(src, "Query");

  parseClass(src, queryClass);

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


export class SchemaParser {
  protected readonly types: Record<string, Type> = {};

  public addModule(...modules: Module[]): void {
    for (const module of modules) {
      parseModule(module);
    }
  }
}

const parser = new SchemaParser();

parser.addModule(...getInstalledModules("backend"));
