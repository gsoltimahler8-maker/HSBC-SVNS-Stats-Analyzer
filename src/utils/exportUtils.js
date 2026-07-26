const encoder = new TextEncoder();

const STAT_FIELDS = [
  'pointsFor',
  'pointsAgainst',
  'tries',
  'metres',
  'carries',
  'passes',
  'offloads',
  'cleanBreaks',
  'defendersBeaten',
  'turnoversWon',
  'turnoversConceded',
  'tackles',
  'missedTackles',
  'possession',
  'territory',
  'rucksWon',
  'rucksLost',
  'penaltiesConceded',
  'yellowCards',
  'redCards',
];

function getTeamResult(match) {
  return match.teamResult || match.result || '';
}

function getWinner(match) {
  if (match.winner) {
    return match.winner;
  }

  if (
    typeof match.pointsFor === 'number' &&
    typeof match.pointsAgainst === 'number'
  ) {
    if (match.pointsFor > match.pointsAgainst) {
      return match.team;
    }

    if (match.pointsAgainst > match.pointsFor) {
      return match.opponent;
    }
  }

  return '';
}

function getLoser(match) {
  if (match.loser) {
    return match.loser;
  }

  const winner = getWinner(match);

  if (winner === match.team) {
    return match.opponent || '';
  }

  if (winner === match.opponent) {
    return match.team || '';
  }

  return '';
}

function getDataType(match) {
  return match.dataType === 'real' ? 'real' : 'sample';
}

function getLocalizedResult(match, labels) {
  const result = getTeamResult(match);
  return labels.results?.[result] || result || '';
}

function normalizeCellValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : '';
  }

  return String(value);
}

function videoCountForMatch(videoCounts, matchId) {
  if (videoCounts instanceof Map) {
    return videoCounts.get(matchId) || 0;
  }

  return videoCounts?.[matchId] || 0;
}

export function buildMatchExportTable(
  matches,
  {
    labels,
    coverageLevels = {},
    videoCounts = new Map(),
  }
) {
  const columns = labels.export.columns;
  const fields = [
    ['internalMatchId', (match) => match.id],
    ['rugbyComAuId', (match) => match.external?.rugbyComAu],
    ['svnsId', (match) => match.external?.svns],
    ['rugbyPassId', (match) => match.external?.rugbyPass],
    ['season', (match) => match.season],
    ['date', (match) => match.date],
    ['gender', (match) => match.gender],
    ['tournament', (match) => match.tournament],
    ['stage', (match) => match.stage],
    ['team', (match) => match.team],
    ['opponent', (match) => match.opponent],
    ['teamResult', (match) => getLocalizedResult(match, labels)],
    ['winner', (match) => getWinner(match)],
    ['loser', (match) => getLoser(match)],
    ...STAT_FIELDS.map((field) => [field, (match) => match[field]]),
    ['sourceProvider', (match) => match.sourceProvider],
    ['sourceUrl', (match) => match.sourceUrl],
    ['fetchedAt', (match) => match.fetchedAt],
    [
      'dataCoverageLevel',
      (match) =>
        coverageLevels[match.dataCoverageLevel] ||
        match.dataCoverageLevel,
    ],
    ['dataCoverageSource', (match) => match.dataCoverageSource],
    [
      'statDefinitionVersion',
      (match) => match.statDefinitionVersion,
    ],
    [
      'dataType',
      (match) => labels.dataTypes?.[getDataType(match)] || getDataType(match),
    ],
    [
      'videoCount',
      (match) => videoCountForMatch(videoCounts, match.id),
    ],
  ];

  return {
    headers: fields.map(([key]) => columns[key] || key),
    rows: matches.map((match) =>
      fields.map(([, getter]) => normalizeCellValue(getter(match)))
    ),
  };
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text)
    ? `"${text.replace(/"/g, '""')}"`
    : text;
}

export function createCsvBlob(table) {
  const lines = [table.headers, ...table.rows].map((row) =>
    row.map(csvCell).join(',')
  );

  return new Blob([`\uFEFF${lines.join('\r\n')}`], {
    type: 'text/csv;charset=utf-8',
  });
}

function xmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function columnName(index) {
  let current = index + 1;
  let name = '';

  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }

  return name;
}

function calculateColumnWidths(table) {
  return table.headers.map((header, columnIndex) => {
    const longest = table.rows.reduce(
      (current, row) =>
        Math.max(current, String(row[columnIndex] ?? '').length),
      String(header).length
    );

    return Math.min(Math.max(longest + 2, 9), 38);
  });
}

