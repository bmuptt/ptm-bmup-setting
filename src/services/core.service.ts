import coreRepository from '../repository/core.repository';
import fs from 'fs';
import path from 'path';
import { config } from '../config/environment';

export class CoreService {
  /**
   * Get core configuration data
   * @returns Core configuration data
   */
  async getCoreData() {
    try {
      const core = await coreRepository.findById(0);

      if (!core) {
        throw new Error('Core configuration not found');
      }

      return {
        success: true,
        data: core,
        message: 'Core configuration retrieved successfully',
      };
    } catch (error) {
      console.error('[Core Service] Error getting core data:', error);
      throw error;
    }
  }

  /**
   * Update core configuration data
   * @param data - Core data to update
   * @param file - Uploaded file (optional)
   * @param statusFile - File status (0 = no change, 1 = change)
   * @returns Updated core data
   */
  async updateCoreData(
    data: {
      name?: string;
      logo?: string | null;
      description?: string;
      address?: string;
      maps?: string | null;
      primaryColor?: string;
      secondaryColor?: string;
      status_file?: string;
    },
    file?: Express.Multer.File,
    statusFile?: number,
    userId?: number
  ) {
    try {
      // Get current core data
      const currentCore = await coreRepository.findById(0);
      if (!currentCore) {
        throw new Error('Core configuration not found');
      }

      // Handle file upload logic based on status_file
      let logoFileName = currentCore.logo; // Default: keep existing

      if (statusFile === 1) {
        // status_file = 1: ada perubahan file
        if (file) {
          // Delete old logo if exists (extract filename from URL)
          if (currentCore.logo) {
            const oldLogoFilename = currentCore.logo.split('/').pop();
            if (oldLogoFilename) {
              const oldLogoPath = path.join(
                process.cwd(),
                'storage',
                'images',
                'logos',
                oldLogoFilename
              );
              if (fs.existsSync(oldLogoPath)) {
                fs.unlinkSync(oldLogoPath);
              }
            }
          }
          // Store new logo as full URL
          logoFileName = `${config.APP_URL}/storage/images/logos/${file.filename}`;
        } else {
          // No file provided - delete existing logo
          if (currentCore.logo) {
            const oldLogoFilename = currentCore.logo.split('/').pop();
            if (oldLogoFilename) {
              const oldLogoPath = path.join(
                process.cwd(),
                'storage',
                'images',
                'logos',
                oldLogoFilename
              );
              if (fs.existsSync(oldLogoPath)) {
                fs.unlinkSync(oldLogoPath);
              }
            }
          }
          logoFileName = null;
        }
      }
      // status_file = 0: no change - keep existing logo

      // Update data dengan logo filename
      const finalUpdateData: any = {
        ...data,
        logo: logoFileName,
        updatedBy: userId || 0, // Use authenticated user ID or default to 0
      };

      // Remove status_file and _method from update data
      delete finalUpdateData.status_file;
      delete finalUpdateData._method;

      const updatedCore = await coreRepository.update(0, finalUpdateData);

      return {
        success: true,
        data: updatedCore,
        message: 'Core configuration updated successfully',
      };
    } catch (error) {
      console.error('[Core Service] Error updating core data:', error);
      throw error;
    }
  }
}

export default new CoreService();
