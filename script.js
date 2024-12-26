import { render, html, mem, mut, eff_on, mounted, sig } from "./solid_monke/solid_monke.js";
import {
	EditorState, EditorView, basicSetup, javascript, keymap,
	esLint, lintGutter, linter, openLintPanel, Linter

} from "./codemirror/bundled.js"


let model = mut({})

model.code_list = [{ type: "default", code: "" }]


//* Code element
// implements
// - onselect -> when widget is selected
// - ondeselect -> when widget is deselected *optional
// - onediting -> when widget is focused, starting to edit
// - onenter -> when alt+enter is pressed
// - render -> render the widget onto element


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
	console.log("code_list", model.code_list)
	setTimeout(() => {
		window.M = document.querySelector("iframe")?.contentDocument.model
	}, 100);
})

let compiled = mem(() => {
	let code = model.code_list.map(code => code.code).join("\n")
	return template_start + code + template_end
})

let app = () => {
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
				each of ${() => model.code_list} as ${any_widget}
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

function any_widget(element, index) {
	if (element.type == "default") return code_element(element, index).render
	if (element.type == "number_variable_widget") return number_variable_widget(element, index).render
}

function number_variable_widget(element, index) {
	let num = sig(element.num ? element.num : 0)
	let name = sig(element.name ? element.name : "variable")

	eff_on(num, () => {
		if (window.M && window.M[name()]) window.M[name()] = num()
	})

	let r = () => html`
		div
			span -- model.
			input [ type=text oninput = ${(e) => { name.set(e.target.value); console.log(e.target.value, name()); }} value=${element.name} ]

			span -- = 

			input [ type = range oninput=${(e) => num.set(e.target.value)} ]
			span -- ${num}

			button [ onclick = ${() => {

			(function() {
				element.num = num()
				element.name = name()
				set_code(index(), `model.${name()} = ${num()}`)
			})()

		}}  ] -- set
			p -- ${() => element.code}
`



	return ({
		render: r,
		onselect: () => { },
		onediting: () => { },
		onenter: () => { },
	})
}

function code_element(element, index) {
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

		editor.focus()

		setTimeout(() => {
			if (element.cursor) {
				console.log("cursor setting", element.cursor)
				editor.dispatch({ selection: { anchor: element.cursor, head: element.cursor } })
			}
		}, 10)
	})

	return ({
		render: () => html`div [ class = ${"editor-" + index()}]`,
		onselect: () => { },
		onediting: () => { },
		onenter: () => { },
	})
}


render(app, document.body);

window.onload = () => {
	window.onkeydown = (e) => {
		if (e.key == "t" && e.ctrlKey) {
			model.code_list = [...model.code_list, { type: "default", code: "" }]
		}

		if (e.key == "n" && e.ctrlKey) {
			model.code_list = [...model.code_list, { type: "number_variable_widget", code: "" }]
		}

	}
}

