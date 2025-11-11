// Production-rate presets provide baseline declared/actual rates and companion
// environmental metrics (wastewater, emissions, etc.) for each production line.
// These values act as quick references for inspectors and can be refined as
// new DENR/EMB data becomes available.

export const PRODUCTION_RATE_DATASET = {
  version: "1.1.0",
  lastUpdated: "2025-11-11",
  source: "DENR-EMB Baseline Production Metrics (internal reference v2025-09)",
  notes:
    "Figures provide baseline estimates for inspections. Inspectors should update values when site-specific data is verified.",
};

const DEFAULT_ENVIRONMENTAL_METRICS = {
  wastewater: "",
  solidWaste: "",
  airEmissions: "",
  hazardousWaste: "",
  noiseLevel: "",
  dustLevel: "",
};

const buildRawRate = (rate) => {
  if (rate === undefined || rate === null) return null;
  if (typeof rate === "object" && !Array.isArray(rate)) {
    const { value = "", unit = "", per = "", suffix = "" } = rate;
    return {
      value,
      unit,
      per,
      suffix,
    };
  }

  if (typeof rate === "number") {
    return { value: rate, unit: "", per: "", suffix: "" };
  }

  const trimmed = String(rate).trim();
  if (!trimmed) return null;
  return { value: trimmed, unit: "", per: "", suffix: "" };
};

const normalizeRate = (rate) => {
  if (rate === undefined || rate === null) return "";
  if (typeof rate === "string") return rate.trim().toUpperCase();
  if (typeof rate === "number") return `${rate}`.toUpperCase();
  if (typeof rate === "object") {
    const { value, unit, per, suffix } = rate;
    const parts = [];
    if (value !== undefined && value !== null) parts.push(value);
    if (unit) parts.push(unit);
    if (per) parts.push(`/${per}`);
    if (suffix) parts.push(suffix);
    return parts.join(" ").trim().toUpperCase();
  }
  return String(rate).trim().toUpperCase();
};

const normalizeEnvironmentalMetrics = (metrics = {}) => {
  const normalized = { ...DEFAULT_ENVIRONMENTAL_METRICS };
  Object.entries(metrics).forEach(([key, value]) => {
    if (key in normalized) {
      normalized[key] = normalizeRate(value);
    }
  });
  return normalized;
};

const createPreset = (declared, actual, options = {}) => {
  const {
    category = "GENERAL",
    notes = "",
    environmental = {},
    source = PRODUCTION_RATE_DATASET.source,
    references = [],
  } = options;

  const declaredRate = normalizeRate(declared);
  const actualRate = normalizeRate(actual ?? declaredRate);
  const environmentalMetrics = normalizeEnvironmentalMetrics(environmental);

  return {
    declared: declaredRate,
    actual: actualRate || declaredRate,
    declaredRaw: buildRawRate(declared),
    actualRaw: buildRawRate(actual ?? declared),
    category,
    notes,
    source,
    references,
    ...environmentalMetrics,
  };
};

