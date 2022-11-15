/// <reference path = "./base-component.ts"/>
/// <reference path = "../decorator/autobind.ts"/>
/// <reference path = "../util/validation.ts"/>
/// <reference path = "../state/project-state.ts"/>

namespace App {
  // ProjedctInput class definition
  //the ProjedctInput class get the user input form to templateElement, then render it to hostElement.
  export class ProjedctInput extends Component<
    HTMLDivElement,
    HTMLFormElement
  > {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
      super("project-input", "app", true, "user-input");
      this.titleInputElement = this.element.querySelector("#title")!;
      this.descriptionInputElement =
        this.element.querySelector("#description")!;
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
}
