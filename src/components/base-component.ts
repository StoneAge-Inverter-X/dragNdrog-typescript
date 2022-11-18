
  //Component class definition: it's the base class of ProjectList and ProjectInput. We can think is as the concept of component in React JS. it has some elements, and it can render them.
  //'cause ProjectList and ProjectInput has different type regarding "hostElement" and "element", so we use generic class (T and U)
  // Component is abstract class, since we don't want it to be instantiated, but has to be inherited firstly
  export abstract class Component<
    T extends HTMLElement,
    U extends HTMLElement
  > {
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

