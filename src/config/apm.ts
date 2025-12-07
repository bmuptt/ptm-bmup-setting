import apm from 'elastic-apm-node';
import { config } from './environment';

let apmAgent: any = null;

const isTestEnv = config.NODE_ENV === 'testing' || config.NODE_ENV === 'test';

if (!isTestEnv && config.APP_APM_ACTIVE && config.APM_API_KEY_SETTING) {
  apmAgent = apm.start({
    serviceName: 'ptm-bmup-setting',
    apiKey: config.APM_API_KEY_SETTING,
    serverUrl: config.APM_SERVER_URL,
    environment: config.NODE_ENV,
    logLevel: 'info',
    captureBody: 'all',
    captureHeaders: true,
    captureExceptions: true,
    captureSpanStackTraces: true,
    transactionSampleRate: 1.0,
  });
}

export default apmAgent;
