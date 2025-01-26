import { EnemyData } from "./enemy-data";
import { MapData } from "./map-data";

export class Project {
  projectName = "New Project";
  mapData: MapData | null = null;
  enemyData: EnemyData | null = null;

  constructor() {

  }

  /**
   * A default project with no options.
   */
  static default() {
    return new Project();
  }
}