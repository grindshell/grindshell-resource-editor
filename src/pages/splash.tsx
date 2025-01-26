import { Accessor } from "solid-js";

export function Splash(props: { loadingText: Accessor<string>; }) {
  return (
    <div class="flex h-screen justify-center items-center">
      <p class="m-auto text-center">{props.loadingText()}</p>
    </div>
  );
}