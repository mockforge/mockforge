import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export interface IJSONSchema {
  addFile(path: string, schema: any): void;
  removeFile(path: string): void;
}

class JSONSchema implements IJSONSchema {
  private schemas: { [key: string]: any } = {};

  addFile(filename: string, schema: any) {
    this.schemas[filename] = schema;
    this.update();
  }

  removeFile(filename: string) {
    delete this.schemas[filename];
    this.update();
  }

  private update() {
    const schemas = Object.keys(this.schemas).map((key) => {
      return {
        uri: `${key}.json`,
        schema: this.schemas[key],
        fileMatch: [`${key}.json`],
      };
    });
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: schemas,
    });
  }
}

export const jsonSchemaService = new JSONSchema();
