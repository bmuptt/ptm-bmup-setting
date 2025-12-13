import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import memberRepository from '../repository/member.repository';
import { ResponseError } from '../config/response-error';
import * as XLSX from 'xlsx';
import fs from 'fs';
import { Prisma } from '@prisma/client';

// Schema for member creation validation
export const createMemberSchema = z.object({
  user_id: z.coerce
    .number()
    .optional()
    .nullable()
    .transform(val => val === 0 || !val ? null : val),
  
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name cannot exceed 255 characters'),
  
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(255, 'Username cannot exceed 255 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  
  gender: z.enum(['Male', 'Female'], {
    message: 'Gender must be either Male or Female'
  }),
  
  birthdate: z.string()
    .min(1, 'Birthdate is required')
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      return date < today;
    }, 'Birthdate must be before today')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Birthdate must be a valid date'),
  
  address: z.string()
    .min(1, 'Address is required')
    .max(500, 'Address cannot exceed 500 characters'),
  
  phone: z.string()
    .min(1, 'Phone is required')
    .max(20, 'Phone cannot exceed 20 characters'),
  
  photo: z.string()
    .optional()
    .nullable()
    .transform(val => val === 'null' || val === '' ? null : val),
  
  active: z.union([
    z.boolean(),
    z.number().transform(val => {
      if (val === 1) return true;
      if (val === 0) return false;
      throw new Error('Active must be true or false');
    }),
    z.string().transform(val => {
      if (val === 'true' || val === '1') return true;
      if (val === 'false' || val === '0') return false;
      throw new Error('Active must be true or false');
    })
  ])
});

// Schema for member update validation
// Required fields: name, username, gender, birthdate, address, phone, status_file
export const updateMemberSchema = z.object({
  user_id: z.coerce
    .number()
    .optional()
    .nullable()
    .transform(val => val === 0 || !val ? null : val),
  
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name cannot exceed 255 characters'),
  
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(255, 'Username cannot exceed 255 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  
  gender: z.enum(['Male', 'Female'], {
    message: 'Gender must be either Male or Female'
  }),
  
  birthdate: z.string()
    .min(1, 'Birthdate is required')
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      return date < today;
    }, 'Birthdate must be before today')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Birthdate must be a valid date'),
  
  address: z.string()
    .min(1, 'Address is required')
    .max(500, 'Address cannot exceed 500 characters'),
  
  phone: z.string()
    .min(1, 'Phone is required')
    .max(20, 'Phone cannot exceed 20 characters'),
  
  photo: z.string()
    .optional()
    .nullable()
    .transform(val => val === 'null' || val === '' ? null : val),
  
  active: z.union([
    z.boolean(),
    z.number().transform(val => {
      if (val === 1) return true;
      if (val === 0) return false;
      throw new Error('Active must be true or false');
    }),
    z.string().transform(val => {
      if (val === 'true' || val === '1') return true;
      if (val === 'false' || val === '0') return false;
      throw new Error('Active must be true or false');
    })
  ]).optional(),
  
  // status_file: '0' = no change, '1' = change/upload new photo
  status_file: z.enum(['0', '1'], {
    message: 'status_file must be either 0 or 1'
  })
});

// Validation function for member creation
export const validateMemberCreate = (data: unknown) => {
  const errors: string[] = [];

  try {
    createMemberSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.issues.map((err: z.ZodIssue) => err.message));
    }
  }

  return errors;
};

// Validation function for member update
export const validateMemberUpdate = (data: unknown) => {
  const errors: string[] = [];

  try {
    updateMemberSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.issues.map((err: z.ZodIssue) => err.message));
    }
  }

  return errors;
};

