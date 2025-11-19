import { z } from 'zod';

// Schema for core update validation
export const updateCoreSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  status_file: z.enum(['0', '1']).optional(),
});

// Schema for status_file validation
export const statusFileSchema = z.object({
  status_file: z.enum(['0', '1']),
});

// Validation function for core update
export const validateCoreUpdate = (data: any) => {
  const errors: string[] = [];

  // Validate status_file
  if (data.status_file && !['0', '1'].includes(data.status_file)) {
    errors.push('The status_file must be 0 or 1!');
  }

  // Validate field types
  if (data.name && typeof data.name !== 'string') {
    errors.push('The name must be a string!');
  }

  if (data.description && typeof data.description !== 'string') {
    errors.push('The description must be a string!');
  }

  if (data.address && typeof data.address !== 'string') {
    errors.push('The address must be a string!');
  }

  if (data.primary_color && typeof data.primary_color !== 'string') {
    errors.push('The primary color must be a string!');
  }

  if (data.secondary_color && typeof data.secondary_color !== 'string') {
    errors.push('The secondary color must be a string!');
  }

  // WYSIWYG Content Security Validation
  if (data.description) {
    const wysiwygErrors = validateWysiwygContent(data.description);
    errors.push(...wysiwygErrors);
  }

  return errors;
};

// WYSIWYG Content Security Validation - Whitelist Approach
export const validateWysiwygContent = (content: string): string[] => {
  const errors: string[] = [];

  // Check if content is valid string
  if (!content || typeof content !== 'string') {
    return errors; // Invalid content type, skip validation
  }

  if (content.trim() === '') {
    return errors; // Empty content is valid
  }

  // Check content length (prevent DoS)
  if (content.length > 50000) { // 50KB limit
    errors.push('The description is too long! Maximum 50,000 characters allowed.');
    return errors;
  }

  // If content doesn't contain HTML tags, it's valid
  if (!/<[^>]+>/.test(content)) {
    return errors;
  }

  // Define allowed HTML tags (whitelist approach)
  const allowedTags = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img'
  ];

  // Define allowed attributes
  const allowedAttributes = {
    style: ['color', 'background-color', 'font-size', 'font-weight', 'text-align', 'text-decoration'],
    href: [],
    src: [],
    alt: [],
    title: [],
    class: [],
    id: []
  };

  // Check for disallowed tags
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/gi;
  let match;
  const foundTags = new Set<string>();

  while ((match = tagRegex.exec(content)) !== null) {
    const tagName = match[1]?.toLowerCase();
    if (tagName) {
      foundTags.add(tagName);
    }
  }

  const disallowedTags = Array.from(foundTags).filter(tag => !allowedTags.includes(tag));
  if (disallowedTags.length > 0) {
    errors.push(`The description contains disallowed HTML tags: ${disallowedTags.join(', ')}. Only basic formatting tags are allowed.`);
  }

  // Check for dangerous patterns (additional security)
  const dangerousPatterns = [
    { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, message: 'Script tags are not allowed!' },
    { pattern: /javascript:/gi, message: 'JavaScript URLs are not allowed!' },
    { pattern: /on\w+\s*=/gi, message: 'Event handlers are not allowed!' },
    { pattern: /data:\s*text\/html/gi, message: 'Data URLs are not allowed!' },
    { pattern: /<iframe\b/gi, message: 'Iframe tags are not allowed!' },
    { pattern: /<object\b/gi, message: 'Object tags are not allowed!' },
    { pattern: /<embed\b/gi, message: 'Embed tags are not allowed!' },
    { pattern: /<form\b/gi, message: 'Form tags are not allowed!' },
    { pattern: /<input\b/gi, message: 'Input tags are not allowed!' },
    { pattern: /<button\b/gi, message: 'Button tags are not allowed!' }
  ];

  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(content)) {
      errors.push(message);
    }
  }

  // Validate attributes for allowed tags
  const attributeRegex = /(\w+)\s*=\s*["']([^"']*)["']/gi;
  const foundAttributes = new Set<string>();

  while ((match = attributeRegex.exec(content)) !== null) {
    const attrName = match[1]?.toLowerCase();
    if (attrName) {
      foundAttributes.add(attrName);
    }
  }

  const disallowedAttributes = Array.from(foundAttributes).filter(attr => !allowedAttributes.hasOwnProperty(attr));
  if (disallowedAttributes.length > 0) {
    errors.push(`The description contains disallowed attributes: ${disallowedAttributes.join(', ')}. Only basic formatting attributes are allowed.`);
  }

  // Validate href and src attributes for safe URLs
  const hrefRegex = /href\s*=\s*["']([^"']*)["']/gi;
  while ((match = hrefRegex.exec(content)) !== null) {
    const url = match[1];
    if (url && !isValidUrl(url)) {
      errors.push(`Invalid URL in href attribute: ${url}. Only http, https, mailto, and relative URLs are allowed.`);
    }
  }

  const srcRegex = /src\s*=\s*["']([^"']*)["']/gi;
  while ((match = srcRegex.exec(content)) !== null) {
    const url = match[1];
    if (url && !isValidUrl(url)) {
      errors.push(`Invalid URL in src attribute: ${url}. Only http, https, and relative URLs are allowed.`);
    }
  }

  return errors;
};

// Helper function to validate URLs
const isValidUrl = (url: string): boolean => {
  // Allow relative URLs
  if (url.startsWith('/')) {
    return true;
  }
  
  // Allow http/https URLs
  if (/^https?:\/\//.test(url)) {
    return true;
  }
  
  // Allow mailto URLs (only for href)
  if (url.startsWith('mailto:')) {
    return true;
  }
  
  return false;
};

// Multer error handling middleware
export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ errors: ['File too large!'] });
    }
    if (err.message === 'Only image files are allowed!') {
      return res.status(400).json({ errors: ['Only image files are allowed!'] });
    }
    return res.status(400).json({ errors: [err.message] });
  }
  next();
};

// Validation middleware function
export const validateCoreUpdateMiddleware = (req: any, res: any, next: any) => {
  const errors = validateCoreUpdate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

export default {
  updateCoreSchema,
  statusFileSchema,
  validateCoreUpdate,
  validateWysiwygContent,
  handleMulterError,
  validateCoreUpdateMiddleware,
};
