import React from 'npm:react@19.1.0';

export default function render(data){
  // Misses <!DOCTYPE html>
  let searchTarget, targetIndex;
  const { title, description, mainNavItems, searchArray } = data;
  return (
    <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>{ title }</title>
      <meta name="description" content={ description } />
      <meta name="robots" content="noindex,nofollow" />
    </head>
    <body>
      <nav id="navigation-menu">
        { mainNavItems.map(({ url, text }) => (
          <a key={ url } href={ url }>{ text.toUpperCase() }</a>
        )) }
      </nav>

      <main>
        <h1>Hello { (typeof user == 'undefined' ? {} : user).name ?? 'there' }!</h1>
        <p>You're looking at a page that is written exclusively for benchmarking purposes.</p>
        <p>A bit of explanation: this benchmark is run in two different ways.</p>
        <ul>
          <li>The template <em>compilation</em> is measured. This indicates how fast the templating engine can turn a file like this in a reusable function. Usually, contentful templates like this are only compiled once, but for layouts or includes/partials, they are often rendered many times with different input data.</li>
          <li>That segues nicely into the next benchmark; the speed of said reusable function. How fast does the compiled function spit out the rendered output when called with some set of properties?</li>
        </ul>
        <p>In order to test the speed of the templating languages themselves, here's a binary search implementation.</p>

        { (() => { searchTarget = 23 })() }
        <input readOnly value={ searchTarget } />
        { (() => {
          let start = 0
          let end = searchArray.length
          while(start < end - 1){
            const middle = Math.floor(start + (end - start) / 2)
            if(searchTarget < searchArray[middle]){
              end = middle
            } else {
              start = middle
            }
          }
          targetIndex = start
        })() }
        Output: <output>{ targetIndex }</output>

        <p>This templating language uses <code>&#x7B;</code> and <code>}</code> for interpolation. There are two main ways to escape them if you need them literally:</p>

        <ol>
          <li>Through <code>{ `{\` … \`}` }</code>, or</li>
          <li>Through character escaping, such as <code>&amp;#x7B; … }</code> in HTML.</li>
        </ol>
      </main>
    </body>
    </html>
  );
}
