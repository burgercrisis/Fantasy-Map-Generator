// Inject CSS styles for the fill-box custom element to handle cursor and SVG appearance
// FillBox component: A custom web component for displaying fill style options with SVG preview
// Injects CSS styles for fill-box elements and their SVG children
{
  const style = /* css */ `
    fill-box:not([disabled]) {
      cursor: pointer;
    }

    fill-box > svg {
      vertical-align: middle;
      pointer-events: none;
    }

    fill-box > svg > rect {
      stroke: #666666;
      stroke-width: 2;
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.setAttribute("type", "text/css");
  styleElement.innerHTML = style;
  document.head.appendChild(styleElement);
}

// Create template for the SVG-based fill box element
{
  const template = document.createElement("template");
  template.innerHTML = /* html */ `
    <svg>
      <rect x="0" y="0" width="100%" height="100%">
    </svg>
  `;

  // FillBox custom element class: handles the fill color display and user interaction
  class FillBox extends HTMLElement {
    // Initialize element by cloning template and setting initial fill and size attributes
    constructor() {
      super();

      this.appendChild(template.content.cloneNode(true));
      this.querySelector("rect")?.setAttribute("fill", this.fill);
      this.querySelector("svg")?.setAttribute("width", this.size);
      this.querySelector("svg")?.setAttribute("height", this.size);
    }

    // Static method to display tooltip using global tip function
    // Static method to show tooltip: calls global tip function with the element's tip text
    static showTip() {
      tip(this.tip);
    }

    // Add mousemove listener to show tooltip when hovering
    // Lifecycle: When element is added to DOM, set up tooltip event listener
    connectedCallback() {
      this.addEventListener("mousemove", this.constructor.showTip);
    }

    // Remove mousemove listener to prevent memory leaks
    // Lifecycle: When element is removed from DOM, clean up tooltip event listener
    disconnectedCallback() {
      this.removeEventListener("mousemove", this.constructor.showTip);
    }

    // Get fill color attribute, defaulting to dark gray if not set
    // Getter for fill color: returns the current fill attribute or default gray
    get fill() {
      return this.getAttribute("fill") || "#333";
    }

    // Set fill color attribute and update the SVG rect fill
    // Setter for fill color: updates both the element attribute and the SVG rect fill
    set fill(newFill) {
      this.setAttribute("fill", newFill);
      this.querySelector("rect")?.setAttribute("fill", newFill);
    }

    // Get size attribute for SVG dimensions, defaulting to 1em
    // Getter for size: returns the SVG size attribute or default 1em
    get size() {
      return this.getAttribute("size") || "1em";
    }

    // Get tooltip text from data attribute, with default message
    // Getter for tooltip text: returns custom tip from data attribute or default message
    get tip() {
      return this.dataset.tip || "Fill style. Click to change";
    }
  }

  // Register the custom element. Note: Shadow DOM not used to allow access to SVG hatch patterns from parent scope
  customElements.define("fill-box", FillBox);
}
