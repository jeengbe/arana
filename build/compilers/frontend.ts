/* eslint-disable @typescript-eslint/no-require-imports */
import { getInstalledModules } from "@lib/manager";
import { DEBUG, INFO, WARN } from "@logger";
import { __core, __dist, __modules, __src } from "@paths";
import { readdirRecursiveSync } from "@utils";
import * as Autoprefixer from "autoprefixer";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import * as CopyWebpackPlugin from "copy-webpack-plugin";
import * as fs from "fs";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as path from "path";
import * as PostcssFlexbugFixes from "postcss-flexbugs-fixes";
import * as TailwindCss from "tailwindcss";
import * as TerserWebpackPlugin from "terser-webpack-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import * as webpack from "webpack";
import type * as webpackDevServer from "webpack-dev-server";
import * as AddI18nPlugin from "../lib/addI18nPlugin/index";
import { UserError } from "../lib/UserError";
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const FlexGapPolyfill = require("flex-gap-polyfill");
const PostcssMediaMinMax = require("postcss-media-minmax");

/**
 * Iterate all modules and add their entries
 * @returns Entry points for webpack
 */
function findEntries(): webpack.EntryObject {
  // Entry points per each module
  const entries: webpack.EntryObject = {};
  DEBUG("Finding all entry points");

  for (const { id, vendor, name } of getInstalledModules("frontend")) {
    DEBUG`Checking entries for ${id}`;
    // All entry points for this module
    const moduleEntries = [];

    const _module = path.resolve(__modules.frontend, `@${vendor}`, name);

    // Check each type of file that we use as entry point in the bundle
    for (const category of [
      path.resolve(_module, "pages"),
      path.resolve(_module, "plugins"),
      path.resolve(_module, "styles")
    ]) {
      if (fs.existsSync(category)) {
        moduleEntries.push(...readdirRecursiveSync(category).map(categoryFile => path.resolve(category, categoryFile)));
      }
    }
    if (moduleEntries.length > 0) {
      entries[id] = {
        import: moduleEntries
      };
      // TODO: Figure out dependencies on own
      if (id === "@Schwekas/website") {
        // @ts-expect-error
        entries[id].dependOn = ["@Schwekas/UI"];
      }
    } else {
      WARN`No entry points found for ${id}`;
    }
  }

  const entriesLength = Object.keys(entries).length;
  entries._index = {
    import: path.resolve(__core.frontend, "index.ts")
  };
  if (entriesLength > 0) {
    entries._index.dependOn = Object.keys(entries).filter(key => key !== "_index");
  }

  if (entriesLength === 0) {
    throw new UserError("Found no modules with entry points. Aborting start.");
  } else {
    DEBUG`Found ${entriesLength} module(s) with entry points:
${entries}`;
  }

  return entries;
}

/**
 * Map path alias from typescript to a format that webpack understands
 */
function mapAlias() {
  const tsconfig = JSON.parse(fs.readFileSync(path.resolve(__src.frontend, "tsconfig.json"), "utf8"));
  const alias: Record<string, string> = {};

  for (const key in tsconfig.compilerOptions.paths) {
    alias[key.slice(0, -2)] = `src${tsconfig.compilerOptions.paths[key].slice(2, -2)}`;
  }

  return alias;
}

/**
 * Generate a webpack configuration with regard to `process.env.NODE_ENV`
 */
