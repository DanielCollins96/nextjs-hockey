import React, { useState, useEffect, useRef } from 'react'
// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown';
// import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown';
// const Markdown = require('@ckeditor/ckeditor5-markdown-gfm/src/markdown')

export default function TextEditor () {
  const editorRef = useRef()
  const [editorLoaded, setEditorLoaded] = useState(false)
  const { CKEditor, ClassicEditor } = editorRef.current || {}
  const [text, setText] = useState('') 

  useEffect(() => {
    editorRef.current = {
      CKEditor: require('@ckeditor/ckeditor5-react').CKEditor,
      ClassicEditor: require('@ckeditor/ckeditor5-build-classic'),
      Markdown: require('@ckeditor/ckeditor5-markdown-gfm/src/markdown')
    }
    setEditorLoaded(true)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault();
    // Define your onSubmit function here
    // ...
    console.log(e)
    console.log(text)
  };

  return editorLoaded ? (
      <form onSubmit={handleSubmit}>
        <CKEditor
        editor={ClassicEditor}
        config={{toolbar: [ 'bold', 'italic' ]}}
        onInit={editor => {
          // You can store the "editor" and use when it is needed.
          console.log('Editor is ready to use!', editor)
        }}
        onChange={(event, editor) => {
          const data = editor.getData()
          console.log({ event, editor, data })
          setText(data)
        }}
        />
        <button type="submit">Submit</button>
      </form>
  ) : (
    <div>Editor loading</div>
  )
}
