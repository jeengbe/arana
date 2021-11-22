import { __dist, __modules } from "@build/paths";
import * as fs from "fs";
import * as path from "path";
import * as tts from "ttypescript";
import * as ts from "typescript";
import type { Module } from "./manager";
import { getInstalledModules } from "./manager";

export interface GQLType {
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

function toArray<N extends ts.Node>(nodes: ts.NodeArray<N>): N[] {
  return nodes.map(node => node);
}

function filterClassDeclarations(nodes: ts.Statement[]): ts.ClassDeclaration[] {
  return nodes.filter(node => tts.isClassDeclaration(node)) as ts.ClassDeclaration[];
}

function filterImportStatements(nodes: ts.Statement[]): ts.ImportDeclaration[] {
  return nodes.filter(node => tts.isImportDeclaration(node)) as ts.ImportDeclaration[];
}

function findClassByName(nodes: ts.Statement[], name: string): ts.ClassDeclaration | undefined {
  return filterClassDeclarations(nodes).find(clazz => clazz.name?.text === name);
}

function isClassExported(clazz: ts.ClassDeclaration): boolean {
  return clazz.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function isDefaultExport(clazz: ts.ClassDeclaration): boolean {
  return clazz.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword) ?? false;
}

function getClassMethods(clazz: ts.ClassDeclaration): ts.MethodDeclaration[] {
  return clazz.members.filter(member => tts.isMethodDeclaration(member)) as ts.MethodDeclaration[];
}

function getClassName(clazz: ts.ClassDeclaration): string | undefined {
  return clazz.name?.text;
}

function getMethodName(method: ts.MethodDeclaration): string {
  return (method.name as ts.Identifier).text;
}

function getParameterName(parameter: ts.ParameterDeclaration): string {
  return (parameter.name as ts.Identifier).text;
}

function getMethodParameters(method: ts.MethodDeclaration): ts.ParameterDeclaration[] {
  return method.parameters.map(parameter => parameter);
}

function getMethodJsDoc(method: ts.MethodDeclaration): ts.JSDoc | undefined {
  if (!("jsDoc" in method)) return undefined;

  const jsDocs = (method as any as { jsDoc: ts.JSDoc[]; }).jsDoc;
  if (!jsDocs.length) return undefined;
  return jsDocs[jsDocs.length - 1];
}

function getClassJsDoc(clazz: ts.ClassDeclaration): ts.JSDoc | undefined {
  if (!("jsDoc" in clazz)) return undefined;

  const jsDocs = (clazz as any as { jsDoc: ts.JSDoc[]; }).jsDoc;
  if (!jsDocs.length) return undefined;
  return jsDocs[jsDocs.length - 1];
}

function getMethodDescription(method: ts.MethodDeclaration): string | undefined {
  return getMethodJsDoc(method)?.comment;
}

function getClassDescription(clazz: ts.ClassDeclaration): string | undefined {
  return getClassJsDoc(clazz)?.comment;
}

function getMethodParameterDescription(method: ts.MethodDeclaration, parameterName: string): string | undefined {
  const jsDoc = getMethodJsDoc(method);
  if (!jsDoc?.tags) return undefined;
  const paramTags = jsDoc.tags.filter(tag => tag.tagName.text === "param") as ts.JSDocParameterTag[];
  if (!paramTags.length) return undefined;
  const paramTag = paramTags.find(tag => (tag.name as ts.Identifier).text === parameterName);
  if (!paramTag) return undefined;
  return paramTag.comment;
}

function getGlobalName(internalName: string, source: ts.SourceFile): string {
  const importStatements = filterImportStatements(toArray(source.statements));
  const importStatementThatImports = importStatements.find(imp => (imp.importClause?.namedBindings as ts.NamedImports).elements.some(element => element.name.text === internalName));
  if (!importStatementThatImports) return internalName;

  return (importStatementThatImports.importClause?.namedBindings as ts.NamedImports).elements.find(element => element.name.text === internalName)?.propertyName?.text ?? internalName;
}

function nodeToType(source: ts.SourceFile, node?: ts.TypeNode): ValueType {
  switch (node?.kind) {
    case ts.SyntaxKind.StringKeyword:
      // We have string
      return { type: "intrinsic", intrinsicType: "string", nullable: false };
    case ts.SyntaxKind.BooleanKeyword:
      // We have boolean
      return { type: "intrinsic", intrinsicType: "boolean", nullable: false };
    case ts.SyntaxKind.VoidKeyword:
      // We have void
      return { type: "void", nullable: false };
    case ts.SyntaxKind.ArrayType:
      // We have an array array
      const array = node as ts.ArrayTypeNode;
      return { type: "array", arrayType: nodeToType(source, array.elementType), nullable: false };
    case ts.SyntaxKind.NumberKeyword:
      // We don't support raw numbers
      throw new Error(`${"number"} is not supported, use ${"int"} or ${"float"} from ${"@core/utils"}`);
    case ts.SyntaxKind.UnionType:
      // We have a union
      // Unions may only be used to denote nullable types
      const union = node as ts.UnionTypeNode;
      // Check whether one type is undefined => nullable
      const nullable = union.types.some(type => type.kind === ts.SyntaxKind.UndefinedKeyword || type.kind === ts.SyntaxKind.NullKeyword);
      if (!nullable) throw new Error("Unions may only be used to denote nullable types");
      if (union.types.length !== 2) throw new Error("Unexpected union length");
      // Apply `nullable` to the actual type
      return { ...nodeToType(source, union.types.find(type => type.kind !== ts.SyntaxKind.UndefinedKeyword && type.kind !== ts.SyntaxKind.NullKeyword)), nullable: true };
    case ts.SyntaxKind.TypeReference:
      // We have a type reference
      const typeReference = node as ts.TypeReferenceNode;
      const localName = (typeReference.typeName as ts.Identifier).text;
      if (localName === "int") {
        return { type: "intrinsic", intrinsicType: "int", nullable: false };
      }
      if (localName === "float") {
        return { type: "intrinsic", intrinsicType: "float", nullable: false };
      }

      return { type: "custom", customType: getGlobalName(localName, source), nullable: false };
    default:
      throw new Error(`Unexpected node type: ${node?.kind}`);
  }
}

function getClassConstructor(clazz: ts.ClassDeclaration): ts.ConstructorDeclaration | undefined {
  return clazz.members.find(member => tts.isConstructorDeclaration(member)) as ts.ConstructorDeclaration;
}

function getConstructorParameters(constructor: ts.ConstructorDeclaration): ts.ParameterDeclaration[] {
  return constructor.parameters.map(parameter => parameter);
}

function getConstructorParametersWithModifiers(parameters: ts.ParameterDeclaration[]): ts.ParameterDeclaration[] {
  return parameters.filter(parameter => parameter.modifiers?.length);
}

function getConstructorJsDoc(constructor: ts.ConstructorDeclaration): ts.JSDoc | undefined {
  if (!("jsDoc" in constructor)) return undefined;

  const jsDocs = (constructor as any as { jsDoc: ts.JSDoc[]; }).jsDoc;
  if (!jsDocs.length) return undefined;
  return jsDocs[jsDocs.length - 1];
}

function getParameterJsDoc(parameter: ts.ParameterDeclaration): ts.JSDoc | undefined {
  if (!("jsDoc" in parameter)) return undefined;

  const jsDocs = (parameter as any as { jsDoc: ts.JSDoc[]; }).jsDoc;
  if (!jsDocs.length) return undefined;
  return jsDocs[jsDocs.length - 1];
}

function getConstructorParameterDescription(parameter: ts.ParameterDeclaration): string | undefined {
  const jsDoc = getParameterJsDoc(parameter);

  return jsDoc?.comment;
}

function classToSchema(source: ts.SourceFile, className: string): any {
  const classNode = findClassByName(toArray(source.statements), className);

  if (!classNode) throw new Error(`Class ${className} not found in source`);


  const schema: GQLType = {
    name: className,
    description: getClassDescription(classNode),
    fields: []
  };

  const constructor = getClassConstructor(classNode);
  if (constructor) {
    // Check constructor properties
    for (const parameter of getConstructorParametersWithModifiers(getConstructorParameters(constructor))) {
      const modifiers = parameter.modifiers!;
      if (modifiers[0].kind !== ts.SyntaxKind.PublicKeyword) continue;
      schema.fields.push({
        name: getParameterName(parameter),
        type: nodeToType(source, parameter.type),
        description: getConstructorParameterDescription(parameter),
        args: []
      });
    }
  }

  // Check all methods
  for (const method of getClassMethods(classNode)) {
    const args = getMethodParameters(method).map(parameter => ({
      name: getParameterName(parameter),
      type: nodeToType(source, parameter.type),
      description: getMethodParameterDescription(method, getParameterName(parameter))
    }));

    schema.fields.push({
      name: getMethodName(method),
      type: nodeToType(source, method.type),
      description: getMethodDescription(method),
      args
    });
  }

  return schema;
}

export function parseModule(module: Module): GQLType[] {
  const types = [];
  for (const file of fs.readdirSync(path.resolve(__modules.backend, module.id))) {
    const filePath = path.resolve(__modules.backend, module.id, file);
    const src = tts.createSourceFile(filePath, fs.readFileSync(filePath, "utf8"), tts.ScriptTarget.ES2020);

    for (const classDeclaration of filterClassDeclarations(toArray(src.statements))) {
      if (isDefaultExport(classDeclaration)) continue;
      if (!isClassExported(classDeclaration)) continue;
      const className = getClassName(classDeclaration)!;
      const schema = classToSchema(src, className);
      types.push(schema);
    }
  }

  return types;
}

export function convertSchemasToJson() {
  const types: GQLType[] = [];
  for (const module of getInstalledModules("backend")) {
    types.push(...parseModule(module));
  }


  fs.writeFileSync(path.resolve(__dist.backend, "core", "schema.json"), JSON.stringify(types, null, 2));
}
