import { Draggable } from "../models/drag-drop-interfaces"; // js way of importing files
import { Project } from "../models/project-model";
import { Component } from "./base-component";
import { AutoBindThis } from "../decorator/autobind";

//ProjectItem Class: it extends Component class and implements Draggable interface
export class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;
  // a getter method, which conventionally follows the declaration of property, and is defined just as other method. It can be used as if it's a peropery, check renderContent() for more
  get persons() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} persons`;
    }
  }
  constructor(hostID: string, project: Project) {
    super("single-project", hostID, false, project.id);
    //register to the global projectState with this function, which will get the projects from the global to the local and then render the dom accordingly
    this.project = project;
    this.configure();
    // this.renderContent();
  }
  configure(): void {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent(): void {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons + " assigned";
    this.element.querySelector("p")!.textContent = this.project.description;
  }

  @AutoBindThis
  dragStartHandler(event: DragEvent) {
    //use dataTransfer!.setData to pass data (this.project.id)
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  @AutoBindThis
  dragEndHandler(_: DragEvent) {
    console.log("DragEnd");
  }
}
