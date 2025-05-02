import { makeAutoObservable, runInAction } from 'mobx';

import { Model, OnMount, OnUnmount } from '../dist';


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


@Model()
export class GlobalCounter implements OnMount, OnUnmount {

  public count = 0;

  public increment() {
    this.count++;
  }

  constructor() {
    makeAutoObservable(this);
    this.increment = this.increment.bind(this);

    this.readValueFromStorage();
  }

  private readValueFromStorage() {
    const stored = localStorage.getItem('key');

    if (stored) {
      // runInAction need only to notify MobX
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
