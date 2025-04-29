# inversify-react-di

Set of hooks and decorators for better DX with [React](https://www.npmjs.com/package/react)+[InversifyJS](https://www.npmjs.com/package/inversify)

Great for use with [MobX](https://www.npmjs.com/package/mobx)

## Installation

```bash
npm install reflect-metadata inversify inversify-react-di
```

## Basic Usage

1. Describe Classes

Mark classes with `@Model()` decorator to make them available for DI.  
Then use `@injectModel(<marked with model>)` to inject it

```ts
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

Wrap components tree with `ModelsProvider` and pass `models`

```tsx
<ModelsProvider models={[QueryClient, TodoList]}>
    ...
</ModelsProvider>
```

3. Use Models

Now inside React component you can access any model with `useModel` hook

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