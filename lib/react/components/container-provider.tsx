import { FC, PropsWithChildren, useContext, useState } from 'react';
import { Container } from 'inversify';

import { InversifyContext } from '../context';


const __DEV__ = process.env.NODE_ENV === 'development';

export interface ContainerProviderProps extends PropsWithChildren {
  container: Container;
  standalone?: boolean;
}

export const ContainerProvider: FC<ContainerProviderProps> = (props) => {
  const { container: containerProp, standalone = false, children } = props;

  const parentContainer = useContext(InversifyContext);

  const [container] = useState(function initializeContainer() {
    if (__DEV__) {
      if (containerProp.parent && parentContainer && containerProp.parent !== parentContainer) {
        throw new Error(
          // TODO: better error
          'Found parent container in parent React.Context, but passed container already has parent',
        );
      }
    }

    if (!standalone && parentContainer) {
      container.parent = parentContainer;
    }

    return containerProp;
  });

  if (__DEV__ && containerProp !== container) {
    // TODO: better error
    throw new Error(
      'Changing `container` prop (swapping container in runtime) is not supported.\n' +
      'make sure to always pass same containers',
    );
  }

  return (
    <InversifyContext value={container}>
      {children}
    </InversifyContext>
  );
};
