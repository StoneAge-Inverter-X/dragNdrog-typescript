import { Project, ProjectStatus } from "../models/project-model";

//ProjectState class definition: it is like state in the React , which stors data and update the dom once it changes.

// to make this line generic : type Listner = (items: Project[]) => void;
type Listner<T> = (items: T[]) => void;

// class State: this is the base class of ProjectState, and is more generic for all the "state" implementation
export class State<T> {
  protected listeners: Listner<T>[] = [];
  addListener(listenerFn: Listner<T>) {
    this.listeners.push(listenerFn);
  }
}

//when you extend State class, you need to specify what T is
class ProjectState extends State<Project> {
  private projects: any[] = [];
  private static instance: ProjectState;
  //listeners stores all the functions that need to be called when this.projects is updated

  //by using this private constructor() and static getInstance(), we can only create a new object by calling getInstance().
  //this approach is called singleton:The Singleton pattern ensures that a class has only one instance and provides a global point of access to that instance.
  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  addProject(title: string, description: string, numberOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numberOfPeople,
      ProjectStatus.Active
    );

    this.projects.push(newProject);
    this.updateListeners();
  }

  //change the project status(finish/active) when drag and drop happens
  moveProject(prjId: string, newStatus: ProjectStatus): void {
    const project = this.projects.find((prj) => prj.id === prjId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
    }
    this.updateListeners();
  }

  // to inform all the compents, when this.projects is changed/updated
  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice()); // pass the copy of array, not the original arry to protect it.
    }
  }
}

//global object that can be accessed in anywherer of this file
export const projectState = ProjectState.getInstance();
