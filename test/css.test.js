import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { css, define, extractCSS, reset } from '../src/css/index.js';

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
    css('_bg0', '_bg1', '_fg0', '_fg2');
    const output = extractCSS();
    assert.ok(output.includes('._bg0{background:var(--c0)}'));
    assert.ok(output.includes('._fg2{color:var(--c2)}'));
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
    css('_bg0 _sm:bg1');
    const output = extractCSS();
    assert.ok(output.includes('@media(min-width:640px){._sm\\:bg1{background:var(--c1)}}'));
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
