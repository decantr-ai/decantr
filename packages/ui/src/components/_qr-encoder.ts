/**
 * Pure-JS QR Code encoder. Zero dependencies.
 * Byte-mode encoding, Reed-Solomon EC over GF(256), versions 1-40, EC levels L/M/Q/H.
 * @module _qr-encoder
 */

// GF(256) with irreducible polynomial x^8 + x^4 + x^3 + x^2 + 1 (0x11D)
const EXP = new Uint8Array(256);
const LOG = new Uint8Array(256);
{
  let v = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = v;
    LOG[v] = i;
    v <<= 1;
    if (v & 0x100) v ^= 0x11D;
  }
  EXP[255] = EXP[0];
}

function gfMul(a: any, b: any) {
  return a === 0 || b === 0 ? 0 : EXP[(LOG[a] + LOG[b]) % 255];
}

function gfPolyMul(a: any, b: any) {
  const out = new Uint8Array(a.length + b.length - 1);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] ^= gfMul(a[i], b[j]);
  return out;
}

function rsGenPoly(n: any) {
  let g = new Uint8Array([1]);
  for (let i = 0; i < n; i++)
    g = gfPolyMul(g, new Uint8Array([1, EXP[i]]));
  return g;
}

function rsEncode(data: any, ecLen: any) {
  const gen = rsGenPoly(ecLen);
  const msg = new Uint8Array(data.length + ecLen);
  msg.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0)
      for (let j = 0; j < gen.length; j++)
        msg[i + j] ^= gfMul(gen[j], coef);
  }
  return msg.slice(data.length);
}

// EC codewords per block, number of blocks, data codewords per block
// Format: [ecPerBlock, numBlocks1, dataPerBlock1, numBlocks2, dataPerBlock2]
// numBlocks2/dataPerBlock2 default to 0 if absent
const EC_TABLE = [
  // v1
  [[7,1,19],[10,1,16],[13,1,13],[17,1,9]],
  // v2
  [[10,1,34],[16,1,28],[22,1,22],[28,1,16]],
  // v3
  [[15,1,55],[26,1,44],[18,2,17],[22,2,13]],
  // v4
  [[20,1,80],[18,2,32],[26,2,24],[16,4,9]],
  // v5
  [[26,1,108],[24,2,43],[18,2,15,2,16],[22,2,11,2,12]],
  // v6
  [[18,2,68],[16,4,27],[24,2,19,2,20],[28,4,15]],
  // v7
  [[20,2,78],[18,4,31],[18,2,14,4,15],[26,4,13,1,14]],
  // v8
  [[24,2,97],[22,2,38,2,39],[22,4,18,2,19],[26,4,14,2,15]],
  // v9
  [[30,2,116],[22,3,36,2,37],[20,4,16,4,17],[24,4,12,4,13]],
  // v10
  [[18,2,68,2,69],[26,4,43,1,44],[24,6,19,2,20],[28,6,15,2,16]],
  // v11
  [[20,4,81],[30,1,50,4,51],[28,4,22,4,23],[24,3,12,8,13]],
  // v12
  [[24,2,92,2,93],[22,6,36,2,37],[26,4,20,6,21],[28,7,14,4,15]],
  // v13
  [[26,4,107],[22,8,37,1,38],[24,8,20,4,21],[22,12,11,4,12]],
  // v14
  [[30,3,115,1,116],[24,4,40,5,41],[20,11,16,5,17],[24,11,12,5,13]],
  // v15
  [[22,5,87,1,88],[24,5,41,5,42],[30,5,24,7,25],[24,11,12,7,13]],
  // v16
  [[24,5,98,1,99],[28,7,45,3,46],[24,15,19,2,20],[30,3,15,13,16]],
  // v17
  [[28,1,107,5,108],[28,10,46,1,47],[28,1,22,15,23],[28,2,14,17,15]],
  // v18
  [[30,5,120,1,121],[26,9,43,4,44],[28,17,22,1,23],[28,2,14,19,15]],
  // v19
  [[28,3,113,4,114],[26,3,44,11,45],[26,17,21,4,22],[26,9,13,16,14]],
  // v20
  [[28,3,107,5,108],[26,3,41,13,42],[30,15,24,5,25],[28,15,15,10,16]],
  // v21
  [[28,4,116,4,117],[26,17,42],[28,17,22,6,23],[30,19,16,6,17]],
  // v22
  [[28,2,111,7,112],[28,17,46],[30,7,24,16,25],[24,34,13]],
  // v23
  [[30,4,121,5,122],[28,4,47,14,48],[30,11,24,14,25],[30,16,15,14,16]],
  // v24
  [[30,6,117,4,118],[28,6,45,14,46],[30,11,24,16,25],[30,30,16,2,17]],
  // v25
  [[26,8,106,4,107],[28,8,47,13,48],[30,7,24,22,25],[30,22,15,13,16]],
  // v26
  [[28,10,114,2,115],[28,19,46,4,47],[28,28,22,6,23],[30,33,16,4,17]],
  // v27
  [[30,8,122,4,123],[28,22,45,3,46],[30,8,23,26,24],[30,12,15,28,16]],
  // v28
  [[30,3,117,10,118],[28,3,45,23,46],[30,4,24,31,25],[30,11,15,31,16]],
  // v29
  [[30,7,116,7,117],[28,21,45,7,46],[30,1,23,37,24],[30,19,15,26,16]],
  // v30
  [[30,5,115,10,116],[28,19,47,10,48],[30,15,24,25,25],[30,23,15,25,16]],
  // v31
  [[30,13,115,3,116],[28,2,46,29,47],[30,42,24,1,25],[30,23,15,28,16]],
  // v32
  [[30,17,115],[28,10,46,23,47],[30,10,24,35,25],[30,19,15,35,16]],
  // v33
  [[30,17,115,1,116],[28,14,46,21,47],[30,29,24,19,25],[30,11,15,46,16]],
  // v34
  [[30,13,115,6,116],[28,14,46,23,47],[30,44,24,7,25],[30,59,16,1,17]],
  // v35
  [[30,12,121,7,122],[28,12,47,26,48],[30,39,24,14,25],[30,22,15,41,16]],
  // v36
  [[30,6,121,14,122],[28,6,47,34,48],[30,46,24,10,25],[30,2,15,64,16]],
  // v37
  [[30,17,122,4,123],[28,29,46,14,47],[30,49,24,10,25],[30,24,15,46,16]],
  // v38
  [[30,4,122,18,123],[28,13,46,32,47],[30,48,24,14,25],[30,42,15,32,16]],
  // v39
  [[30,20,117,4,118],[28,40,47,7,48],[30,43,24,22,25],[30,10,15,67,16]],
  // v40
  [[30,19,118,6,119],[28,18,47,31,48],[30,34,24,34,25],[30,20,15,61,16]],
];

