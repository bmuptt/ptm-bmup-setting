import { Request, Response, NextFunction } from 'express';
import { createFlexibleHttpClient } from '../config/axios';
import { config } from '../config/environment';
import '../model'; // Import to extend Express Request interface

export const verifyCoreToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from cookie
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Missing token cookie.'
      });
      return;
    }

    // Call core service to verify token and get profile
    const flexibleClient = createFlexibleHttpClient();
    const response = await flexibleClient.get(`${config.API_URL_CORE}/profile`, {
      headers: {
        'Cookie': `token=${token}`
      }
    });

    if (response.status !== 200) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Invalid token.'
      });
      return;
    }

    const responseData = response.data;
    
    // Validate response data structure
    if (!responseData || !responseData.profile) {
      console.error('[Auth Middleware] Invalid response structure from core service:', responseData);
      res.status(500).json({
        success: false,
        message: 'Invalid response from authentication service.'
      });
      return;
    }

    // Validate required profile fields
    const profile = responseData.profile;
    if (!profile.id || !profile.name || !profile.email || !profile.role) {
      console.error('[Auth Middleware] Invalid profile data from core service:', profile);
      res.status(500).json({
        success: false,
        message: 'Invalid user profile data from authentication service.'
      });
      return;
    }

    // Validate role structure
    if (!profile.role.id || !profile.role.name) {
      console.error('[Auth Middleware] Invalid role data from core service:', profile.role);
      res.status(500).json({
        success: false,
        message: 'Invalid role data from authentication service.'
      });
      return;
    }
    
    // Store validated user profile and menu data in request
    req.user = profile;
    req.menu = responseData.menu || []; // Menu is optional, default to empty array

    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized. Invalid token.'
        });
        return;
      } else if (error.message.includes('Network error')) {
        res.status(503).json({
          success: false,
          message: 'Service unavailable. Core service is down.'
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Optional middleware for role-based access control
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.'
      });
      return;
    }

    const userRole = req.user.role.name;
    
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. Insufficient permissions.'
      });
      return;
    }

    next();
  };
};

// Optional middleware for checking specific permissions
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.'
      });
      return;
    }

    // Check if user has access to the specific menu/permission
    const hasPermission = req.menu?.some(menu => 
      menu.key_menu === permission || 
      menu.children?.some(child => child.key_menu === permission)
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.'
      });
      return;
    }

    next();
  };
};

export default verifyCoreToken;
