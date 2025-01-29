import { Tag } from "./tag";

export class MapData {
  name: string;
  tiles: Map<string, Tile>;
  tags: Tag[];

  constructor(args: {
    name: string,
    tiles?: Map<string, Tile>,
    tags?: Tag[];
  }) {
    this.name = args.name;
    this.tiles = args.tiles ?? new Map();
    this.tags = args.tags ?? [];
  }

  toJSON() {
    return JSON.stringify({
      name: this.name
    });
  }
}

/**
 * Represents a 3d point in space.
 */
export class Position {
  /**
   * The east-west component of the position.
   */
  x: number;
  /**
   * The north-south component of the position.
   */
  y: number;
  /**
   * The vertical up-down component of the position.
   */
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Custom toString implementation for a position.
   * @returns a string in `x,y,z` format
   */
  toString() {
    return `${this.x},${this.y},${this.z}`;
  }

  asKey() {
    return this.toString();
  }

  static zero() {
    return new Position(0, 0, 0);
  }
}

export class Tile {
  name: string;
  description: string;
  search: string[];
  position: Position;
  tags: Tag[];

  constructor(args: {
    name: string,
    description: string,
    search?: string[],
    position: Position,
    tags?: Tag[];
  }) {
    this.name = args.name;
    this.description = args.description;
    this.search = args.search ?? [];
    this.position = args.position;
    this.tags = args.tags ?? [];
  }

  toJSON() {
    return JSON.stringify({
      name: this.name,
      description: this.description,
      search: this.search,
      position: this.position.toString(),
      tags: this.tags.map((v) => v.toString())
    });
  }
}
