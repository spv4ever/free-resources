import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { useUser } from '../context/UserContext';
import '../styles/PrintCostCalculatorPage.css';

const defaultFilament = { name: '', weightGrams: 0, costPerKg: 20, extraCost: 0 };
const defaultOtherCost = { label: '', cost: 0 };

const round = (n) => Number((Number(n) || 0).toFixed(2));


const PRINT_COST_PREFERENCES_COOKIE = 'print_cost_preferences';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const DEFAULT_FORM = {
  name: '',
  notes: '',
  filaments: [defaultFilament],
  filamentWastePercent: 0,
  powerWatts: 95,
  printHours: 2,
  pricePerKwh: 0.2,
  machineCost: 400,
  usefulLifeHours: 2000,
  maintenanceCostPerHour: 0.05,
  setupHours: 0,
  postProcessHours: 0,
  laborCostPerHour: 15,
  packagingCost: 0,
  shippingCost: 0,
  platformFeePercent: 0,
  failureRatePercent: 0,
  otherCosts: [defaultOtherCost],
  pricingMode: 'minorista',
  customProfitPercent: 50,
  roundUpFinalPrice: true,
};

const parsePrintCostCookie = () => {
  if (typeof document === 'undefined') return {};

  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${PRINT_COST_PREFERENCES_COOKIE}=`))
    ?.split('=')[1];

  if (!cookieValue) return {};

  try {
    return JSON.parse(decodeURIComponent(cookieValue));
  } catch {
    return {};
  }
};

const writePrintCostCookie = (preferences) => {
  if (typeof document === 'undefined') return;

  document.cookie = `${PRINT_COST_PREFERENCES_COOKIE}=${encodeURIComponent(JSON.stringify(preferences))}; max-age=${ONE_YEAR_SECONDS}; path=/; SameSite=Lax`;
};
const PROFIT_PRESETS = [
  { value: 'mayorista', label: 'Mayorista x3' },
  { value: 'minorista', label: 'Minorista x4' },
  { value: 'llaveros', label: 'Llaveros x5' },
  { value: 'otros', label: 'Otros (%)' },
];

const calculatePreview = (form) => {
  const filamentRaw = form.filaments.reduce((acc, line) => (
    acc + ((Number(line.weightGrams) || 0) / 1000) * (Number(line.costPerKg) || 0) + (Number(line.extraCost) || 0)
  ), 0);
  const filamentCost = filamentRaw * (1 + ((Number(form.filamentWastePercent) || 0) / 100));

  const electricityCost = ((Number(form.powerWatts) || 0) / 1000)
    * (Number(form.printHours) || 0)
    * (Number(form.pricePerKwh) || 0);

  const usefulLife = Number(form.usefulLifeHours) || 0;
  const depreciationPerHour = usefulLife > 0 ? (Number(form.machineCost) || 0) / usefulLife : 0;
  const machineWearCost = (Number(form.printHours) || 0) * (depreciationPerHour + (Number(form.maintenanceCostPerHour) || 0));

  const laborHours = (Number(form.setupHours) || 0) + (Number(form.postProcessHours) || 0);
  const laborCost = laborHours * (Number(form.laborCostPerHour) || 0);
  const otherCostsTotal = form.otherCosts.reduce((acc, line) => acc + (Number(line.cost) || 0), 0);

  const baseCost = filamentCost + electricityCost + machineWearCost + otherCostsTotal;
  const nonMultipliedCosts = laborCost + (Number(form.packagingCost) || 0) + (Number(form.shippingCost) || 0);

  const variableOverhead = baseCost * (((Number(form.platformFeePercent) || 0) + (Number(form.failureRatePercent) || 0)) / 100);
  const subtotalForMultiplier = baseCost + variableOverhead;

  const presetMultiplier = { mayorista: 3, minorista: 4, llaveros: 5 }[form.pricingMode] || null;
  const multiplier = presetMultiplier || (1 + (Number(form.customProfitPercent) || 0) / 100);
  const totalCostPerProduct = subtotalForMultiplier + nonMultipliedCosts;
  const finalPrice = (subtotalForMultiplier * multiplier) + nonMultipliedCosts;
  const finalPriceRounded = form.roundUpFinalPrice ? Math.ceil(finalPrice) : finalPrice;
  const netProfitPerProduct = finalPriceRounded - totalCostPerProduct;

  return {
    filamentCost,
    electricityCost,
    machineWearCost,
    laborCost,
    otherCostsTotal,
    baseCost,
    nonMultipliedCosts,
    variableOverhead,
    subtotalForMultiplier,
    multiplier,
    totalCostPerProduct,
    finalPrice,
    finalPriceRounded,
    netProfitPerProduct,
  };
};

function PrintCostCalculatorPage() {
  const { user } = useUser();
  const canSave = user && (user.role === 'pro' || user.role === 'admin');

  const [form, setForm] = useState(() => {
    const storedPreferences = parsePrintCostCookie();

    return {
      ...DEFAULT_FORM,
      powerWatts: storedPreferences.powerWatts ?? DEFAULT_FORM.powerWatts,
      machineCost: storedPreferences.machineCost ?? DEFAULT_FORM.machineCost,
      setupHours: storedPreferences.setupHours ?? DEFAULT_FORM.setupHours,
      postProcessHours: storedPreferences.postProcessHours ?? DEFAULT_FORM.postProcessHours,
    };
  });

  const [status, setStatus] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projects, setProjects] = useState([]);

  const preview = useMemo(() => calculatePreview(form), [form]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateRow = (key, index, field, value) => {
    setForm((prev) => {
      const next = [...prev[key]];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, [key]: next };
    });
  };

  const addRow = (key, initialRow) => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], initialRow] }));
  };

  const deleteRow = (key, index) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].length > 1 ? prev[key].filter((_, i) => i !== index) : prev[key],
    }));
  };


  useEffect(() => {
    writePrintCostCookie({
      powerWatts: Number(form.powerWatts) || 0,
      machineCost: Number(form.machineCost) || 0,
      setupHours: Number(form.setupHours) || 0,
      postProcessHours: Number(form.postProcessHours) || 0,
    });
  }, [form.powerWatts, form.machineCost, form.setupHours, form.postProcessHours]);

  const loadProjects = async () => {
    if (!canSave) return;
    try {
      setLoadingProjects(true);
      const { data } = await API.get('/api/print-cost-projects');
      setProjects(data || []);
    } catch (error) {
      setStatus(error?.response?.data?.message || 'No se pudieron cargar los proyectos.');
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSave]);

  const buildPayload = () => ({
    name: form.name || `Proyecto ${new Date().toLocaleString('es-ES')}`,
    notes: form.notes,
    pricingMode: form.pricingMode,
    customProfitPercent: Number(form.customProfitPercent) || 0,
    roundUpFinalPrice: !!form.roundUpFinalPrice,
    config: {
      filaments: form.filaments.map((line) => ({
        name: line.name,
        weightGrams: Number(line.weightGrams) || 0,
        costPerKg: Number(line.costPerKg) || 0,
        extraCost: Number(line.extraCost) || 0,
      })),
      filamentWastePercent: Number(form.filamentWastePercent) || 0,
      electricity: {
        powerWatts: Number(form.powerWatts) || 0,
        printHours: Number(form.printHours) || 0,
        pricePerKwh: Number(form.pricePerKwh) || 0,
      },
      machineWear: {
        machineCost: Number(form.machineCost) || 0,
        usefulLifeHours: Number(form.usefulLifeHours) || 0,
        maintenanceCostPerHour: Number(form.maintenanceCostPerHour) || 0,
      },
      labor: {
        setupHours: Number(form.setupHours) || 0,
        postProcessHours: Number(form.postProcessHours) || 0,
        costPerHour: Number(form.laborCostPerHour) || 0,
      },
      packagingCost: Number(form.packagingCost) || 0,
      shippingCost: Number(form.shippingCost) || 0,
      platformFeePercent: Number(form.platformFeePercent) || 0,
      failureRatePercent: Number(form.failureRatePercent) || 0,
      otherCosts: form.otherCosts.map((line) => ({
        label: line.label,
        cost: Number(line.cost) || 0,
      })),
    },
  });

  const saveProject = async () => {
    if (!canSave) {
      setStatus('Solo usuarios PRO o ADMIN pueden guardar proyectos.');
      return;
    }

    try {
      setStatus('Guardando proyecto...');
      await API.post('/api/print-cost-projects', buildPayload());
      setStatus('✅ Proyecto guardado correctamente.');
      await loadProjects();
    } catch (error) {
      setStatus(error?.response?.data?.message || 'No se pudo guardar el proyecto.');
    }
  };

  return (
    <div className="print-cost-page">
      <header className="print-cost-page__header">
        <span>Nueva sección 4</span>
        <h1>Calculadora de costes de impresión 3D</h1>
        <p>
          Configura filamentos, electricidad, desgaste, mano de obra, costes extra y el margen de beneficio.
          El precio final puede redondearse siempre hacia arriba.
        </p>
        <Link to="/3dprints-keiko">← Volver al área 3D prints</Link>
      </header>

      <section className="print-cost-card">
        <h2>Datos del proyecto</h2>
        <div className="print-cost-grid">
          <label>Nombre del proyecto
            <input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Ej: Lote llaveros logo" />
          </label>
          <label>Notas
            <textarea value={form.notes} onChange={(e) => setField('notes', e.target.value)} rows={3} />
          </label>
        </div>
      </section>

      <section className="print-cost-card">
        <h2>Filamentos</h2>
        {form.filaments.map((line, index) => (
          <div key={`filament-${index}`} className="print-cost-row">
            <input placeholder="Filamento" value={line.name} onChange={(e) => updateRow('filaments', index, 'name', e.target.value)} />
            <input type="number" min="0" step="0.01" placeholder="Peso (g)" value={line.weightGrams} onChange={(e) => updateRow('filaments', index, 'weightGrams', e.target.value)} />
            <input type="number" min="0" step="0.01" placeholder="Coste €/kg" value={line.costPerKg} onChange={(e) => updateRow('filaments', index, 'costPerKg', e.target.value)} />
            <input type="number" min="0" step="0.01" placeholder="Coste extra" value={line.extraCost} onChange={(e) => updateRow('filaments', index, 'extraCost', e.target.value)} />
            <button type="button" onClick={() => deleteRow('filaments', index)}>Eliminar</button>
          </div>
        ))}
        <button type="button" onClick={() => addRow('filaments', defaultFilament)}>+ Añadir filamento</button>
        <label className="mt-12">Merma de filamento (%)
          <input type="number" min="0" step="0.1" value={form.filamentWastePercent} onChange={(e) => setField('filamentWastePercent', e.target.value)} />
        </label>
      </section>

      <section className="print-cost-card">
        <h2>Costes operativos</h2>
        <div className="print-cost-grid print-cost-grid--3">
          <label>Potencia impresora (W)<input type="number" min="0" step="1" value={form.powerWatts} onChange={(e) => setField('powerWatts', e.target.value)} /></label>
          <label>Horas de impresión<input type="number" min="0" step="0.01" value={form.printHours} onChange={(e) => setField('printHours', e.target.value)} /></label>
          <label>Precio electricidad (€/kWh)<input type="number" min="0" step="0.001" value={form.pricePerKwh} onChange={(e) => setField('pricePerKwh', e.target.value)} /></label>
          <label>Coste máquina (€)<input type="number" min="0" step="0.01" value={form.machineCost} onChange={(e) => setField('machineCost', e.target.value)} /></label>
          <label>Vida útil máquina (h)<input type="number" min="0" step="1" value={form.usefulLifeHours} onChange={(e) => setField('usefulLifeHours', e.target.value)} /></label>
          <label>Mantenimiento €/h<input type="number" min="0" step="0.01" value={form.maintenanceCostPerHour} onChange={(e) => setField('maintenanceCostPerHour', e.target.value)} /></label>
          <label>Preparación (h)<input type="number" min="0" step="0.01" value={form.setupHours} onChange={(e) => setField('setupHours', e.target.value)} /></label>
          <label>Post-proceso (h)<input type="number" min="0" step="0.01" value={form.postProcessHours} onChange={(e) => setField('postProcessHours', e.target.value)} /></label>
          <label>Coste mano de obra €/h<input type="number" min="0" step="0.01" value={form.laborCostPerHour} onChange={(e) => setField('laborCostPerHour', e.target.value)} /></label>
          <label>Packaging (€)<input type="number" min="0" step="0.01" value={form.packagingCost} onChange={(e) => setField('packagingCost', e.target.value)} /></label>
          <label>Envío (€)<input type="number" min="0" step="0.01" value={form.shippingCost} onChange={(e) => setField('shippingCost', e.target.value)} /></label>
          <label>Comisiones plataforma (%)<input type="number" min="0" step="0.1" value={form.platformFeePercent} onChange={(e) => setField('platformFeePercent', e.target.value)} /></label>
          <label>Ratio de fallos (%)<input type="number" min="0" step="0.1" value={form.failureRatePercent} onChange={(e) => setField('failureRatePercent', e.target.value)} /></label>
        </div>
      </section>

      <section className="print-cost-card">
        <h2>Otros costes</h2>
        <p className="print-cost-help">Incluye aquí accesorios (cadenas, imanes, anillas, etc.). Estos costes sí entran en el multiplicador.</p>
        {form.otherCosts.map((line, index) => (
          <div key={`other-${index}`} className="print-cost-row">
            <input placeholder="Concepto" value={line.label} onChange={(e) => updateRow('otherCosts', index, 'label', e.target.value)} />
            <input type="number" min="0" step="0.01" placeholder="Coste" value={line.cost} onChange={(e) => updateRow('otherCosts', index, 'cost', e.target.value)} />
            <button type="button" onClick={() => deleteRow('otherCosts', index)}>Eliminar</button>
          </div>
        ))}
        <button type="button" onClick={() => addRow('otherCosts', defaultOtherCost)}>+ Añadir otro coste</button>
      </section>

      <section className="print-cost-card">
        <h2>Beneficio y redondeo</h2>
        <p className="print-cost-help">
          El multiplicador se aplica sobre material + energía + desgaste + otros costes.
          Preparación, post-proceso, packaging y envío se suman al final sin multiplicar.
        </p>
        <div className="print-cost-presets">
          {PROFIT_PRESETS.map((preset) => (
            <label key={preset.value}>
              <input
                type="radio"
                name="pricingMode"
                value={preset.value}
                checked={form.pricingMode === preset.value}
                onChange={(e) => setField('pricingMode', e.target.value)}
              />
              {preset.label}
            </label>
          ))}
        </div>

        {form.pricingMode === 'otros' && (
          <label>Beneficio personalizado (%)
            <input type="number" min="0" step="0.1" value={form.customProfitPercent} onChange={(e) => setField('customProfitPercent', e.target.value)} />
          </label>
        )}

        <label>
          <input type="checkbox" checked={form.roundUpFinalPrice} onChange={(e) => setField('roundUpFinalPrice', e.target.checked)} />
          Redondear precio final siempre hacia arriba
        </label>
      </section>

      <section className="print-cost-card print-cost-card--results">
        <h2>Resultado</h2>
        <ul>
          <li><span>Coste filamentos</span><strong>{round(preview.filamentCost)} €</strong></li>
          <li><span>Electricidad</span><strong>{round(preview.electricityCost)} €</strong></li>
          <li><span>Desgaste máquina</span><strong>{round(preview.machineWearCost)} €</strong></li>
          <li><span>Mano de obra</span><strong>{round(preview.laborCost)} €</strong></li>
          <li><span>Otros costes (accesorios)</span><strong>{round(preview.otherCostsTotal)} €</strong></li>
          <li><span>Subtotal base (multiplicable)</span><strong>{round(preview.baseCost)} €</strong></li>
          <li><span>Extra variable</span><strong>{round(preview.variableOverhead)} €</strong></li>
          <li><span>Subtotal para multiplicador</span><strong>{round(preview.subtotalForMultiplier)} €</strong></li>
          <li><span>Costes no multiplicados</span><strong>{round(preview.nonMultipliedCosts)} €</strong></li>
          <li><span>Multiplicador beneficio</span><strong>x{round(preview.multiplier)}</strong></li>
          <li><span>Precio final</span><strong>{round(preview.finalPrice)} €</strong></li>
          <li><span>Precio final redondeado</span><strong>{round(preview.finalPriceRounded)} €</strong></li>
          <li><span>Beneficio neto por producto</span><strong>{round(preview.netProfitPerProduct)} €</strong></li>
        </ul>
        <div className="print-cost-actions">
          <button type="button" onClick={saveProject} disabled={!canSave}>Guardar proyecto</button>
          {!canSave && <p>Solo PRO o ADMIN pueden guardar y gestionar proyectos.</p>}
          {status && <p>{status}</p>}
        </div>
      </section>

      {canSave && (
        <section className="print-cost-card">
          <h2>Proyectos guardados</h2>
          {loadingProjects ? <p>Cargando proyectos...</p> : (
            <div className="print-project-list">
              {projects.length === 0 ? <p>No hay proyectos guardados.</p> : projects.map((project) => (
                <article key={project._id}>
                  <h3>{project.name}</h3>
                  <p>Precio final redondeado: <strong>{round(project.summary?.finalPriceRounded)} €</strong></p>
                  <p>Modo: {project.pricingMode}</p>
                  {user?.role === 'admin' && project.user && (
                    <p>Usuario: {project.user.nickname || project.user.email}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default PrintCostCalculatorPage;
