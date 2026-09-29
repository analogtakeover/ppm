export type RouteId = 
  | 'Route 101' 
  | 'Route 202' 
  | 'Commercial North' 
  | 'Residential South' 
  | 'Industrial East';

export interface RouteConfig {
  id: RouteId;
  name: string;
  siteCount: number;
  category: 'Commercial' | 'Residential' | 'Industrial' | 'Mixed';
  description: string;
}

export interface Site {
  id: string;
  number: number;
  name: string;
  address: string;
  type: 'Commercial' | 'Residential' | 'Industrial' | 'Fleet Hub';
}

export type UpperMetric = 
  | 'Trailer Inspection'
  | 'Truck Inspection'
  | 'Cut'
  | 'Trim'
  | 'Blow'
  | 'Debris Clean-Up'
  | 'PM/FM Wave';

export type DownerMetric = 
  | 'Bad Weather'
  | 'Traffic'
  | 'Broken Tools/Equipment'
  | 'Truck Failure'
  | 'Unhappy Client'
  | 'Late Staff'
  | 'No Shows';

export interface SiteLog {
  site: Site;
  status: 'COMPLETED' | 'SKIPPED';
  skipReason?: string;
  uppers: UpperMetric[];
  downers: DownerMetric[];
  completedAt: string;
  notes?: string;
}

export interface WarningTag {
  id: string;
  text: string;
  severity: 'high' | 'critical' | 'moderate';
}

export interface ShiftAudit {
  score: number;
  grade: 'Optimal' | 'Standard' | 'Compromised' | 'Critical';
  summary: string;
  warnings: WarningTag[];
  totalUppers: number;
  totalDowners: number;
  totalSkipped: number;
}

export type ShiftStep = 'setup' | 'checklist' | 'finalized';

export interface AirtableConfig {
  baseId: string;
  tableName: string;
  bearerToken: string;
}

export interface AirtableRecordFields {
  'Site Name': string;
  'Address': string;
  'Crew Leader Name': string;
  'Assigned Route': string;
  'Shift Date': string;
  'Site Status': 'Completed' | 'Skipped';
  'Skip Reason': string;
  'Uppers': string;
  'Downers': string;
  'AI Route Health Score': number;
}