const EC_LEVELS = { L: 0, M: 1, Q: 2, H: 3 };
const EC_BITS = [1, 0, 3, 2]; // L=01, M=00, Q=11, H=10

// Alignment pattern center positions per version (2-40)
const ALIGN_POS = [
  [],[], // v0, v1 unused
  [6,18],[6,22],[6,26],[6,30],[6,34],
  [6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],
  [6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],
  [6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],
  [6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],
  [6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],
  [6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],
  [6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],
  [6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],
  [6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170],
];

function getCapacity(ver: any, ecIdx: any) {
  const row = EC_TABLE[ver - 1][ecIdx];
  const ecPer = row[0];
  const n1 = row[1], d1 = row[2];
  const n2 = row.length > 3 ? row[3] : 0;
  const d2 = row.length > 4 ? row[4] : 0;
  return n1 * d1 + n2 * d2;
}

function selectVersion(dataLen: any, ecIdx: any) {
  // Byte mode: 4 bits mode + char count bits + data + terminator, packed into codewords
  for (let v = 1; v <= 40; v++) {
    const ccBits = v <= 9 ? 8 : 16;
    const totalBits = 4 + ccBits + dataLen * 8;
    const cap = getCapacity(v, ecIdx) * 8;
    if (totalBits <= cap) return v;
  }
  throw new Error('Data too long for QR');
}

function buildDataCodewords(data: any, ver: any, ecIdx: any) {
  const cap = getCapacity(ver, ecIdx);
  const ccBits = ver <= 9 ? 8 : 16;
  const bits = [];

  const push = (val: any, len: any) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };

  push(0b0100, 4); // byte mode
  push(data.length, ccBits);
  for (let i = 0; i < data.length; i++) push(data[i], 8);
  push(0, Math.min(4, cap * 8 - bits.length)); // terminator

  while (bits.length % 8 !== 0) bits.push(0);

  const codewords = new Uint8Array(cap);
  for (let i = 0; i < bits.length; i += 8)
    codewords[i >> 3] = (bits[i]<<7)|(bits[i+1]<<6)|(bits[i+2]<<5)|(bits[i+3]<<4)|
                         (bits[i+4]<<3)|(bits[i+5]<<2)|(bits[i+6]<<1)|bits[i+7];

  // Pad with 0xEC, 0x11
  let idx = bits.length >> 3;
  let pad = 0xEC;
  while (idx < cap) { codewords[idx++] = pad; pad = pad === 0xEC ? 0x11 : 0xEC; }

  return codewords;
}

