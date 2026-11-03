/**
 * TYPES DE DONNÉES MÉTIER — SME MARSA MAROC (PORT D'AGADIR)
 * Réf. Marché : 12/DEPA/2026
 * Statut : Données et structures de démonstration — À valider avec la DEPA
 */

export type DataQuality =
  | 'GOOD'
  | 'STALE'
  | 'MISSING'
  | 'INVALID'
  | 'COMM_ERROR'
  | 'ESTIMATED';

export type FreshnessState = 'FRESH' | 'DELAYED' | 'OBSOLETE' | 'MISSING';

export type PostStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'COMM_LOST';

export interface Site {
  id: string;
  code: string;
  name: string;
  location: string;
  totalSubstations: number;
  gridTension: number; // en kV (ex: 22 kV MT)
  updatedAt: string;
}

export interface ElectricalPost {
  id: string; // 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'
  code: string; // 'POSTE-P1', etc.
  name: string; // 'Poste P1 (Quai Nord / Démo)', etc.
  description: string;
  category: 'Quai & Grues' | 'Terre-plein & Magasins' | 'Silos & Vrac' | 'Conteneurs' | 'Ateliers & Bâtiments' | 'Auxiliaires & Éclairage';
  transformerPowerKva: number; // Puissance installée transformateur
  activePowerKw: number; // Puissance active instantanée
  reactivePowerKvar: number; // Puissance réactive instantanée
  apparentPowerKva: number;
  powerFactor: number; // Cosinus phi
  voltageV: number; // Tension moyenne (ex: 400V)
  currentA: number; // Courant moyen
  frequencyHz: number; // Fréquence (50 Hz)
  dailyConsumptionKwh: number;
  monthlyConsumptionKwh: number;
  serBaselineDailyKwh: number; // Consommation théorique selon baseline SER
  status: PostStatus;
  metersCount: number;
  lastCommunication: string;
  qualityScore: number; // 0 à 100%
  activeAlertsCount: number;
  coordinates: { x: number; y: number }; // Pour le synoptique interactif
}

export interface MeasurementPoint {
  id: string;
  code: string;
  name: string;
  substationId: string; // P1..P6
  meterId: string;
  type: 'MAIN_INCOMER' | 'FEEDER' | 'SUB_METER' | 'AUXILIARY';
  isMainMeter: boolean; // Si true, comptabilisé dans le bilan global (évite le double comptage)
  circuitBreakerRatingA: number;
  voltageRatingV: number;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
}

export interface Meter {
  id: string;
  code: string;
  name: string;
  substationId: string;
  manufacturer: string; // Démo (ex: Schneider Electric, Socomec, Siemens)
  model: string;
  serialNumber: string;
  ipAddress: string;
  port: number;
  slaveId: number;
  protocol: 'MODBUS_TCP' | 'MODBUS_RTU_GATEWAY';
  pollingIntervalSeconds: number;
  status: 'ONLINE' | 'OFFLINE' | 'TIMEOUT';
  lastReadingTimestamp: string;
  latencyMs: number;
  firmwareVersion: string;
  isExistingReused: boolean; // Marqueur d'intégration de compteur existant
}

export interface ModbusRegisterMapping {
  address: number;
  name: string;
  description: string;
  dataType: 'FLOAT32' | 'INT16' | 'INT32' | 'UINT16';
  unit: string;
  scaleFactor: number;
  category: 'VOLTAGE' | 'CURRENT' | 'POWER' | 'ENERGY' | 'FREQUENCY' | 'POWER_FACTOR';
}

export interface ModbusReading {
  address: number;
  name: string;
  unit: string;
  scaleFactor: number;
  rawValue: number;
  convertedValue: number;
  quality: DataQuality;
  timestamp: string;
}

export interface Measurement {
  id: string;
  meterId: string;
  substationId: string;
  timestamp: string; // Horodatage à la source
  receivedAt: string; // Horodatage réception
  activePowerKw: number;
  reactivePowerKvar: number;
  apparentPowerKva: number;
  voltageV: number;
  currentA: number;
  frequencyHz: number;
  powerFactor: number;
  activeEnergyImportKwh: number;
  activeEnergyExportKwh: number;
  reactiveEnergyKvarh: number;
  quality: DataQuality;
  freshness: FreshnessState;
  source: string;
}

