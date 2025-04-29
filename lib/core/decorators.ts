import { inject, injectable } from 'inversify';

import { getModelData, setModelMetadata } from './metadata';
import { AbstractNewable, ModelOptions } from './types';


/**
 * ClassDecorator for Dependency Injection
 * 
 * Wrap class with `@Model()` to make it injectable
 *
 * @example
 * ```ts
 * \@Model()
 * export class Weapon {
 *   ...
 * }
 * ```
 */
export function Model(options?: ModelOptions): ClassDecorator {
  return (target: any) => {
    const token = Symbol.for(target.name);

    setModelMetadata(target, { token, options });

    return injectable()(target);
  };
}

/**
 * ParameterDecorator for injecting classes marked with `@Model()`
 * 
 * `injectModel` is just wrapper around `inject` from `'inversify'`,  
 * so it has similar behavior
 * 
 * @example
 * ```ts
 * class Player {
 *   constructor(
 *     \@injectModel(Weapon) 
 *     private readonly weapon: Weapon
 *   ) {}
 * }
 * ```
 */
export function injectModel<T = unknown>(model: AbstractNewable<T>): ParameterDecorator {
  const { token } = getModelData(model);

  return inject(token);
}
