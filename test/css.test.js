import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { css, define, extractCSS, reset } from '../src/css/index.js';
import { derive, deriveMonochromeSeed, defaultSeed, defaultPersonality, hexToRgb, rgbToOklch, contrast } from '../src/css/derive.js';

let cleanup;

before(() => {
  const env = createDOM();
  cleanup = env.cleanup;
});

after(() => {
  if (cleanup) cleanup();
});

beforeEach(() => {
  reset();
});

describe('css()', () => {
  it('returns class names', () => {
    const result = css('_p4', '_flex');
    assert.equal(result, '_p4 _flex');
  });

  it('injects CSS rules into style element', () => {
    css('_p4');
    const output = extractCSS();
    assert.ok(output.includes('._p4{padding:1rem}'));
  });

  it('deduplicates injections', () => {
    css('_p4');
    css('_p4');
    const output = extractCSS();
    const count = output.split('._p4{').length - 1;
    assert.equal(count, 1);
  });

  it('handles space-separated classes in single string', () => {
    const result = css('_p4 _m0 _flex');
    assert.equal(result, '_p4 _m0 _flex');
    const output = extractCSS();
    assert.ok(output.includes('._p4{'));
    assert.ok(output.includes('._m0{'));
    assert.ok(output.includes('._flex{'));
  });

  it('passes through unknown classes', () => {
    const result = css('_p4', 'my-custom-class');
    assert.equal(result, '_p4 my-custom-class');
  });

  it('handles empty/falsy inputs', () => {
    const result = css('', null, undefined, '_p4');
    assert.equal(result, '_p4');
  });
});

describe('define()', () => {
  it('registers custom atomic classes', () => {
    define('brand', 'background:#ff6600');
    const result = css('brand');
    assert.equal(result, 'brand');
    const output = extractCSS();
    assert.ok(output.includes('.brand{background:#ff6600}'));
  });
});

describe('atom coverage', () => {
  it('generates spacing atoms', () => {
    css('_p0', '_p4', '_px2', '_py3', '_mt1', '_mb4', '_gap2');
    const output = extractCSS();
    assert.ok(output.includes('._p0{padding:0}'));
    assert.ok(output.includes('._p4{padding:1rem}'));
    assert.ok(output.includes('._px2{padding-inline:0.5rem}'));
    assert.ok(output.includes('._mt1{margin-top:0.25rem}'));
    assert.ok(output.includes('._gap2{gap:0.5rem}'));
  });

  it('generates display atoms', () => {
    css('_flex', '_grid', '_block', '_none');
    const output = extractCSS();
    assert.ok(output.includes('._flex{display:flex}'));
    assert.ok(output.includes('._grid{display:grid}'));
    assert.ok(output.includes('._block{display:block}'));
    assert.ok(output.includes('._none{display:none}'));
  });

  it('generates flexbox atoms', () => {
    css('_col', '_row', '_wrap', '_center', '_aic', '_jcsb');
    const output = extractCSS();
    assert.ok(output.includes('._col{flex-direction:column}'));
    assert.ok(output.includes('._row{flex-direction:row}'));
    assert.ok(output.includes('._center{'));
  });

  it('generates color atoms', () => {
    css('_bgprimary', '_fgprimary', '_bgbg', '_fgfg');
    const output = extractCSS();
    assert.ok(output.includes('._bgprimary{background:var(--d-primary)}'));
    assert.ok(output.includes('._fgfg{color:var(--d-fg)}'));
  });

  it('generates typography atoms', () => {
    css('_t14', '_t24', '_bold', '_tc');
    const output = extractCSS();
    assert.ok(output.includes('._t14{font-size:0.875rem}'));
    assert.ok(output.includes('._t24{font-size:1.5rem}'));
    assert.ok(output.includes('._bold{font-weight:700}'));
    assert.ok(output.includes('._tc{text-align:center}'));
  });

  it('generates border atoms', () => {
    css('_r2', '_rfull', '_b1');
    const output = extractCSS();
    assert.ok(output.includes('._r2{border-radius:0.5rem}'));
    assert.ok(output.includes('._rfull{border-radius:9999px}'));
    assert.ok(output.includes('._b1{border:1px solid}'));
  });
});

describe('hscreen/mhscreen bug fix', () => {
  it('hscreen uses vh not vw', () => {
    css('_hscreen');
    const output = extractCSS();
    assert.ok(output.includes('._hscreen{height:100vh}'));
    assert.ok(!output.includes('100vw'));
  });

  it('mhscreen uses vh not vw', () => {
    css('_mhscreen');
    const output = extractCSS();
    assert.ok(output.includes('._mhscreen{max-height:100vh}'));
  });

  it('wscreen still uses vw', () => {
    css('_wscreen');
    const output = extractCSS();
    assert.ok(output.includes('._wscreen{width:100vw}'));
  });
});

describe('negative margins', () => {
  it('generates negative margin atoms', () => {
    css('_-m2', '_-mt4', '_-mx1', '_-mb3');
    const output = extractCSS();
    assert.ok(output.includes('._-m2{margin:-0.5rem}'));
    assert.ok(output.includes('._-mt4{margin-top:-1rem}'));
    assert.ok(output.includes('._-mx1{margin-inline:-0.25rem}'));
    assert.ok(output.includes('._-mb3{margin-bottom:-0.75rem}'));
  });

  it('generates extended negative margin atoms up to 32', () => {
    css('_-m14', '_-mt16', '_-mx20', '_-m32');
    const output = extractCSS();
    assert.ok(output.includes('._-m14{margin:-3.5rem}'));
    assert.ok(output.includes('._-mt16{margin-top:-4rem}'));
    assert.ok(output.includes('._-mx20{margin-inline:-5rem}'));
    assert.ok(output.includes('._-m32{margin:-8rem}'));
  });

  it('does not generate negative margins for 0 or 40+', () => {
    const result = css('_-m0', '_-m40');
    // _-m0 and _-m40 should pass through as unknown
    assert.ok(result.includes('_-m0'));
    assert.ok(result.includes('_-m40'));
    const output = extractCSS();
    assert.ok(!output.includes('._-m0{'));
    assert.ok(!output.includes('._-m40{'));
  });
});

