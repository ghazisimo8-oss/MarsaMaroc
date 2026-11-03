/**
 * UTILITAIRES D'EXPORTATION ET IMPRESSION
 * SME Marsa Maroc — Port d'Agadir (Réf. 12/DEPA/2026)
 */

export interface CsvColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

/**
 * Exporte un jeu de données en CSV avec encodage UTF-8 avec BOM
 * Compatible Excel sans altération des accents français ni caractères spéciaux
 */
export function exportToCsv<T>(
  data: T[],
  columns: CsvColumn<T>[],
  filename: string,
  titleHeader = 'SME MARSA MAROC — PORT D\'AGADIR — EXPORT DE DONNÉES DE DÉMONSTRATION (RÉF. 12/DEPA/2026)'
): void {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // En-tête obligatoire de démo contractuelle
  const disclaimerHeader = [
    `# ${titleHeader}`,
    `# Généré le : ${timestamp}`,
    '# Mention : DÉMONSTRATION — DONNÉES À CONFIRMER AVEC LA DEPA',
    '',
  ].join('\r\n');

  // Ligne des colonnes
  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(';');

  // Lignes de données
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const val = col.accessor(item);
        if (val === null || val === undefined) return '""';
        if (typeof val === 'number') return `"${val.toString().replace('.', ',')}"`; // Format numérique européen/marocain pour Excel
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(';');
  });

  const csvContent = disclaimerHeader + '\r\n' + headers + '\r\n' + rows.join('\r\n');

  // Encodage BOM UTF-8 (\uFEFF)
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporte un jeu d'objets en JSON formaté avec métadonnées de démo
 */
export function exportToJson<T>(data: T, filename: string): void {
  const payload = {
    _meta: {
      project: 'SME Marsa Maroc — Port d’Agadir',
      reference: '12/DEPA/2026',
      disclaimer: 'DONNÉES DE DÉMONSTRATION — À VALIDER AVEC LA DEPA',
      exportedAt: new Date().toISOString(),
    },
    data,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Déclenche l'impression de la page / vue rapport via CSS print
 */
export function triggerPrintReport(): void {
  window.print();
}
