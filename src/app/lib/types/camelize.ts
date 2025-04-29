/**
 * Recursively converts snake_case keys in a type into camelCase keys.
 * Usage: Camelize<Tables<'pool_costs'>> → { saltBags: number; ... }
 */
export type Camelize<T> =
  T extends Array<infer U> ? Array<Camelize<U>> :
  T extends object        ? { [K in keyof T as Camel<K & string>]: Camelize<T[K]> } :
  T;

type Camel<S extends string> =
  S extends `${infer P}_${infer R}` ? `${P}${Capitalize<Camel<R>>}` : S;