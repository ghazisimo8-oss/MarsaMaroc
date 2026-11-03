import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Key,
  Lock,
  Plus,
  CheckCircle2,
  XCircle,
  Info,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { DEMO_USERS } from '../data/demo/usersData';
import { User, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { exportToCsv } from '../lib/exportUtils';
import { auditService } from '../services/auditService';

export const UsersPage: React.FC = () => {
  const { currentUser, switchRole, hasPermission } = useAuth();
  const { showToast } = useToast();
  const [usersList, setUsersList] = useState<User[]>(DEMO_USERS);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [newUserForm, setNewUserForm] = useState({
    username: 'k.alami',
    fullName: 'Karim Alami',
    role: 'OPERATOR' as UserRole,
    roleTitle: 'Technicien de Maintenance Électrique',
    email: 'k.alami@marsamaroc.co.ma (Démo)',
    department: 'Exploitation Portuaire',
    avatarInitials: 'KA',
  });

  const rbacMatrix = [
    {
      permission: 'Consultation Dashboard & Temps Réel',
      code: 'VIEW_DASHBOARD',
      ADMIN: true,
      ENERGY_MANAGER: true,
      OPERATOR: true,
      READER: true,
    },
    {
      permission: 'Acquittement & Traitement des Alertes',
      code: 'ACKNOWLEDGE_ALERTS',
      ADMIN: true,
      ENERGY_MANAGER: true,
      OPERATOR: true,
      READER: false,
    },
    {
      permission: 'Clôture Définitive des Incidents',
      code: 'CLOSE_ALERTS',
      ADMIN: true,
      ENERGY_MANAGER: true,
      OPERATOR: false,
      READER: false,
    },
    {
      permission: 'Gestion des IPE & Formules ISO 50001',
      code: 'MANAGE_IPE',
      ADMIN: true,
      ENERGY_MANAGER: true,
      OPERATOR: false,
      READER: false,
    },
    {
      permission: 'Ajustement & Versionnage Baseline SER',
      code: 'MANAGE_SER',
      ADMIN: true,
      ENERGY_MANAGER: true,
      OPERATOR: false,
      READER: false,
    },
    {
      permission: 'Génération & Export des Rapports',
      code: 'EXPORT_REPORTS',
      ADMIN: true,
      ENERGY_MANAGER: true,
      OPERATOR: true,
      READER: true,
    },
    {
      permission: 'Configuration des Compteurs & Modbus',
      code: 'MANAGE_EQUIPMENT',
      ADMIN: true,
      ENERGY_MANAGER: false,
      OPERATOR: false,
      READER: false,
    },
    {
      permission: 'Administration Utilisateurs & Rôles',
      code: 'MANAGE_USERS',
      ADMIN: true,
      ENERGY_MANAGER: false,
      OPERATOR: false,
      READER: false,
    },
    {
      permission: 'Tests de Restauration Sauvegarde (PCA)',
      code: 'EXECUTE_PCA_TEST',
      ADMIN: true,
      ENERGY_MANAGER: false,
      OPERATOR: false,
      READER: false,
    },
  ];

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('MANAGE_USERS')) {
      showToast({
        type: 'error',
        title: 'Action Restreinte',
        message: 'Seul l’Administrateur technique peut créer des utilisateurs.',
      });
      return;
    }

    const created: User = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      username: newUserForm.username,
      fullName: newUserForm.fullName,
      role: newUserForm.role,
      roleTitle: newUserForm.roleTitle,
      email: newUserForm.email,
      department: newUserForm.department,
      avatarInitials: newUserForm.avatarInitials,
      permissions: ['view_monitoring', 'export_data'],
    };

    setUsersList([...usersList, created]);
    setShowAddModal(false);

    auditService.logEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATION_UTILISATEUR',
      targetObject: `Utilisateur ${created.fullName} (${created.username})`,
      objectId: created.id,
      newValue: `Rôle: ${created.role} | Dép: ${created.department}`,
      ipAddress: '10.20.4.10',
      result: 'SUCCESS',
    });

    showToast({
      type: 'success',
      title: 'Utilisateur Ajouté',
      message: `${created.fullName} a été créé avec le rôle ${created.role}.`,
    });
  };

  const handleExportCsv = () => {
    exportToCsv(
      usersList,
      [
        { header: 'ID', accessor: (u) => u.id },
        { header: 'Nom Complet', accessor: (u) => u.fullName },
        { header: 'Identifiant', accessor: (u) => u.username },
        { header: 'Rôle', accessor: (u) => u.role },
        { header: 'Fonction', accessor: (u) => u.roleTitle },
        { header: 'Département', accessor: (u) => u.department },
        { header: 'Email Professionnel', accessor: (u) => u.email },
      ],
      'SME_Utilisateurs_Habilitations_RBAC'
    );
    showToast({
      type: 'success',
      title: 'Export Utilisateurs',
      message: 'Liste des comptes et habilitations téléchargée en CSV.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold uppercase tracking-wider mb-0.5">
            Comptes de Démonstration & Matrice des Habilitations RBAC (À valider DEPA)
          </p>
          <p className="opacity-90 leading-relaxed">
            Pour faciliter l'évaluation contradictoire, vous pouvez basculer instantanément de rôle
            grâce au sélecteur actif ci-dessous. Le changement de rôle restreint ou autorise en temps réel
            les boutons d'action (acquittement d'alerte, modification de paramètres, test PCA) et consigne l'événement dans le journal d'audit.
          </p>
        </div>
      </div>

      {/* Header & Sélecteur Rapide de Rôle pour la Démo */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-500" />
            <span>Gestion des Utilisateurs & Habilitations RBAC</span>
          </h2>
          <p className="text-xs text-slate-500">
            Contrôle d'accès basé sur les rôles (Moindre privilège, traçabilité et séparation des tâches)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer un utilisateur</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* BANDEAU COMMUTATEUR DE PROFIL ACTIF (DÉMO INTERACTIVE) */}
      <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-marsa-600 flex items-center justify-center font-bold text-sm shadow">
            {currentUser.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{currentUser.fullName}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400">{currentUser.roleTitle} — {currentUser.department}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Simuler le profil :</span>
          <div className="flex flex-wrap gap-1.5">
            {usersList.map((user) => (
              <button
                key={user.id}
                onClick={() => switchRole(user.role)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  currentUser.role === user.role
                    ? 'bg-sky-500 text-white shadow-sm ring-2 ring-sky-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {user.role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des Utilisateurs de Démonstration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {usersList.map((user) => {
          const isCurrent = currentUser.id === user.id;

          return (
            <div
              key={user.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 shadow-md ring-1 ring-sky-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                    {user.avatarInitials}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      user.role === 'ADMIN'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : user.role === 'ENERGY_MANAGER'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : user.role === 'OPERATOR'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.fullName}</h3>
                <span className="text-[11px] font-mono text-slate-400 block">{user.username}</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">
                  {user.roleTitle}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{user.department}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => switchRole(user.role)}
                  className={`w-full text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors ${
                    isCurrent
                      ? 'bg-sky-600 text-white border-transparent'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isCurrent ? 'Profil Actif' : 'Endosser ce rôle'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Matrice RBAC des Permissions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Key className="w-4 h-4 text-sky-500" />
            <span>Matrice de Contrôle d'Accès Basée sur les Rôles (RBAC)</span>
          </h4>
          <p className="text-xs text-slate-500">
            Droit d'accès et d'action attribués selon la fonction opérationnelle
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Fonctionnalité & Permission</th>
                <th className="py-2.5 px-3 text-center">Admin Technique</th>
                <th className="py-2.5 px-3 text-center">Resp. Énergie</th>
                <th className="py-2.5 px-3 text-center">Exploitant MT/BT</th>
                <th className="py-2.5 px-3 text-center">Auditeur / Lecteur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rbacMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                    <div>{row.permission}</div>
                    <span className="font-mono text-[10px] text-slate-400">{row.code}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.ADMIN ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.ENERGY_MANAGER ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.OPERATOR ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.READER ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Création Utilisateur */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Créer un Compte Utilisateur</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nom Complet
                </label>
                <input
                  type="text"
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Identifiant
                  </label>
                  <input
                    type="text"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Rôle
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold"
                  >
                    <option value="OPERATOR">OPERATOR (Exploitant)</option>
                    <option value="ENERGY_MANAGER">ENERGY_MANAGER (Resp. Énergie)</option>
                    <option value="ADMIN">ADMIN (Administrateur)</option>
                    <option value="READER">READER (Lecteur)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Intitulé du Poste
                </label>
                <input
                  type="text"
                  value={newUserForm.roleTitle}
                  onChange={(e) => setNewUserForm({ ...newUserForm, roleTitle: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Département
                </label>
                <input
                  type="text"
                  value={newUserForm.department}
                  onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                >
                  Créer le Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
