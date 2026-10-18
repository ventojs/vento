import { FileLoader } from "../loaders/file.ts";
import { join } from "../loaders/utils.ts";
import { assertEquals } from "./utils.ts";

Deno.test("Join paths", () => {
  assertEquals(join("a", "b", "c"), "/a/b/c");
  assertEquals(join("a/b", "c"), "/a/b/c");
  assertEquals(join("a/b/", "c"), "/a/b/c");
  assertEquals(join("a/b", "../c"), "/a/c");
  assertEquals(join("a/b", "./c"), "/a/b/c");
  assertEquals(join("a/b", "../../c"), "/c");
  assertEquals(join("/a/b", "../"), "/a");
});

Deno.test("File loader", () => {
  const loader = new FileLoader("/root/");
  assertEquals(loader.resolve("", "/a.vto"), "/root/a.vto");
  assertEquals(loader.resolve("b.vto", "/a.vto"), "/root/a.vto");
  assertEquals(loader.resolve("/root/b/b.vto", "./a.vto"), "/root/b/a.vto");
  assertEquals(loader.resolve("/root/b/b.vto", "/a.vto"), "/root/a.vto");
});

Deno.test("File loader with file: URL", () => {
  const loader = new FileLoader("file:///root/");
  assertEquals(loader.resolve("", "/a.vto"), "/root/a.vto");
  assertEquals(loader.resolve("b.vto", "/a.vto"), "/root/a.vto");
  assertEquals(loader.resolve("/root/b/b.vto", "./a.vto"), "/root/b/a.vto");
  assertEquals(loader.resolve("/root/b/b.vto", "/a.vto"), "/root/a.vto");
});
