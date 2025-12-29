import iconRepository from '../repository/icon.repository';

export class IconService {
  async getActiveIcons() {
    const icons = await iconRepository.findManyActive();
    return {
      success: true,
      data: icons,
      message: 'Icons retrieved successfully',
      count: icons.length,
    };
  }
}

export default new IconService();

