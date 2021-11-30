import { DEBUG } from "@logger";
import { __dist, __modules } from "@paths";
import * as fs from "fs";
import * as path from "path";
import * as tts from "ttypescript";
import * as ts from "typescript";
import type { Module } from "./manager";
import { getInstalledModules } from "./manager";

export type typeType = "type" | "input";

export interface Type {
  name: string;
  typeType: typeType;
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

function getObjectName(node: ts.Node & { name?: ts.BindingName | ts.PropertyName; }): string | undefined {
  if (!node.name) return undefined;
  if (ts.isIdentifier(node.name)) return node.name.text;
  throw new Error("Show me this code");
}

function getClassByName(src: ts.SourceFile, name: string): ts.ClassDeclaration | undefined {
  return src.statements.filter(ts.isClassDeclaration).find(node => getObjectName(node) === name);
}

function getInterfaceByName(src: ts.SourceFile, name: string): ts.InterfaceDeclaration | undefined {
  return src.statements.filter(ts.isInterfaceDeclaration).find(node => getObjectName(node) === name);
}

function getEnumByName(src: ts.SourceFile, name: string): ts.EnumDeclaration | undefined {
  return src.statements.filter(ts.isEnumDeclaration).find(node => getObjectName(node) === name);
}

function getObjectByName(src: ts.SourceFile, name: string): tsType | undefined {
  return getClassByName(src, name)
    ?? getInterfaceByName(src, name)
    ?? getEnumByName(src, name);
}

function getObjectMethods(object: tsType): ts.MethodDeclaration[] | ts.MethodSignature[] {
  if (ts.isClassDeclaration(object)) {
    return object.members.filter(member => ts.isMethodDeclaration(member)) as ts.MethodDeclaration[];
  } else if (ts.isInterfaceDeclaration(object)) {
    return object.members.filter(member => member.kind === ts.SyntaxKind.MethodSignature) as ts.MethodSignature[];
  }
  return [];
}

function getClassConstructor(object: ts.ClassDeclaration): ts.ConstructorDeclaration | undefined {
  return object.members.find(member => member.kind === ts.SyntaxKind.Constructor) as ts.ConstructorDeclaration | undefined;
}

function getConstructorProperties(constructor: ts.ConstructorDeclaration): ts.ParameterDeclaration[] {
  // Filter property declaration
  return constructor.parameters.filter(param => param.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.PublicKeyword));
}

function getObjectProperties(object: tsType, searchForConstructor = true): (ts.PropertyDeclaration | ts.ParameterDeclaration)[] | ts.PropertySignature[] {
  if (ts.isClassDeclaration(object)) {
    const properties = object.members.filter(member => member.kind === ts.SyntaxKind.PropertyDeclaration) as (ts.PropertyDeclaration | ts.ParameterDeclaration)[];
    const constructor = getClassConstructor(object);
    if (constructor && searchForConstructor) {
      properties.push(...getConstructorProperties(constructor));
    }
    return properties;
  } else if (ts.isInterfaceDeclaration(object)) {
    return object.members.filter(member => member.kind === ts.SyntaxKind.PropertySignature) as ts.PropertySignature[];
  }
  return [];
}

function getTypeName(type: ts.EntityName): string {
  if (ts.isIdentifier(type)) {
    return type.text;
  }
  throw new Error("Unknown type");
}

function resolveTypeToStringAndImport(src: ts.SourceFile, type?: ts.TypeNode): ValueType {
  if (!type) {
    throw new Error("No type given");
  }
  if (ts.isTypeReferenceNode(type)) {
    const customType = getTypeName(type.typeName);
    if (customType === "int") {
      return {
        type: "intrinsic",
        intrinsicType: "int",
        nullable: false
      };
    } else if (customType === "float") {
      return {
        type: "intrinsic",
        intrinsicType: "float",
        nullable: false
      };
    }

    return {
      type: "custom",
      customType,
      nullable: false
    };
  } else if (ts.isArrayTypeNode(type)) {
    return {
      type: "array",
      arrayType: resolveTypeToStringAndImport(src, type.elementType),
      nullable: false
    };
  } else if (ts.isUnionTypeNode(type)) {
    const isExactlyNullable = type.types.length === 2 && type.types.some(t => t.kind === ts.SyntaxKind.NullKeyword || t.kind === ts.SyntaxKind.UndefinedKeyword);
    const nonNullType = type.types.find(t => t.kind !== ts.SyntaxKind.NullKeyword && t.kind !== ts.SyntaxKind.UndefinedKeyword);
    if (!isExactlyNullable) {
      throw new Error("Unknown union type");
    }
    return {
      ...resolveTypeToStringAndImport(src, nonNullType),
      nullable: true
    };
  } else if (type.kind === ts.SyntaxKind.StringKeyword) {
    return {
      type: "intrinsic",
      intrinsicType: "string",
      nullable: false
    };
  } else if (type.kind === ts.SyntaxKind.BooleanKeyword) {
    return {
      type: "intrinsic",
      intrinsicType: "boolean",
      nullable: false
    };
  } else if (type.kind === ts.SyntaxKind.VoidKeyword || type.kind === ts.SyntaxKind.UndefinedKeyword) {
    return {
      type: "void",
      nullable: false
    };
  }
  throw new Error("Unknown type");
}

