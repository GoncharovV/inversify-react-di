import { Newable, Provider, ProviderConfig } from './types';


export function isProviderConfig(provider: Provider): provider is ProviderConfig {
  return typeof provider === 'object' && (provider as ProviderConfig).provide !== undefined;
}

export function isModel(maybeModel: unknown): maybeModel is Newable {
  return Boolean((maybeModel as Newable)['prototype']);
}
