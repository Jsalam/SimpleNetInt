type CSSPropertyName = {
  [K in keyof CSSStyleDeclaration]: CSSStyleDeclaration[K] extends string
    ? K
    : never;
}[keyof CSSStyleDeclaration];

class VirtualElement {
  native = this.createNativeElement();
  textContent = "";
  style: Partial<CSSStyleDeclaration> = {};
  nextTextContent = "";
  nextStyle: Partial<CSSStyleDeclaration> = {};

  createNativeElement() {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.left = "0px";
    el.style.top = "0px";
    // Move it out of screen
    //  el.style.transform = 'translateX(-999px, -999px)';
    // Hide the element
    el.style.display = "none";
    el.style.pointerEvents = "none";
    return el;
  }
}

/**
 * This class manages a pool of DOM elements that can be used to display
 * text labels on the screen. This is useful to avoid creating and destroying
 * DOM elements for each label, which can be expensive.
 *
 * The pool has a fixed capacity, and will reuse elements that are not in use.
 * It can be used to show and hide labels for different clients.
 *
 * The pool will automatically apply the necessary changes to the DOM when
 * the `scheduleUpdate` method is called.
 */
export class VirtualElementPool {
  /**
   * Represents a void DOM element.
   */

  static capacity = 400;
  static allElements: VirtualElement[] = [];
  static activeElements = new Map();
  static freeElements = new Map();

  static get containerEl() {
    return document.querySelector("#model");
  }

  static updateScheduled = false;

  /**
   * Apply DOM diffing
   */
  static commitUpdate() {
    this.updateScheduled = false;
    for (const ve of this.allElements) {
      for (let prop of Object.keys(ve.nextStyle) as CSSPropertyName[]) {
        if (ve.nextStyle[prop] !== ve.style[prop]) {
          ve.native.style[prop] = ve.nextStyle[prop]!;
        }
      }
      for (let prop of Object.keys(ve.style) as CSSPropertyName[]) {
        if (!ve.nextStyle.hasOwnProperty(prop)) {
          ve.native.style[prop] = "";
        }
      }
      ve.style = ve.nextStyle;

      if (ve.nextTextContent !== ve.textContent) {
        ve.native.textContent = ve.textContent = ve.nextTextContent;
      }

      if (!ve.native.parentElement) {
        this.containerEl?.append(ve.native);
      }

      ve.nextStyle = {};
      ve.nextTextContent = "";
    }
  }

  /**
   * Schedule an update to apply the changes to the DOM.
   */
  static scheduleUpdate() {
    if (!this.updateScheduled) {
      this.updateScheduled = true;
      queueMicrotask(() => {
        this.commitUpdate();
      });
    }
  }

  /**
   * Explain the logic of the function ****************************************************
   * @param {*} type
   * @returns
   */
  static getActiveElementsByType(type: string) {
    if (!this.activeElements.has(type)) {
      this.activeElements.set(type, new Map());
    }
    return this.activeElements.get(type);
  }

  static getFreeElementsByType(type: string) {
    if (!this.freeElements.has(type)) {
      this.freeElements.set(type, []);
    }
    return this.freeElements.get(type);
  }

  static createElement() {
    const ve = new VirtualElement();
    VirtualElementPool.allElements.push(ve);
    return ve;
  }

  /**
   * Explain the logic of the function ****************************************************
   * @param {*} type
   * @returns
   */
  static allocateElement(type: string) {
    const freeElements = this.getFreeElementsByType(type);
    if (freeElements.length > 0) {
      return freeElements.pop();
    }
    const activeElements = this.getActiveElementsByType(type);
    if (activeElements.size < this.capacity) {
      return this.createElement();
    }
    const [firstClient, firstElement] = activeElements.entries().next().value;
    activeElements.delete(firstClient);
    return firstElement;
  }

  /**
   * This function ************************************
   * @param {*} client
   * @param {*} type
   * @returns
   */
  static getElementFor(client: unknown, type: string) {
    const activeElements = this.getActiveElementsByType(type);
    if (activeElements.has(client)) {
      return activeElements.get(client);
    }
    const ve = this.allocateElement(type);
    activeElements.set(client, ve);
    return ve;
  }

  static show(
    client: unknown,
    type: string,
    textContent: string,
    style: Partial<CSSStyleDeclaration>,
  ) {
    // console.log("VirtualElementPool.show");
    const ve = this.getElementFor(client, type);
    ve.nextTextContent = textContent;
    ve.nextStyle = style;
    VirtualElementPool.scheduleUpdate();
  }

  static hide(client: unknown, type: string) {
    const activeElements = this.getActiveElementsByType(type);
    if (activeElements.has(client)) {
      const ve = activeElements.get(client);
      // Move it out of screen
      // ve.nextStyle = { ...ve.style, transform: 'translate(-999px, -999px)' };
      // Hide the element
      ve.nextStyle = { ...ve.style, display: "none" };
      ve.nextTextContent = "";
      VirtualElementPool.scheduleUpdate();
      activeElements.delete(client);
      this.getFreeElementsByType(type).push(ve);
    }
  }

  static clear() {
    for (const [owner, ownElements] of this.activeElements) {
      for (const [key, element] of ownElements) {
        element.native.remove();
      }
    }
    this.allElements = [];
    this.activeElements.clear();
  }
}
