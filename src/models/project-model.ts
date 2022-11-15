namespace App {
  //Project Type: has id, title, descripition, people, status
  export enum ProjectStatus {
    Active,
    Finished,
  }
  // why not using interface for this Project object? 'cause we want to instanciate it.
  //by doing below lines, we imexplicityly declare a few class property
  export class Project {
    constructor(
      public id: string,
      public title: string,
      public description: string,
      public people: number,
      public status: ProjectStatus
    ) {}
  }
}
