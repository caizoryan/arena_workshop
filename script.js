import { render, html, mem, mut, eff_on, mounted, sig, h, For, each, store, produce, when, eff } from "./solid_monke/solid_monke.js";
import { batch, createStore } from "./solid_monke/mini-solid.js";
import { make_code_mirror, vector, code_element, number_widget, render_editor } from "./blocks.js";
import { EditorState, EditorView, basicSetup, javascript, keymap, esLint, lintGutter, linter, Linter, Compartment } from "./codemirror/bundled.js"

let [renderers, set_renderers] = createStore({})

let moodle = (function load() {
	if (localStorage.getItem("model")) {
		return JSON.parse(localStorage.getItem("model"))
	} else {
		return { blocks: [{ type: "group", output: "", blocks: [] },] }
	}
})()


let [model, set_model] = createStore(moodle, {})

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
		h("div.editor", init_editor(model.blocks[0])),
		h("iframe", { srcdoc: compiled, width: "98%", height: "98%" })
	])
}

function init_editor(element) {
	if (!element) return
	let render = return_renderer(renderers.group)
	let control = {
		set_self: (...args) => set_model("blocks", 0, ...args)
	}

	let c = render(element, () => 0, control)

	set_model("blocks", 0, produce((el) => {
		el.onkeydown = c.onkeydown
		el.write = c.write
	}))

	return c.render
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

function group_widget(element, i, control) {
	let trash = []

	let blocks = element.blocks || []
	let [miniStore, setMiniStore] = createStore({ blocks: [...blocks], })

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
						let parent = document.querySelector(".editor")
						let el = document.getElementById(id)

						let [x, y] = find_offset_to_parent(el, parent)

						parent?.scrollTo({ behavior: "smooth", top: y - 100 })

					} else { e.active = false }
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


	let child_widget = (rel, index) => {

		let controller = {
			add_widget: (type, props) => {
				add_widget(type, props)
			},
			set_self: (...args) => {
				let el = miniStore.blocks[index()]
				console.log("setting self", el, args)
				setMiniStore("blocks", index(), ...args)
				console.log(miniStore.blocks[index()])
			}
		}

		let render_str = renderers[rel.type]
		let render = return_renderer(render_str)


		if (typeof render == "function") {
			let c = render(rel, index, controller)

			setMiniStore("blocks", index(), produce((el) => {
				el.write = c.write
				el.onfocus = c.onfocus
				el.onkeydown = c.onkeydown
				el.escape_handler = c.escape_handler
			}))

			let style = mem(() => `
				border: ${rel.active ? "2px solid pink;" : null}
				box-shadow: ${rel.focus ? "0 0 25px 5px rgba(0,0,0,.1);" : null}
				`
			)


			return () => h("div", { id: "block-" + rel.id, style: style, onmousedown: (e) => cursor.set(index) }, c.render)
		}
	}

	let find_focused = () => miniStore.blocks.find((el) => el.focus)
	let remove_block = (index) => setMiniStore("blocks", (e) => e.filter((r, i) => i != index))
	let escape_handler = (e) => {
		if (e.key == "Escape") {
			let focused = find_focused()
			if (focused) {
				// check if focused has an escape handler
				let fn = focused.escape_handler
				if (fn && "function" == typeof fn) { fn(e); return }
				else { setMiniStore("blocks", (el) => el.focus, "focus", false) }
			}
			else {
				control.set_self("focus", false);
				cursor.set(-1)
			}
		}
	}

	let onkeydown = (e) => {
		escape_handler(e)

		if (find_focused()) {
			let fn = find_focused()?.onkeydown
			console.log("focused", find_focused())
			console.log("fn", fn)
			if (fn && "function" == typeof fn) fn(e)
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

		if (e.key == "g" && e.ctrlKey) {
			add_widget("group")
		}
	}

	return {
		render: () => h("div.group", each(() => miniStore.blocks, (e, i) => child_widget(e, i))),
		onselect: () => { },
		onediting: () => { },
		onfocus: () => { },
		onkeydown,
		escape_handler,
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

		model.blocks[0].onkeydown(e)
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
