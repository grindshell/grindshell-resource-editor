import { useColorMode } from "@kobalte/core";

import { IconLaptop, IconMoon, IconSun } from "./solid-ui/icons";
import { Button } from "./solid-ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./solid-ui/dropdown-menu";

export function ThemeToggle(props: { buttonClass: string; }) {
  const { setColorMode } = useColorMode();
  const iconClass = "mr-2 size-4";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        as={Button<"button">} variant="ghost" size="sm" title="Theme" class={props.buttonClass}>
        <IconSun class="size-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <IconMoon class="absolute size-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => setColorMode("light")}>
          <IconSun class={iconClass} />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setColorMode("dark")}>
          <IconMoon class={iconClass} />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setColorMode("system")}>
          <IconLaptop class={iconClass} />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
