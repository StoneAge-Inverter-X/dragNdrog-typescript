// Drag and drop interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}
interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

//Project Type: has id, title, descripition, people, status
enum ProjectStatus {
  Active,
  Finished,
}
// why not using interface for this Project object? 'cause we want to instanciate it.
//by doing below lines, we imexplicityly declare a few class property
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

//the ProjedctInput class get the user input form to templateElement, then render it to hostElement.

//ProjectState class definition: it is like state in the React , which stors data and update the dom once it changes.

// to make this line generic : type Listner = (items: Project[]) => void;
type Listner<T> = (items: T[]) => void;

// class State: this is the base class of ProjectState, and is more generic for all the "state" implementation
class State<T> {
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
const projectState = ProjectState.getInstance();

//it's a reuseable validation implement:
interface Validatable {
  value: string | number;
  required?: boolean; // using the "?"  is the same as required: boolean|undefined;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}
function validate(validatableInput: Validatable): boolean {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  //validatableInput.minLength!=null, only has one =, means the value is not underfinded or null
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid &&
      validatableInput.value.toString().trim().length >=
        validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid &&
      validatableInput.value.toString().trim().length <=
        validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

//it's autobind decorator. refer to the last section's code for details
function AutoBindThis(_: any, _2: any, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjustedDescriptor;
}

//Component class definition: it's the base class of ProjectList and ProjectInput. We can think is as the concept of component in React JS. it has some elements, and it can render them.
//'cause ProjectList and ProjectInput has different type regarding "hostElement" and "element", so we use generic class (T and U)
// Component is abstract class, since we don't want it to be instantiated, but has to be inherited firstly
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;
  constructor(
    templatedId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementID?: string
  ) {
    this.templateElement = document.getElementById(
      templatedId
    ) as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId) as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (newElementID) {
      this.element.id = newElementID;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }

  //abstract method: the implement is not in base class, but it forces the inherenting class to implement it
  abstract configure(): void;
  abstract renderContent(): void;
}

//ProjectItem Class: it extends Component class and implements Draggable interface
class ProjectItem
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

// ProjectList Class
class ProjectList
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

// ProjedctInput class definition
class ProjedctInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.titleInputElement = this.element.querySelector("#title")!;
    this.descriptionInputElement = this.element.querySelector("#description")!;
    this.peopleInputElement = this.element.querySelector("#people")!;

    //this is to add event listener
    this.configure();
    //constructor has this attach(),which is handy but not a good practise
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler); // when using @AutoBindThis, "this" is pointed at the ProjedctInput instance. not the HTML element that is calling submitHandler()
    //this.element.addEventListener("submit", this.submitHandler.bind(this));// call bind() when not using @AutoBindThis
  }

  renderContent() {}

  @AutoBindThis
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.getUserInput();
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      projectState.addProject(title, description, people);
      console.log(title, description, people);
    }
    this.clearInputs();
    // console.log(this);
  }

  private getUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };

    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      max: 10,
      min: 1,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("reinput a good one");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs(): void {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }
}

//instantialise a ProjedctInput object
const prjInput = new ProjedctInput();
// console.log(prjInput.hostElement);
// console.log(prjInput.titleInputElement);
// console.log(prjInput.titleInputElement.value);
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
