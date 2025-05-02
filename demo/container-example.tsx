/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useState } from 'react';
import { Container } from 'inversify';
import { ContainerProvider, useContainer, useInjection } from 'inversify-react-di';


const TOKEN = Symbol.for('example');


export const ContainerExample: FC = () => {
  const [container] = useState(() => {
    const container = new Container();

    container.bind(TOKEN).toConstantValue('SOME-TOKEN');
    // any other logic

    return container;
  });

  return (
    <ContainerProvider container={container}>
      <UsageExampleComponent />
    </ContainerProvider>
  );
};

function UsageExampleComponent() {
  const injected = useInjection<string>(TOKEN);
  // or
  const container = useContainer();
  // or
  const injected3 = useContainer((container) => container.get<string>(TOKEN));

  // ASSERT: injected === injected3 === container.get<string>(TOKEN)

  return (
    <h1>{injected}</h1>
  );
}
