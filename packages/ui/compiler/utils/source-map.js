/**
 * Decantr Compiler - Source Map Utilities
 *
 * VLQ encoding for source maps.
 */

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Encode a number as VLQ
 * @param {number} value
 * @returns {string}
 */
export function encodeVLQ(value) {
  let encoded = '';
  let vlq = value < 0 ? ((-value) << 1) | 1 : value << 1;

  do {
    let digit = vlq & 0x1F;
    vlq >>>= 5;
    if (vlq > 0) {
      digit |= 0x20;
    }
    encoded += BASE64[digit];
  } while (vlq > 0);

  return encoded;
}

/**
 * Decode VLQ to number
 * @param {string} encoded
 * @param {number} start
 * @returns {{ value: number, length: number }}
 */
export function decodeVLQ(encoded, start = 0) {
  let value = 0;
  let shift = 0;
  let i = start;

  do {
    const digit = BASE64.indexOf(encoded[i]);
    value |= (digit & 0x1F) << shift;
    shift += 5;
    i++;
  } while (encoded[i - 1] && (BASE64.indexOf(encoded[i - 1]) & 0x20));

  const isNegative = value & 1;
  value >>>= 1;

  return {
    value: isNegative ? -value : value,
    length: i - start
  };
}

/**
 * @typedef {Object} Mapping
 * @property {number} genLine
 * @property {number} genCol
 * @property {number} [srcIndex]
 * @property {number} [srcLine]
 * @property {number} [srcCol]
 * @property {number} [nameIndex]
 */

/**
 * Source map generator
 */
export class SourceMapGenerator {
  constructor(options = {}) {
    this.file = options.file || '';
    this.sourceRoot = options.sourceRoot || '';
    this.sources = [];
    this.sourcesContent = [];
    this.names = [];
    /** @type {Mapping[]} */
    this.mappings = [];
  }

  /**
   * Add a source file
   * @param {string} source
   * @param {string} [content]
   * @returns {number} Source index
   */
  addSource(source, content) {
    let index = this.sources.indexOf(source);
    if (index === -1) {
      index = this.sources.length;
      this.sources.push(source);
      this.sourcesContent.push(content || null);
    }
    return index;
  }

  /**
   * Add a name
   * @param {string} name
   * @returns {number} Name index
   */
  addName(name) {
    let index = this.names.indexOf(name);
    if (index === -1) {
      index = this.names.length;
      this.names.push(name);
    }
    return index;
  }

  /**
   * Add a mapping
   * @param {Mapping} mapping
   */
  addMapping(mapping) {
    this.mappings.push(mapping);
  }

  /**
   * Generate the source map JSON
   * @returns {Object}
   */
  generate() {
    // Sort mappings
    this.mappings.sort((a, b) => {
      if (a.genLine !== b.genLine) return a.genLine - b.genLine;
      return a.genCol - b.genCol;
    });

    // Encode mappings
    let prevGenCol = 0;
    let prevSrcIndex = 0;
    let prevSrcLine = 0;
    let prevSrcCol = 0;
    let prevNameIndex = 0;

    const lines = [];
    let currentLine = [];
    let currentLineNum = 0;

    for (const mapping of this.mappings) {
      // Fill empty lines
      while (currentLineNum < mapping.genLine) {
        lines.push(currentLine.join(','));
        currentLine = [];
        prevGenCol = 0;
        currentLineNum++;
      }

      let segment = encodeVLQ(mapping.genCol - prevGenCol);
      prevGenCol = mapping.genCol;

      if (mapping.srcIndex !== undefined) {
        segment += encodeVLQ(mapping.srcIndex - prevSrcIndex);
        prevSrcIndex = mapping.srcIndex;

        segment += encodeVLQ(mapping.srcLine - prevSrcLine);
        prevSrcLine = mapping.srcLine;

        segment += encodeVLQ(mapping.srcCol - prevSrcCol);
        prevSrcCol = mapping.srcCol;

        if (mapping.nameIndex !== undefined) {
          segment += encodeVLQ(mapping.nameIndex - prevNameIndex);
          prevNameIndex = mapping.nameIndex;
        }
      }

      currentLine.push(segment);
    }

    lines.push(currentLine.join(','));

    return {
      version: 3,
      file: this.file,
      sourceRoot: this.sourceRoot,
      sources: this.sources,
      sourcesContent: this.sourcesContent,
      names: this.names,
      mappings: lines.join(';')
    };
  }

  /**
   * Generate as JSON string
   */
  toString() {
    return JSON.stringify(this.generate());
  }
}

/**
 * Create inline source map comment
 * @param {string} mapJson
 * @returns {string}
 */
export function inlineSourceMap(mapJson) {
  const base64 = Buffer.from(mapJson).toString('base64');
  return `//# sourceMappingURL=data:application/json;base64,${base64}`;
}