describe('auto margins', () => {
  it('generates auto margin atoms', () => {
    css('_ma', '_mxa', '_mya', '_mta', '_mra', '_mba', '_mla');
    const output = extractCSS();
    assert.ok(output.includes('._ma{margin:auto}'));
    assert.ok(output.includes('._mxa{margin-inline:auto}'));
    assert.ok(output.includes('._mya{margin-block:auto}'));
    assert.ok(output.includes('._mta{margin-top:auto}'));
    assert.ok(output.includes('._mra{margin-right:auto}'));
    assert.ok(output.includes('._mba{margin-bottom:auto}'));
    assert.ok(output.includes('._mla{margin-left:auto}'));
  });
});

describe('min-width/height', () => {
  it('generates min-width atoms', () => {
    css('_minw0', '_minw4', '_minwfull', '_minwscreen', '_minwfit', '_minwmin', '_minwmax');
    const output = extractCSS();
    assert.ok(output.includes('._minw0{min-width:0}'));
    assert.ok(output.includes('._minw4{min-width:1rem}'));
    assert.ok(output.includes('._minwfull{min-width:100%}'));
    assert.ok(output.includes('._minwscreen{min-width:100vw}'));
    assert.ok(output.includes('._minwfit{min-width:fit-content}'));
    assert.ok(output.includes('._minwmin{min-width:min-content}'));
    assert.ok(output.includes('._minwmax{min-width:max-content}'));
  });

  it('generates min-height atoms', () => {
    css('_minh0', '_minh4', '_minhfull', '_minhscreen');
    const output = extractCSS();
    assert.ok(output.includes('._minh0{min-height:0}'));
    assert.ok(output.includes('._minh4{min-height:1rem}'));
    assert.ok(output.includes('._minhfull{min-height:100%}'));
    assert.ok(output.includes('._minhscreen{min-height:100vh}'));
  });

  it('generates extended min-width atoms', () => {
    css('_minw16', '_minw32');
    const output = extractCSS();
    assert.ok(output.includes('._minw16{min-width:4rem}'));
    assert.ok(output.includes('._minw32{min-width:8rem}'));
  });
});

describe('content sizing keywords', () => {
  it('generates content sizing atoms', () => {
    css('_wmin', '_wmax', '_hmin', '_hmax', '_mwmin', '_mwmax', '_mhmin', '_mhmax');
    const output = extractCSS();
    assert.ok(output.includes('._wmin{width:min-content}'));
    assert.ok(output.includes('._wmax{width:max-content}'));
    assert.ok(output.includes('._hmin{height:min-content}'));
    assert.ok(output.includes('._hmax{height:max-content}'));
    assert.ok(output.includes('._mwmin{max-width:min-content}'));
    assert.ok(output.includes('._mwmax{max-width:max-content}'));
    assert.ok(output.includes('._mhmin{max-height:min-content}'));
    assert.ok(output.includes('._mhmax{max-height:max-content}'));
  });
});

describe('enhanced flex', () => {
  it('generates direction extras', () => {
    css('_colr', '_rowr', '_wrapr');
    const output = extractCSS();
    assert.ok(output.includes('._colr{flex-direction:column-reverse}'));
    assert.ok(output.includes('._rowr{flex-direction:row-reverse}'));
    assert.ok(output.includes('._wrapr{flex-wrap:wrap-reverse}'));
  });

  it('generates flex shorthands', () => {
    css('_flexauto', '_flexnone', '_flexinit');
    const output = extractCSS();
    assert.ok(output.includes('._flexauto{flex:1 1 auto}'));
    assert.ok(output.includes('._flexnone{flex:none}'));
    assert.ok(output.includes('._flexinit{flex:0 1 auto}'));
  });

  it('generates flex-basis atoms', () => {
    css('_basis0', '_basis4', '_basisa', '_basis25', '_basis50', '_basis75', '_basisfull');
    const output = extractCSS();
    assert.ok(output.includes('._basis0{flex-basis:0}'));
    assert.ok(output.includes('._basis4{flex-basis:1rem}'));
    assert.ok(output.includes('._basisa{flex-basis:auto}'));
    assert.ok(output.includes('._basis25{flex-basis:25%}'));
    assert.ok(output.includes('._basis50{flex-basis:50%}'));
    assert.ok(output.includes('._basis75{flex-basis:75%}'));
    assert.ok(output.includes('._basisfull{flex-basis:100%}'));
  });

  it('generates percentage basis atoms', () => {
    css('_basis33', '_basis66');
    const output = extractCSS();
    assert.ok(output.includes('._basis33{flex-basis:33.333%}'));
    assert.ok(output.includes('._basis66{flex-basis:66.667%}'));
  });
});

describe('order', () => {
  it('generates order atoms', () => {
    css('_ord0', '_ord3', '_ord12');
    const output = extractCSS();
    assert.ok(output.includes('._ord0{order:0}'));
    assert.ok(output.includes('._ord3{order:3}'));
    assert.ok(output.includes('._ord12{order:12}'));
  });

  it('generates special order atoms', () => {
    css('_ord-1', '_ordfirst', '_ordlast');
    const output = extractCSS();
    assert.ok(output.includes('._ord-1{order:-1}'));
    assert.ok(output.includes('._ordfirst{order:-9999}'));
    assert.ok(output.includes('._ordlast{order:9999}'));
  });
});