function interleaveBlocks(codewords: any, ver: any, ecIdx: any) {
  const row = EC_TABLE[ver - 1][ecIdx];
  const ecPer = row[0];
  const n1 = row[1], d1 = row[2];
  const n2 = row.length > 3 ? row[3] : 0;
  const d2 = row.length > 4 ? row[4] : 0;

  const dataBlocks = [];
  const ecBlocks = [];
  let offset = 0;

  for (let i = 0; i < n1; i++) {
    const block = codewords.slice(offset, offset + d1);
    dataBlocks.push(block);
    ecBlocks.push(rsEncode(block, ecPer));
    offset += d1;
  }
  for (let i = 0; i < n2; i++) {
    const block = codewords.slice(offset, offset + d2);
    dataBlocks.push(block);
    ecBlocks.push(rsEncode(block, ecPer));
    offset += d2;
  }

  const result = [];
  const maxData = Math.max(d1, d2 || 0);
  for (let i = 0; i < maxData; i++)
    for (const b of dataBlocks)
      if (i < b.length) result.push(b[i]);
  for (let i = 0; i < ecPer; i++)
    for (const b of ecBlocks)
      result.push(b[i]);

  return new Uint8Array(result);
}

function createMatrix(ver: any) {
  const size = ver * 4 + 17;
  const modules = Array.from({ length: size }, () => new Uint8Array(size));
  const reserved = Array.from({ length: size }, () => new Uint8Array(size));
  return { modules, reserved, size };
}

function placeFinder(m: any, row: any, col: any) {
  for (let r = -1; r <= 7; r++)
    for (let c = -1; c <= 7; c++) {
      const rr = row + r, cc = col + c;
      if (rr < 0 || rr >= m.size || cc < 0 || cc >= m.size) continue;
      const isFinder = (r >= 0 && r <= 6 && c >= 0 && c <= 6) &&
        (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
      m.modules[rr][cc] = isFinder ? 1 : 0;
      m.reserved[rr][cc] = 1;
    }
}

function placeAlignment(m: any, ver: any) {
  if (ver < 2) return;
  const pos = ALIGN_POS[ver];
  for (const r of pos)
    for (const c of pos) {
      // Skip if overlapping finder patterns
      if (r <= 8 && c <= 8) continue;
      if (r <= 8 && c >= m.size - 8) continue;
      if (r >= m.size - 8 && c <= 8) continue;
      for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++) {
          const on = dr === -2 || dr === 2 || dc === -2 || dc === 2 || (dr === 0 && dc === 0);
          m.modules[r + dr][c + dc] = on ? 1 : 0;
          m.reserved[r + dr][c + dc] = 1;
        }
    }
}

function placeTiming(m: any) {
  for (let i = 8; i < m.size - 8; i++) {
    const on = i % 2 === 0 ? 1 : 0;
    if (!m.reserved[6][i]) { m.modules[6][i] = on; m.reserved[6][i] = 1; }
    if (!m.reserved[i][6]) { m.modules[i][6] = on; m.reserved[i][6] = 1; }
  }
}

function reserveFormatAreas(m: any, ver: any) {
  // Format info around finders
  for (let i = 0; i < 8; i++) {
    m.reserved[8][i] = 1;
    m.reserved[8][m.size - 1 - i] = 1;
    m.reserved[i][8] = 1;
    m.reserved[m.size - 1 - i][8] = 1;
  }
  m.reserved[8][8] = 1;
  // Dark module
  m.modules[m.size - 8][8] = 1;
  m.reserved[m.size - 8][8] = 1;

  // Version info (v7+)
  if (ver >= 7) {
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 3; j++) {
        m.reserved[i][m.size - 11 + j] = 1;
        m.reserved[m.size - 11 + j][i] = 1;
      }
  }
}

function placeData(m: any, dataBits: any) {
  let bitIdx = 0;
  let upward = true;
  for (let right = m.size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // skip timing column
    const rows = upward
      ? Array.from({ length: m.size }, (_, i) => m.size - 1 - i)
      : Array.from({ length: m.size }, (_, i) => i);
    for (const row of rows) {
      for (const col of [right, right - 1]) {
        if (m.reserved[row][col]) continue;
        m.modules[row][col] = bitIdx < dataBits.length ? dataBits[bitIdx++] : 0;
      }
    }
    upward = !upward;
  }
}

