import { Project, ProjectStatus } from "../models/project-model.js";
import { Component } from "./base-component.js";
import { AutoBindThis } from "../decorator/autobind.js";
import { DragTarget } from "../models/drag-drop-interfaces.js";
import { projectState } from "./../state/project-state.js";
import { ProjectItem } from "./project-item.js";

// ProjectList Class
export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[] = [];

  //priveate type: this inexplicitly add an private property to this class.
  //'active'|'finishjed' is a literal type and a union type
  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    //register to the global projectState with this function, which will get the projects from the global to the local and then render the dom accordingly
    this.configure();
    this.renderContent();
  }

  @AutoBindThis
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault(); //by defaul JS not allow "drop"to happen, which means "dropHandler" never be called
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable"); //this is to add css class
    }
  }

  @AutoBindThis
  dropHandler(event: DragEvent): void {
    //get is transfered through 'dataTransfer'
    const prjId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      prjId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @AutoBindThis
  dragLeaveHandler(_: DragEvent): void {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  configure(): void {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);

    projectState.addListener((projects: Project[]) => {
      const relavantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relavantProjects;
      this.renderProjects();
    });
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const prjItem of this.assignedProjects) {
      const projectItem = new ProjectItem(
        `${this.type}-projects-list`,
        prjItem
      );
      projectItem.renderContent();
    }
  }
}