export const PRODUCTION_RATE_PRESETS = {
  // --- FOOD & BEVERAGE ---
  "ICE PRODUCTS": createPreset(
    { value: 20, unit: "TPD" },
    { value: 18, unit: "TPD" },
    {
      category: "FOOD & BEVERAGE",
      environmental: {
        wastewater: { value: 15, unit: "M³", per: "DAY" },
        solidWaste: { value: 300, unit: "KG", per: "DAY" },
        airEmissions: { value: 180, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 15, unit: "KG", per: "DAY" },
        noiseLevel: { value: 65, unit: "DB" },
        dustLevel: { value: 0.5, unit: "MG/M³" },
      },
    }
  ),
  "MEAT PROCESSING": createPreset(
    { value: 5, unit: "TPD" },
    { value: 4, unit: "TPD" },
    {
      category: "FOOD & BEVERAGE",
      environmental: {
        wastewater: { value: 25, unit: "M³", per: "DAY" },
        solidWaste: { value: 800, unit: "KG", per: "DAY" },
        airEmissions: { value: 220, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 25, unit: "KG", per: "DAY" },
        noiseLevel: { value: 70, unit: "DB" },
        dustLevel: { value: 1.0, unit: "MG/M³" },
      },
    }
  ),
  "NOODLE PRODUCTION": createPreset(
    { value: 2, unit: "TPD" },
    { value: 1.8, unit: "TPD" },
    {
      category: "FOOD & BEVERAGE",
      environmental: {
        wastewater: { value: 10, unit: "M³", per: "DAY" },
        solidWaste: { value: 150, unit: "KG", per: "DAY" },
        airEmissions: { value: 120, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 5, unit: "KG", per: "DAY" },
        noiseLevel: { value: 60, unit: "DB" },
        dustLevel: { value: 0.3, unit: "MG/M³" },
      },
    }
  ),
  "BEVERAGES": createPreset(
    { value: 15, unit: "TPD" },
    { value: 13, unit: "TPD" },
    {
      category: "FOOD & BEVERAGE",
      environmental: {
        wastewater: { value: 18, unit: "M³", per: "DAY" },
        solidWaste: { value: 250, unit: "KG", per: "DAY" },
        airEmissions: { value: 160, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 12, unit: "KG", per: "DAY" },
        noiseLevel: { value: 65, unit: "DB" },
        dustLevel: { value: 0.6, unit: "MG/M³" },
      },
    }
  ),
  "DAIRY PRODUCTS": createPreset(
    { value: 25_000, unit: "L", per: "DAY" },
    { value: 22_000, unit: "L", per: "DAY" },
    {
      category: "FOOD & BEVERAGE",
      environmental: {
        wastewater: { value: 22, unit: "M³", per: "DAY" },
        solidWaste: { value: 400, unit: "KG", per: "DAY" },
        airEmissions: { value: 200, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 20, unit: "KG", per: "DAY" },
        noiseLevel: { value: 68, unit: "DB" },
        dustLevel: { value: 0.8, unit: "MG/M³" },
      },
    }
  ),

  // --- MANUFACTURING & INDUSTRIAL ---
  "PLASTICS": createPreset(
    { value: 30, unit: "TPD" },
    { value: 28, unit: "TPD" },
    {
      category: "MANUFACTURING",
      environmental: {
        wastewater: { value: 5, unit: "M³", per: "DAY" },
        solidWaste: { value: 600, unit: "KG", per: "DAY" },
        airEmissions: { value: 600, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 40, unit: "KG", per: "DAY" },
        noiseLevel: { value: 75, unit: "DB" },
        dustLevel: { value: 1.5, unit: "MG/M³" },
      },
    }
  ),
  "ELECTRONICS": createPreset(
    { value: 10_000, unit: "UNITS", per: "DAY" },
    { value: 9_000, unit: "UNITS", per: "DAY" },
    {
      category: "MANUFACTURING",
      environmental: {
        wastewater: { value: 12, unit: "M³", per: "DAY" },
        solidWaste: { value: 900, unit: "KG", per: "DAY" },
        airEmissions: { value: 750, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 60, unit: "KG", per: "DAY" },
        noiseLevel: { value: 70, unit: "DB" },
        dustLevel: { value: 1.0, unit: "MG/M³" },
      },
    }
  ),
  "METALWORKS": createPreset(
    { value: 25, unit: "TPD" },
    { value: 22, unit: "TPD" },
    {
      category: "MANUFACTURING",
      environmental: {
        wastewater: { value: 15, unit: "M³", per: "DAY" },
        solidWaste: { value: 1_200, unit: "KG", per: "DAY" },
        airEmissions: { value: 900, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 80, unit: "KG", per: "DAY" },
        noiseLevel: { value: 80, unit: "DB" },
        dustLevel: { value: 2.0, unit: "MG/M³" },
      },
    }
  ),
  "TEXTILES": createPreset(
    { value: 6_000, unit: "M", per: "DAY" },
    { value: 5_400, unit: "M", per: "DAY" },
    {
      category: "MANUFACTURING",
      environmental: {
        wastewater: { value: 35, unit: "M³", per: "DAY" },
        solidWaste: { value: 700, unit: "KG", per: "DAY" },
        airEmissions: { value: 500, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 20, unit: "KG", per: "DAY" },
        noiseLevel: { value: 70, unit: "DB" },
        dustLevel: { value: 1.2, unit: "MG/M³" },
      },
    }
  ),
  "BATTERY MANUFACTURING": createPreset(
    { value: 8_000, unit: "CELLS", per: "DAY" },
    { value: 7_200, unit: "CELLS", per: "DAY" },
    {
      category: "MANUFACTURING",
      environmental: {
        wastewater: { value: 10, unit: "M³", per: "DAY" },
        solidWaste: { value: 1_000, unit: "KG", per: "DAY" },
        airEmissions: { value: 650, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 150, unit: "KG", per: "DAY" },
        noiseLevel: { value: 78, unit: "DB" },
        dustLevel: { value: 1.8, unit: "MG/M³" },
      },
    }
  ),

  // --- CONSTRUCTION MATERIALS ---
  "CONCRETE PRODUCTS": createPreset(
    { value: 100, unit: "TPD" },
    { value: 95, unit: "TPD" },
    {
      category: "CONSTRUCTION",
      environmental: {
        wastewater: { value: 10, unit: "M³", per: "DAY" },
        solidWaste: { value: 1_500, unit: "KG", per: "DAY" },
        airEmissions: { value: 1_000, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 30, unit: "KG", per: "DAY" },
        noiseLevel: { value: 85, unit: "DB" },
        dustLevel: { value: 3.0, unit: "MG/M³" },
      },
    }
  ),
  "STEEL PRODUCTS": createPreset(
    { value: 80, unit: "TPD" },
    { value: 75, unit: "TPD" },
    {
      category: "CONSTRUCTION",
      environmental: {
        wastewater: { value: 8, unit: "M³", per: "DAY" },
        solidWaste: { value: 1_000, unit: "KG", per: "DAY" },
        airEmissions: { value: 1_800, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 50, unit: "KG", per: "DAY" },
        noiseLevel: { value: 88, unit: "DB" },
        dustLevel: { value: 3.5, unit: "MG/M³" },
      },
    }
  ),

  // --- AGRICULTURE & FEED ---
  "ANIMAL FEED": createPreset(
    { value: 40, unit: "TPD" },
    { value: 35, unit: "TPD" },
    {
      category: "AGRICULTURE",
      environmental: {
        wastewater: { value: 12, unit: "M³", per: "DAY" },
        solidWaste: { value: 500, unit: "KG", per: "DAY" },
        airEmissions: { value: 300, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 10, unit: "KG", per: "DAY" },
        noiseLevel: { value: 72, unit: "DB" },
        dustLevel: { value: 1.5, unit: "MG/M³" },
      },
    }
  ),
  "POULTRY PRODUCTS": createPreset(
    { value: 12, unit: "TPD" },
    { value: 10, unit: "TPD" },
    {
      category: "AGRICULTURE",
      environmental: {
        wastewater: { value: 20, unit: "M³", per: "DAY" },
        solidWaste: { value: 1_200, unit: "KG", per: "DAY" },
        airEmissions: { value: 250, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 15, unit: "KG", per: "DAY" },
        noiseLevel: { value: 68, unit: "DB" },
        dustLevel: { value: 1.0, unit: "MG/M³" },
      },
    }
  ),

  // --- WATER, WASTE & TREATMENT ---
  "BOTTLED WATER": createPreset(
    { value: 50_000, unit: "L", per: "DAY" },
    { value: 45_000, unit: "L", per: "DAY" },
    {
      category: "WATER & WASTE",
      environmental: {
        wastewater: { value: 40, unit: "M³", per: "DAY" },
        solidWaste: { value: 400, unit: "KG", per: "DAY" },
        airEmissions: { value: 150, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 8, unit: "KG", per: "DAY" },
        noiseLevel: { value: 65, unit: "DB" },
        dustLevel: { value: 0.5, unit: "MG/M³" },
      },
    }
  ),
  "WASTE PROCESSING": createPreset(
    { value: 60, unit: "TPD" },
    { value: 55, unit: "TPD" },
    {
      category: "WATER & WASTE",
      environmental: {
        wastewater: { value: 25, unit: "M³", per: "DAY" },
        solidWaste: { value: 5_000, unit: "KG", per: "DAY" },
        airEmissions: { value: 900, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 400, unit: "KG", per: "DAY" },
        noiseLevel: { value: 85, unit: "DB" },
        dustLevel: { value: 2.5, unit: "MG/M³" },
      },
    }
  ),
  "HAZARDOUS WASTE TREATMENT": createPreset(
    { value: 15, unit: "TPD" },
    { value: 13, unit: "TPD" },
    {
      category: "WATER & WASTE",
      environmental: {
        wastewater: { value: 15, unit: "M³", per: "DAY" },
        solidWaste: { value: 1_000, unit: "KG", per: "DAY" },
        airEmissions: { value: 450, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 1_000, unit: "KG", per: "DAY" },
        noiseLevel: { value: 78, unit: "DB" },
        dustLevel: { value: 2.0, unit: "MG/M³" },
      },
    }
  ),

  // --- ENERGY ---
  "FUEL PRODUCTS": createPreset(
    { value: 120, unit: "TPD" },
    { value: 110, unit: "TPD" },
    {
      category: "ENERGY",
      environmental: {
        wastewater: { value: 15, unit: "M³", per: "DAY" },
        solidWaste: { value: 800, unit: "KG", per: "DAY" },
        airEmissions: { value: 2_500, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 300, unit: "KG", per: "DAY" },
        noiseLevel: { value: 82, unit: "DB" },
        dustLevel: { value: 2.8, unit: "MG/M³" },
      },
    }
  ),
  "SOLAR MODULES": createPreset(
    { value: 2_000, unit: "PANELS", per: "MONTH" },
    { value: 1_800, unit: "PANELS", per: "MONTH" },
    {
      category: "ENERGY",
      environmental: {
        wastewater: { value: 4, unit: "M³", per: "DAY" },
        solidWaste: { value: 300, unit: "KG", per: "DAY" },
        airEmissions: { value: 150, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 40, unit: "KG", per: "DAY" },
        noiseLevel: { value: 70, unit: "DB" },
        dustLevel: { value: 0.6, unit: "MG/M³" },
      },
    }
  ),

  // --- HEALTHCARE & PHARMA ---
  "PHARMACEUTICAL PRODUCTS": createPreset(
    { value: 1_200_000, unit: "TABLETS", per: "DAY" },
    { value: 1_050_000, unit: "TABLETS", per: "DAY" },
    {
      category: "HEALTHCARE",
      environmental: {
        wastewater: { value: 20, unit: "M³", per: "DAY" },
        solidWaste: { value: 400, unit: "KG", per: "DAY" },
        airEmissions: { value: 250, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 200, unit: "KG", per: "DAY" },
        noiseLevel: { value: 68, unit: "DB" },
        dustLevel: { value: 0.8, unit: "MG/M³" },
      },
    }
  ),
  "MEDICAL WASTE PROCESSING": createPreset(
    { value: 8, unit: "TPD" },
    { value: 7, unit: "TPD" },
    {
      category: "HEALTHCARE",
      environmental: {
        wastewater: { value: 5, unit: "M³", per: "DAY" },
        solidWaste: { value: 2_000, unit: "KG", per: "DAY" },
        airEmissions: { value: 400, unit: "KG CO₂", per: "DAY" },
        hazardousWaste: { value: 2_500, unit: "KG", per: "DAY" },
        noiseLevel: { value: 75, unit: "DB" },
        dustLevel: { value: 1.0, unit: "MG/M³" },
      },
    }
  ),

  // --- DEFAULT ---
  OTHERS: createPreset(
    { value: 0, unit: "TPD" },
    { value: 0, unit: "TPD" },
    {
      category: "GENERAL",
      notes: "Provide site-specific rate and environmental data.",
      environmental: {
        wastewater: "0",
        solidWaste: "0",
        airEmissions: "0",
        hazardousWaste: "0",
        noiseLevel: "0",
        dustLevel: "0",
      },
    }
  ),
};

