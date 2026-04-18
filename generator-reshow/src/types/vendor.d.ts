
declare module "yo-unit" {
  export function YoTest(opts: any): Promise<any>;
  export const assert: any;
}

declare module "reshow-constant" {
  export function KEYS(obj: any): string[];
}
