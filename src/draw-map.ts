import {
  init,
  initPointer,
  GameLoop,
  Sprite,
  Scene,
  pointerPressed,
  onPointer,
  getPointer,
  GameObject,
} from "kontra";
import { Accessor, Setter, splitProps } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { ProjectData } from "./components/project-provider";
import { Position, Tile } from "./model/map-data";

export type DrawMapProps = {
  setZoomAmount: Setter<number>,
  setCameraOffset: Setter<Position>,

  currentTile: Accessor<Position | null>,
  setCurrentTile: Setter<Position | null>,

  projectData: ProjectData,
  setProjectData: SetStoreFunction<ProjectData>;
};

export function drawMap(canvas: HTMLCanvasElement, props: DrawMapProps) {
  const mapHandler = new MapHandler(canvas, props);
  // Ensure we render at least once
  mapHandler.render();

  return mapHandler;
}

type Pos = {
  x: number,
  y: number;
};

const TILE_SIZE = 10;

/**
 * A left click event.
 */
const LEFT_CLICK = 0;

/**
 * A middle click event.
 */
const MIDDLE_CLICK = 1;

/**
 * A right click event.
 */
const RIGHT_CLICK = 2;

const UNTAGGED_TILE_COLOR = "red";

const TAGGED_TILE_COLOR = "blue";

const SELECTED_TILE_COLOR = "green";

type TileColor = typeof UNTAGGED_TILE_COLOR | typeof TAGGED_TILE_COLOR | typeof SELECTED_TILE_COLOR;

export class MapHandler {
  props: DrawMapProps;
  canvas: HTMLCanvasElement;

  scene: Scene = Scene({
    id: "map-scene"
  });
  gameLoop: GameLoop;

  leftClickStart: Pos = { x: 0, y: 0 };
  lastLeftClickLocation: Pos | null = null;
  leftClickDown: boolean = false;

  currentLayer: number = 0;
  renderedTiles = new Map<string, Scene>();

  constructor(canvas: HTMLCanvasElement, props: DrawMapProps) {
    this.props = props;
    this.canvas = canvas;

    canvas.addEventListener("contextmenu", (ev) => ev.preventDefault());

    init(canvas);
    initPointer();

    this.scene = Scene({
      id: "map-scene",
      // TODO reenable once i figure out how to zoom correctly
      cullObjects: false
    });
    const middleIndicator = Sprite({
      color: "white",
      width: 0.5,
      height: 10,
      anchor: {
        x: 0.5,
        y: 0.5
      }
    });
    middleIndicator.addChild(Sprite({
      color: "white",
      width: 10,
      height: 0.5,
      anchor: {
        x: 0.5,
        y: 0.5
      }
    }));
    this.scene.add(middleIndicator);

    this.gameLoop = GameLoop({
      update: (dt) => {
        this.update(dt);
      },
      render: () => {
        this.render();
      }
    });

    onPointer("down", (ev, obj) => this.pointerDown(ev, obj));
    onPointer("up", (ev, obj) => this.pointerUp(ev, obj));

    canvas.addEventListener("mouseover", () => this.gameLoop.start());
    canvas.addEventListener("mouseleave", () => this.gameLoop.stop());
    canvas.addEventListener("wheel", (ev) => {
      ev.preventDefault();

      const amt = Math.min(
        Math.max(
          Math.round((this.scene.camera.scaleY + (ev.deltaY * -0.001)) * 10) / 10,
          0.5
        ),
        4
      );
      this.scene.camera.setScale(amt, amt);
      this.props.setZoomAmount(amt);
    });
  }

  update(dt: number) {
    if (this.leftClickDown) {
      this.handleDrag();
    }
  }

  handleDrag() {
    // Compare current cursor position to the last record position
    const pointerData = getPointer();
    if (this.lastLeftClickLocation) {
      const { x: lastX, y: lastY } = this.lastLeftClickLocation;

      this.scene.camera.x += (lastX - pointerData.x) / this.scene.camera.scaleX;
      this.scene.camera.y += (lastY - pointerData.y) / this.scene.camera.scaleY;

      this.props.setCameraOffset(new Position(
        Math.floor(this.scene.camera.x),
        Math.floor(this.scene.camera.y),
        this.currentLayer
      ));

      this.lastLeftClickLocation.x = pointerData.x;
      this.lastLeftClickLocation.y = pointerData.y;
    } else {
      // Drag started
      this.lastLeftClickLocation = {
        x: pointerData.x,
        y: pointerData.y
      };
    }
  }

  /**
   * Take a canvas `(x, y)` point and convert it to a scene tile position.
   */
  canvasToTilePosition(x: number, y: number) {
    const midpoint = this.cameraMidpoint();

    const halfWidth = this.scene.camera.width * 0.5;
    const halfHeight = this.scene.camera.height * 0.5;

    const scaledX = halfWidth - (((halfWidth - x) / this.scene.camera.scaleX) + midpoint.x);
    const scaledY = halfHeight - (((halfHeight - y) / this.scene.camera.scaleY) + midpoint.y);

    const tileX = Math.floor(scaledX / TILE_SIZE);
    const tileY = Math.floor(scaledY / TILE_SIZE);

    return new Position(
      tileX,
      tileY,
      this.currentLayer
    );
  }

