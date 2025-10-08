import apm from 'elastic-apm-node';
import { config } from './environment';

let apmAgent: any = null;

// Skip APM in testing environment
if (config.NODE_ENV === 'testing') {
  console.log('🚫 APM disabled in testing environment');
} else {
  // Initialize APM
  apmAgent = apm.start({
    serviceName: 'ptm-bmup-setting',
    serverUrl: config.APM_SERVER_URL,
    environment: config.NODE_ENV,
    active: true,
    captureBody: 'all',
    captureHeaders: true,
    captureExceptions: true,
    captureSpanStackTraces: true,
    transactionSampleRate: 1.0,
    logLevel: 'info',
  });

  // Log APM status
  if (apmAgent.isStarted()) {
    console.log('✅ APM Agent started successfully');
    console.log(`📊 APM Server: ${config.APM_SERVER_URL}`);
    console.log(`🌍 Environment: ${config.NODE_ENV}`);
  } else {
    console.log('⚠️ APM Agent not started (no secret token or disabled)');
  }
}

export default apmAgent;
