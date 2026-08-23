const isDev = __DEV__;

export class Logger {
  static debug(tag: string, message: string, ...optionalParams: unknown[]): void {
    if (isDev) {
      console.log(`[DEBUG][${tag}] ${message}`, ...optionalParams);
    }
  }

  static info(tag: string, message: string, ...optionalParams: unknown[]): void {
    console.info(`[INFO][${tag}] ${message}`, ...optionalParams);
  }

  static warn(tag: string, message: string, ...optionalParams: unknown[]): void {
    console.warn(`[WARN][${tag}] ${message}`, ...optionalParams);
  }

  static error(tag: string, message: string, error?: unknown): void {
    console.error(`[ERROR][${tag}] ${message}`, error ?? '');
  }
}
