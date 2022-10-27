//the ProjedctInput class get the user input form to templateElement, then render it to hostElement.
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

    //constructor has this attach(),which is handy but not a good practise
    this.attach();
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

//instantialise a ProjedctInput object
const prjInput = new ProjedctInput();
console.log(prjInput.hostElement);

console.log(prjInput.titleInputElement);
console.log(prjInput.titleInputElement.value);
