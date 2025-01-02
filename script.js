import { render, html, mem, mut, eff_on, mounted, sig, h, For, each, store, produce, when, eff } from "./solid_monke/solid_monke.js";
import { batch, createStore } from "./solid_monke/mini-solid.js";
import { make_code_mirror, vector, code_element, number_widget, render_editor } from "./blocks.js";
import { EditorState, EditorView, basicSetup, javascript, keymap, esLint, lintGutter, linter, Linter, Compartment } from "./codemirror/bundled.js"

let [renderers, set_renderers] = createStore({})

let moodle = {
	blocks: [{ type: "group", output: "", blocks: [], active: false, focus: false },],
	cursor: 0
}

let load = () => {
	if (localStorage.getItem("model")) {
		moodle = JSON.parse(localStorage.getItem("model"))
	}
}

load()


let [model, set_model] = createStore(moodle, {})

let remove_block = (index) => set_model("blocks", (e) => e.filter((r, i) => i != index))
let find_active = () => model.blocks.find((el) => el.active)
let find_focus = () => model.blocks.find((el) => el.focus)

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
	set_model("blocks", [0, model.blocks.length - 1], "focus", false)
	set_model("blocks", (e, i) => i == model.cursor, "active", true)
	set_model("blocks", (e, i) => i != model.cursor, "active", false)
})

let template = {
	start: `
		<body></body>
		<script type="module">

		import { mem, render, mut, sig, html, eff, eff_on, h} from "./solid_monke/solid_monke.js";

		let M = mut({})
		document.M = M
		`,
	end: `</script>`
}

