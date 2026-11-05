import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';

interface UnitDef {
  name: string;
  symbol: string;
  factor: number; // Factor relative to base unit
}

interface ConverterCategory {
  id: string;
  name: string;
  baseUnit: string;
  units: Record<string, UnitDef>;
}

const CATEGORIES_DATA: Record<string, ConverterCategory> = {
  length: {
    id: 'length',
    name: 'Length',
    baseUnit: 'm',
    units: {
      km: { name: 'Kilometer', symbol: 'km', factor: 1000 },
      m: { name: 'Meter', symbol: 'm', factor: 1 },
      cm: { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
      mm: { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
      mi: { name: 'Mile', symbol: 'mi', factor: 1609.344 },
      yd: { name: 'Yard', symbol: 'yd', factor: 0.9144 },
      ft: { name: 'Foot', symbol: 'ft', factor: 0.3048 },
      in: { name: 'Inch', symbol: 'in', factor: 0.0254 },
    },
  },
  weight: {
    id: 'weight',
    name: 'Weight',
    baseUnit: 'kg',
    units: {
      kg: { name: 'Kilogram', symbol: 'kg', factor: 1 },
      g: { name: 'Gram', symbol: 'g', factor: 0.001 },
      mg: { name: 'Milligram', symbol: 'mg', factor: 0.000001 },
      lb: { name: 'Pound', symbol: 'lb', factor: 0.45359237 },
      oz: { name: 'Ounce', symbol: 'oz', factor: 0.02834952 },
      ton: { name: 'Metric Ton', symbol: 't', factor: 1000 },
    },
  },
  temperature: {
    id: 'temperature',
    name: 'Temperature',
    baseUnit: 'c',
    units: {
      c: { name: 'Celsius', symbol: '°C', factor: 1 },
      f: { name: 'Fahrenheit', symbol: '°F', factor: 1 },
      k: { name: 'Kelvin', symbol: 'K', factor: 1 },
    },
  },
  area: {
    id: 'area',
    name: 'Area',
    baseUnit: 'sqm',
    units: {
      sqm: { name: 'Square Meter', symbol: 'm²', factor: 1 },
      sqkm: { name: 'Square Kilometer', symbol: 'km²', factor: 1000000 },
      sqft: { name: 'Square Foot', symbol: 'ft²', factor: 0.092903 },
      sqyd: { name: 'Square Yard', symbol: 'yd²', factor: 0.836127 },
      acre: { name: 'Acre', symbol: 'ac', factor: 4046.86 },
      hectare: { name: 'Hectare', symbol: 'ha', factor: 10000 },
    },
  },
  volume: {
    id: 'volume',
    name: 'Volume',
    baseUnit: 'l',
    units: {
      l: { name: 'Liter', symbol: 'L', factor: 1 },
      ml: { name: 'Milliliter', symbol: 'mL', factor: 0.001 },
      m3: { name: 'Cubic Meter', symbol: 'm³', factor: 1000 },
      gal: { name: 'Gallon (US)', symbol: 'gal', factor: 3.78541 },
      floz: { name: 'Fluid Ounce (US)', symbol: 'fl oz', factor: 0.0295735 },
      cup: { name: 'Cup (US)', symbol: 'cup', factor: 0.236588 },
    },
  },
  time: {
    id: 'time',
    name: 'Time',
    baseUnit: 's',
    units: {
      ms: { name: 'Millisecond', symbol: 'ms', factor: 0.001 },
      s: { name: 'Second', symbol: 's', factor: 1 },
      min: { name: 'Minute', symbol: 'min', factor: 60 },
      h: { name: 'Hour', symbol: 'h', factor: 3600 },
      d: { name: 'Day', symbol: 'd', factor: 86400 },
      wk: { name: 'Week', symbol: 'wk', factor: 604800 },
      mo: { name: 'Month (Avg)', symbol: 'mo', factor: 2629800 },
      yr: { name: 'Year (365d)', symbol: 'yr', factor: 31536000 },
    },
  },
  data: {
    id: 'data',
    name: 'Data',
    baseUnit: 'MB',
    units: {
      B: { name: 'Byte', symbol: 'B', factor: 0.000001 },
      KB: { name: 'Kilobyte', symbol: 'KB', factor: 0.001 },
      MB: { name: 'Megabyte', symbol: 'MB', factor: 1 },
      GB: { name: 'Gigabyte', symbol: 'GB', factor: 1000 },
      TB: { name: 'Terabyte', symbol: 'TB', factor: 1000000 },
      PB: { name: 'Petabyte', symbol: 'PB', factor: 1000000000 },
    },
  },
  speed: {
    id: 'speed',
    name: 'Speed',
    baseUnit: 'mps',
    units: {
      mps: { name: 'Meters per second', symbol: 'm/s', factor: 1 },
      kph: { name: 'Kilometers per hour', symbol: 'km/h', factor: 0.277778 },
      mph: { name: 'Miles per hour', symbol: 'mph', factor: 0.44704 },
      knot: { name: 'Knot', symbol: 'kn', factor: 0.514444 },
      fps: { name: 'Feet per second', symbol: 'ft/s', factor: 0.3048 },
    },
  },
};

export function UnitConverter() {
  const [categoryKey, setCategoryKey] = useState<string>('length');
  const cat = CATEGORIES_DATA[categoryKey];
  const unitKeys = Object.keys(cat.units);

  const [fromUnit, setFromUnit] = useState<string>(unitKeys[0] || 'km');
  const [toUnit, setToUnit] = useState<string>(unitKeys[1] || 'm');
  const [fromValue, setFromValue] = useState<string>('1');

  const handleCategoryChange = (newKey: string) => {
    setCategoryKey(newKey);
    const newCat = CATEGORIES_DATA[newKey];
    const keys = Object.keys(newCat.units);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
    setFromValue('1');
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const calculateResult = (): string => {
    const val = parseFloat(fromValue);
    if (isNaN(val)) return '0';

    if (categoryKey === 'temperature') {
      if (fromUnit === toUnit) return val.toString();
      let celsius = val;
      if (fromUnit === 'f') celsius = (val - 32) * (5 / 9);
      else if (fromUnit === 'k') celsius = val - 273.15;

      let target = celsius;
      if (toUnit === 'f') target = celsius * (9 / 5) + 32;
      else if (toUnit === 'k') target = celsius + 273.15;

      return parseFloat(target.toFixed(4)).toString();
    }

    const fromDef = cat.units[fromUnit];
    const toDef = cat.units[toUnit];
    if (!fromDef || !toDef) return '0';

    const baseVal = val * fromDef.factor;
    const targetVal = baseVal / toDef.factor;

    if (Math.abs(targetVal) < 0.000001 && targetVal !== 0) {
      return targetVal.toExponential(4);
    }
    return parseFloat(targetVal.toFixed(6)).toString();
  };

  const resultStr = calculateResult();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Category selector */}
      <div className="flex border-b border-slate-200 gap-1 pb-4 overflow-x-auto">
        {Object.values(CATEGORIES_DATA).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleCategoryChange(item.id)}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              categoryKey === item.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
          {/* From Side */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">From</label>
            <input
              type="number"
              step="any"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono focus:bg-white focus:outline-hidden focus:border-emerald-500"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              {Object.entries(cat.units).map(([key, u]) => (
                <option key={key} value={key}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center sm:col-span-1 pt-4 sm:pt-6">
            <button
              type="button"
              onClick={swapUnits}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors cursor-pointer"
              title="Swap Units"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To Side */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">To</label>
            <div className="px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-base font-mono font-bold text-emerald-800 truncate">
              {resultStr}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              {Object.entries(cat.units).map(([key, u]) => (
                <option key={key} value={key}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Big Conversion Formula Statement */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <p className="text-sm font-medium text-slate-700">
            {fromValue} {cat.units[fromUnit]?.name} ={' '}
            <span className="font-bold text-emerald-700 font-mono">{resultStr}</span>{' '}
            {cat.units[toUnit]?.name}
          </p>
        </div>
      </div>
    </div>
  );
}