describe('complete alignment', () => {
  it('generates justify-content space-evenly', () => {
    css('_jcse');
    const output = extractCSS();
    assert.ok(output.includes('._jcse{justify-content:space-evenly}'));
  });

  it('generates align-content atoms', () => {
    css('_acc', '_acsb', '_acsa', '_acse', '_acfs', '_acfe', '_acs');
    const output = extractCSS();
    assert.ok(output.includes('._acc{align-content:center}'));
    assert.ok(output.includes('._acsb{align-content:space-between}'));
    assert.ok(output.includes('._acsa{align-content:space-around}'));
    assert.ok(output.includes('._acse{align-content:space-evenly}'));
    assert.ok(output.includes('._acfs{align-content:flex-start}'));
    assert.ok(output.includes('._acfe{align-content:flex-end}'));
    assert.ok(output.includes('._acs{align-content:stretch}'));
  });

  it('generates align-self atoms', () => {
    css('_asc', '_ass', '_asfs', '_asfe', '_asa', '_asbs');
    const output = extractCSS();
    assert.ok(output.includes('._asc{align-self:center}'));
    assert.ok(output.includes('._ass{align-self:stretch}'));
    assert.ok(output.includes('._asfs{align-self:flex-start}'));
    assert.ok(output.includes('._asfe{align-self:flex-end}'));
    assert.ok(output.includes('._asa{align-self:auto}'));
    assert.ok(output.includes('._asbs{align-self:baseline}'));
  });

  it('generates justify-items atoms', () => {
    css('_jic', '_jis', '_jifs', '_jife');
    const output = extractCSS();
    assert.ok(output.includes('._jic{justify-items:center}'));
    assert.ok(output.includes('._jis{justify-items:stretch}'));
    assert.ok(output.includes('._jifs{justify-items:start}'));
    assert.ok(output.includes('._jife{justify-items:end}'));
  });

  it('generates justify-self atoms', () => {
    css('_jsc', '_jss', '_jsfs', '_jsfe', '_jsa');
    const output = extractCSS();
    assert.ok(output.includes('._jsc{justify-self:center}'));
    assert.ok(output.includes('._jss{justify-self:stretch}'));
    assert.ok(output.includes('._jsfs{justify-self:start}'));
    assert.ok(output.includes('._jsfe{justify-self:end}'));
    assert.ok(output.includes('._jsa{justify-self:auto}'));
  });

  it('generates place shorthands', () => {
    css('_pic', '_pis', '_pcc', '_pcse', '_pcsb');
    const output = extractCSS();
    assert.ok(output.includes('._pic{place-items:center}'));
    assert.ok(output.includes('._pis{place-items:stretch}'));
    assert.ok(output.includes('._pcc{place-content:center}'));
    assert.ok(output.includes('._pcse{place-content:space-evenly}'));
    assert.ok(output.includes('._pcsb{place-content:space-between}'));
  });

  it('generates align-items baseline', () => {
    css('_aibs');
    const output = extractCSS();
    assert.ok(output.includes('._aibs{align-items:baseline}'));
  });
});

describe('grid system', () => {
  it('generates grid template columns', () => {
    css('_gc1', '_gc3', '_gc12', '_gcnone');
    const output = extractCSS();
    assert.ok(output.includes('._gc1{grid-template-columns:repeat(1,minmax(0,1fr))}'));
    assert.ok(output.includes('._gc3{grid-template-columns:repeat(3,minmax(0,1fr))}'));
    assert.ok(output.includes('._gc12{grid-template-columns:repeat(12,minmax(0,1fr))}'));
    assert.ok(output.includes('._gcnone{grid-template-columns:none}'));
  });

  it('generates grid template rows', () => {
    css('_gr1', '_gr3', '_gr6', '_grnone');
    const output = extractCSS();
    assert.ok(output.includes('._gr1{grid-template-rows:repeat(1,minmax(0,1fr))}'));
    assert.ok(output.includes('._gr3{grid-template-rows:repeat(3,minmax(0,1fr))}'));
    assert.ok(output.includes('._gr6{grid-template-rows:repeat(6,minmax(0,1fr))}'));
    assert.ok(output.includes('._grnone{grid-template-rows:none}'));
  });

  it('generates column span atoms', () => {
    css('_span1', '_span4', '_span12', '_spanfull');
    const output = extractCSS();
    assert.ok(output.includes('._span1{grid-column:span 1/span 1}'));
    assert.ok(output.includes('._span4{grid-column:span 4/span 4}'));
    assert.ok(output.includes('._span12{grid-column:span 12/span 12}'));
    assert.ok(output.includes('._spanfull{grid-column:1/-1}'));
  });

  it('generates row span atoms', () => {
    css('_rspan1', '_rspan3', '_rspan6', '_rspanfull');
    const output = extractCSS();
    assert.ok(output.includes('._rspan1{grid-row:span 1/span 1}'));
    assert.ok(output.includes('._rspan3{grid-row:span 3/span 3}'));
    assert.ok(output.includes('._rspan6{grid-row:span 6/span 6}'));
    assert.ok(output.includes('._rspanfull{grid-row:1/-1}'));
  });

  it('generates grid column start/end', () => {
    css('_gcs1', '_gcs5', '_gcs13', '_gce1', '_gce7');
    const output = extractCSS();
    assert.ok(output.includes('._gcs1{grid-column-start:1}'));
    assert.ok(output.includes('._gcs5{grid-column-start:5}'));
    assert.ok(output.includes('._gcs13{grid-column-start:13}'));
    assert.ok(output.includes('._gce1{grid-column-end:1}'));
    assert.ok(output.includes('._gce7{grid-column-end:7}'));
  });

  it('generates grid row start/end', () => {
    css('_grs1', '_grs4', '_grs7', '_gre1', '_gre7');
    const output = extractCSS();
    assert.ok(output.includes('._grs1{grid-row-start:1}'));
    assert.ok(output.includes('._grs4{grid-row-start:4}'));
    assert.ok(output.includes('._grs7{grid-row-start:7}'));
    assert.ok(output.includes('._gre1{grid-row-end:1}'));
    assert.ok(output.includes('._gre7{grid-row-end:7}'));
  });

  it('generates auto-fit responsive grid atoms', () => {
    css('_gcaf280', '_gcaf320', '_gcaf');
    const output = extractCSS();
    assert.ok(output.includes('._gcaf280{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}'));
    assert.ok(output.includes('._gcaf320{grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}'));
    assert.ok(output.includes('._gcaf{grid-template-columns:repeat(auto-fit,minmax(0,1fr))}'));
  });

  it('generates auto-fill grid atom', () => {
    css('_gcafl');
    const output = extractCSS();
    assert.ok(output.includes('._gcafl{grid-template-columns:repeat(auto-fill,minmax(0,1fr))}'));
  });

  it('generates grid auto-flow atoms', () => {
    css('_gflowr', '_gflowc', '_gflowd', '_gflowrd', '_gflowcd');
    const output = extractCSS();
    assert.ok(output.includes('._gflowr{grid-auto-flow:row}'));
    assert.ok(output.includes('._gflowc{grid-auto-flow:column}'));
    assert.ok(output.includes('._gflowd{grid-auto-flow:dense}'));
    assert.ok(output.includes('._gflowrd{grid-auto-flow:row dense}'));
    assert.ok(output.includes('._gflowcd{grid-auto-flow:column dense}'));
  });

  it('generates grid auto columns/rows atoms', () => {
    css('_gacfr', '_gacmin', '_gacmax', '_garfr', '_garmin', '_garmax');
    const output = extractCSS();
    assert.ok(output.includes('._gacfr{grid-auto-columns:minmax(0,1fr)}'));
    assert.ok(output.includes('._gacmin{grid-auto-columns:min-content}'));
    assert.ok(output.includes('._gacmax{grid-auto-columns:max-content}'));
    assert.ok(output.includes('._garfr{grid-auto-rows:minmax(0,1fr)}'));
    assert.ok(output.includes('._garmin{grid-auto-rows:min-content}'));
    assert.ok(output.includes('._garmax{grid-auto-rows:max-content}'));
  });
});

