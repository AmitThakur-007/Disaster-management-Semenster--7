import { PROVINCES, ALL_DISTRICTS, DISTRICTS_BY_PROVINCE } from '../src/nepalLocationData.js';

export { PROVINCES, DISTRICTS_BY_PROVINCE };
export const hazards = ['Flood','Landslide','Earthquake','Fire','Road accident','Severe storm','Rising water','Land crack','Other emergency','Other concern'];
export const statuses = ['Reported', 'InReview', 'Verified', 'Rejected', 'Dispatched', 'Responding', 'Resolved'];
export const transitions = Object.freeze({
  Reported: ['Verified', 'Rejected'],
  InReview: ['Verified', 'Rejected'],
  Verified: ['Dispatched', 'Responding', 'Rejected'],
  Dispatched: ['Responding', 'Resolved'],
  Rejected: [],
  Responding: ['Resolved'],
  Resolved: []
});

// Valid administrative references
export const ALL_DISTRICT_NAMES = ALL_DISTRICTS.map(d => d.name);
export const KATHMANDU_WARDS = Array.from({ length: 32 }, (_, i) => `Ward ${i + 1}`);

export function validateWard(ward, wardOther, municipality = null, district = null) {
  if (!ward || ward === '') return null; // optional
  if (typeof ward !== 'string' || ward.length > 120) return 'Select a valid ward.';
  if (ward === 'Other') {
    if (!wardOther || typeof wardOther !== 'string' || !wardOther.trim()) return 'Enter the area name when "Other" is selected.';
    if (wardOther.length > 120) return 'Area name must be at most 120 characters.';
    return null;
  }
  const m = ward.match(/^Ward\s+(\d+)$/i);
  if (m) {
    const num = parseInt(m[1], 10);
    // Kathmandu Metropolitan City has 32 wards. Other municipalities typically have up to 35-40.
    const maxWards = (!municipality || municipality.includes('Kathmandu')) ? 32 : 40;
    if (num < 1 || num > maxWards) return 'Select a valid ward.';
    return null;
  }
  if (!/^Ward\s+\d+/i.test(ward) && (ward.toLowerCase().includes('invalid') || !ward.trim())) {
    return 'Select a valid ward.';
  }
  return null;
}

export function validateReport(body) {
  if (!hazards.includes(body.hazard)) return 'Select a valid observation type.';
  if (body.severity !== undefined && !['Low', 'Medium', 'High', 'Critical'].includes(body.severity)) return 'Select a valid severity.';
  for (const key of ['latitude', 'longitude']) {
    if (body[key] !== undefined && body[key] !== '' && (!Number.isFinite(Number(body[key])) || Number(body[key]) < (key === 'latitude' ? -90 : -180) || Number(body[key]) > (key === 'latitude' ? 90 : 180))) return 'Enter valid coordinates.';
  }
  if (body.incidentAt !== undefined && body.incidentAt !== '' && !Number.isFinite(new Date(body.incidentAt).getTime())) return 'Enter a valid incident date and time.';
  // Prevent far-future incident dates (allow up to 1 hour ahead for timezone edge cases)
  if (body.incidentAt && body.incidentAt !== '') {
    const incidentDate = new Date(body.incidentAt);
    if (incidentDate.getTime() > Date.now() + 3600000) return 'Incident date cannot be in the future.';
  }

  // Province validation (optional, but if provided must be a valid Nepal province)
  if (body.province && body.province !== '') {
    if (!PROVINCES.includes(body.province)) return 'Select a valid Nepal province.';
  }

  // District validation (optional, but if provided must be one of the 77 districts)
  if (body.district && body.district !== '') {
    if (!ALL_DISTRICT_NAMES.includes(body.district)) return 'Select a valid Nepal district.';
    // If province is also provided, ensure the district belongs to the province
    if (body.province && body.province !== '' && DISTRICTS_BY_PROVINCE[body.province]) {
      if (!DISTRICTS_BY_PROVINCE[body.province].includes(body.district)) {
        return `District ${body.district} does not belong to ${body.province}.`;
      }
    }
  }

  // Ward validation
  const wardError = validateWard(body.ward, body.wardOther, body.municipality, body.district);
  if (wardError) return wardError;

  for (const key of ['locality', 'district', 'municipality', 'province']) {
    if (body[key] !== undefined && (typeof body[key] !== 'string' || body[key].length > 120)) return `Enter a valid ${key}.`;
  }
  if (body.wardOther !== undefined && (typeof body.wardOther !== 'string' || body.wardOther.length > 120)) return 'Enter a valid area name.';
  for (const [key, maximum] of [['area', 100], ['description', 1000]]) {
    if (typeof body[key] !== 'string' || !body[key].trim() || body[key].length > maximum) {
      return `${key} is required and must be at most ${maximum} characters.`;
    }
  }
  // Keep uploads small and accept only raster photo signatures.
  const match = typeof body.photo === 'string' && body.photo.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match) return 'Upload a JPEG, PNG or WebP photo.';
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > 3 * 1024 * 1024) return 'Photo must be 3 MB or smaller.';
  const valid = match[1] === 'jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    : match[1] === 'png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!valid) return 'Photo content does not match its file type.';
  return null;
}
