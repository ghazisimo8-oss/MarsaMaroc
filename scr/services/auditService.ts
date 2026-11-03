/**
 * SERVICE DU JOURNAL D'AUDIT INALTÉRABLE ET TRAÇABILITÉ
 * SME Marsa Maroc — Port d'Agadir
 */

import { DEMO_AUDIT_LOGS } from '../data/demo/usersData';
import { AuditEvent, UserRole } from '../types';

class AuditService {
  private auditLogs: AuditEvent[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.auditLogs = [...DEMO_AUDIT_LOGS];
  }

  public getLogs(): AuditEvent[] {
    return [...this.auditLogs];
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public logEvent(event: {
    userId: string;
    userName: string;
    userRole: UserRole;
    action: string;
    targetObject: string;
    objectId: string;
    previousValue?: string;
    newValue?: string;
    ipAddress?: string;
    result?: 'SUCCESS' | 'FAILURE' | 'WARNING';
  }): AuditEvent {
    const newLog: AuditEvent = {
      id: `AUD-2026-${String(this.auditLogs.length + 90).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      userId: event.userId,
      userName: event.userName,
      userRole: event.userRole,
      action: event.action,
      targetObject: event.targetObject,
      objectId: event.objectId,
      previousValue: event.previousValue,
      newValue: event.newValue,
      ipAddress: event.ipAddress || '10.20.4.10',
      result: event.result || 'SUCCESS',
    };

    this.auditLogs.unshift(newLog);
    this.notify();
    return newLog;
  }
}

export const auditService = new AuditService();
