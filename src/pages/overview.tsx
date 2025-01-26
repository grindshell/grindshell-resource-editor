import { useProjectContext } from "~/components/project-provider";

export function Overview() {
  let context = useProjectContext();

  return (
    <div class="container">
      <h1 class="text-center">Current project: {context.projectData.project.projectName}</h1>
    </div>
  );
}