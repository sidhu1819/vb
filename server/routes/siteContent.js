import express from 'express';
import SiteContent from '../models/SiteContent.js';

const router = express.Router();

router.get('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const content = await SiteContent.find({ section, isVisible: true })
      .sort({ displayOrder: 1 });
    
    // Disable caching to allow admin updates to reflect immediately
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching site content' });
  }
});

export default router;
