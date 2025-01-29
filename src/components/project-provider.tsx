import { Accessor, createContext, createResource, createSignal, onMount, ParentProps, Setter, useContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import { Project } from "~/model/project";
import { exists, readTextFile, create, BaseDirectory } from "@tauri-apps/plugin-fs";

const PROJECT_FILE_NAME = "project.json";
const LOCAL_STORAGE_KEY = "project-data";

export type ProjectData = {
  project: Project,
  undoRedo: string[];
};

const ProjectContext = createContext<{
  projectData: ProjectData,
  setProjectData: SetStoreFunction<ProjectData>,
}>();

type ProjectProviderProps = ParentProps & {
  setInitialLoadComplete: Setter<boolean>,
  setLoadingText: Setter<string>;
};

export function ProjectProvider(props: ProjectProviderProps) {
  console.info("entering project provider");

  const [projectData, setProjectData] = createStore<ProjectData>({
    project: Project.default(),
    undoRedo: []
  });

  onMount(async () => {
    console.info("starting initial load");

    // Fancy loading text
    const loadingDot = ".";
    let dotCount = 0;
    const intervalID = setInterval(() => {
      dotCount += 1;
      if (dotCount > 3) {
        dotCount = 1;
      }

      props.setLoadingText(`Loading initial data${loadingDot.repeat(dotCount)}`);
    }, 250);

    let fileContents: string | null = null;
    // @ts-ignore this will be injected for tauri builds
    if (window.__TAURI__) {
      console.info(`reading ${PROJECT_FILE_NAME} via tauri`);

      if (await exists(PROJECT_FILE_NAME, { baseDir: BaseDirectory.AppData })) {
        fileContents = await readTextFile(PROJECT_FILE_NAME, { baseDir: BaseDirectory.AppData });
      }
    } else {
      console.info(`reading ${PROJECT_FILE_NAME} via localstorage`);

      fileContents = localStorage.getItem(LOCAL_STORAGE_KEY);
    }

    let project: Project | null = null;
    if (fileContents !== null) {
      try {
        const parsedProject = JSON.parse(fileContents);
        if (Object.hasOwn(parsedProject, "projectName")) {
          project = parsedProject;
        } else {
          console.error("project data is corrupted, using default project");
        }
      } catch (e) {
        console.error(`error while parsing project json: ${e}`);
      }
    } else {
      console.info("no existing project found, using default project");
    }

    if (project) {
      setProjectData("project", project);
    }
    props.setInitialLoadComplete(true);
    clearInterval(intervalID);

    console.info("initial load complete");
  });

  const initialContext = {
    projectData,
    setProjectData,
  };

  return (
    <ProjectContext.Provider value={initialContext}>
      {props.children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext: cannot find ProjectContext");
  }

  return context;
}
