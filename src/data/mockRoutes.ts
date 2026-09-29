import { RouteConfig, RouteId, Site, UpperMetric, DownerMetric } from '../types';

export const ROUTES: RouteConfig[] = [
  {
    id: 'Route 101',
    name: 'Route 101',
    siteCount: 1,
    category: 'Commercial',
    description: 'Rapid single-facility priority deployment (Gas / Service Station).',
  },
  {
    id: 'Route 202',
    name: 'Route 202',
    siteCount: 2,
    category: 'Commercial',
    description: 'Dual high-traffic commercial retail hubs.',
  },
  {
    id: 'Commercial North',
    name: 'Commercial North',
    siteCount: 4,
    category: 'Commercial',
    description: 'Corporate business parks, logistics hubs, and big-box centers.',
  },
  {
    id: 'Residential South',
    name: 'Residential South',
    siteCount: 8,
    category: 'Residential',
    description: 'Multi-family HOA complexes and residential subdivisions.',
  },
  {
    id: 'Industrial East',
    name: 'Industrial East',
    siteCount: 2,
    category: 'Industrial',
    description: 'Heavy distribution centers and intermodal facilities.',
  },
];

export const UPPERS_LIST: { id: UpperMetric; label: string; description: string }[] = [
  { id: 'Trailer Inspection', label: 'Trailer Inspection', description: 'Hitch, chains, ramp lock, and tire pressure check.' },
  { id: 'Truck Inspection', label: 'Truck Inspection', description: 'Fluid check, walkaround exterior, and safety beacons.' },
  { id: 'Cut', label: 'Cut', description: 'Clean primary mowing with correct deck height.' },
  { id: 'Trim', label: 'Trim', description: 'Precision perimeter and obstacle weed whipping.' },
  { id: 'Blow', label: 'Blow', description: 'Clearance of walkways, entrances, and parking stalls.' },
  { id: 'Debris Clean-Up', label: 'Debris Clean-Up', description: 'Bagging, sticks, rubbish, and curb line clearing.' },
  { id: 'PM/FM Wave', label: 'PM/FM Wave', description: 'Property/Facility Manager verbal confirmation or visual sign-off.' },
];

export const DOWNERS_LIST: { id: DownerMetric; label: string; description: string }[] = [
  { id: 'Bad Weather', label: 'Bad Weather', description: 'Severe rain, lightning delay, or high wind disruption.' },
  { id: 'Traffic', label: 'Traffic', description: 'Arterial road congestion or corridor transit delays.' },
  { id: 'Broken Tools/Equipment', label: 'Broken Tools/Equipment', description: 'Mower belt failure, trimmer head jam, or blower issue.' },
  { id: 'Truck Failure', label: 'Truck Failure', description: 'Mechanical powertrain, flat tire, or warning indicator.' },
  { id: 'Unhappy Client', label: 'Unhappy Client', description: 'On-site friction, customer complaint, or dispute.' },
  { id: 'Late Staff', label: 'Late Staff', description: 'Tardiness at yard meetup impacting wheels-rolling time.' },
  { id: 'No Shows', label: 'No Shows', description: 'Unexcused absentee crew member requiring route reallocation.' },
];

const REALISTIC_SITES_POOL: Array<{ name: string; address: string; type: Site['type'] }> = [
  { name: 'SHELL STATION #869', address: '401 SERVICE RD', type: 'Commercial' },
  { name: 'WALMART SUPERCENTER #2144', address: '7500 COMMERCIAL PKWY', type: 'Commercial' },
  { name: 'THE HOME DEPOT #0912', address: '1200 INDUSTRIAL WAY', type: 'Commercial' },
  { name: 'AMAZON FACILITY DFW7', address: '980 LOGISTICS BLVD', type: 'Industrial' },
  { name: 'PPM PLAZA CORPORATE CAMPUS', address: '100 PRISTINE BLVD', type: 'Commercial' },
  { name: 'TARGET PLAZA RETAIL PARK', address: '3400 GATEWAY BLVD', type: 'Commercial' },
  { name: 'COSTCO WHOLESALE #401', address: '2800 ENTERPRISE RD', type: 'Commercial' },
  { name: 'OAKRIDGE ESTATES HOA', address: '4420 WHISPERING PINES DR', type: 'Residential' },
  { name: 'HIGHLAND TERRACE RESIDENCES', address: '810 HIGHLAND AVE', type: 'Residential' },
  { name: 'WILLOW CREEK SUBDIVISION', address: '1400 MEADOW VIEW LN', type: 'Residential' },
  { name: 'CEDAR BLUFF CONDOS', address: '2210 HERITAGE WAY', type: 'Residential' },
  { name: 'LAKESIDE POINTE COMMONS', address: '315 SHORELINE DR', type: 'Residential' },
  { name: 'SYCAMORE GLEN TOWNHOMES', address: '725 TIMBERLINE PASS', type: 'Residential' },
  { name: 'SUNSET RIDGE HOA', address: '990 VALLEY VISTA CT', type: 'Residential' },
  { name: 'MAPLE GROVE RESIDENCES', address: '550 ARBOR SPRINGS WAY', type: 'Residential' },
  { name: 'METRO LOGISTICS DEPOT', address: '520 CARGO WAY', type: 'Industrial' },
  { name: 'PINNACLE TECHNOLOGY PARK', address: '600 INNOVATION LOOP', type: 'Industrial' },
];