const MASK_FNS = [
  (r: any, c: any) => (r + c) % 2 === 0,
  (r: any, c: any) => r % 2 === 0,
  (r: any, c: any) => c % 3 === 0,
  (r: any, c: any) => (r + c) % 3 === 0,
  (r: any, c: any) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r: any, c: any) => ((r * c) % 2 + (r * c) % 3) === 0,
  (r: any, c: any) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
  (r: any, c: any) => ((r + c) % 2 + (r * c) % 3) % 2 === 0,
];

function applyMask(m: any, maskIdx: any) {
  const fn = MASK_FNS[maskIdx];
  for (let r = 0; r < m.size; r++)
    for (let c = 0; c < m.size; c++)
      if (!m.reserved[r][c] && fn(r, c))
        m.modules[r][c] ^= 1;
}

function bchFormat(data: any) {
  // BCH(15,5) — generator polynomial: x^10 + x^8 + x^5 + x^4 + x^2 + x + 1 = 0x537
  let bits = data << 10;
  let gen = 0x537;
  for (let i = 14; i >= 10; i--)
    if (bits & (1 << i)) bits ^= gen << (i - 10);
  return ((data << 10) | bits) ^ 0x5412;
}

function bchVersion(data: any) {
  // BCH(18,6) — generator polynomial: x^12 + x^11 + x^10 + x^9 + x^8 + x^5 + x^2 + 1 = 0x1F25
  let bits = data << 12;
  let gen = 0x1F25;
  for (let i = 17; i >= 12; i--)
    if (bits & (1 << i)) bits ^= gen << (i - 12);
  return (data << 12) | bits;
}

function writeFormatInfo(m: any, ecIdx: any, maskIdx: any) {
  const data = (EC_BITS[ecIdx] << 3) | maskIdx;
  const info = bchFormat(data);
  const bit = (i: any) => (info >> i) & 1;

  // First copy — horizontal (row 8, left side): b14..b9 at cols 0-5, b8 at col 7, b7 at col 8
  for (let i = 0; i <= 5; i++) m.modules[8][i] = bit(14 - i);
  m.modules[8][7] = bit(8);
  m.modules[8][8] = bit(7);
  // First copy — vertical (col 8, top side): b6 at row 7, b5..b0 at rows 5-0
  m.modules[7][8] = bit(6);
  for (let i = 0; i < 6; i++) m.modules[5 - i][8] = bit(5 - i);

  // Second copy — vertical (col 8, bottom side): b14..b8 at rows (size-1)..(size-7)
  for (let i = 0; i < 7; i++) m.modules[m.size - 1 - i][8] = bit(14 - i);
  // Second copy — horizontal (row 8, right side): b7..b0 at cols (size-8)..(size-1)
  for (let i = 0; i < 8; i++) m.modules[8][m.size - 8 + i] = bit(7 - i);
}

function writeVersionInfo(m: any, ver: any) {
  if (ver < 7) return;
  const info = bchVersion(ver);
  for (let i = 0; i < 18; i++) {
    const bit = (info >> i) & 1;
    const r = Math.floor(i / 3);
    const c = m.size - 11 + (i % 3);
    m.modules[r][c] = bit;
    m.modules[c][r] = bit;
  }
}

