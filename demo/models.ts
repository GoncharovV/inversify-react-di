import { Model } from '../dist';


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