export function generateSitesForRoute(routeId: RouteId): Site[] {
  const routeConfig = ROUTES.find(r => r.id === routeId) || ROUTES[0];
  const count = routeConfig.siteCount;

  // Dedicated presets for exact consistency with screenshot example
  if (routeId === 'Route 101') {
    return [
      {
        id: 'site-1',
        number: 1,
        name: 'SHELL STATION #869',
        address: '401 SERVICE RD',
        type: 'Commercial',
      },
    ];
  }

  if (routeId === 'Route 202') {
    return [
      {
        id: 'site-1',
        number: 1,
        name: 'WALMART SUPERCENTER #2144',
        address: '7500 COMMERCIAL PKWY',
        type: 'Commercial',
      },
      {
        id: 'site-2',
        number: 2,
        name: 'THE HOME DEPOT #0912',
        address: '1200 INDUSTRIAL WAY',
        type: 'Commercial',
      },
    ];
  }

  if (routeId === 'Commercial North') {
    return [
      {
        id: 'site-1',
        number: 1,
        name: 'AMAZON FACILITY DFW7',
        address: '980 LOGISTICS BLVD',
        type: 'Industrial',
      },
      {
        id: 'site-2',
        number: 2,
        name: 'PPM PLAZA CORPORATE CAMPUS',
        address: '100 PRISTINE BLVD',
        type: 'Commercial',
      },
      {
        id: 'site-3',
        number: 3,
        name: 'TARGET PLAZA RETAIL PARK',
        address: '3400 GATEWAY BLVD',
        type: 'Commercial',
      },
      {
        id: 'site-4',
        number: 4,
        name: 'COSTCO WHOLESALE #401',
        address: '2800 ENTERPRISE RD',
        type: 'Commercial',
      },
    ];
  }

  if (routeId === 'Industrial East') {
    return [
      {
        id: 'site-1',
        number: 1,
        name: 'METRO LOGISTICS DEPOT',
        address: '520 CARGO WAY',
        type: 'Industrial',
      },
      {
        id: 'site-2',
        number: 2,
        name: 'PINNACLE TECHNOLOGY PARK',
        address: '600 INNOVATION LOOP',
        type: 'Industrial',
      },
    ];
  }

  if (routeId === 'Residential South') {
    const resNames = [
      { name: 'OAKRIDGE ESTATES HOA', address: '4420 WHISPERING PINES DR' },
      { name: 'HIGHLAND TERRACE RESIDENCES', address: '810 HIGHLAND AVE' },
      { name: 'WILLOW CREEK SUBDIVISION', address: '1400 MEADOW VIEW LN' },
      { name: 'CEDAR BLUFF CONDOS', address: '2210 HERITAGE WAY' },
      { name: 'LAKESIDE POINTE COMMONS', address: '315 SHORELINE DR' },
      { name: 'SYCAMORE GLEN TOWNHOMES', address: '725 TIMBERLINE PASS' },
      { name: 'SUNSET RIDGE HOA', address: '990 VALLEY VISTA CT' },
      { name: 'MAPLE GROVE RESIDENCES', address: '550 ARBOR SPRINGS WAY' },
    ];

    return resNames.slice(0, count).map((item, idx) => ({
      id: `site-${idx + 1}`,
      number: idx + 1,
      name: item.name,
      address: item.address,
      type: 'Residential',
    }));
  }

  // Fallback
  return REALISTIC_SITES_POOL.slice(0, count).map((item, idx) => ({
    id: `site-${idx + 1}`,
    number: idx + 1,
    name: item.name,
    address: item.address,
    type: item.type,
  }));
}
