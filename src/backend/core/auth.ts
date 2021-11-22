import type { NextHandleFunction } from "connect";

export default function auth(): NextHandleFunction {
  // TODO: Auth
  return (req, res, next) => {
    next();
  };
}