function worksheetXml(table) {
  const allRows = [table.headers, ...table.rows];
  const widths = calculateColumnWidths(table);
  const lastColumn = columnName(Math.max(table.headers.length - 1, 0));
  const lastRow = Math.max(allRows.length, 1);
  const dimension = `A1:${lastColumn}${lastRow}`;

  const columnsXml = widths
    .map(
      (width, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`
    )
    .join('');

  const rowsXml = allRows
    .map((row, rowIndex) => {
      const excelRow = rowIndex + 1;
      const cells = row
        .map((value, columnIndex) => {
          const ref = `${columnName(columnIndex)}${excelRow}`;

          if (rowIndex > 0 && typeof value === 'number' && Number.isFinite(value)) {
            return `<c r="${ref}" s="1"><v>${value}</v></c>`;
          }

          const style = rowIndex === 0 ? 3 : 2;
          return `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${xmlEscape(
            value
          )}</t></is></c>`;
        })
        .join('');

      return `<row r="${excelRow}">${cells}</row>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="${dimension}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <cols>${columnsXml}</cols>
  <sheetData>${rowsXml}</sheetData>
  <autoFilter ref="${dimension}"/>
</worksheet>`;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);

  for (let value = 0; value < 256; value += 1) {
    let current = value;

    for (let bit = 0; bit < 8; bit += 1) {
      current =
        current & 1
          ? 0xedb88320 ^ (current >>> 1)
          : current >>> 1;
    }

    table[value] = current >>> 0;
  }

  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function uint16(value) {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value, true);
  return bytes;
}

function uint32(value) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value >>> 0, true);
  return bytes;
}

function concatBytes(parts) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;

  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });

  return result;
}

function createStoredZip(files) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;

  files.forEach(({ name, content }) => {
    const nameBytes = encoder.encode(name);
    const dataBytes =
      typeof content === 'string' ? encoder.encode(content) : content;
    const checksum = crc32(dataBytes);

    const localHeader = concatBytes([
      uint32(0x04034b50),
      uint16(20),
      uint16(0x0800),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(checksum),
      uint32(dataBytes.length),
      uint32(dataBytes.length),
      uint16(nameBytes.length),
      uint16(0),
      nameBytes,
    ]);

    localParts.push(localHeader, dataBytes);

    const centralHeader = concatBytes([
      uint32(0x02014b50),
      uint16(20),
      uint16(20),
      uint16(0x0800),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(checksum),
      uint32(dataBytes.length),
      uint32(dataBytes.length),
      uint16(nameBytes.length),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(localOffset),
      nameBytes,
    ]);

    centralParts.push(centralHeader);
    localOffset += localHeader.length + dataBytes.length;
  });

  const centralDirectory = concatBytes(centralParts);
  const localDirectory = concatBytes(localParts);
  const endRecord = concatBytes([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(files.length),
    uint16(files.length),
    uint32(centralDirectory.length),
    uint32(localDirectory.length),
    uint16(0),
  ]);

  return concatBytes([localDirectory, centralDirectory, endRecord]);
}

function workbookFiles(table, sheetName) {
  const safeSheetName = String(sheetName || 'Matches')
    .replace(/[\\/*?:\[\]]/g, ' ')
    .slice(0, 31) || 'Matches';
  const now = new Date().toISOString();

  return [
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`,
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
    },
    {
      name: 'docProps/core.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>SVNS Stats Analyzer Match Search Export</dc:title>
  <dc:creator>SVNS Stats Analyzer</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`,
    },
    {
      name: 'docProps/app.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>SVNS Stats Analyzer</Application>
</Properties>`,
    },
    {
      name: 'xl/workbook.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="${xmlEscape(safeSheetName)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/styles.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="10"/><name val="Aptos"/><family val="2"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="10"/><name val="Aptos"/><family val="2"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF312E81"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"><color rgb="FFD1D5DB"/></left><right style="thin"><color rgb="FFD1D5DB"/></right><top style="thin"><color rgb="FFD1D5DB"/></top><bottom style="thin"><color rgb="FFD1D5DB"/></bottom><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="4">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"><alignment vertical="top"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`,
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      content: worksheetXml(table),
    },
  ];
}

