/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import './style.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Editor } from '@tinymce/tinymce-react';
import { useSelectionContext } from '@app/providers/SelectionContext';

const TextEditor = ({
  disable,
  detailData,
  onChange,
  docId,
  cardViewList,
  isAvatar
}) => {
  const editorRef = useRef(null);
  const [editorState, setEditorState] = useState();
  const { setFocusFirstAction } = useSelectionContext();
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (detailData?.length > 0) {
      setEditorState(detailData);
    } else {
      setEditorState('');
    }
  }, [detailData, docId]);

  useEffect(() => {
    setFocused(false);
  }, [docId]);

  const handleKeyDown = (e, change) => {
    if (e.keyCode === 9) {
      if (!cardViewList) {
        setFocusFirstAction(true);
        e.preventDefault();
      }
    }
  };

  return (
    <React.Fragment>
      <Editor
        onInit={(evt, editor) => {
          editorRef.current = editor;
          var id = editor.id;
          document.getElementById(id + '_ifr').style.height = '100%';
        }}
        value={detailData ? detailData : ''}
        outputFormat="text"
        apiKey="crjb9x5md7zatipz04e0sdd9helhucrsz3o32n7go9bxsroi"
        init={{
          height: '100%',
          width: '100%',
          menubar: false,
          readonly: disable ? 1 : 0,
          plugins: [
            // 'link',
            // 'advlist autolink lists link image',
            'charmap print preview anchor help',
            'searchreplace visualblocks code',
            'insertdatetime media table paste wordcount',
            // 'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount',
            'lists'
          ],
          toolbar:
            'undo redo | formatselect | fontselect | fontsizeselect | \
              bold italic underline strikethrough monospace superscript subscript forecolor backcolor | \
            alignleft aligncenter alignright alignjustify| \
            bullist numlist outdent indent | removeformat | help | charmap',
          content_style:
            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        }}
        onKeyDown={handleKeyDown}
        onEditorChange={(value, editor) => {
          const content = editor.getContent();
          if (editorState !== content && focused) {
            onChange(content);
          }
        }}
        onFocus={() => {
          setFocused(true);
          console.log('onFocusIn');
        }}
        onBlur={() => {
          setFocused(false);
          console.log('onFocusOut');
        }}
      />
    </React.Fragment>
  );
};

export default TextEditor;
