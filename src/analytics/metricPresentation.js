import { getMetricDefinition } from './metricDefinitions.js';

export function getMetricLabel(metricKey, isJapanese) {
  const definition = getMetricDefinition(metricKey);
  return isJapanese ? definition.labelJa : definition.labelEn;
}

export function getMetricFormula(metricKey, isJapanese) {
  const definition = getMetricDefinition(metricKey);
  return isJapanese ? definition.formulaJa : definition.formulaEn;
}

export function formatMetricValue(metricKey, value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return '—';
  }

  const definition = getMetricDefinition(metricKey);
  const numericValue = Number(value);
  const formatted = numericValue.toFixed(definition.decimals);

  return `${formatted}${definition.suffix}`;
}
