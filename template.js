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
