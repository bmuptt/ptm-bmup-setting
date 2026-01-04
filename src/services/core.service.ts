import coreRepository from '../repository/core.repository';
import fs from 'fs';
import path from 'path';
import { config } from '../config/environment';
import { ResponseError } from '../config/response-error';
import { sanitizeHtml } from '../helper/html-sanitize.helper';

export class CoreService {
  /**
   * Get core configuration data
   * @returns Core configuration data
   */
  async getCoreData() {
    const core = await coreRepository.findById(0);

    if (!core) {
      throw new ResponseError(404, 'Core configuration not found');
    }

    return {
      success: true,
      data: core,
      message: 'Core configuration retrieved successfully',
    };
  }

  /**
   * Update core configuration data
   * @param data - Core data to update
   * @param file - Uploaded file (optional)
   * @param userId - User ID for audit trail
   * @returns Updated core data
   */
  async updateCoreData(
    data: {
      name?: string;
      logo?: string | null;
      description?: string;
      address?: string;
      maps?: string | null;
      primary_color?: string;
      secondary_color?: string;
      status_file?: string;
      _method?: string;
    },
    file?: Express.Multer.File,
    userId?: number
  ) {
    // Get current core data
    const currentCore = await coreRepository.findById(0);
    if (!currentCore) {
      throw new ResponseError(404, 'Core configuration not found');
    }

    // Handle file upload logic based on status_file
    let logoFileName = currentCore.logo; // Default: keep existing
    const statusFile = parseInt(data.status_file || '0');

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

    const finalUpdateData: Parameters<typeof coreRepository.update>[1] = {
      logo: logoFileName,
      updated_by: userId ?? 0,
    };

    if (data.name !== undefined) finalUpdateData.name = data.name;
    if (data.description !== undefined) finalUpdateData.description = sanitizeHtml(data.description);
    if (data.address !== undefined) finalUpdateData.address = data.address;
    if (data.maps !== undefined) finalUpdateData.maps = data.maps;
    if (data.primary_color !== undefined) finalUpdateData.primary_color = data.primary_color;
    if (data.secondary_color !== undefined) finalUpdateData.secondary_color = data.secondary_color;

    const updatedCore = await coreRepository.update(0, finalUpdateData);

    return {
      success: true,
      data: updatedCore,
      message: 'Core configuration updated successfully',
    };
  }
}

export default new CoreService();
