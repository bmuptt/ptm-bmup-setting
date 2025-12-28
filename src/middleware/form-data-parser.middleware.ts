
import { Request, Response, NextFunction } from 'express';
import qs from 'qs';

/**
 * Middleware to parse nested multipart/form-data keys
 * and map files to the body structure
 */
export const parseMultipartFormData = (req: Request, res: Response, next: NextFunction) => {
  // Only process if body exists and is likely from multer (flat keys)
  if (!req.body || typeof req.body !== 'object') {
    return next();
  }

  // Parse nested keys in req.body using qs
  // qs handles 'sections[0][page_key]' -> { sections: [ { page_key: '...' } ] }
  // We explicitly cast to unknown then stringify/parse to handle [Object: null prototype]
  // or just use qs.parse on the raw keys if needed, but req.body is already an object.
  // Multer populates req.body with flat keys if they contain brackets? 
  // No, Multer usually populates req.body with exactly what was sent. 
  // If the client sends "sections[0][page_key]", req.body['sections[0][page_key]'] exists.
  
  // We need to reconstruct the body string to parse it with qs, OR iterate keys.
  // Simpler: qs.parse(req.body) might not work if keys are already properties.
  // Actually qs.parse() usually takes a query string.
  // But if we have an object { "a[b]": "c" }, we want { a: { b: "c" } }.
  // We can convert the object back to a query string and parse it, or iterate keys.
  
  // However, a better approach for form-data with bracket notation:
  // Iterate over keys of req.body.
  
  const newBody: Record<string, unknown> = {};
  
  // Helper to set value at path (supports bracket notation)
  const setPath = (obj: Record<string, unknown>, path: string, value: unknown) => {
    // Convert "sections[0][items][1][key]" to ["sections", "0", "items", "1", "key"]
    // Regex matches "word" or "[word]"
    const parts = path.split(/\[|\]/).filter(p => p !== '');
    
    let current: Record<string, unknown> = obj;
    for (let i = 0; i < parts.length; i++) {
      const key = parts[i];
      if (!key) continue;

      const isLast = i === parts.length - 1;
      
      if (isLast) {
        current[key] = value;
      } else {
        const nextKey = parts[i + 1];
        // If next key is a number, we probably want an array
        const isNextNumber = !isNaN(Number(nextKey));
        
        if (!current[key]) {
          current[key] = isNextNumber ? [] : {};
        }
        
        current = current[key] as Record<string, unknown>;
      }
    }
  };

  // 1. Process text fields
  Object.keys(req.body).forEach(key => {
    setPath(newBody, key, req.body[key]);
  });
  
  // 2. Process files
  if (Array.isArray(req.files)) {
    (req.files as Express.Multer.File[]).forEach(file => {
      // If fieldname has brackets, map it
      if (file.fieldname.includes('[')) {
        // Map file to the structure
        // We'll store the file object itself at the path
        // e.g. sections[0][items][0][image_file] = file
        // BUT the user sends field name as "sections[0][items][0][image]"
        // So we set that property to the file.
        setPath(newBody, file.fieldname, file);
      }
    });
  } else if (req.files && typeof req.files === 'object') {
     // Handle map of files if needed (uploadFields) - but we use uploadAny or array usually
     // Current implementation uses uploadAnyImages() which produces array
     Object.keys(req.files).forEach(key => {
        const fileList = (req.files as Record<string, Express.Multer.File[]>)[key];
        if (fileList) {
          fileList.forEach(file => {
             setPath(newBody, file.fieldname, file);
          });
        }
     });
  }

  // If we successfully parsed something, replace req.body
  if (Object.keys(newBody).length > 0) {
    req.body = newBody;
  }

  next();
};