// Validation middleware function for member creation
export const validateMemberCreateMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate schema format
    const validatedData = createMemberSchema.parse(req.body);
    req.body = validatedData;

    // Check if username already exists
    if (req.body.username) {
      const existingMember = await memberRepository.findByUsername(req.body.username);
      if (existingMember) {
        return next(new ResponseError(400, 'This username is already taken'));
      }
    }

    // Check if user_id already exists (if user_id is provided)
    if (req.body.user_id) {
      const existingMember = await memberRepository.findByUserId(req.body.user_id);
      if (existingMember) {
        return next(new ResponseError(400, 'This user is already registered as a member'));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Validation middleware function for member update
export const validateMemberUpdateMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate schema format
    const validatedData = updateMemberSchema.parse(req.body);
    req.body = validatedData;

    const memberId = parseInt(req.params.id || '0');

    // Check if member exists
    const existingMember = await memberRepository.findById(memberId);
    if (!existingMember) {
      return next(new ResponseError(404, 'Member not found'));
    }

    // Check if username already exists (must be unique, but allowed if same as current member)
    if (req.body.username !== existingMember.username) {
      const usernameExists = await memberRepository.findByUsername(req.body.username);
      if (usernameExists) {
        return next(new ResponseError(400, 'This username is already taken'));
      }
    }
    // If username is same as current member, allow it (no change needed)

    // Check if user_id already exists (if user_id is provided and different from current)
    if (req.body.user_id && req.body.user_id !== existingMember.user_id) {
      const userExists = await memberRepository.findByUserId(req.body.user_id);
      if (userExists) {
        return next(new ResponseError(400, 'This user is already registered as a member'));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Validation middleware function for member get by ID
export const validateMemberGetByIdMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const memberId = parseInt(req.params.id || '0');

    if (!memberId || memberId <= 0) {
      return next(new ResponseError(400, 'Invalid member ID'));
    }

    // Check if member exists
    const member = await memberRepository.findById(memberId);
    if (!member) {
      return next(new ResponseError(404, 'Member not found'));
    }

    // Attach member to request for use in controller (optional - service can still fetch it)
    // Stored here to avoid duplicate fetch if needed

    next();
  } catch (error) {
    next(error);
  }
};

// Validation middleware function for member delete
export const validateMemberDeleteMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const memberId = parseInt(req.params.id || '0');

    // Check if member exists
    const existingMember = await memberRepository.findById(memberId);
    if (!existingMember) {
      return next(new ResponseError(404, 'Member not found'));
    }

    next();
  } catch (error) {
    next(error);
  }
};

const createMemberUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  role_id: z.coerce
    .number()
    .int('Role ID must be an integer')
    .positive('Role ID must be greater than 0'),
});

export const validateMemberCreateUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const memberId = parseInt(req.params.id || '0');

    if (!memberId || memberId <= 0) {
      return next(new ResponseError(400, 'Invalid member ID'));
    }

    const validatedData = createMemberUserSchema.parse(req.body);
    req.body = validatedData;

    const existingMember = await memberRepository.findById(memberId);
    if (!existingMember) {
      return next(new ResponseError(404, 'Member not found'));
    }

    if (existingMember.user_id) {
      return next(new ResponseError(400, 'Member already linked to a user'));
    }

    if (!existingMember.name) {
      return next(new ResponseError(400, 'Member name is required to create external user'));
    }

    if (!existingMember.gender) {
      return next(new ResponseError(400, 'Member gender is required to create external user'));
    }

    if (!existingMember.birthdate) {
      return next(new ResponseError(400, 'Member birthdate is required to create external user'));
    }

    const birthdateValue =
      existingMember.birthdate instanceof Date
        ? existingMember.birthdate
        : new Date(existingMember.birthdate as unknown as string);

    if (Number.isNaN(birthdateValue.getTime())) {
      return next(new ResponseError(400, 'Member birthdate is invalid'));
    }

    res.locals.memberForExternal = {
      id: existingMember.id,
      name: existingMember.name as string,
      gender: existingMember.gender as string,
      birthdate: birthdateValue,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Schema for member list query validation
export const memberListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .optional()
    .default(1),
  
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(10),
  
  per_page: z.coerce
    .number()
    .int('Per page must be an integer')
    .min(1, 'Per page must be at least 1')
    .max(100, 'Per page cannot exceed 100')
    .optional(),
  
  search: z.string()
    .optional()
    .transform(val => val?.trim() || undefined),
  
  orderField: z.enum(['id', 'name', 'username', 'gender', 'birthdate', 'address', 'phone', 'active', 'created_at', 'updated_at'], {
    message: 'Order field must be one of: id, name, username, gender, birthdate, address, phone, active, created_at, updated_at'
  }).optional(),
  
  order_field: z.enum(['id', 'name', 'username', 'gender', 'birthdate', 'address', 'phone', 'active', 'created_at', 'updated_at'], {
    message: 'Order field must be one of: id, name, username, gender, birthdate, address, phone, active, created_at, updated_at'
  }).optional(),
  
  orderDir: z.enum(['asc', 'desc'], {
    message: 'Order direction must be either asc or desc'
  }).optional(),
  
  order_dir: z.enum(['asc', 'desc'], {
    message: 'Order direction must be either asc or desc'
  }).optional(),
  
  active: z.string()
    .optional()
    .refine(val => !val || ['active', 'inactive', 'all'].includes(val), {
      message: 'Active filter must be one of: active, inactive, all'
    })
});

// Schema for member load more query validation
export const memberLoadMoreQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .optional()
    .default(10),
  
  cursor: z.coerce
    .number()
    .int('Cursor must be an integer')
    .optional(),
  
  search: z.string()
    .optional()
    .transform(val => val?.trim() || undefined),
});

