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
