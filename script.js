import { render, html, mem, mut, eff_on, mounted, sig, h, For, each, store, produce, when, eff, p } from "./solid_monke/solid_monke.js";
import { batch, createStore } from "./solid_monke/mini-solid.js";
import { make_code_mirror, vector, code_element, number_widget, render_editor } from "./blocks.js";
import { EditorState, EditorView, basicSetup, javascript, keymap, esLint, lintGutter, linter, Linter, Compartment, syntaxHighlighting, HighlightStyle, t } from "./codemirror/bundled.js"
import {
	autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap,
	searchKeymap, highlightSelectionMatches,
	defaultKeymap, history, historyKeymap,
	highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
	rectangularSelection, crosshairCursor,
	lineNumbers, highlightActiveLineGutter,
	defaultHighlightStyle, indentOnInput, bracketMatching,
	foldGutter, foldKeymap,
} from "./codemirror/bundled.js"

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
* @returns {(element: any, index:any, controller:any ) => Renderer }
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

	set_model("blocks", 0, produce((el) => { el.onkeydown = c.onkeydown; el.write = c.write }))
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

function is_scrollable(el) {
	return el.scrollHeight > el.clientHeight
}
function find_offset_to_parent(el, parent) {
	return [(el.offsetLeft - parent.offsetLeft), (el.offsetTop - parent.offsetTop)];
}

