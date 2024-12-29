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
		.number-widget [onclick=${(e) => {
			if (e.shiftKey) {
				controller.add_widget("block_editor", {
					source: model.renderers[element.type],
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
	let code = sig(element?.source ? element?.source : "")
	let name = sig(element?.name ? element?.name : "none")

	let save = (el) => {
		el.source = code()
		el.name = name()
		register_renderer(name(), code())
	}

	return ({
		render: () => html`
			div [ class = "editor" ]
				input [ type=text value=${name} oninput=${(e) => name.set(e.target.value)} ]
				textarea [ value=${code} oninput=${(e) => code.set(e.target.value)} ]
			`,
		onselect: () => { },
		onediting: () => { },
		write: save

	})
}


export function code_element(element) {
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
	let save, focus
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
										editor.contentDOM.blur()
										window.getSelection()?.removeAllRanges();
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

				focus = function() {
					editor.focus()
				}

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
		onfocus: () => { console.log("whore"); focus() },
		onselect: () => { },
		onediting: () => { },
		write: (...args) => save(...args)
	})
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