export interface EnergyIndicator {
  id: string;
  code: string;
  name: string;
  description: string;
  formula: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  historicalDeltaPercent: number;
  substationScope: string; // 'ALL' ou 'P1', etc.
  category: 'OPERATIONAL' | 'PORT_EQUIPMENT' | 'GLOBAL' | 'SPECIFIC';
  status: 'OPTIMAL' | 'WARNING' | 'ALERT';
  version: string;
  effectiveDate: string;
  updatedBy: string;
}

export interface EnergyBaseline {
  id: string;
  version: string;
  name: string;
  referencePeriod: string; // ex: 'Année 2025 Normalisée'
  method: 'LINEAR_REGRESSION' | 'HISTORICAL_AVERAGE' | 'PORT_ACTIVITY_ADJUSTED';
  formulaExplanation: string;
  annualReferenceConsumptionKwh: number;
  monthlyBaselinesKwh: Record<string, number>;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  effectiveDate: string;
  justification: string;
  author: string;
}

export type AlertPriority = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'CLOSED';
export type AlertType =
  | 'COMMUNICATION_LOSS'
  | 'MISSING_DATA'
  | 'INVALID_DATA'
  | 'POWER_THRESHOLD_EXCEEDED'
  | 'LOW_POWER_FACTOR'
  | 'SER_DEVIATION'
  | 'DATA_QUALITY_DEGRADED'
  | 'VOLTAGE_UNBALANCE';

export interface AlertEvent {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userName: string;
  comment?: string;
}

export interface Alert {
  id: string;
  code: string;
  title: string;
  description: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  substationId: string;
  substationName: string;
  meterId?: string;
  triggerValue: string;
  thresholdValue: string;
  unit?: string;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  closedAt?: string;
  closedBy?: string;
  assignee?: string;
  comments: string;
  events: AlertEvent[];
}

export type UserRole = 'ADMIN' | 'ENERGY_MANAGER' | 'OPERATOR' | 'READER';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  roleTitle: string;
  email: string;
  department: string;
  avatarInitials: string;
  permissions: string[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetObject: string;
  objectId: string;
  previousValue?: string;
  newValue?: string;
  ipAddress: string;
  result: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

export interface ReportConfig {
  id: string;
  title: string;
  type: 'ENERGY_SYNTHESIS' | 'SUBSTATION_PERFORMANCE' | 'IPE_REPORT' | 'SER_AUDIT' | 'ALERTS_SUMMARY' | 'DATA_QUALITY';
  period: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  substations: string[];
  generatedAt: string;
  generatedBy: string;
  status: 'GENERATED' | 'SCHEDULED' | 'ARCHIVED';
  fileFormat: 'CSV' | 'PDF';
}

export interface AcceptanceTest {
  id: string; // T01 à T15
  code: string;
  title: string;
  category: 'COMMUNICATION' | 'METROLOGY' | 'ENERGY_MANAGEMENT' | 'OPERATIONS' | 'SECURITY';
  objective: string;
  expectedResult: string;
  observedResult: string;
  status: 'PASSED' | 'PENDING' | 'IN_PROGRESS' | 'FAILED';
  lastRunTimestamp: string;
  executedBy: string;
  evidenceProof: string;
}

export interface ProjectMilestone {
  id: number;
  stepNumber: number;
  title: string;
  description: string;
  responsible: string;
  durationWeeks: number;
  startDate: string;
  endDate: string;
  progressPercent: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  deliverables: string[];
  dependencies: number[];
}

export interface AutomaticInsight {
  id: string;
  type: 'POSITIVE' | 'WARNING' | 'CRITICAL' | 'INFO';
  title: string;
  description: string;
  substationId?: string;
  metric: string;
  deltaPercent?: number;
  actionRecommendation: string;
  timestamp: string;
}