describe('aspect ratio', () => {
  it('generates aspect ratio atoms', () => {
    css('_arsq', '_ar169', '_ar43', '_ar219', '_ar32', '_ara');
    const output = extractCSS();
    assert.ok(output.includes('._arsq{aspect-ratio:1}'));
    assert.ok(output.includes('._ar169{aspect-ratio:16/9}'));
    assert.ok(output.includes('._ar43{aspect-ratio:4/3}'));
    assert.ok(output.includes('._ar219{aspect-ratio:21/9}'));
    assert.ok(output.includes('._ar32{aspect-ratio:3/2}'));
    assert.ok(output.includes('._ara{aspect-ratio:auto}'));
  });
});

describe('container utilities', () => {
  it('generates container atoms with margin-inline:auto', () => {
    css('_ctrsm', '_ctr', '_ctrlg', '_ctrxl', '_ctrfull');
    const output = extractCSS();
    assert.ok(output.includes('._ctrsm{max-width:640px;margin-inline:auto}'));
    assert.ok(output.includes('._ctr{max-width:960px;margin-inline:auto}'));
    assert.ok(output.includes('._ctrlg{max-width:1080px;margin-inline:auto}'));
    assert.ok(output.includes('._ctrxl{max-width:1280px;margin-inline:auto}'));
    assert.ok(output.includes('._ctrfull{max-width:100%;margin-inline:auto}'));
  });
});

describe('overflow per-axis', () => {
  it('generates overflow-x atoms', () => {
    css('_oxhidden', '_oxauto', '_oxscroll');
    const output = extractCSS();
    assert.ok(output.includes('._oxhidden{overflow-x:hidden}'));
    assert.ok(output.includes('._oxauto{overflow-x:auto}'));
    assert.ok(output.includes('._oxscroll{overflow-x:scroll}'));
  });

  it('generates overflow-y atoms', () => {
    css('_oyhidden', '_oyauto', '_oyscroll');
    const output = extractCSS();
    assert.ok(output.includes('._oyhidden{overflow-y:hidden}'));
    assert.ok(output.includes('._oyauto{overflow-y:auto}'));
    assert.ok(output.includes('._oyscroll{overflow-y:scroll}'));
  });
});

describe('text & visibility', () => {
  it('generates visibility atoms', () => {
    css('_visible', '_invisible');
    const output = extractCSS();
    assert.ok(output.includes('._visible{visibility:visible}'));
    assert.ok(output.includes('._invisible{visibility:hidden}'));
  });

  it('generates white-space atoms', () => {
    css('_wsnw', '_wsnormal', '_wspre', '_wsprewrap');
    const output = extractCSS();
    assert.ok(output.includes('._wsnw{white-space:nowrap}'));
    assert.ok(output.includes('._wsnormal{white-space:normal}'));
    assert.ok(output.includes('._wspre{white-space:pre}'));
    assert.ok(output.includes('._wsprewrap{white-space:pre-wrap}'));
  });

  it('generates truncate atom', () => {
    css('_truncate');
    const output = extractCSS();
    assert.ok(output.includes('._truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'));
  });

  it('generates line-clamp atoms', () => {
    css('_clamp2', '_clamp3');
    const output = extractCSS();
    assert.ok(output.includes('._clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'));
    assert.ok(output.includes('._clamp3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}'));
  });
});

describe('line-height aliases', () => {
  it('generates numeric line-height aliases', () => {
    css('_lh125', '_lh150', '_lh175');
    const output = extractCSS();
    assert.ok(output.includes('._lh125{line-height:1.25}'));
    assert.ok(output.includes('._lh150{line-height:1.5}'));
    assert.ok(output.includes('._lh175{line-height:1.75}'));
  });
});

