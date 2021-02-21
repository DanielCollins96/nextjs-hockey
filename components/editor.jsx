import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const TextEditor = () => {
    const [value, setValue] = useState('')


    return (
        <div>
            <CKEditor
              editor={ ClassicEditor }
              data="<p>Hello from CKEditor 5!</p>"
              onReady={ editor => {
                  // You can store the "editor" and use when it is needed.
                  console.log( 'Editor is ready to use!', editor );
              } }
              onChange={ ( event, editor ) => {
                  const data = editor.getData();
                  console.log( { event, editor, data } );
              } }
              onBlur={ ( event, editor ) => {
                  console.log( 'Blur.', editor );
              } }
              onFocus={ ( event, editor ) => {
                  console.log( 'Focus.', editor );
              } }
            />
        </div>
      )
}

const Toolbar = () => {
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

