import { SiteLog, ShiftAudit, WarningTag, DownerMetric } from '../types';

export function calculateRouteAudit(
  operator: string,
  routeName: string,
  logs: SiteLog[]
): ShiftAudit {
  const totalSites = logs.length;
  if (totalSites === 0) {
    return {
      score: 100,
      grade: 'Optimal',
      summary: `${operator} initialized the route. No site completion logs recorded yet.`,
      warnings: [],
      totalUppers: 0,
      totalDowners: 0,
      totalSkipped: 0,
    };
  }

  const completedLogs = logs.filter((l) => l.status !== 'SKIPPED');
  const skippedLogs = logs.filter((l) => l.status === 'SKIPPED');
  const totalSkipped = skippedLogs.length;

  let totalUppers = 0;
  let totalDowners = 0;
  const downerCounts: Record<DownerMetric, number> = {
    'Bad Weather': 0,
    'Traffic': 0,
    'Broken Tools/Equipment': 0,
    'Truck Failure': 0,
    'Unhappy Client': 0,
    'Late Staff': 0,
    'No Shows': 0,
  };

  let missingInspections = 0;

  completedLogs.forEach((log) => {
    totalUppers += log.uppers.length;
    totalDowners += log.downers.length;

    log.downers.forEach((d) => {
      downerCounts[d] = (downerCounts[d] || 0) + 1;
    });

    if (!log.uppers.includes('Trailer Inspection') || !log.uppers.includes('Truck Inspection')) {
      missingInspections++;
    }
  });

  // Calculate penalties normalized per route
  let penalty = 0;
  penalty += downerCounts['Broken Tools/Equipment'] * 12;
  penalty += downerCounts['Bad Weather'] * 10;
  penalty += downerCounts['Truck Failure'] * 15;
  penalty += downerCounts['Unhappy Client'] * 14;
  penalty += downerCounts['No Shows'] * 10;
  penalty += downerCounts['Late Staff'] * 6;
  penalty += downerCounts['Traffic'] * 5;

  // Skipped site penalty: major deduction per bypassed location
  if (totalSkipped > 0) {
    penalty += totalSkipped * 22;
  }

  if (totalSites > 1) {
    const scaleFactor = Math.max(0.65, 1 / Math.sqrt(totalSites));
    penalty = Math.round(penalty * scaleFactor);
  }

  if (missingInspections > 0 && completedLogs.length > 0) {
    penalty += Math.min(10, missingInspections * 3);
  }

  const score = Math.max(10, Math.min(100, 100 - penalty));

  let grade: ShiftAudit['grade'] = 'Optimal';
  if (score < 50) grade = 'Critical';
  else if (score < 75) grade = 'Compromised';
  else if (score < 90) grade = 'Standard';

  // Warnings generation
  const warnings: WarningTag[] = [];

  // Add critical warnings for skipped sites at the top
  skippedLogs.forEach((skip) => {
    warnings.push({
      id: `warn-skip-${skip.site.id}`,
      text: `SITE #${skip.site.number} (${skip.site.name}) SKIPPED: ${skip.skipReason?.toUpperCase() || 'UNRESOLVED FIELD ISSUE'}`,
      severity: 'critical',
    });
  });

  if (downerCounts['Broken Tools/Equipment'] > 0) {
    warnings.push({
      id: 'warn-tools',
      text: 'BROKEN TOOLS/EQUIPMENT REQUIRE IMMEDIATE MAINTENANCE INTAKE',
      severity: 'high',
    });
  }
  if (downerCounts['Bad Weather'] > 0) {
    warnings.push({
      id: 'warn-weather',
      text: 'ADVERSE WEATHER CONDITIONS COMPROMISED OPERATIONAL EFFICIENCY',
      severity: 'moderate',
    });
  }
  if (downerCounts['Truck Failure'] > 0) {
    warnings.push({
      id: 'warn-truck',
      text: 'CRITICAL TRUCK FAILURE LOGGED — FLEET REPAIR WORK ORDER REQUIRED',
      severity: 'critical',
    });
  }
  if (downerCounts['Unhappy Client'] > 0) {
    warnings.push({
      id: 'warn-client',
      text: 'CLIENT ESCALATION RECORDED — FIELD MANAGER FOLLOW-UP MANDATORY',
      severity: 'high',
    });
  }
  if (downerCounts['No Shows'] > 0 || downerCounts['Late Staff'] > 0) {
    warnings.push({
      id: 'warn-staff',
      text: 'CREW ATTENDANCE DEFICIT DETECTED — REBALANCING FIELD CAPACITIES',
      severity: 'moderate',
    });
  }
  if (downerCounts['Traffic'] > 0 && warnings.length < 4) {
    warnings.push({
      id: 'warn-traffic',
      text: 'CORRIDOR TRAFFIC CONGESTION EXTENDED TRANSIT CYCLES',
      severity: 'moderate',
    });
  }

  // Formulate 2-sentence executive summary
  const opName = operator.trim() || 'Crew Leader';
  let sentence1 = '';
  let sentence2 = '';

  if (totalSkipped > 0) {
    const reasons = Array.from(new Set(skippedLogs.map((s) => s.skipReason || 'field restrictions'))).join(', ');
    sentence1 = `"${opName} serviced ${completedLogs.length} of ${totalSites} scheduled properties on ${routeName}, with ${totalSkipped} location(s) bypassed due to ${reasons}."`;
    sentence2 = `"Incomplete scope at skipped sites has been flagged for dispatch rescheduling; completed facilities adhered to standard Pristine property guidelines."`;
  } else {
    const siteNames = logs.map((l) => l.site.name);
    const siteSummaryStr =
      siteNames.length === 1
        ? siteNames[0]
        : siteNames.length === 2
        ? `${siteNames[0]} and ${siteNames[1]}`
        : `${siteNames[0]} and ${siteNames.length - 1} other properties`;

    const hasHeadwinds = totalDowners > 0;
    const hasEquipment = downerCounts['Broken Tools/Equipment'] > 0 || downerCounts['Truck Failure'] > 0;
    const hasWeather = downerCounts['Bad Weather'] > 0;
    const hasClient = downerCounts['Unhappy Client'] > 0;

    if (!hasHeadwinds) {
      sentence1 = `"${opName} delivered flawless full-service execution across all checkpoints at ${siteSummaryStr} with zero recorded operational disruptions."`;
      sentence2 = `"All equipment inspections, curb-line detailing, and manager sign-offs met premium Pristine Property Maintenance standards with peak efficiency."`;
    } else {
      if (hasEquipment && hasWeather) {
        sentence1 = `"${opName} completed full-service maintenance and pre-trip inspections at ${siteSummaryStr} despite operational headwinds."`;
        sentence2 = `"Adverse weather and equipment failure hindered field efficiency, requiring immediate tool maintenance before the next deployment."`;
      } else if (hasEquipment) {
        sentence1 = `"${opName} completed scheduled site operations at ${siteSummaryStr} while actively managing equipment degradation in the field."`;
        sentence2 = `"Defective machinery was isolated on-site, requiring an immediate shop maintenance intake ticket before the subsequent shift."`;
      } else if (hasWeather) {
        sentence1 = `"${opName} maintained rigorous safety and property maintenance standards at ${siteSummaryStr} amidst inclement weather conditions."`;
        sentence2 = `"Pre-trip procedures and post-cut debris blowdowns were fulfilled to standard while mitigating slick surface hazards."`;
      } else if (hasClient) {
        sentence1 = `"${opName} finalized route tasks at ${siteSummaryStr} and handled active client coordination during site turnover."`;
        sentence2 = `"Facility manager communications have been logged to ensure rapid resolution on pending site specifications."`;
      } else {
        sentence1 = `"${opName} concluded scheduled service checkpoints across ${siteSummaryStr} under active field variance."`;
        sentence2 = `"Route telemetry and time-on-site logs were adjusted to absorb corridor transit and operational delays."`;
      }
    }
  }

  const fullSummary = `${sentence1} ${sentence2}`;

  return {
    score,
    grade,
    summary: fullSummary,
    warnings,
    totalUppers,
    totalDowners,
    totalSkipped,
  };
}

export function exportToCSV(
  operator: string,
  routeName: string,
  shiftDate: string,
  score: number,
  logs: SiteLog[]
): string {
  const headers = [
    'Site Number',
    'Site Name',
    'Site Address',
    'Property Type',
    'Route Name',
    'Crew Leader',
    'Shift Date',
    'Site Status',
    'Skip Reason',
    'Uppers Count',
    'Uppers Completed',
    'Downers Count',
    'Downers Logged',
    'Route Health Score',
    'Completed Timestamp',
  ];

  const rows = logs.map((log) => [
    `#${log.site.number}`,
    `"${log.site.name.replace(/"/g, '""')}"`,
    `"${log.site.address.replace(/"/g, '""')}"`,
    log.site.type,
    `"${routeName}"`,
    `"${operator}"`,
    `"${shiftDate}"`,
    log.status === 'SKIPPED' ? 'Skipped' : 'Completed',
    `"${(log.skipReason || '').replace(/"/g, '""')}"`,
    log.uppers.length,
    `"${log.uppers.join('; ')}"`,
    log.downers.length,
    `"${log.downers.join('; ')}"`,
    score,
    `"${log.completedAt}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
