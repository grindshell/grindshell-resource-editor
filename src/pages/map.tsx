import { createEffect, createSignal, For, onMount } from "solid-js";
import { useProjectContext } from "~/components/project-provider";
import { Button } from "~/components/solid-ui/button";
import { Separator } from "~/components/solid-ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/solid-ui/table";
import { TextField, TextFieldInput, TextFieldLabel, TextFieldTextArea } from "~/components/solid-ui/text-field";
import { drawMap, MapHandler } from "~/draw-map";
import { Position, Tile } from "~/model/map-data";
import { Tag } from "~/model/tag";
import { IconDotsVertical } from "~/components/solid-ui/icons";
import { createStore } from "solid-js/store";

const NO_TILE_SELECTED_TEXT = "no tile selected";

export function Map() {
  const { projectData, setProjectData } = useProjectContext();

  let canvasElement!: HTMLCanvasElement;
  let mapHandler!: MapHandler;
  const [currentTile, setCurrentTile] = createSignal<Position | null>(null);
  const [currentTileText, setCurrentTileText] = createSignal(NO_TILE_SELECTED_TEXT);
  const [zoomAmount, setZoomAmount] = createSignal(0);
  const [cameraOffset, setCameraOffset] = createSignal(Position.zero());

  const [tileEditDisabled, setTileEditDisabled] = createSignal(true);
  const [tileName, setTileName] = createSignal<string>("");
  const [tileDescription, setTileDescription] = createSignal<string>("");
  const [tileTags, setTileTags] = createStore<Tag[]>([]);

  onMount(() => {
    mapHandler = drawMap(canvasElement, {
      setZoomAmount,
      setCameraOffset,

      currentTile, setCurrentTile,
      projectData, setProjectData
    });

    // const { width, height } = canvasElement.getBoundingClientRect();
    const canvasParent = canvasElement.parentElement;
    if (canvasParent) {
      const canvasResizeHandler = () => {
        let newSize = canvasParent.clientWidth < canvasParent.clientHeight ?
          canvasParent.clientWidth :
          canvasParent.clientHeight;

        canvasElement.width = newSize;
        canvasElement.height = newSize;

        mapHandler.onResize();
      };
      window.addEventListener("resize", canvasResizeHandler);
      canvasResizeHandler();
    }
  });

  const clearTileInputs = () => {
    setTileName("");
    setTileDescription("");
    setTileTags([]);
  };

  createEffect(() => {
    console.log(tileTags.at(0));
  });

  createEffect(() => {
    const tilePosition = currentTile();

    if (tilePosition) {
      const positionKey = tilePosition.asKey();
      setCurrentTileText(positionKey);

      const tile = projectData.project.mapData.tiles.get(positionKey);
      if (tile) {
        setTileEditDisabled(false);
        setTileName(tile.name);
        setTileDescription(tile.description);
        setTileTags(tile.tags);

        return;
      }
    }

    setTileEditDisabled(true);
    setCurrentTileText(NO_TILE_SELECTED_TEXT);
    clearTileInputs();
  });

  createEffect(() => {
    const key = currentTileText();
    if (key === NO_TILE_SELECTED_TEXT) {
      return;
    }

    setProjectData("project", "mapData", "tiles", (v) => {
      const tile = v.get(key);
      if (!tile) {
        console.error(`${currentTileText()} did not exist`);
        return v;
      }

      tile.name = tileName() ?? "";
      tile.description = tileDescription() ?? "";
      tile.tags = tileTags;

      return v;
    });
  });

  const onDeleteHandler = () => {
    const tilePosition = currentTile();
    if (tilePosition) {
      mapHandler.deleteTile(tilePosition);
      mapHandler.render();
      setProjectData("project", "mapData", "tiles", (v) => {
        v.delete(tilePosition.asKey());

        return v;
      });
    }
    setCurrentTile(null);
  };

  const addTagHandler = () => {
    setTileTags(tileTags.length, Tag.default());
  };

  return (
    <div class="p-4 flex flex-row h-full w-full">
      <div class="grid grid-cols-2 gap-4 grow">
        <div class="flex flex-col">
          <div class="grid grid-cols-2">
            <div>Camera position: {cameraOffset().asKey()}</div>
            <div>Zoom amount: {zoomAmount()}</div>
          </div>
          <div class="grow">
            <canvas
              ref={canvasElement}
              class="border border-white"
              style="image-rendering: pixelated;image-rendering: crisp-edges"
            />
          </div>

        </div>

        <div class="flex flex-col gap-2">
          <div class="flex flex-row">
            <div class="my-auto">Current tile: {currentTileText()}</div>
            <Button
              onClick={onDeleteHandler}
              class="ml-auto"
              disabled={tileEditDisabled()}
              variant="destructive"
            >Delete</Button>
          </div>

          <Separator />

          <TextField value={tileName()} onChange={setTileName} disabled={tileEditDisabled()}>
            <TextFieldLabel>Name</TextFieldLabel>
            <TextFieldInput placeholder="Tile name" />
          </TextField>
          <TextField value={tileDescription()} onChange={setTileDescription} disabled={tileEditDisabled()}>
            <TextFieldLabel>Description</TextFieldLabel>
            <TextFieldTextArea placeholder="Tile description" />
          </TextField>

          <Separator />

          <Button
            onClick={addTagHandler}
            disabled={tileEditDisabled()}
          >Add Tag</Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Extra</TableHead>
                <TableHead>Opts</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <For each={tileTags}>
                {(tag) => {
                  return (
                    <TableRow>
                      <TableCell>
                        <TextField value={tag.key}>
                          <TextFieldInput placeholder="Key" />
                        </TextField>
                      </TableCell>

                      <TableCell>
                        <TextField value={tag.value}>
                          <TextFieldInput placeholder="Value" />
                        </TextField>
                      </TableCell>

                      <TableCell>
                        <TextField value={tag.extra.join(":")}>
                          <TextFieldInput placeholder="Extra" />
                        </TextField>
                      </TableCell>

                      <TableCell>
                        <Button variant="ghost">
                          <IconDotsVertical />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }}
              </For>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}