export const validateMemberLoadMoreQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedQuery = memberLoadMoreQuerySchema.parse(req.query);
    Object.assign(req.query, validatedQuery);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: string[] = [];
      
      const errorIssues = error.issues;
      
      if (Array.isArray(errorIssues)) {
        errorIssues.forEach(err => {
          const fieldName = err.path && err.path.length > 0 ? err.path.join('.') : 'query';
          errors.push(`${fieldName}: ${err.message}`);
        });
      }
      
      if (errors.length === 0) {
        errors.push('Invalid query parameters');
      }
      
      return next(new ResponseError(400, errors));
    }
    next(error);
  }
};

// Schema for member ID validation
export const memberIdSchema = z.object({
  id: z.coerce
    .number()
    .optional()
    .nullable()
    .transform(val => val === 0 || !val ? null : val),
  
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name cannot exceed 255 characters'),
  
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(255, 'Username cannot exceed 255 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  
  gender: z.enum(['Male', 'Female'], {
    message: 'Gender must be either Male or Female'
  }),
  
  birthdate: z.string()
    .min(1, 'Birthdate is required')
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      return date < today;
    }, 'Birthdate must be before today')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Birthdate must be a valid date'),
  
  address: z.string()
    .min(1, 'Address is required')
    .max(500, 'Address cannot exceed 500 characters'),
  
  phone: z.string()
    .min(1, 'Phone is required')
    .max(20, 'Phone cannot exceed 20 characters'),
  
  photo: z.string()
    .optional()
    .nullable()
    .transform(val => val === 'null' || val === '' ? null : val),
  
  active: z.union([
    z.boolean(),
    z.number().transform(val => {
      if (val === 1) return true;
      if (val === 0) return false;
      throw new Error('Active must be true or false');
    }),
    z.string().transform(val => {
      if (val === 'true' || val === '1') return true;
      if (val === 'false' || val === '0') return false;
      throw new Error('Active must be true or false');
    })
  ])
});

// Validation middleware for member list query parameters
export const validateMemberListQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Normalize query parameters: support both snake_case and camelCase
    const normalizedQuery: Record<string, unknown> = { ...req.query };
    
    // Support per_page as alias for limit
    if (normalizedQuery.per_page && !normalizedQuery.limit) {
      normalizedQuery.limit = normalizedQuery.per_page;
    }
    
    // Support order_field as alias for orderField
    if (normalizedQuery.order_field && !normalizedQuery.orderField) {
      normalizedQuery.orderField = normalizedQuery.order_field;
    }
    
    // Support order_dir as alias for orderDir
    if (normalizedQuery.order_dir && !normalizedQuery.orderDir) {
      normalizedQuery.orderDir = normalizedQuery.order_dir;
    }
    
    const validatedQuery = memberListQuerySchema.parse(normalizedQuery);
    
    // Ensure camelCase output for consistency
    if (validatedQuery.per_page) {
      validatedQuery.limit = validatedQuery.per_page;
      delete validatedQuery.per_page;
    }
    if (validatedQuery.order_field) {
      validatedQuery.orderField = validatedQuery.order_field;
      delete validatedQuery.order_field;
    }
    if (validatedQuery.order_dir) {
      validatedQuery.orderDir = validatedQuery.order_dir;
      delete validatedQuery.order_dir;
    }
    
    // Update query parameters directly (mutating req.query is safe in Express)
    Object.assign(req.query, validatedQuery);
    
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: string[] = [];
      
      // Access the issues property
      const errorIssues = error.issues;
      
      if (Array.isArray(errorIssues)) {
        errorIssues.forEach(err => {
          const fieldName = err.path && err.path.length > 0 ? err.path.join('.') : 'query';
          errors.push(`${fieldName}: ${err.message}`);
        });
      }
      
      if (errors.length === 0) {
        errors.push('Invalid query parameters');
      }
      
      return next(new ResponseError(400, errors));
    }
    next(error);
  }
};

// Multer error handling middleware for member photo upload
export const handleMemberMulterError = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Pass ResponseError to the global error handler
  if (err instanceof ResponseError) {
    return next(err);
  }

  if (err && typeof err === 'object') {
    const error = err as { code?: string; message?: string };
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ errors: ['Photo size cannot exceed 2MB'] });
    }
    if (error.message === 'Only image files are allowed!') {
      return res.status(400).json({ errors: ['Photo must be an image'] });
    }
    if (error.message && typeof error.message === 'string' && error.message.includes('Invalid file type')) {
      return res.status(400).json({ errors: ['Photo must be in format: jpeg, png, jpg, gif'] });
    }
    if (error.message && typeof error.message === 'string') {
      return res.status(400).json({ errors: [error.message] });
    }
  }
  next(err);
};

