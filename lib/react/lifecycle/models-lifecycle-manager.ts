import { Container } from 'inversify';

import {
  AbstractNewable,
  getModelData,
  getModelFromContainer,
  isModel,
  Provider,
} from '../../core';
import { isMountable, isUnmountable, OnMount, OnUnmount } from './lifecycle';


export class ProvidersLifecycleManager {

  private readonly mountableModels = new Set<AbstractNewable<OnMount>>();

  private readonly unmountableModel = new Set<AbstractNewable<OnUnmount>>();

  constructor(
    private readonly container: Container,
    providers: Provider[] = [],
  ) {
    this.registerProviders(providers);
  }

  public registerProviders(providers: Provider[]) {
    for (const modelOrConfig of providers) {
      const model = isModel(modelOrConfig)
        ? modelOrConfig
        : isModel(modelOrConfig.provide)
          ? modelOrConfig.provide
          : null;

      if (model) {
        const { options } = getModelData(model);

        if (options.scope !== 'singleton') return;

        if (isMountable(model)) {
          this.mountableModels.add(model);
        }

        if (isUnmountable(model)) {
          this.unmountableModel.add(model);
        }
      }
    }
  }

  public onMount() {
    this.mountableModels.forEach((newable) => {
      const instance = getModelFromContainer(this.container, newable);

      instance?.onMount();
    });
  }

  public onUmount() {
    this.unmountableModel.forEach((newable) => {
      const instance = getModelFromContainer(this.container, newable);

      instance?.onUnmount();
    });
  }

}
