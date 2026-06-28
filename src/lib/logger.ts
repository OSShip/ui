import * as Sentry from '@sentry/nextjs';

type Fields = Record<string, unknown>;

function emit(level: 'debug' | 'info' | 'warn' | 'error', message: string, fields?: Fields) {
  const consoleFn = console[level] ?? console.log;
  if (fields) {
    consoleFn(message, fields);
  } else {
    consoleFn(message);
  }

  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  const sentryLogger = Sentry.logger;
  if (!sentryLogger) return;

  if (fields) {
    sentryLogger[level](message, fields);
  } else {
    sentryLogger[level](message);
  }
}

export const logger = {
  debug: (message: string, fields?: Fields) => emit('debug', message, fields),
  info: (message: string, fields?: Fields) => emit('info', message, fields),
  warn: (message: string, fields?: Fields) => emit('warn', message, fields),
  error: (message: string, fields?: Fields) => emit('error', message, fields),
};
