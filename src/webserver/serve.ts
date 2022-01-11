import type * as express from "express";
import * as fs from "fs";
import * as path from "path";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { __dist } from ".";

export const serveSite = (async (
  req,
  res
) => {
  const page = React.createElement("h3", { className: "text-3xl font-medium leading-tight mt-0 mb-2 text-blue-600" }, "Willkommen!");
  const componentStream = ReactDOMServer.renderToNodeStream(page);
  console.log(ReactDOMServer.renderToString(page));

  const index = await new Promise((resolve: (data: string) => void, reject: (err: NodeJS.ErrnoException | null) => void) => fs.readFile(path.resolve(__dist.frontend, "index.html"), "utf-8", (err, data) => {
    if (err) reject(err);
    else resolve(data);
  }));

  const splitIndex = index.split("<div id=\"app\"/>");
  res.write(`${splitIndex[0]}<div id="app">`);
  componentStream.pipe(res, { end: false });
  componentStream.on("end", () => {
    res.end(`</div>${splitIndex[1]}`);
  });
}) as express.RequestHandler<any>;