export function createXlsxBlob(table, sheetName) {
  const bytes = createStoredZip(workbookFiles(table, sheetName));

  return new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function createExportFilename(prefix, extension, id = '') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeId = String(id || '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const suffix = safeId ? `-${safeId}` : '';
  return `${prefix}${suffix}-${timestamp}.${extension}`;
}

function printValue(value) {
  return value === null || value === undefined || value === ''
    ? '—'
    : String(value);
}

function printMetricRows(match, labels) {
  const groups = [
    [
      labels.attack,
      [
        'pointsFor',
        'tries',
        'metres',
        'carries',
        'passes',
        'offloads',
        'cleanBreaks',
        'defendersBeaten',
        'turnoversConceded',
      ],
    ],
    [
      labels.defence,
      ['pointsAgainst', 'tackles', 'missedTackles', 'turnoversWon'],
    ],
    [
      labels.possessionBreakdown,
      ['possession', 'territory', 'rucksWon', 'rucksLost'],
    ],
    [
      labels.discipline,
      ['penaltiesConceded', 'yellowCards', 'redCards'],
    ],
  ];

  return groups
    .map(
      ([title, fields]) => `
        <section>
          <h2>${xmlEscape(title)}</h2>
          <table>
            <tbody>
              ${fields
                .map(
                  (field) => `
                    <tr>
                      <th>${xmlEscape(labels.metrics?.[field] || field)}</th>
                      <td>${xmlEscape(printValue(match[field]))}</td>
                    </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </section>`
    )
    .join('');
}

export function buildMatchPrintHtml(
  match,
  {
    labels,
    coverageLabel,
    videos = [],
    generatedAt = new Date(),
  }
) {
  const exportLabels = labels.export;
  const result = getLocalizedResult(match, labels);
  const score = `${printValue(match.team)} ${printValue(
    match.pointsFor
  )}-${printValue(match.pointsAgainst)} ${printValue(match.opponent)}`;

  const metadata = [
    [labels.season, match.season],
    [exportLabels.columns.date, match.date],
    [labels.gender, match.gender],
    [labels.tournament, match.tournament],
    [labels.stage, match.stage],
    [labels.teamResult, result],
    [labels.winner, getWinner(match)],
    [labels.loser, getLoser(match)],
  ];

  const traceability = [
    [labels.internalMatchId, match.id],
    [labels.rugbyComAuId, match.external?.rugbyComAu],
    [labels.svnsId, match.external?.svns],
    [labels.rugbyPassId, match.external?.rugbyPass],
    [labels.sourceProvider, match.sourceProvider],
    [labels.sourceUrl, match.sourceUrl],
    [labels.lastFetched, match.fetchedAt],
    [labels.coverage, coverageLabel || match.dataCoverageLevel],
    [labels.coverageSource, match.dataCoverageSource],
    [labels.statDefinition, match.statDefinitionVersion],
    [labels.dataType, labels.dataTypes?.[getDataType(match)]],
  ];

  return `<!doctype html>
<html lang="${exportLabels.documentLanguage}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${xmlEscape(exportLabels.pdfDocumentTitle)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111827; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", "Yu Gothic", Meiryo, sans-serif; font-size: 10pt; line-height: 1.45; }
    header { border-bottom: 3px solid #5b21b6; padding-bottom: 10px; margin-bottom: 12px; }
    h1 { margin: 0 0 5px; font-size: 19pt; }
    h2 { margin: 0 0 6px; font-size: 11pt; color: #312e81; }
    p { margin: 3px 0; }
    .score { font-size: 15pt; font-weight: 700; }
    .result { color: #5b21b6; font-weight: 700; }
    .meta, .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    section { break-inside: avoid; margin-top: 11px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #d1d5db; padding: 5px 6px; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
    th { width: 46%; background: #f3f4f6; }
    .trace th { width: 32%; }
    .video-list { margin: 0; padding-left: 18px; }
    footer { margin-top: 14px; border-top: 1px solid #d1d5db; padding-top: 8px; color: #4b5563; font-size: 8.5pt; }
    @media print { .print-help { display: none; } }
  </style>
</head>
<body>
  <header>
    <h1>${xmlEscape(exportLabels.pdfDocumentTitle)}</h1>
    <p class="score">${xmlEscape(score)}</p>
    <p class="result">${xmlEscape(result)}</p>
    <p>${xmlEscape(exportLabels.generatedAt)}: ${xmlEscape(
      generatedAt.toLocaleString(exportLabels.locale)
    )}</p>
    <p class="print-help">${xmlEscape(exportLabels.pdfPrintHelp)}</p>
  </header>

  <section>
    <h2>${xmlEscape(exportLabels.matchInformation)}</h2>
    <table><tbody>${metadata
      .map(
        ([key, value]) =>
          `<tr><th>${xmlEscape(key)}</th><td>${xmlEscape(
            printValue(value)
          )}</td></tr>`
      )
      .join('')}</tbody></table>
  </section>

  <div class="grid">${printMetricRows(match, labels)}</div>

  <section class="trace">
    <h2>${xmlEscape(labels.traceability)}</h2>
    <table><tbody>${traceability
      .map(
        ([key, value]) =>
          `<tr><th>${xmlEscape(key)}</th><td>${xmlEscape(
            printValue(value)
          )}</td></tr>`
      )
      .join('')}</tbody></table>
  </section>

  <section>
    <h2>${xmlEscape(labels.videoStatus)}</h2>
    ${
      videos.length
        ? `<ul class="video-list">${videos
            .map(
              (video) =>
                `<li>${xmlEscape(video.title || video.videoType || 'Video')} - ${xmlEscape(
                  video.videoUrl || ''
                )}</li>`
            )
            .join('')}</ul>`
        : `<p>${xmlEscape(labels.videoNotChecked)}</p>`
    }
  </section>

  <footer>
    <strong>SVNS Stats Analyzer</strong><br />
    ${xmlEscape(exportLabels.pdfDisclaimer)}
  </footer>
</body>
</html>`;
}

export function printMatchPdf(match, options) {
  const reportWindow = window.open('', '_blank');

  if (!reportWindow) {
    return false;
  }

  reportWindow.opener = null;
  reportWindow.document.open();
  reportWindow.document.write(buildMatchPrintHtml(match, options));
  reportWindow.document.close();

  window.setTimeout(() => {
    reportWindow.focus();
    reportWindow.print();
  }, 250);

  return true;
}
