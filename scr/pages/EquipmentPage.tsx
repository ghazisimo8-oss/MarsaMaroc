import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Download,
  Wifi,
  WifiOff,
  Edit2,
  Trash2,
  Search,
  Filter,
  Layers,
  Settings2,
  Info,
  RefreshCw,
} from 'lucide-react';
import { DEMO_METERS, DEMO_MODBUS_REGISTERS } from '../data/demo/metersData';
import { DEMO_SUBSTATIONS } from '../data/demo/substationsData';
import { Meter, ModbusRegisterMapping } from '../types';
import { exportToCsv } from '../lib/exportUtils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { auditService } from '../services/auditService';

export const EquipmentPage: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const { showToast } = useToast();

  const [meters, setMeters] = useState<Meter[]>(DEMO_METERS);
  const [selectedSubstation, setSelectedSubstation] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [testingMeterId, setTestingMeterId] = useState<string | null>(null);

  // Formulaire d'ajout
  const [newMeterForm, setNewMeterForm] = useState({
    code: 'PM-P1-CRANE-03',
    name: 'Départ Grue Mobile n°3 — Quai Nord',
    substationId: 'P1',
    manufacturer: 'Schneider Electric (Démo)',
    model: 'PowerLogic PM5350',
    serialNumber: 'SN-PM53-2026-999',
    ipAddress: '192.168.10.19',
    port: 502,
    slaveId: 4,
    protocol: 'MODBUS_TCP' as const,
    pollingIntervalSeconds: 5,
    isExistingReused: false,
  });

  const filteredMeters = meters.filter((m) => {
    if (selectedSubstation !== 'ALL' && m.substationId !== selectedSubstation) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = `${m.name} ${m.code} ${m.manufacturer} ${m.model} ${m.ipAddress}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  const handleTestConnection = (meter: Meter) => {
    setTestingMeterId(meter.id);
    setTimeout(() => {
      setTestingMeterId(null);
      if (meter.status === 'TIMEOUT' || meter.status === 'OFFLINE') {
        showToast({
          type: 'error',
          title: 'Échec Test Modbus TCP',
          message: `Délai d'attente dépassé (3000 ms) sur ${meter.ipAddress}:${meter.port}. Vérifier liaison switch OT.`,
        });
      } else {
        showToast({
          type: 'success',
          title: 'Test de Connectivité Réussi',
          message: `Réponse socket OK sur ${meter.ipAddress}:${meter.port} (RTT : ${meter.latencyMs} ms). Registres lisibles.`,
        });
      }
    }, 600);
  };

  const handleToggleStatus = (meter: Meter) => {
    if (!hasPermission('MANAGE_EQUIPMENT')) {
      showToast({
        type: 'error',
        title: 'Action Restreinte (RBAC)',
        message: 'Vous devez avoir le rôle Administrateur pour modifier l’état d’un équipement.',
      });
      return;
    }

    const newStatus = meter.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    setMeters(
      meters.map((m) => (m.id === meter.id ? { ...m, status: newStatus } : m))
    );

    auditService.logEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'MODIFICATION_STATUT_COMPTEUR',
      targetObject: `Compteur ${meter.code} (${meter.substationId})`,
      objectId: meter.id,
      previousValue: `Statut : ${meter.status}`,
      newValue: `Statut : ${newStatus}`,
      ipAddress: '10.20.4.10',
      result: 'SUCCESS',
    });

    showToast({
      type: 'info',
      title: 'Statut Mis à Jour',
      message: `${meter.code} basculé en ${newStatus}.`,
    });
  };

  const handleCreateMeter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('MANAGE_EQUIPMENT')) {
      showToast({
        type: 'error',
        title: 'Droits Insuffisants',
        message: 'Seul l’Administrateur technique peut créer de nouveaux équipements.',
      });
      return;
    }

    const created: Meter = {
      id: `MTR-${Date.now().toString().slice(-4)}`,
      code: newMeterForm.code,
      name: newMeterForm.name,
      substationId: newMeterForm.substationId,
      manufacturer: newMeterForm.manufacturer,
      model: newMeterForm.model,
      serialNumber: newMeterForm.serialNumber,
      ipAddress: newMeterForm.ipAddress,
      port: Number(newMeterForm.port),
      slaveId: Number(newMeterForm.slaveId),
      protocol: newMeterForm.protocol,
      pollingIntervalSeconds: Number(newMeterForm.pollingIntervalSeconds),
      status: 'ONLINE',
      lastReadingTimestamp: new Date().toISOString(),
      latencyMs: 16,
      firmwareVersion: 'v1.0.0',
      isExistingReused: newMeterForm.isExistingReused,
    };

    setMeters([created, ...meters]);
    setShowAddModal(false);

    auditService.logEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'AJOUT_EQUIPEMENT_COMPTEUR',
      targetObject: `Nouveau Compteur ${created.code}`,
      objectId: created.id,
      newValue: `IP: ${created.ipAddress} | Modèle: ${created.model} | Poste: ${created.substationId}`,
      ipAddress: '10.20.4.10',
      result: 'SUCCESS',
    });

    showToast({
      type: 'success',
      title: 'Compteur Enregistré',
      message: `La centrale de mesure ${created.code} a été raccordée au banc d'acquisition.`,
    });
  };

  const handleExportCsv = () => {
    exportToCsv(
      meters,
      [
        { header: 'ID', accessor: (m) => m.id },
        { header: 'Code', accessor: (m) => m.code },
        { header: 'Désignation', accessor: (m) => m.name },
        { header: 'Poste', accessor: (m) => m.substationId },
        { header: 'Fabricant', accessor: (m) => m.manufacturer },
        { header: 'Modèle', accessor: (m) => m.model },
        { header: 'Numéro Série', accessor: (m) => m.serialNumber },
        { header: 'Adresse IP', accessor: (m) => m.ipAddress },
        { header: 'Port TCP', accessor: (m) => m.port },
        { header: 'Esclave Modbus (Unit ID)', accessor: (m) => m.slaveId },
        { header: 'Protocole', accessor: (m) => m.protocol },
        { header: 'Période Scrutation (s)', accessor: (m) => m.pollingIntervalSeconds },
        { header: 'Statut', accessor: (m) => m.status },
        { header: 'Existant Réutilisé', accessor: (m) => (m.isExistingReused ? 'OUI' : 'NON') },
      ],
      'SME_Inventaire_Compteurs_Modbus'
    );
    showToast({
      type: 'success',
      title: 'Export Réussi',
      message: `${meters.length} centrales de mesure exportées en CSV UTF-8.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold uppercase tracking-wider mb-0.5">
            Inventaire Matériel & Topologie de Démonstration (À valider DEPA)
          </p>
          <p className="opacity-90 leading-relaxed">
            Les adresses IP (192.168.10.x), les références constructeurs (Schneider Electric, Socomec, Siemens)
            et les numéros de série sont des données fictives destinées à prouver le fonctionnement complet
            du paramétrage et de l'interopérabilité multimarque sans divulguer d'informations sensibles.
          </p>
        </div>
      </div>

      {/* Header & Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-500" />
            <span>Inventaire des Équipements & Centrales de Mesure</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              {meters.length} compteurs
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Gestion du parc d'instrumentation Modbus TCP/IP et cartographie des registres industriels
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter un compteur</span>
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

      {/* Barre de filtres */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher compteur, IP, modèle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-marsa-500"
            />
          </div>

          <select
            value={selectedSubstation}
            onChange={(e) => setSelectedSubstation(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="ALL">Tous les postes ({meters.length})</option>
            {DEMO_SUBSTATIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredMeters.length} compteur(s) filtré(s)
        </span>
      </div>

      {/* Tableau des compteurs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Compteur & Code</th>
                <th className="py-2.5 px-3">Poste</th>
                <th className="py-2.5 px-3">Fabricant & Modèle</th>
                <th className="py-2.5 px-3">Adresse IP : Port</th>
                <th className="py-2.5 px-3">Esclave (Unit ID)</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredMeters.map((meter) => {
                const isDown = meter.status === 'OFFLINE' || meter.status === 'TIMEOUT';
                const isTesting = testingMeterId === meter.id;

                return (
                  <tr key={meter.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{meter.name}</div>
                      <span className="font-mono text-[10px] text-slate-400">{meter.code}</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-700 dark:text-slate-300">
                      {meter.substationId}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-300">
                      <div>{meter.manufacturer}</div>
                      <span className="font-mono text-[10px] text-slate-400">{meter.model}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-bold">
                      {meter.ipAddress}:{meter.port}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      ID {meter.slaveId}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          meter.isExistingReused
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        }`}
                      >
                        {meter.isExistingReused ? 'Existant intégré' : 'Neuf contractuel'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          !isDown
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {meter.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTestConnection(meter)}
                          disabled={isTesting}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Tester connectivité"
                        >
                          <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                          <span>Test</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(meter)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          title={isDown ? 'Activer' : 'Désactiver'}
                        >
                          {isDown ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-rose-600" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cartographie type des registres Modbus d'une centrale (PM8000 / PAC3200) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-sky-500" />
              <span>Matrice Paramétrique des Registres Modbus (Holding Registers — Code 0x03)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Décodage IEEE 754 flottant 32 bits et facteurs d'échelle appliqués lors de la conversion
            </p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-1 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 rounded border border-sky-200 dark:border-sky-800">
            Standard Modbus TCP
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2 px-3">Adresse Registre</th>
                <th className="py-2 px-3">Variable Mesurée</th>
                <th className="py-2 px-3">Format Donnée</th>
                <th className="py-2 px-3">Unité</th>
                <th className="py-2 px-3">Facteur d'Échelle</th>
                <th className="py-2 px-3">Catégorie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {DEMO_MODBUS_REGISTERS.map((reg) => (
                <tr key={reg.address} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-bold text-sky-600 dark:text-sky-400">
                    3000{reg.address.toString().slice(-2)} ({reg.address})
                  </td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-900 dark:text-slate-100">
                    {reg.name} ({reg.description})
                  </td>
                  <td className="py-2 px-3 text-slate-500">{reg.dataType}</td>
                  <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300">{reg.unit}</td>
                  <td className="py-2 px-3 text-slate-500">{reg.scaleFactor}</td>
                  <td className="py-2 px-3 font-sans">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {reg.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout Compteur */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Raccorder un Nouveau Compteur Modbus TCP</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeter} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Code Équipement
                  </label>
                  <input
                    type="text"
                    value={newMeterForm.code}
                    onChange={(e) => setNewMeterForm({ ...newMeterForm, code: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Poste d'Appartenance
                  </label>
                  <select
                    value={newMeterForm.substationId}
                    onChange={(e) => setNewMeterForm({ ...newMeterForm, substationId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                  >
                    {DEMO_SUBSTATIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} — {s.name.split('—')[1]?.trim() || s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Désignation Fonctionnelle
                </label>
                <input
                  type="text"
                  value={newMeterForm.name}
                  onChange={(e) => setNewMeterForm({ ...newMeterForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Fabricant (Démo)
                  </label>
                  <input
                    type="text"
                    value={newMeterForm.manufacturer}
                    onChange={(e) => setNewMeterForm({ ...newMeterForm, manufacturer: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Modèle de Centrale
                  </label>
                  <input
                    type="text"
                    value={newMeterForm.model}
                    onChange={(e) => setNewMeterForm({ ...newMeterForm, model: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Adresse IP
                  </label>
                  <input
                    type="text"
                    value={newMeterForm.ipAddress}
                    onChange={(e) => setNewMeterForm({ ...newMeterForm, ipAddress: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Port TCP
                  </label>
                  <input
                    type="number"
                    value={newMeterForm.port}
                    onChange={(e) => setNewMeterForm({ ...newMeterForm, port: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Unit ID Esclave
                  </label>
                  <input
                    type="number"
                    value={newMeterForm.slaveId}
                    onChange={(e) => setNewMeterForm({ ...newMeterForm, slaveId: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reused"
                  checked={newMeterForm.isExistingReused}
                  onChange={(e) => setNewMeterForm({ ...newMeterForm, isExistingReused: e.target.checked })}
                  className="rounded border-slate-300 text-marsa-600 focus:ring-marsa-500"
                />
                <label htmlFor="reused" className="text-slate-700 dark:text-slate-300 text-xs">
                  Compteur existant à réintégrer sans remplacement physique
                </label>
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
                  Valider le Raccordement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
