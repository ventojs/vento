import { test } from "./utils.ts";

Deno.test("Call tag", async () => {
  await test({
    template: `
    {{ function greet }}
      {{ this.greeting }} {{ this.target }}
    {{ /function }}
    {{ call greet }}
      {{ slot 'greeting' }}Hello{{ /slot }}
      {{ slot 'target' }}world{{ /slot }}
    {{ /call }}
    `,
    expected: "Hello world",
  });
  await test({
    template: `
    {{ async function greet }}
      {{ this.greeting }} {{ await Promise.resolve(this.target) }}
    {{ /function }}
    {{ await call greet }}
      {{ slot 'greeting' }}Hello{{ /slot }}
      {{ slot 'target' }}world{{ /slot }}
    {{ /call }}
    `,
    expected: "Hello world",
  });
  await test({
    template: `
    {{ function greet(punctuation) }}
      {{ this.greeting }} {{ this.target }}{{ punctuation }}
    {{ /function }}
    {{ call greet('!') }}
      {{ slot 'greeting' }}Hello{{ /slot }}
      {{ slot 'target' }}world{{ /slot }}
    {{ /call }}
    `,
    expected: "Hello world!",
  });
  await test({
    template: `
    {{ function greet }}
      {{ this.content }}{{ this.punctuation }}
    {{ /function }}
    {{ call greet() -}}
      Hello
      {{- slot 'punctuation' }}!{{ /slot -}}
      world
    {{- /call }}
    `,
    expected: "Helloworld!",
  });
  await test({
    template: `
    {{ function greet }}
      {{ this.greeting }} {{ this.target }}
    {{ /function }}
    {{ call greet }}
      {{ slot 'greeting' }}He{{ /slot }}
      {{ slot 'target' }}world{{ /slot }}
      {{ slot 'greeting' }}llo{{ /slot }}
    {{ /call }}
    `,
    expected: "Hello world",
  });


});
