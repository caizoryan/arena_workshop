let M = model

M.channel = { contents: [] }

function load_channel(slug) {
	fetch("https://api.are.na/v2/channels/" + slug)
		.then((res) => res.json())
		.then((res) => M.channel = res)
}

load_channel("jose-aisle")

let App = () => {
	return html`
    h1 -- will it work?
    each of ${() => M.channel.contents} as ${(e) => html`p -- ${e.title}`}
  `
}

render(App, document.body)

function splitAndExtract(str) {
	const splitStrings = [];
	const extractedValues = [];

	let currentValue = '';
	let inBraces = false;

	let assembling_string = ""


	for (let i = 0; i < str.length; i++) {
		const char = str[i];

		let peekNext = () => str[i + 1];

		if (char === "{" && inBraces) { continue }
		if (char === '$' && peekNext() === '{') {
			inBraces = true;
			splitStrings.push(assembling_string);
			assembling_string = ''
		}

		else if (char === '}') {
			inBraces = false;
			if (currentValue.trim() !== '') {
				extractedValues.push(currentValue.trim());
				currentValue = '';
			}
		} else if (inBraces) {
			currentValue += char;
		} else {
			assembling_string += char
		}

		// on last
		if (i === str.length - 1) {
			splitStrings.push(assembling_string);
		}
	}

	console.log("splitStrings", splitStrings)
	return { strings: splitStrings, extracted: extractedValues };
}

/// --------------------
let r = mem(() => model.s * 2)
let f = mem(() => "font-size: " + model.v + "px;" +
	"background-color: " + "rgba(" + model.s * 2 + "," + model.v * 2 + ",255, .7);")
render(() => html`p [style=${f}] -- ${f} ${r}`, document.body)

/// --------------------
let x = mem(() => model.x)
let y = mem(() => model.y)
let z = mem(() => model.z)
let a = mem(() => model.a)



function color_mem(g, b) {
	let style = mem(() => `
padding: ${a() * 2}px;
margin: ${x()}px;
background-color: rgba(${x() * 2}, ${g}, ${b}, ${y() / 100});
font-size: ${z()}px;
`)
	return style

}

render(() => html`
  p [ style=${color_mem(0, 255)}] -- ${x}, ${() => model.y}, ${() => model.z}, ${() => model.a}
  p [ style=${color_mem(255, 0)}] -- ${x}, ${() => model.y}, ${() => model.z}, ${() => model.a}
 `,
	document.body)
