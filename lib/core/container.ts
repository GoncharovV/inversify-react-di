import { Container, interfaces } from 'inversify';

import { getModelData } from './metadata';
import { AbstractNewable, Newable, Provider, ProviderConfig, Scope } from './types';
import { isModel, isProviderConfig } from './utils';


function bindClassInScope(bindResult: interfaces.BindingToSyntax<unknown>, useClass: Newable, scope: Scope) {
  if (scope === 'singleton') {
    return bindResult.to(useClass).inSingletonScope();
  }

  if (scope === 'transient') {
    return bindResult.to(useClass).inTransientScope();
  }
}

function bindModel(container: Container, model: AbstractNewable, to: Newable) {
  const { token, options } = getModelData(model);

  const bindResult = container.bind(token);

  bindClassInScope(bindResult, to, options.scope!);
}

function bindProviderConfig(container: Container, provider: ProviderConfig) {
  const { useClass, useExisting, provide } = provider;

  if (isModel(provide)) {
    if (useClass) {
      return bindModel(container, provide, useClass);
    }

    if (useExisting) {
      const { token } = getModelData(provide);

      return container.bind(token).toConstantValue(useExisting);
    }

    throw new Error('Invalid ProviderConfig. Provide at least `useClass` or `useExisting`');
  }


  if (useExisting) {
    return container.bind(provide).toConstantValue(useExisting);
  }

  if (useClass) {
    return container.bind(provide).to(useClass);
  }

  throw new Error('Invalid ProviderConfig. Provide at least `useClass` or `useExisting`');
}

function bindAnyProvider(container: Container, provider: Provider) {
  if (isModel(provider)) {
    return bindModel(container, provider, provider);
  }

  if (isProviderConfig(provider)) {
    return bindProviderConfig(container, provider);
  }

  throw new Error('Unexpected provider', { cause: JSON.stringify(provider) });
}

export function createModelsContainer(providers: Provider[]) {
  const container = new Container({ defaultScope: 'Singleton' });

  for (const provider of providers) {
    bindAnyProvider(container, provider);
  }

  return container;
}

export function getModelFromContainer<T>(container: Container, model: AbstractNewable<T>) {
  const { token } = getModelData(model);

  return container.get(token) as T;
}
