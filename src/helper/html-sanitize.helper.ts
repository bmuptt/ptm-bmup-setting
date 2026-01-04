import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

export const sanitizeHtml = (dirty: string) => DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });

