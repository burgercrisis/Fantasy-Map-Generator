// Inject CSS styles for slider-input to arrange range and number inputs horizontally
// SliderInput component: A custom web component combining range slider and number input for dual control
// Injects CSS styles for the flexbox layout of slider-input elements
{
  const style = /* css */ `
    slider-input {
      display: flex;
      align-items: center;
      gap: .4em;
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.setAttribute("type", "text/css");
  styleElement.innerHTML = style;
  document.head.appendChild(styleElement);
}

// Create template with range slider and number input for dual control
{
  const template = document.createElement("template");
  template.innerHTML = /* html */ `
    <input type="range" />
    <input type="number" />
  `;

  // SliderInput custom element class: synchronizes range slider and number input values
  class SliderInput extends HTMLElement {
    // Initialize by cloning template and setting up synchronized range and number inputs
    constructor() {
      super();
      this.appendChild(template.content.cloneNode(true));

      const range = this.querySelector("input[type=range]");
      const number = this.querySelector("input[type=number]");

      range.value = number.value = this.value || this.getAttribute("value") || 50;
      range.min = number.min = this.getAttribute("min") || 0;
      range.max = number.max = this.getAttribute("max") || 100;
      range.step = number.step = this.getAttribute("step") || 1;

      range.addEventListener("input", this.handleEvent.bind(this));
      number.addEventListener("input", this.handleEvent.bind(this));
      range.addEventListener("change", this.handleEvent.bind(this));
      number.addEventListener("change", this.handleEvent.bind(this));
    }

    // Handle input events by validating value and syncing both inputs, then dispatching custom event
    handleEvent(e) {
      const value = e.target.value;
      const isNaN = Number.isNaN(Number(value));
      if (isNaN || value === "") return e.stopPropagation(); // Ignore invalid values to prevent propagation

      const range = this.querySelector("input[type=range]");
      const number = this.querySelector("input[type=number]");
      this.value = range.value = number.value = value;

      this.dispatchEvent(
        new CustomEvent(e.type, {
          detail: {value},
          bubbles: true,
          composed: true
        })
      );
    }

    // Set value on both range and number inputs to keep them synchronized
    set value(value) {
      const range = this.querySelector("input[type=range]");
      const number = this.querySelector("input[type=number]");
      range.value = number.value = value;
    }

    // Get string value from number input as the primary source
    get value() {
      const number = this.querySelector("input[type=number]");
      return number.value;
    }

    // Get numeric value from number input for calculations
    get valueAsNumber() {
      const number = this.querySelector("input[type=number]");
      return number.valueAsNumber;
    }
  }

  // Register the custom element for use in HTML as <slider-input>
  customElements.define("slider-input", SliderInput);
}
