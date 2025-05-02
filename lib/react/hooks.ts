import { useContext, useEffect, useRef } from 'react';
import { interfaces } from 'inversify';

import { OnUnmount } from '../../dist';
import { AbstractNewable, getModelData } from '../core';
import { InversifyContext } from './context';
import { isMountable, isUnmountable, OnMount } from './lifecycle';


// TODO: write better JSDOC

export function usePersistentValue<T>(resolve: () => T): T {
  const ref = useRef<{ v: T; }>(null);

  if (!ref.current) {
    ref.current = { v: resolve() };
  }

  return ref.current.v;
}

// TODO: JSDOC

export function useContainer(): interfaces.Container;
export function useContainer<T>(resolve: (container: interfaces.Container) => T): T;
export function useContainer<T>(resolve?: (container: interfaces.Container) => T): interfaces.Container | T {
  const container = useContext(InversifyContext);

  if (!container) {
    throw new Error(
      'Cannot find Inversify `Container` in React.Context.\n' +
      'Make sure to wrap your component tree with `ModelsProvider` or `ContainerProvider`',
    );
  }

  return resolve
    ? usePersistentValue(() => resolve(container))
    : container;
}


export function useInjection<T>(serviceId: interfaces.ServiceIdentifier<T>): T {
  return useContainer((container) => container.get<T>(serviceId));
}

export function useModel<TModel>(model: AbstractNewable<TModel>): TModel {
  const { token, options } = usePersistentValue(() => getModelData(model));

  const injected = useInjection<TModel>(token);

  useEffect(() => {
    if (options.scope !== 'transient') return;

    if (isMountable(model)) {
      (injected as OnMount).onMount?.();
    }

    return () => {
      if (isUnmountable(model)) {
        (injected as OnUnmount).onUnmount?.();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return injected;
}