let compiled = mem(() => {
	let code = model.blocks.map(block => block.output).join("\n")
	return template.start + code + template.end
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
let register_renderer = (type, renderer) => {
	set_renderers(type, renderer)

	// trigger a forced re-render when renderers are updated
	let copy = [...model.blocks]
	set_model("blocks", [])
	set_model("blocks", copy)
}


/** returns a renderer function
* @param {string} str - code to be evaluated
* @returns {(a: any, b:any ) => Renderer}
*/
function return_renderer(str) {
	let fn = eval_code(str)
	if (typeof fn == "function") { return fn }
	else { throw new Error("Invalid renderer") }
}

function eval_code(code) {
	return eval(`"use strict";(${code})`);
}

let m = () => document.querySelector("iframe")?.contentDocument.M

let app = () => {
	return h("div.container", [
		h("div.editor", each(() => model.blocks, (e, i) => any_widget(e, i))),
		h("iframe", { srcdoc: compiled, width: "98%", height: "98%" })
	])
}

function any_widget(element, index) {
	if (!element) return
	let render_str = return_renderer(renderers[element.type])
	let render = return_renderer(render_str)

	if (typeof render == "function") {
		let c = render(element, index)

		set_model("blocks", index(), produce((el) => {
			el.onkeydown = c.onkeydown
			el.write = c.write
		}))

		let style = mem(() => `
			${element.active ? "box-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.05);" : null}
			 ${element.focus ? "box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.1);transform: scale(1.01)" : null}
		`)

		return () => h("div", { style: style, onmousedown: (e) => set_cursor(index()) }, c.render)
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

	localStorage.setItem("model", JSON.stringify(model))
}

function find_offset_to_parent(el, parent) {
	let found_parent = false
	var curleft = 0, curtop = 0;

	do {
		curleft += el.offsetLeft;
		curtop += el.offsetTop;

		el = el.offsetParent;

		if (el === parent) {
			found_parent = true
		}

	} while (!found_parent && el);

	return [curleft, curtop];
}

function group_widget(element, i) {
	let trash = []

	let [miniStore, setMiniStore] = createStore({
		blocks: [...element.blocks],
	})

	let cursor = sig(-1)
	let cursor_next = () => miniStore.blocks.length > cursor() + 1 ? cursor.set(cursor() + 1) : null
	let cursor_prev = () => cursor() > 0 ? cursor.set(cursor() - 1) : null

	eff_on(cursor, () => {
		batch(() => {
			setMiniStore("blocks", produce((el) => {
				el.forEach((e, ii) => {
					if (ii === cursor()) {
						e.active = true
						let id = "block-" + e.id
						console.log("scrolling to", id)
						let parent = document.querySelector(".editor")
						let el = document.getElementById(id)

						let [x, y] = find_offset_to_parent(el, parent)

						parent?.scrollTo({ behavior: "smooth", top: y - 100 })

					} else {
						e.active = false
					}
				})
			}))
		})
	})

	function save_m(el) {
		let save_queue = miniStore.blocks.map((code) => code.write)
		batch(() =>
			save_queue.forEach((code, i) =>
				"function" == typeof code
					? setMiniStore("blocks", i, produce((el) => code(el)))
					: null)
		)

		let output = miniStore.blocks.map((child) => child.output).join("\n")
		el.output = output
		el.blocks = miniStore.blocks
	}

	let add_widget = (type, state) => {
		trigger_save()
		let id = Math.random().toString(36).substring(7)
		setMiniStore("blocks", produce((g) => {
			if (state) g.push({ id, type, ...state })
			else g.push({ id, type, code: "" })
		}))
	}

	let controller = {
		add_widget: (type, props) => {
			add_widget(type, props)
		}
	}

	let child_widget = (rel, index) => {
		let render_str = renderers[rel.type]
		let render = return_renderer(render_str)

		if (typeof render == "function") {
			let c = render(rel, index, controller)

			setMiniStore("blocks", index(), produce((el) => {
				el.write = c.write
				el.onfocus = c.onfocus
			}))

			let style = mem(() => `
				border: ${rel.active ? "2px solid pink;" : null}
				box-shadow: ${rel.focus ? "0 0 25px 5px rgba(0,0,0,.1);" : null}
				`
			)


			return () => h("div", { id: "block-" + rel.id, style: style, onmousedown: (e) => cursor.set(index) }, c.render)
		}
	}

	let find_foucsed = () => miniStore.blocks.find((el) => el.focus)
	let remove_block = (index) => setMiniStore("blocks", (e) => e.filter((r, i) => i != index))

	let onkeydown = (e) => {
		if (e.key == "Escape") {
			console.log("esc", find_foucsed())
			if (!find_foucsed()) {
				set_model("blocks", i(), "focus", false)
				cursor.set(-1)
			}
			setMiniStore("blocks", (el) => el.focus, "focus", false)
		}

		if (find_foucsed()) {
			return
		}

		if (e.key == "ArrowDown") { cursor_next() }
		if (e.key == "ArrowUp") { cursor_prev() }

		if (e.key == "Enter") {
			setMiniStore("blocks", cursor(), produce((el) => el.focus = true))
			let fn = miniStore.blocks[cursor()]?.onfocus
			if (fn && "function" == typeof fn) fn()
		}

		if (e.key == "Backspace" && e.ctrlKey) {
			remove_block(cursor())
		}

		if (e.key == "t" && e.ctrlKey) {
			add_widget("default")
		}

		if (e.key == "n" && e.ctrlKey) {
			console.log("adding number")
			add_widget("number")
		}

		if (e.key == "k" && e.ctrlKey) {
			add_widget("vect")
		}
	}

	return {
		render: () => h("div.group", each(() => miniStore.blocks, (e, i) => child_widget(e, i))),
		onselect: () => { },
		onediting: () => { },
		onfocus: () => { },
		onkeydown,
		write: (el) => save_m(el)
	}
}


register_renderer("group", group_widget.toString())
register_renderer("default", code_element.toString())
register_renderer("number", number_widget.toString())
register_renderer("block_editor", render_editor.toString())
register_renderer("vect", vector.toString())

function pipe_model(signal, key) {
	eff_on(signal, () => m() ? m()["function" == typeof key ? key() : key] = signal() : null)
}

function register_model(key, signal) {
	let s = sig(signal)
	pipe_model(s, key)
	return s
}


window.onload = () => {
	window.onkeydown = (e) => {
		// happens no matter what
		if (e.key == "Enter" && (e.metaKey == true || e.altKey == true)) {
			console.log("command enter")
			trigger_save()
		}

		// if no elment is in focus
		if (!find_focus()) {
			if (e.key == "Enter") {
				set_model("blocks", model.cursor, "focus", true)
			}
			if (e.key == "ArrowDown") { e.preventDefault(); cursor_next() }
			if (e.key == "ArrowUp") { e.preventDefault(); cursor_prev() }
		}

		// if there is an element active,
		// forward the event to it
		let focused = find_focus()
		if (focused?.onkeydown) { focused.onkeydown(e); return }

	}
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

render(app, document.body);
