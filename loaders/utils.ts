// Adapted from https://gist.github.com/creationix/7435851
export function join(...paths: string[]): string {
  const parts = ([] as string[])
    .concat(...paths.map((path) => path.split("/")))
    .filter((part) => part && part !== ".");

  const newParts: string[] = [];

  for (const part of parts) {
    if (part === "..") {
      newParts.pop();
    } else {
      newParts.push(part);
    }
  }

  newParts.unshift(""); // Ensure always a leading slash
  return newParts.join("/");
}
