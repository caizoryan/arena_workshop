import { render, html, mem, mut, eff_on, mounted } from "./solid_monke/solid_monke.js";
import {
	EditorState, EditorView, basicSetup, javascript, keymap,
	esLint, lintGutter, linter, openLintPanel, Linter

} from "./codemirror/bundled.js"


let model = mut({})

model.code_list = [{ type: "default", code: "" }]


let template_start = `
<body></body>
<script type="module">

import { mem, render, mut, sig, html} from "./solid_monke/solid_monke.js";

let model = mut({})
document.model = model
`

let template_end = `</script>`

eff_on(() => model.code_list, () => {
	console.log("code_list changed")
	setTimeout(() => {
		window.M = document.querySelector("iframe")?.contentDocument.model
	}, 100);
})

let compiled = mem(() => {
	console.log(model.code_list)
	console.log("compiling")
	let all = model.code_list.map(code => {
		return code.code
	})

	let code = all.join("\n")

	console.log("code", code)

	return template_start + code + template_end
})

let app = () => {
	let indexes = mem(() => model.code_list.map((_, i) => i))
	return html`
		style ---
		*{margin: 0; padding: 0;}
			.editor {
				width: 95%;
				height: 80vh;
				display: grid;
				grid-template-rows: 1fr 8fr 1fr;
			}
		.editor > * {
			margin: 10px;
			border: 1px dotted black;
			border-radius: 10px;
			box-shadow: 0 0 10px 5px rgba(0,0,0,.1);
		}
		.container {
			width: 100vw;
			height: 100vh;
			display: grid;
			grid-template-columns: 1fr 1fr;
		}
		---

		div.container
			div.editor
				textarea [value=${template_start}]
				each of ${() => model.code_list} as ${code_element}
				textarea [value=${template_end}]
			iframe [srcdoc=${compiled} width=98% height=98% ]
`
}

function set_code(index, code) {
	let new_code_list = [...model.code_list]
	new_code_list[index].code = code

	model.code_list = new_code_list
}

const recursive_fucking_children = (doc) => {
	let text = [];

	if (doc.children) {
		let children = doc.children;
		children.forEach((child) => {
			text = text.concat(recursive_fucking_children(child));
		});
	} else if (doc.text) return doc.text;

	return text;
};

function code_element(element, index) {
	console.log("code_element", element, index)
	let memo_code = mem(() => element.code ? element.code : "")

	mounted(() => {
		let editor = new EditorView({
			parent: document.querySelector(".editor-" + index()),
			state: EditorState.create({
				doc: memo_code(),
				extensions: [
					basicSetup,
					javascript(),
					linter(esLint(new Linter())),
					lintGutter(),
					keymap.of({
						key: "Alt-Enter", run: () => {
							let text = recursive_fucking_children(editor.state.doc).join("\n");
							set_code(index(), text)
							element.cursor = editor.state.selection.ranges[0].from
							console.log("cursor", element.cursor)
						}
					})
				]
			})
		})

		console.log("focusing editor, curs", element.cursor)
		console.log("cursor", element.cursor)

		editor.focus()

		setTimeout(() => {
			if (element.cursor) {
				console.log("cursor setting", element.cursor)
				editor.dispatch({ selection: { anchor: element.cursor, head: element.cursor } })
			}
		}, 10)
	})

	let archive = () => {
		if (e.key === "Enter" && e.altKey) {
			console.log("element", element)
			console.log("enter", e.target.value);
			set_code(index(), e.target.value)
			console.log("element after change", element)
			setTimeout(() => {
				console.log(model.code_list[0], element.code)
				console.log("focus", e.target.focus)
				e.target.focus()
			}, 750);
		}
	}
	return html`
				div [ class = ${"editor-" + index()}]    
	`
}

// function recomiple(){
// 	model
// }
//
//

render(app, document.body);

window.onload = () => {
	console.log("loaded")
	window.onkeydown = (e) => {
		if (e.key == "n" && e.ctrlKey) {
			model.code_list = [...model.code_list, { type: "default", code: "" }]
		}

	}
}

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
