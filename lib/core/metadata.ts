import { ModelOptions } from './types';


const INJECTION_MODEL_TOKEN = '@INJECTION_MODEL';

export interface ModelMetadata {
  token: symbol;
  options?: ModelOptions;
}

export function setModelMetadata(target: any, data: ModelMetadata) {
  Reflect.defineMetadata(INJECTION_MODEL_TOKEN, data, target);
}

export function getModelMetadata(target: any): ModelMetadata | undefined {
  return Reflect.getMetadata(INJECTION_MODEL_TOKEN, target);
}

const defaultModelOptions: ModelOptions = {
  scope: 'singleton',
};

export function getModelData(dependency: any): Required<ModelMetadata> {
  const data = getModelMetadata(dependency);

  if (!data) {
    throw new Error(
      `Not found injection metadata for "${dependency.name}".\n` +
      'Make sure class is marked as `@Model()`',
    );
  }

  return {
    token: data.token,
    options: {
      ...defaultModelOptions,
      ...data?.options,
    },
  };
}
