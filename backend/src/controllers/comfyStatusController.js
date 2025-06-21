import { getJobStatus, getAllJobs } from '../services/comfySocketWatcher.js';

export const getComfyJobStatus = (req, res) => {
  const { promptId } = req.params;
  const status = getJobStatus(promptId);

  if (!status) {
    return res.status(404).json({ error: 'No se encontró el estado para este promptId' });
  }

  res.json(status);
};

export const getAllComfyJobs = (req, res) => {
  const jobs = getAllJobs();
  res.json(jobs);
};
