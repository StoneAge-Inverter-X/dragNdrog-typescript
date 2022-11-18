  //it's a reuseable validation implement:
  export interface Validatable {
    value: string | number;
    required?: boolean; // using the "?"  is the same as required: boolean|undefined;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }
  export function validate(validatableInput: Validatable): boolean {
    let isValid = true;
    if (validatableInput.required) {
      isValid =
        isValid && validatableInput.value.toString().trim().length !== 0;
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
