import { AbstractNewable } from '../../core';


export interface OnMount {
  onMount(): void;
}

export interface OnUnmount {
  onUnmount(): void;
}


export function isMountable(model: AbstractNewable): model is AbstractNewable<OnMount> {
  return Boolean(model.prototype['onMount']);
}

export function isUnmountable(model: AbstractNewable): model is AbstractNewable<OnUnmount> {
  return Boolean(model.prototype['onUnmount']);
}
