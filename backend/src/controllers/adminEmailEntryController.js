import EmailEntry from '../models/EmailEntry.js';

export const getEmailEntries = async (req, res) => {
  try {
    const filter = {};
    if (req.query.reviewed === 'false') filter.reviewed = false;
    if (req.query.approved === 'true') filter.approvedForPost = true;
    if (req.query.created === 'false') filter.postCreated = false;

    const emails = await EmailEntry.find(filter).sort({ date: -1 });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener emails', error: err.message });
  }
};

export const markAsReviewed = async (req, res) => {
  try {
    const email = await EmailEntry.findByIdAndUpdate(req.params.id, { reviewed: true }, { new: true });
    res.json(email);
  } catch (err) {
    res.status(500).json({ message: 'Error al marcar como revisado', error: err.message });
  }
};

export const approveForPost = async (req, res) => {
  try {
    const { approve } = req.body;
    const email = await EmailEntry.findByIdAndUpdate(
      req.params.id,
      { approvedForPost: approve, reviewed: true },
      { new: true }
    );
    res.json(email);
  } catch (err) {
    res.status(500).json({ message: 'Error al aprobar para post', error: err.message });
  }
};
