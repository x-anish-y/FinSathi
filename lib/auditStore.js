/**
 * In-memory audit log store — works even without MongoDB.
 * Keeps the last 200 entries in memory for the Audit Trail page.
 */

const MAX_ENTRIES = 200;

if (!global.__auditLogs) {
  global.__auditLogs = [];
}

export function addAuditLog(entry) {
  global.__auditLogs.unshift({
    ...entry,
    _id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
  });
  if (global.__auditLogs.length > MAX_ENTRIES) {
    global.__auditLogs.length = MAX_ENTRIES;
  }
}

export function getAuditLogs(filter = {}, limit = 50) {
  let logs = global.__auditLogs;
  if (filter.module) {
    logs = logs.filter(l => l.module === filter.module);
  }
  return logs.slice(0, limit);
}