export const ENVIRONMENTAL_METRIC_KEYS = Object.keys(DEFAULT_ENVIRONMENTAL_METRICS);

export const getProductionRatePreset = (productLine) => {
  if (!productLine) return null;
  const key = productLine.trim().toUpperCase();
  return PRODUCTION_RATE_PRESETS[key] || null;
};

export const getAllProductionRateValues = () => {
  const uniqueRates = new Set();
  Object.values(PRODUCTION_RATE_PRESETS).forEach(({ declared, actual }) => {
    if (declared) uniqueRates.add(declared);
    if (actual) uniqueRates.add(actual);
  });
  return Array.from(uniqueRates).sort();
};

export const getProductionRateSuggestions = (productLine) => {
  const suggestionSet = new Set(getAllProductionRateValues());
  const preset = getProductionRatePreset(productLine);
  if (preset) {
    if (preset.declared) suggestionSet.add(preset.declared);
    if (preset.actual) suggestionSet.add(preset.actual);
  }
  return Array.from(suggestionSet).sort();
};

export const getEnvironmentalMetrics = (productLine) => {
  const preset = getProductionRatePreset(productLine);
  if (!preset) return { ...DEFAULT_ENVIRONMENTAL_METRICS };

  return ENVIRONMENTAL_METRIC_KEYS.reduce((acc, key) => {
    acc[key] = preset[key] ?? DEFAULT_ENVIRONMENTAL_METRICS[key];
    return acc;
  }, {});
};

