import firestoreService from '../services/firestoreService.js'

class ResourceController {
  async getResources(req, res) {
    try {
      const { category, limit = 10 } = req.query;
      
      const resources = await firestoreService.getWellnessResources(
        category, 
        parseInt(limit)
      );
      
      res.status(200).json({
        success: true,
        resources,
        category: category || 'all'
      });
    } catch (error) {
      console.error('Error getting resources:', error);
      res.status(500).json({
        error: 'Failed to get resources',
        details: error.message
      });
    }
  }

  async addResource(req, res) {
    try {
      const { title, description, category, content, tags } = req.body;

      if (!title || !description || !category) {
        return res.status(400).json({
          error: 'Title, description, and category are required'
        });
      }

      const result = await firestoreService.addWellnessResource({
        title,
        description,
        category,
        content,
        tags: tags || []
      });
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error adding resource:', error);
      res.status(500).json({
        error: 'Failed to add resource',
        details: error.message
      });
    }
  }
}

export default new ResourceController()