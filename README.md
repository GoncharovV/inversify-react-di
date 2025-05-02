# inversify-react-di

![npm peer dependency version](https://img.shields.io/npm/dependency-version/inversify-react-di/peer/inversify)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/inversify-react-di/peer/react)

Set of hooks and decorators for better DX with [React](https://www.npmjs.com/package/react)+[InversifyJS](https://www.npmjs.com/package/inversify)

Great for use with [MobX](https://www.npmjs.com/package/mobx)

### A few more words

This package is similar to [inversify-react](https://www.npmjs.com/package/inversify-react),
but introduces an alternative way to describe and inject dependencies — more in line with how it's done in Angular and NestJS.

## Installation

```bash
npm install reflect-metadata inversify inversify-react-di
```

> Make sure to enable Experimental decorators and Emit Decorator Metadata options in your tsconfig.json

## Basic Usage

1. Describe Classes

- Mark classes with `@Model()` decorator to make them available for DI.  
- Then use `@injectModel(<class marked with model>)` to inject it

```ts
import { Model } from 'inversify-react-di';

@Model()
class QueryClient {
  public fetch(input: any) {
    return [{ id: 1, name: 'todo' }]
  }
}

@Model()
class TodoList {
  constructor(
    @injectModel(QueryClient)
    private readonly queryClient: QueryClient,
  ) {}

  public loadTodos() {
    this.queryClient.fetch({ page: 1 });
  }
}
```

2. Provide container to React

Wrap component tree with `ModelsProvider` and pass the `models` prop

```tsx
<ModelsProvider models={[QueryClient, TodoList]}>
    ...
</ModelsProvider>
```

3. Use Models

Now, inside React component you can access any model with `useModel` hook

```tsx
const Example: FC = () => {
  const todoListModel = useModel(TodoList);

  useEffect(() => {
    todoListModel.loadTodos()
  }, [])

  return (
    <div>...</div>
  )
};
```

### Standalone

All Inversify Containers are stored in `React.Context`. By default, containers form a hierarchy.


```tsx
<ModelsProvider models={[ModelA]}>
    <ModelsProvider models={[ModelB]}>
        useModel(ModelB) // Exists in current container, will be resolved ✅
        useModel(ModelA) // Exists only in PARENT container, but still will be resolved ✅
    </ModelsProvider>
</ModelsProvider>
```

Specify `standalone={true}` prop to exclude container from hierarchy

```tsx
<ModelsProvider models={[ModelA]}>
    <ModelsProvider models={[ModelB]} standalone>
        useModel(ModelB) // Exists in current container, will be resolved ✅
        useModel(ModelA) // Will not be resolved cause current container is not taking part in hierarchy 🚫
    </ModelsProvider>
</ModelsProvider>
```

## Provide abstract Models

```ts
@Model()
export abstract class Direction {
  public abstract getDirection(): string;
}

@Model()
export class LeftDirection extends Direction {
  public getDirection(): string {
    return 'left';
  }
}

@Model()
export class RightDirection extends Direction {
  public getDirection(): string {
    return 'right';
  }
}
```

Then

```tsx
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
];

const Display: FC = () => {
  const model = useModel(Direction);

  return <h2>{model.getDirection()}</h2>;
};

const Example: FC = () => {
  return (
    <>
      <ModelsProvider models={LEFT_PROVIDERS}>
        <Display /> {/* left */}
      </ModelsProvider>

      <ModelsProvider models={RIGHT_PROVIDERS}>
        <Display /> {/* right */}
      </ModelsProvider>
    <>
  );
}


```

## Model Configuration

`inversify-react-di` allows to provide `Scope` while describing model. [Read about scope in InversifyJS](https://inversify.io/docs/fundamentals/binding/#scope).

There are only two available right now:
- **singleton** – When the service is resolved, the SAME cached resolved value will be used.
- **transient** – When the service is resolved, a NEW resolved value will be used EACH TIME.

The default behavior for each Model is **SINGLETON**

### Transient example

If you want to switch model to `transient` scope, specify it in models config:

```ts
@Model({
  scope: 'transient',
})
export class Counter {
  public count = 0;

  public increment() {
    this.count++;
  }

  constructor() {
    // Example with MobX
    makeAutoObservable(this);

    this.increment = this.increment.bind(this);
  }
}
```

Then just use the model:

```tsx
const CounterComponent = observer(() => {
  const model = useModel(Counter);

  return <button onClick={model.increment}>{model.count}</button>;
});
```

Each `CounterComponent` will receive its own independent instance of `Counter`


## Lifecycle (Experimental)

> This API is experimental and may change in the future

**Pay attention**: unlike `Angular`, `React` does not have _strict_ lifecycle methods like `ngOnInit` or `ngOnDestroy`.
Instead, in `React` we used to think in terms of `mount` and `unmount`. The difference is that mounting and unmounting can happen multiple times for one "component instance".
(it also called twice in `<StrictMode>`)

`inversify-react-di` provides the interfaces: `OnMount, OnUnmount`

- For Models in singleton scope `onMount/onUnmount` will be called when `ModelsProvider` is mounted/unmounted. 
- For Models in transient scope `onMount/onUnmount` will be called when component which calls `useModel` is mounted/unmounted. 

> It is recommended to use lifecycle methods only for singleton providers, as it generally makes more sense

> If you somehow got model from Container without using `useModel` hook, then non of lifecycle methods **cannot be called**


### Lifecycle Example

Let's imagine you have some global state which depends on `LocalStorage`.  
And you also need to update state when storage updates

It can be implemented like this:
```ts
@Model()
export class GlobalCounter implements OnMount, OnUnmount {
  public count = 0;

  constructor() {
    makeAutoObservable(this);
    this.increment = this.increment.bind(this);

    this.readValueFromStorage();
  }

  private readValueFromStorage() {
    const stored = localStorage.getItem('key');

    if (stored) {
      // runInAction needs only to notify MobX
      runInAction(() => {
        this.count = JSON.parse(stored);
      });
    }
  }

  public onMount(): void {
    window.addEventListener('storage', this.readValueFromStorage);
  }

  public onUnmount(): void {
    window.removeEventListener('storage', this.readValueFromStorage);
  }
}
```

## Work with plain Inversify Containers

If you don't interested in providing Models in a way which was described, look at the original package [inversify-react](https://www.npmjs.com/package/inversify-react)

But `inversify-react-di` also provides hooks and components for working with Inversify Containers and injecting tokens

```ts
import { interfaces } from 'inversify';

function useContainer(): interfaces.Container;
function useContainer<T>(resolve: (container: interfaces.Container) => T): T;
function useInjection<T>(serviceId: interfaces.ServiceIdentifier<T>): T;

interface ContainerProviderProps extends PropsWithChildren {
    container: Container;
    standalone?: boolean;
}
const ContainerProvider: FC<ContainerProviderProps>;
```

### Example

```tsx
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
  const injectedFromContainer = useContainer((container) => container.get<string>(TOKEN));

  // ASSERT: injected === injectedFromContainer === container.get<string>(TOKEN)

  return (
    <h1>{injected}</h1>
  );
}
```

