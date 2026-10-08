export const SCROLL_EVENT = "gg:scroll-to";

export function scrollToBlock(id: string) {
  window.dispatchEvent(new CustomEvent(SCROLL_EVENT, { detail: id }));
}
