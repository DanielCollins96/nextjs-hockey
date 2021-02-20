import React, { useEffect, useMemo, useState } from 'react'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'

const Editor = () => {
    const initialState = [{type: 'paragraph', children: [{ text: "edit me"}]}]
    const editor = useMemo(() => withReact(createEditor()), [])
    const [value, setValue] = useState(initialState)

    return (
        <Slate
          editor={editor}
          value={value}
          onChange={newValue => setValue(newValue)}
        >
          <Editable />
        </Slate>
      )
}

export default Editor;

