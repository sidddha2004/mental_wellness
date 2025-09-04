import express from 'express'
import resourceController from '../controllers/resourceController.js'

const router = express.Router();

// Get wellness resources
router.get('/', resourceController.getResources);

// Add a new wellness resource
router.post('/', resourceController.addResource);

export default router