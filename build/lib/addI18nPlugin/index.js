/* eslint-disable */
const fs = require("fs");
const path = require("path");
const {
  Compiler,
  NormalModule,
  Module,
  Dependency,
  Compilation
} = require("webpack");
const LazySet = require("webpack/lib/util/LazySet");
const NormalModuleFactory = require("webpack/lib/NormalModuleFactory");

/** @type {NormalModuleFactory} */
let normalFactory;

const mapModules = {};
const mapStingsModules = {};

const isMapModule = module =>
  module instanceof NormalModule &&
  /[\\/]i18n[\\/]_map\.json$/.test(module.resource);

/**
 * @param {string} source
 *
 * "Borrowed" this from copy-webpack-plugin.
 * Must be the same algorithm so we reference the same files they copied.
 */
function getContentHash(source) {
  const { outputOptions } = global.compilation;
  const { hashDigest, hashDigestLength, hashFunction, hashSalt } =
    outputOptions;
  const hash = global.compiler.webpack.util.createHash(hashFunction);

  if (hashSalt) {
    hash.update(hashSalt);
  }

  hash.update(source);

  const fullContentHash = hash.digest(hashDigest);

  return fullContentHash.slice(0, hashDigestLength);
}

module.exports = class {
  /** @param {Compiler} compiler */
  apply(compiler) {
    global.compiler = compiler;
    compiler.hooks.normalModuleFactory.tap(
      "AddI18nPlugin",
      factory => void (normalFactory = factory)
    );

    compiler.hooks.compilation.tap("AddI18nPlugin", compilation => {
      global.compilation = compilation;
      NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(
        "AddI18nPlugin",
        (loaders, module) => {
          if (!isMapModule(module)) return;

          loaders.push({
            loader: require.resolve("./loader.js")
          });
          if (loaders.length === 1) {
            module.buildInfo.buildDependencies = new LazySet();
          }
        }
      );

      compilation.hooks.buildModule.tap("AddI18nPlugin", mapModule => {
        if (!isMapModule(mapModule)) return;

        mapModules[mapModule.identifier()] = mapModule;

        // fs.readdirSync(mapModule.context)
        //   .filter(langFile => /^[a-zA-Z-]+\.json$/.test(langFile))
        //   .forEach(langFile => {
        //     const stingsModule = new NormalModule({
        //       layer: null,
        //       type: "asset/resource",
        //       request: `${mapModule.context}/${langFile}`,
        //       userRequest: `${mapModule.context}/${langFile}`,
        //       rawRequest: `./${langFile}`,
        //       loaders: [],
        //       resource: `${mapModule.context}/${langFile}`,
        //       resourceResolveData: {
        //         resource: `${mapModule.context}/${langFile}`,
        //         data: {}
        //       },
        //       context: mapModule.context,
        //       matchResource: undefined,
        //       parser: normalFactory.getParser("asset/resource"),
        //       parserOptions: undefined,
        //       generator: normalFactory.getGenerator("asset/resource"),
        //       generatorOptions: undefined,
        //       resolveOptions: undefined
        //     });

        //     mapModule.buildInfo.buildDependencies.add(stingsModule);
        //   });
      });
    });
  }
};

module.exports.__src = path.resolve(__dirname, "..", "..", "..", "src", "frontend");
module.exports.getContentHash = getContentHash;
