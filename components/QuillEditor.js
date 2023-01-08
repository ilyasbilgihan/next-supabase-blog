import dynamic from 'next/dynamic';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

import 'react-quill/dist/quill.bubble.css';

const QuillNoSSRWrapper = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');

    return function forwardRef({ forwardedRef, ...props }) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  },
);

const modules = {
  syntax: { highlight: (text) => hljs.highlightAuto(text).value },
  toolbar: [
    [{ header: [2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'], // toggled buttons
    ['blockquote', 'code'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
    /* [{ indent: '-1' }, { indent: '+1' }], // outdent/indent */
    ['link', 'image', 'video', 'code-block'],
    ['clean' /*'formula'*/], // remove formatting button
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};
/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'code',
  'list',
  'bullet',
  'script',
  'link',
  'image',
  'video',
  'code-block',
  'clean',
];

export default function QuillEditor({ quillContent, setQuillContent, ...props }) {
  function handleChange(content, delta, source, editor) {
    setQuillContent(editor.getContents());
  }

  return (
    <div>
      <QuillNoSSRWrapper
        {...props}
        modules={modules}
        formats={formats}
        placeholder="Type something and select your text to format."
        theme="bubble"
        onChange={handleChange}
      />
    </div>
  );
}
