import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  Pause,
  RefreshCw,
  Wifi,
  WifiOff,
  Download,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  Info,
  Clock,
  Radio,
  FileText,
} from 'lucide-react';
import { modbusSimulator, ModbusPacketLog } from '../services/modbusSimulator';
import { DEMO_METERS } from '../data/demo/metersData';
import { ModbusReading, DataQuality } from '../types';
import { exportToCsv } from '../lib/exportUtils';
import { useToast } from '../context/ToastContext';
import { QualityBadge } from '../components/common/QualityBadge';

export const ModbusSimulatorPage: React.FC = () => {
  const { showToast } = useToast();

  const [selectedMeterId, setSelectedMeterId] = useState<string>(DEMO_METERS[0].id);
  const [selectedMeter, setSelectedMeter] = useState(DEMO_METERS[0]);
  const [readings, setReadings] = useState<ModbusReading[]>([]);
  const [packetLogs, setPacketLogs] = useState<ModbusPacketLog[]>([]);
  const [isSimulatingDown, setIsSimulatingDown] = useState<boolean>(false);
  const [isAutoPoll, setIsAutoPoll] = useState<boolean>(true);
  const [pollIntervalSec, setPollIntervalSec] = useState<number>(3);
  const [transactionCount, setTransactionCount] = useState<number>(1042);
  const [lastRtt, setLastRtt] = useState<number>(18);

  // Synchronisation du compteur sélectionné
  useEffect(() => {
    const found = DEMO_METERS.find((m) => m.id === selectedMeterId) || DEMO_METERS[0];
    setSelectedMeter(found);
  }, [selectedMeterId]);

  // Exécution d'une lecture Modbus
  const executeRead = () => {
    const res = modbusSimulator.readRegisters(
      selectedMeter.ipAddress,
      selectedMeter.port,
      selectedMeter.slaveId,
      3000
    );

    setReadings(res.readings);
    setPacketLogs(modbusSimulator.getRecentLogs());
    setTransactionCount((c) => c + 1);
    setLastRtt(res.packetLog.responseTimeMs);

    return res;
  };

  // Première lecture
  useEffect(() => {
    executeRead();
  }, [selectedMeter]);

  // Boucle de scrutation
  useEffect(() => {
    if (!isAutoPoll) return;
    const interval = setInterval(() => {
      executeRead();
    }, pollIntervalSec * 1000);
    return () => clearInterval(interval);
  }, [isAutoPoll, pollIntervalSec, selectedMeter, isSimulatingDown]);

  const handleToggleNetworkFailure = () => {
    const targetState = !isSimulatingDown;
    setIsSimulatingDown(targetState);
    modbusSimulator.toggleNetworkCut(targetState);

    if (targetState) {
      showToast({
        type: 'warning',
        title: 'Simulation Coupure Réseau Activée',
        message: 'Socket TCP déconnecté. Les scrutations Modbus vont échouer en TIMEOUT (3000 ms).',
      });
    } else {
      showToast({
        type: 'success',
        title: 'Liaison Réseau Rétablie',
        message: 'Reconnexion socket réussie. Flux de télémétrie rétabli.',
      });
    }
    executeRead();
  };

  const handleManualPoll = () => {
    const res = executeRead();
    if (res.packetLog.status === 'SUCCESS') {
      showToast({
        type: 'info',
        title: 'Trame Modbus Acquise',
        message: `Lecture de 14 registres réussie en ${res.packetLog.responseTimeMs} ms.`,
      });
    } else {
      showToast({
        type: 'error',
        title: 'Erreur Timeout Modbus',
        message: `Aucune réponse de l'équipement ${selectedMeter.ipAddress}:${selectedMeter.port}.`,
      });
    }
  };

  const handleDownloadLogs = () => {
    exportToCsv(
      packetLogs,
      [
        { header: 'ID Log', accessor: (l) => l.id },
        { header: 'Horodatage', accessor: (l) => l.timestamp },
        { header: 'Transaction ID', accessor: (l) => l.transactionId },
        { header: 'Protocole', accessor: (l) => l.protocolId },
        { header: 'Unit ID', accessor: (l) => l.unitId },
        { header: 'Fonction Modbus', accessor: (l) => `0x0${l.functionCode}` },
        { header: 'Adresse Début', accessor: (l) => l.startRegister },
        { header: 'Nombre Registres', accessor: (l) => l.registerCount },
        { header: 'Temps Réponse (ms)', accessor: (l) => l.responseTimeMs },
        { header: 'Statut', accessor: (l) => l.status },
        { header: 'Trame Hexadécimale', accessor: (l) => l.hexDump },
      ],
      `SME_Journal_Trames_Modbus_${selectedMeter.code}`
    );
    showToast({
      type: 'success',
      title: 'Export Trames Téléchargé',
      message: 'Journal protocolaire des échanges Modbus TCP sauvegardé.',
    });
  };

  const isCurrentDown = isSimulatingDown || selectedMeter.status === 'TIMEOUT';

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold uppercase tracking-wider mb-0.5">
            Banc de Test & Simulation Modbus TCP/IP (À valider DEPA)
          </p>
          <p className="opacity-90 leading-relaxed">
            Ce module simule fidèlement la couche protocolaire Modbus TCP/IP (RFC 793 / Modbus Application Protocol v1.1b3),
            la construction des trames MBAP, la scrutation cyclique et la gestion des exceptions réseau.
            Aucune trame n’est émise vers les équipements de production du port.
          </p>
        </div>
      </div>

      {/* Barre de contrôle du banc d'essai */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-sky-500 animate-pulse" />
            <span>Simulateur & Analyseur de Protocole Modbus TCP/IP</span>
          </h2>
          <p className="text-xs text-slate-500">
            Scrutation temps réel des Holding Registers (0x03) et analyse des trames MBAP
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Choix compteur */}
          <select
            value={selectedMeterId}
            onChange={(e) => setSelectedMeterId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-marsa-500"
          >
            {DEMO_METERS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} — {m.name} [{m.ipAddress}]
              </option>
            ))}
          </select>

          {/* Bouton lecture manuelle */}
          <button
            onClick={handleManualPoll}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Interroger</span>
          </button>

          {/* Bouton Pause / Reprise */}
          <button
            onClick={() => setIsAutoPoll(!isAutoPoll)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
              isAutoPoll
                ? 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            }`}
          >
            {isAutoPoll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoPoll ? 'Mettre en pause' : 'Reprendre le flux'}</span>
          </button>

          {/* Bouton injecteur d'incident réseau */}
          <button
            onClick={handleToggleNetworkFailure}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              isSimulatingDown
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isSimulatingDown ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isSimulatingDown ? 'Panne réseau simulée active' : 'Simuler coupure réseau'}</span>
          </button>

          {/* Export trames */}
          <button
            onClick={handleDownloadLogs}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Journal (.csv)</span>
          </button>
        </div>
      </div>

      {/* Cartes KPI Modbus */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Statut Prise Socket
          </span>
          <div className="text-xl font-bold font-mono mt-1 flex items-center gap-1.5">
            {!isCurrentDown ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">CONNECTÉ</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span className="text-rose-600 dark:text-rose-400">TIMEOUT</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Port TCP 502 / KeepAlive 15s
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Temps Réponse (RTT)
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {!isCurrentDown ? `${lastRtt} ms` : '3 000 ms'}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Gigue réseau OT &lt; 25 ms
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Compteur de Transactions
          </span>
          <div className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
            #{transactionCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Trames MBAP séquencées
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Fréquence Scrutation
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {pollIntervalSec} sec
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Scrutation continue active
          </p>
        </div>
      </div>

      {/* Grille : Table des Registres Lus (Gauche) + Sniffer Hexadécimal (Droite) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table des Registres */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-500" />
                <span>Valeurs Décodées — Holding Registers (3000 à 3026)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Conversion en unités physiques avec facteur d'échelle
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              {readings.length} variables
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold font-sans">
                <tr>
                  <th className="py-2 px-3">Registre</th>
                  <th className="py-2 px-3">Grandeur</th>
                  <th className="py-2 px-3 text-right">Brute</th>
                  <th className="py-2 px-3 text-right">Convertie</th>
                  <th className="py-2 px-3 text-center">Qualité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {readings.map((reading) => (
                  <tr key={reading.address} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 text-sky-600 dark:text-sky-400 font-bold">
                      {reading.address}
                    </td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-900 dark:text-slate-100">
                      {reading.name}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500">
                      {reading.rawValue}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {reading.convertedValue.toLocaleString()} {reading.unit}
                    </td>
                    <td className="py-2 px-3 text-center font-sans">
                      <QualityBadge quality={reading.quality} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sniffer / Console Trames MBAP */}
        <div className="bg-slate-950 text-slate-200 rounded-xl border border-slate-800 shadow-sm p-4 flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-100 text-xs">
                Console Trame MBAP & Analyseur Hexadécimal
              </span>
            </div>
            <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Header TCP / Function 0x03
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[460px] pr-1">
            {packetLogs.map((log) => {
              const isOk = log.status === 'SUCCESS';
              return (
                <div
                  key={log.id}
                  className={`p-2.5 rounded border text-[11px] space-y-1 ${
                    isOk
                      ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                      : 'bg-rose-950/40 border-rose-900 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-sky-400">TX #{log.transactionId}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString('fr-FR')}</span>
                    <span
                      className={`font-semibold px-1.5 py-0.2 rounded text-[9px] ${
                        isOk ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-900 text-rose-200'
                      }`}
                    >
                      {log.status} ({log.responseTimeMs} ms)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Unit ID: {log.unitId} | FC: 0x0{log.functionCode} | Start: {log.startRegister} | Count: {log.registerCount}
                  </div>
                  <div className="font-mono text-[10px] text-slate-300 bg-slate-950 p-1.5 rounded border border-slate-800/80 break-all select-all">
                    {log.hexDump}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
