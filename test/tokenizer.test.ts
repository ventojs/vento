import tokenize from "../src/tokenizer.ts";
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";

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

Deno.test("Tokenizer (inner comment)", () => {
  const code = `<h1>{{ message /* }} */ }}</h1>`;
  const tokens = tokenize(code);
  assertEquals(tokens, [
    ["string", "<h1>"],
    ["tag", "message /* }} */"],
    ["string", "</h1>"],
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
