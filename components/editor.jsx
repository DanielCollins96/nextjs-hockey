import React, { useState, useEffect, useRef } from 'react'
import Modal from 'react-modal';

export default function TextEditor ({modalButton = 'Create Post'}) {
  const editorRef = useRef()
  const [editorLoaded, setEditorLoaded] = useState(false)
  const [modalIsOpen,setIsOpen] = useState(false);
  const [text, setText] = useState('') 
  
  function closeModal(){
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const { CKEditor, Editor } = editorRef.current || {}

  useEffect(() => {
    editorRef.current = {
      CKEditor: require('@ckeditor/ckeditor5-react').CKEditor,
      Editor: require('ckeditor5-custom-build/build/ckeditor')
    }
    setEditorLoaded(true)
  }, [])

  const customStyles = {
    content : {
      
      width: 'min(80vw, 500px)',
      top                   : '50%',
      left                  : '50%',
      transform             : 'translate(-50%, -50%)'
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Define your onSubmit function here
    // ...
    console.log(e)
    console.log(text)
  };

  return editorLoaded ? (
    <div>
        <button onClick={openModal}>{modalButton}</button>
        <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <button onClick={closeModal}>close</button>
        <form onSubmit={handleSubmit}>
          <CKEditor
          editor={Editor}
          config={{toolbar: [ 'bold', 'italic','link', 'undo', 'redo', 'numberedList', 'bulletedList', 'imageUpload' ]}}
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
      </Modal>
    </div>
  ) : (
    <div>Editor loading</div>
  )
}
