import express from 'express';
import Project from '../models/Project.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

export default router;
