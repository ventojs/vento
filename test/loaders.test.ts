import { describe, it, expect } from "vitest";
import { FileLoader } from "../loaders/file.ts";
import { join } from "../loaders/utils.ts";

describe("Loaders", () => {
  it("Join paths", () => {
    expect(join("a", "b", "c")).toBe("/a/b/c");
    expect(join("a/b", "c")).toBe("/a/b/c");
    expect(join("a/b/", "c")).toBe("/a/b/c");
    expect(join("a/b", "../c")).toBe("/a/c");
    expect(join("a/b", "./c")).toBe("/a/b/c");
    expect(join("a/b", "../../c")).toBe("/c");
    expect(join("/a/b", "../")).toBe("/a");
  });

  it("File loader", () => {
    const loader = new FileLoader("/root/");
    expect(loader.resolve("", "/a.vto")).toBe("/root/a.vto");
    expect(loader.resolve("b.vto", "/a.vto")).toBe("/root/a.vto");
    expect(loader.resolve("/root/b/b.vto", "./a.vto")).toBe("/root/b/a.vto");
    expect(loader.resolve("/root/b/b.vto", "/a.vto")).toBe("/root/a.vto");
  });

  it("File loader with file: URL", () => {
    const loader = new FileLoader("file:///root/");
    expect(loader.resolve("", "/a.vto")).toBe("/root/a.vto");
    expect(loader.resolve("b.vto", "/a.vto")).toBe("/root/a.vto");
    expect(loader.resolve("/root/b/b.vto", "./a.vto")).toBe("/root/b/a.vto");
    expect(loader.resolve("/root/b/b.vto", "/a.vto")).toBe("/root/a.vto");
  });
});
