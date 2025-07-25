import GeneradorIA from '../models/GeneradorIAModel.js';

export const getGenerador = async (req, res) => {
  try {
    const userId = req.user.id;
    let generador = await GeneradorIA.findOne({ userId });

    if (!generador) {
      generador = await GeneradorIA.create({ userId });
    }

    res.json(generador);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el generador' });
  }
};

export const clickManual = async (req, res) => {
  try {
    const userId = req.user.id;
    const generador = await GeneradorIA.findOne({ userId });

    generador.ciclos += generador.clicMultiplier || 1;
    generador.updatedAt = new Date();
    await generador.save();

    res.json({ ciclos: generador.ciclos });
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar el clic' });
  }
};

export const aplicarMejora = async (req, res) => {
  try {
    const userId = req.user.id;
    const { upgradeName } = req.body;

    const upgradesDisponibles = {
      'multiplicador': { cost: 100, effect: g => g.clicMultiplier += 1 },
      'auto': { cost: 500, effect: g => g.cicloPorSegundo += 1 },
      'estilo': { cost: 800, effect: g => null },
      'inspiracion': { cost: 1000, effect: g => null }
    };

    const generador = await GeneradorIA.findOne({ userId });

    if (!upgradesDisponibles[upgradeName]) {
      return res.status(400).json({ message: 'Mejora no válida' });
    }

    const mejora = upgradesDisponibles[upgradeName];
    if (generador.ciclos < mejora.cost) {
      return res.status(400).json({ message: 'No tienes suficientes ciclos' });
    }

    generador.ciclos -= mejora.cost;
    generador.upgrades.push(upgradeName);
    mejora.effect(generador);
    generador.updatedAt = new Date();
    await generador.save();

    res.json({ success: true, generador });
  } catch (error) {
    res.status(500).json({ message: 'Error al aplicar mejora' });
  }
};

export const reiniciarGenerador = async (req, res) => {
  try {
    const userId = req.user.id;
    const generador = await GeneradorIA.findOne({ userId });

    generador.ciclos = 0;
    generador.nivel = 1;
    generador.upgrades = [];
    generador.cicloPorSegundo = 0;
    generador.clicMultiplier = 1;
    generador.imagenesGeneradas = [];
    generador.updatedAt = new Date();

    await generador.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error al reiniciar' });
  }
};
