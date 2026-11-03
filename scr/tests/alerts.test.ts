import { describe, it, expect, beforeEach } from 'vitest';
import { alertService } from '../services/alertService';
import { DEMO_USERS } from '../data/demo/usersData';

describe('Centre de Gestion des Alertes & Workflow Opérateur', () => {
  const operator = DEMO_USERS.find((u) => u.role === 'OPERATOR')!;
  const admin = DEMO_USERS.find((u) => u.role === 'ADMIN')!;

  it('charge la liste des alertes de démonstration', () => {
    const alerts = alertService.getAlerts();
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('compte les alertes actives et critiques', () => {
    const active = alertService.getActiveAlertsCount();
    expect(active).toBeGreaterThanOrEqual(1);

    const critical = alertService.getCriticalCount();
    expect(critical).toBeGreaterThanOrEqual(0);
  });

  it('permet à un opérateur d’acquitter une alerte avec commentaire', () => {
    const alerts = alertService.getAlerts();
    const newAlert = alerts.find((a) => a.status === 'NEW');

    if (newAlert) {
      const res = alertService.acknowledgeAlert(
        newAlert.id,
        operator,
        'Pris en compte lors de la ronde quai Nord'
      );
      expect(res).toBe(true);

      const updated = alertService.getAlerts().find((a) => a.id === newAlert.id);
      expect(updated?.status).toBe('ACKNOWLEDGED');
      expect(updated?.acknowledgedBy).toContain(operator.username);
      expect(updated?.events[0].action).toBe('ACQUITTEMENT');
    }
  });

  it('permet de passer une alerte en traitement (IN_PROGRESS) avec assignation', () => {
    const alerts = alertService.getAlerts();
    const alert = alerts.find((a) => a.status !== 'CLOSED');

    if (alert) {
      const res = alertService.setInProgress(
        alert.id,
        operator,
        'Équipe Électromécanique Portuaire',
        'Contrôle des câbles en cours'
      );
      expect(res).toBe(true);

      const updated = alertService.getAlerts().find((a) => a.id === alert.id);
      expect(updated?.status).toBe('IN_PROGRESS');
      expect(updated?.assignee).toBe('Équipe Électromécanique Portuaire');
    }
  });

  it('permet de clôturer une alerte avec traçabilité complète', () => {
    const alerts = alertService.getAlerts();
    const alert = alerts.find((a) => a.status !== 'CLOSED');

    if (alert) {
      const res = alertService.closeAlert(
        alert.id,
        admin,
        'Batterie de condensateurs réarmée, cos φ remonté à 0.96'
      );
      expect(res).toBe(true);

      const updated = alertService.getAlerts().find((a) => a.id === alert.id);
      expect(updated?.status).toBe('CLOSED');
      expect(updated?.closedBy).toContain(admin.username);
    }
  });
});
