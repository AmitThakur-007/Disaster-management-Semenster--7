import { getWeather, assessReport } from '../server/analysis.js';
const area = { name: 'Kathmandu Metropolitan City — Ward 28', latitude: 27.705, longitude: 85.322 };
const weather = await getWeather(area);
const result = await assessReport({ hazard: 'Rising water', description: 'A resident reports increasing water near a road after rain. This is an integration check, not a real incident.', area, createdAt: new Date().toISOString() }, weather);
console.log(JSON.stringify({ source: weather.source, days: weather.daily.time.length, model: result.model,
  durationMs: result.durationMs, structuredOutputValid: true, summary: result.summary }, null, 2));
