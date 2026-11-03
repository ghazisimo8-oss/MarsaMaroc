/**
 * GESTIONNAIRE D'ALERTES ET CYCLE DE VIE OPÉRATEUR
 * SME Marsa Maroc — Port d'Agadir
 */

import { DEMO_ALERTS } from '../data/demo/alertsData';
import { Alert, AlertStatus, User } from '../types';
import { auditService } from './auditService';

class AlertService {
  private alerts: Alert[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.alerts = [...DEMO_ALERTS];
  }

  public getAlerts(): Alert[] {
    return [...this.alerts];
  }

  public getActiveAlertsCount(): number {
    return this.alerts.filter((a) => a.status !== 'CLOSED').length;
  }

  public getCriticalCount(): number {
    return this.alerts.filter((a) => a.priority === 'CRITICAL' && a.status !== 'CLOSED').length;
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

  /**
   * Acquitte une alerte
   */
  public acknowledgeAlert(alertId: string, currentUser: User, comment?: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert || alert.status === 'CLOSED') return false;

    const previousStatus = alert.status;
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = `${currentUser.username} (${currentUser.roleTitle})`;
    if (comment) {
      alert.comments = alert.comments ? `${alert.comments} | ${comment}` : comment;
    }

    alert.events.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'ACQUITTEMENT',
      userId: currentUser.id,
      userName: currentUser.fullName,
      comment: comment || 'Alerte prise en compte par l’opérateur.',
    });

    auditService.logEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'ACQUITTEMENT_ALERTE',
      targetObject: `Alerte ${alert.code} (${alert.substationName})`,
      objectId: alert.id,
      previousValue: `Statut : ${previousStatus}`,
      newValue: 'Statut : ACKNOWLEDGED',
      ipAddress: '10.20.4.10',
      result: 'SUCCESS',
    });

    this.notify();
    return true;
  }

  /**
   * Passe une alerte en cours de traitement
   */
  public setInProgress(alertId: string, currentUser: User, assignee: string, comment?: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    const previousStatus = alert.status;
    alert.status = 'IN_PROGRESS';
    alert.assignee = assignee;
    if (comment) {
      alert.comments = alert.comments ? `${alert.comments} | ${comment}` : comment;
    }

    alert.events.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'PASSAGE_EN_TRAITEMENT',
      userId: currentUser.id,
      userName: currentUser.fullName,
      comment: comment || `Assigné à ${assignee} pour intervention sur site.`,
    });

    auditService.logEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'AFFECTATION_ALERTE',
      targetObject: `Alerte ${alert.code}`,
      objectId: alert.id,
      previousValue: `Statut : ${previousStatus}`,
      newValue: `Statut : IN_PROGRESS (Assigné à ${assignee})`,
      ipAddress: '10.20.4.10',
      result: 'SUCCESS',
    });

    this.notify();
    return true;
  }

  /**
   * Clôture définitivement une alerte avec commentaire obligatoire
   */
  public closeAlert(alertId: string, currentUser: User, closingComment: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    const previousStatus = alert.status;
    alert.status = 'CLOSED';
    alert.closedAt = new Date().toISOString();
    alert.closedBy = `${currentUser.username} (${currentUser.roleTitle})`;
    alert.comments = `${alert.comments} | Clôture : ${closingComment}`;

    alert.events.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'CLÔTURE',
      userId: currentUser.id,
      userName: currentUser.fullName,
      comment: closingComment,
    });

    auditService.logEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CLOTURE_ALERTE',
      targetObject: `Alerte ${alert.code}`,
      objectId: alert.id,
      previousValue: `Statut : ${previousStatus}`,
      newValue: 'Statut : CLOSED',
      ipAddress: '10.20.4.10',
      result: 'SUCCESS',
    });

    this.notify();
    return true;
  }
}

export const alertService = new AlertService();