describe('responsive breakpoints', () => {
  it('returns responsive class names', () => {
    const result = css('_grid _gc1 _sm:gc2 _lg:gc3');
    assert.equal(result, '_grid _gc1 _sm:gc2 _lg:gc3');
  });

  it('injects responsive CSS with media queries', () => {
    css('_sm:gc2');
    const output = extractCSS();
    assert.ok(output.includes('@media(min-width:640px)'));
    assert.ok(output.includes('._sm\\:gc2{grid-template-columns:repeat(2,minmax(0,1fr))}'));
  });

  it('supports all four breakpoints', () => {
    css('_sm:flex _md:grid _lg:none _xl:block');
    const output = extractCSS();
    assert.ok(output.includes('@media(min-width:640px)'));
    assert.ok(output.includes('@media(min-width:768px)'));
    assert.ok(output.includes('@media(min-width:1024px)'));
    assert.ok(output.includes('@media(min-width:1280px)'));
  });

  it('works with spacing atoms', () => {
    css('_p4 _md:p8');
    const output = extractCSS();
    assert.ok(output.includes('._p4{padding:1rem}'));
    assert.ok(output.includes('@media(min-width:768px){._md\\:p8{padding:2rem}}'));
  });

  it('works with typography atoms', () => {
    css('_t16 _lg:t24');
    const output = extractCSS();
    assert.ok(output.includes('._t16{font-size:1rem}'));
    assert.ok(output.includes('@media(min-width:1024px){._lg\\:t24{font-size:1.5rem}}'));
  });

  it('works with display atoms', () => {
    css('_none _sm:block');
    const output = extractCSS();
    assert.ok(output.includes('._none{display:none}'));
    assert.ok(output.includes('@media(min-width:640px){._sm\\:block{display:block}}'));
  });

  it('works with negative margins', () => {
    css('_sm:-mt4');
    const output = extractCSS();
    assert.ok(output.includes('@media(min-width:640px){._sm\\:-mt4{margin-top:-1rem}}'));
  });

  it('deduplicates responsive injections', () => {
    css('_sm:gc3');
    css('_sm:gc3');
    const output = extractCSS();
    const count = output.split('._sm\\:gc3{').length - 1;
    assert.equal(count, 1);
  });

  it('passes through unknown responsive atoms', () => {
    const result = css('_sm:nonexistent');
    assert.equal(result, '_sm:nonexistent');
  });

  it('works in space-separated string', () => {
    const result = css('_grid _gc1 _md:gc3 _gap4');
    assert.equal(result, '_grid _gc1 _md:gc3 _gap4');
    const output = extractCSS();
    assert.ok(output.includes('@media(min-width:768px){._md\\:gc3{grid-template-columns:repeat(3,minmax(0,1fr))}'));
  });

  it('works with color atoms', () => {
    css('_bgprimary _sm:bgaccent');
    const output = extractCSS();
    assert.ok(output.includes('@media(min-width:640px){._sm\\:bgaccent{background:var(--d-accent)}}'));
  });

  it('extractCSS includes responsive rules', () => {
    css('_p4 _sm:p8 _lg:gc3');
    const output = extractCSS();
    assert.ok(output.includes('._p4{'));
    assert.ok(output.includes('@media(min-width:640px)'));
    assert.ok(output.includes('@media(min-width:1024px)'));
  });

  it('reset clears responsive rules', () => {
    css('_sm:p4');
    reset();
    const output = extractCSS();
    assert.ok(!output.includes('@media'));
  });
});

describe('@layer cascade layers', () => {
  it('extractCSS includes layer order declaration', () => {
    css('_p4');
    const output = extractCSS();
    assert.ok(output.includes('@layer d.base,d.theme,d.atoms,d.user;'));
  });

  it('wraps atom rules in @layer d.atoms', () => {
    css('_flex');
    const output = extractCSS();
    assert.ok(output.includes('@layer d.atoms{._flex{display:flex}}'));
  });

  it('wraps responsive rules in @layer d.atoms', () => {
    css('_sm:gc3');
    const output = extractCSS();
    assert.ok(output.includes('@layer d.atoms{@media(min-width:640px)'));
  });

  it('layer order appears before atom rules', () => {
    css('_p4');
    const output = extractCSS();
    const layerIdx = output.indexOf('@layer d.base,d.theme,d.atoms,d.user;');
    const atomIdx = output.indexOf('@layer d.atoms{._p4{');
    assert.ok(layerIdx < atomIdx, 'layer order should precede atom rules');
  });
});

describe('container query atoms', () => {
  it('generates container-type atoms', () => {
    css('_cqinl', '_cqsz', '_cqnorm');
    const output = extractCSS();
    assert.ok(output.includes('._cqinl{container-type:inline-size}'));
    assert.ok(output.includes('._cqsz{container-type:size}'));
    assert.ok(output.includes('._cqnorm{container-type:normal}'));
  });

  it('injects container query rules with _cq prefix', () => {
    css('_cq640:gc3');
    const output = extractCSS();
    assert.ok(output.includes('@container(min-width:640px)'));
    assert.ok(output.includes('._cq640\\:gc3{grid-template-columns:repeat(3,minmax(0,1fr))}'));
  });

  it('supports all container query widths', () => {
    css('_cq320:flex _cq480:grid _cq640:none _cq768:block _cq1024:col');
    const output = extractCSS();
    assert.ok(output.includes('@container(min-width:320px)'));
    assert.ok(output.includes('@container(min-width:480px)'));
    assert.ok(output.includes('@container(min-width:640px)'));
    assert.ok(output.includes('@container(min-width:768px)'));
    assert.ok(output.includes('@container(min-width:1024px)'));
  });

  it('wraps container query rules in @layer d.atoms', () => {
    css('_cq640:p4');
    const output = extractCSS();
    assert.ok(output.includes('@layer d.atoms{@container(min-width:640px)'));
  });

  it('deduplicates container query injections', () => {
    css('_cq640:gc3');
    css('_cq640:gc3');
    const output = extractCSS();
    const count = output.split('._cq640\\:gc3{').length - 1;
    assert.equal(count, 1);
  });

  it('passes through invalid container query widths', () => {
    const result = css('_cq999:flex');
    assert.equal(result, '_cq999:flex');
  });

  it('reset clears container query rules', () => {
    css('_cq640:gc3');
    reset();
    const output = extractCSS();
    assert.ok(!output.includes('@container'));
  });
});

// ─── Composable Gradient Atoms ─────────────────────────────────

