import { test } from "./utils.ts";

Deno.test("Layout tag", async () => {
  await test({
    template: `
    {{ layout "/my-file.vto" }}Hello world{{ /layout }}
    `,
    expected: "<h1>Hello world</h1>",
    includes: {
      "/my-file.vto": "<h1>{{ content }}</h1>",
    },
  });
});

Deno.test("Layout tag (with filters)", async () => {
  await test({
    template: `
    {{ layout "/my-file.vto" |> toUpperCase }}Hello world{{ /layout }}
    `,
    expected: "<h1>HELLO WORLD</h1>",
    includes: {
      "/my-file.vto": "<h1>{{ content }}</h1>",
    },
  });
  await test({
    template: `
    {{ layout "/my-file.vto" |> toUpperCase }}Hello world{{ /layout }}
    `,
    expected: "<h1>hello world</h1>",
    includes: {
      "/my-file.vto": "<h1>{{ content |> toLowerCase }}</h1>",
    },
  });
});

Deno.test("Layout tag (with extra data)", async () => {
  await test({
    template: `
    {{ layout "/my-file.vto" {
      tag: "h1"
    } }}Hello world{{ /layout }}
    `,
    expected: "<h1>Hello world</h1>",
    includes: {
      "/my-file.vto": "<{{ tag }}>{{ content }}</{{ tag }}>",
    },
  });
});

Deno.test("Layout tag (with extra data and filters)", async () => {
  await test({
    template: `
    {{ layout "/my-file.vto" {
      tag: "h1"
    } |> toUpperCase }}Hello world{{ /layout }}
    `,
    expected: "<h1>HELLO WORLD</h1>",
    includes: {
      "/my-file.vto": "<{{ tag }}>{{ content }}</{{ tag }}>",
    },
  });
});

Deno.test("Nested layout tags", async () => {
  await test({
    template: `
    {{ layout "/my-file.vto" }}{{ layout "/my-file.vto" }}Hello world{{ /layout }}{{ /layout }}
    `,
    expected: "<h1><h1>Hello world</h1></h1>",
    includes: {
      "/my-file.vto": "<h1>{{ content }}</h1>",
    },
  });
});

Deno.test("Layout with autoescape", async () => {
  await test({
    template: `
    {{ layout "/my-file.vto" }}Hello <strong>world</strong>{{ /layout }}
    `,
    expected: "<h1>Hello <strong>world</strong></h1>",
    options: {
      autoescape: false,
    },
    includes: {
      "/my-file.vto": "<h1>{{ content }}</h1>",
    },
  });
  await test({
    template: `
    {{ layout "/my-file.vto" |> toUpperCase }}Hello <strong>world</strong>{{ /layout }}
    `,
    expected: "<h1>HELLO <STRONG>WORLD</STRONG></h1>",
    options: {
      autoescape: true,
    },
    includes: {
      "/my-file.vto": "<h1>{{ content }}</h1>",
    },
  });
});

