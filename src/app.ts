/// <reference path = "./models/drag-drop-interfaces.ts"/>
/// <reference path = "./models/project-model.ts"/>
/// <reference path = "./state/project-state.ts"/>
/// <reference path = "./util/validation.ts"/>
/// <reference path = "./decorator/autobind.ts"/>
/// <reference path = "./components/base-component.ts"/>
/// <reference path = "./components/project-input.ts"/>
/// <reference path = "./components/project-item.ts"/>
/// <reference path = "./components/project-list.ts"/>

namespace App {
  //instantialise a ProjedctInput object
  new ProjedctInput();
  // console.log(prjInput.hostElement);
  // console.log(prjInput.titleInputElement);
  // console.log(prjInput.titleInputElement.value);
  new ProjectList("active");
  new ProjectList("finished");
}
