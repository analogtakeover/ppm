import { AirtableConfig, AirtableRecordFields, SiteLog } from '../types';

export const DEFAULT_AIRTABLE_CONFIG: AirtableConfig = {
  baseId: 'appPPMOperations',
  tableName: 'Site Logs',
  bearerToken: '',
};

const STORAGE_KEY = 'ppm_airtable_config';

export function getStoredAirtableConfig(): AirtableConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_AIRTABLE_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_AIRTABLE_CONFIG;
}

export function saveAirtableConfig(config: AirtableConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore storage error
  }
}

export interface SyncResult {
  success: boolean;
  totalSynced: number;
  records?: Array<{ id: string; fields: Record<string, unknown> }>;
  error?: string;
  isMockDemo?: boolean;
}

export async function syncLogsToAirtable(
  config: AirtableConfig,
  operator: string,
  routeName: string,
  shiftDate: string,
  score: number,
  logs: SiteLog[]
): Promise<SyncResult> {
  const { baseId, tableName, bearerToken } = config;

  if (!baseId.trim() || !tableName.trim()) {
    throw new Error('Airtable Base ID and Table Name are required.');
  }

  // Format the structured records according to specifications
  const mappedRecords: { fields: AirtableRecordFields }[] = logs.map((log) => ({
    fields: {
      'Site Name': log.site.name,
      'Address': log.site.address,
      'Crew Leader Name': operator,
      'Assigned Route': routeName,
      'Shift Date': shiftDate,
      'Site Status': log.status === 'SKIPPED' ? 'Skipped' : 'Completed',
      'Skip Reason': log.skipReason || '',
      'Uppers': log.uppers.join(', '),
      'Downers': log.downers.join(', '),
      'AI Route Health Score': score,
    },
  }));

  // If no bearer token is provided or placeholder is used in offline/demo mode,
  // simulate real latency and return demo sync state with full payload preview
  if (!bearerToken.trim()) {
    throw new Error('Airtable Personal Access Token (Bearer Token) is missing. Please configure your token.');
  }

  const endpoint = `https://api.airtable.com/v0/${encodeURIComponent(baseId.trim())}/${encodeURIComponent(tableName.trim())}`;

  // Loop through and sync the records directly to Airtable REST API
  // Using batches of up to 10 (standard Airtable API max per request)
  const batchSize = 10;
  const createdRecordIds: string[] = [];

  for (let i = 0; i < mappedRecords.length; i += batchSize) {
    const batch = mappedRecords.slice(i, i + batchSize);
    const payload = {
      records: batch,
      typecast: true, // Allows Airtable to create select options or format dates if needed
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMsg = `Airtable API error (${response.status} ${response.statusText})`;
      try {
        const errorJson = await response.json();
        if (errorJson?.error?.message) {
          errorMsg = errorJson.error.message;
        } else if (typeof errorJson?.error === 'string') {
          errorMsg = errorJson.error;
        }
      } catch {
        // no json body
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    if (Array.isArray(data.records)) {
      data.records.forEach((r: { id: string }) => createdRecordIds.push(r.id));
    }
  }

  return {
    success: true,
    totalSynced: mappedRecords.length,
  };
}
