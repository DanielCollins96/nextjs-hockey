import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { createEditor, Editor, Transforms } from 'slate'
import { Slate, Editable, withReact, useSlate } from 'slate-react'

const TextEditor = () => {
    const initialState = [{type: 'paragraph', children: [{ text: ""}]}]
    const editor = useMemo(() => withReact(createEditor()), [])
    const [value, setValue] = useState(initialState)
    const renderElement = useCallback(({ attributes, children, element }) => {
      switch (element.type) {
        case 'quote':
          return <blockquote {...attributes}>{children}</blockquote>
        case 'link':
          return (
            <a {...attributes} href={element.url}>
              {children}
            </a>
          )
        case 'bold':
          return (
            <strong {...attributes}>{children}</strong>
          )
        default:
          return <p {...attributes}>{children}</p>
      }
    }, [])

    return (
        <Slate
          editor={editor}
          value={value}
          onChange={newValue => setValue(newValue)}
        >
          <Toolbar />
          <Editable 
            placeholder="Enter some plain text..."
            renderElement={renderElement}
            onKeyDown={e => {
              if (!event.ctrlKey) {
                return
              }
              if (e.key ===  'b') {
                e.preventDefault();
                // console.log(editor);  
                const { selection } = editor
                const [match] = Editor.nodes(editor, {
                  match: n => n.type === 'code',
                })  
                Transforms.setNodes(
                  editor,
                  { type: match ? 'paragraph' : 'bold' },
                  { match: n => Editor.isBlock(editor, n) }
                )    
                console.log(`Big L: ${JSON.stringify(Editor)}`)        
              }
              // console.log(e)
            }}
          />
        </Slate>
      )
}

const Toolbar = () => {
  const editor = useSlate()
  return (
    <div>
      {/* <button active={isBoldActive(editor)}>B</button> */}
      <button>B</button>
      {/* <button active={isItalicActive(editor)}>I</button> */}
      <button>I</button>
    </div>
  )
}

export default TextEditor;

