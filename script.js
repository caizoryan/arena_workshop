import { render, html, mem, mut, eff_on, mounted, sig, h, For, each, store, produce } from "./solid_monke/solid_monke.js";
import {
	EditorState, EditorView, basicSetup, javascript, keymap,
	esLint, lintGutter, linter, openLintPanel, Linter, Compartment

} from "./codemirror/bundled.js"
import { batch, createStore } from "./solid_monke/mini-solid.js";

let [model, set_model] = createStore({
	code_list: [{ type: "default", code: "" }]
})


//* Code element
// implements
// - onselect -> when widget is selected
// - ondeselect -> when widget is deselected *optional
// - onfocus -> when widget is focused, starting to edit
// - write/update -> when alt+enter is pressed
// - render -> render the widget onto element


let template_start = `
<body></body>
<script type="module">

import { mem, render, mut, sig, html, eff, eff_on} from "./solid_monke/solid_monke.js";

let M = mut({})
document.M = M
`

let template_end = `</script>`

eff_on(model.code_list, () => {
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
	return h("div.container", [
		h("div.editor", each(model.code_list, (e, i) => any_widget(e, i))),
		h("iframe", { srcdoc: compiled, width: "98%", height: "98%" })
	])
}


function any_widget(element, index) {
	if (element.type == "default") return assign_and_render(element, index, code_element)
	if (element.type == "number_variable_widget") return assign_and_render(element, index, number_variable_widget)
	if (element.type == "vect") return assign_and_render(element, index, widget)
}

function assign_and_render(elem, index, fn) {
	let c = fn(elem)
	set_model("code_list", index(), produce((el) => {
		el.onenter = c.onenter
	}))
	return c.render
}

function number_variable_widget(element) {
	let num = sig(element.num ? element.num : 0)
	let name = sig(element.name ? element.name : "variable")
	let save = (el) => {
		el.num = num()
		el.name = name()
		el.code = `M.${name()} = ${num()}`
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
				input [ type = range oninput=${(e) => num.set(e.target.value)} value=${num} min=0 max=255 step=1]

				button [ onclick = ${() => { trigger_save() }}] -- set
			p.out -- ${() => element.code}
`
	return ({
		render: r,
		onselect: () => { },
		onediting: () => { },
		onenter: save

	})
}

function code_element(element) {
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
	let memo_code = mem(() => element.code ? element.code : "")
	let uid = Math.random().toString(36).substring(7)
	let save
	let write_enabled = sig(true)

	return ({
		render: () => {
			mounted(() => {
				console.log("mounting editor")
				let readonly = new Compartment()

				let editor = new EditorView({
					parent: document.querySelector(".editor-" + uid),
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

				save = function(el) {
					element.focused = editor.hasFocus
					let text = recursive_fucking_children(editor.state.doc).join("\n");
					el.code = text
					// set_code(index(), text)
					element.cursor = editor.state.selection.ranges[0].from
				}


				setTimeout(() => {
					if (element.cursor && element.focused) {
						editor.focus()
						editor.dispatch({ selection: { anchor: element.cursor, head: element.cursor } })
					}
				}, 10)
			})
			return html`div [ class = ${"editor-" + uid} style=${mem(() => `opacity: ${write_enabled() ? 1 : .5}`)} ]`
		},
		onselect: () => { },
		onediting: () => { },
		onenter: (...args) => save(...args)
	})
}


function widget(element) {
	let { x, y } = element
	x = x ? x : 0
	y = y ? y : 0

	let vect = sig({ x, y })

	let onmousemove = (e) => vect.set({ x: e.layerX, y: e.layerY })
	eff_on(vect, () => {
		if (window.M) {
			window.M["vect_x"] = vect().x
			window.M["vect_y"] = vect().y
			console.log("setting vect", window.M["vect_x"], window.M["vect_y"])
		}
	})

	let style = "position: absolute; top: 0; left: 0; width: 100px; height: 100px; background: red;"

	return {
		render: () => html`
			div [style=width:100%;height:130px;position:relative;]
				div [ class = widget style=${style} onmousemove=${onmousemove} ]
					p -- x: ${() => vect().x}
					p -- y: ${() => vect().y}
					p -- ${() => element.code}
			`,
		onselect: () => { },
		onediting: () => { },
		onenter: (el) => el.code = `
			M.vect_x = ${vect().x};
			M.vect_y = ${vect().y}
		`
	}
}

function eval_code(code) {
	return eval(`"use strict";(${code})`);
}

function trigger_save() {
	let save_queue = model.code_list.map((code) => code.onenter)
	console.log("save_queue", save_queue)
	batch(() => {
		save_queue.forEach((code, i) => set_model("code_list", i, produce((el) => code(el))))
	})
}

render(app, document.body);

function add_widget(type) {
	trigger_save()
	set_model("code_list", model.code_list.length, { type: type, code: "" })
}

window.onload = () => {
	window.onkeydown = (e) => {
		if (e.key == "t" && e.ctrlKey) {
			add_widget("default")
		}

		if (e.key == "n" && e.ctrlKey) {
			add_widget("number_variable_widget")
		}

		if (e.key == "k" && e.ctrlKey) {
			add_widget("vect")
		}

		if (e.key == "Enter" && e.altKey) {
			console.log("trigger save")
			trigger_save()
		}

	}
}

