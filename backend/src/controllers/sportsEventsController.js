import SportsEvent from '../models/SportsEvent.js';
import { v4 as uuidv4 } from 'uuid';

export const getAllEvents = async (req, res) => {
  const events = await SportsEvent.find().sort({ start: 1 });
  res.json(events);
};

export const getEventById = async (req, res) => {
  const event = await SportsEvent.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json(event);
};

export const createEvent = async (req, res) => {
  const data = { ...req.body, uid: uuidv4() };
  const event = await SportsEvent.create(data);
  res.status(201).json(event);
};

export const updateEvent = async (req, res) => {
  const event = await SportsEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json(event);
};

export const deleteEvent = async (req, res) => {
  const event = await SportsEvent.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted successfully' });
};

export const importEvents = async (req, res) => {
  try {
    const { events } = req.body;
    const withUID = events.map(e => ({ ...e, uid: uuidv4() }));
    const created = await SportsEvent.insertMany(withUID);
    res.status(201).json({ inserted: created.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
