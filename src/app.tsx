// import { createSignal } from "solid-js";
// import logo from "./assets/logo.svg";
// import { invoke } from "@tauri-apps/api/core";
// import "./App.css";

// function App() {
//   const [greetMsg, setGreetMsg] = createSignal("");
//   const [name, setName] = createSignal("");

//   async function greet() {
//     // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
//     setGreetMsg(await invoke("greet", { name: name() }));
//   }

//   return (
//     <main class="container">
//       <h1>Welcome to Tauri + Solid</h1>

//       <div class="row">
//         <a href="https://vitejs.dev" target="_blank">
//           <img src="/vite.svg" class="logo vite" alt="Vite logo" />
//         </a>
//         <a href="https://tauri.app" target="_blank">
//           <img src="/tauri.svg" class="logo tauri" alt="Tauri logo" />
//         </a>
//         <a href="https://solidjs.com" target="_blank">
//           <img src={logo} class="logo solid" alt="Solid logo" />
//         </a>
//       </div>
//       <p>Click on the Tauri, Vite, and Solid logos to learn more.</p>

//       <form
//         class="row"
//         onSubmit={(e) => {
//           e.preventDefault();
//           greet();
//         }}
//       >
//         <input
//           id="greet-input"
//           onChange={(e) => setName(e.currentTarget.value)}
//           placeholder="Enter a name..."
//         />
//         <button type="submit">Greet</button>
//       </form>
//       <p>{greetMsg()}</p>
//     </main>
//   );
// }

// export default App;

import { createSignal, For, onMount, ParentProps, Show, Suspense } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/core";
import "./app.css";

import { A, HashRouter, Route, Router } from "@solidjs/router";
import { ColorModeProvider, ColorModeScript, createLocalStorageManager } from "@kobalte/core";
import { Flex } from "./components/solid-ui/flex";
import { Layout } from "./components/sidebar-layout";
import { Overview } from "./pages/overview";
import { Map } from "./pages/map";
import { Enemy } from "./pages/enemy";
import { Settings } from "./pages/settings";
import { Search } from "./pages/search";
import { ProjectProvider } from "./components/project-provider";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import { Splash } from "./pages/splash";

function Home() {
  return (
    <Flex class="w-full p-6">
      <p>Hello, world!</p>
    </Flex>
  );
}

function TestPage() {
  return (
    <Flex class="w-full p-6">
      <p>Test page</p>
    </Flex>
  );
}

function App() {
  const uiThemeManager = createLocalStorageManager("ui-theme");

  const [initialLoadComplete, setInitialLoadComplete] = createSignal(false);
  const [loadingText, setLoadingText] = createSignal("Starting initial load.");

  return (
    <>
      <ColorModeScript storageType={uiThemeManager.type} />
      <ColorModeProvider storageManager={uiThemeManager}>
        <ProjectProvider setInitialLoadComplete={setInitialLoadComplete} setLoadingText={setLoadingText}>
          <Show when={initialLoadComplete()} fallback={<Splash loadingText={loadingText} />}>
            <Layout>
              <HashRouter>
                <Route path="/" component={Overview} />
                <Route path="/map" component={Map} />
                <Route path="/enemy" component={Enemy} />
                <Route path="/search" component={Search} />
                <Route path="/settings" component={Settings} />
              </HashRouter>
            </Layout>
          </Show>
        </ProjectProvider>
      </ColorModeProvider>
    </>
  );
}

export default App;

