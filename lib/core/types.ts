import { interfaces } from 'inversify';


export type Newable<TInstance = unknown> = new (...args: any[]) => TInstance;
export type AbstractNewable<TInstance = unknown> = abstract new (...args: any[]) => TInstance;

export interface ProviderConfig {
  provide: interfaces.ServiceIdentifier | AbstractNewable;
  useClass?: Newable;
  useExisting?: any;
}

export type Provider = Newable | ProviderConfig;

export type Scope = 'singleton' | 'transient';

export interface ModelOptions {
  scope?: Scope;
}