export function createWebpackConfig(): webpack.Configuration {
  const {
    NODE_ENV,
    PUBLIC_PATH
  } = process.env;

  const config: webpack.Configuration = {
    entry: findEntries(),
    output: {
      filename: "[name].[contenthash].js",
      assetModuleFilename: "[name].[contenthash][ext]",
      path: __dist.frontend,
      publicPath: PUBLIC_PATH
    },
    optimization: {
      splitChunks: {
        cacheGroups: Object.assign({
          vendors: {
            name: "vendors",
            test: /[\\/]node_modules[\\/]/,
            chunks: "all",
            enforce: true
          },
          core: {
            name: "core",
            test: /[\\/]core[\\/]/,
            chunks: "all",
            enforce: true
          }
        }, ...getInstalledModules("frontend").map(({ id }) => ({
          [id]: {
            name: id,
            test: new RegExp(`(?:[\\\\/]modules[\\\\/])?${id.replace("/", "[\\\\/]")}[\\\\/]`),
            chunks: "all",
            enforce: true
          }
        })))
      },
      usedExports: true,
      minimizer: [
        // TODO: Fix and reenable
        // new CssMinimizerWebpackPlugin(),
        new TerserWebpackPlugin({
          terserOptions: {
            mangle: {
              properties: {
                regex: /^_(?:private|internal)_/ // the same prefixes like for custom transformer
              }
            }
          }
        })
      ],
      moduleIds: NODE_ENV === "development" ? "named" : "deterministic",
      minimize: NODE_ENV !== "development"
    },
    module: {
      rules: [
        {
          test: /\.(?:ttf|otf|eot|svg|woff2?|jpe?g|png|ico)$/i,
          type: "asset/resource"
        },
        {
          test: /\.i18n[\\/]_map\.json$/i,
          type: "asset/inline"
        },
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          exclude: /node_modules/,
          options: {
            context: __src.frontend,
            configFile: path.resolve(__src.frontend, "tsconfig.json"),
            transpileOnly: true
          }
        },
        {
          test: /\.s?css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
                modules: {
                  auto: (fileName: string) => !fileName.endsWith("global.scss"),
                  localIdentName: process.env.NODE_ENV === "development" ? "[local]__[path][name]" : "[hash:base64:6]"
                }
              }
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    TailwindCss({
                      content: ["./src/frontend/**/*.tsx"],
                      darkMode: "media",
                      theme: {
                        extend: {}
                      },
                      plugins: []
                    }),
                    Autoprefixer,
                    PostcssFlexbugFixes,
                    FlexGapPolyfill,
                    PostcssMediaMinMax
                  ]
                }
              }
            },
            "sass-loader"
          ]
        }
      ]
    },
    resolve: {
      modules: [__src.frontend, "node_modules"],
      extensions: [".tsx", ".ts", ".js"],
      alias: mapAlias(),
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__src.frontend, "tsconfig.json")
        })
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" }),
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          context: __src.frontend,
          configFile: path.resolve(__src.frontend, "tsconfig.json")
        }
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "src/frontend/core/i18n/*.json",
            globOptions: {
              ignore: ["**/*/_map.json"]
            },
            to: "[name].[contenthash][ext]"
          },
          {
            from: "src/frontend/modules/**/*/i18n/*.json",
            globOptions: {
              ignore: ["**/*/_map.json"]
            },
            to: "[name].[contenthash][ext]"
          }
        ]
      }),
      new AddI18nPlugin(),
      new HtmlWebpackPlugin({
        filename: path.resolve(__dist.frontend, "index.html"),
        templateContent: "<html><body><div id=\"app\"></div></body></html>"
      })
    ],
    stats: {
      errorDetails: false
    }
  };

  if (NODE_ENV === "development") {
    Object.assign(config, {
      mode: "development",
      devtool: "source-map"
    });
    config.plugins!.push(
      new webpack.SourceMapDevToolPlugin({
        filename: "[file].map",
        namespace: "arana"
      })
    );
  } else {
    Object.assign(config, {
      mode: "production",
      devtool: false
    });
  }

  return config;
}

/**
 * Generate webpack compiler configuration with respect to `process.env.NODE_ENV`
 */
export function createWebpackCompiler() {
  DEBUG("Creating webpack configuration");
  const config = createWebpackConfig();
  DEBUG("Created webpack compiler");
  return webpack(config);
}

/**
 * Generate a webpack configuration with regard to `process.env.NODE_ENV`
 */
export function createWebpackDevServerConfig(): webpackDevServer.Configuration {
  const {
    DEV_SERVER_SSL,
    DEV_SERVER_SSL_KEY,
    DEV_SERVER_SSL_CRT,
    HOST,
    PORT,
    OPEN
  } = process.env;

  DEBUG("Creating dev server configuration");

  const config: webpackDevServer.Configuration = {
    historyApiFallback: true,
    host: HOST,
    port: PORT,
    client: {
      logging: "none",
      overlay: true,
      progress: true
    },
    setupExitSignals: true,
    open: OPEN === "true" ? true : OPEN === "false" ? false : OPEN
  };

  // check if env DEV_SERVER_SSL is true, if so, enable https and read certificate from files and add to config
  if (DEV_SERVER_SSL === "true") {
    INFO("Enabling https for dev server");
    if (!DEV_SERVER_SSL_CRT || !DEV_SERVER_SSL_KEY) {
      WARN("No certificate file specified. Disabling https.");
    } else if (!fs.existsSync(DEV_SERVER_SSL_CRT) || !fs.existsSync(DEV_SERVER_SSL_KEY)) {
      WARN("Certificate file does not exist. Disabling https.");
    } else {
      DEBUG`Using certificate from ${DEV_SERVER_SSL_CRT}`;
      DEBUG`Using key from ${DEV_SERVER_SSL_KEY}`;
      Object.assign(config, {
        server: {
          type: "https",
          options: {
            cert: fs.readFileSync(DEV_SERVER_SSL_CRT, "utf-8"),
            key: fs.readFileSync(DEV_SERVER_SSL_KEY, "utf-8")
          }
        }
      });
    }
  }

  return config;
}
