/**
 * Obtain the pixel height of the provided DOM element, including
 * top and bottom margins.
 *
 * Note that this function *only* accounts for margins on `element`, not any
 * descendants which may contribute to the effective margin due to CSS "margin
 * collapsing".
 *
 * @param {Element} element - DOM element to measure
 * @return {number|null} - The element's height in pixels
 */
export function getElementHeightWithMargins(element) {
  const style = window.getComputedStyle(element);
  // Get the height of the element inside the border-box, excluding
  // top and bottom margins.
  const elementHeight = element.getBoundingClientRect().height;

  // Get the bottom margin of the element. style.margin{Side} will return
  // values of the form 'Npx', from which we extract 'N'.
  const marginHeight =
    parseFloat(style.marginTop) + parseFloat(style.marginBottom);

  return elementHeight + marginHeight;
}

/**
 * Attach listeners for one or multiple events to an element and return a
 * function that removes the listeners.
 *
 * @param {HTMLElement} element
 * @param {string[]} events
 * @param {EventListener} listener
 * @param {Object} options
 *   @param {boolean} [options.useCapture]
 * @return {function} Function which removes the event listeners.
 */
export function listen(element, events, listener, { useCapture = false } = {}) {
  if (!Array.isArray(events)) {
    events = [events];
  }
  events.forEach(event =>
    element.addEventListener(event, listener, useCapture)
  );
  return () => {
    events.forEach(event =>
      element.removeEventListener(event, listener, useCapture)
    );
  };
}
