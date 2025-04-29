import { FC, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { createModelsContainer, Provider } from '../../core';
import { InversifyContext } from '../context';
import { ProvidersLifecycleManager } from '../lifecycle';


export interface ModelsProviderProps extends PropsWithChildren {
  models: Provider[];
  standalone?: boolean;
}

export const ModelsProvider: FC<ModelsProviderProps> = (props) => {
  const { standalone = false, models, children } = props;

  const parentContainer = useContext(InversifyContext);

  const [container] = useState(function initializeModelsContainer() {
    const container = createModelsContainer(models);

    if (!standalone && parentContainer) {
      container.parent = parentContainer;
    }

    return container!;
  });

  const [lifecycleManager] = useState(() => new ProvidersLifecycleManager(container, models));

  useEffect(() => {
    lifecycleManager.onMount();

    return () => lifecycleManager.onUmount();
    // Deps must never change
  }, [lifecycleManager]);


  return (
    <InversifyContext value={container}>
      {children}
    </InversifyContext>
  );
};
