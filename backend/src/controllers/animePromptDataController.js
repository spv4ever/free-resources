import IllustrationStyle from '../models/IllustrationStyle.js';
import ViewAngle from '../models/ViewAngle.js';
import Outfit from '../models/Outfit.js';
import Location from '../models/Location.js';
import Pose from '../models/Pose.js';
import Tag from '../models/Tag.js';

export const getAllStyles = async (req, res) => {
  const styles = await IllustrationStyle.find();
  res.json(styles);
};
// Crear nuevo
export const createStyle = async (req, res) => {
  const newStyle = new IllustrationStyle(req.body);
  await newStyle.save();
  res.status(201).json(newStyle);
};

// Actualizar existente
export const updateStyle = async (req, res) => {
  const { id } = req.params;
  const updated = await IllustrationStyle.findByIdAndUpdate(id, req.body, { new: true });
  res.json(updated);
};

// Eliminar
export const deleteStyle = async (req, res) => {
  await IllustrationStyle.findByIdAndDelete(req.params.id);
  res.json({ message: 'Eliminado correctamente' });
};

export const getAllAngles = async (req, res) => {
  const angles = await ViewAngle.find();
  res.json(angles);
};

export const createAngle = async (req, res) => {
  const newAngle = new ViewAngle(req.body);
  await newAngle.save();
  res.status(201).json(newAngle);
};

export const updateAngle = async (req, res) => {
  const updated = await ViewAngle.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const deleteAngle = async (req, res) => {
  await ViewAngle.findByIdAndDelete(req.params.id);
  res.json({ message: 'Eliminado correctamente' });
};



export const getAllOutfits = async (req, res) => {
  const outfits = await Outfit.find();
  res.json(outfits);
};

export const createOutfit = async (req, res) => {
  const newOutfit = new Outfit(req.body);
  await newOutfit.save();
  res.status(201).json(newOutfit);
};

export const updateOutfit = async (req, res) => {
  const updated = await Outfit.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const deleteOutfit = async (req, res) => {
  await Outfit.findByIdAndDelete(req.params.id);
  res.json({ message: 'Eliminado correctamente' });
};


export const getAllLocations = async (req, res) => {
  const locations = await Location.find();
  res.json(locations);
};

export const createLocation = async (req, res) => {
  const newLocation = new Location(req.body);
  await newLocation.save();
  res.status(201).json(newLocation);
};

export const updateLocation = async (req, res) => {
  const updated = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const deleteLocation = async (req, res) => {
  await Location.findByIdAndDelete(req.params.id);
  res.json({ message: 'Eliminado correctamente' });
};


export const getAllPoses = async (req, res) => {
  const poses = await Pose.find();
  res.json(poses);
};

export const createPose = async (req, res) => {
  const newPose = new Pose(req.body);
  await newPose.save();
  res.status(201).json(newPose);
};

export const updatePose = async (req, res) => {
  const updated = await Pose.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const deletePose = async (req, res) => {
  await Pose.findByIdAndDelete(req.params.id);
  res.json({ message: 'Eliminado correctamente' });
};


export const getAllTags = async (req, res) => {
  const tags = await Tag.find();
  res.json(tags);
};

export const createTag = async (req, res) => {
  const newTag = new Tag(req.body);
  await newTag.save();
  res.status(201).json(newTag);
};

export const updateTag = async (req, res) => {
  const updated = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const deleteTag = async (req, res) => {
  await Tag.findByIdAndDelete(req.params.id);
  res.json({ message: 'Eliminado correctamente' });
};
