import { render, html, mem, mut, eff_on, mounted, sig, h, For, each } from "./solid_monke/solid_monke.js";
import {
	EditorState, EditorView, basicSetup, javascript, keymap,
	esLint, lintGutter, linter, openLintPanel, Linter, Compartment

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

let M = mut({})
document.M = M
`

let template_end = `</script>`

eff_on(() => model.code_list, () => {
	console.log("code_list changed")
	setTimeout(() => {
		window.M = document.querySelector("iframe")?.contentDocument.M
	}, 100);
})

let compiled = mem(() => {
	let code = model.code_list.map(code => code.code).join("\n")
	return template_start + code + template_end
})

let app = () => {
	let list = () => model.code_list
	return h("div.container", [
		h("div.editor", each(list, any_widget)),
		h("iframe", { srcdoc: compiled, width: "98%", height: "98%" })
	])
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
	if (element.type == "default") return assign_and_render(element, index, code_element)
	if (element.type == "number_variable_widget") return assign_and_render(element, index, number_variable_widget)
}

function assign_and_render(elem, index, fn) {
	let c = fn(elem, index)
	elem.onenter = c.onenter
	return c.render
}

function number_variable_widget(element, index) {
	let num = sig(element.num ? element.num : 0)
	let name = sig(element.name ? element.name : "variable")
	let save = () => {
		(function() {
			element.num = num()
			element.name = name()

			set_code(index(), `M.${name()} = ${num()}`)
		})()
	}

	eff_on(num, () => window.M ? window.M[name()] = num() : null)

	let r = () => html`
		style ---

		.number-widget {
			padding: .5em;
			font-family: monospace;
			height: min-content;
			box-shadow: none;
		  
		  display: grid;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 2fr 1fr;
		}

		.number-widget input[type="text"] {
			margin: 0 .1em;
		}

		.number-widget input[type="range"] {
			border: 1px solid #000;
			margin: 0 .1em;
			padding: .2em;
			background: none;
		}

		p.out {
		  color: #555;
		}

		.number-widget button {
			all: unset;
			border: 1px solid #555;
			padding: .1em;
		  margin: 0 .1em;
		  cursor: pointer;
		}

		---
		.number-widget
			.values
				span -- M.
				input [ type=text oninput = ${(e) => { name.set(e.target.value); console.log(e.target.value, name()); }} value=${element.name} ]
				span -- = ${num}

			.controls
				input [ type = range oninput=${(e) => num.set(e.target.value)} value=${element.num ? element.num : 0} min=0 max=255 step=1]

				button [ onclick = ${() => { trigger_save() }}] -- set
			p.out -- ${() => element.code}
`


	return ({
		render: r,
		onselect: () => { },
		onediting: () => { },
		onenter: () => {
			save()
		},
	})
}

function code_element(element, index) {
	let memo_code = mem(() => element.code ? element.code : "")
	let save

	console.log("re-running apparently", element)

	let write_enabled = sig(true)
	mounted(() => {
		console.log("mounting editor")
		let readonly = new Compartment()

		let editor = new EditorView({
			parent: document.querySelector(".editor-" + index()),
			state: EditorState.create({
				doc: memo_code(),
				extensions: [
					basicSetup,
					readonly.of(EditorState.readOnly.of(!write_enabled())),
					javascript(),
					linter(esLint(new Linter())),
					lintGutter(),

					keymap.of([
						{
							key: "Escape", run: () => {
								write_enabled.set(false)
								editor.dispatch({
									effects: readonly.reconfigure(EditorState.readOnly.of(!write_enabled()))
								})
							},

						},
						{
							key: "Enter",
							run: () => {
								// if(!write_enabled())  
								write_enabled.set(true)
								editor.dispatch({
									effects: readonly.reconfigure(EditorState.readOnly.of(!write_enabled()))
								})
							},
							preventDefault: true,
						}

					])
				]
			})
		})

		save = () => {
			element.has_focus = editor.hasFocus
			let text = recursive_fucking_children(editor.state.doc).join("\n");
			set_code(index(), text)
			element.cursor = editor.state.selection.ranges[0].from

		}


		setTimeout(() => {
			if (element.cursor && element.has_focus) {
				console.log("cursor setting", element.cursor)
				editor.focus()
				editor.dispatch({ selection: { anchor: element.cursor, head: element.cursor } })
			}
		}, 10)
	})

	return ({
		render: () => html`div [ class = ${"editor-" + index()} style=${mem(() => `opacity: ${write_enabled() ? 1 : .5}`)} ]`,
		onselect: () => { },
		onediting: () => { },
		onenter: () => {
			save()
		},
	})
}


function trigger_save() {
	let save_queue = model.code_list.map((code) => code.onenter)
	console.log("save_queue", save_queue)
	save_queue.forEach((code) => code())
}

render(app, document.body);

function add_widget(type) {
	trigger_save()
	model.code_list = [...model.code_list, { type: type, code: "" }]
}

window.onload = () => {
	window.onkeydown = (e) => {
		if (e.key == "t" && e.ctrlKey) {
			add_widget("default")
		}

		if (e.key == "n" && e.ctrlKey) {
			add_widget("number_variable_widget")
		}

		if (e.key == "Enter" && e.altKey) {
			console.log("trigger save")
			trigger_save()
		}

	}
}

