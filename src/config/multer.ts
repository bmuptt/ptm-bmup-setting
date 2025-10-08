import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from './environment';

// Ensure storage directories exist
const storageDir = path.join(process.cwd(), 'storage');
const imagesDir = path.join(storageDir, 'images');
const logosDir = path.join(imagesDir, 'logos');
const membersDir = path.join(imagesDir, 'members');
const documentsDir = path.join(storageDir, 'documents');

const directories = [storageDir, imagesDir, logosDir, membersDir, documentsDir];
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage with dynamic destination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on field name or custom logic
    let destination = imagesDir; // default
    
    if (file.fieldname === 'logo') {
      destination = logosDir;
    } else if (file.fieldname === 'photo' || file.fieldname === 'avatar') {
      destination = membersDir;
    }
    
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    const error = new Error('Only image files are allowed!') as any;
    error.status = 400;
    cb(error);
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Single file upload middleware
export const uploadSingle = (fieldName: string) => {
  return upload.single(fieldName);
};

export default upload;