export const PRODUCTION_RATE_CATEGORIES = Array.from(
  new Set(
    Object.values(PRODUCTION_RATE_PRESETS)
      .map((preset) => preset.category)
      .filter(Boolean)
  )
).sort();

export const getPresetsByCategory = (category) => {
  if (!category) {
    return Object.entries(PRODUCTION_RATE_PRESETS);
  }

  const normalizedCategory = category.trim().toUpperCase();
  return Object.entries(PRODUCTION_RATE_PRESETS).filter(
    ([, preset]) => preset.category === normalizedCategory
  );
};

export const searchProductionRatePresets = (query) => {
  if (!query) {
    return Object.entries(PRODUCTION_RATE_PRESETS);
  }

  const normalized = query.trim().toUpperCase();
  return Object.entries(PRODUCTION_RATE_PRESETS).filter(([line, preset]) => {
    if (line.includes(normalized)) return true;
    if (preset.category && preset.category.includes(normalized)) return true;
    if (preset.notes && preset.notes.toUpperCase().includes(normalized)) return true;
    return false;
  });
};

export const validateProductionRatePresets = () => {
  const issues = [];
  const seen = new Set();

  Object.entries(PRODUCTION_RATE_PRESETS).forEach(([line, preset]) => {
    if (seen.has(line)) {
      issues.push(`Duplicate entry for product line "${line}".`);
    }
    seen.add(line);

    if (!preset.declared) {
      issues.push(`Missing declared rate for "${line}".`);
    }
    if (!preset.actual) {
      issues.push(`Missing actual rate for "${line}".`);
    }
    if (!preset.category || preset.category === "GENERAL") {
      issues.push(`Unset or default category for "${line}".`);
    }
  });

  return issues;
};
  