function getMethodParameterTypes(src: ts.SourceFile, method: ts.MethodDeclaration): ValueType[] {
  return method.parameters.map(param => resolveTypeToStringAndImport(src, param.type));
}

function getMethodReturnType(src: ts.SourceFile, method: ts.MethodDeclaration): ValueType {
  return resolveTypeToStringAndImport(src, method.type);
}

function inTypeInScope(src: ts.SourceFile, type: string): boolean {
  return getClassByName(src, type) !== undefined
    || getInterfaceByName(src, type) !== undefined
    || getEnumByName(src, type) !== undefined;
}

function getImportThatImportsType(src: ts.SourceFile, type: string): { importStatement: ts.ImportDeclaration; realName: string; isDefaultExport: boolean; } | undefined {
  const imports = src.statements.filter(ts.isImportDeclaration);
  for (const importStatement of imports) {
    if (importStatement.importClause?.name) {
      const importName = importStatement.importClause.name.text;
      if (importName === type) {
        return {
          importStatement,
          realName: type,
          isDefaultExport: true
        };
      }
    }
    if (importStatement.importClause?.namedBindings) {
      if (ts.isNamedImports(importStatement.importClause.namedBindings)) {
        const namedImports = importStatement.importClause.namedBindings.elements;
        for (const namedImport of namedImports) {
          if (namedImport.name.text === type) {
            return {
              importStatement,
              realName: namedImport.propertyName?.text ?? namedImport.name.text,
              isDefaultExport: false
            };
          }
        }
      }
    }
  }
}

function getDefaultExport(src: ts.SourceFile): ts.Node | undefined {
  return src.statements.find(node => node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) && node.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword));
}

function resolvePath(src: ts.SourceFile, pth: string): string {
  if (!pth.startsWith(".")) throw new Error("Unexpected path");
  return path.resolve(path.dirname(src.fileName), `${pth.substr(2)}.ts`);
}

function importAndParseType(src: ts.SourceFile, typeType: typeType, type: string): void {
  const imp = getImportThatImportsType(src, type);
  if (!imp) throw new Error("Import not found");

  const locationOfType = (imp.importStatement.moduleSpecifier as ts.StringLiteral).text;

  const modulePath = resolvePath(src, locationOfType);
  DEBUG`Parsing additional module ${modulePath} for type ${type}`;
  const source = ts.createSourceFile(modulePath, fs.readFileSync(modulePath, "utf-8"), ts.ScriptTarget.ES2020);
  if (imp.isDefaultExport) {
    DEBUG("We are dealing with a default export");
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    parseObject(source, typeType, getDefaultExport(source) as tsType);
  } else {
    DEBUG("The export is named");
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    parseObject(source, typeType, getObjectByName(source, imp.realName)!);
  }
}

function getParameterType(src: ts.SourceFile, parameter: ts.ParameterDeclaration): ValueType {
  return resolveTypeToStringAndImport(src, parameter.type);
}

function getPropertyType(src: ts.SourceFile, property: ts.PropertyDeclaration | ts.PropertySignature): ValueType {
  return resolveTypeToStringAndImport(src, property.type);
}

function importValueDependencies(src: ts.SourceFile, typeType: typeType, value: ts.MethodDeclaration | ts.PropertyDeclaration | ts.PropertySignature | ts.ParameterDeclaration): void {
  const usedTypes = [];

  switch (value.kind) {
    case ts.SyntaxKind.MethodDeclaration:
      usedTypes.push(...getMethodParameterTypes(src, value).map(t => ({ ...t, typeType: "input" })), { ...getMethodReturnType(src, value), typeType: "type" });
      break;
    case ts.SyntaxKind.PropertyDeclaration:
    case ts.SyntaxKind.PropertySignature:
      usedTypes.push({ ...getPropertyType(src, value), typeType: "type" });
      break;
    case ts.SyntaxKind.Parameter:
      usedTypes.push({ ...getParameterType(src, value), typeType: "type" });
      break;
  }

  for (const type of usedTypes.map(typ => (typ.type === "array" ? typ.arrayType : typ))) {
    if (type.type === "custom") {
      const { customType } = type;
      // Check if customType is in src scope
      if (!inTypeInScope(src, customType)) {
        DEBUG`Custom type ${customType} is not in scope. Importing`;
        // Class not in scope
        importAndParseType(src, typeType, customType);
      } else {
        DEBUG`Custom type ${customType} is in scope`;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        parseObject(src, typeType, getObjectByName(src, customType)!);
      }
    }
  }
}

