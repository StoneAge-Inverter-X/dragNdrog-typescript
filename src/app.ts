//the ProjedctInput class get the user input form to templateElement, then render it to hostElement.
//this.element is a verbose property
class ProjedctInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: Element;

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
    //constructor has this attach(),which is handy but not a good practise
    this.attach();
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

//instantialise a ProjedctInput object
const prjInput = new ProjedctInput();
