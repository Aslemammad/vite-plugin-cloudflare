export interface Options {
  debug: boolean;
  minify: boolean;
  sourcemap: boolean;
  wranglerConfigPath: boolean;
  packagePath: boolean;
  envPath: boolean;
}

export interface DevOptions extends Options {
  port: number;
}

export interface BuildOptions extends Options {}
