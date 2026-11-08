import { parseTag } from "../core/tokenizer.ts";
import tmpl from "../mod.ts";
import { describe, it, expect } from "vitest";

describe("Tokenizer", () => {
  it("Parse tag", () => {
    const code = "{{ tag |> filter1 |> filter2 }}";
    const positions = parseTag(code);
    expect(positions).toStrictEqual([2, 9, 20, 31]);
    expect(code.substring(positions[0], positions[1])).toBe(" tag |>");
    expect(code.substring(positions[1], positions[2])).toBe(" filter1 |>");
    expect(code.substring(positions[2], positions[3])).toBe(" filter2 }}");
  });

  it("Basic tokenizer", () => {
    const code = `<h1>{{ message }}</h1>`;
    const tokens = tmpl().tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "<h1>", 0],
      ["tag", "message", 4],
      ["string", "</h1>", 17],
    ]);
  });

  it("Tokenizer (double quotes)", () => {
    const code = `<h1>{{ message + "{{}}" }}</h1>`;
    const tokens = tmpl().tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "<h1>", 0],
      ["tag", 'message + "{{}}"', 4],
      ["string", "</h1>", 26],
    ]);
  });

  it("Tokenizer (single quotes)", () => {
    const code = `<h1>{{ message + '{{"}}' }}</h1>`;
    const tokens = tmpl().tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "<h1>", 0],
      ["tag", "message + '{{\"}}'", 4],
      ["string", "</h1>", 27],
    ]);
  });

  it("Tokenizer (inner curly brackets)", () => {
    const code = `<h1>{{ message + JSON.stringify({fo: {}}) }}</h1>`;
    const tokens = tmpl().tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "<h1>", 0],
      ["tag", "message + JSON.stringify({fo: {}})", 4],
      ["string", "</h1>", 44],
    ]);
  });

  it("Tokenizer (inner comment)", () => {
    const code = `<h1>{{ message /* }} */ }}</h1>`;
    const tokens = tmpl().tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "<h1>", 0],
      ["tag", "message /* }} */", 4],
      ["string", "</h1>", 26],
    ]);
  });

  it("Tokenizer (left trim)", () => {
    const code = `<h1> {{- message }} </h1>`;
    const tokens = tmpl().tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "<h1>", 0],
      ["tag", "message", 5],
      ["string", " </h1>", 19],
    ]);
  });

  it("Tokenizer (right trim)", () => {
    const code = `<h1> {{message -}} </h1>`;
    const tokens = tmpl().tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "<h1> ", 0],
      ["tag", "message", 5],
      ["string", "</h1>", 18],
    ]);
  });

  it("Tokenizer (both trims)", () => {
    const code = `<h1> {{-message -}} </h1>`;
    const tokens = tmpl().tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "<h1>", 0],
      ["tag", "message", 5],
      ["string", "</h1>", 19],
    ]);
  });

  it("Tokenizer (comment)", () => {
    const code = `<h1> {{# {{ message }} #}} </h1>`;
    const tokens = tmpl().tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "<h1> ", 0],
      ["comment", " {{ message }} ", 5],
      ["string", " </h1>", 23],
    ]);
  });

  it("Tokenizer (literal)", () => {
    const code = "<h1>{{ `message {}}` }}</h1>";
    const tokens = tmpl().tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "<h1>", 0],
      ["tag", "`message {}}`", 4],
      ["string", "</h1>", 23],
    ]);
  });

  it("Tokenizer (literal 2)", () => {
    const code = "<h1>{{ `message ${ JSON.stringify({o:{}}) }` }}</h1>";
    const tokens = tmpl().tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "<h1>", 0],
      ["tag", "`message ${ JSON.stringify({o:{}}) }`", 4],
      ["string", "</h1>", 47],
    ]);
  });

  it("Tokenizer (literal 3)", () => {
    const code = "{{ `\\${{` }}";
    const tokens = tmpl().tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "", 0],
      ["tag", "`\\${{`", 0],
      ["string", "", 12],
    ]);
  });

  it("Tokenizer (filter)", () => {
    const code = "{{ url |> await fetch |> await json |> stringify }}";
    const tokens = tmpl().tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "", 0],
      ["tag", "url", 0],
      ["filter", "await fetch", 9],
      ["filter", "await json", 24],
      ["filter", "stringify", 38],
      ["string", "", 51],
    ]);
  });

  it("Tokenizer (regexp)", () => {
    const code = "{{ !/}}/.test(foo) }}";
    const tokens = tmpl().tokenize(code);
    expect(tokens).toStrictEqual([
      ["string", "", 0],
      ["tag", "!/}}/.test(foo)", 0],
      ["string", "", 21],
    ]);
  });
});
