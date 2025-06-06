import { parseTag } from "../src/tokenizer.ts";
import tmpl from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";

Deno.test("Parse tag", () => {
  const code = "{{ tag |> filter1 |> filter2 }}";
  const positions = parseTag(code);
  assertEquals(positions, [2, 9, 20, 31]);
  assertEquals(code.substring(positions[0], positions[1]), " tag |>");
  assertEquals(code.substring(positions[1], positions[2]), " filter1 |>");
  assertEquals(code.substring(positions[2], positions[3]), " filter2 }}");
});

Deno.test("Basic tokenizer", () => {
  const code = `<h1>{{ message }}</h1>`;
  const tokens = tmpl().tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>", 0],
    ["tag", "message", 4],
    ["string", "</h1>", 17],
  ]);
});

Deno.test("Tokenizer (double quotes)", () => {
  const code = `<h1>{{ message + "{{}}" }}</h1>`;
  const tokens = tmpl().tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>", 0],
    ["tag", 'message + "{{}}"', 4],
    ["string", "</h1>", 26],
  ]);
});

Deno.test("Tokenizer (single quotes)", () => {
  const code = `<h1>{{ message + '{{"}}' }}</h1>`;
  const tokens = tmpl().tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>", 0],
    ["tag", "message + '{{\"}}'", 4],
    ["string", "</h1>", 27],
  ]);
});

Deno.test("Tokenizer (inner curly brackets)", () => {
  const code = `<h1>{{ message + JSON.stringify({fo: {}}) }}</h1>`;
  const tokens = tmpl().tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>", 0],
    ["tag", "message + JSON.stringify({fo: {}})", 4],
    ["string", "</h1>", 44],
  ]);
});

Deno.test("Tokenizer (inner comment)", () => {
  const code = `<h1>{{ message /* }} */ }}</h1>`;
  const tokens = tmpl().tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>", 0],
    ["tag", "message /* }} */", 4],
    ["string", "</h1>", 26],
  ]);
});

Deno.test("Tokenizer (left trim)", () => {
  const code = `<h1> {{- message }} </h1>`;
  const tokens = tmpl().tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>", 0],
    ["tag", "message", 5],
    ["string", " </h1>", 19],
  ]);
});

Deno.test("Tokenizer (right trim)", () => {
  const code = `<h1> {{message -}} </h1>`;
  const tokens = tmpl().tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1> ", 0],
    ["tag", "message", 5],
    ["string", "</h1>", 18],
  ]);
});

Deno.test("Tokenizer (both trims)", () => {
  const code = `<h1> {{-message -}} </h1>`;
  const tokens = tmpl().tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>", 0],
    ["tag", "message", 5],
    ["string", "</h1>", 19],
  ]);
});

Deno.test("Tokenizer (comment)", () => {
  const code = `<h1> {{# {{ message }} #}} </h1>`;
  const tokens = tmpl().tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1> ", 0],
    ["comment", " {{ message }} ", 5],
    ["string", " </h1>", 23],
  ]);
});

Deno.test("Tokenizer (literal)", () => {
  const code = "<h1>{{ `message {}}` }}</h1>";
  const tokens = tmpl().tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>", 0],
    ["tag", "`message {}}`", 4],
    ["string", "</h1>", 23],
  ]);
});

Deno.test("Tokenizer (literal 2)", () => {
  const code = "<h1>{{ `message ${ JSON.stringify({o:{}}) }` }}</h1>";
  const tokens = tmpl().tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>", 0],
    ["tag", "`message ${ JSON.stringify({o:{}}) }`", 4],
    ["string", "</h1>", 47],
  ]);
});

Deno.test("Tokenizer (literal 3)", () => {
  const code = "{{ `\\${{` }}";
  const tokens = tmpl().tokenize(code);
  assertEquals(tokens, [
    ["string", "", 0],
    ["tag", "`\\${{`", 0],
  ]);
});

Deno.test("Tokenizer (filter)", () => {
  const code = "{{ url |> await fetch |> await json |> stringify }}";
  const tokens = tmpl().tokenize(code);
  assertEquals(tokens, [
    ["string", "", 0],
    ["tag", "url", 0],
    ["filter", "await fetch"],
    ["filter", "await json"],
    ["filter", "stringify"],
  ]);
});

Deno.test("Tokenizer (regexp)", () => {
  const code = "{{ !/}}/.test(foo) }}";
  const tokens = tmpl().tokenize(code);
  assertEquals(tokens, [
    ["string", "", 0],
    ["tag", "!/}}/.test(foo)", 0],
  ]);
});
