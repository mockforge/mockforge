//@ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
//@ts-ignore
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    console.log(label);
    if (label === 'json') {
      return new jsonWorker();
    }

    return new editorWorker();
  },
};
