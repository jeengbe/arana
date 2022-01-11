import * as express from "express";
import * as path from "path";
import { serveSite } from "./serve";

const _dist = path.resolve(__dirname, "..");

export const __dist = {
  frontend: path.resolve(_dist, "frontend"),
  backend: path.resolve(_dist, "backend"),
  webserver: path.resolve(_dist, "webserver")
};

const app = express();

app.get("/", serveSite);
app.use(express.static(__dist.frontend));

app.get("*", serveSite);

app.listen(80, () => console.log("Server listening on port 80"));
