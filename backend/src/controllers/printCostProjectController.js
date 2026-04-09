import PrintCostProject from '../models/PrintCostProject.js';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clampMin = (value, min = 0) => Math.max(min, toNumber(value, min));

const calculateProject = (payload = {}) => {
  const filaments = Array.isArray(payload.config?.filaments)
    ? payload.config.filaments.map((line) => ({
      name: (line?.name || '').trim(),
      weightGrams: clampMin(line?.weightGrams),
      costPerKg: clampMin(line?.costPerKg),
      extraCost: clampMin(line?.extraCost),
    }))
    : [];

  const otherCosts = Array.isArray(payload.config?.otherCosts)
    ? payload.config.otherCosts.map((line) => ({
      label: (line?.label || '').trim(),
      cost: clampMin(line?.cost),
    }))
    : [];

  const filamentWastePercent = clampMin(payload.config?.filamentWastePercent);
  const electricity = {
    powerWatts: clampMin(payload.config?.electricity?.powerWatts),
    printHours: clampMin(payload.config?.electricity?.printHours),
    pricePerKwh: clampMin(payload.config?.electricity?.pricePerKwh),
  };

  const machineWear = {
    machineCost: clampMin(payload.config?.machineWear?.machineCost),
    usefulLifeHours: clampMin(payload.config?.machineWear?.usefulLifeHours),
    maintenanceCostPerHour: clampMin(payload.config?.machineWear?.maintenanceCostPerHour),
  };

  const labor = {
    setupHours: clampMin(payload.config?.labor?.setupHours),
    postProcessHours: clampMin(payload.config?.labor?.postProcessHours),
    costPerHour: clampMin(payload.config?.labor?.costPerHour),
  };

  const packagingCost = clampMin(payload.config?.packagingCost);
  const shippingCost = clampMin(payload.config?.shippingCost);
  const platformFeePercent = clampMin(payload.config?.platformFeePercent);
  const failureRatePercent = clampMin(payload.config?.failureRatePercent);

  const filamentRawCost = filaments.reduce(
    (acc, line) => acc + ((line.weightGrams / 1000) * line.costPerKg) + line.extraCost,
    0
  );
  const filamentCost = filamentRawCost * (1 + (filamentWastePercent / 100));

  const electricityCost = (electricity.powerWatts / 1000) * electricity.printHours * electricity.pricePerKwh;

  const depreciationPerHour = machineWear.usefulLifeHours > 0
    ? machineWear.machineCost / machineWear.usefulLifeHours
    : 0;
  const machineWearCost = electricity.printHours * (depreciationPerHour + machineWear.maintenanceCostPerHour);

  const laborHours = labor.setupHours + labor.postProcessHours;
  const laborCost = laborHours * labor.costPerHour;

  const baseCost = filamentCost + electricityCost + machineWearCost + laborCost;

  const fixedOverhead = packagingCost + shippingCost + otherCosts.reduce((acc, line) => acc + line.cost, 0);
  const variableOverhead = baseCost * ((platformFeePercent + failureRatePercent) / 100);
  const overheadCost = fixedOverhead + variableOverhead;

  const subtotal = baseCost + overheadCost;

  const pricingMode = payload.pricingMode || 'minorista';
  const multiplierMap = {
    mayorista: 3,
    minorista: 4,
    llaveros: 5,
  };

  const multiplierFromMode = multiplierMap[pricingMode] || null;
  const customProfitPercent = clampMin(payload.customProfitPercent);
  const profitMultiplier = multiplierFromMode || (1 + customProfitPercent / 100);

  const finalPrice = subtotal * profitMultiplier;
  const roundUpFinalPrice = payload.roundUpFinalPrice !== false;
  const finalPriceRounded = roundUpFinalPrice ? Math.ceil(finalPrice) : finalPrice;
  const profitAmount = finalPrice - subtotal;
  const profitPercentApplied = subtotal > 0 ? (profitAmount / subtotal) * 100 : 0;

  return {
    pricingMode,
    customProfitPercent,
    roundUpFinalPrice,
    config: {
      filaments,
      filamentWastePercent,
      electricity,
      machineWear,
      labor,
      packagingCost,
      shippingCost,
      platformFeePercent,
      failureRatePercent,
      otherCosts,
    },
    summary: {
      filamentCost,
      electricityCost,
      machineWearCost,
      laborCost,
      baseCost,
      overheadCost,
      subtotal,
      profitMultiplier,
      profitPercentApplied,
      profitAmount,
      finalPrice,
      finalPriceRounded,
    },
  };
};

const canAccessProject = (user, project) => {
  if (!user || !project) return false;
  if (user.role === 'admin') return true;
  return String(project.user) === String(user._id);
};

export const listPrintCostProjects = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const projects = await PrintCostProject.find(filter)
      .populate('user', 'email nickname role')
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar proyectos', error: error.message });
  }
};

export const getPrintCostProject = async (req, res) => {
  try {
    const project = await PrintCostProject.findById(req.params.id).populate('user', 'email nickname role');

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    if (!canAccessProject(req.user, project)) {
      return res.status(403).json({ message: 'No tienes permisos para ver este proyecto' });
    }

    return res.json(project);
  } catch (error) {
    return res.status(500).json({ message: 'Error al cargar el proyecto', error: error.message });
  }
};

export const createPrintCostProject = async (req, res) => {
  try {
    const calcResult = calculateProject(req.body);

    const project = await PrintCostProject.create({
      user: req.user._id,
      name: (req.body.name || '').trim(),
      notes: req.body.notes || '',
      ...calcResult,
    });

    const saved = await PrintCostProject.findById(project._id).populate('user', 'email nickname role');
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el proyecto', error: error.message });
  }
};

export const updatePrintCostProject = async (req, res) => {
  try {
    const project = await PrintCostProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    if (!canAccessProject(req.user, project)) {
      return res.status(403).json({ message: 'No tienes permisos para editar este proyecto' });
    }

    const calcResult = calculateProject(req.body);
    project.name = (req.body.name || project.name || '').trim();
    project.notes = req.body.notes ?? project.notes;
    project.pricingMode = calcResult.pricingMode;
    project.customProfitPercent = calcResult.customProfitPercent;
    project.roundUpFinalPrice = calcResult.roundUpFinalPrice;
    project.config = calcResult.config;
    project.summary = calcResult.summary;

    await project.save();
    const saved = await PrintCostProject.findById(project._id).populate('user', 'email nickname role');
    return res.json(saved);
  } catch (error) {
    return res.status(400).json({ message: 'Error al actualizar el proyecto', error: error.message });
  }
};

export const deletePrintCostProject = async (req, res) => {
  try {
    const project = await PrintCostProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    if (!canAccessProject(req.user, project)) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este proyecto' });
    }

    await project.deleteOne();
    return res.json({ message: 'Proyecto eliminado' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar el proyecto', error: error.message });
  }
};
