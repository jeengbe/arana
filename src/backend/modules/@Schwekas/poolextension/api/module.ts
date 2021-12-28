import { Type } from "@core/utils";

export class Module extends Type<IModule> {
  history(): HistoryEntry[] {

  }
}

export class HistoryEntry {
  constructor(
    /**
     * The date of the history entry
     */
    public readonly date: Date,
    /**
     * The version of the module
     */
    public readonly version: string,
    /**
     * The description of the history entry
     */
    public readonly description: string
  ) { }
}
