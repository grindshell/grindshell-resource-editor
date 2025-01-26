import {
  init,
  initPointer,
  GameLoop,
  Sprite,
  Scene,
  pointerPressed,
  onPointer,
  getPointer,
} from "kontra";
import { Accessor, Setter, splitProps } from "solid-js";

export type DrawMapProps = {
  currentTile: Accessor<Tile>,
  setCurrentTile: Setter<Tile>;
};

export type Tile = {
  x?: number,
  y?: number;
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

export class MapHandler {
  scene: Scene = Scene({
    id: "map-scene"
  });
  gameLoop: GameLoop;

  leftClickStart: Pos = { x: 0, y: 0 };
  lastLeftClickLocation: Pos | null = null;
  leftClickDown: boolean = false;

  constructor(canvas: HTMLCanvasElement, props: DrawMapProps) {
    const [{ currentTile, setCurrentTile }] = splitProps(props, ["currentTile", "setCurrentTile"]);

    // Initialize to origin tile
    setCurrentTile({ x: 0, y: 0 });

    canvas.addEventListener("contextmenu", (ev) => ev.preventDefault());

    init(canvas);
    initPointer();

    this.scene = Scene({
      id: "map-scene",
      // TODO reenable once i figure out how to zoom correctly
      cullObjects: false
    });
    console.log(`${this.scene.camera.x},${this.scene.camera.y}`);
    this.scene.add(Sprite({
      x: 80,
      y: 80,
      width: 10,
      height: 10,
      anchor: {
        x: 0.5,
        y: 0.5
      },
      color: "red"
    }));

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

      const amt = Math.max(this.scene.camera.scaleY + (ev.deltaY * -0.001), 0.5);
      this.scene.camera.setScale(amt, amt);
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

  handleLeftClick(x: number, y: number) {
    const offset = this.cameraOffset();
    console.log(`offset: ${offset.x},${offset.y}`);

    const halfWidth = this.scene.camera.width * 0.5;
    const halfHeight = this.scene.camera.height * 0.5;

    const scaledX = halfWidth - (((halfWidth - x) / this.scene.camera.scaleX) + offset.x);
    const scaledY = halfHeight - (((halfHeight - y) / this.scene.camera.scaleY) + offset.y);

    this.addTile(scaledX, scaledY);
  }

  cameraOffset(): Pos {
    return {
      x: (this.scene.camera.width * 0.5) - this.scene.camera.x,
      y: (this.scene.camera.height * 0.5) - this.scene.camera.y
    };
  }

  pointerDown(ev: MouseEvent | TouchEvent, obj?: object) {
    if (ev instanceof MouseEvent) {
      const pointerData = getPointer();

      switch (ev.button) {
        case (LEFT_CLICK): {
          this.leftClickStart.x = pointerData.x;
          this.leftClickStart.y = pointerData.y;
          this.leftClickDown = true;
          break;
        }
        case (RIGHT_CLICK): {
          break;
        }
        case (MIDDLE_CLICK): {
          break;
        }
        default: {
          console.error("unhandled mouse button pressed");
          break;
        }
      }
    } else {
      // TODO touch not handled
    }
  }

  pointerUp(ev: MouseEvent | TouchEvent, obj?: object) {
    if (ev instanceof MouseEvent) {
      const pointerData = getPointer();

      switch (ev.button) {
        case (LEFT_CLICK): {
          this.leftClickDown = false;
          this.lastLeftClickLocation = null;
          const diff = Math.abs(this.leftClickStart.x - pointerData.x) +
            Math.abs(this.leftClickStart.y - pointerData.y);
          // Account for mouse wiggle
          if (diff < 5) {
            this.handleLeftClick(pointerData.x, pointerData.y);
          } else {
            console.log("blah");
          }
          break;
        }
        case (RIGHT_CLICK): {
          break;
        }
        case (MIDDLE_CLICK): {
          break;
        }
        default: {
          console.error("unhandled mouse button released");
          break;
        }
      }
    } else {
      // TODO touch not handled
    }
  }

  addTile(x: number, y: number) {
    this.scene.add(Sprite({
      x,
      y,
      width: 10,
      height: 10,
      anchor: {
        x: 0.5,
        y: 0.5
      },
      color: "red"
    }));
  }

  render() {
    this.scene.render();
  }
}
