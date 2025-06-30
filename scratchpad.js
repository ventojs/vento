import vento from './mod.ts'

const env = vento({strict: true})

const result = await env.run('./__SCRATCHPAD/index.vto', {
	array: [[1], [2], []],
	bar: 23,
	baz: 100,
	qux: 1000,
})

console.log(result)
