//the ProjedctInput class get the user input form to templateElement, then render it to hostElement.

//ProjectState class definition: it is like state in the React , which stors data and update the dom once it changes.
class ProjectState {
  private projects: any[] = [];
  private static instance: ProjectState;
  //listeners stores all the functions that need to be called when this.projects is updated
  private listeners: any[] = [];

  //in this private constuctor way, we can only create a new object by calling getInstance()
  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  addProject(title: string, description: string, numberOfPeople: number) {
    const newProject = {
      id: Math.random().toString(),
      title: title,
      description: description,
      people: numberOfPeople,
    };
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice()); // pass the copy of array, not the original arry to protect it.
    }
  }

  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
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

// ProjectList Class
class ProjecteList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: Element;
  assignedProjects: any[] = [];

  //priveate type: this inexplicitly add an private property to this class.
  //'active'|'finishjed' is a literal type and a union type
  constructor(private type: "active" | "finished") {
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as Element;
    this.element.id = `${this.type}-projects`;

    //register to the global projectState with this function, which will get the projects from the global to the local and then render the dom accordingly
    projectState.addListener((projects: any[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }
  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;

    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;

      listEl.appendChild(listItem);
    }
  }
}

// ProjedctInput class definition
class ProjedctInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: Element;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as Element;
    this.element.id = "user-input";
    this.titleInputElement = this.element.querySelector("#title")!;
    this.descriptionInputElement = this.element.querySelector("#description")!;
    this.peopleInputElement = this.element.querySelector("#people")!;
    //this is to add event listener
    this.configure();
    //constructor has this attach(),which is handy but not a good practise
    this.attach();
  }

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

  private configure() {
    this.element.addEventListener("submit", this.submitHandler); // when using @AutoBindThis, "this" is pointed at the ProjedctInput instance. not the HTML element that is calling submitHandler()
    //this.element.addEventListener("submit", this.submitHandler.bind(this));// call bind() when not using @AutoBindThis
  }
  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
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
const activePrjList = new ProjecteList("active");
const finishedPrjList = new ProjecteList("finished");
