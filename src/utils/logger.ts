import log from 'loglevel';

log.setLevel('debug');

const logger = {
  debug: (msg: string, ...args: unknown[]) => log.debug(`[DEBUG] ${msg}`, ...args),
  info: (msg: string, ...args: unknown[]) => log.info(`[INFO] ${msg}`, ...args),
  warn: (msg: string, ...args: unknown[]) => log.warn(`[WARN] ${msg}`, ...args),
  error: (msg: string, ...args: unknown[]) => log.error(`[ERROR] ${msg}`, ...args),
};

export default logger;
