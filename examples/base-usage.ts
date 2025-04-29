import 'reflect-metadata';

import { createModelsContainer, getModelFromContainer, injectModel, Model } from '../dist';


@Model()
class QueryClient {

  public fetch(input: any) {
    console.log('fetched', input);
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


const container = createModelsContainer([
  QueryClient,
  TodoList,
]);

const todoList = getModelFromContainer(container, TodoList);

todoList.loadTodos();