function penalty(modules: any, size: any) {
  let score = 0;

  // Rule 1: runs of 5+ same color in row/col
  for (let r = 0; r < size; r++) {
    let run = 1;
    for (let c = 1; c < size; c++) {
      if (modules[r][c] === modules[r][c - 1]) { run++; }
      else { if (run >= 5) score += run - 2; run = 1; }
    }
    if (run >= 5) score += run - 2;
  }
  for (let c = 0; c < size; c++) {
    let run = 1;
    for (let r = 1; r < size; r++) {
      if (modules[r][c] === modules[r - 1][c]) { run++; }
      else { if (run >= 5) score += run - 2; run = 1; }
    }
    if (run >= 5) score += run - 2;
  }

  // Rule 2: 2x2 blocks of same color
  for (let r = 0; r < size - 1; r++)
    for (let c = 0; c < size - 1; c++) {
      const v = modules[r][c];
      if (v === modules[r][c+1] && v === modules[r+1][c] && v === modules[r+1][c+1])
        score += 3;
    }

  // Rule 3: finder-like patterns (1,0,1,1,1,0,1,0,0,0,0) or reverse in rows/cols
  const pat1 = [1,0,1,1,1,0,1,0,0,0,0];
  const pat2 = [0,0,0,0,1,0,1,1,1,0,1];
  const matchPat = (arr: any, start: any, pat: any) => {
    for (let i = 0; i < 11; i++) if (arr[start + i] !== pat[i]) return false;
    return true;
  };
  for (let r = 0; r < size; r++)
    for (let c = 0; c <= size - 11; c++) {
      if (matchPat(modules[r], c, pat1)) score += 40;
      if (matchPat(modules[r], c, pat2)) score += 40;
    }
  for (let c = 0; c < size; c++) {
    const col = [];
    for (let r = 0; r < size; r++) col.push(modules[r][c]);
    for (let r = 0; r <= size - 11; r++) {
      if (matchPat(col, r, pat1)) score += 40;
      if (matchPat(col, r, pat2)) score += 40;
    }
  }

  // Rule 4: dark/light proportion
  let dark = 0;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (modules[r][c]) dark++;
  const pct = (dark * 100) / (size * size);
  const prev5 = Math.floor(pct / 5) * 5;
  const next5 = prev5 + 5;
  score += Math.min(Math.abs(prev5 - 50), Math.abs(next5 - 50)) * 2;

  return score;
}

function cloneModules(modules: any, size: any) {
  return modules.map((row: any) => new Uint8Array(row));
}

function utf8Encode(str: any) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let cp = str.codePointAt(i);
    if (cp > 0xFFFF) i++; // surrogate pair
    if (cp < 0x80) bytes.push(cp);
    else if (cp < 0x800) { bytes.push(0xC0 | (cp >> 6), 0x80 | (cp & 0x3F)); }
    else if (cp < 0x10000) { bytes.push(0xE0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F)); }
    else { bytes.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3F), 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F)); }
  }
  return new Uint8Array(bytes);
}

/**
 * Encode data as a QR code.
 * @param {string} data - The string to encode
 * @param {'L'|'M'|'Q'|'H'} ecLevel - Error correction level
 * @returns {{ modules: boolean[][], size: number }}
 */
export function encodeQR(data: any, ecLevel = 'M') {
  // @ts-expect-error -- strict-mode fix (auto)
  const ecIdx = EC_LEVELS[ecLevel];
  if (ecIdx === undefined) throw new Error('Invalid EC level: ' + ecLevel);

  const bytes = utf8Encode(data);
  const ver = selectVersion(bytes.length, ecIdx);
  const size = ver * 4 + 17;

  // Build data stream
  const codewords = buildDataCodewords(bytes, ver, ecIdx);
  const interleaved = interleaveBlocks(codewords, ver, ecIdx);

  // Convert to bit array
  const dataBits = [];
  for (let i = 0; i < interleaved.length; i++)
    for (let b = 7; b >= 0; b--)
      dataBits.push((interleaved[i] >> b) & 1);

  // Remainder bits (versions 2-6: 7 bits, version 14-20,28-34: 3 bits, others: 0 or 4)
  const remBits = [0,0,7,7,7,7,7,0,0,0,0,0,0,3,3,3,3,3,3,3,4,4,4,4,4,4,4,3,3,3,3,3,3,3,0,0,0,0,0,0,0];
  for (let i = 0; i < remBits[ver]; i++) dataBits.push(0);

  // Build matrix, place fixed patterns
  const m = createMatrix(ver);
  placeFinder(m, 0, 0);
  placeFinder(m, 0, m.size - 7);
  placeFinder(m, m.size - 7, 0);
  placeAlignment(m, ver);
  placeTiming(m);
  reserveFormatAreas(m, ver);

  // Place data
  placeData(m, dataBits);

  // Try all 8 masks, pick lowest penalty
  let bestMask = 0, bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const trial = {
      modules: cloneModules(m.modules, size),
      reserved: m.reserved,
      size,
    };
    applyMask(trial, mask);
    writeFormatInfo(trial, ecIdx, mask);
    writeVersionInfo(trial, ver);
    const s = penalty(trial.modules, size);
    if (s < bestScore) { bestScore = s; bestMask = mask; }
  }

  // Apply best mask to original
  applyMask(m, bestMask);
  writeFormatInfo(m, ecIdx, bestMask);
  writeVersionInfo(m, ver);

  // Convert Uint8Array rows to boolean[][]
  const boolModules = m.modules.map(row => Array.from(row, v => v === 1));
  return { modules: boolModules, size };
}
