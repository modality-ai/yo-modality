class YoGenerator {
  options: Record<string, any> = {};
  env: { options: Record<string, any> } = { options: {} };
  payload: Record<string, any> = {};
  mainName: string = "";

  prompt(_prompts: any[]): Promise<any> { return Promise.resolve({}); }
  destinationPath(_path: string): string { return _path; }
  destinationRoot(_path?: string): string { return _path ?? ""; }
  templatePath(_path: string): string { return _path; }
  readDestinationJSON(_path: string): any { return {}; }
  writeDestinationJSON(_path: string, _content: any): void {}
  composeWith(_path: string, _options?: Record<string, any>): void {}
  spawnCommand(_cmd: string, _args: string[]): Promise<void> { return Promise.resolve(); }
  log(..._args: any[]): void {}
  on(_event: string, _listener: (...args: any[]) => void): this { return this; }
  fs: {
    copy(from: string, to: string): void;
    copyTpl(from: string, to: string, context: any): void;
  } = {
    copy: () => {},
    copyTpl: () => {},
  };
}

// Export real yeoman-generator at runtime, typed as our class
import _YoGenerator from "yeoman-generator";
export default _YoGenerator as unknown as typeof YoGenerator;
