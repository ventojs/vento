import { dirname, join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { cwd } from "node:process";

export async function saveFile(root: string, file: string, content: string): Promise<void> {
  const path = join(cwd(), root, file);
  try {
    await mkdir(dirname(path), { recursive: true });
  } catch {
    // Ignore
  }
  await writeFile(path, content);
}

export async function remove(root: string, paths: string[] = []): Promise<void> {
  for (const path of paths) {
    try {
      await rm(join(root, path), { recursive: true });
    } catch {
      // Ignore
    }
  }
}

export async function copyFolder(from: string, to: string): Promise<void> {
  await cp(from, to, { recursive: true });
}

export function getJson<T = Record<string, any>>(root: string, path: string): T {
  const file = join(root, path);

  try {
    return JSON.parse(readFileSync(file, "utf-8")) as T;
  } catch {
    return {} as T;
  }
}

export function editJson<T = Record<string, any>>(
  root: string,
  path: string,
  cb: (data: T) => void,
) {
  const file = join(root, path);
  const data = getJson<T>(root, path);

  try {
    cb(data);
  } catch (err) {
    console.log(`Error editing file: ${file}`);
    throw err;
  }
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

export function editText(root: string, path: string, cb: (data: string) => string | string[]) {
  const file = join(root, path);
  let data = "";

  try {
    data = readFileSync(file, "utf-8");
  } catch {
    console.log(`Not found. Generate file: ${file}`);
  }
  try {
    const newData = cb(data);
    data = Array.isArray(newData) ? newData.join("\n") : newData;
  } catch (err) {
    console.log(`Error editing file: ${file}`);
    throw err;
  }
  writeFileSync(file, data + "\n");
}
