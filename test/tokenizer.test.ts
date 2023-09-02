import tokenize, { parseTag } from "../src/tokenizer.ts";
import { assertEquals } from "https://deno.land/std@0.201.0/testing/asserts.ts";

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
  const tokens = tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>"],
    ["tag", "message"],
    ["string", "</h1>"],
  ]);
});

Deno.test("Tokenizer (doble quotes)", () => {
  const code = `<h1>{{ message + "{{}}" }}</h1>`;
  const tokens = tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>"],
    ["tag", 'message + "{{}}"'],
    ["string", "</h1>"],
  ]);
});

Deno.test("Tokenizer (single quotes)", () => {
  const code = `<h1>{{ message + '{{"}}' }}</h1>`;
  const tokens = tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>"],
    ["tag", "message + '{{\"}}'"],
    ["string", "</h1>"],
  ]);
});

Deno.test("Tokenizer (inner curly brackets)", () => {
  const code = `<h1>{{ message + JSON.stringify({fo: {}}) }}</h1>`;
  const tokens = tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>"],
    ["tag", "message + JSON.stringify({fo: {}})"],
    ["string", "</h1>"],
  ]);
});

Deno.test("Tokenizer (inner comment)", () => {
  const code = `<h1>{{ message /* }} */ }}</h1>`;
  const tokens = tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>"],
    ["tag", "message /* }} */"],
    ["string", "</h1>"],
  ]);
});

Deno.test("Tokenizer (left trim)", () => {
  const code = `<h1> {{- message }} </h1>`;
  const tokens = tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>"],
    ["tag", "message"],
    ["string", " </h1>"],
  ]);
});

Deno.test("Tokenizer (right trim)", () => {
  const code = `<h1> {{message -}} </h1>`;
  const tokens = tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1> "],
    ["tag", "message"],
    ["string", "</h1>"],
  ]);
});

Deno.test("Tokenizer (both trims)", () => {
  const code = `<h1> {{-message -}} </h1>`;
  const tokens = tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>"],
    ["tag", "message"],
    ["string", "</h1>"],
  ]);
});

Deno.test("Tokenizer (comment)", () => {
  const code = `<h1> {{# {{ message }} #}} </h1>`;
  const tokens = tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1> "],
    ["comment", " {{ message }} "],
    ["string", " </h1>"],
  ]);
});

Deno.test("Tokenizer (literal)", () => {
  const code = "<h1>{{ `message {}}` }}</h1>";
  const tokens = tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>"],
    ["tag", "`message {}}`"],
    ["string", "</h1>"],
  ]);
});

Deno.test("Tokenizer (literal 2)", () => {
  const code = "<h1>{{ `message ${ JSON.stringify({o:{}}) }` }}</h1>";
  const tokens = tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>"],
    ["tag", "`message ${ JSON.stringify({o:{}}) }`"],
    ["string", "</h1>"],
  ]);
});

Deno.test("Tokenizer (filter)", () => {
  const code = "{{ url |> await fetch |> await json |> stringify }}";
  const tokens = tokenize(code);
  assertEquals(tokens, [
    ["string", ""],
    ["tag", "url"],
    ["filter", "await fetch"],
    ["filter", "await json"],
    ["filter", "stringify"],
  ]);
});
