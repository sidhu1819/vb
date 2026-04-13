import express from 'express';
import { authenticateJWT } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import SiteContent from '../models/SiteContent.js';

const router = express.Router();

router.use(authenticateJWT);
router.use(requireRole(['founder', 'employee']));

router.get('/', async (req, res) => {
  try {
    const allContent = await SiteContent.find({}).sort({ section: 1, displayOrder: 1 });
    
    // Group by section
    const grouped = {
      about: [],
      services: [],
      projects: [],
      home_stats: []
    };
    
    allContent.forEach(item => {
      if (grouped[item.section]) {
        grouped[item.section].push(item);
      }
    });

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/toggle', async (req, res) => {
  try {
    const item = await SiteContent.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    
    item.isVisible = !item.isVisible;
    item.updatedBy = req.user._id;
    await item.save();
    
    res.json({ _id: item._id, key: item.key, isVisible: item.isVisible });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/order', async (req, res) => {
  try {
    const { displayOrder } = req.body;
    const item = await SiteContent.findByIdAndUpdate(
      req.params.id, 
      { displayOrder, updatedBy: req.user._id },
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/data', async (req, res) => {
  try {
    const { overrideData } = req.body;
    const item = await SiteContent.findByIdAndUpdate(
      req.params.id,
      { overrideData, updatedBy: req.user._id },
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { section, key, overrideData } = req.body;
    
    const count = await SiteContent.countDocuments({ section });
    
    const newItem = await SiteContent.create({
      section,
      key,
      overrideData: overrideData || {},
      isVisible: true,
      displayOrder: count + 1,
      updatedBy: req.user._id
    });
    
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await SiteContent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
