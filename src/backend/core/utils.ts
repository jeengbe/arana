export abstract class Type<T> {
  constructor(
    protected readonly data: T
  ) { }

  toJSON(): T {
    return this.data;
  }
}

export interface Paginateable {

}

export class Pagination<T extends Paginateable> {
  constructor(
    protected readonly data: T[]
  ) { }

  // TODO: Note: We should not load all of `data` into memory at once as we only display `limit` anyway
}
