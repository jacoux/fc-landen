export async function loadEditorJS() {
  if (typeof window !== 'undefined') {
    const EditorJS = (await import('@editorjs/editorjs')).default;
    return EditorJS;
  } else {
    return null;
  }
}
