import * as cors from "cors";
import * as express from "express";
import { graphqlHTTP } from "express-graphql";
import auth from "./auth";
import { buildSchema } from "./schema";

export default class Server {
  protected readonly app: express.Application;

  constructor() {
    this.app = express();

    this.setupMiddleware();
    this.setupGraphQL();
  }

  private setupMiddleware() {
    this.app.use(cors(), auth());
  }

  private setupGraphQL() {
    this.app.use("/", graphqlHTTP({
      schema: buildSchema(),
      graphiql: {
        headerEditorEnabled: true
      }
    }));
  }

  public start(port = 80) {
    console.log("starting");
    this.app.listen(port);
  }
}