  handleLeftClick(x: number, y: number) {
    const position: Position = this.canvasToTilePosition(x, y);
    const positionKey = position.asKey();

    if (this.props.projectData.project.mapData?.tiles.has(positionKey)) {
      const tile = this.renderedTiles.get(positionKey);
      if (!tile) {
        console.error(`${positionKey} not currently rendered, rendering now`);
        this.addTile(position);

        return;
      }

      this.toggleSelectedTile(position);

      return;
    }

    this.props.setProjectData("project", "mapData", "tiles", (v) => v.set(positionKey, new Tile({
      name: "New Tile",
      description: "",
      position
    })));
    this.addTile(position);
  }

  addTile(position: Position) {
    const scene = Scene({
      id: position.asKey(),
      cullObjects: false
    });
    const sprite = Sprite({
      x: (position.x * TILE_SIZE) + (TILE_SIZE / 2),
      y: (position.y * TILE_SIZE) + (TILE_SIZE / 2),
      width: TILE_SIZE,
      height: TILE_SIZE,
      anchor: {
        x: 0.5,
        y: 0.5
      },
      color: "white"
    });
    sprite.addChild(Sprite({
      width: TILE_SIZE - 2,
      height: TILE_SIZE - 2,
      anchor: {
        x: 0.5,
        y: 0.5
      },
      color: UNTAGGED_TILE_COLOR
    }));
    scene.add(sprite);

    this.scene.add(scene);
    this.renderedTiles.set(position.asKey(), scene);
    this.toggleSelectedTile(position);
  }

  toggleSelectedTile(position: Position, allowRecursion: boolean = true) {
    const positionKey = position.asKey();

    const tileSprite = this.renderedTiles.get(positionKey);
    if (!tileSprite) {
      console.error(`${positionKey} does not exist, could not toggle`);
      return;
    }

    const child: Sprite | undefined = (tileSprite.objects[0] as Sprite).children[0] as Sprite;
    if (!child) {
      console.error(`${positionKey} did not have a child sprite, this should not be possible`);
      return;
    }

    const currentTile = this.props.currentTile();
    switch (child.color) {
      case (UNTAGGED_TILE_COLOR):
      case (TAGGED_TILE_COLOR):
        if (currentTile) {
          if (!allowRecursion) {
            console.error(`infinite recursion detected while toggling ${positionKey}`);
            return;
          }
          this.toggleSelectedTile(currentTile, false);
        }

        child.color = SELECTED_TILE_COLOR;
        this.props.setCurrentTile(position);

        break;

      case (SELECTED_TILE_COLOR):
        const tileData = this.props.projectData.project.mapData.tiles.get(positionKey);
        if (!tileData) {
          console.error(`tile data for ${positionKey} did not exist, could not toggle`);
          return;
        }

        if (tileData.tags.length > 0) {
          child.color = TAGGED_TILE_COLOR;
        } else {
          child.color = UNTAGGED_TILE_COLOR;
        }

        this.props.setCurrentTile(null);
        break;

      default:
        console.error(`unhandled color ${child.color}`);
        return;

    }
  }

  /**
   * Get the midpoint of the scene.
   */
  cameraMidpoint(): Pos {
    return {
      x: (this.scene.camera.width * 0.5) - this.scene.camera.x,
      y: (this.scene.camera.height * 0.5) - this.scene.camera.y
    };
  }

  pointerDown(ev: MouseEvent | TouchEvent, obj?: object) {
    if (ev instanceof MouseEvent) {
      const pointerData = getPointer();

      switch (ev.button) {
        case (LEFT_CLICK):
          this.leftClickStart.x = pointerData.x;
          this.leftClickStart.y = pointerData.y;
          this.leftClickDown = true;
          break;

        case (RIGHT_CLICK):
          break;

        case (MIDDLE_CLICK):
          break;

        default:
          console.error("unhandled mouse button pressed");
          break;

      }
    } else {
      // TODO touch not handled
    }
  }

  pointerUp(ev: MouseEvent | TouchEvent, obj?: object) {
    if (ev instanceof MouseEvent) {
      const pointerData = getPointer();

      switch (ev.button) {
        case (LEFT_CLICK):
          this.leftClickDown = false;
          this.lastLeftClickLocation = null;
          const diff = Math.abs(this.leftClickStart.x - pointerData.x) +
            Math.abs(this.leftClickStart.y - pointerData.y);
          // Account for mouse wiggle
          if (diff < 5) {
            this.handleLeftClick(pointerData.x, pointerData.y);
          }
          break;

        case (RIGHT_CLICK):
          const currentTile = this.props.currentTile();
          if (currentTile) {
            this.toggleSelectedTile(currentTile);
          }
          break;

        case (MIDDLE_CLICK):
          break;

        default:
          console.error("unhandled mouse button released");
          break;

      }
    } else {
      // TODO touch not handled
    }
  }

  onResize() {
    this.scene.camera.x = (-this.canvas.width / 2) + (this.scene.camera.width / 2);
    this.scene.camera.y = (-this.canvas.height / 2) + (this.scene.camera.height / 2);

    this.render();
  }

  deleteTile(position: Position) {
    const key = position.asKey();
    const tile = this.renderedTiles.get(key);
    if (tile) {
      this.scene.remove(tile);
      tile.destroy();
      this.renderedTiles.delete(key);

      // Force a complete redraw
      this.gameLoop.start();
      this.gameLoop.stop();
    }
  }

  render() {
    this.scene.render();
  }
}