function group_widget(element, i, control) {
	let buffer
	let blocks = element.blocks || []
	let [miniStore, setMiniStore] = createStore({ blocks: [...blocks], })

	let cursor = sig(-1)
	let cursor_next = () => miniStore.blocks.length > cursor() + 1 ? cursor.set(cursor() + 1) : cursor.set(0)
	let cursor_prev = () => cursor() > 0 ? cursor.set(cursor() - 1) : cursor.set(miniStore.blocks.length - 1)

	let move_child = (index, direction) => {
		setMiniStore("blocks", produce((el) => {
			if (!el[index + direction] || !el[index]) return
			let temp = el[index]
			el[index] = el[index + direction]
			el[index + direction] = temp
		}))
	}
	function isElementInViewport(el, parent) {
		var rect = el.getBoundingClientRect();

		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
			rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
		);
	}

	function get_scrollabe_parent(el) {
		console.log("el", el, "parent", el.parentElement)
		let found_parent = false
		let element = el

		do {
			element = element.parentElement

			if (element.scrollHeight > element.clientHeight) {
				found_parent = true
			}

		} while (!found_parent && element);

		console.log("scrollable parent", element)
		return element
	}
	eff_on(cursor, () => {
		batch(() => {
			setMiniStore("blocks", produce((el) => {
				el.forEach((e, ii) => {
					if (ii === cursor()) {
						e.active = true
						let id = "block-" + e.id

						let el = document.getElementById(id)
						let parent = get_scrollabe_parent(el)
						let [x, y] = find_offset_to_parent(el, parent)

						parent.scrollTo({ top: y - 50, behavior: "smooth" })

					} else { e.active = false }
				})
			}))
		})
	})


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
			add_widget: (type, props) => add_widget(type, props),
			set_self: (...args) => setMiniStore("blocks", index(), ...args)
		}

		let render_str = renderers[rel.type]
		let render = return_renderer(render_str)

		if (typeof render == "function") {
			let c = render(rel, index, controller)

			setMiniStore("blocks", index(), produce((el) => {
				el.write = c.write
				el.onfocus = c.onfocus
				el.onkeydown = c.onkeydown
				el.onunfocus = c.onunfocus
				el.escape = c.escape
				el.toggle_fold = c.toggle_fold
			}))

			let style = mem(() => `
				border: ${rel.active && !rel.focus ? "1px solid grey" : null};
				box-shadow: ${rel.focus ? "0 0 25px 5px rgba(0,0,0,.1)" : null};
				`
			)

			return () => h("div.child", {
				id: "block-" + rel.id, style: style, onmousedown: (e) => {

					cursor.set(index)
					batch(() => {
						setMiniStore("blocks", (el) => el.focus, "focus", false)
						setMiniStore("blocks", index, produce((el) => el.focus = true))
					})

				}
			}, c.render)
		}
	}

	let find_focused = mem(() => miniStore.blocks.find((el) => el.focus))
	let find_active = () => miniStore.blocks.find((el) => el.active)
	let remove_block = (index) => setMiniStore("blocks", (e) => e.filter((r, i) => i != index))
	// TODO: fix this, it's disabling child and its children.
	let escape = (e) => {
		if (e.key == "Escape") {
			let focused = find_focused()
			if (focused) {
				// check if focused has an escape handler
				let fn = focused.escape
				if (fn && "function" == typeof fn) { fn(e); return }
				else {
					let block = miniStore.blocks.find((el) => el.focus)
					console.log("block to unfocus", block)
					setMiniStore("blocks", (el) => el.focus, "focus", false)
					if (block.onunfocus) { block.onunfocus() }
				}
			}
			else {
				control.set_self("focus", false);
				onunfocus()
			}
		}
	}

	function save(el) {
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
		el.fold = fold()
	}

	let onunfocus = () => {
		setMiniStore("blocks", (el) => el.focus, "focus", false)
		setMiniStore("blocks", (el) => el.active, "active", false)
		cursor.set(-1)
	}


	let onkeydown = (e) => {
		escape(e)

		if (find_focused()) {
			let fn = find_focused()?.onkeydown
			if (fn && "function" == typeof fn) fn(e)
			return
		}


		if (!fold()) {
			if (e.key == "y") {
				let active = find_active()
				if (active) {
					let copy = JSON.parse(JSON.stringify(active))
					copy.id = Math.random().toString(36).substring(7)
					//
					// TODO: Make this recursive
					if (copy.blocks) {
						copy.blocks = copy.blocks.map((el) => {
							el.id = Math.random().toString(36).substring(7)
							return el
						})
					}
					buffer = copy
				}
			}

			if (e.key == "p") {
				if (!buffer) return
				setMiniStore("blocks", produce((el) => el.push(buffer)))
			}

			if (e.key == "F") {
				let active = find_active()
				if (active) {
					let fn = active.toggle_fold
					if (fn && "function" == typeof fn) fn()
				}
			}

			if (e.key == "ArrowDown") {
				if (e.altKey == true && e.shiftKey == true) move_child(cursor(), 1)
				cursor_next()
			}

			if (e.key == "ArrowUp") {
				if (e.altKey == true && e.shiftKey == true) move_child(cursor(), -1)
				cursor_prev()
			}


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
				add_widget("number")
			}

			if (e.key == "k" && e.ctrlKey) {
				add_widget("vect")
			}

			if (e.key == "g" && e.ctrlKey) {
				add_widget("group")
			}
		}
	}

	let fold = sig(element.fold || false)
	let toggle_fold = () => fold.set(!fold())
	let show_which = mem(() => fold()
		? null
		: each(() => miniStore.blocks, (e, i) => child_widget(e, i)))

	let fold_string = mem(() => fold() ? "▶︎" : "▼")

	return {
		render: () => h("div.group", h("p", { onclick: toggle_fold },
			h("span.fold", fold_string)), show_which),
		onselect: () => { },
		onfocus: () => {
			if (fold()) toggle_fold()
			cursor.set(0)
		},
		onkeydown,
		escape,
		write: (el) => save(el),
		toggle_fold,
		onunfocus,
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

		if (e.key == "ArrowDown" || e.key == "ArrowUp") {
			e.preventDefault()
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


const createTheme = ({ variant, settings, styles }) => {
	const theme = EditorView.theme(
		{
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'&': {
				backgroundColor: settings.background,
				color: settings.foreground,
			},
			'.cm-editor.cm-focused': {
				outline: "none",
			},
			'.cm-content': {
				caretColor: settings.caret,
			},
			'.cm-cursor, .cm-dropCursor': {
				borderLeft: "2px solid" + settings.caret,
			},
			'&.cm-focused .cm-selectionBackgroundm .cm-selectionBackground, .cm-content ::selection':
			{
				backgroundColor: settings.selection,
			},
			'.cm-activeLine': {
				backgroundColor: settings.lineHighlight,
			},
			'.cm-gutters': {
				backgroundColor: settings.gutterBackground,
				color: settings.gutterForeground,
			},
			'.cm-activeLineGutter': {
				backgroundColor: settings.lineHighlight,
			},
		},
		{
			dark: variant === 'dark',
		},
	);

	const highlightStyle = HighlightStyle.define(styles);
	const extension = [theme, syntaxHighlighting(highlightStyle)];

	return extension;
};

// Author: Zeno Rocha
export const dracula = createTheme({
	variant: 'light',
	settings: {
		background: '#f9f9f911',
		foreground: '#5c6166',
		caret: '#ffaa33',
		selection: '#036dd626',
		gutterBackground: '#fcfcfc',
		gutterForeground: '#8a919966',
		lineHighlight: '#8a91991a',
	},
	styles: [
		{
			tag: t.comment,
			color: '#787b8099',
		},
		{
			tag: t.string,
			color: '#86b300',
		},
		{
			tag: t.regexp,
			color: '#4cbf99',
		},
		{
			tag: [t.number, t.bool, t.null],
			color: '#ffaa33',
		},
		{
			tag: t.variableName,
			color: '#5c6166',
		},
		{
			tag: [t.definitionKeyword, t.modifier],
			color: '#fa8d3e',
		},
		{
			tag: [t.keyword, t.special(t.brace)],
			color: '#fa8d3e',
		},
		{
			tag: t.operator,
			color: '#ed9366',
		},
		{
			tag: t.separator,
			color: '#5c6166b3',
		},
		{
			tag: t.punctuation,
			color: '#5c6166',
		},
		{
			tag: [t.definition(t.propertyName), t.function(t.variableName)],
			color: '#f2ae49',
		},
		{
			tag: [t.className, t.definition(t.typeName)],
			color: '#22a4e6',
		},
		{
			tag: [t.tagName, t.typeName, t.self, t.labelName],
			color: '#55b4d4',
		},
		{
			tag: t.angleBracket,
			color: '#55b4d480',
		},
		{
			tag: t.attributeName,
			color: '#f2ae49',
		},
	],
});

render(app, document.body);

// setTimeout(() => {
// 	$(".editor").draggable()
// }, 1000)
