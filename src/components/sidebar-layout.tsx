import { Accessor, createSignal, For, ParentProps, Setter, splitProps } from "solid-js";
import {
  SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarInset, SidebarFooter,
  SidebarGroupLabel
} from "./solid-ui/sidebar";
import { IconHome, IconSearch, IconSettings, IconBrandGithub, IconCommand, IconFullscreen } from "./solid-ui/icons";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./solid-ui/button";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from "./solid-ui/menubar";
import { useProjectContext } from "./project-provider";

const items = [
  {
    title: "Overview",
    url: "/",
    icon: IconHome
  },
  {
    title: "Map",
    url: "/map",
    icon: IconFullscreen
  },
  {
    title: "Enemy",
    url: "/enemy",
    icon: IconCommand
  },
  {
    title: "Search",
    url: "/search",
    icon: IconSearch
  },
  {
    title: "Settings",
    url: "/settings",
    icon: IconSettings
  }
];

type AppSidebarProps = {
  selectedItem: Accessor<string>,
  setSelectedItem: Setter<string>;
};

function AppSidebar(props: AppSidebarProps) {
  const [{ selectedItem }, { setSelectedItem }] = splitProps(props, ["selectedItem"], ["setSelectedItem"]);
  const context = useProjectContext();

  return (
    <Sidebar class="flex">
      <SidebarContent class="grow">
        <SidebarGroup>
          <SidebarGroupLabel>{context.projectData.project.projectName}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <For each={items}>
                {(item) => (
                  <SidebarMenuItem onClick={() => setSelectedItem(item.title)} class={selectedItem() === item.title ? "border rounded" : ""}>
                    <SidebarMenuButton as="a" href={item.url}>
                      <item.icon />
                      <span class={selectedItem() === item.title ? "underline font-bold" : ""}>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </For>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Footer />
      </SidebarFooter>
    </Sidebar>
  );
}

type HeaderProps = {
  selectedItem: Accessor<string>;
};

function Header(props: HeaderProps) {
  return (
    <header class="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />

      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New
              <MenubarShortcut>Ctrl+N</MenubarShortcut>
            </MenubarItem>

            <MenubarItem>
              Open
              <MenubarShortcut>Ctrl+O</MenubarShortcut>
            </MenubarItem>

            <MenubarSeparator />

            <MenubarItem>
              Save
              <MenubarShortcut>Ctrl+S</MenubarShortcut>
            </MenubarItem>

            <MenubarSeparator />

            <MenubarItem>
              Export
              <MenubarShortcut>Ctrl+E</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent></MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div class="ml-auto">
        <h2 class="justify-end">{props.selectedItem()}</h2>
      </div>
    </header>
  );
}

function RepoLinkButton(props: { buttonClass: string; }) {
  const orgLink = "https://github.com/grindshell";

  return (
    <Button as="a" variant="ghost" size="sm" class={props.buttonClass}
      href={orgLink} target="_blank" title="Repository"
    >
      <IconBrandGithub />
    </Button>
  );
}

function Footer() {
  const buttonClass = "w-9 px-0";

  return (
    <div>
      <div class="flex flex-row justify-evenly">
        <ThemeToggle buttonClass={buttonClass} />
        <RepoLinkButton buttonClass={buttonClass} />
      </div>
      <div>
        <p class="text-center text-xs">Copyright youwin 2025</p>
      </div>
    </div>
  );
}

export function Layout(props: ParentProps) {
  const [selectedItem, setSelectedItem] = createSignal(items[0].title);

  return (
    <SidebarProvider>
      <AppSidebar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      <SidebarInset>
        <Header selectedItem={selectedItem} />
        {props.children}
      </SidebarInset>
    </SidebarProvider>
  );
}