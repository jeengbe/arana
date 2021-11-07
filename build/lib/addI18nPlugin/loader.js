/* eslint-disable */

const { __src, getContentHash } = require("./index");
const path = require("path");
const fs = require("fs");

module.exports = source => {
  const { module } = JSON.parse(source);
  const _module =
    module === "_core"
      ? path.resolve(__src, "core")
      : path.resolve(__src, "modules", module);
  const _mi18n = path.resolve(_module, "i18n");

  return JSON.stringify(
    Object.assign(
      {},
      ...fs
        .readdirSync(_mi18n)
        .filter(langFile => /^[a-zA-Z-]+\.json$/.test(langFile))
        .map(langFile => {
          return {
            [langFile.slice(0, -5)]:
              "/" +
              langFile.slice(0, -5) +
              "." +
              getContentHash(
                fs.readFileSync(path.resolve(_mi18n, langFile), "utf8")
              ) +
              ".json"
          };
        })
    ),
    null,
    2
  );
};