Deno.test("Layouts with slots", async () => {
  await test({
    template: `
    {{ layout "/my-file.vto" }}
      {{ slot greeting }}Hello{{ /slot }}
      {{ slot target }}world{{ /slot }}
    {{ /layout }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.vto": "{{ greeting }} {{ target }}",
    },
  });
  await test({
    template: `
    {{ layout "/my-file.vto" }}
      Hello
      {{- slot punctuation }}!{{ /slot -}}
      {{- slot content }} world{{ /slot -}}
    {{ /layout }}
    `,
    expected: "Hello world!",
    includes: {
      "/my-file.vto": "{{ content }}{{ punctuation }}",
    },
  });
  await test({
    template: `
    {{ layout "/my-file.vto" }}
      Hello
      {{- slot punctuation }}!{{ /slot -}}
      {{- slot content }} world{{ /slot -}}
    {{ /layout }}
    `,
    expected: "Hello world!",
    includes: {
      "/my-file.vto": "{{ content }}{{ punctuation }}",
    },
  });
  await test({
    template: `
    {{ set greeting = "Hi" }}
    {{ layout "/my-file.vto" { target: "world" } }}
      {{ slot greeting }}Hello{{ /slot }}
      {{ slot target }}space{{ /slot }}
    {{ /layout }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.vto": "{{ greeting }} {{ target }}",
    },
  });
  await test({
    template: `
    {{ layout "/my-file.vto" { target: "world" } }}
      {{ slot message |> toLowerCase() }}HELLO {{ /slot }}
      {{ slot message |> toUpperCase() }}world{{ /slot }}
    {{ /layout }}
    `,
    expected: "hello WORLD",
    includes: {
      "/my-file.vto": "{{ message }}",
    },
  });
  await test({
    template: `
    {{ layout "/my-file.vto" { target: "world" } }}
      {{- slot greeting }}<em>Hello{{ /slot -}}
      world
      {{- slot greeting }}</em>{{ /slot -}}
    {{ /layout }}
    `,
    expected: "<em>Hello</em> world",
    options: {
      autoescape: true,
    },
    includes: {
      "/my-file.vto": "{{ greeting }} {{ content }}",
    },
  });
  await test({
    template: `
    {{- layout "/file-1.vto" }}
      {{- slot leak }}Leaked!{{ /slot -}}
      {{- slot foo }}Foo{{ /slot -}}
    {{ /layout -}}
    {{- layout "/file-2.vto" }}
      {{- slot bar }}Bar {{ /slot -}}
    {{ /layout -}}
    `,
    expected: "FooBar",
    options: {
      autoescape: true,
    },
    includes: {
      "/file-1.vto": "{{ foo }}{{ content }}",
      "/file-2.vto": "{{- leak }}{{ bar }}",
    },
  });
  await test({
    template: `
    {{- layout "/file-1.vto" }}
      {{- slot leak }}Leaked!{{ /slot -}}
      {{- slot foo }}Foo{{ /slot -}}
      {{- layout "/file-2.vto" }}
        {{- slot bar }}Bar{{ /slot -}}
      {{ /layout -}}
    {{ /layout -}}
    `,
    expected: "FooBar",
    options: {
      autoescape: true,
    },
    includes: {
      "/file-1.vto": "{{ foo }}{{ content }}",
      "/file-2.vto": "{{- leak }}{{ bar }}",
    },
  });
  await test({
    template: `
    {{- layout "/base.vto" }}
      {{- slot nav -}}
        {{- if !no_nav -}}
          {{- include '/nav.vto' -}}
        {{- /if -}}
      {{- /slot -}}
    {{- /layout -}}
    `,
    expected: "<p>Nav:<a>Nav</a></p>",
    includes: {
      "/base.vto": "<p>Nav:{{ nav || 'No nav' }}</p>",
      "/nav.vto": "<a>Nav</a>",
    },
  });
  await test({
    template: `
    {{- layout "/base.vto" }}
      {{- slot nav -}}
        {{- if !no_nav -}}
          {{- include '/nav.vto' -}}
        {{- /if -}}
      {{- /slot -}}
    {{- /layout -}}
    `,
    expected: "<p>Nav:No nav</p>",
    data: {
      no_nav: true,
    },
    includes: {
      "/base.vto": "<p>Nav:{{ nav || 'No nav' }}</p>",
      "/nav.vto": "<a>Nav</a>",
    },
  });
  await test({
    template: `
    {{ layout "/base.vto" }}
      {{ slot greeting |> toLowerCase }}
        {{ echo |> toUpperCase }}
          Hello world
        {{ /echo }}
      {{ /slot }}
    {{ /layout }}
    `,
    expected: "hello world",
    includes: {
      "/base.vto": "{{ greeting |> trim }}",
    },
  })
});

Deno.test("Layouts without closing tag", async () => {
  await test({
    template: `
    {{ layout "/my-file.vto" }}
    world
    {{ slot greeting }}Hello{{ /slot }}
    `,
    expected: "Hello world",
    includes: {
      "/my-file.vto": "{{ greeting }} {{ content |> trim }}",
    },
  });
  await test({
    template: `
    {{ layout "/my-file.vto" }}
    Hello {{ layout "/em.vto" }}world{{ /layout }}!
    `,
    expected: "<p>Hello <em>world</em>!</p>",
    includes: {
      "/my-file.vto": "<p>{{ content |> trim }}</p>",
      "/em.vto": "<em>{{ content }}</em>",
    },
  });
  await test({
    template: `
    {{ layout "/my-file.vto" -}}
    Hello {{ layout "/em.vto" }}world
    `,
    expected: "<p>Hello <em>world</em></p>",
    includes: {
      "/my-file.vto": "<p>{{ content |> trim }}</p>",
      "/em.vto": "<em>{{ content |> trim }}</em>",
    },
  });
});
