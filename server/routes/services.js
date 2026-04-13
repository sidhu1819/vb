import express from 'express';
import Service from '../models/Service.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    next(error);
  }
});

export default router;