// Multer error handling middleware for excel import
export const handleExcelMulterError = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ResponseError) {
    return next(err);
  }
  if (err && typeof err === 'object') {
    const error = err as { code?: string; message?: string };
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ errors: ['Excel file size is too large'] });
    }
    if (error.message === 'Only excel files are allowed!') {
      return res.status(400).json({ errors: ['Only excel files are allowed!'] });
    }
    if (error.message && typeof error.message === 'string') {
      return res.status(400).json({ errors: [error.message] });
    }
  }
  next(err);
};

export const validateMemberImportMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next(new ResponseError(400, 'Excel file is required'));
    }
    
    const filePath = req.file.path;
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.readFile(filePath);
    } catch {
      return next(new ResponseError(400, 'Invalid Excel file'));
    }
    
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return next(new ResponseError(400, 'Excel file is empty'));
    }
    
    const sheet = workbook.Sheets[firstSheetName];
    if (!sheet) {
      return next(new ResponseError(400, 'Excel worksheet not found'));
    }
    
    const rows = XLSX.utils.sheet_to_json(sheet) as Array<Record<string, unknown>>;
    if (!Array.isArray(rows) || rows.length === 0) {
      return next(new ResponseError(400, 'Excel file is empty'));
    }
    
    const errors: string[] = [];
    const membersToCreate: Prisma.MemberCreateManyInput[] = [];
    const userId = (req as { user?: { id?: number } }).user?.id ?? 0;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as {
        name?: string;
        username?: string;
        gender?: string;
        birthdate?: string | number;
        address?: string;
        phone?: string | number;
        active?: boolean | string | number;
      };
      if (!row) continue;
      const rowNumber = i + 2;
      
      if (!row.name) errors.push(`Row ${rowNumber}: Name is required`);
      if (!row.username) errors.push(`Row ${rowNumber}: Username is required`);
      if (!row.gender || !['Male', 'Female'].includes(String(row.gender))) {
        errors.push(`Row ${rowNumber}: Gender must be Male or Female`);
      }
      if (!row.address) errors.push(`Row ${rowNumber}: Address is required`);
      if (!row.phone) errors.push(`Row ${rowNumber}: Phone is required`);
      
      let birthdate: Date | null = null;
      if (!row.birthdate) {
        errors.push(`Row ${rowNumber}: Birthdate is required`);
      } else {
        if (typeof row.birthdate === 'number') {
          const date = new Date(Math.round((row.birthdate - 25569) * 86400 * 1000));
          birthdate = date;
        } else {
          const s = String(row.birthdate).trim();
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
            const [dd, mm, yyyy] = s.split('/');
            birthdate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
          } else if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
            const [dd, mm, yyyy] = s.split('-');
            birthdate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
            birthdate = new Date(s);
          } else {
            birthdate = new Date(s);
          }
        }
        if (!birthdate || Number.isNaN(birthdate.getTime())) {
          errors.push(`Row ${rowNumber}: Invalid birthdate format`);
        } else if (birthdate >= new Date()) {
          errors.push(`Row ${rowNumber}: Birthdate must be before today`);
        }
      }
      
      let active = true;
      if (row.active !== undefined) {
        active = row.active === true || row.active === 'true' || row.active === 1 || row.active === '1';
      }
      
      if (errors.length === 0) {
        membersToCreate.push({
          name: String(row.name),
          username: String(row.username),
          gender: String(row.gender),
          birthdate: birthdate!, 
          address: String(row.address),
          phone: String(row.phone),
          active,
          created_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
    
    if (errors.length > 0) {
      return next(new ResponseError(400, errors));
    }
    
    const usernames = membersToCreate.map(m => m.username);
    const uniqueUsernames = new Set(usernames);
    if (uniqueUsernames.size !== usernames.length) {
      return next(new ResponseError(400, 'Duplicate usernames found in the file'));
    }
    
    res.locals.membersToCreate = membersToCreate;
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default {
  createMemberSchema,
  updateMemberSchema,
  memberListQuerySchema,
  memberLoadMoreQuerySchema,
  validateMemberCreate,
  validateMemberUpdate,
  validateMemberCreateMiddleware,
  validateMemberUpdateMiddleware,
  validateMemberGetByIdMiddleware,
  validateMemberDeleteMiddleware,
  validateMemberListQuery,
  validateMemberLoadMoreQuery,
  handleMemberMulterError,
  handleExcelMulterError,
  validateMemberImportMiddleware,
  validateMemberCreateUserMiddleware,
};
