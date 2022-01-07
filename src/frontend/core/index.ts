import { Engine } from "./engine";
import { awaitSetup, currentLanguage } from "./i18nLib";
import "./global.scss";

Engine.load();

void (async (): Promise<void> => {
  await awaitSetup();
  window.history.replaceState({ currentLanguage }, document.title);
  Engine.route();
})();