describe('composable gradient atoms', () => {
  it('generates direction atoms', () => {
    css('_gradR');
    const output = extractCSS();
    assert.ok(output.includes('linear-gradient(to right'));
    assert.ok(output.includes('--d-grad-stops'));
  });

  it('generates from atoms with CSS variable composition', () => {
    css('_fromPrimary');
    const output = extractCSS();
    assert.ok(output.includes('--d-grad-from:var(--d-primary)'));
    assert.ok(output.includes('--d-grad-stops'));
  });

  it('generates via atoms', () => {
    css('_viaAccent');
    const output = extractCSS();
    assert.ok(output.includes('var(--d-accent)'));
    assert.ok(output.includes('var(--d-grad-from'));
    assert.ok(output.includes('var(--d-grad-to'));
  });

  it('generates to atoms', () => {
    css('_toTertiary');
    const output = extractCSS();
    assert.ok(output.includes('--d-grad-to:var(--d-tertiary)'));
  });

  it('composes direction + from + to', () => {
    const result = css('_gradBR _fromPrimary _toAccent');
    assert.equal(result, '_gradBR _fromPrimary _toAccent');
    const output = extractCSS();
    assert.ok(output.includes('linear-gradient(to bottom right'));
    assert.ok(output.includes('--d-grad-from:var(--d-primary)'));
    assert.ok(output.includes('--d-grad-to:var(--d-accent)'));
  });

  it('supports transparent stops', () => {
    css('_fromTransparent _toTransparent');
    const output = extractCSS();
    assert.ok(output.includes('--d-grad-from:transparent'));
    assert.ok(output.includes('--d-grad-to:transparent'));
  });

  it('works with responsive prefixes', () => {
    css('_sm:gradBR');
    const output = extractCSS();
    assert.ok(output.includes('@media(min-width:640px)'));
    assert.ok(output.includes('linear-gradient(to bottom right'));
  });
});

// ─── Backdrop Filter Atoms ─────────────────────────────────────

describe('backdrop filter atoms', () => {
  it('generates blur atoms with composable CSS vars', () => {
    css('_bfblur12');
    const output = extractCSS();
    assert.ok(output.includes('--d-bf-blur:blur(12px)'));
    assert.ok(output.includes('backdrop-filter:'));
    assert.ok(output.includes('-webkit-backdrop-filter:'));
  });

  it('generates saturate atoms', () => {
    css('_bfsat150');
    const output = extractCSS();
    assert.ok(output.includes('--d-bf-sat:saturate(1.5)'));
    assert.ok(output.includes('backdrop-filter:'));
  });

  it('generates brightness atoms', () => {
    css('_bfbright110');
    const output = extractCSS();
    assert.ok(output.includes('--d-bf-bright:brightness(1.1)'));
  });

  it('composes multiple backdrop filters', () => {
    const result = css('_bfblur12 _bfsat150');
    assert.equal(result, '_bfblur12 _bfsat150');
    const output = extractCSS();
    assert.ok(output.includes('--d-bf-blur:blur(12px)'));
    assert.ok(output.includes('--d-bf-sat:saturate(1.5)'));
  });

  it('generates regular filter atoms', () => {
    css('_fblur8');
    const output = extractCSS();
    assert.ok(output.includes('filter:blur(8px)'));
  });

  it('generates grayscale filter atom', () => {
    css('_fgray');
    const output = extractCSS();
    assert.ok(output.includes('filter:grayscale(1)'));
  });

  it('works with responsive prefixes', () => {
    css('_lg:bfblur16');
    const output = extractCSS();
    assert.ok(output.includes('@media(min-width:1024px)'));
    assert.ok(output.includes('--d-bf-blur:blur(16px)'));
  });
});

// ─── Opacity Modifiers ─────────────────────────────────────────

describe('opacity modifiers', () => {
  it('generates color-mix for background opacity', () => {
    css('_bgprimary/50');
    const output = extractCSS();
    assert.ok(output.includes('color-mix(in srgb,var(--d-primary) 50%,transparent)'));
    assert.ok(output.includes('background:'));
  });

  it('generates color-mix for color opacity', () => {
    css('_fgaccent/30');
    const output = extractCSS();
    assert.ok(output.includes('color-mix(in srgb,var(--d-accent) 30%,transparent)'));
    assert.ok(output.includes('color:'));
  });

  it('generates color-mix for border-color opacity', () => {
    css('_bcborder/80');
    const output = extractCSS();
    assert.ok(output.includes('color-mix(in srgb,var(--d-border) 80%,transparent)'));
    assert.ok(output.includes('border-color:'));
  });

  it('returns correct class names', () => {
    const result = css('_bgprimary/50');
    assert.equal(result, '_bgprimary/50');
  });

  it('escapes slashes in CSS selector', () => {
    css('_bgprimary/50');
    const output = extractCSS();
    assert.ok(output.includes('_bgprimary\\/50'));
  });

  it('works with responsive prefixes', () => {
    css('_sm:bgprimary/50');
    const output = extractCSS();
    assert.ok(output.includes('@media(min-width:640px)'));
    assert.ok(output.includes('color-mix'));
  });

  it('works with container query prefixes', () => {
    css('_cq640:bgprimary/50');
    const output = extractCSS();
    assert.ok(output.includes('@container(min-width:640px)'));
    assert.ok(output.includes('color-mix'));
  });

  it('ignores non-color atoms with opacity', () => {
    const result = css('_flex/50');
    // _flex is display:flex, not a color — should pass through
    assert.equal(result, '_flex/50');
  });

  it('supports neutral color atoms', () => {
    css('_bgmuted/40');
    const output = extractCSS();
    assert.ok(output.includes('color-mix(in srgb,var(--d-muted) 40%,transparent)'));
  });
});

// ─── Group/Peer State Modifiers ────────────────────────────────

