/**
 * Accessibility helpers for drag and drop
 */

export function announceToScreenReader(message: string) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export function getDragA11yLabel(status: string): string {
  return `Drag to move to ${status} column`;
}

export function getDragA11yDescription(id: string, status: string): string {
  return `Work order ${id} in ${status} column. Use space or enter to pick up, arrow keys to move between columns, space or enter to drop.`;
}

