export const ADMIN_REPORT_STATUSES = [
  "PENDING",
  "INVESTIGATING",
  "RESOLVED_APPROVED",
  "RESOLVED_REMOVED",
  "RESOLVED_IGNORED",
  "CLOSED",
] as const;

export const ADMIN_REPORT_TARGET_TYPES = [
  "USER",
  "POST",
  "PROJECT",
  "HUB",
  "MESSAGE",
  "COMMENT",
  "CONVERSATION",
] as const;

export const ADMIN_REPORT_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const ADMIN_REPORT_REASONS = [
  "SPAM",
  "INAPPROPRIATE",
  "HARASSMENT",
  "HATE_SPEECH",
  "VIOLENCE",
  "SELF_HARM",
  "FALSE_INFORMATION",
  "COPYRIGHT_VIOLATION",
  "OTHER",
] as const;

export type AdminReportStatus = (typeof ADMIN_REPORT_STATUSES)[number];
export type AdminReportTargetType = (typeof ADMIN_REPORT_TARGET_TYPES)[number];
export type AdminReportSeverity = (typeof ADMIN_REPORT_SEVERITIES)[number];
export type AdminReportReason = (typeof ADMIN_REPORT_REASONS)[number];

export type AdminModerationAction = "APPROVE" | "REMOVE" | "IGNORE";
export type AdminEnforcementAction = "SUSPEND" | "BAN" | "HIDE" | "WARN";

export interface AdminReportActor {
  id: string;
  name?: string | null;
  username?: string | null;
}

export interface AdminReportRecord {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: AdminReportTargetType | string;
  reason: AdminReportReason | string;
  description?: string | null;
  severity: AdminReportSeverity | string;
  status: AdminReportStatus | string;
  metadata?: Record<string, unknown> | null;
  resolution?: string | null;
  resolvedAt?: string | null;
  reviewedById?: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: AdminReportActor | null;
  reviewer?: AdminReportActor | null;
}

export function isResolvedReportStatus(status: string): boolean {
  return status.startsWith("RESOLVED_") || status === "CLOSED";
}

export function isReportActionable(status: string): boolean {
  return status === "PENDING" || status === "INVESTIGATING";
}

export function mapModerationActionToPayload(
  action: AdminModerationAction,
  targetType: string,
  resolution: string,
  severity?: AdminReportSeverity
): {
  action: AdminModerationAction;
  status: AdminReportStatus;
  resolution: string;
  enforcementAction?: AdminEnforcementAction;
  severity?: AdminReportSeverity;
} {
  if (action === "APPROVE") {
    return {
      action,
      status: "RESOLVED_APPROVED",
      resolution,
      severity,
    };
  }

  if (action === "REMOVE") {
    return {
      action,
      status: "RESOLVED_REMOVED",
      resolution,
      enforcementAction: targetType === "USER" ? "SUSPEND" : "HIDE",
      severity,
    };
  }

  return {
    action,
    status: "RESOLVED_IGNORED",
    resolution,
    severity,
  };
}
