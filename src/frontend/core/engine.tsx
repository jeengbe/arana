import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Lib from "./i18nLib";
import getCurrentRoute from "./internal/currentRoute";
import { setRouteFunction } from "./internal/engineRouteFunction";
import { Router } from "./router";

/**
 * The Engine serves as the main entry point to the application. Its main purpose is to render the current page to DOM.
 */
export default class Engine {
  /**
   * Render the loading screen to DOM
   */
  public static load(): void {
    ReactDOM.render(
      // TODO: Fancier
      <>Please stand by...</>,
      document.getElementById("app")
    );
  }

  /**
   * Render the current route to DOM
   */
  public static route(): void {
    Router.determineCurrentRoute();
    ReactDOM.render(
      <React.StrictMode>
        {React.createElement(getCurrentRoute().page, {
          key: Lib.currentLanguage
          // TODO: currentUser
        })}
      </React.StrictMode>,
      document.getElementById("app")
    );
  }

  /**
   * List of IDs already generated
   */
  private static readonly IDs: string[] = [];

  /**
   * Generate a unique ID
   * @return i-XXXXXXXXX
   */
  public static generateID(): string {
    let ID;
    do {
      ID = `i-${Math.random().toString(36).substr(2, 9)}`;
    } while (Engine.IDs.includes(ID));
    Engine.IDs.push(ID);

    return ID;
  }
}

setRouteFunction(Engine.route.bind(Engine));

// TEST: Add to tests: ensure all yaml files are .yml and not .yaml
