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

// Configure storage for images (photos, logos)
const imageStorage = multer.diskStorage({
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

// Configure storage for excel documents
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const imageFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    const error = new Error('Only image files are allowed!') as any;
    error.status = 400;
    cb(error);
  }
};

// File filter for excel only
const excelFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const excelMimeTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream' // Some environments report excel as octet-stream
  ];
  if (excelMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Only excel files are allowed!') as any;
    error.status = 400;
    cb(error);
  }
};

// Configure multer instances
export const imageUpload = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for images to match validation message
  }
});

export const excelUpload = multer({
  storage: excelStorage,
  fileFilter: excelFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for excel files
  }
});

// Single file upload middleware
export const uploadSingle = (fieldName: string) => {
  return imageUpload.single(fieldName);
};

// Excel file upload middleware
export const uploadExcel = (fieldName: string) => {
  return excelUpload.single(fieldName);
};

export const uploadAnyImages = () => {
  return imageUpload.any();
};
export default imageUpload;
