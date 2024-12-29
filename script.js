import { render, html, mem, mut, eff_on, mounted, sig, h, For, each, store, produce, when, eff } from "./solid_monke/solid_monke.js";
import {
	EditorState, EditorView, basicSetup, javascript, keymap,
	esLint, lintGutter, linter, openLintPanel, Linter, Compartment

} from "./codemirror/bundled.js"
import { batch, createStore } from "./solid_monke/mini-solid.js";


let [model, set_model] = createStore({
	blocks: [
		{ type: "group", output: "", children: [{ type: "default", output: `console.log("helloworld")` },], active: false },
		{ type: "group", output: "", children: [{ type: "number", output: "M.ass = 14", num: 14, name: "ass" },], active: false },
	],
	renderers: {},
	cursor: 0
}, {})

let find_active = () => model.blocks.find((el) => el.active)
let set_cursor = (index) => set_model("cursor", index)

let cursor_next = () => {
	if (model.cursor < model.blocks.length - 1) { set_cursor(model.cursor + 1) }
	else { set_cursor(0) }
}

let cursor_prev = () => {
	if (model.cursor > 0) { set_cursor(model.cursor - 1) }
	else { set_cursor(model.blocks.length - 1) }
}



eff_on(() => model.cursor, () => {
	batch(() => {
		set_model("blocks", [0, model.blocks.length - 1], produce((el) => el.active = false))
		set_model("blocks", model.cursor, produce((el) => el.active = true))
	})
})

/**
 * @typedef {Object} Renderer
 *
 * @property {(el) => void} write
 * @property {() => any[] | any} render
 *
 * @property {() => void} [onselect]
 * @property {() => void} [onkeydown]
 * @property {() => void} [onfocus]
 * @property {() => void} [onunfocus]
 */

/**
 * @param {string}  type - type of renderer to be used in process gen.
 * @param {string} renderer - passed as string, to be evaluated at runtime 
 */
let register_renderer = (type, renderer) => set_model("renderers", type, renderer)

function eval_code(code) {
	return eval(`"use strict";(${code})`);
}

/** returns a renderer function
* @param {string} str - code to be evaluated
* @returns {(a: any, b:any ) => Renderer}
*/
function return_renderer(str) {
	let fn = eval_code(str)
	if (typeof fn == "function") {
		return fn
	} else {
		throw new Error("Invalid renderer")
	}
}

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

import { mem, render, mut, sig, html, eff, eff_on, h} from "./solid_monke/solid_monke.js";

let M = mut({})
document.M = M
`

let template_end = `</script>`
let m = () => document.querySelector("iframe")?.contentDocument.M

let compiled = mem(() => {
	let code = model.blocks.map(block => block.output).join("\n")
	return template_start + code + template_end
})

let app = () => {
	return h("div.container", [
		h("div.editor", each(model.blocks, (e, i) => any_widget(e, i))),
		h("iframe", { srcdoc: compiled, width: "98%", height: "98%" })
	])
}


function any_widget(element, index) {
	let render_str = model.renderers[element.type]
	let render = return_renderer(render_str)


	if (typeof render == "function") {
		let c = render(element, index)
		console.log(c)

		set_model("blocks", index(), produce((el) => {
			el.onkeydown = c.onkeydown
			el.write = c.write
		}))

		return h("div", { style: mem(() => element.active ? "border: 1px solid red;" : null), onmousedown: (e) => set_cursor(index()) }, c.render)
	}
}

function pipe_model(signal, key) {
	eff_on(signal, () => m() ? m()["function" == typeof key ? key() : key] = signal() : null)
}

function register_model(key, signal) {
	let s = sig(signal)
	pipe_model(s, key)
	return s
}


function number_widget(element) {
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
		.number-widget [onclick=${() => {
			console.log(model.renderers[element.type])
		}}]
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
		write: save

	})
}

function render_editor(element) {

	return ({
		render: r,
		onselect: () => { },
		onediting: () => { },
		write: save

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
									key: "Ctrl-y", run: () => {
										let text = recursive_fucking_children(editor.state.doc).join("\n");
										register_renderer("ass", text)
									}
								},
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
		write: (...args) => save(...args)
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
	let code = mem(() => `M["${name()}"] = { x: ${vect().x}, y: ${vect().y} }`)

	return {
		render: () => html`
			div [style=${mem(() => `width:100%;position:relative;height:${size() + 60}px;`)}]
				input [ type=text value=${name} oninput=${(e) => name.set(e.target.value)} ]
				input [ type=range value=${size} oninput=${(e) => size.set(parseFloat(e.target.value))} min=0 max=500 step=1]
				div [ class = widget style=${style} onmousemove=${onmousemove} onclick=${() => recording.set(!recording())} ]
					p -- ${code}`,
		onselect: () => { },
		onediting: () => { },
		write: (el) => { el.output = code(); el.name = name() }
	}
}

function group_widget(element, i) {
	console.log(element)
	// let trash = []
	// let cursor = sig(0)
	// let cursor_next = () => element.children.length > cursor() + 1 ? cursor.set(cursor() + 1) : null
	// let cursor_prev = () => cursor() > 0 ? cursor.set(cursor() - 1) : null

	function save_m(el) {
		el.children.forEach((child, i) => { child.write(child) })
		el.output = el.children.map((child) => child.output).join("\n")
	}

	let child_widget = (element, index) => {
		let render_str = model.renderers[element.type]
		let render = return_renderer(render_str)

		if (typeof render == "function") {
			let c = render(element, index)

			set_model("blocks", i(), produce((el) => {
				el.children[index()].write = c.write
			}))

			return c.render
		}
	}

	let add_widget = (type) => {
		trigger_save()
		set_model("blocks", i(), produce((g) => {
			g.children.push({ type, code: "" })
		}))
	}

	let onkeydown = (e) => {
		if (e.key == "t" && e.ctrlKey) {
			add_widget("default")
		}

		if (e.key == "n" && e.ctrlKey) {
			add_widget("number")
		}

		if (e.key == "k" && e.ctrlKey) {
			add_widget("vect")
		}
	}

	return {
		render: () => h("div.editor", each(() => element.children, (e, i) => child_widget(e, i))),
		onselect: () => { },
		onediting: () => { },
		onfocus: () => { },
		onkeydown,
		write: save_m
	}
}



function trigger_save() {
	let save_queue = model.blocks.map((code) => code.write)
	batch(() =>
		save_queue.forEach((code, i) =>
			"function" == typeof code
				? set_model("blocks", i, produce((el) => code(el)))
				: null)
	)
}

register_renderer("group", group_widget.toString())
register_renderer("default", code_element.toString())
register_renderer("number", number_widget.toString())


let v = vector.toString()

register_renderer("vect", v)
render(app, document.body);

window.onload = () => {
	window.onkeydown = (e) => {
		// happens no matter what
		if (e.key == "Enter" && e.altKey) { trigger_save() }

		// if no elment is in focus
		if (e.target == document.body) {
			if (e.key == "ArrowDown") { cursor_next() }
			if (e.key == "ArrowUp") { cursor_prev() }
		}


		// if there is an element active,
		// forward the event to it
		let active = find_active()
		if (active.onkeydown) { active.onkeydown(e); return }

	}
}

