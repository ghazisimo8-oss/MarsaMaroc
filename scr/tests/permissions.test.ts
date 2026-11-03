import { describe, it, expect } from 'vitest';
import { DEMO_USERS } from '../data/demo/usersData';
import { User, UserRole } from '../types';

describe('Contrôle d’Accès & Habilitations RBAC (4 Profils)', () => {
  const admin = DEMO_USERS.find((u) => u.role === 'ADMIN')!;
  const energyManager = DEMO_USERS.find((u) => u.role === 'ENERGY_MANAGER')!;
  const operator = DEMO_USERS.find((u) => u.role === 'OPERATOR')!;
  const reader = DEMO_USERS.find((u) => u.role === 'READER')!;

  const checkUserPermission = (user: User, permission: string): boolean => {
    if (user.role === 'ADMIN') return true;
    return user.permissions.includes(permission);
  };

  it('fournit les 4 profils contractuels du projet', () => {
    expect(admin).toBeDefined();
    expect(energyManager).toBeDefined();
    expect(operator).toBeDefined();
    expect(reader).toBeDefined();
  });

  it('accorde tous les privilèges à l’Administrateur technique', () => {
    expect(checkUserPermission(admin, 'manage_meters')).toBe(true);
    expect(checkUserPermission(admin, 'edit_ipe')).toBe(true);
    expect(checkUserPermission(admin, 'edit_ser')).toBe(true);
    expect(checkUserPermission(admin, 'manage_users')).toBe(true);
    expect(checkUserPermission(admin, 'configure_modbus')).toBe(true);
  });

  it('accorde les droits ISO 50001 (IPE & SER) au Responsable Énergie mais interdit la gestion des comptes', () => {
    expect(checkUserPermission(energyManager, 'edit_ipe')).toBe(true);
    expect(checkUserPermission(energyManager, 'edit_ser')).toBe(true);
    expect(checkUserPermission(energyManager, 'generate_reports')).toBe(true);
    expect(checkUserPermission(energyManager, 'manage_users')).toBe(false);
    expect(checkUserPermission(energyManager, 'manage_meters')).toBe(false);
  });

  it('accorde le traitement opérationnel des alertes à l’Exploitant', () => {
    expect(checkUserPermission(operator, 'view_monitoring')).toBe(true);
    expect(checkUserPermission(operator, 'manage_alerts')).toBe(true);
    expect(checkUserPermission(operator, 'export_data')).toBe(true);
    expect(checkUserPermission(operator, 'edit_ser')).toBe(false);
    expect(checkUserPermission(operator, 'manage_users')).toBe(false);
  });

  it('limite l’Auditeur / Lecteur à la seule consultation et export', () => {
    expect(checkUserPermission(reader, 'view_monitoring')).toBe(true);
    expect(checkUserPermission(reader, 'export_data')).toBe(true);
    expect(checkUserPermission(reader, 'manage_alerts')).toBe(false);
    expect(checkUserPermission(reader, 'edit_ipe')).toBe(false);
    expect(checkUserPermission(reader, 'configure_modbus')).toBe(false);
  });
});
