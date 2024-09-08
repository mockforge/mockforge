import * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import { jsonSchemaService } from '../service/jsonSchema';

interface JSONEditorProps {
  schema?: any;
  value?: string;
  onChange?: (value: string) => void;
}

export function JSONEditor({ value, onChange, schema }: JSONEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const randomName = `${Math.random()}`;
      const testModel = monaco.editor.createModel(
        value || '',
        'json',
        monaco.Uri.parse(`internal://server/${randomName}.json`)
      );
      jsonSchemaService.addFile(randomName, schema);
      const editor = monaco.editor.create(containerRef.current, {
        model: testModel,
        automaticLayout: true,
        theme: 'vs-light',
      });
      editor.onDidChangeModelContent(() => {
        if (onChange) {
          onChange(editor.getValue());
        }
      });
      editorRef.current = editor;
      return () => {
        editor.dispose();
        jsonSchemaService.removeFile(randomName);
      };
    }
  }, []);

  return <div ref={containerRef} style={{ height: 200 }} />;
}
