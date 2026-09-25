import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

/** No-op locally if the DSN isn't set, rather than failing dev builds without it. */
if (dsn) {
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    tracesSampleRate: 1.0,
  });
}

export { Sentry };