describe('group/peer state modifiers', () => {
  it('maps _group to d-group class', () => {
    const result = css('_group');
    assert.equal(result, 'd-group');
  });

  it('maps _peer to d-peer class', () => {
    const result = css('_peer');
    assert.equal(result, 'd-peer');
  });

  it('generates group-hover compound selector', () => {
    css('_gh:fgprimary');
    const output = extractCSS();
    assert.ok(output.includes('.d-group:hover'));
    assert.ok(output.includes('color:var(--d-primary)'));
  });

  it('generates group-focus-within compound selector', () => {
    css('_gf:bcprimary');
    const output = extractCSS();
    assert.ok(output.includes('.d-group:focus-within'));
    assert.ok(output.includes('border-color:var(--d-primary)'));
  });

  it('generates group-active compound selector', () => {
    css('_ga:bgprimary');
    const output = extractCSS();
    assert.ok(output.includes('.d-group:active'));
    assert.ok(output.includes('background:var(--d-primary)'));
  });

  it('generates peer-hover sibling selector', () => {
    css('_ph:op10');
    const output = extractCSS();
    assert.ok(output.includes('.d-peer:hover ~'));
    assert.ok(output.includes('opacity:1'));
  });

  it('generates peer-focus sibling selector', () => {
    css('_pf:fgaccent');
    const output = extractCSS();
    assert.ok(output.includes('.d-peer:focus ~'));
    assert.ok(output.includes('color:var(--d-accent)'));
  });

  it('returns correct class names', () => {
    const result = css('_gh:fgprimary');
    assert.equal(result, '_gh:fgprimary');
  });

  it('composes with other atoms', () => {
    const result = css('_group _flex _gap4');
    assert.equal(result, 'd-group _flex _gap4');
  });

  it('works with elevation atoms', () => {
    css('_gh:elev2');
    const output = extractCSS();
    assert.ok(output.includes('.d-group:hover'));
    assert.ok(output.includes('box-shadow:var(--d-elevation-2)'));
  });
});

// ─── Arbitrary Value Atoms ─────────────────────────────────────

describe('arbitrary value atoms', () => {
  it('generates width with arbitrary value', () => {
    css('_w[512px]');
    const output = extractCSS();
    assert.ok(output.includes('width:512px'));
  });

  it('converts underscores to spaces in value', () => {
    css('_shadow[0_4px_6px_rgba(0,0,0,0.1)]');
    const output = extractCSS();
    assert.ok(output.includes('box-shadow:0 4px 6px rgba(0,0,0,0.1)'));
  });

  it('supports background with hex color', () => {
    css('_bg[#1a1d24]');
    const output = extractCSS();
    assert.ok(output.includes('background:#1a1d24'));
  });

  it('supports padding with clamp', () => {
    css('_p[clamp(1rem,2vw,2rem)]');
    const output = extractCSS();
    assert.ok(output.includes('padding:clamp(1rem,2vw,2rem)'));
  });

  it('supports color property', () => {
    css('_fg[#c5d3e8]');
    const output = extractCSS();
    assert.ok(output.includes('color:#c5d3e8'));
  });

  it('supports border-radius', () => {
    css('_r[20px]');
    const output = extractCSS();
    assert.ok(output.includes('border-radius:20px'));
  });

  it('supports backdrop-filter', () => {
    css('_bf[blur(20px)_saturate(1.5)]');
    const output = extractCSS();
    assert.ok(output.includes('backdrop-filter:blur(20px) saturate(1.5)'));
  });

  it('ignores unknown property prefixes', () => {
    const result = css('_xyz[100px]');
    assert.equal(result, '_xyz[100px]');
  });

  it('returns correct class names', () => {
    const result = css('_w[512px]');
    assert.equal(result, '_w[512px]');
  });

  it('works with responsive prefixes', () => {
    css('_sm:w[512px]');
    const output = extractCSS();
    assert.ok(output.includes('@media(min-width:640px)'));
    assert.ok(output.includes('width:512px'));
  });

  it('works with container query prefixes', () => {
    css('_cq768:w[512px]');
    const output = extractCSS();
    assert.ok(output.includes('@container(min-width:768px)'));
    assert.ok(output.includes('width:512px'));
  });
});

