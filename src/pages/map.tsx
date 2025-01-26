import { createSignal, onMount } from "solid-js";
import { drawMap, MapHandler } from "~/draw-map";

export function Map() {
  let canvasElement!: HTMLCanvasElement;
  let mapHandler!: MapHandler;
  const [currentTile, setCurrentTile] = createSignal({});

  onMount(() => {
    mapHandler = drawMap(canvasElement, { currentTile, setCurrentTile });
  });

  return (
    <div class="container flex flex-col h-full">
      <p>Test</p>
      <canvas ref={canvasElement} class="border border-white"></canvas>
    </div>
  );
}