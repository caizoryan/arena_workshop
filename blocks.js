import { EditorState, EditorView, basicSetup, javascript, keymap, esLint, lintGutter, linter, Linter, Compartment } from "./codemirror/bundled.js"
import { html, mem, mounted, sig, } from "./solid_monke/solid_monke.js";

export function number_widget(element, i, controller) {
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
		  
		  display: grid;
			grid-template-columns: 1fr 1fr;
		}

		.number-widget input[type="text"] { margin: 0 .1em; }

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
		.number-widget [onclick=${(e) => {
			if (e.shiftKey) {
				controller.add_widget("block_editor", {
					source: renderers[element.type],
					name: element.type
				})
			}
		}}]
			.values
				span -- M.
				input [ type=text oninput = ${(e) => { name.set(e.target.value); }} value=${element.name} ]
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

export function render_editor(element) {
	let code = mem(() => element?.source ? element?.source : "")
	let name = sig(element?.name ? element?.name : "none")
	let uid = Math.random().toString(36).substring(7)

	let focus, save;

	return ({
		render: () => {

			mounted(() => {
				let editor = make_code_mirror(code(), uid)
				focus = () => setTimeout(() => editor.focus(), 100)

				save = function(el) {
					el.focused = editor.hasFocus
					let text = recursive_fucking_children(editor.state.doc).join("\n");
					el.cursor = editor.state.selection.ranges[0].from

					el.source = text
					el.name = name()
					register_renderer(name(), text)
				}

				setTimeout(() => {
					if (element.cursor && element.focused) {
						editor.focus()
						editor.dispatch({ selection: { anchor: element.cursor, head: element.cursor } })
					}
				}, 10)
			})

			return html`
			div [ class = "editor" ]
				input [ type=text value=${name} oninput=${(e) => name.set(e.target.value)} ]
				div [ class = ${"editor-" + uid} ]
			`},

		onfocus: () => focus(),
		onselect: () => { },
		onediting: () => { },
		write: (...args) => save(...args)

	})
}


export function code_element(element) {

	let code = mem(() => element?.output ? element?.output : "")
	let uid = Math.random().toString(36).substring(7)
	let save, focus

	return ({
		render: () => {
			mounted(() => {
				let editor = make_code_mirror(code(), uid)
				focus = () => setTimeout(() => editor.focus(), 100)

				save = function(el) {
					el.focused = editor.hasFocus
					let text = recursive_fucking_children(editor.state.doc).join("\n");
					el.output = text
					el.cursor = editor.state.selection.ranges[0].from
				}

				setTimeout(() => {
					if (element.cursor && element.focused) {
						editor.focus()
						editor.dispatch({ selection: { anchor: element.cursor, head: element.cursor } })
					}
				}, 10)
			})
			return html`div [ class = ${"editor-" + uid} ]`
		},
		onfocus: () => focus(),
		onselect: () => { },
		onediting: () => { },
		write: (...args) => save(...args)
	})
}


export function make_code_mirror(code, id) {
	let editor = new EditorView({
		parent: document.querySelector(".editor-" + id),
		state: EditorState.create({
			doc: code,
			extensions: [
				basicSetup,
				javascript(),
				linter(esLint(new Linter())),
				lintGutter(),

				keymap.of([
					{
						key: "Escape", run: () => {
							editor.contentDOM.blur()
							window.getSelection()?.removeAllRanges();
						},

					},
				])
			]
		})
	})

	return editor

}

export function vector(e) {
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

