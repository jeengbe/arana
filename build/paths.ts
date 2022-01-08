import * as path from "path";

export const __base = path.resolve(__dirname, "..");

export const _dist = path.resolve(__base, "dist");
export const _src = path.resolve(__base, "src");

export const __dist = {
  frontend: path.resolve(_dist, "frontend"),
  backend: path.resolve(_dist, "backend"),
  webserver: path.resolve(_dist, "webserver")
};

export const __src = {
  frontend: path.resolve(__base, "src", "frontend"),
  backend: path.resolve(__base, "src", "backend"),
  webserver: path.resolve(__base, "src", "webserver")
};

export const __core = {
  frontend: path.resolve(__src.frontend, "core"),
  backend: path.resolve(__src.backend, "core")
};

export const __modules = {
  frontend: path.resolve(__src.frontend, "modules"),
  backend: path.resolve(__src.backend, "modules")
};
