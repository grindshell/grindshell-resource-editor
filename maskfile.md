# Grindshell Resource Editor

## run

> Run the app. By default, uses tauri to run

```sh
mask run desktop
```

### desktop

> Run via tauri

```sh
pnpm tauri dev
```

### web

> Run via vite dev server

```sh
pnpm dev
```

## solidui

> Interact with the solidui-cli

### add (item)

> Add a single component

```powershell
param (
    $item = $env:item
)

pnpm solidui-cli add $item
```
