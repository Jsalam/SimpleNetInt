export function createElement<T extends HTMLElement>(
  tag: keyof HTMLElementTagNameMap,
  style?: Partial<CSSStyleDeclaration> | null,
  properties?: Partial<GlobalEventHandlers> | null,
  ...children: (HTMLElement | string)[]
): HTMLElement {
  const el = document.createElement(tag);
  Object.assign(el.style, style);
  Object.assign(el, properties);
  for (const child of children) {
    el.append(child);
  }
  return el;
}

export function createInputElement(
  style?: Partial<CSSStyleDeclaration> | null,
  properties?: Partial<HTMLInputElement> | null,
): HTMLElement {
  const el = document.createElement("input");
  Object.assign(el.style, style);
  Object.assign(el, properties);
  return el;
}

export function createSelectElement(
  options: Array<{ name: string; value: string }>,
  style?: Partial<CSSStyleDeclaration> | null,
  properties?: Partial<HTMLSelectElement> | null,
): HTMLSelectElement {
  const el = document.createElement("select");
  for (const o of options) {
    const option = document.createElement("option");
    option.value = o.value;
    option.textContent = o.name;
    el.append(option);
  }
  Object.assign(el.style, style);
  Object.assign(el, properties);
  return el;
}

export function updateSelectOptions(
  el: HTMLSelectElement,
  options: Array<{ name: string; value: string }>,
) {
  el.innerHTML = "";

  for (const o of options) {
    const option = document.createElement("option");
    option.value = o.value;
    option.textContent = o.name;
    el.append(option);
  }
}
