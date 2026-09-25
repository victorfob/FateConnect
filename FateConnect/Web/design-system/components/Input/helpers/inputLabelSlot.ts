/** Sem `shrink` o MUI decide sozinho, e o rótulo sobe animado no foco: `false` o prenderia embaixo. */
export function inputLabelSlot(shrunk: boolean) {
  if (!shrunk) return undefined;

  return { shrink: true };
}
