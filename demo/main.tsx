import { FC, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { observer } from 'mobx-react-lite';

import { Provider } from '../dist';
import { ModelsProvider, useModel } from '../lib/react';
import { Direction, GlobalCounter, LeftDirection, RightDirection } from './models';


const Display: FC = () => {
  const model = useModel(Direction);

  return <h2>{model.getDirection()}</h2>;
};


const root = createRoot(document.getElementById('root')!);

// @ts-expect-error Debug hack
window.destroy = () => {
  root.unmount();
};

const LEFT_PROVIDERS: Provider[] = [
  {
    provide: Direction,
    useClass: LeftDirection,
  },
];

const RIGHT_PROVIDERS: Provider[] = [
  {
    provide: Direction,
    useClass: RightDirection,
  },
  GlobalCounter,
];

const CounterComponent = observer(() => {
  const model = useModel(GlobalCounter);

  return <button onClick={model.increment} type="button">{model.count}</button>;
});


root.render(
  <StrictMode>
    <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 1000, margin: '200px auto' }}>
      <ModelsProvider models={LEFT_PROVIDERS}>
        <Display />
      </ModelsProvider>

      <ModelsProvider models={RIGHT_PROVIDERS}>
        <Display />
        <CounterComponent />
        <CounterComponent />
      </ModelsProvider>
    </div>
  </StrictMode>,
);
