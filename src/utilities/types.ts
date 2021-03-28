/**
 * Returns all keys of type T that return type R.
 */
export type KeyOfType<T, R> = { [k in keyof T]: T[k] extends R ? k : never }[keyof T];


 /**
  * Filters out all properties in T that do not return type R.
  */
export type Filter<T, R> = { [k in KeyOfType<Required<T>, R>]: R };