export function isEmpty(item: unknown): boolean {
  return (item === null || item === undefined || item === "");
}

export function toIterator(item: unknown, withKeys = false): Array<unknown> {
  if (Array.isArray(item)) {
    return withKeys ? Object.entries(item) : item;
  }

  if (typeof item === "function") {
    return toIterator(item(), withKeys);
  }

  if (typeof item === "object" && item !== null) {
    return withKeys ? Object.entries(item) : Object.values(item);
  }

  if (typeof item === "string") {
    return toIterator(item.split(""), withKeys);
  }

  if (typeof item === "number") {
    return toIterator(new Array(item).fill(0).map((_, i) => i + 1));
  }

  return toIterator([item], withKeys);
}