describe('deriveMonochromeSeed()', () => {
  it('produces 6 distinct color keys', () => {
    const result = deriveMonochromeSeed('#00E5FF');
    const keys = ['accent', 'tertiary', 'success', 'warning', 'error', 'info'];
    for (const k of keys) {
      assert.ok(result[k], `missing key: ${k}`);
      assert.match(result[k], /^#[0-9a-fA-F]{6}$/, `${k} is not a valid hex color`);
    }
  });

  it('keeps all derived colors within ±20° hue of primary (OKLCH)', () => {
    const primaryHex = '#00E5FF';
    const [, , primaryH] = rgbToOklch(...hexToRgb(primaryHex));
    const result = deriveMonochromeSeed(primaryHex);
    for (const [key, hex] of Object.entries(result)) {
      const [, , h] = rgbToOklch(...hexToRgb(hex));
      const diff = Math.min(Math.abs(h - primaryH), 360 - Math.abs(h - primaryH));
      assert.ok(diff <= 21, `${key} hue ${h.toFixed(1)} is ${diff.toFixed(1)}° from primary ${primaryH.toFixed(1)}° (max 20°)`);
    }
  });

  it('produces distinct colors (no duplicates)', () => {
    const result = deriveMonochromeSeed('#00E5FF');
    const values = Object.values(result);
    const unique = new Set(values);
    assert.equal(unique.size, values.length, 'monochrome seed produced duplicate colors');
  });
});

describe('derive() with monochrome palette', () => {
  it('produces a valid token map', () => {
    const tokens = derive({
      bg: '#060918',
      fg: '#fafafa',
      primary: '#00E5FF',
    }, {
      ...defaultPersonality,
      palette: 'monochrome',
    });
    assert.ok(tokens['--d-primary'], 'missing --d-primary');
    assert.ok(tokens['--d-success'], 'missing --d-success');
    assert.ok(tokens['--d-error'], 'missing --d-error');
    assert.ok(tokens['--d-warning'], 'missing --d-warning');
    assert.ok(tokens['--d-info'], 'missing --d-info');
    assert.ok(tokens['--d-accent'], 'missing --d-accent');
  });

  it('monochrome role colors are all within same hue family (OKLCH)', () => {
    const tokens = derive({
      bg: '#060918',
      fg: '#fafafa',
      primary: '#00E5FF',
    }, {
      ...defaultPersonality,
      palette: 'monochrome',
    });
    const primaryRgb = hexToRgb(tokens['--d-primary']);
    const [, , primaryH] = rgbToOklch(...primaryRgb);
    const roles = ['--d-success', '--d-error', '--d-warning', '--d-info', '--d-accent'];
    for (const role of roles) {
      const rgb = hexToRgb(tokens[role]);
      const [, , h] = rgbToOklch(...rgb);
      const diff = Math.min(Math.abs(h - primaryH), 360 - Math.abs(h - primaryH));
      assert.ok(diff <= 25, `${role} hue ${h.toFixed(1)} deviates ${diff.toFixed(1)}° from primary (max 25°)`);
    }
  });
});

describe('Command Center style', () => {
  it('registers in the style list', async () => {
    const { getStyleList, setStyle, getStyle } = await import('../src/css/index.js');
    const styles = getStyleList();
    const ids = styles.map(s => s.id);
    assert.ok(ids.includes('command-center'), 'command-center not in style list');
  });

  it('activates via setStyle', async () => {
    const { setStyle, getStyle } = await import('../src/css/index.js');
    setStyle('command-center');
    const style = getStyle();
    const id = typeof style === 'function' ? style() : style;
    assert.equal(id, 'command-center');
  });

  it('uses monochrome palette personality', async () => {
    const { commandCenter } = await import('../src/css/styles/command-center.js');
    assert.equal(commandCenter.personality.palette, 'monochrome');
    assert.equal(commandCenter.personality.radius, 'sharp');
    assert.equal(commandCenter.personality.borders, 'bold');
    assert.equal(commandCenter.personality.density, 'compact');
  });
});

describe('field tokens', () => {
  it('derive() includes all field tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    const fieldKeys = [
      '--d-field-bg', '--d-field-bg-hover', '--d-field-bg-disabled', '--d-field-bg-readonly', '--d-field-bg-error', '--d-field-bg-success',
      '--d-field-border', '--d-field-border-hover', '--d-field-border-focus',
      '--d-field-border-error', '--d-field-border-success', '--d-field-border-disabled',
      '--d-field-border-width', '--d-field-ring', '--d-field-ring-error', '--d-field-ring-success',
      '--d-field-radius', '--d-field-placeholder',
    ];
    for (const key of fieldKeys) {
      assert.ok(tokens[key] !== undefined, `missing field token: ${key}`);
    }
  });

  it('field-bg defaults to var(--d-bg)', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    assert.equal(tokens['--d-field-bg'], 'var(--d-bg)');
  });

  it('field-bg-error is a semi-transparent error tint', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    assert.ok(tokens['--d-field-bg-error'], 'missing --d-field-bg-error token');
  });

  it('field-bg-success is a semi-transparent success tint', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    assert.ok(tokens['--d-field-bg-success'], 'missing --d-field-bg-success token');
  });

  it('field-border references --d-border', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    assert.equal(tokens['--d-field-border'], 'var(--d-border)');
  });
});

describe('interactive state tokens', () => {
  it('derive() includes all interactive state tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    const keys = [
      '--d-item-hover-bg', '--d-item-active-bg', '--d-selected-bg', '--d-selected-fg',
      '--d-selected-border', '--d-disabled-opacity', '--d-disabled-opacity-soft',
      '--d-icon-muted', '--d-icon-subtle',
    ];
    for (const key of keys) {
      assert.ok(tokens[key] !== undefined, `missing interactive state token: ${key}`);
    }
  });

  it('disabled-opacity is 0.5', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    assert.equal(tokens['--d-disabled-opacity'], '0.5');
  });
});

describe('overlay and table tokens', () => {
  it('derive() includes overlay intensity levels', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    assert.ok(tokens['--d-overlay-light']);
    assert.ok(tokens['--d-overlay-heavy']);
  });

  it('derive() includes table tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    assert.ok(tokens['--d-table-stripe-bg']);
    assert.ok(tokens['--d-table-header-bg']);
    assert.ok(tokens['--d-table-hover-bg']);
    assert.ok(tokens['--d-table-selected-bg']);
  });

  it('derive() includes semantic motion tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    assert.ok(tokens['--d-motion-enter']);
    assert.ok(tokens['--d-motion-exit']);
    assert.ok(tokens['--d-motion-state']);
  });
});

describe('layout and typography tokens', () => {
  it('derive() includes prose width and layout tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    assert.equal(tokens['--d-prose-width'], '75ch');
    assert.ok(tokens['--d-sidebar-width']);
    assert.ok(tokens['--d-drawer-width']);
    assert.equal(tokens['--d-sheet-max-h'], '85vh');
  });

  it('derive() includes typography semantic roles', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    assert.equal(tokens['--d-text-helper'], 'var(--d-text-xs)');
    assert.ok(tokens['--d-ls-tight']);
    assert.ok(tokens['--d-ls-wide']);
  });
});

describe('scrollbar and skeleton tokens', () => {
  it('derive() includes scrollbar tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    assert.ok(tokens['--d-scrollbar-w']);
    assert.ok(tokens['--d-scrollbar-track']);
    assert.ok(tokens['--d-scrollbar-thumb']);
    assert.ok(tokens['--d-scrollbar-thumb-hover']);
  });

  it('derive() includes skeleton tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    assert.ok(tokens['--d-skeleton-bg']);
    assert.ok(tokens['--d-skeleton-shine']);
  });
});

describe('chart UI tokens', () => {
  it('derive() includes chart UI tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    assert.ok(tokens['--d-chart-tooltip-shadow']);
    assert.ok(tokens['--d-chart-axis-opacity']);
    assert.ok(tokens['--d-chart-grid-opacity']);
    assert.ok(tokens['--d-chart-legend-gap']);
  });
});

describe('glass blur tokens', () => {
  it('derive() includes glass blur tokens', () => {
    const tokens = derive(defaultSeed, defaultPersonality, 'dark');
    assert.equal(tokens['--d-glass-blur-sm'], 'blur(8px)');
    assert.equal(tokens['--d-glass-blur'], 'blur(16px)');
    assert.equal(tokens['--d-glass-blur-lg'], 'blur(24px)');
  });
});