interface hasJsDoc {
  jsDoc?: ts.JSDoc[];
}

function getObjectDescription(obj: ts.Node): string | undefined {
  const docc = obj as hasJsDoc;
  return docc.jsDoc?.length ? docc.jsDoc[docc.jsDoc.length - 1].comment : undefined;
}

function getMethodType(src: ts.SourceFile, method: ts.MethodDeclaration): ValueType {
  return resolveTypeToStringAndImport(src, method.type);
}

function getMethodArgs(src: ts.SourceFile, method: ts.MethodDeclaration): Arg[] {
  return method.parameters.map(param => {
    if (!ts.isIdentifier(param.name)) {
      throw new Error("What is a binding");
    }
    return {
      name: param.name.text,
      type: getParameterType(src, param),
      description: getObjectDescription(param)
    };
  });
}

type tsType = ts.ClassDeclaration | ts.InterfaceDeclaration | ts.EnumDeclaration;

const types: Record<string, Type> = {};
const parsing: string[] = [];

function parseObject(src: ts.SourceFile, typeType: typeType, object: tsType): void {
  const name = getObjectName(object);
  if (!name) {
    throw new Error("Unnamed object");
  }
  DEBUG`Parsing object ${name} of kind ${object.kind}`;
  if (name in types || parsing.includes(name)) {
    DEBUG`Already parsed or currently parsing ${name}. Skipping.`;
    // We have already parsed this type or are currently parsing it (circular dependency)
    return;
  }


  parsing.push(name);
  // Will populate later
  types[name] = {} as Type;

  const methods = getObjectMethods(object);
  const properties = getObjectProperties(object, true);

  const methodsAndPropertiesOrderedByLineNumber = [...methods, ...properties].sort((a, b) => a.getStart(src) - b.getStart(src));

  const type: Type = {
    name,
    typeType,
    description: getObjectDescription(object),
    fields: []
  };

  for (const methodOrProperty of methodsAndPropertiesOrderedByLineNumber) {
    if (ts.isMethodDeclaration(methodOrProperty)) {
      DEBUG`Checking method ${getObjectName(methodOrProperty)}`;
      importValueDependencies(src, typeType, methodOrProperty);
      type.fields.push({
        name: getObjectName(methodOrProperty)!,
        description: getObjectDescription(methodOrProperty),
        type: getMethodType(src, methodOrProperty),
        args: getMethodArgs(src, methodOrProperty)
      });
    } else if (ts.isPropertyDeclaration(methodOrProperty) || ts.isPropertySignature(methodOrProperty)) {
      DEBUG`Checking property ${getObjectName(methodOrProperty)}`;
      importValueDependencies(src, typeType, methodOrProperty);
      type.fields.push({
        name: getObjectName(methodOrProperty)!,
        description: getObjectDescription(methodOrProperty),
        type: getPropertyType(src, methodOrProperty),
        args: []
      });
    } else if (ts.isParameter(methodOrProperty)) {
      DEBUG`Checking constructor parameter ${getObjectName(methodOrProperty)}`;
      importValueDependencies(src, typeType, methodOrProperty);
      type.fields.push({
        name: getObjectName(methodOrProperty)!,
        description: getObjectDescription(methodOrProperty),
        type: getParameterType(src, methodOrProperty),
        args: []
      });
    } else {
      throw new Error("Unexpected node");
    }
  }

  Object.assign(types[name], type);
}

function parseModule(module: Module): void {
  const entryFilePath = path.resolve(__modules.backend, module.id, "schema.ts");

  const src = tts.createSourceFile(entryFilePath, fs.readFileSync(entryFilePath, "utf-8"), tts.ScriptTarget.ES2020);
  const queryClass = getClassByName(src, "Query");

  parseObject(src, "type", queryClass!);
}


export class SchemaParser {
  protected readonly types: Record<string, Type> = {};

  public addModule(...modules: Module[]): void {
    for (const module of modules) {
      parseModule(module);
    }
  }
}

export function convertSchemasToJson() {
  const parser = new SchemaParser();
  parser.addModule(...getInstalledModules("backend"));
  fs.writeFileSync(path.resolve(__dist.backend, "core", "schema.json"), JSON.stringify(Object.values(types), null, 2));
}
