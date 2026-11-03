/**
 * SIMULATEUR INDUSTRIEL DE BANC D'ACQUISITION MODBUS TCP/IP
 * SME Marsa Maroc — Port d'Agadir (Réf. 12/DEPA/2026)
 * Statut : Simulation protocolaire de démonstration
 */

import { DEMO_MODBUS_REGISTERS } from '../data/demo/metersData';
import { DataQuality, ModbusReading } from '../types';

export interface ModbusPacketLog {
  id: string;
  timestamp: string;
  transactionId: number;
  protocolId: number; // 0x0000 pour Modbus TCP
  unitId: number;
  functionCode: number; // 0x03 Read Holding Registers
  startRegister: number;
  registerCount: number;
  responseTimeMs: number;
  status: 'SUCCESS' | 'TIMEOUT' | 'EXCEPTION_02' | 'CONNECTION_REFUSED';
  hexDump: string;
}

class ModbusSimulatorService {
  private isNetworkDown = false;
  private transactionCounter = 1000;
  private logs: ModbusPacketLog[] = [];

  constructor() {
    this.initDemoLogs();
  }

  private initDemoLogs() {
    // Initialise 5 logs récents
    const now = Date.now();
    for (let i = 4; i >= 0; i--) {
      this.logs.push({
        id: `LOG-MB-${1000 + i}`,
        timestamp: new Date(now - i * 15000).toISOString(),
        transactionId: 1000 + i,
        protocolId: 0,
        unitId: 1,
        functionCode: 3,
        startRegister: 3000,
        registerCount: 14,
        responseTimeMs: 14 + (i % 5),
        status: 'SUCCESS',
        hexDump: `[TX: 03 E${i} 00 00 00 06 01 03 0B B8 00 0E] [RX: 03 E${i} 00 00 00 1F 01 03 1C ...]`,
      });
    }
  }

  /**
   * Lit les registres d'un compteur donné
   */
  public readRegisters(
    ipAddress: string,
    port: number,
    slaveId: number,
    startAddress = 3000
  ): { readings: ModbusReading[]; packetLog: ModbusPacketLog } {
    this.transactionCounter++;
    const txId = this.transactionCounter;
    const now = new Date();

    // Si panne simulée ou si IP correspond au poste P6 (en coupure démo)
    const isError = this.isNetworkDown || ipAddress === '192.168.10.61';

    if (isError) {
      const packetLog: ModbusPacketLog = {
        id: `LOG-MB-${txId}`,
        timestamp: now.toISOString(),
        transactionId: txId,
        protocolId: 0,
        unitId: slaveId,
        functionCode: 3,
        startRegister: startAddress,
        registerCount: 14,
        responseTimeMs: 3000,
        status: 'TIMEOUT',
        hexDump: `[TX: ${txId.toString(16).padStart(4, '0')} 00 00 00 06 ${slaveId.toString(16).padStart(2, '0')} 03 0B B8 00 0E] [RX: TIMEOUT 3000ms]`,
      };
      this.logs.unshift(packetLog);
      if (this.logs.length > 50) this.logs.pop();

      // Retourne des valeurs en COMM_ERROR
      const readings: ModbusReading[] = DEMO_MODBUS_REGISTERS.map((reg) => ({
        address: reg.address,
        name: reg.name,
        unit: reg.unit,
        scaleFactor: reg.scaleFactor,
        rawValue: 0,
        convertedValue: 0,
        quality: 'COMM_ERROR' as DataQuality,
        timestamp: now.toISOString(),
      }));

      return { readings, packetLog };
    }

    // Réponse normale avec variations déterministes légères
    const responseTime = Math.floor(12 + (txId % 15));
    const packetLog: ModbusPacketLog = {
      id: `LOG-MB-${txId}`,
      timestamp: now.toISOString(),
      transactionId: txId,
      protocolId: 0,
      unitId: slaveId,
      functionCode: 3,
      startRegister: startAddress,
      registerCount: 14,
      responseTimeMs: responseTime,
      status: 'SUCCESS',
      hexDump: `[TX: ${txId.toString(16).padStart(4, '0')} 00 00 00 06 ${slaveId.toString(16).padStart(2, '0')} 03 0B B8 00 0E] [RX: ${txId.toString(16).padStart(4, '0')} 00 00 00 1F ${slaveId.toString(16).padStart(2, '0')} 03 1C 43 C9 ...]`,
    };
    this.logs.unshift(packetLog);
    if (this.logs.length > 50) this.logs.pop();

    const readings: ModbusReading[] = DEMO_MODBUS_REGISTERS.map((reg) => {
      let rawVal = 0;
      switch (reg.category) {
        case 'VOLTAGE':
          rawVal = 401.5 + (Math.sin(txId * 0.1) * 2.2);
          break;
        case 'CURRENT':
          rawVal = 340.0 + (Math.cos(txId * 0.2) * 25.0);
          break;
        case 'POWER':
          rawVal = reg.name === 'P_TOTAL' ? 745.2 : reg.name === 'Q_TOTAL' ? 210.4 : 774.2;
          break;
        case 'POWER_FACTOR':
          rawVal = 0.962;
          break;
        case 'FREQUENCY':
          rawVal = 50.01;
          break;
        case 'ENERGY':
          rawVal = reg.name === 'E_ACT_IMP' ? 1245800 + (txId * 0.25) : 348200;
          break;
      }

      return {
        address: reg.address,
        name: reg.name,
        unit: reg.unit,
        scaleFactor: reg.scaleFactor,
        rawValue: Math.round(rawVal * 100) / 100,
        convertedValue: Math.round(rawVal * reg.scaleFactor * 100) / 100,
        quality: 'GOOD' as DataQuality,
        timestamp: now.toISOString(),
      };
    });

    return { readings, packetLog };
  }

  /**
   * Bascule l'état de coupure réseau pour tester le comportement en panne
   */
  public toggleNetworkCut(isCut?: boolean): boolean {
    this.isNetworkDown = isCut !== undefined ? isCut : !this.isNetworkDown;
    return this.isNetworkDown;
  }

  public getNetworkStatus(): boolean {
    return this.isNetworkDown;
  }

  public getRecentLogs(): ModbusPacketLog[] {
    return [...this.logs];
  }
}

export const modbusSimulator = new ModbusSimulatorService();
