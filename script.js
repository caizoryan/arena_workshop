import { render, html, mem, mut, eff_on, mounted, sig, h, For, each, store, produce } from "./solid_monke/solid_monke.js";
import {
	EditorState, EditorView, basicSetup, javascript, keymap,
	esLint, lintGutter, linter, openLintPanel, Linter, Compartment

} from "./codemirror/bundled.js"
import { batch, createStore } from "./solid_monke/mini-solid.js";

let [model, set_model] = createStore({
	code_list: [{ type: "default", code: "" }],
	renderers: {}
})

let register_renderer = (type, render) => set_model("renderers", type, render)
let get_renderer = (type) => model.renderers[type]


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
let m = () => document.querySelector("iframe")?.contentDocument.M

let compiled = mem(() => {
	let code = model.code_list.map(block => block.output).join("\n")
	return template_start + code + template_end
})

let app = () => {
	return h("div.container", [
		h("div.editor", each(model.code_list, (e, i) => any_widget(e, i))),
		h("iframe", { srcdoc: compiled, width: "98%", height: "98%" })
	])
}


function any_widget(element, index) {
	let render = model.renderers[element.type]
	console.log("rendering", render)
	if (typeof render == "function") {
		console.log("rendering", element)
		if (!element) return
		let c = render(element)
		set_model("code_list", index(), produce((el) => {
			el.onenter = c.onenter
		}))
		return c.render
	}

}

function assign_and_render(elem, index, fn) {
}

function pipe_model(signal, key) {
	eff_on(signal, () => m() ? m()["function" == typeof key ? key() : key] = signal() : null)
}

function register_model(key, signal) {
	let s = sig(signal)
	pipe_model(s, key)
	return s
}


function number_variable_widget(element) {
	let name = sig(element?.name ? element?.name : "variable")
	let num = register_model(name, element?.num ? element?.num : 0)
	let save = (el) => {
		el.num = num()
		el.name = name()
		el.output = `M.${name()} = ${num()}`
	}

	let r = () => html`
		style ---

		.number-widget {
			padding: .5em;
			font-family: monospace;
			height: min-output;
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
			p.out -- ${() => element.output}
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

	let memo_code = mem(() => element?.output ? element?.output : "")
	let uid = Math.random().toString(36).substring(7)
	let save
	let write_enabled = sig(true)

	return ({
		render: () => {
			mounted(() => {
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
					el.output = text
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


function vector(e) {
	let x = e?.x || 0, y = e?.y || 0

	let name = sig(e?.name || "vect")
	let size = sig(e?.size || 100)
	let vect = register_model(name, { x, y })
	let recording = sig(true)

	let onmousemove = (e) => recording() ? vect.set({ x: e.layerX, y: e.layerY }) : null

	let style = mem(() => `position: absolute; top: 40px; left: 0; width: ${size()}px; height: ${size()}px; background: ${recording() ? "red" : "#ccc"};`)
	let code = mem(() => `M.${name()} = { x: ${vect().x}, y: ${vect().y} }`)

	return {
		render: () => html`
			div [style=${mem(() => `width:100%;position:relative;height:${size() + 60}px;`)}]
				input [ type=text value=${name} oninput=${(e) => name.set(e.target.value)} ]
				input [ type=range value=${size} oninput=${(e) => size.set(parseFloat(e.target.value))} min=0 max=500 step=1]
				div [ class = widget style=${style} onmousemove=${onmousemove} onclick=${() => recording.set(!recording())} ]
					p -- ${code}`,
		onselect: () => { },
		onediting: () => { },
		onenter: (el) => { el.output = code(); el.name = name() }
	}
}

function group_widget(element) {

	return {
		render: () => h("div.editor", each(() => element.children, (e, i) => any_widget(e, i))),
		onselect: () => { },
		onediting: () => { },
		onenter: (el) => {
			el.children.forEach((child, i) => {
				child.onenter(child)
			})

			el.output = el.children.map((child) => child.output).join("\n")
		}
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

register_renderer("default", () => code_element)
register_renderer("number_variable_widget", () => number_variable_widget)
register_renderer("vect", () => vector)

console.log("model", model.renderers)


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

