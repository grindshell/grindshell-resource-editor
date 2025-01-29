import { EnemyData } from "./enemy-data";
import { MapData } from "./map-data";

export class Project {
  projectName = "New Project";
  mapData: MapData;
  enemyData: EnemyData;

  constructor(args?: {
    projectName?: string,
    mapData?: MapData,
    enemyData?: EnemyData;
  }) {
    if (args?.projectName) {
      this.projectName = args.projectName;
    }

    this.mapData = args?.mapData ?? new MapData({
      name: "New Map"
    });
    this.enemyData = args?.enemyData ?? new EnemyData();
  }

  /**
   * A default project with no options.
   */
  static default() {
    const project = new Project();

    return project;
  }
}