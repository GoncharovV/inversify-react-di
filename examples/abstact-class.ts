import 'reflect-metadata';

import { createModelsContainer, getModelFromContainer, injectModel, Model } from '../dist';


@Model()
abstract class Weapon {

  public abstract shoot(): void;

}


@Model()
class AK47 extends Weapon {

  public shoot() {
    console.log('Shoot from AK-47');
  }

}

@Model()
class Player {

  constructor(
    @injectModel(Weapon)
    private readonly weapon: Weapon,
  ) {}

  public fire() {
    this.weapon.shoot();
  }

}


const container = createModelsContainer([
  {
    provide: Weapon,
    useClass: AK47,
  },
  Player,
]);

const player = getModelFromContainer(container, Player);

player.fire();
// Shoot from AK-47
