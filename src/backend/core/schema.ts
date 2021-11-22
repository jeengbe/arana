import * as fs from "fs";
import type { GraphQLType } from "graphql";
import { GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLScalarType, GraphQLSchema, GraphQLString } from "graphql";
import * as path from "path";
// This huge path is okay for importing types as this whole idea is an exception anyway
// import type { Arg, Field, GQLType, ValueType } from "./../../../build/lib/graphQLParser";
type Arg = any;
type Field = any;
type GQLType = any;
type ValueType = any;
// Unfortunately, we can't import these types as if they were imported, they would mess up the /dist/backend folder structure
// TODO: Find out why this happens


export const GraphQLVoid = new GraphQLScalarType({
  name: "Void",
  description: "Represents NULL values",
  serialize() {
    return null;
  },
  parseValue() {
    return null;
  },
  parseLiteral() {
    return null;
  }
});


function convertJsonType(type: ValueType, typesList: Record<string, GraphQLObjectType>): GraphQLType {
  let gType: GraphQLType | undefined;
  switch (type.type) {
    case "intrinsic":
      // Intrinsic type, this is easy
      switch (type.intrinsicType) {
        case "string":
          gType = GraphQLString;
          break;
        case "int":
          gType = GraphQLInt;
          break;
        case "float":
          gType = GraphQLFloat;
          break;
        case "boolean":
          gType = GraphQLBoolean;
          break;
      }
      break;
    case "void":
      gType = GraphQLVoid;
      break;
    case "array":
      // Array type, this is a bit more complicated
      const arrayType = convertJsonType(type.arrayType, typesList);
      gType = GraphQLList(arrayType);
      break;
    case "custom":
      // Custom type, easy again
      gType = typesList[type.customType];
  }

  if (gType === undefined) throw new Error("Unknown type!");

  return type.nullable ? gType : GraphQLNonNull(gType);
}

function buildObjectTypeFromJsonSchema(json: GQLType, types: Record<string, GraphQLObjectType>): GraphQLObjectType {
  return new GraphQLObjectType({
    name: json.name,
    description: json.description,
    fields: () => Object.assign({}, ...json.fields.map((field: Field) => ({
      [field.name]: {
        type: convertJsonType(field.type, types),
        description: field.description,
        args: Object.assign({}, ...field.args.map((arg: Arg) => ({
          [arg.name]: {
            type: convertJsonType(arg.type, types),
            description: arg.description
          }
        })))
      }
    })))
  });
}

function buildQueryObject(): GraphQLObjectType {
  const types: Record<string, GraphQLObjectType> = {};

  for (const type of JSON.parse(fs.readFileSync(path.join(__dirname, "schema.json"), "utf8")) as any[]) {
    types[type.name] = buildObjectTypeFromJsonSchema(type, types);
  }

  return types.Query;

  // return new GraphQLObjectType({
  //   name: "Query",
  //   description: "The root query type",
  //   fields: {
  //     module: {
  //       type: types.VersionString
  //     },
  //     publicKey: {
  //       type: GraphQLNonNull(GraphQLString),
  //       description: "The server's public key"
  //     }
  //   }
  // });
}

// function buildMutationObject(): GraphQLObjectType {
//   return new GraphQLObjectType({
//     name: "mutation",
//     fields: {
//     }
//   });
// }

export function buildSchema(): GraphQLSchema {
  return new GraphQLSchema({
    query: buildQueryObject()
    // mutation: buildMutationObject()
  });
}
