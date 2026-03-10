(function(){const _m11=(function(){const scale=[0,0.25,0.5,0.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3];const extScale={14:3.5,16:4,20:5,24:6,32:8,40:10,48:12,56:14,64:16};function rem(n){if(n===0)return'0';const val=scale[n]??extScale[n];return val!==undefined?`${val}rem`:`${n * 0.25}rem`}
const atomMap=new Map();const spacingProps={p:'padding',px:'padding-inline',py:'padding-block',
pt:'padding-top',pr:'padding-right',pb:'padding-bottom',pl:'padding-left',
m:'margin',mx:'margin-inline',my:'margin-block',
mt:'margin-top',mr:'margin-right',mb:'margin-bottom',ml:'margin-left',
gap:'gap',gx:'column-gap',gy:'row-gap'};for(const[prefix,prop]of Object.entries(spacingProps)){for(let i=0;i<=12;i++){atomMap.set(`_${prefix}${i}`,`${prop}:${rem(i)}`)}
for(const n of Object.keys(extScale)){atomMap.set(`_${prefix}${n}`,`${prop}:${rem(Number(n))}`)}}
const negMarginProps={'-m':'margin','-mx':'margin-inline','-my':'margin-block',
'-mt':'margin-top','-mr':'margin-right','-mb':'margin-bottom','-ml':'margin-left'};for(const[prefix,prop]of Object.entries(negMarginProps)){for(let i=1;i<=12;i++){atomMap.set(`_${prefix}${i}`,`${prop}:-${rem(i)}`)}
for(const n of Object.keys(extScale)){const num=Number(n);if(num<=32){atomMap.set(`_${prefix}${n}`,`${prop}:-${rem(num)}`)}}}
atomMap.set('_ma','margin:auto');atomMap.set('_mxa','margin-inline:auto');atomMap.set('_mya','margin-block:auto');atomMap.set('_mta','margin-top:auto');atomMap.set('_mra','margin-right:auto');atomMap.set('_mba','margin-bottom:auto');atomMap.set('_mla','margin-left:auto');for(const[prefix,prop]of[['w','width'],['h','height'],['mw','max-width'],['mh','max-height']]){const unit=(prop==='height'||prop==='max-height')?'vh':'vw';atomMap.set(`_${prefix}100`,`${prop}:100%`);atomMap.set(`_${prefix}screen`,`${prop}:100${unit}`);atomMap.set(`_${prefix}auto`,`${prop}:auto`);atomMap.set(`_${prefix}full`,`${prop}:100%`);atomMap.set(`_${prefix}fit`,`${prop}:fit-content`);for(let i=0;i<=12;i++){atomMap.set(`_${prefix}${i}`,`${prop}:${rem(i)}`)}
for(const n of Object.keys(extScale)){atomMap.set(`_${prefix}${n}`,`${prop}:${rem(Number(n))}`)}}
for(const[prefix,prop]of[['minw','min-width'],['minh','min-height']]){const unit=prop==='min-height'?'vh':'vw';atomMap.set(`_${prefix}full`,`${prop}:100%`);atomMap.set(`_${prefix}screen`,`${prop}:100${unit}`);atomMap.set(`_${prefix}fit`,`${prop}:fit-content`);atomMap.set(`_${prefix}min`,`${prop}:min-content`);atomMap.set(`_${prefix}max`,`${prop}:max-content`);for(let i=0;i<=12;i++){atomMap.set(`_${prefix}${i}`,`${prop}:${rem(i)}`)}
for(const n of Object.keys(extScale)){atomMap.set(`_${prefix}${n}`,`${prop}:${rem(Number(n))}`)}}
atomMap.set('_wmin','width:min-content');atomMap.set('_wmax','width:max-content');atomMap.set('_hmin','height:min-content');atomMap.set('_hmax','height:max-content');atomMap.set('_mwmin','max-width:min-content');atomMap.set('_mwmax','max-width:max-content');atomMap.set('_mhmin','max-height:min-content');atomMap.set('_mhmax','max-height:max-content');for(const v of['block','inline','flex','grid','none','contents']){atomMap.set(`_${v}`,`display:${v}`)}
atomMap.set('_iflex','display:inline-flex');atomMap.set('_igrid','display:inline-grid');atomMap.set('_col','flex-direction:column');atomMap.set('_row','flex-direction:row');atomMap.set('_colr','flex-direction:column-reverse');atomMap.set('_rowr','flex-direction:row-reverse');atomMap.set('_wrap','flex-wrap:wrap');atomMap.set('_nowrap','flex-wrap:nowrap');atomMap.set('_wrapr','flex-wrap:wrap-reverse');atomMap.set('_grow','flex-grow:1');atomMap.set('_grow0','flex-grow:0');atomMap.set('_shrink','flex-shrink:1');atomMap.set('_shrink0','flex-shrink:0');atomMap.set('_flex1','flex:1 1 0%');atomMap.set('_flexauto','flex:1 1 auto');atomMap.set('_flexnone','flex:none');atomMap.set('_flexinit','flex:0 1 auto');atomMap.set('_basisa','flex-basis:auto');atomMap.set('_basis0','flex-basis:0');for(let i=1;i<=12;i++){atomMap.set(`_basis${i}`,`flex-basis:${rem(i)}`)}
for(const n of Object.keys(extScale)){atomMap.set(`_basis${n}`,`flex-basis:${rem(Number(n))}`)}
atomMap.set('_basis25','flex-basis:25%');atomMap.set('_basis33','flex-basis:33.333%');atomMap.set('_basis50','flex-basis:50%');atomMap.set('_basis66','flex-basis:66.667%');atomMap.set('_basis75','flex-basis:75%');atomMap.set('_basisfull','flex-basis:100%');for(let i=0;i<=12;i++){atomMap.set(`_ord${i}`,`order:${i}`)}
atomMap.set('_ord-1','order:-1');atomMap.set('_ordfirst','order:-9999');atomMap.set('_ordlast','order:9999');atomMap.set('_center','align-items:center;justify-content:center');atomMap.set('_aic','align-items:center');atomMap.set('_ais','align-items:stretch');atomMap.set('_aifs','align-items:flex-start');atomMap.set('_aife','align-items:flex-end');atomMap.set('_aibs','align-items:baseline');atomMap.set('_jcc','justify-content:center');atomMap.set('_jcsb','justify-content:space-between');atomMap.set('_jcsa','justify-content:space-around');atomMap.set('_jcse','justify-content:space-evenly');atomMap.set('_jcfs','justify-content:flex-start');atomMap.set('_jcfe','justify-content:flex-end');atomMap.set('_acc','align-content:center');atomMap.set('_acsb','align-content:space-between');atomMap.set('_acsa','align-content:space-around');atomMap.set('_acse','align-content:space-evenly');atomMap.set('_acfs','align-content:flex-start');atomMap.set('_acfe','align-content:flex-end');atomMap.set('_acs','align-content:stretch');atomMap.set('_asc','align-self:center');atomMap.set('_ass','align-self:stretch');atomMap.set('_asfs','align-self:flex-start');atomMap.set('_asfe','align-self:flex-end');atomMap.set('_asa','align-self:auto');atomMap.set('_asbs','align-self:baseline');atomMap.set('_jic','justify-items:center');atomMap.set('_jis','justify-items:stretch');atomMap.set('_jifs','justify-items:start');atomMap.set('_jife','justify-items:end');atomMap.set('_jsc','justify-self:center');atomMap.set('_jss','justify-self:stretch');atomMap.set('_jsfs','justify-self:start');atomMap.set('_jsfe','justify-self:end');atomMap.set('_jsa','justify-self:auto');atomMap.set('_pic','place-items:center');atomMap.set('_pis','place-items:stretch');atomMap.set('_pcc','place-content:center');atomMap.set('_pcse','place-content:space-evenly');atomMap.set('_pcsb','place-content:space-between');for(let i=1;i<=12;i++){atomMap.set(`_gc${i}`,`grid-template-columns:repeat(${i},minmax(0,1fr))`)}
atomMap.set('_gcnone','grid-template-columns:none');for(let i=1;i<=6;i++){atomMap.set(`_gr${i}`,`grid-template-rows:repeat(${i},minmax(0,1fr))`)}
atomMap.set('_grnone','grid-template-rows:none');for(let i=1;i<=12;i++){atomMap.set(`_span${i}`,`grid-column:span ${i}/span ${i}`)}
atomMap.set('_spanfull','grid-column:1/-1');for(let i=1;i<=6;i++){atomMap.set(`_rspan${i}`,`grid-row:span ${i}/span ${i}`)}
atomMap.set('_rspanfull','grid-row:1/-1');for(let i=1;i<=13;i++){atomMap.set(`_gcs${i}`,`grid-column-start:${i}`);atomMap.set(`_gce${i}`,`grid-column-end:${i}`)}
for(let i=1;i<=7;i++){atomMap.set(`_grs${i}`,`grid-row-start:${i}`);atomMap.set(`_gre${i}`,`grid-row-end:${i}`)}
for(const size of[160,200,220,250,280,300,320]){atomMap.set(`_gcaf${size}`,`grid-template-columns:repeat(auto-fit,minmax(${size}px,1fr))`)}
atomMap.set('_gcaf','grid-template-columns:repeat(auto-fit,minmax(0,1fr))');atomMap.set('_gcafl','grid-template-columns:repeat(auto-fill,minmax(0,1fr))');atomMap.set('_gflowr','grid-auto-flow:row');atomMap.set('_gflowc','grid-auto-flow:column');atomMap.set('_gflowd','grid-auto-flow:dense');atomMap.set('_gflowrd','grid-auto-flow:row dense');atomMap.set('_gflowcd','grid-auto-flow:column dense');atomMap.set('_gacfr','grid-auto-columns:minmax(0,1fr)');atomMap.set('_gacmin','grid-auto-columns:min-content');atomMap.set('_gacmax','grid-auto-columns:max-content');atomMap.set('_garfr','grid-auto-rows:minmax(0,1fr)');atomMap.set('_garmin','grid-auto-rows:min-content');atomMap.set('_garmax','grid-auto-rows:max-content');for(const v of['relative','absolute','fixed','sticky']){atomMap.set(`_${v}`,`position:${v}`)}
atomMap.set('_rel','position:relative');atomMap.set('_abs','position:absolute');atomMap.set('_top0','top:0');atomMap.set('_right0','right:0');atomMap.set('_bottom0','bottom:0');atomMap.set('_left0','left:0');atomMap.set('_inset0','inset:0');const fontSizes={t10:'0.625',t12:'0.75',t14:'0.875',t16:'1',t18:'1.125',t20:'1.25',t24:'1.5',t28:'1.75',t32:'2',t36:'2.25',t40:'2.5',t48:'3'};for(const[cls,size]of Object.entries(fontSizes)){atomMap.set(`_${cls}`,`font-size:${size}rem`)}
atomMap.set('_bold','font-weight:700');atomMap.set('_medium','font-weight:500');atomMap.set('_normal','font-weight:400');atomMap.set('_light','font-weight:300');atomMap.set('_italic','font-style:italic');atomMap.set('_underline','text-decoration:underline');atomMap.set('_strike','text-decoration:line-through');atomMap.set('_nounder','text-decoration:none');atomMap.set('_upper','text-transform:uppercase');atomMap.set('_lower','text-transform:lowercase');atomMap.set('_cap','text-transform:capitalize');atomMap.set('_tl','text-align:left');atomMap.set('_tc','text-align:center');atomMap.set('_tr','text-align:right');atomMap.set('_lh1','line-height:1');atomMap.set('_lh1a','line-height:1.25');atomMap.set('_lh1b','line-height:1.5');atomMap.set('_lh2','line-height:2');atomMap.set('_lh125','line-height:1.25');atomMap.set('_lh150','line-height:1.5');atomMap.set('_lh175','line-height:1.75');for(const[name,token,fallback]of[
['textxs','xs','0.625rem'],['textsm','sm','0.75rem'],['textbase','base','0.875rem'],
['textmd','md','1rem'],['textlg','lg','1.125rem'],['textxl','xl','1.25rem'],
['text2xl','2xl','1.5rem'],['text3xl','3xl','2rem'],['text4xl','4xl','2.5rem']
])atomMap.set(`_${name}`,`font-size:var(--d-text-${token},${fallback})`);for(const[name,token,fallback]of[
['lhtight','tight','1.1'],['lhsnug','snug','1.25'],['lhnormal','normal','1.5'],
['lhrelaxed','relaxed','1.6'],['lhloose','loose','1.75']
])atomMap.set(`_${name}`,`line-height:var(--d-lh-${token},${fallback})`);atomMap.set('_fwheading','font-weight:var(--d-fw-heading,700)');atomMap.set('_fwtitle','font-weight:var(--d-fw-title,600)');atomMap.set('_fwmedium','font-weight:var(--d-fw-medium,500)');atomMap.set('_lsheading','letter-spacing:var(--d-ls-heading,-0.025em)');atomMap.set('_heading1','font-size:var(--d-text-4xl,2.5rem);font-weight:var(--d-fw-heading,700);line-height:var(--d-lh-tight,1.1);letter-spacing:var(--d-ls-heading,-0.025em)');atomMap.set('_heading2','font-size:var(--d-text-3xl,2rem);font-weight:var(--d-fw-heading,700);line-height:var(--d-lh-tight,1.1);letter-spacing:var(--d-ls-heading,-0.025em)');atomMap.set('_heading3','font-size:var(--d-text-2xl,1.5rem);font-weight:var(--d-fw-heading,700);line-height:var(--d-lh-snug,1.25);letter-spacing:var(--d-ls-heading,-0.025em)');atomMap.set('_heading4','font-size:var(--d-text-xl,1.25rem);font-weight:var(--d-fw-title,600);line-height:var(--d-lh-snug,1.25)');atomMap.set('_heading5','font-size:var(--d-text-lg,1.125rem);font-weight:var(--d-fw-title,600);line-height:var(--d-lh-snug,1.25)');atomMap.set('_heading6','font-size:var(--d-text-md,1rem);font-weight:var(--d-fw-title,600);line-height:var(--d-lh-normal,1.5)');atomMap.set('_body','font-size:var(--d-text-base,0.875rem);line-height:var(--d-lh-normal,1.5)');atomMap.set('_bodylg','font-size:var(--d-text-md,1rem);line-height:var(--d-lh-relaxed,1.6)');atomMap.set('_caption','font-size:var(--d-text-sm,0.75rem);line-height:var(--d-lh-normal,1.5);color:var(--d-muted-fg)');atomMap.set('_label','font-size:var(--d-text-sm,0.75rem);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-none,1)');atomMap.set('_overline','font-size:var(--d-text-xs,0.625rem);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-none,1);text-transform:uppercase;letter-spacing:0.08em');for(let i=0;i<=9;i++){atomMap.set(`_bg${i}`,`background:var(--c${i})`);atomMap.set(`_fg${i}`,`color:var(--c${i})`);atomMap.set(`_bc${i}`,`border-color:var(--c${i})`)}
for(const role of['primary','accent','tertiary','success','warning','error','info']){atomMap.set(`_bg${role}`,`background:var(--d-${role})`);atomMap.set(`_fg${role}`,`color:var(--d-${role})`);atomMap.set(`_bc${role}`,`border-color:var(--d-${role})`);atomMap.set(`_bg${role}sub`,`background:var(--d-${role}-subtle)`);atomMap.set(`_fg${role}sub`,`color:var(--d-${role}-subtle-fg)`);atomMap.set(`_bc${role}bdr`,`border-color:var(--d-${role}-border)`);atomMap.set(`_fg${role}on`,`color:var(--d-${role}-fg)`)}
atomMap.set('_bgbg','background:var(--d-bg)');atomMap.set('_fgfg','color:var(--d-fg)');atomMap.set('_bgmuted','background:var(--d-muted)');atomMap.set('_fgmuted','color:var(--d-muted)');atomMap.set('_fgmutedfg','color:var(--d-muted-fg)');atomMap.set('_bcborder','border-color:var(--d-border)');atomMap.set('_bcstrong','border-color:var(--d-border-strong)');for(let i=0;i<=3;i++){atomMap.set(`_surface${i}`,`background:var(--d-surface-${i})`);atomMap.set(`_fgsurface${i}`,`color:var(--d-surface-${i}-fg)`);atomMap.set(`_bcsurface${i}`,`border-color:var(--d-surface-${i}-border)`)}
for(let i=0;i<=3;i++){atomMap.set(`_elev${i}`,`box-shadow:var(--d-elevation-${i})`)}
atomMap.set('_gradbrand','background:var(--d-gradient-brand)');atomMap.set('_gradbrandalt','background:var(--d-gradient-brand-alt)');atomMap.set('_gradbrandfull','background:var(--d-gradient-brand-full)');atomMap.set('_gradsurface','background:var(--d-gradient-surface)');atomMap.set('_gradoverlay','background:var(--d-gradient-overlay)');atomMap.set('_gradtext','background:var(--d-gradient-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent');atomMap.set('_gradtextalt','background:var(--d-gradient-text-alt);-webkit-background-clip:text;-webkit-text-fill-color:transparent');atomMap.set('_b0','border:0');atomMap.set('_b1','border:1px solid');atomMap.set('_b2','border:2px solid');for(let i=0;i<=8;i++){atomMap.set(`_r${i}`,`border-radius:${rem(i)}`)}
atomMap.set('_rfull','border-radius:9999px');atomMap.set('_rcircle','border-radius:50%');atomMap.set('_ohidden','overflow:hidden');atomMap.set('_oauto','overflow:auto');atomMap.set('_oscroll','overflow:scroll');atomMap.set('_ovisible','overflow:visible');atomMap.set('_oxhidden','overflow-x:hidden');atomMap.set('_oxauto','overflow-x:auto');atomMap.set('_oxscroll','overflow-x:scroll');atomMap.set('_oyhidden','overflow-y:hidden');atomMap.set('_oyauto','overflow-y:auto');atomMap.set('_oyscroll','overflow-y:scroll');atomMap.set('_arsq','aspect-ratio:1');atomMap.set('_ar169','aspect-ratio:16/9');atomMap.set('_ar43','aspect-ratio:4/3');atomMap.set('_ar219','aspect-ratio:21/9');atomMap.set('_ar32','aspect-ratio:3/2');atomMap.set('_ara','aspect-ratio:auto');atomMap.set('_ctrsm','max-width:640px;margin-inline:auto');atomMap.set('_ctr','max-width:960px;margin-inline:auto');atomMap.set('_ctrlg','max-width:1080px;margin-inline:auto');atomMap.set('_ctrxl','max-width:1280px;margin-inline:auto');atomMap.set('_ctrfull','max-width:100%;margin-inline:auto');atomMap.set('_visible','visibility:visible');atomMap.set('_invisible','visibility:hidden');atomMap.set('_wsnw','white-space:nowrap');atomMap.set('_wsnormal','white-space:normal');atomMap.set('_wspre','white-space:pre');atomMap.set('_wsprewrap','white-space:pre-wrap');atomMap.set('_truncate','overflow:hidden;text-overflow:ellipsis;white-space:nowrap');atomMap.set('_clamp2','display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden');atomMap.set('_clamp3','display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden');atomMap.set('_pointer','cursor:pointer');atomMap.set('_grab','cursor:grab');for(let i=0;i<=10;i++){atomMap.set(`_op${i}`,`opacity:${i / 10}`)}
atomMap.set('_trans','transition:all 0.2s ease');atomMap.set('_transfast','transition:all 0.1s ease');atomMap.set('_transslow','transition:all 0.4s ease');atomMap.set('_transnone','transition:none');for(const z of[0,10,20,30,40,50]){atomMap.set(`_z${z}`,`z-index:${z}`)}
atomMap.set('_shadow','box-shadow:0 1px 3px rgba(0,0,0,0.12),0 1px 2px rgba(0,0,0,0.06)');atomMap.set('_shadowmd','box-shadow:0 4px 6px rgba(0,0,0,0.1),0 2px 4px rgba(0,0,0,0.06)');atomMap.set('_shadowlg','box-shadow:0 10px 15px rgba(0,0,0,0.1),0 4px 6px rgba(0,0,0,0.05)');atomMap.set('_shadowno','box-shadow:none');atomMap.set('_mis0','margin-inline-start:0');atomMap.set('_mis1','margin-inline-start:0.25rem');atomMap.set('_mis2','margin-inline-start:0.5rem');atomMap.set('_mis3','margin-inline-start:0.75rem');atomMap.set('_mis4','margin-inline-start:1rem');atomMap.set('_mis6','margin-inline-start:1.5rem');atomMap.set('_mis8','margin-inline-start:2rem');atomMap.set('_mie0','margin-inline-end:0');atomMap.set('_mie1','margin-inline-end:0.25rem');atomMap.set('_mie2','margin-inline-end:0.5rem');atomMap.set('_mie3','margin-inline-end:0.75rem');atomMap.set('_mie4','margin-inline-end:1rem');atomMap.set('_mie6','margin-inline-end:1.5rem');atomMap.set('_mie8','margin-inline-end:2rem');atomMap.set('_mbs0','margin-block-start:0');atomMap.set('_mbs1','margin-block-start:0.25rem');atomMap.set('_mbs2','margin-block-start:0.5rem');atomMap.set('_mbs4','margin-block-start:1rem');atomMap.set('_mbe0','margin-block-end:0');atomMap.set('_mbe1','margin-block-end:0.25rem');atomMap.set('_mbe2','margin-block-end:0.5rem');atomMap.set('_mbe4','margin-block-end:1rem');atomMap.set('_pis0','padding-inline-start:0');atomMap.set('_pis1','padding-inline-start:0.25rem');atomMap.set('_pis2','padding-inline-start:0.5rem');atomMap.set('_pis3','padding-inline-start:0.75rem');atomMap.set('_pis4','padding-inline-start:1rem');atomMap.set('_pis6','padding-inline-start:1.5rem');atomMap.set('_pis8','padding-inline-start:2rem');atomMap.set('_pie0','padding-inline-end:0');atomMap.set('_pie1','padding-inline-end:0.25rem');atomMap.set('_pie2','padding-inline-end:0.5rem');atomMap.set('_pie3','padding-inline-end:0.75rem');atomMap.set('_pie4','padding-inline-end:1rem');atomMap.set('_pie6','padding-inline-end:1.5rem');atomMap.set('_pie8','padding-inline-end:2rem');atomMap.set('_pbs0','padding-block-start:0');atomMap.set('_pbs1','padding-block-start:0.25rem');atomMap.set('_pbs2','padding-block-start:0.5rem');atomMap.set('_pbs4','padding-block-start:1rem');atomMap.set('_pbe0','padding-block-end:0');atomMap.set('_pbe1','padding-block-end:0.25rem');atomMap.set('_pbe2','padding-block-end:0.5rem');atomMap.set('_pbe4','padding-block-end:1rem');atomMap.set('_insetis0','inset-inline-start:0');atomMap.set('_insetie0','inset-inline-end:0');atomMap.set('_insetbs0','inset-block-start:0');atomMap.set('_insetbe0','inset-block-end:0');atomMap.set('_rss','border-start-start-radius:var(--d-radius)');atomMap.set('_rse','border-start-end-radius:var(--d-radius)');atomMap.set('_res','border-end-start-radius:var(--d-radius)');atomMap.set('_ree','border-end-end-radius:var(--d-radius)');atomMap.set('_tstart','text-align:start');atomMap.set('_tend','text-align:end');atomMap.set('_floatis','float:inline-start');atomMap.set('_floatie','float:inline-end');atomMap.set('_wi','inline-size:100%');atomMap.set('_wb','block-size:100%');atomMap.set('_cqinl','container-type:inline-size');atomMap.set('_cqsz','container-type:size');atomMap.set('_cqnorm','container-type:normal');return{atomMap}})();const _m12=(function(){const injected=new Set();let styleEl=null;let layerEl=null;const BREAKPOINTS={sm:640,md:768,lg:1024,xl:1280};const BP_ORDER=['sm','md','lg','xl'];const CQ_WIDTHS=[320,480,640,768,1024];let bpEls=null;let cqEl=null;const LAYER_ORDER='@layer d.base,d.theme,d.atoms,d.user;';function ensureLayerOrder(){if(layerEl)return;if(typeof document==='undefined')return;layerEl=document.createElement('style');layerEl.setAttribute('data-decantr-layers','');layerEl.textContent=LAYER_ORDER;document.head.prepend(layerEl)}
function getStyleElement(){if(!styleEl){if(typeof document==='undefined')return null;ensureLayerOrder();styleEl=document.createElement('style');styleEl.setAttribute('data-decantr','');document.head.appendChild(styleEl)}
return styleEl}
function ensureBpElements(){if(bpEls)return bpEls;if(typeof document==='undefined')return null;bpEls={};getStyleElement();for(const bp of BP_ORDER){const el=document.createElement('style');el.setAttribute(`data-decantr-${bp}`,'');document.head.appendChild(el);bpEls[bp]=el}
return bpEls}
function inject(className,declaration){if(injected.has(className))return;injected.add(className);const style=getStyleElement();if(!style)return;style.textContent=(style.textContent||'')+`@layer d.atoms{.${className}{${declaration}}}`}
function injectResponsive(className,declaration,bp){if(injected.has(className))return;injected.add(className);const els=ensureBpElements();if(!els)return;const el=els[bp];const escaped=className.replace(/:/g,'\\:');el.textContent=(el.textContent||'')+`@layer d.atoms{@media(min-width:${BREAKPOINTS[bp]}px){.${escaped}{${declaration}}}}`}
function ensureCqElement(){if(cqEl)return cqEl;if(typeof document==='undefined')return null;getStyleElement();cqEl=document.createElement('style');cqEl.setAttribute('data-decantr-cq','');document.head.appendChild(cqEl);return cqEl}
function injectContainer(className,declaration,width){if(injected.has(className))return;injected.add(className);const el=ensureCqElement();if(!el)return;const escaped=className.replace(/:/g,'\\:');el.textContent=(el.textContent||'')+`@layer d.atoms{@container(min-width:${width}px){.${escaped}{${declaration}}}}`}
function extractCSS(){let css=layerEl?layerEl.textContent||'':'';css+=styleEl?styleEl.textContent||'':'';if(bpEls){for(const bp of BP_ORDER){if(bpEls[bp])css+=bpEls[bp].textContent||''}}
if(cqEl)css+=cqEl.textContent||'';return css}
function reset(){injected.clear();if(layerEl){layerEl.textContent=LAYER_ORDER}
if(styleEl){styleEl.textContent=''}
if(bpEls){for(const bp of BP_ORDER){if(bpEls[bp])bpEls[bp].textContent=''}}
if(cqEl){cqEl.textContent=''}}
return{inject,injectResponsive,injectContainer,extractCSS,reset,BREAKPOINTS,CQ_WIDTHS}})();const _m24=(function(){const pending=new Set();let flushing=false;let scheduled=false;let currentEffect=null;function setCurrentEffect(effect){currentEffect=effect}
function scheduleEffect(effect){pending.add(effect);if(!scheduled){scheduled=true;queueMicrotask(flush)}}
function flush(){if(flushing)return;flushing=true;scheduled=false;const effects=[...pending];pending.clear();for(let i=0;i<effects.length;i++){effects[i].run()}
flushing=false;if(pending.size>0){scheduled=true;queueMicrotask(flush)}}
let batchDepth=0;function batch(fn){batchDepth++;try{fn()}finally{batchDepth--;if(batchDepth===0)flush()}}
function isBatching(){return batchDepth>0}
return{setCurrentEffect,scheduleEffect,flush,batch,isBatching,currentEffect}})();const _m14=(function(){const{currentEffect,setCurrentEffect,scheduleEffect,isBatching,flush}=_m24;const{batch}=_m24;function createSignal(initialValue){let value=initialValue;const subscribers=new Set();function getter(){if(currentEffect)subscribers.add(currentEffect);return value}
function setter(next){const prev=value;value=typeof next==='function'?next(prev):next;if(!Object.is(prev,value)){if(isBatching()){for(const sub of subscribers)scheduleEffect(sub)}else{const subs=[...subscribers];for(let i=0;i<subs.length;i++)subs[i].run()}}}
return[getter,setter]}
function createEffect(fn){let cleanup=null;let disposed=false;const effect={run(){if(disposed)return;if(typeof cleanup==='function')cleanup();const prev=currentEffect;setCurrentEffect(effect);try{cleanup=fn()}finally{setCurrentEffect(prev)}}};effect.run();return function dispose(){disposed=true;if(typeof cleanup==='function')cleanup();cleanup=null}}
function untrack(fn){const prev=currentEffect;setCurrentEffect(null);try{return fn()}finally{setCurrentEffect(prev)}}
const _pendingResources=new Set();let _ctxId=0;const _ctxMap=new Map();return{createSignal,createEffect,untrack,_pendingResources,batch}})();const _m18=(function(){function hexToRgb(hex){hex=hex.replace('#','');if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];return[parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16)]}
function rgbToHex(r,g,b){return'#'+[r,g,b].map(c=>Math.round(Math.max(0,Math.min(255,c))).toString(16).padStart(2,'0')).join('')}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h,s,l=(max+min)/2;if(max===min){h=s=0} else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);if(max===r)h=((g-b)/d+(g<b?6:0))/6; else if(max===g)h=((b-r)/d+2)/6; else h=((r-g)/d+4)/6}
return[h*360,s*100,l*100]}
function hslToRgb(h,s,l){h/=360;s/=100;l/=100;if(s===0){const v=Math.round(l*255);return[v,v,v]}
const hue2rgb=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p};const q=l<0.5?l*(1+s):l+s-l*s;const p=2*l-q;return[
Math.round(hue2rgb(p,q,h+1/3)*255),
Math.round(hue2rgb(p,q,h)*255),
Math.round(hue2rgb(p,q,h-1/3)*255)
]}
function luminance(r,g,b){const[rs,gs,bs]=[r,g,b].map(c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)});return 0.2126*rs+0.7152*gs+0.0722*bs}
function contrast(rgb1,rgb2){const l1=luminance(...rgb1),l2=luminance(...rgb2);return(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)}
function darken(hex,amount){const[h,s,l]=rgbToHsl(...hexToRgb(hex));return rgbToHex(...hslToRgb(h,s,Math.max(0,l-amount)))}
function lighten(hex,amount){const[h,s,l]=rgbToHsl(...hexToRgb(hex));return rgbToHex(...hslToRgb(h,s,Math.min(100,l+amount)))}
function alpha(hex,opacity){const[r,g,b]=hexToRgb(hex);return`rgba(${r},${g},${b},${opacity})`}
function mixColors(hex1,hex2,weight){const[r1,g1,b1]=hexToRgb(hex1);const[r2,g2,b2]=hexToRgb(hex2);return rgbToHex(
Math.round(r1+(r2-r1)*weight),
Math.round(g1+(g2-g1)*weight),
Math.round(b1+(b2-b1)*weight)
)}
function pickForeground(bgHex){const bgRgb=hexToRgb(bgHex);return contrast([255,255,255],bgRgb)>=4.5?'#ffffff':'#09090b'}
function rotateHue(hex,degrees){const[h,s,l]=rgbToHsl(...hexToRgb(hex));return rgbToHex(...hslToRgb((h+degrees+360)%360,s,l))}
function validateContrast(tokens){const PAIRS=[
['--d-primary-fg','--d-primary',4.5],
['--d-accent-fg','--d-accent',4.5],
['--d-tertiary-fg','--d-tertiary',4.5],
['--d-success-fg','--d-success',4.5],
['--d-warning-fg','--d-warning',4.5],
['--d-error-fg','--d-error',4.5],
['--d-info-fg','--d-info',4.5],
['--d-fg','--d-bg',4.5],
['--d-muted-fg','--d-bg',4.5],
['--d-surface-0-fg','--d-surface-0',4.5],
['--d-surface-1-fg','--d-surface-1',4.5],
['--d-surface-2-fg','--d-surface-2',4.5],
['--d-surface-3-fg','--d-surface-3',4.5],
['--d-primary-subtle-fg','--d-primary-subtle',4.5],
['--d-error-subtle-fg','--d-error-subtle',4.5],
['--d-success-subtle-fg','--d-success-subtle',4.5],
['--d-warning-subtle-fg','--d-warning-subtle',4.5],
['--d-info-subtle-fg','--d-info-subtle',4.5],
];for(const[fgKey,bgKey,minRatio]of PAIRS){const fg=tokens[fgKey];const bg=tokens[bgKey];if(!fg||!bg)continue;const fgRgb=hexToRgb(fg);const bgRgb=hexToRgb(bg);const ratio=contrast(fgRgb,bgRgb);if(ratio<minRatio){tokens[fgKey]=adjustForContrast(fg,bg,minRatio)}}
return tokens}
function adjustForContrast(fgHex,bgHex,targetRatio){const bgRgb=hexToRgb(bgHex);const bgLum=luminance(...bgRgb);let[h,s,l]=rgbToHsl(...hexToRgb(fgHex));const direction=bgLum<0.5?1:-1;for(let i=0;i<50;i++){l=l+direction*2;l=Math.max(0,Math.min(100,l));const adjusted=rgbToHex(...hslToRgb(h,s,l));const adjRgb=hexToRgb(adjusted);if(contrast(adjRgb,bgRgb)>=targetRatio)return adjusted}
return bgLum<0.5?'#ffffff':'#09090b'}
const RADIUS={sharp:{sm:'2px',default:'0',lg:'0',full:'9999px'},
rounded:{sm:'4px',default:'8px',lg:'12px',full:'9999px'},
pill:{sm:'6px',default:'12px',lg:'16px',full:'9999px'},};const ELEVATION={flat:{light:['none','none','none','none'],
dark:['none','none','none','none'],},
subtle:{light:[
'none',
'0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04)',
'0 4px 12px rgba(0,0,0,0.08),0 2px 4px rgba(0,0,0,0.04)',
'0 12px 32px rgba(0,0,0,0.12),0 4px 8px rgba(0,0,0,0.06)',
],
dark:[
'none',
'0 1px 3px rgba(0,0,0,0.3),0 1px 2px rgba(0,0,0,0.2)',
'0 4px 12px rgba(0,0,0,0.3),0 2px 4px rgba(0,0,0,0.2)',
'0 12px 32px rgba(0,0,0,0.4),0 4px 8px rgba(0,0,0,0.3)',
],},
raised:{light:[
'none',
'0 2px 6px rgba(0,0,0,0.1),0 1px 3px rgba(0,0,0,0.06)',
'0 8px 24px rgba(0,0,0,0.12),0 4px 8px rgba(0,0,0,0.06)',
'0 20px 48px rgba(0,0,0,0.16),0 8px 16px rgba(0,0,0,0.08)',
],
dark:[
'none',
'0 2px 6px rgba(0,0,0,0.4),0 1px 3px rgba(0,0,0,0.3)',
'0 8px 24px rgba(0,0,0,0.4),0 4px 8px rgba(0,0,0,0.3)',
'0 20px 48px rgba(0,0,0,0.5),0 8px 16px rgba(0,0,0,0.4)',
],},
glass:{light:[
'none',
'0 1px 3px rgba(0,0,0,0.06)',
'0 4px 16px rgba(0,0,0,0.08)',
'0 12px 40px rgba(0,0,0,0.1)',
],
dark:[
'none',
'0 1px 3px rgba(0,0,0,0.2)',
'0 4px 16px rgba(0,0,0,0.3)',
'0 12px 40px rgba(0,0,0,0.4)',
],},
brutalist:{light:['none','2px 2px 0 var(--d-fg)','4px 4px 0 var(--d-fg)','6px 6px 0 var(--d-fg)'],
dark:['none','2px 2px 0 var(--d-fg)','4px 4px 0 var(--d-fg)','6px 6px 0 var(--d-fg)'],},};const SURFACE_BLUR={flat:['none','none','none'],
subtle:['none','none','none'],
raised:['none','none','none'],
glass:['blur(8px)','blur(12px)','blur(16px)'],
brutalist:['none','none','none'],};const MOTION={instant:{instant:'0ms',fast:'0ms',normal:'50ms',slow:'100ms',
standard:'ease',decelerate:'ease-out',accelerate:'ease-in',bounce:'steps(1)',},
snappy:{instant:'30ms',fast:'80ms',normal:'120ms',slow:'200ms',
standard:'ease',decelerate:'ease-out',accelerate:'ease-in',bounce:'steps(2)',},
smooth:{instant:'50ms',fast:'150ms',normal:'250ms',slow:'400ms',
standard:'cubic-bezier(0.4,0,0.2,1)',decelerate:'cubic-bezier(0,0,0.2,1)',
accelerate:'cubic-bezier(0.4,0,1,1)',bounce:'cubic-bezier(0.34,1.56,0.64,1)',},
bouncy:{instant:'50ms',fast:'150ms',normal:'300ms',slow:'500ms',
standard:'cubic-bezier(0.22,1,0.36,1)',decelerate:'cubic-bezier(0,0,0.2,1)',
accelerate:'cubic-bezier(0.4,0,1,1)',bounce:'cubic-bezier(0.34,1.56,0.64,1)',},};const INTERACTION={subtle:{hoverTranslate:'0, -1px',hoverBrightness:'1',
activeScale:'0.98',activeTranslate:'0, 0',},
raised:{hoverTranslate:'0, -2px',hoverBrightness:'1.02',
activeScale:'0.97',activeTranslate:'0, 1px',},
flat:{hoverTranslate:'0, 0',hoverBrightness:'1.05',
activeScale:'0.98',activeTranslate:'0, 0',},
brutalist:{hoverTranslate:'-2px, -2px',hoverBrightness:'1',
activeScale:'1',activeTranslate:'2px, 2px',},};const ELEVATION_TO_INTERACTION={flat:'flat',subtle:'subtle',raised:'raised',glass:'subtle',brutalist:'brutalist',};const BORDER={none:{width:'0',widthStrong:'0',style:'none'},
thin:{width:'1px',widthStrong:'2px',style:'solid'},
bold:{width:'2px',widthStrong:'3px',style:'solid'},};const PALETTE_TUNING={flat:{hoverShift:8,activeShift:15,subtleAlphaLight:0.10,subtleAlphaDark:0.15,borderAlphaLight:0.30,borderAlphaDark:0.40},
subtle:{hoverShift:8,activeShift:15,subtleAlphaLight:0.10,subtleAlphaDark:0.15,borderAlphaLight:0.30,borderAlphaDark:0.40},
raised:{hoverShift:8,activeShift:15,subtleAlphaLight:0.10,subtleAlphaDark:0.15,borderAlphaLight:0.30,borderAlphaDark:0.40},
glass:{hoverShift:5,activeShift:10,subtleAlphaLight:0.20,subtleAlphaDark:0.25,borderAlphaLight:0.20,borderAlphaDark:0.30},
brutalist:{hoverShift:12,activeShift:20,subtleAlphaLight:0.15,subtleAlphaDark:0.20,borderAlphaLight:0.80,borderAlphaDark:0.80},};const DENSITY={compact:{padX:'var(--d-sp-2)',padY:'var(--d-sp-1)',gap:'var(--d-sp-1-5)',
minH:'1.75rem',text:'var(--d-text-sm,0.75rem)',
compoundPad:'var(--d-sp-3)',compoundGap:'var(--d-sp-2)',},
comfortable:{padX:'var(--d-sp-4)',padY:'var(--d-sp-2)',gap:'var(--d-sp-2)',
minH:'2.25rem',text:'var(--d-text-base,0.875rem)',
compoundPad:'var(--d-sp-5)',compoundGap:'var(--d-sp-3)',},
spacious:{padX:'var(--d-sp-6)',padY:'var(--d-sp-3)',gap:'var(--d-sp-3)',
minH:'2.75rem',text:'var(--d-text-md,1rem)',
compoundPad:'var(--d-sp-8)',compoundGap:'var(--d-sp-4)',},};const defaultSeed={primary:'#1366D9',
accent:'#7c3aed',
tertiary:'#0891b2',
neutral:'#71717a',
success:'#22c55e',
warning:'#f59e0b',
error:'#ef4444',
info:'#3b82f6',
bg:'#ffffff',
bgDark:'#0a0a0a',};const defaultPersonality={radius:'rounded',
elevation:'subtle',
motion:'smooth',
borders:'thin',
density:'comfortable',
gradient:'none',};const TYPOGRAPHY={'--d-font':'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
'--d-font-mono':'ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace',
'--d-text-xs':'0.625rem','--d-text-sm':'0.75rem','--d-text-base':'0.875rem',
'--d-text-md':'1rem','--d-text-lg':'1.125rem','--d-text-xl':'1.25rem',
'--d-text-2xl':'1.5rem','--d-text-3xl':'2rem','--d-text-4xl':'2.5rem',
'--d-lh-none':'1','--d-lh-tight':'1.1','--d-lh-snug':'1.25',
'--d-lh-normal':'1.5','--d-lh-relaxed':'1.6','--d-lh-loose':'1.75',
'--d-fw-heading':'700','--d-fw-title':'600','--d-fw-medium':'500',
'--d-ls-heading':'-0.025em',};const SPACING={'--d-sp-1':'0.25rem','--d-sp-1-5':'0.375rem','--d-sp-2':'0.5rem',
'--d-sp-2-5':'0.625rem','--d-sp-3':'0.75rem','--d-sp-4':'1rem',
'--d-sp-5':'1.25rem','--d-sp-6':'1.5rem','--d-sp-8':'2rem',
'--d-sp-10':'2.5rem','--d-sp-12':'3rem','--d-sp-16':'4rem',
'--d-pad':'1.25rem',
'--d-compound-gap':'var(--d-sp-3)',
'--d-compound-pad':'var(--d-pad)',
'--d-offset-dropdown':'2px',
'--d-offset-menu':'4px',
'--d-offset-tooltip':'6px',
'--d-offset-popover':'8px',
'--d-panel-max-h':'240px',
'--d-tree-indent':'1em',
'--d-switch-w':'2.5rem',
'--d-switch-h':'1.375rem',
'--d-switch-thumb':'1rem',
'--d-stepper-w':'2rem',};const Z_INDEX={'--d-z-dropdown':'1000',
'--d-z-sticky':'1100',
'--d-z-modal':'1200',
'--d-z-popover':'1300',
'--d-z-toast':'1400',
'--d-z-tooltip':'1500',};function derivePaletteColor(hex,mode,bgHex,personality){const isDark=mode==='dark';const elev=(personality&&personality.elevation)||'subtle';const t=PALETTE_TUNING[elev]||PALETTE_TUNING.subtle;return{base:hex,
fg:pickForeground(hex),
hover:isDark?lighten(hex,t.hoverShift):darken(hex,t.hoverShift),
active:isDark?lighten(hex,Math.round(t.hoverShift/2)):darken(hex,t.activeShift),
subtle:alpha(hex,isDark?t.subtleAlphaDark:t.subtleAlphaLight),
subtleFg:isDark?lighten(hex,15):darken(hex,10),
border:alpha(hex,isDark?t.borderAlphaDark:t.borderAlphaLight),}}
function deriveNeutral(neutralHex,bgHex,mode){const isDark=mode==='dark';return{bg:bgHex,
fg:isDark?'#fafafa':'#09090b',
muted:isDark?lighten(neutralHex,10):neutralHex,
mutedFg:isDark?lighten(neutralHex,25):darken(neutralHex,10),
border:isDark?lighten(bgHex,12):darken(bgHex,12),
borderStrong:isDark?lighten(bgHex,25):darken(bgHex,30),
overlay:isDark?'rgba(0,0,0,0.7)':'rgba(0,0,0,0.5)',}}
function deriveSurfaces(neutralHex,bgHex,fgHex,mode,elevationType){const isDark=mode==='dark';const isGlass=elevationType==='glass';const s0=bgHex;const s1=isGlass
?(isDark?alpha(lighten(bgHex,8),0.7):alpha(bgHex,0.7))
:(isDark?lighten(bgHex,4):mixColors(bgHex,neutralHex,0.03));const s2=isGlass
?(isDark?alpha(lighten(bgHex,10),0.8):alpha(bgHex,0.8))
:(isDark?lighten(bgHex,7):mixColors(bgHex,neutralHex,0.02));const s3=isGlass
?(isDark?alpha(lighten(bgHex,6),0.85):alpha(bgHex,0.85))
:(isDark?lighten(bgHex,3):bgHex);const blur=SURFACE_BLUR[elevationType]||SURFACE_BLUR.subtle;return{'--d-surface-0':s0,'--d-surface-0-fg':fgHex,'--d-surface-0-border':isDark?lighten(bgHex,12):darken(bgHex,12),
'--d-surface-1':s1,'--d-surface-1-fg':fgHex,'--d-surface-1-border':isDark?lighten(bgHex,15):darken(bgHex,10),
'--d-surface-2':s2,'--d-surface-2-fg':fgHex,'--d-surface-2-border':isDark?lighten(bgHex,18):darken(bgHex,8),
'--d-surface-3':s3,'--d-surface-3-fg':fgHex,'--d-surface-3-border':isDark?lighten(bgHex,10):darken(bgHex,6),
'--d-surface-1-filter':blur[0],
'--d-surface-2-filter':blur[1],
'--d-surface-3-filter':blur[2],}}
function derive(seed,personality,mode,typography,overrides){const s={...defaultSeed,...seed};const p={...defaultPersonality,...personality};const isDark=mode==='dark';if(!seed.accent)s.accent=rotateHue(s.primary,60);if(!seed.tertiary)s.tertiary=rotateHue(s.primary,-60);if(!seed.info)s.info=rotateHue(s.primary,20);const bgHex=isDark?(s.bgDark||'#0a0a0a'):(s.bg||'#ffffff');const fgHex=isDark?'#fafafa':'#09090b';const palette={};const roles=['primary','accent','tertiary','success','warning','error','info'];for(const role of roles){const d=derivePaletteColor(s[role],mode,bgHex,p);palette[`--d-${role}`]=d.base;palette[`--d-${role}-fg`]=d.fg;palette[`--d-${role}-hover`]=d.hover;palette[`--d-${role}-active`]=d.active;palette[`--d-${role}-subtle`]=d.subtle;palette[`--d-${role}-subtle-fg`]=d.subtleFg;palette[`--d-${role}-border`]=d.border}
const n=deriveNeutral(s.neutral,bgHex,mode);const neutralTokens={'--d-bg':n.bg,
'--d-fg':n.fg,
'--d-muted':n.muted,
'--d-muted-fg':n.mutedFg,
'--d-border':n.border,
'--d-border-strong':n.borderStrong,
'--d-ring':'var(--d-primary)',
'--d-overlay':n.overlay,};const surfaces=deriveSurfaces(s.neutral,bgHex,fgHex,mode,p.elevation);const elev=(ELEVATION[p.elevation]||ELEVATION.subtle)[mode]||ELEVATION.subtle.light;const elevation={'--d-elevation-0':elev[0],
'--d-elevation-1':elev[1],
'--d-elevation-2':elev[2],
'--d-elevation-3':elev[3],};const interType=ELEVATION_TO_INTERACTION[p.elevation]||'subtle';const inter=INTERACTION[interType];const hoverShadow=elev[1]==='none'?'none':elev[2];const activeShadow=elev[0]==='none'?'none':elev[1];const interaction={'--d-hover-translate':inter.hoverTranslate,
'--d-hover-shadow':hoverShadow,
'--d-hover-brightness':inter.hoverBrightness,
'--d-active-scale':inter.activeScale,
'--d-active-translate':inter.activeTranslate,
'--d-active-shadow':activeShadow,
'--d-focus-ring-width':p.borders==='bold'?'3px':'2px',
'--d-focus-ring-color':'var(--d-ring)',
'--d-focus-ring-offset':'2px',
'--d-focus-ring-style':p.elevation==='brutalist'?'dashed':'solid',
'--d-selection-bg':'var(--d-primary-subtle)',
'--d-selection-fg':'var(--d-primary)',};const m=MOTION[p.motion]||MOTION.smooth;const motion={'--d-duration-instant':m.instant,
'--d-duration-fast':m.fast,
'--d-duration-normal':m.normal,
'--d-duration-slow':m.slow,
'--d-easing-standard':m.standard,
'--d-easing-decelerate':m.decelerate,
'--d-easing-accelerate':m.accelerate,
'--d-easing-bounce':m.bounce,};const rad=RADIUS[p.radius]||RADIUS.rounded;const radius={'--d-radius-sm':rad.sm,
'--d-radius':rad.default,
'--d-radius-lg':rad.lg,
'--d-radius-full':rad.full,};const brd=BORDER[p.borders]||BORDER.thin;const border={'--d-border-width':brd.width,
'--d-border-width-strong':brd.widthStrong,
'--d-border-style':brd.style,};const den=DENSITY[p.density]||DENSITY.comfortable;const density={'--d-density-pad-x':den.padX,
'--d-density-pad-y':den.padY,
'--d-density-gap':den.gap,
'--d-density-min-h':den.minH,
'--d-density-text':den.text,};const gNone=p.gradient==='none';const angle='var(--d-gradient-angle)';const gradients={'--d-gradient-angle':'135deg',
'--d-gradient-intensity':gNone?'0':'1',
'--d-gradient-brand':gNone
?'var(--d-primary)':`linear-gradient(${angle},var(--d-primary),var(--d-accent))`,
'--d-gradient-brand-alt':gNone
?'var(--d-accent)':`linear-gradient(${angle},var(--d-accent),var(--d-tertiary))`,
'--d-gradient-brand-full':gNone
?'var(--d-primary)':`linear-gradient(${angle},var(--d-primary),var(--d-accent),var(--d-tertiary))`,
'--d-gradient-surface':gNone
?'var(--d-surface-0)':'linear-gradient(180deg,var(--d-surface-0),var(--d-surface-1))',
'--d-gradient-overlay':'linear-gradient(180deg,transparent,var(--d-overlay))',
'--d-gradient-subtle':gNone
?'transparent':'linear-gradient(180deg,transparent,var(--d-primary-subtle))',
'--d-gradient-text':gNone
?'var(--d-primary)':`linear-gradient(${angle},var(--d-primary),var(--d-accent))`,
'--d-gradient-text-alt':gNone
?'var(--d-accent)':`linear-gradient(${angle},var(--d-accent),var(--d-tertiary))`,};const chartBase=[s.primary,s.accent,s.tertiary,s.success,s.warning,s.error,s.info,isDark?lighten(s.neutral,10):s.neutral];const charts={};for(let i=0;i<8;i++){charts[`--d-chart-${i}`]=chartBase[i];charts[`--d-chart-${i}-ext-1`]=isDark?lighten(chartBase[i],15):darken(chartBase[i],15);charts[`--d-chart-${i}-ext-2`]=rotateHue(chartBase[i],30);charts[`--d-chart-${i}-ext-3`]=isDark?lighten(rotateHue(chartBase[i],-30),10):darken(rotateHue(chartBase[i],-30),10)}
charts['--d-chart-tooltip-bg']='var(--d-surface-2)';charts['--d-chart-grid']=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)';charts['--d-chart-axis']=isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.3)';charts['--d-chart-crosshair']=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.3)';charts['--d-chart-selection']=alpha(s.primary,0.15);const legacy={'--d-transition':`all ${m.normal} ${m.standard}`,
'--d-shadow':elev[1],
'--d-radius-lg-compat':rad.lg,};const tokens={...palette,
...neutralTokens,
...surfaces,
...elevation,
...interaction,
...motion,
...radius,
...border,
...density,
...Z_INDEX,
...gradients,
...charts,
...TYPOGRAPHY,
...SPACING,
...legacy,
...(typography||{}),};if(overrides){Object.assign(tokens,overrides)}
validateContrast(tokens);return tokens}
function legacyColorMap(tokens){return{'--c0':tokens['--d-bg'],
'--c1':tokens['--d-primary'],
'--c2':tokens['--d-surface-1'],
'--c3':tokens['--d-fg'],
'--c4':tokens['--d-muted'],
'--c5':tokens['--d-border'],
'--c6':tokens['--d-primary-hover'],
'--c7':tokens['--d-success'],
'--c8':tokens['--d-warning'],
'--c9':tokens['--d-error'],}}
function densityCSS(){let css='';for(const[name,d]of Object.entries(DENSITY)){css+=`.d-${name}{--d-density-pad-x:${d.padX};--d-density-pad-y:${d.padY};--d-density-gap:${d.gap};--d-density-min-h:${d.minH};--d-density-text:${d.text};--d-compound-pad:${d.compoundPad};--d-compound-gap:${d.compoundGap}}`}
return css}
return{derive,legacyColorMap,densityCSS,defaultSeed,defaultPersonality,hexToRgb,rgbToHex,darken,lighten,alpha,mixColors,pickForeground,rotateHue,contrast,validateContrast,adjustForContrast}})();const _m19=(function(){const componentCSS=[
'.d-input-wrap .d-input:focus-visible,.d-textarea-wrap .d-textarea:focus-visible,.d-combobox-input-wrap .d-combobox-input:focus-visible,.d-inputnumber .d-inputnumber-input:focus-visible,.d-select .d-select:focus-visible,.d-cascader-trigger .d-cascader-input:focus-visible,.d-command-input-wrap .d-command-input:focus-visible,.d-colorpicker-trigger:focus-visible{outline:none}',
'.d-btn{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-btn:hover{background:var(--d-border);transform:translate(var(--d-hover-translate));box-shadow:var(--d-hover-shadow)}',
'.d-btn:active{transform:translate(var(--d-active-translate)) scale(var(--d-active-scale));box-shadow:var(--d-active-shadow)}',
'.d-btn-primary{background:var(--d-primary);color:var(--d-primary-fg);border-color:var(--d-primary)}',
'.d-btn-primary:hover{background:var(--d-primary-hover);border-color:var(--d-primary-hover)}',
'.d-btn-primary:active{background:var(--d-primary-active)}',
'.d-btn-secondary{background:transparent;color:var(--d-muted-fg);border-color:var(--d-border)}',
'.d-btn-secondary:hover{background:var(--d-surface-1);color:var(--d-fg)}',
'.d-btn-destructive{background:var(--d-error);color:var(--d-error-fg);border-color:var(--d-error)}',
'.d-btn-destructive:hover{background:var(--d-error-hover);border-color:var(--d-error-hover)}',
'.d-btn-destructive:active{background:var(--d-error-active)}',
'.d-btn-success{background:var(--d-success);color:var(--d-success-fg);border-color:var(--d-success)}',
'.d-btn-success:hover{background:var(--d-success-hover);border-color:var(--d-success-hover)}',
'.d-btn-warning{background:var(--d-warning);color:var(--d-warning-fg);border-color:var(--d-warning)}',
'.d-btn-warning:hover{background:var(--d-warning-hover);border-color:var(--d-warning-hover)}',
'.d-btn-outline{background:transparent;border:var(--d-border-width-strong) var(--d-border-style) var(--d-primary);border-width:var(--d-group-border, var(--d-border-width-strong));color:var(--d-primary)}',
'.d-btn-outline:hover{background:var(--d-primary-subtle);border-color:var(--d-primary-hover);color:var(--d-primary-hover)}',
'.d-btn-ghost{background:transparent;border-color:transparent}',
'.d-btn-ghost:hover{background:var(--d-surface-1)}',
'.d-btn-link{background:transparent;border:none;color:var(--d-primary);text-decoration:underline}',
'.d-btn-link:hover{color:var(--d-primary-hover)}',
'.d-btn-group>.d-btn{border-color:var(--d-border)}',
'.d-toggle{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-toggle:hover{background:var(--d-border);transform:translate(var(--d-hover-translate));box-shadow:var(--d-hover-shadow)}',
'.d-toggle:active{transform:translate(var(--d-active-translate)) scale(var(--d-active-scale))}',
'.d-toggle[aria-pressed="true"]{background:var(--d-primary-subtle);color:var(--d-primary);border-color:var(--d-primary-border)}',
'.d-toggle[aria-pressed="true"]:hover{background:var(--d-primary-subtle);filter:brightness(0.95)}',
'.d-toggle-outline{background:transparent;border-color:var(--d-border-strong)}',
'.d-toggle-outline:hover{background:var(--d-surface-1)}',
'.d-toggle-outline[aria-pressed="true"]{background:var(--d-primary-subtle);color:var(--d-primary);border-color:var(--d-primary-border)}',
'.d-toggle-group{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius)}',
'.d-toggle-group>.d-toggle{background:transparent;border:none;border-radius:calc(var(--d-radius) - 2px);color:var(--d-muted)}',
'.d-toggle-group>.d-toggle:hover{background:var(--d-surface-0);color:var(--d-fg);transform:none;box-shadow:none}',
'.d-toggle-group>.d-toggle:active{transform:none}',
'.d-toggle-group>.d-toggle[aria-pressed="true"]{background:transparent;box-shadow:none;color:var(--d-fg)}',
'.d-toggle-indicator{background:var(--d-bg);box-shadow:var(--d-elevation-1)}',
'.d-spinner{color:var(--d-primary)}',
'.d-spinner-dots>span,.d-spinner-pulse>span,.d-spinner-bars>span,.d-spinner-orbit>span{color:inherit;background:currentColor}',
'.d-btn-primary .d-spinner,.d-btn-destructive .d-spinner,.d-btn-success .d-spinner,.d-btn-warning .d-spinner{color:inherit}',
'.d-card{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-surface-1-border);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-1);color:var(--d-fg);backdrop-filter:var(--d-surface-1-filter);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-card-hover:hover{box-shadow:var(--d-elevation-2);transform:translate(var(--d-hover-translate))}',
'.d-card-footer{border-top:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'.d-input-wrap{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-input-wrap:focus-within{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle))}',
'.d-input{color:var(--d-fg)}',
'.d-input::placeholder{color:var(--d-muted)}',
'.d-input-error{border-color:var(--d-error)}',
'.d-input-error:focus-within{border-color:var(--d-error);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-error-subtle))}',
'.d-input-group{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-input-group:focus-within{border-color:var(--d-ring);box-shadow:0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle)}',
'.d-input-group-error{border-color:var(--d-error)}',
'.d-input-group-error:focus-within{border-color:var(--d-error);box-shadow:0 0 0 var(--d-focus-ring-width) var(--d-error-subtle)}',
'.d-input-group>:not(:first-child){border-left:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'.d-input-group-error>:not(:first-child){border-left-color:var(--d-error)}',
'.d-input-group-vertical>:not(:first-child){border-left-width:0;border-top:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'.d-input-group-error.d-input-group-vertical>:not(:first-child){border-top-color:var(--d-error)}',
'.d-input-group-addon{background:var(--d-surface-1);border-radius:var(--d-group-radius, var(--d-radius));color:var(--d-muted);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-input-group:not([data-disabled]) .d-input-group-addon:hover{background:var(--d-surface-0)}',
'.d-input-group:focus-within .d-input-group-addon{color:var(--d-fg)}',
'.d-input-group-error .d-input-group-addon{color:var(--d-error)}',
'.d-compact-group{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-compact-group:focus-within{border-color:var(--d-ring);box-shadow:0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle)}',
'.d-compact-group>:not(:first-child){border-left:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'.d-inputnumber{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-inputnumber:focus-within{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle))}',
'.d-inputnumber-step{color:var(--d-muted);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-inputnumber-step:hover{color:var(--d-fg);background:var(--d-surface-1)}',
'.d-inputnumber-step:active{background:var(--d-surface-0)}',
'.d-otp-slot{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);color:var(--d-fg)}',
'.d-otp-slot:focus-visible{border-color:var(--d-ring)}',
'.d-otp-separator{color:var(--d-muted)}',
'.d-textarea-wrap{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-textarea-wrap:focus-within{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle))}',
'.d-textarea{color:var(--d-fg);resize:vertical}',
'.d-textarea::placeholder{color:var(--d-muted)}',
'.d-textarea-error{border-color:var(--d-error)}',
'.d-textarea-error:focus-within{border-color:var(--d-error);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-error-subtle))}',
'.d-badge{background:var(--d-primary);color:var(--d-primary-fg);border-radius:var(--d-radius-full)}',
'.d-badge-dot{background:var(--d-primary)}',
'.d-badge-dot.d-badge-processing{animation:d-pulse 2s ease-in-out infinite}',
'.d-tag{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);color:var(--d-fg)}',
'.d-tag-close{color:var(--d-muted)}',
'.d-tag-close:hover{color:var(--d-fg)}',
'.d-chip{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-chip-outline{background:transparent}',
'.d-chip-filled{background:var(--d-primary);color:var(--d-primary-fg);border-color:var(--d-primary)}',
'.d-chip-selected{background:var(--d-primary-subtle);border-color:var(--d-primary);color:var(--d-primary)}',
'.d-chip-interactive:hover{background:var(--d-border);transform:translate(var(--d-hover-translate))}',
'.d-chip-remove{color:var(--d-muted)}',
'.d-chip-remove:hover{color:var(--d-error)}',
'.d-checkbox{color:var(--d-fg)}',
'.d-checkbox-check{border-radius:4px;border:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-bg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-checkbox:has(:checked) .d-checkbox-check{background:var(--d-primary);border-color:var(--d-primary);color:var(--d-primary-fg)}',
'.d-switch-track{background:var(--d-border);border:var(--d-border-width) var(--d-border-style) var(--d-border);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-switch-thumb{background:var(--d-bg);box-shadow:var(--d-elevation-1);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-switch:has(:checked) .d-switch-track{background:var(--d-primary);border-color:var(--d-primary)}',
'.d-radio-indicator{border:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-bg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-radio:has(:checked) .d-radio-indicator{border-color:var(--d-primary)}',
'.d-radio-dot{background:var(--d-primary)}',
'.d-radio-label{color:var(--d-fg)}',
'.d-select-wrap{transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-select{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-select:focus-visible{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle));outline:none}',
'.d-select-open .d-select{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle))}',
'.d-select-dropdown{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-select-option{color:var(--d-fg);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
'.d-select-option:hover,.d-select-option-highlight,.d-combobox-option:hover,.d-combobox-option-highlight,.d-dropdown-item:hover,.d-dropdown-item-highlight,.d-cascader-option:hover,.d-cascader-option-highlight{background:var(--d-surface-1);color:var(--d-fg)}',
'.d-select-option-active,.d-combobox-option-active{background:var(--d-primary);color:var(--d-primary-fg)}',
'.d-select-option-active:hover,.d-combobox-option-active:hover{background:var(--d-primary-hover);color:var(--d-primary-fg)}',
'.d-select-error{border-color:var(--d-error)}',
'.d-select-error:focus-within{border-color:var(--d-error);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-error-subtle))}',
'.d-select-multi-tag{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'.d-combobox-input-wrap{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-combobox-input-wrap:focus-within{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle))}',
'.d-combobox-input{color:var(--d-fg)}',
'.d-combobox-input::placeholder{color:var(--d-muted)}',
'.d-combobox-arrow{color:var(--d-muted)}',
'.d-combobox-listbox{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-combobox-option{color:var(--d-fg);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
'.d-combobox-empty{color:var(--d-muted)}',
'.d-combobox-error .d-combobox-input-wrap{border-color:var(--d-error)}',
'.d-slider-track{background:var(--d-border)}',
'.d-slider-fill{background:var(--d-primary)}',
'.d-slider-thumb{background:var(--d-bg);border:2px solid var(--d-primary);box-shadow:var(--d-elevation-1)}',
'.d-slider-thumb:hover{box-shadow:0 0 0 4px var(--d-primary-subtle)}',
'.d-slider-active .d-slider-thumb{box-shadow:0 0 0 6px var(--d-primary-subtle)}',
'.d-slider-value{color:var(--d-fg)}',
'.d-slider-mark{color:var(--d-muted)}',
'.d-rate-star{color:var(--d-border)}',
'.d-rate-star-filled{color:var(--d-warning)}',
'.d-colorpicker-trigger{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-colorpicker-trigger:focus-within,.d-colorpicker-trigger:focus-visible{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle))}',
'.d-colorpicker-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-datepicker-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2);color:var(--d-fg)}',
'.d-datepicker-day:hover{background:var(--d-surface-1)}',
'.d-datepicker-day-selected{background:var(--d-primary);color:var(--d-primary-fg)}',
'.d-datepicker-nav-btn{color:var(--d-muted)}',
'.d-datepicker-nav-btn:hover{color:var(--d-fg);background:var(--d-surface-1)}',
'.d-datepicker-month:hover,.d-datepicker-year:hover{background:var(--d-surface-1)}',
'.d-datetimepicker-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2);color:var(--d-fg)}',
'.d-timepicker-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-timepicker-cell:hover{background:var(--d-surface-1)}',
'.d-timepicker-cell-selected{background:var(--d-primary);color:var(--d-primary-fg)}',
'.d-upload-dragger{border-color:var(--d-border);background:var(--d-surface-0);color:var(--d-muted)}',
'.d-upload-dragger:hover{border-color:var(--d-primary);color:var(--d-primary)}',
'.d-upload-dragger-active{border-color:var(--d-primary);background:var(--d-primary-subtle)}',
'.d-upload-item{background:var(--d-surface-1)}',
'.d-transfer-panel{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);background:var(--d-bg)}',
'.d-transfer-header{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-surface-1)}',
'.d-transfer-item:hover{background:var(--d-surface-1)}',
'.d-cascader-trigger{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-group-radius, var(--d-radius));border-width:var(--d-group-border, var(--d-border-width));color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-cascader-trigger:focus-within{border-color:var(--d-ring);box-shadow:var(--d-group-shadow, 0 0 0 var(--d-focus-ring-width) var(--d-primary-subtle))}',
'.d-cascader-input::placeholder{color:var(--d-muted)}',
'.d-cascader-dropdown{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-cascader-column{border-right:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'.d-cascader-option:hover{background:var(--d-surface-1)}',
'.d-cascader-option-active{background:var(--d-primary-subtle);color:var(--d-primary)}',
'.d-cascader-option-active:hover{background:var(--d-primary-subtle);color:var(--d-primary)}',
'.d-mentions-dropdown{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-mentions-option:hover{background:var(--d-surface-1)}',
'.d-label{color:var(--d-fg)}',
'.d-modal-panel{background:var(--d-surface-2);backdrop-filter:var(--d-surface-2-filter);border:var(--d-border-width) var(--d-border-style) var(--d-surface-2-border);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-3);color:var(--d-fg);animation:d-scalein var(--d-duration-normal) var(--d-easing-decelerate)}',
'.d-modal-close,.d-drawer-close,.d-sheet-close,.d-notification-close,.d-tour-close{color:var(--d-muted);border-radius:var(--d-radius);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-modal-close:hover,.d-drawer-close:hover,.d-sheet-close:hover,.d-notification-close:hover,.d-tour-close:hover{color:var(--d-fg);background:var(--d-surface-1)}',
'.d-alertdialog-panel{background:var(--d-surface-2);backdrop-filter:var(--d-surface-2-filter);border:var(--d-border-width) var(--d-border-style) var(--d-surface-2-border);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-3);color:var(--d-fg);animation:d-scalein var(--d-duration-normal) var(--d-easing-decelerate)}',
'.d-drawer-panel{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);box-shadow:var(--d-elevation-3);color:var(--d-fg)}',
'.d-drawer-left{animation:d-slidein-l var(--d-duration-normal) var(--d-easing-decelerate)}',
'.d-drawer-right{animation:d-slidein-r var(--d-duration-normal) var(--d-easing-decelerate)}',
'.d-drawer-top{animation:d-slidein-t var(--d-duration-normal) var(--d-easing-decelerate)}',
'.d-drawer-bottom{animation:d-slidein-b var(--d-duration-normal) var(--d-easing-decelerate)}',
'.d-sheet-panel{background:var(--d-surface-1);box-shadow:var(--d-elevation-3);color:var(--d-fg)}',
'.d-sheet-left{animation:d-slidein-l var(--d-duration-normal) var(--d-easing-decelerate)}',
'.d-sheet-right{animation:d-slidein-r var(--d-duration-normal) var(--d-easing-decelerate)}',
'.d-sheet-top{animation:d-slidein-t var(--d-duration-normal) var(--d-easing-decelerate)}',
'.d-sheet-bottom{animation:d-slidein-b var(--d-duration-normal) var(--d-easing-decelerate)}',
'.d-sheet-handle-bar{background:var(--d-border)}',
'.d-tooltip{background:var(--d-fg);color:var(--d-bg);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-popover-content{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2);color:var(--d-fg);animation:d-scalein var(--d-duration-fast) var(--d-easing-decelerate)}',
'.d-hovercard-content{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2);color:var(--d-fg)}',
'.d-dropdown-menu{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-dropdown-item{color:var(--d-fg);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
'.d-dropdown-separator{background:var(--d-border)}',
'.d-contextmenu{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-command-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-3);color:var(--d-fg)}',
'.d-command-input-wrap{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'.d-command-item:hover,.d-command-item-highlight{background:var(--d-surface-1)}',
'.d-popconfirm{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2);color:var(--d-fg)}',
'.d-tabs-list{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'.d-tab{color:var(--d-muted);border-bottom:2px solid transparent;transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-tab:hover{color:var(--d-fg)}',
'.d-tab-active{color:var(--d-primary);border-bottom-color:var(--d-primary)}',
'.d-accordion-item{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);background:var(--d-bg);margin-bottom:var(--d-sp-2)}',
'.d-accordion-trigger{color:var(--d-fg);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
'.d-accordion-trigger:hover{background:var(--d-surface-1)}',
'.d-separator{background:var(--d-border)}',
'.d-separator-line{background:var(--d-border)}',
'.d-separator-vertical{background:var(--d-border)}',
'.d-breadcrumb-link{color:var(--d-muted);transition:color var(--d-duration-fast) var(--d-easing-standard)}',
'.d-breadcrumb-link:hover{color:var(--d-primary)}',
'.d-breadcrumb-separator{color:var(--d-muted)}',
'.d-breadcrumb-current{color:var(--d-fg)}',
'.d-pagination-btn{border-radius:var(--d-radius);color:var(--d-muted);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-pagination-btn:hover{background:var(--d-surface-1);color:var(--d-fg)}',
'.d-pagination-active{background:var(--d-primary);color:var(--d-primary-fg)}',
'.d-pagination-active:hover{background:var(--d-primary-hover);color:var(--d-primary-fg)}',
'.d-pagination-ellipsis{color:var(--d-muted)}',
'.d-table{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-lg);overflow:hidden}',
'.d-th{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-surface-1);color:var(--d-fg)}',
'.d-td{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg)}',
'.d-table-striped tbody .d-tr:nth-child(even){background:var(--d-surface-1)}',
'.d-table-hover .d-tr:hover{background:var(--d-primary-subtle)}',
'.d-table-row-selected{background:var(--d-primary-subtle)}',
'.d-table-sticky{background:var(--d-surface-1)}',
'.d-table-footer{border-top:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'.d-list{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);background:var(--d-bg)}',
'.d-list-item{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'.d-list-item:last-child{border-bottom:none}',
'.d-tree-node-content:hover{background:var(--d-surface-1)}',
'.d-tree-node-selected .d-tree-node-label{color:var(--d-primary)}',
'.d-avatar{border-radius:50%;background:var(--d-primary);border:2px solid var(--d-border)}',
'.d-avatar-fallback{color:var(--d-primary-fg)}',
'.d-progress{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-full);overflow:hidden}',
'.d-progress-bar{background:var(--d-primary);border-radius:var(--d-radius-full)}',
'.d-progress-success .d-progress-bar{background:var(--d-success)}',
'.d-progress-warning .d-progress-bar{background:var(--d-warning)}',
'.d-progress-error .d-progress-bar{background:var(--d-error)}',
'.d-progress-label{color:var(--d-fg)}',
'.d-skeleton{background:var(--d-surface-1);background-image:linear-gradient(90deg,var(--d-surface-1),var(--d-border),var(--d-surface-1));background-size:200% 100%}',
'.d-alert{border-radius:var(--d-radius);border:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-bg);color:var(--d-fg)}',
'.d-alert-info{background:var(--d-info-subtle);border-color:var(--d-info-border)}',
'.d-alert-success{background:var(--d-success-subtle);border-color:var(--d-success-border)}',
'.d-alert-warning{background:var(--d-warning-subtle);border-color:var(--d-warning-border)}',
'.d-alert-error{background:var(--d-error-subtle);border-color:var(--d-error-border)}',
'.d-alert-dismiss{color:var(--d-muted);border-radius:var(--d-radius)}',
'.d-alert-dismiss:hover{color:var(--d-fg);background:var(--d-surface-1)}',
'.d-toast{border-radius:var(--d-radius);background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg);box-shadow:var(--d-elevation-2)}',
'.d-toast-info{border-left:3px solid var(--d-info)}',
'.d-toast-success{border-left:3px solid var(--d-success)}',
'.d-toast-warning{border-left:3px solid var(--d-warning)}',
'.d-toast-error{border-left:3px solid var(--d-error)}',
'.d-toast-close{color:var(--d-muted)}',
'.d-toast-close:hover{color:var(--d-fg)}',
'.d-notification{border-radius:var(--d-radius);background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg);box-shadow:var(--d-elevation-2)}',
'.d-notification-info{border-left:3px solid var(--d-info)}',
'.d-notification-success{border-left:3px solid var(--d-success)}',
'.d-notification-warning{border-left:3px solid var(--d-warning)}',
'.d-notification-error{border-left:3px solid var(--d-error)}',
'.d-message{border-radius:var(--d-radius);background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg);box-shadow:var(--d-elevation-2)}',
'.d-result{color:var(--d-fg)}',
'.d-descriptions-table{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius)}',
'.d-descriptions-label{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);background:var(--d-surface-1)}',
'.d-descriptions-content{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'.d-segmented{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'.d-segmented-item{color:var(--d-muted)}',
'.d-segmented-item:hover{color:var(--d-fg)}',
'.d-segmented-item[aria-checked="true"]{background:var(--d-bg);color:var(--d-fg);box-shadow:var(--d-elevation-1)}',
'.d-step-icon{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-muted)}',
'.d-step-finish .d-step-icon{background:var(--d-primary-subtle);border-color:var(--d-primary);color:var(--d-primary)}',
'.d-step-active .d-step-icon{background:var(--d-primary);border-color:var(--d-primary);color:var(--d-primary-fg)}',
'.d-step-connector{background:var(--d-border)}',
'.d-step-finish~.d-step-connector{background:var(--d-primary)}',
'.d-menu{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-1)}',
'.d-menu-item{color:var(--d-fg);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
'.d-menu-item:hover{background:var(--d-surface-1)}',
'.d-menu-item-active{background:var(--d-primary-subtle);color:var(--d-primary)}',
'.d-menu-separator{background:var(--d-border)}',
'.d-menu-sub{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-menubar{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius)}',
'.d-menubar-item{color:var(--d-fg)}',
'.d-menubar-item:hover,.d-menubar-item-active{background:var(--d-surface-1)}',
'.d-navmenu-item{color:var(--d-fg)}',
'.d-navmenu-item:hover{color:var(--d-primary)}',
'.d-navmenu-item-active{color:var(--d-primary)}',
'.d-navmenu-content{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-calendar{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius)}',
'.d-calendar-cell:hover{background:var(--d-surface-1)}',
'.d-carousel-nav{color:var(--d-fg);background:var(--d-bg);border-radius:var(--d-radius-full);box-shadow:var(--d-elevation-1)}',
'.d-carousel-dot{background:var(--d-border)}',
'.d-carousel-dot-active{background:var(--d-primary)}',
'.d-empty{color:var(--d-muted)}',
'.d-image{border-radius:var(--d-radius)}',
'.d-timeline-dot{background:var(--d-primary)}',
'.d-timeline-line{background:var(--d-border)}',
'.d-kbd{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border);box-shadow:0 1px 0 var(--d-border);color:var(--d-fg)}',
'.d-text{color:var(--d-fg)}',
'.d-text-mark{background:var(--d-warning-subtle)}',
'.d-text-code{background:var(--d-surface-1);border:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'.d-link{color:var(--d-primary)}',
'.d-link:hover{color:var(--d-primary-hover)}',
'.d-blockquote{border-left:3px solid var(--d-border);color:var(--d-muted-fg)}',
'.d-resizable{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius)}',
'.d-resizable-handle{background:var(--d-surface-0)}',
'.d-resizable-handle-bar{background:var(--d-border)}',
'.d-scrollarea-viewport::-webkit-scrollbar-thumb{background:var(--d-border)}',
'.d-tour-popover{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-3);color:var(--d-fg)}',
'.d-float-btn{background:var(--d-primary);color:var(--d-primary-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-float-btn:hover{background:var(--d-primary-hover);box-shadow:var(--d-elevation-3)}',
'.d-option{color:var(--d-fg)}',
'.d-option:hover{background:var(--d-surface-1)}',
'.d-option-active{background:var(--d-surface-1)}',
'.d-daterange-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-datepicker-day-in-range{background:var(--d-primary-subtle)}',
'.d-datepicker-day-range-start,.d-datepicker-day-range-end{background:var(--d-primary);color:var(--d-primary-fg)}',
'.d-daterange-presets button{color:var(--d-muted);transition:color var(--d-duration-fast) var(--d-easing-standard)}',
'.d-daterange-presets button:hover{color:var(--d-primary)}',
'.d-timerange-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-timerange-cell:hover{background:var(--d-surface-1)}',
'.d-timerange-cell-selected{background:var(--d-primary);color:var(--d-primary-fg)}',
'.d-timerange-error{color:var(--d-error)}',
'.d-rangeslider-track{background:var(--d-border)}',
'.d-rangeslider-fill{background:var(--d-primary)}',
'.d-rangeslider-thumb{background:var(--d-bg);border:2px solid var(--d-primary);box-shadow:var(--d-elevation-1)}',
'.d-rangeslider-thumb:hover{box-shadow:0 0 0 4px var(--d-primary-subtle)}',
'.d-rangeslider-thumb:focus-visible{box-shadow:0 0 0 4px var(--d-primary-subtle);outline:none}',
'.d-treeselect-panel{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-treeselect-node:hover{background:var(--d-surface-1)}',
'.d-treeselect-node-selected{color:var(--d-primary)}',
'.d-treeselect-search{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'.d-avatar-group-overflow{background:var(--d-surface-1);border:2px solid var(--d-border);color:var(--d-muted)}',
'.d-navmenu{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius)}',
'.d-navmenu-trigger{color:var(--d-fg);transition:color var(--d-duration-fast) var(--d-easing-standard)}',
'.d-navmenu-trigger:hover,.d-navmenu-trigger-active{color:var(--d-primary)}',
'.d-navmenu-content{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-navmenu-link{color:var(--d-fg);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-navmenu-link:hover{background:var(--d-surface-1);color:var(--d-primary)}',
'.d-navmenu-link-desc{color:var(--d-muted)}',
'.d-splitter{border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius)}',
'.d-splitter-handle{background:var(--d-surface-0);transition:background var(--d-duration-fast) var(--d-easing-standard)}',
'.d-splitter-handle:hover{background:var(--d-surface-1)}',
'.d-splitter-handle-bar{background:var(--d-border)}',
'.d-backtop{background:var(--d-primary);color:var(--d-primary-fg);border-radius:var(--d-radius-full);box-shadow:var(--d-elevation-2);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-backtop:hover{background:var(--d-primary-hover);box-shadow:var(--d-elevation-3)}',
'.d-datatable{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius-lg);overflow:hidden}',
'.d-datatable-th{background:var(--d-surface-1);border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg)}',
'.d-datatable-th-sortable{cursor:pointer;user-select:none;transition:background var(--d-duration-fast) var(--d-easing-standard)}',
'.d-datatable-th-sortable:hover{background:var(--d-surface-0)}',
'.d-datatable-td{border-bottom:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-fg)}',
'.d-datatable-td-editing{background:var(--d-primary-subtle)}',
'.d-datatable-row-selected{background:var(--d-primary-subtle)}',
'.d-datatable-pagination{border-top:var(--d-border-width) var(--d-border-style) var(--d-border);color:var(--d-muted)}',
'.d-datatable-pagination button{color:var(--d-muted);border-radius:var(--d-radius);transition:all var(--d-duration-fast) var(--d-easing-standard)}',
'.d-datatable-pagination button:hover:not([disabled]){background:var(--d-surface-1);color:var(--d-fg)}',
'.d-datatable-empty{color:var(--d-muted)}',
'.d-datatable-filter-popup{background:var(--d-bg);border:var(--d-border-width) var(--d-border-style) var(--d-border);border-radius:var(--d-radius);box-shadow:var(--d-elevation-2)}',
'.d-datatable-resize-handle{background:transparent;transition:background var(--d-duration-fast)}',
'.d-datatable-resize-handle:hover{background:var(--d-primary)}',
'.d-datatable-export-btn{color:var(--d-muted);transition:color var(--d-duration-fast)}',
'.d-datatable-export-btn:hover{color:var(--d-fg)}',
'.d-datatable-checkbox input:checked{accent-color:var(--d-primary)}',
'.d-datatable-pinned-left{background:var(--d-bg)}',
'.d-datatable-pinned-right{background:var(--d-bg)}',
].join('');return{componentCSS}})();const _m20=(function(){const clean={id:'clean',
name:'Clean',
seed:{primary:'#1366D9',
accent:'#7c3aed',
tertiary:'#0891b2',
neutral:'#71717a',
success:'#22c55e',
warning:'#f59e0b',
error:'#ef4444',
info:'#3b82f6',
bg:'#ffffff',
bgDark:'#0a0a0a',},
personality:{radius:'rounded',
elevation:'subtle',
motion:'smooth',
borders:'thin',
density:'comfortable',
gradient:'none',},
overrides:{light:{},
dark:{},},
components:[
'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
'::selection{background:var(--d-selection-bg);color:var(--d-selection-fg)}',
'::-webkit-scrollbar{width:8px;height:8px}',
'::-webkit-scrollbar-track{background:var(--d-surface-0)}',
'::-webkit-scrollbar-thumb{background:var(--d-border);border-radius:var(--d-radius-full)}',
'::-webkit-scrollbar-thumb:hover{background:var(--d-border-strong)}',
].join(''),};return{clean}})();const _m21=(function(){const retro={id:'retro',
name:'Retro',
seed:{primary:'#e63946',
accent:'#457b9d',
tertiary:'#2a9d8f',
neutral:'#6b7280',
success:'#1a7a42',
warning:'#e06600',
error:'#c41e1e',
info:'#2e6b8a',
bg:'#fffef5',
bgDark:'#1a1a1a',},
personality:{radius:'sharp',
elevation:'brutalist',
motion:'snappy',
borders:'bold',
density:'comfortable',
gradient:'none',},
typography:{'--d-fw-heading':'800',
'--d-fw-title':'800',
'--d-fw-medium':'700',
'--d-ls-heading':'0.05em',},
overrides:{light:{},
dark:{'--d-bg':'#1a1a1a',},},
components:[
'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
'::selection{background:var(--d-primary);color:var(--d-primary-fg)}',
'.d-btn{text-transform:uppercase;letter-spacing:0.05em}',
'.d-badge,.d-badge-sup{text-transform:uppercase;letter-spacing:0.05em}',
'.d-chip{text-transform:uppercase;letter-spacing:0.03em}',
'@keyframes d-drop-in{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}',
'::-webkit-scrollbar{width:10px;height:10px}',
'::-webkit-scrollbar-track{background:var(--d-surface-0);border:var(--d-border-width) var(--d-border-style) var(--d-border)}',
'::-webkit-scrollbar-thumb{background:var(--d-fg);border:var(--d-border-width) var(--d-border-style) var(--d-border)}',
].join(''),};return{retro}})();const _m22=(function(){const glassmorphism={id:'glassmorphism',
name:'Glassmorphism',
seed:{primary:'#8b5cf6',
accent:'#ec4899',
tertiary:'#06b6d4',
neutral:'#94a3b8',
success:'#10e07a',
warning:'#f5b800',
error:'#ff2d6a',
info:'#22d3ee',
bg:'#f0f4ff',
bgDark:'#0c0a1a',},
personality:{radius:'pill',
elevation:'glass',
motion:'bouncy',
borders:'thin',
density:'comfortable',
gradient:'vivid',},
typography:{'--d-fw-heading':'700',
'--d-fw-title':'600',
'--d-ls-heading':'-0.02em',},
overrides:{light:{'--d-surface-1':'rgba(255,255,255,0.55)',
'--d-surface-2':'rgba(255,255,255,0.65)',
'--d-surface-3':'rgba(255,255,255,0.75)',
'--d-surface-1-filter':'blur(16px) saturate(1.8)',
'--d-surface-2-filter':'blur(20px) saturate(1.8)',
'--d-surface-3-filter':'blur(24px) saturate(2)',},
dark:{'--d-surface-1':'rgba(30,20,60,0.6)',
'--d-surface-2':'rgba(30,20,60,0.7)',
'--d-surface-3':'rgba(30,20,60,0.8)',
'--d-surface-1-filter':'blur(16px) saturate(1.5)',
'--d-surface-2-filter':'blur(20px) saturate(1.5)',
'--d-surface-3-filter':'blur(24px) saturate(1.8)',},},
components:[
'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
'::selection{background:var(--d-selection-bg);color:var(--d-selection-fg)}',
'.d-card{border:1px solid rgba(255,255,255,0.18);box-shadow:var(--d-elevation-1),inset 0 1px 0 rgba(255,255,255,0.15)}',
'.d-modal-content{border:1px solid rgba(255,255,255,0.2);box-shadow:var(--d-elevation-3),inset 0 1px 0 rgba(255,255,255,0.15)}',
'::-webkit-scrollbar{width:6px;height:6px}',
'::-webkit-scrollbar-track{background:transparent}',
'::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.3);border-radius:var(--d-radius-full)}',
'::-webkit-scrollbar-thumb:hover{background:rgba(139,92,246,0.5)}',
'.d-btn-primary{box-shadow:0 0 20px rgba(139,92,246,0.3)}',
'.d-btn-primary:hover{box-shadow:0 0 30px rgba(139,92,246,0.45)}',
].join(''),};return{glassmorphism}})();const _m23=(function(){const auradecantism={id:'auradecantism',
name:'Auradecantism',
seed:{primary:'#6500C6',
accent:'#0AF3EB',
tertiary:'#FE4474',
neutral:'#8892a4',
success:'#00C388',
warning:'#FDA303',
error:'#D80F4A',
info:'#0AF3EB',
bg:'#f0f4ff',
bgDark:'#060918',},
personality:{radius:'pill',
elevation:'glass',
motion:'bouncy',
borders:'thin',
density:'comfortable',
gradient:'vivid',},
typography:{'--d-fw-heading':'800',
'--d-fw-title':'700',
'--d-ls-heading':'-0.03em',},
overrides:{light:{'--d-surface-1':'rgba(255,255,255,0.6)',
'--d-surface-2':'rgba(255,255,255,0.72)',
'--d-surface-3':'rgba(255,255,255,0.82)',
'--d-surface-1-filter':'blur(16px) saturate(1.6)',
'--d-surface-2-filter':'blur(20px) saturate(1.8)',
'--d-surface-3-filter':'blur(24px) saturate(2)',},
dark:{'--d-surface-1':'rgba(12,15,40,0.55)',
'--d-surface-2':'rgba(12,15,40,0.7)',
'--d-surface-3':'rgba(12,15,40,0.8)',
'--d-surface-1-filter':'blur(16px) saturate(1.6)',
'--d-surface-2-filter':'blur(20px) saturate(1.8)',
'--d-surface-3-filter':'blur(24px) saturate(2)',
'--d-border':'rgba(255,255,255,0.08)',
'--d-border-strong':'rgba(255,255,255,0.15)',
'--d-chart-0':'#6500C6',
'--d-chart-1':'#0AF3EB',
'--d-chart-2':'#FE4474',
'--d-chart-3':'#00C388',
'--d-chart-4':'#FDA303',
'--d-chart-5':'#D80F4A',
'--d-chart-6':'#8B5CF6',
'--d-chart-7':'#38BDF8',},},
components:[
'body{font-family:var(--d-font);background:var(--d-bg);color:var(--d-fg);line-height:var(--d-lh-normal);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}',
'::selection{background:var(--d-selection-bg);color:var(--d-selection-fg)}',
'::-webkit-scrollbar{width:6px;height:6px}',
'::-webkit-scrollbar-track{background:transparent}',
'::-webkit-scrollbar-thumb{background:rgba(101,0,198,0.3);border-radius:var(--d-radius-full)}',
'::-webkit-scrollbar-thumb:hover{background:rgba(101,0,198,0.5)}',
'.d-card{border:1px solid rgba(255,255,255,0.1);box-shadow:var(--d-elevation-1),inset 0 1px 0 rgba(255,255,255,0.06)}',
'.d-modal-content{border:1px solid rgba(255,255,255,0.12);box-shadow:var(--d-elevation-3),inset 0 1px 0 rgba(255,255,255,0.08)}',
'.d-btn-primary{box-shadow:0 0 12px rgba(101,0,198,0.25)}',
'.d-btn-primary:hover{box-shadow:0 0 20px rgba(101,0,198,0.4)}',
'.d-mesh{background:radial-gradient(ellipse at 20% 50%,rgba(101,0,198,0.15) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(10,243,235,0.1) 0%,transparent 50%),radial-gradient(ellipse at 60% 80%,rgba(254,68,116,0.08) 0%,transparent 50%),var(--d-bg)}',
'.d-gradient-text{background:linear-gradient(135deg,var(--d-primary),var(--d-accent),var(--d-tertiary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
'.d-gradient-text-alt{background:linear-gradient(135deg,var(--d-accent),var(--d-primary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
'.d-glass{background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);-webkit-backdrop-filter:var(--d-surface-1-filter);border:1px solid rgba(255,255,255,0.1);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-1),inset 0 1px 0 rgba(255,255,255,0.06)}',
'.d-glass-strong{background:var(--d-surface-2);backdrop-filter:var(--d-surface-2-filter);-webkit-backdrop-filter:var(--d-surface-2-filter);border:1px solid rgba(255,255,255,0.12);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-2),inset 0 1px 0 rgba(255,255,255,0.08)}',
].join(''),};return{auradecantism}})();const _m13=(function(){const{createSignal}=_m14;const{derive,legacyColorMap,densityCSS}=_m18;const{componentCSS}=_m19;const{clean}=_m20;const{retro}=_m21;const{glassmorphism}=_m22;const{auradecantism}=_m23;const styles=new Map();const[_getStyleId,_setStyleId]=createSignal('auradecantism');const[_getMode,_setMode]=createSignal('dark');const[_getResolvedMode,_setResolvedMode]=createSignal('dark');const[_getAnimations,_setAnimations]=createSignal(true);let styleEl=null;let densityEl=null;let animEl=null;let mediaQuery=null;let mediaHandler=null;const modeListeners=new Set();const ANIM_OFF_CSS='*{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}';const builtins=[auradecantism,clean,retro,glassmorphism];for(const s of builtins)styles.set(s.id,s);const LEGACY_THEME_MAP={'light':{style:'clean',mode:'light'},
'dark':{style:'clean',mode:'dark'},
'retro':{style:'retro',mode:'auto'},
'hot-lava':{style:'clean',mode:'dark'},
'stormy-ai':{style:'clean',mode:'dark'},
'ai':{style:'clean',mode:'dark'},
'nature':{style:'clean',mode:'light'},
'pastel':{style:'clean',mode:'light'},
'spice':{style:'clean',mode:'dark'},
'mono':{style:'clean',mode:'dark'},
'lava':{style:'clean',mode:'dark'},};function getStyleElement(){if(!styleEl&&typeof document!=='undefined'){styleEl=document.createElement('style');styleEl.setAttribute('data-decantr-style','');document.head.appendChild(styleEl)}
return styleEl}
function applyTokens(tokens){if(typeof document==='undefined')return;const el=document.documentElement;for(const[key,value]of Object.entries(tokens)){if(el.style.setProperty)el.style.setProperty(key,value); else el.style[key]=value}}
function clearTokens(tokens){if(typeof document==='undefined')return;const el=document.documentElement;for(const key of Object.keys(tokens)){el.style.removeProperty(key)}}
function applyCurrentState(){const styleId=_getStyleId();const style=styles.get(styleId);if(!style)return;const resolvedMode=_getResolvedMode();const modeOverrides=style.overrides?.[resolvedMode]||{};const tokens=derive(
style.seed,
style.personality,
resolvedMode,
style.typography,
modeOverrides,
);applyTokens(tokens);applyTokens(legacyColorMap(tokens));if(!densityEl&&typeof document!=='undefined'){densityEl=document.createElement('style');densityEl.setAttribute('data-decantr-density','');densityEl.textContent=`@layer d.base{${densityCSS()}}`;document.head.appendChild(densityEl)}
const styleCSS=style.components||'';const el=getStyleElement();if(el)el.textContent=`@layer d.theme{${componentCSS}${styleCSS}}`}
function resolveAutoMode(){if(typeof window==='undefined'||typeof window.matchMedia!=='function')return'light';return window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
function updateMediaListener(){if(mediaQuery&&mediaHandler){mediaQuery.removeEventListener('change',mediaHandler);mediaQuery=null;mediaHandler=null}
if(_getMode()==='auto'&&typeof window!=='undefined'&&typeof window.matchMedia==='function'){mediaQuery=window.matchMedia('(prefers-color-scheme: dark)');mediaHandler=()=>{const newMode=resolveAutoMode();const prev=_getResolvedMode();if(newMode!==prev){_setResolvedMode(newMode);applyCurrentState();for(const fn of modeListeners)fn(newMode)}};mediaQuery.addEventListener('change',mediaHandler)}}
function setStyle(id){if(!styles.has(id))throw new Error(`[decantr] Unknown style: "${id}". Available: ${[...styles.keys()].join(', ')}`);_setStyleId(id);applyCurrentState()}
function getStyle(){return _getStyleId}
function getStyleList(){return[...styles.values()].map(s=>({id:s.id,name:s.name}))}
function registerStyle(style){if(!style.id||!style.name)throw new Error('[decantr] Style must have id and name');if(!style.seed)throw new Error('[decantr] Style must have seed colors');if(!style.personality)style.personality={};if(!style.overrides)style.overrides={};styles.set(style.id,style)}
function setMode(mode){if(mode!=='light'&&mode!=='dark'&&mode!=='auto'){throw new Error(`[decantr] Invalid mode: "${mode}". Use 'light', 'dark', or 'auto'.`)}
_setMode(mode);const resolved=mode==='auto'?resolveAutoMode():mode;const prev=_getResolvedMode();_setResolvedMode(resolved);updateMediaListener();applyCurrentState();if(resolved!==prev){for(const fn of modeListeners)fn(resolved)}}
function getMode(){return _getMode}
function getResolvedMode(){return _getResolvedMode()}
function onModeChange(fn){modeListeners.add(fn);return()=>modeListeners.delete(fn)}
function setTheme(id,mode){const legacy=LEGACY_THEME_MAP[id];if(legacy&&!styles.has(id)){const targetStyle=legacy.style;const targetMode=mode||legacy.mode;if(_getStyleId()!==targetStyle)_setStyleId(targetStyle);setMode(targetMode);return}
if(styles.has(id)){_setStyleId(id);setMode(mode||'auto')}else{throw new Error(`[decantr] Unknown theme/style: "${id}". Available: ${[...styles.keys()].join(', ')}`)}}
function getTheme(){return _getStyleId}
function getThemeMeta(){return{isDark:_getResolvedMode()==='dark',
style:_getStyleId(),
mode:_getMode(),
resolvedMode:_getResolvedMode(),}}
function getThemeList(){return getStyleList()}
function registerTheme(theme){if(theme.seed){registerStyle(theme);return}
console.warn(`[decantr] registerTheme() with old format is deprecated. Use registerStyle() with seed + personality.`);registerStyle({id:theme.id,
name:theme.name||theme.id,
seed:{},
personality:{},
components:theme.global||'',})}
function setAnimations(enabled){_setAnimations(!!enabled);if(typeof document==='undefined')return;if(!enabled){if(!animEl){animEl=document.createElement('style');animEl.setAttribute('data-decantr-anim','');document.head.appendChild(animEl)}
animEl.textContent=ANIM_OFF_CSS}else if(animEl){animEl.textContent=''}}
function getAnimations(){return _getAnimations}
function getActiveCSS(){const style=styles.get(_getStyleId());return style?`@layer d.theme{${componentCSS}${style.components || ''}}`:''}
function resetStyles(){if(styleEl&&styleEl.parentNode)styleEl.parentNode.removeChild(styleEl);styleEl=null;if(densityEl&&densityEl.parentNode)densityEl.parentNode.removeChild(densityEl);densityEl=null;if(animEl&&animEl.parentNode)animEl.parentNode.removeChild(animEl);animEl=null;if(mediaQuery&&mediaHandler){mediaQuery.removeEventListener('change',mediaHandler);mediaQuery=null;mediaHandler=null}
modeListeners.clear();_setStyleId('auradecantism');_setMode('dark');_setResolvedMode('dark');_setAnimations(true)}
return{setStyle,getStyle,getStyleList,registerStyle,setMode,getMode,getResolvedMode,onModeChange,setTheme,getTheme,getThemeMeta,getThemeList,registerTheme,setAnimations,getAnimations,getActiveCSS,resetStyles}})();const _m1=(function(){const{atomMap}=_m11;const{inject,injectResponsive,injectContainer}=_m12;const{extractCSS,reset,BREAKPOINTS,CQ_WIDTHS}=_m12;const{setTheme,getTheme,getThemeMeta,registerTheme,getThemeList,getActiveCSS,resetStyles,setAnimations,getAnimations,setStyle,getStyle,getStyleList,registerStyle,setMode,getMode,getResolvedMode,onModeChange}=_m13;const customAtoms=new Map();const BP_RE=/^_(sm|md|lg|xl):(.+)$/;const CQ_RE=/^_cq(\d+):(.+)$/;const CQ_SET=new Set(CQ_WIDTHS);function css(...classes){const result=[];for(let i=0;i<classes.length;i++){const cls=classes[i];if(!cls)continue;const parts=cls.split(/\s+/);for(const part of parts){if(!part)continue;const bpMatch=part.match(BP_RE);if(bpMatch){const[,bp,atomName]=bpMatch;const decl=atomMap.get(`_${atomName}`)||customAtoms.get(`_${atomName}`);if(decl){injectResponsive(part,decl,bp);result.push(part)}else{result.push(part)}
continue}
const cqMatch=part.match(CQ_RE);if(cqMatch){const width=Number(cqMatch[1]);const atomName=cqMatch[2];if(CQ_SET.has(width)){const decl=atomMap.get(`_${atomName}`)||customAtoms.get(`_${atomName}`);if(decl){injectContainer(part,decl,width);result.push(part)}else{result.push(part)}}else{result.push(part)}
continue}
const decl=atomMap.get(part)||customAtoms.get(part);if(decl){inject(part,decl);result.push(part)}else{result.push(part)}}}
return result.join(' ')}
function sanitize(str){if(typeof str!=='string')return'';return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')}
return{css,extractCSS,reset,BREAKPOINTS,CQ_WIDTHS,setTheme,getTheme,getThemeMeta,registerTheme,getThemeList,getActiveCSS,resetStyles,setAnimations,getAnimations,setStyle,getStyle,getStyleList,registerStyle,setMode,getMode,getResolvedMode,onModeChange}})();const _m15=(function(){let mountQueue=[];let destroyQueue=[];let scopeStack=[];function onMount(fn){mountQueue.push(fn)}
function onDestroy(fn){if(scopeStack.length>0){scopeStack[scopeStack.length-1].push(fn)}else{destroyQueue.push(fn)}}
function drainMountQueue(){const fns=mountQueue;mountQueue=[];return fns}
function drainDestroyQueue(){const fns=destroyQueue;destroyQueue=[];return fns}
function pushScope(){scopeStack.push([])}
function popScope(){return scopeStack.pop()||[]}
function runDestroyFns(fns){for(let i=0;i<fns.length;i++){try{fns[i]()}catch(_){}}}
return{onMount,onDestroy,drainMountQueue,drainDestroyQueue,pushScope,popScope,runDestroyFns}})();const _m2=(function(){const{createEffect,_pendingResources}=_m14;const{onMount,onDestroy}=_m15;const{drainMountQueue,drainDestroyQueue,pushScope,popScope,runDestroyFns}=_m15;function h(tag,props,...children){const el=document.createElement(tag);if(props){for(const key in props){const val=props[key];if(key.startsWith('on')&&typeof val==='function'){el.addEventListener(key.slice(2).toLowerCase(),val)}else if(typeof val==='function'&&key!=='ref'){createEffect(()=>{const v=val();if(key==='class'||key==='className'){el.className=v}else if(key==='style'&&typeof v==='object'){Object.assign(el.style,v)}else{el.setAttribute(key,v)}})}else if(key==='ref'&&typeof val==='function'){val(el)}else if(key==='class'||key==='className'){el.className=val}else if(key==='style'&&typeof val==='object'){Object.assign(el.style,val)}else if(val!==false&&val!=null){el.setAttribute(key,val===true?'':String(val))}}}
appendChildren(el,children);return el}
function text(getter){const node=document.createTextNode('');createEffect(()=>{node.nodeValue=String(getter())});return node}
function cond(condition,thenFn,elseFn){const container=document.createElement('d-cond');let currentNode=null;createEffect(()=>{const result=condition();if(currentNode){container.removeChild(currentNode);currentNode=null}
const fn=result?thenFn:elseFn;if(fn){currentNode=fn();if(currentNode)container.appendChild(currentNode)}});return container}
function list(itemsGetter,keyFn,renderFn){const container=document.createElement('d-list');let currentMap=new Map();createEffect(()=>{const items=itemsGetter();const newMap=new Map();const newNodes=[];for(let i=0;i<items.length;i++){const item=items[i];const key=keyFn(item,i);const existing=currentMap.get(key);if(existing){newMap.set(key,existing);newNodes.push(existing.node)}else{const node=renderFn(item,i);newMap.set(key,{node});newNodes.push(node)}}
for(const[key,entry]of currentMap){if(!newMap.has(key)&&entry.node.parentNode===container){container.removeChild(entry.node)}}
for(let i=0;i<newNodes.length;i++){const node=newNodes[i];const current=container.childNodes[i];if(node!==current){container.insertBefore(node,current||null)}}
currentMap=newMap});return container}
function mount(root,component){pushScope();const result=component();const destroyFns=popScope();if(result)root.appendChild(result);const fns=drainMountQueue();for(const fn of fns){const cleanup=fn();if(typeof cleanup==='function'){destroyFns.push(cleanup)}}
root.__d_destroy=destroyFns}
function unmount(root){if(root.__d_destroy){runDestroyFns(root.__d_destroy);root.__d_destroy=null} while(root.firstChild)root.removeChild(root.firstChild)}
let _boundaryHandler=null;function ErrorBoundary(props,...children){const container=document.createElement('d-boundary');let caught=null;function clear(){while(container.firstChild)container.removeChild(container.firstChild)}
function showFallback(err){caught=err;clear();const fb=props.fallback(err,retry);if(fb)container.appendChild(fb)}
function retry(){caught=null;clear();renderChildren()}
function renderChildren(){const prev=_boundaryHandler;_boundaryHandler=showFallback;try{appendChildren(container,children)}catch(err){showFallback(err)}finally{_boundaryHandler=prev}}
renderChildren();return container}
const _origCreateEffect=createEffect;function boundaryAwareEffect(fn){const handler=_boundaryHandler;return _origCreateEffect(()=>{try{return fn()}catch(err){if(handler)handler(err); else throw err}})}
const _createEffect=boundaryAwareEffect;function Portal(props,...children){const placeholder=document.createComment('d-portal');const target=resolveTarget(props.target);const nodes=[];for(let i=0;i<children.length;i++){const child=children[i];if(child==null||child===false)continue;if(child&&typeof child==='object'&&child.nodeType){target.appendChild(child);nodes.push(child)}else if(typeof child==='string'||typeof child==='number'){const tn=document.createTextNode(String(child));target.appendChild(tn);nodes.push(tn)}}
placeholder.__d_portal_cleanup=function(){for(let i=0;i<nodes.length;i++){if(nodes[i].parentNode===target)target.removeChild(nodes[i])}};return placeholder}
function resolveTarget(target){if(!target)return document.body;if(typeof target==='string'){const el=document.querySelector(target);if(!el)throw new Error(`Portal target "${target}" not found`);return el}
return target}
function Suspense(props,...children){const container=document.createElement('d-suspense');const childNodes=[];let fallbackNode=null;let showing='children';const frag=document.createDocumentFragment();appendChildren(frag,children); while(frag.firstChild){childNodes.push(frag.firstChild);frag.removeChild(frag.firstChild)}
function showChildren(){if(showing==='children')return;showing='children'; while(container.firstChild)container.removeChild(container.firstChild);for(let i=0;i<childNodes.length;i++)container.appendChild(childNodes[i]);fallbackNode=null}
function showFallback(){if(showing==='fallback')return;showing='fallback'; while(container.firstChild)container.removeChild(container.firstChild);fallbackNode=props.fallback();if(fallbackNode)container.appendChild(fallbackNode)}
createEffect(()=>{if(_pendingResources.size>0){showFallback();const iv=setInterval(()=>{if(_pendingResources.size===0){clearInterval(iv);showChildren()}},16)}else{showChildren()}});if(_pendingResources.size===0){for(let i=0;i<childNodes.length;i++)container.appendChild(childNodes[i]);showing='children'}
return container}
function Transition(props,child){const container=document.createElement('d-transition');const duration=props.duration!=null?props.duration:200;let currentNode=null;let exitTimer=null;createEffect(()=>{const next=child();if(currentNode&&currentNode!==next){const leaving=currentNode;currentNode=null;if(props.exit){leaving.classList.add(props.exit);if(exitTimer)clearTimeout(exitTimer);exitTimer=setTimeout(()=>{if(leaving.parentNode===container)container.removeChild(leaving);exitTimer=null},duration)}else{if(leaving.parentNode===container)container.removeChild(leaving)}}
if(next&&next!==currentNode){currentNode=next;container.appendChild(next);if(props.enter){next.classList.add(props.enter);const entering=next;requestAnimationFrame(()=>{requestAnimationFrame(()=>{if(entering.parentNode===container)entering.classList.remove(props.enter)})})}}});return container}
function forwardRef(component){return function(props,...children){const ref=props&&props.ref;let cleaned=props;if(ref!==undefined){cleaned={};for(const k in props){if(k!=='ref')cleaned[k]=props[k]}}
return component(cleaned,ref,...children)}}
function appendChildren(el,children){for(let i=0;i<children.length;i++){const child=children[i];if(child==null||child===false)continue;if(Array.isArray(child)){appendChildren(el,child)}else if(child&&typeof child==='object'&&child.nodeType){el.appendChild(child)}else if(typeof child==='function'){const textNode=document.createTextNode('');createEffect(()=>{textNode.nodeValue=String(child())});el.appendChild(textNode)}else{el.appendChild(document.createTextNode(String(child)))}}}
return{h,text,cond,list,mount,unmount,ErrorBoundary,Portal,Suspense,Transition,forwardRef,onMount,onDestroy}})();const _m3=(function(){const{h}=_m2;const tags=new Proxy({},{get(_,tag){return(first,...rest)=>{if(first&&typeof first==='object'&&!first.nodeType
&&!Array.isArray(first)&&typeof first!=='function'){return h(tag,first,...rest)}
return h(tag,null,...(first!=null?[first,...rest]:rest))}}});return{tags}})();const _m4=(function(){const docsSiteCSS=[
'@keyframes ds-fade-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}',
'@keyframes ds-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}',
'@keyframes ds-pulse{0%,100%{opacity:0.3}50%{opacity:0.7}}',
'@keyframes ds-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}',
'@keyframes ds-glow{0%,100%{box-shadow:0 0 12px rgba(101,0,198,0.2),0 0 30px rgba(101,0,198,0.06)}50%{box-shadow:0 0 20px rgba(10,243,235,0.25),0 0 40px rgba(10,243,235,0.08)}}',
'@keyframes ds-rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
'@keyframes ds-scale-in{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}',
'.ds-animate{animation:ds-fade-up 0.7s var(--d-easing-decelerate) both}',
'.ds-hidden{opacity:0;transform:translateY(30px)}',
'.ds-visible .ds-animate{animation:ds-fade-up 0.7s var(--d-easing-decelerate) both}',
'.ds-delay-1{animation-delay:100ms}',
'.ds-delay-2{animation-delay:200ms}',
'.ds-delay-3{animation-delay:300ms}',
'.ds-delay-4{animation-delay:400ms}',
'.ds-delay-5{animation-delay:500ms}',
'.ds-delay-6{animation-delay:600ms}',
'.ds-delay-7{animation-delay:700ms}',
'.ds-delay-8{animation-delay:800ms}',
'.ds-delay-9{animation-delay:900ms}',
'.ds-float{animation:ds-float 4s var(--d-easing-standard) infinite}',
'.ds-glow{animation:ds-glow 3s var(--d-easing-standard) infinite}',
'.ds-pulse{animation:ds-pulse 3s var(--d-easing-standard) infinite}',
'.ds-gradient-text{background:linear-gradient(135deg,var(--d-primary),var(--d-accent),var(--d-tertiary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
'.ds-gradient-text-alt{background:linear-gradient(135deg,var(--d-accent),var(--d-primary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
'.ds-mesh{background:radial-gradient(ellipse at 20% 50%,rgba(101,0,198,0.15) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(10,243,235,0.1) 0%,transparent 50%),radial-gradient(ellipse at 60% 80%,rgba(254,68,116,0.08) 0%,transparent 50%),var(--d-bg)}',
'.ds-glass{background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);-webkit-backdrop-filter:var(--d-surface-1-filter);border:1px solid rgba(255,255,255,0.1);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-1),inset 0 1px 0 rgba(255,255,255,0.06)}',
'.ds-glass-strong{background:var(--d-surface-2);backdrop-filter:var(--d-surface-2-filter);-webkit-backdrop-filter:var(--d-surface-2-filter);border:1px solid rgba(255,255,255,0.12);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-2),inset 0 1px 0 rgba(255,255,255,0.08)}',
'.ds-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}',
'.ds-stat{font-size:3rem;font-weight:800;line-height:1;letter-spacing:-0.04em}',
'.ds-section{padding:var(--d-sp-16) var(--d-sp-8);position:relative;overflow:hidden}',
'@media(max-width:768px){.ds-section{padding:var(--d-sp-12) var(--d-sp-4)}.ds-stat{font-size:2rem}}',
'.ds-pink{color:#FE4474}',
'.ds-cyan{color:#0AF3EB}',
'.ds-purple{color:#6500C6}',
'.d-chart-axis text{fill:rgba(255,255,255,0.7)!important;font-size:0.75rem!important}',
'.d-chart-axis-label{fill:rgba(255,255,255,0.7)!important}',
'.d-chart text{fill:rgba(255,255,255,0.85);font-family:var(--d-font)}',
'.d-chart-legend{color:rgba(255,255,255,0.8)}',
'.d-chart-label{fill:rgba(255,255,255,0.9)!important;font-weight:600!important;font-size:0.7rem!important}',
'.d-chart{background:transparent!important;border:none!important;box-shadow:none!important}',
'.d-chart-inner{background:transparent!important}',
'.d-chart-grid line{stroke:rgba(255,255,255,0.06)!important}',
'.d-chart-tooltip{background:rgba(12,15,40,0.9)!important;border:1px solid rgba(255,255,255,0.15)!important;color:rgba(255,255,255,0.9)!important;backdrop-filter:blur(12px)}',
'.d-chart-spark{background:transparent!important}',
'@media(max-width:640px){.ds-footer-links{flex-direction:column;gap:0.5rem;align-items:center}}',
].join('');return{docsSiteCSS}})();const _m147=(function(){const{createEffect}=_m14;let injected=false;const BASE_CSS=[
'.d-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}',
'.d-i{display:inline-block;vertical-align:middle;background:currentColor;mask-size:contain;-webkit-mask-size:contain;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;mask-position:center;-webkit-mask-position:center;flex-shrink:0}',
'@keyframes d-spin{to{transform:rotate(360deg)}}',
'@keyframes d-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
'@keyframes d-fadein{from{opacity:0}to{opacity:1}}',
'@keyframes d-fadeout{from{opacity:1}to{opacity:0}}',
'@keyframes d-slidein-b{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
'@keyframes d-slidein-t{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}',
'@keyframes d-slidein-l{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}',
'@keyframes d-slidein-r{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}',
'@keyframes d-scalein{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}',
'@keyframes d-pulse{0%,100%{opacity:1}50%{opacity:0.5}}',
'@keyframes d-bounce{0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1)}50%{transform:translateY(0);animation-timing-function:cubic-bezier(0,0,0.2,1)}}',
'.d-btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--d-density-gap,var(--d-sp-2));font-family:inherit;font-size:var(--d-density-text,var(--d-text-base));font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-none);padding:var(--d-density-pad-y,var(--d-sp-2)) var(--d-density-pad-x,var(--d-sp-4));min-height:var(--d-density-min-h,auto);cursor:pointer;user-select:none;white-space:nowrap;outline:none;text-decoration:none;border:none;background:none}',
'.d-btn:focus-visible{outline:2px solid var(--d-ring);outline-offset:2px}',
'.d-btn[disabled]{cursor:not-allowed;pointer-events:none;opacity:0.5}',
'.d-btn-sm{font-size:var(--d-text-sm);padding:var(--d-sp-1-5) var(--d-sp-3)}',
'.d-btn-lg{font-size:var(--d-text-md);padding:var(--d-sp-2-5) var(--d-sp-6)}',
'.d-btn-xs{font-size:0.6875rem;padding:var(--d-sp-1) var(--d-sp-2);gap:var(--d-sp-1)}',
'.d-btn-icon{padding:var(--d-sp-2);aspect-ratio:1}',
'.d-btn-icon-xs{padding:var(--d-sp-1);aspect-ratio:1;font-size:0.6875rem}',
'.d-btn-icon-sm{padding:var(--d-sp-1-5);aspect-ratio:1;font-size:var(--d-text-sm)}',
'.d-btn-icon-lg{padding:var(--d-sp-2-5);aspect-ratio:1;font-size:var(--d-text-md)}',
'.d-btn-block{display:flex;width:100%}',
'.d-btn-rounded{border-radius:9999px}',
'.d-btn-group{display:inline-flex;gap:var(--d-density-gap,0)}',
'.d-btn-group>.d-btn{border-radius:0}',
'.d-btn-group>.d-btn:first-child{border-top-left-radius:var(--d-radius);border-bottom-left-radius:var(--d-radius)}',
'.d-btn-group>.d-btn:last-child{border-top-right-radius:var(--d-radius);border-bottom-right-radius:var(--d-radius)}',
'.d-btn-group>.d-btn:not(:first-child){margin-left:-1px}',
'.d-btn-loading{position:relative;cursor:wait;color:transparent !important}',
'.d-btn-loading>*:not(.d-btn-spinner){visibility:hidden}',
'.d-btn-spinner{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}',
'.d-toggle{display:inline-flex;align-items:center;justify-content:center;gap:var(--d-density-gap,var(--d-sp-2));padding:var(--d-density-pad-y,var(--d-sp-2)) var(--d-density-pad-x,var(--d-sp-3));font:inherit;font-size:var(--d-density-text,var(--d-text-base));min-height:var(--d-density-min-h,auto);cursor:pointer;border:none;background:none;outline:none}',
'.d-toggle:focus-visible{outline:2px solid var(--d-ring);outline-offset:2px}',
'.d-toggle[disabled]{cursor:not-allowed;opacity:0.5}',
'.d-toggle[aria-pressed="true"]{font-weight:var(--d-fw-medium,500)}',
'.d-toggle-sm{font-size:var(--d-text-sm);padding:var(--d-sp-1-5) var(--d-sp-2)}',
'.d-toggle-lg{font-size:var(--d-text-md);padding:var(--d-sp-2-5) var(--d-sp-4)}',
'.d-toggle-group{display:inline-flex;position:relative;padding:2px;gap:var(--d-density-gap,2px);border-radius:var(--d-radius);overflow:hidden}',
'.d-toggle-group>.d-toggle{position:relative;z-index:1;border-radius:calc(var(--d-radius) - 2px)}',
'.d-toggle-indicator{position:absolute;top:2px;bottom:2px;border-radius:calc(var(--d-radius) - 2px);transition:transform var(--d-duration-fast,150ms) var(--d-easing-standard,ease),width var(--d-duration-fast,150ms) var(--d-easing-standard,ease);pointer-events:none;z-index:0}',
'.d-caret{transition:transform var(--d-duration-fast,150ms) var(--d-easing-standard,ease);flex-shrink:0;display:inline-flex;align-items:center}',
'.d-caret-open{transform:rotate(180deg)}',
'.d-caret-open-90{transform:rotate(90deg)}',
'.d-select-open .d-caret,.d-combobox-open .d-caret,.d-cascader-open > .d-cascader-trigger .d-caret,.d-treeselect-open > .d-treeselect-trigger .d-caret{transform:rotate(180deg)}',
'.d-spinner{display:inline-block}',
'.d-spinner-xs{width:12px;height:12px}',
'.d-spinner-sm{width:16px;height:16px}',
'.d-spinner-lg{width:28px;height:28px}',
'.d-spinner-xl{width:36px;height:36px}',
'.d-spinner-arc{animation:d-spin 0.85s linear infinite;transform-origin:center;transform-box:fill-box}',
'.d-spinner-wrap{display:inline-flex;align-items:center;justify-content:center}',
'@keyframes d-dots{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}',
'@keyframes d-bars{0%,100%{transform:scaleY(0.4)}20%{transform:scaleY(1)}}',
'@keyframes d-orbit{0%{transform:rotate(0deg) translateX(150%) rotate(0deg)}100%{transform:rotate(360deg) translateX(150%) rotate(-360deg)}}',
'.d-spinner-dots{display:inline-flex;align-items:center;gap:3px}',
'.d-spinner-dots>span{width:25%;aspect-ratio:1;border-radius:50%;background:currentColor;animation:d-dots 1.4s ease-in-out infinite}',
'.d-spinner-dots>span:nth-child(2){animation-delay:0.16s}',
'.d-spinner-dots>span:nth-child(3){animation-delay:0.32s}',
'.d-spinner-pulse{display:inline-flex;align-items:center;justify-content:center}',
'.d-spinner-pulse>span{width:100%;height:100%;border-radius:50%;background:currentColor;animation:d-pulse 1.5s ease-in-out infinite}',
'.d-spinner-bars{display:inline-flex;align-items:center;justify-content:center;gap:2px}',
'.d-spinner-bars>span{width:3px;height:60%;background:currentColor;border-radius:1px;animation:d-bars 1.2s ease-in-out infinite}',
'.d-spinner-bars>span:nth-child(2){animation-delay:0.1s}',
'.d-spinner-bars>span:nth-child(3){animation-delay:0.2s}',
'.d-spinner-bars>span:nth-child(4){animation-delay:0.3s}',
'.d-spinner-orbit{display:inline-flex;align-items:center;justify-content:center;position:relative}',
'.d-spinner-orbit>span{position:absolute;width:20%;aspect-ratio:1;border-radius:50%;background:currentColor;animation:d-orbit 1.5s linear infinite}',
'.d-spinner-orbit>span:nth-child(2){animation-delay:-0.75s}',
'.d-spinner-hybrid{position:relative;display:inline-flex;align-items:center;justify-content:center}',
'.d-spinner-hybrid>svg{position:absolute;inset:0}',
'.d-spinner-hybrid>.d-i{position:relative;z-index:1}',
'.d-input-wrap{display:flex;align-items:center}',
'.d-input{background:transparent;border:none;outline:none;width:100%;font:inherit;font-size:var(--d-density-text,inherit);padding:var(--d-density-pad-y,var(--d-sp-2)) var(--d-density-pad-x,var(--d-sp-3));min-height:var(--d-density-min-h,auto)}',
'.d-input-prefix,.d-input-suffix{display:flex;align-items:center;padding:0 var(--d-sp-2);color:var(--d-muted);flex-shrink:0}',
'.d-input[disabled]{cursor:not-allowed;opacity:0.5}',
'.d-input-sm{padding:var(--d-sp-1-5) var(--d-sp-2);font-size:var(--d-text-sm)}',
'.d-input-lg{padding:var(--d-sp-2-5) var(--d-sp-4);font-size:var(--d-text-md)}',
'.d-input-group{display:flex;align-items:stretch}',
'.d-input-group-vertical{flex-direction:column}',
'.d-input-group>.d-input-wrap,.d-input-group>.d-select-wrap,.d-input-group>.d-combobox-input-wrap,.d-input-group>.d-inputnumber,.d-input-group>.d-textarea-wrap,.d-input-group>.d-cascader-trigger{flex:1;min-width:0}',
'.d-input-group-addon{display:flex;align-items:center;padding:0 var(--d-sp-3);font-size:var(--d-text-sm);white-space:nowrap;flex-shrink:0}',
'.d-input-group>*{--d-group-border:0;--d-group-shadow:none;--d-group-radius:0}',
'.d-input-group>:first-child{--d-group-radius:var(--d-radius) 0 0 var(--d-radius)}',
'.d-input-group>:last-child{--d-group-radius:0 var(--d-radius) var(--d-radius) 0}',
'.d-input-group>:only-child{--d-group-radius:var(--d-radius)}',
'.d-input-group-vertical>*{--d-group-radius:0}',
'.d-input-group-vertical>:first-child{--d-group-radius:var(--d-radius) var(--d-radius) 0 0}',
'.d-input-group-vertical>:last-child{--d-group-radius:0 0 var(--d-radius) var(--d-radius)}',
'.d-input-group-vertical>:only-child{--d-group-radius:var(--d-radius)}',
'.d-input-group[data-disabled]>*{opacity:0.5;pointer-events:none}',
'.d-input-group-sm .d-input-group-addon{padding:0 var(--d-sp-2);font-size:var(--d-text-xs)}',
'.d-input-group-lg .d-input-group-addon{padding:0 var(--d-sp-4);font-size:var(--d-text-base)}',
'.d-compact-group{display:inline-flex;align-items:stretch}',
'.d-compact-group>.d-input-wrap,.d-compact-group>.d-select-wrap,.d-compact-group>.d-combobox-input-wrap,.d-compact-group>.d-inputnumber{flex:1;min-width:0}',
'.d-compact-group>*{--d-group-border:0;--d-group-shadow:none;--d-group-radius:0}',
'.d-compact-group>:first-child{--d-group-radius:var(--d-radius) 0 0 var(--d-radius)}',
'.d-compact-group>:last-child{--d-group-radius:0 var(--d-radius) var(--d-radius) 0}',
'.d-compact-group>:only-child{--d-group-radius:var(--d-radius)}',
'.d-inputnumber{display:inline-flex;align-items:center}',
'.d-inputnumber-input{background:transparent;border:none;outline:none;width:100%;font:inherit;padding:var(--d-sp-2) var(--d-sp-3);text-align:center;-moz-appearance:textfield}',
'.d-inputnumber-input::-webkit-inner-spin-button,.d-inputnumber-input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}',
'.d-inputnumber-step{display:flex;align-items:center;justify-content:center;cursor:pointer;width:var(--d-stepper-w);flex-shrink:0;font-size:var(--d-text-sm);user-select:none;border:none;background:none;padding:0}',
'.d-inputnumber-step:first-child{border-right:var(--d-border-width,1px) var(--d-border-style,solid) var(--d-border);border-radius:var(--d-group-radius,var(--d-radius)) 0 0 var(--d-group-radius,var(--d-radius))}',
'.d-inputnumber-step:last-child{border-left:var(--d-border-width,1px) var(--d-border-style,solid) var(--d-border);border-radius:0 var(--d-group-radius,var(--d-radius)) var(--d-group-radius,var(--d-radius)) 0}',
'.d-inputnumber-step[disabled]{cursor:not-allowed;opacity:0.3}',
'.d-otp{display:inline-flex;gap:var(--d-sp-2)}',
'.d-otp-slot{width:2.5rem;height:2.75rem;text-align:center;font:inherit;font-size:var(--d-text-lg);font-weight:var(--d-fw-medium,500);padding:0;outline:none}',
'.d-otp-slot:focus-visible{outline:2px solid var(--d-ring);outline-offset:2px}',
'.d-otp-separator{display:flex;align-items:center;padding:0 var(--d-sp-1);font-size:var(--d-text-lg)}',
'.d-textarea-wrap{display:flex}',
'.d-textarea{background:transparent;border:none;outline:none;width:100%;font:inherit;padding:var(--d-sp-2) var(--d-sp-3);min-height:4rem}',
'.d-textarea[disabled]{cursor:not-allowed;opacity:0.5}',
'.d-card{display:flex;flex-direction:column;overflow:hidden}',
'.d-card-header{padding:var(--d-compound-pad) var(--d-compound-pad) 0;font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
'.d-card-body{padding:var(--d-compound-gap) var(--d-compound-pad)}',
'.d-card-body:first-child{padding-top:var(--d-compound-pad)}',
'.d-card-body:last-child{padding-bottom:var(--d-compound-pad)}',
'.d-card-footer{padding:var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)}',
'.d-card-cover{overflow:hidden}',
'.d-card-cover>img{width:100%;display:block}',
'.d-card-meta{display:flex;align-items:center;gap:var(--d-sp-3)}',
'.d-badge{display:inline-flex;align-items:center;gap:var(--d-sp-1);font-size:var(--d-text-sm);padding:var(--d-sp-1) var(--d-sp-2);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-none);vertical-align:middle}',
'.d-badge-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}',
'.d-badge-wrapper{position:relative;display:inline-flex}',
'.d-badge-sup{position:absolute;top:-4px;right:-4px;z-index:1}',
'.d-tag{display:inline-flex;align-items:center;gap:var(--d-sp-1);font-size:var(--d-text-sm);padding:var(--d-sp-1) var(--d-sp-2);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-none);white-space:nowrap;vertical-align:middle}',
'.d-tag-close{display:inline-flex;align-items:center;cursor:pointer;background:none;border:none;padding:0;font-size:0.875em;line-height:1;opacity:0.6}',
'.d-tag-close:hover{opacity:1}',
'.d-tag-checkable{cursor:pointer}',
'.d-chip{display:inline-flex;align-items:center;gap:var(--d-sp-1-5);border-radius:9999px;padding:var(--d-sp-1) var(--d-sp-3);font-size:0.8125rem;font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-normal);cursor:default;white-space:nowrap;vertical-align:middle}',
'.d-chip-sm{padding:0.125rem var(--d-sp-2);font-size:var(--d-text-sm);gap:var(--d-sp-1)}',
'.d-chip-icon{flex-shrink:0;width:1em;height:1em}',
'.d-chip-label{overflow:hidden;text-overflow:ellipsis}',
'.d-chip-remove{display:inline-flex;align-items:center;justify-content:center;background:transparent;border:none;cursor:pointer;font-size:1em;line-height:var(--d-lh-none);padding:0;margin-left:0.125rem;opacity:0.6}',
'.d-chip-remove:hover{opacity:1}',
'.d-chip-interactive{cursor:pointer}',
'.d-checkbox{display:inline-flex;align-items:center;gap:var(--d-sp-2);cursor:pointer;user-select:none}',
'.d-checkbox-native{position:absolute;opacity:0;width:0;height:0;pointer-events:none}',
'.d-checkbox-check{display:flex;align-items:center;justify-content:center;width:18px;height:18px;flex-shrink:0}',
'.d-checkbox-label{font-size:var(--d-text-base)}',
'.d-checkbox-native:disabled~.d-checkbox-check{opacity:0.5;cursor:not-allowed}',
'.d-checkbox-native:disabled~.d-checkbox-label{opacity:0.5;cursor:not-allowed}',
'.d-checkbox-group{display:flex;flex-direction:column;gap:var(--d-sp-2)}',
'.d-checkbox-group-horizontal{flex-direction:row;gap:var(--d-sp-4)}',
'.d-switch{display:inline-flex;align-items:center;gap:var(--d-sp-2);cursor:pointer;user-select:none}',
'.d-switch-native{position:absolute;opacity:0;width:0;height:0;pointer-events:none}',
'.d-switch-track{position:relative;width:var(--d-switch-w);height:var(--d-switch-h);border-radius:calc(var(--d-switch-h) / 2);flex-shrink:0}',
'.d-switch-thumb{position:absolute;width:var(--d-switch-thumb);height:var(--d-switch-thumb);border-radius:50%;top:50%;transform:translateY(-50%);left:calc((var(--d-switch-h) - var(--d-switch-thumb)) / 2)}',
'.d-switch:has(:checked) .d-switch-thumb{left:calc(var(--d-switch-w) - var(--d-switch-thumb) - (var(--d-switch-h) - var(--d-switch-thumb)) / 2)}',
'.d-switch-sm{--d-switch-w:1.75rem;--d-switch-h:1rem;--d-switch-thumb:0.75rem}',
'.d-switch-lg{--d-switch-w:3.25rem;--d-switch-h:1.75rem;--d-switch-thumb:1.25rem}',
'.d-switch-label{font-size:var(--d-text-base)}',
'.d-switch-native:disabled~.d-switch-track{opacity:0.5;cursor:not-allowed}',
'.d-radiogroup{display:flex;flex-direction:column;gap:var(--d-sp-2)}',
'.d-radiogroup-horizontal{flex-direction:row;gap:var(--d-sp-4)}',
'.d-radio{display:inline-flex;align-items:center;gap:var(--d-sp-2);cursor:pointer;user-select:none}',
'.d-radio-native{position:absolute;opacity:0;width:0;height:0;pointer-events:none}',
'.d-radio-indicator{display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;flex-shrink:0}',
'.d-radio-dot{width:8px;height:8px;border-radius:50%;transform:scale(0);transition:transform 0.15s ease}',
'.d-radio:has(:checked) .d-radio-dot{transform:scale(1)}',
'.d-radio-label{font-size:var(--d-text-base)}',
'.d-radio-disabled{opacity:0.5;cursor:not-allowed}',
'.d-select-wrap{position:relative;display:inline-flex;flex-direction:column}',
'.d-select{display:flex;align-items:center;justify-content:space-between;gap:var(--d-density-gap,var(--d-sp-2));width:100%;font:inherit;font-size:var(--d-density-text,var(--d-text-base));padding:var(--d-density-pad-y,var(--d-sp-2)) var(--d-density-pad-x,var(--d-sp-3));min-height:var(--d-density-min-h,auto);cursor:pointer;outline:none;text-align:left;border:none;background:none}',
'.d-select:focus-visible{outline:2px solid var(--d-ring);outline-offset:-2px}',
'.d-select[disabled]{cursor:not-allowed;opacity:0.5}',
'.d-select-display{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'.d-select-arrow{flex-shrink:0;font-size:var(--d-text-sm);transition:transform 0.15s}',
'.d-select-dropdown{position:absolute;top:100%;left:0;right:0;z-index:var(--d-z-dropdown);max-height:var(--d-panel-max-h);overflow:auto;margin-top:var(--d-offset-dropdown)}',
'.d-select-option{padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base)}',
'.d-select-option-disabled{opacity:0.5;cursor:not-allowed}',
'.d-select-placeholder{color:var(--d-muted)}',
'.d-select-optgroup{padding:var(--d-sp-1) var(--d-sp-3);font-size:var(--d-text-sm);font-weight:var(--d-fw-title);color:var(--d-muted)}',
'.d-select-clear{display:flex;align-items:center;cursor:pointer;padding:0 var(--d-sp-2);font-size:var(--d-text-sm);opacity:0.5}',
'.d-select-clear:hover{opacity:1}',
'.d-select-multi-tag{display:inline-flex;align-items:center;gap:var(--d-sp-1);padding:var(--d-sp-1) var(--d-sp-2);font-size:var(--d-text-sm);border-radius:var(--d-radius)}',
'.d-select-multi-tag-close{cursor:pointer;font-size:0.75em;opacity:0.6}',
'.d-select-multi-tag-close:hover{opacity:1}',
'.d-select-sm .d-select{padding:var(--d-sp-1-5) var(--d-sp-2);font-size:var(--d-text-sm)}',
'.d-select-lg .d-select{padding:var(--d-sp-3) var(--d-sp-4);font-size:var(--d-text-md)}',
'.d-combobox{position:relative;display:inline-flex;flex-direction:column}',
'.d-combobox-input-wrap{display:flex;align-items:center}',
'.d-combobox-input{background:transparent;border:none;outline:none;width:100%;font:inherit;padding:var(--d-sp-2) var(--d-sp-3)}',
'.d-combobox-input[disabled]{cursor:not-allowed;opacity:0.5}',
'.d-combobox-arrow{flex-shrink:0;padding:0 var(--d-sp-2);cursor:pointer;font-size:var(--d-text-sm)}',
'.d-combobox-listbox{position:absolute;top:100%;left:0;right:0;z-index:var(--d-z-dropdown);max-height:var(--d-panel-max-h);overflow:auto;margin-top:var(--d-offset-dropdown)}',
'.d-combobox-option{padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base)}',
'.d-combobox-option-disabled{opacity:0.5;cursor:not-allowed}',
'.d-combobox-empty{padding:var(--d-sp-3);font-size:var(--d-text-sm);text-align:center}',
'.d-combobox-sm .d-combobox-input{padding:var(--d-sp-1-5) var(--d-sp-2);font-size:var(--d-text-sm)}',
'.d-combobox-lg .d-combobox-input{padding:var(--d-sp-3) var(--d-sp-4);font-size:var(--d-text-md)}',
'.d-slider{display:flex;align-items:center;gap:var(--d-sp-3);width:100%;user-select:none}',
'.d-slider-track{position:relative;flex:1;height:6px;border-radius:3px;cursor:pointer}',
'.d-slider-fill{position:absolute;top:0;left:0;height:100%;border-radius:3px}',
'.d-slider-thumb{position:absolute;top:50%;width:18px;height:18px;border-radius:50%;transform:translate(-50%,-50%);cursor:grab;outline:none}',
'.d-slider-thumb:focus-visible{outline:2px solid var(--d-ring);outline-offset:2px}',
'.d-slider-active .d-slider-thumb{cursor:grabbing}',
'.d-slider-disabled{opacity:0.5;pointer-events:none}',
'.d-slider-value{font-size:var(--d-text-sm);min-width:2em;text-align:center}',
'.d-slider-marks{position:relative;width:100%;margin-top:var(--d-sp-1)}',
'.d-slider-mark{position:absolute;font-size:var(--d-text-xs);transform:translateX(-50%)}',
'.d-slider-vertical{flex-direction:column;width:auto;height:200px}',
'.d-slider-vertical .d-slider-track{width:6px;height:100%;flex:1}',
'.d-slider-vertical .d-slider-fill{width:100%;height:auto;bottom:0;top:auto}',
'.d-slider-vertical .d-slider-thumb{left:50%;top:auto;transform:translate(-50%,50%)}',
'.d-rate{display:inline-flex;gap:var(--d-sp-1);font-size:1.25rem}',
'.d-rate-star{cursor:pointer;transition:transform 0.1s;user-select:none;background:none;border:none;padding:0;font-size:inherit;line-height:1}',
'.d-rate-star:hover{transform:scale(1.15)}',
'.d-rate-star:focus-visible{outline:2px solid var(--d-ring);outline-offset:2px}',
'.d-rate[aria-disabled="true"] .d-rate-star{cursor:default;transform:none}',
'.d-rate-sm{font-size:1rem;gap:2px}',
'.d-rate-lg{font-size:1.75rem}',
'.d-colorpicker{position:relative;display:inline-flex;flex-direction:column}',
'.d-colorpicker-trigger{display:inline-flex;align-items:center;gap:var(--d-sp-2);cursor:pointer;padding:var(--d-sp-1-5) var(--d-sp-3);font:inherit;font-size:var(--d-text-base);border:none;background:none;outline:none}',
'.d-colorpicker-swatch{width:24px;height:24px;border-radius:var(--d-radius);flex-shrink:0}',
'.d-colorpicker-panel{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);padding:var(--d-sp-3);margin-top:var(--d-offset-dropdown);min-width:240px}',
'.d-colorpicker-saturation{position:relative;width:100%;height:150px;cursor:crosshair;border-radius:var(--d-radius)}',
'.d-colorpicker-hue{position:relative;width:100%;height:12px;border-radius:6px;cursor:pointer;margin-top:var(--d-sp-2);background:linear-gradient(to right,red,yellow,lime,cyan,blue,magenta,red)}',
'.d-colorpicker-alpha{position:relative;width:100%;height:12px;border-radius:6px;cursor:pointer;margin-top:var(--d-sp-2)}',
'.d-colorpicker-thumb{position:absolute;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.3);transform:translate(-50%,-50%);pointer-events:none}',
'.d-colorpicker-input{display:flex;gap:var(--d-sp-2);margin-top:var(--d-sp-2)}',
'.d-colorpicker-presets{display:flex;flex-wrap:wrap;gap:var(--d-sp-1);margin-top:var(--d-sp-2)}',
'.d-colorpicker-preset{width:20px;height:20px;border-radius:var(--d-radius);cursor:pointer;border:none;padding:0}',
'.d-datepicker{position:relative;display:inline-flex;flex-direction:column}',
'.d-datepicker-input{display:flex;align-items:center}',
'.d-datepicker-panel{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);margin-top:var(--d-offset-dropdown);padding:var(--d-sp-3);min-width:280px}',
'.d-datepicker-header{display:flex;align-items:center;justify-content:space-between;padding-bottom:var(--d-sp-2)}',
'.d-datepicker-title{font-weight:var(--d-fw-title);font-size:var(--d-text-base);cursor:pointer}',
'.d-datepicker-nav{display:flex;gap:var(--d-sp-1)}',
'.d-datepicker-nav-btn{background:none;border:none;cursor:pointer;padding:var(--d-sp-1);font-size:var(--d-text-sm);line-height:1}',
'.d-datepicker-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center}',
'.d-datepicker-weekday{font-size:var(--d-text-xs);font-weight:var(--d-fw-medium,500);padding:var(--d-sp-1);color:var(--d-muted)}',
'.d-datepicker-day{padding:var(--d-sp-1);font-size:var(--d-text-sm);cursor:pointer;border-radius:var(--d-radius);border:none;background:none;font:inherit;line-height:2}',
'.d-datepicker-day:hover{background:var(--d-surface-1)}',
'.d-datepicker-day:focus-visible{outline:2px solid var(--d-ring);outline-offset:-2px}',
'.d-datepicker-day-today{font-weight:700}',
'.d-datepicker-day-selected{font-weight:var(--d-fw-medium,500)}',
'.d-datepicker-day-outside{opacity:0.3}',
'.d-datepicker-day-disabled{opacity:0.3;cursor:not-allowed}',
'.d-datepicker-months,.d-datepicker-years{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--d-sp-2)}',
'.d-datepicker-month,.d-datepicker-year{padding:var(--d-sp-2);text-align:center;cursor:pointer;border:none;background:none;font:inherit;border-radius:var(--d-radius)}',
'.d-timepicker{position:relative;display:inline-flex;flex-direction:column}',
'.d-timepicker-panel{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);margin-top:var(--d-offset-dropdown);display:flex;gap:0}',
'.d-timepicker-column{display:flex;flex-direction:column;height:200px;overflow-y:auto;min-width:56px;text-align:center;scrollbar-width:thin}',
'.d-timepicker-cell{padding:var(--d-sp-1-5) var(--d-sp-2);cursor:pointer;font-size:var(--d-text-sm);border:none;background:none;font:inherit}',
'.d-timepicker-cell-selected{font-weight:var(--d-fw-medium,500)}',
'.d-timepicker-cell-disabled{opacity:0.3;cursor:not-allowed}',
'.d-upload{display:flex;flex-direction:column;gap:var(--d-sp-2)}',
'.d-upload-dragger{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--d-sp-8);cursor:pointer;border:2px dashed var(--d-border);border-radius:var(--d-radius-lg,var(--d-radius));text-align:center;gap:var(--d-sp-2)}',
'.d-upload-dragger:hover{border-color:var(--d-ring)}',
'.d-upload-dragger-active{border-color:var(--d-ring);background:var(--d-surface-1)}',
'.d-upload-input{display:none}',
'.d-upload-list{display:flex;flex-direction:column;gap:var(--d-sp-1)}',
'.d-upload-item{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-1-5) var(--d-sp-2);font-size:var(--d-text-sm);border-radius:var(--d-radius)}',
'.d-upload-item-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'.d-upload-item-remove{cursor:pointer;background:none;border:none;padding:0;font-size:1em;opacity:0.5}',
'.d-upload-item-remove:hover{opacity:1}',
'.d-transfer{display:flex;align-items:stretch;gap:var(--d-sp-3)}',
'.d-transfer-panel{display:flex;flex-direction:column;flex:1;min-width:200px;overflow:hidden}',
'.d-transfer-header{display:flex;align-items:center;justify-content:space-between;padding:var(--d-sp-2) var(--d-sp-3);font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500)}',
'.d-transfer-body{flex:1;overflow:auto;min-height:200px}',
'.d-transfer-item{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-1-5) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-sm)}',
'.d-transfer-item:hover{background:var(--d-surface-1)}',
'.d-transfer-item-disabled{opacity:0.5;cursor:not-allowed}',
'.d-transfer-search{padding:var(--d-sp-2) var(--d-sp-3)}',
'.d-transfer-actions{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--d-sp-2)}',
'.d-transfer-footer{padding:var(--d-sp-2) var(--d-sp-3);font-size:var(--d-text-sm)}',
'.d-cascader{position:relative;display:inline-flex;flex-direction:column}',
'.d-cascader-trigger{display:flex;align-items:center}',
'.d-cascader-input{background:transparent;border:none;outline:none;width:100%;font:inherit;padding:var(--d-sp-2) var(--d-sp-3)}',
'.d-cascader-disabled{cursor:not-allowed;opacity:0.5}',
'.d-cascader-clear{display:flex;align-items:center;cursor:pointer;padding:0 var(--d-sp-2);font-size:var(--d-text-sm);opacity:0.5;border:none;background:none}',
'.d-cascader-clear:hover{opacity:1}',
'.d-cascader-dropdown{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);display:flex;margin-top:var(--d-offset-dropdown)}',
'.d-cascader-column{min-width:140px;max-height:256px;overflow:auto}',
'.d-cascader-option{display:flex;align-items:center;justify-content:space-between;padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base);white-space:nowrap}',
'.d-cascader-option:hover{background:var(--d-surface-1)}',
'.d-cascader-option-disabled{opacity:0.5;cursor:not-allowed}',
'.d-cascader-option-active{font-weight:var(--d-fw-medium,500)}',
'.d-cascader-arrow{font-size:var(--d-text-xs);opacity:0.5}',
'.d-mentions{position:relative;display:inline-flex;flex-direction:column}',
'.d-mentions-dropdown{position:absolute;bottom:100%;left:0;z-index:var(--d-z-dropdown);min-width:160px;max-height:var(--d-panel-max-h);overflow:auto;margin-bottom:var(--d-offset-dropdown)}',
'.d-mentions-option{padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base)}',
'.d-mentions-option:hover{background:var(--d-surface-1)}',
'.d-label{display:inline-block;font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-normal);cursor:default}',
'.d-label-required::after{content:" *";color:var(--d-error)}',
'.d-field{display:flex;flex-direction:column;gap:var(--d-sp-1-5)}',
'.d-field-label{font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500);line-height:var(--d-lh-normal)}',
'.d-field-required{color:var(--d-error)}',
'.d-field-help{font-size:var(--d-text-xs);color:var(--d-muted)}',
'.d-field-error{font-size:var(--d-text-xs);color:var(--d-error)}',
'.d-form{display:flex;flex-direction:column;gap:var(--d-sp-4)}',
'.d-form-horizontal{display:grid;grid-template-columns:auto 1fr;gap:var(--d-sp-3) var(--d-sp-4);align-items:start}',
'.d-form-actions{display:flex;gap:var(--d-sp-2);justify-content:flex-end}',
'dialog.d-modal-content{border:0;padding:0;position:fixed;inset:0;width:100%;height:100%;max-width:100%;max-height:100%;background:transparent}',
'dialog.d-modal-content[open]{display:flex;align-items:center;justify-content:center}',
'dialog.d-modal-content::backdrop{background:var(--d-overlay)}',
'.d-modal-panel{max-width:90vw;max-height:85vh;overflow:auto;display:flex;flex-direction:column}',
'.d-modal-header{display:flex;justify-content:space-between;align-items:center;padding:var(--d-compound-pad) var(--d-compound-pad) 0}',
'.d-modal-title{font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
'.d-modal-body{padding:var(--d-compound-gap) var(--d-compound-pad)}',
'.d-modal-body:last-child{padding-bottom:var(--d-compound-pad)}',
'.d-modal-footer{display:flex;justify-content:flex-end;gap:var(--d-sp-2);padding:var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)}',
'.d-modal-close,.d-drawer-close,.d-sheet-close,.d-notification-close,.d-tour-close{cursor:pointer;line-height:1;background:none;border:none;font-size:var(--d-text-xl);padding:var(--d-sp-1);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}',
'dialog.d-alertdialog{border:0;padding:0;position:fixed;inset:0;width:100%;height:100%;max-width:100%;max-height:100%;background:transparent}',
'dialog.d-alertdialog[open]{display:flex;align-items:center;justify-content:center}',
'dialog.d-alertdialog::backdrop{background:var(--d-overlay)}',
'.d-alertdialog-panel{max-width:420px;display:flex;flex-direction:column}',
'.d-alertdialog-body{padding:var(--d-compound-pad)}',
'.d-alertdialog-title{font-weight:var(--d-fw-title);font-size:var(--d-text-lg);margin-bottom:var(--d-sp-2)}',
'.d-alertdialog-desc{font-size:var(--d-text-base);color:var(--d-muted);line-height:var(--d-lh-normal)}',
'.d-alertdialog-footer{display:flex;justify-content:flex-end;gap:var(--d-sp-2);padding:var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)}',
'dialog.d-drawer{border:0;padding:0;position:fixed;inset:0;width:100%;height:100%;max-width:100%;max-height:100%;background:transparent}',
'dialog.d-drawer::backdrop{background:var(--d-overlay)}',
'.d-drawer-panel{position:absolute;display:flex;flex-direction:column;overflow:auto;outline:none}',
'.d-drawer-left{top:0;bottom:0;left:0}',
'.d-drawer-right{top:0;bottom:0;right:0}',
'.d-drawer-top{top:0;left:0;right:0}',
'.d-drawer-bottom{bottom:0;left:0;right:0}',
'.d-drawer-header{display:flex;align-items:center;justify-content:space-between;padding:var(--d-compound-pad) var(--d-compound-pad) 0}',
'.d-drawer-title{font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
'.d-drawer-body{flex:1;overflow:auto;padding:var(--d-compound-gap) var(--d-compound-pad)}',
'.d-drawer-body:last-child{padding-bottom:var(--d-compound-pad)}',
'.d-drawer-footer{display:flex;justify-content:flex-end;gap:var(--d-sp-2);padding:var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)}',
'dialog.d-sheet{border:0;padding:0;position:fixed;inset:0;width:100%;height:100%;max-width:100%;max-height:100%;background:transparent}',
'dialog.d-sheet::backdrop{background:var(--d-overlay)}',
'.d-sheet-panel{position:absolute;display:flex;flex-direction:column;overflow:auto;outline:none}',
'.d-sheet-left{top:0;bottom:0;left:0}',
'.d-sheet-right{top:0;bottom:0;right:0}',
'.d-sheet-top{top:0;left:0;right:0}',
'.d-sheet-bottom{bottom:0;left:0;right:0;max-height:85vh;border-top-left-radius:var(--d-radius-lg,12px);border-top-right-radius:var(--d-radius-lg,12px)}',
'.d-sheet-handle{display:flex;justify-content:center;padding:var(--d-sp-2) 0}',
'.d-sheet-handle-bar{width:40px;height:4px;border-radius:2px;background:var(--d-border)}',
'.d-sheet-header{display:flex;align-items:center;justify-content:space-between;padding:var(--d-compound-pad) var(--d-compound-pad) 0}',
'.d-sheet-title{font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
'.d-sheet-body{flex:1;overflow:auto;padding:var(--d-compound-gap) var(--d-compound-pad)}',
'.d-sheet-body:last-child{padding-bottom:var(--d-compound-pad)}',
'.d-sheet-footer{display:flex;justify-content:flex-end;gap:var(--d-sp-2);padding:var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)}',
'.d-tooltip-wrap{position:relative;display:inline-flex}',
'.d-tooltip{position:absolute;z-index:var(--d-z-tooltip);padding:var(--d-sp-1-5) var(--d-sp-2-5);font-size:var(--d-text-sm);line-height:1.4;white-space:nowrap;pointer-events:none}',
'.d-tooltip-top{bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:var(--d-offset-tooltip)}',
'.d-tooltip-bottom{top:100%;left:50%;transform:translateX(-50%);margin-top:var(--d-offset-tooltip)}',
'.d-tooltip-left{right:100%;top:50%;transform:translateY(-50%);margin-right:var(--d-offset-tooltip)}',
'.d-tooltip-right{left:100%;top:50%;transform:translateY(-50%);margin-left:var(--d-offset-tooltip)}',
'.d-popover{position:relative;display:inline-flex}',
'.d-popover-content{position:absolute;z-index:var(--d-z-popover);min-width:200px;padding:var(--d-sp-3)}',
'.d-popover-top{bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:var(--d-offset-popover)}',
'.d-popover-bottom{top:100%;left:50%;transform:translateX(-50%);margin-top:var(--d-offset-popover)}',
'.d-popover-left{right:100%;top:50%;transform:translateY(-50%);margin-right:var(--d-offset-popover)}',
'.d-popover-right{left:100%;top:50%;transform:translateY(-50%);margin-left:var(--d-offset-popover)}',
'.d-popover-align-start{left:0;transform:none}',
'.d-popover-align-end{left:auto;right:0;transform:none}',
'.d-popover-top.d-popover-align-start,.d-popover-bottom.d-popover-align-start{left:0;transform:none}',
'.d-popover-top.d-popover-align-end,.d-popover-bottom.d-popover-align-end{left:auto;right:0;transform:none}',
'.d-hovercard{position:relative;display:inline-flex}',
'.d-hovercard-content{position:absolute;z-index:var(--d-z-popover);min-width:240px;padding:var(--d-sp-3);pointer-events:auto}',
'.d-dropdown{position:relative;display:inline-flex}',
'.d-dropdown-menu{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);min-width:180px;margin-top:var(--d-offset-menu);overflow:auto;max-height:var(--d-panel-max-h)}',
'.d-dropdown-right{left:auto;right:0}',
'.d-dropdown-item{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base);outline:none}',
'.d-dropdown-item-disabled{opacity:0.5;cursor:not-allowed}',
'.d-dropdown-item-label{flex:1}',
'.d-dropdown-item-icon{flex-shrink:0;width:1em;height:1em}',
'.d-dropdown-item-shortcut{flex-shrink:0;font-size:var(--d-text-sm);opacity:0.5}',
'.d-dropdown-separator{height:1px;margin:var(--d-sp-1) 0}',
'.d-dropdown-group-label{padding:var(--d-sp-1) var(--d-sp-3);font-size:var(--d-text-xs);font-weight:var(--d-fw-title);color:var(--d-muted);text-transform:uppercase;letter-spacing:0.05em}',
'.d-contextmenu{position:fixed;z-index:var(--d-z-popover);min-width:180px;max-height:320px;overflow:auto;display:none}',
'dialog.d-command{border:0;padding:0;position:fixed;inset:0;width:100%;height:100%;max-width:100%;max-height:100%;background:transparent}',
'dialog.d-command[open]{display:flex;align-items:center;justify-content:center}',
'.d-command-panel{display:flex;flex-direction:column;max-height:400px;overflow:hidden;width:560px;max-width:90vw}',
'.d-command-input-wrap{display:flex;align-items:center;padding:var(--d-sp-2) var(--d-sp-3);gap:var(--d-sp-2)}',
'.d-command-input{flex:1;background:transparent;border:none;outline:none;font:inherit;font-size:var(--d-text-base)}',
'.d-command-icon{flex-shrink:0;opacity:0.5}',
'.d-command-list{flex:1;overflow:auto;padding:var(--d-sp-1) 0}',
'.d-command-group{padding:var(--d-sp-1) 0}',
'.d-command-group-label{padding:var(--d-sp-1) var(--d-sp-3);font-size:var(--d-text-xs);font-weight:var(--d-fw-title);color:var(--d-muted);text-transform:uppercase;letter-spacing:0.05em}',
'.d-command-item{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base);outline:none}',
'.d-command-item-icon{flex-shrink:0;width:1em;height:1em}',
'.d-command-item-label{flex:1}',
'.d-command-item-shortcut{font-size:var(--d-text-sm);opacity:0.5}',
'.d-command-empty{padding:var(--d-sp-6);text-align:center;font-size:var(--d-text-sm);color:var(--d-muted)}',
'.d-command-separator{height:1px;margin:var(--d-sp-1) 0;background:var(--d-border)}',
'.d-popconfirm-wrap{position:relative;display:inline-flex}',
'.d-popconfirm{position:absolute;z-index:var(--d-z-popover);min-width:220px;padding:var(--d-sp-3)}',
'.d-popconfirm-body{display:flex;align-items:flex-start;gap:var(--d-sp-2);margin-bottom:var(--d-sp-3)}',
'.d-popconfirm-title{font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);margin-bottom:var(--d-sp-1)}',
'.d-popconfirm-desc{font-size:var(--d-text-sm);color:var(--d-muted);margin-bottom:var(--d-sp-3);line-height:var(--d-lh-normal)}',
'.d-popconfirm-footer{display:flex;justify-content:flex-end;gap:var(--d-sp-2)}',
'.d-tabs{display:flex;flex-direction:column}',
'.d-tabs-list{display:flex;gap:0}',
'.d-tab{font:inherit;font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);padding:var(--d-sp-2-5) var(--d-sp-4);cursor:pointer;outline:none;background:transparent;border:none;white-space:nowrap}',
'.d-tab:focus-visible{outline:2px solid var(--d-ring);outline-offset:-2px}',
'.d-tabs-panel{padding:var(--d-sp-4)}',
'.d-tabs-vertical{flex-direction:row}',
'.d-tabs-vertical .d-tabs-list{flex-direction:column}',
'.d-tab-closable{display:flex;align-items:center;gap:var(--d-sp-1)}',
'.d-tab-close{opacity:0.5;font-size:0.75em;cursor:pointer;background:none;border:none;padding:0}',
'.d-tab-close:hover{opacity:1}',
'.d-accordion{display:flex;flex-direction:column}',
'.d-accordion-item{overflow:hidden}',
'.d-accordion-trigger{display:flex;align-items:center;justify-content:space-between;width:100%;font:inherit;font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);padding:var(--d-sp-4) var(--d-sp-5);cursor:pointer;outline:none;background:transparent;border:none;text-align:left}',
'.d-accordion-trigger:focus-visible{outline:2px solid var(--d-ring);outline-offset:-2px}',
'.d-accordion-icon{font-size:var(--d-text-sm);transition:transform 0.2s}',
'.d-accordion-open .d-accordion-icon{transform:rotate(180deg)}',
'.d-accordion-region{transition:height 0.25s ease-out}',
'.d-accordion-content{padding:0 var(--d-sp-5) var(--d-sp-3)}',
'.d-collapsible{display:flex;flex-direction:column}',
'.d-collapsible-trigger{cursor:pointer;user-select:none}',
'.d-collapsible-content{overflow:hidden;transition:height 0.25s ease-out}',
'.d-separator{border:none;margin:var(--d-sp-3) 0}',
'.d-separator-vertical{display:inline-block;width:1px;height:1em;margin:0 var(--d-sp-2);vertical-align:middle}',
'div.d-separator{display:flex;align-items:center;gap:var(--d-sp-3)}',
'.d-separator-line{flex:1;height:1px}',
'.d-separator-label{font-size:var(--d-text-sm);white-space:nowrap}',
'.d-breadcrumb-list{display:flex;align-items:center;gap:var(--d-sp-1);list-style:none;margin:0;padding:0;flex-wrap:wrap}',
'.d-breadcrumb-item{display:flex;align-items:center;gap:var(--d-sp-1)}',
'.d-breadcrumb-link{font:inherit;font-size:var(--d-text-base);text-decoration:none;cursor:pointer;background:transparent;border:none;padding:0}',
'.d-breadcrumb-separator{font-size:var(--d-text-sm)}',
'.d-breadcrumb-current{font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500)}',
'.d-pagination{display:flex;align-items:center}',
'.d-pagination-list{display:flex;align-items:center;gap:var(--d-sp-1);list-style:none;margin:0;padding:0}',
'.d-pagination-btn{display:inline-flex;align-items:center;justify-content:center;min-width:2rem;height:2rem;padding:0 var(--d-sp-2);font:inherit;font-size:var(--d-text-base);cursor:pointer;outline:none;background:transparent;border:none}',
'.d-pagination-btn:focus-visible{outline:2px solid var(--d-ring);outline-offset:2px}',
'.d-pagination-disabled{opacity:0.4;cursor:not-allowed;pointer-events:none}',
'.d-pagination-ellipsis{display:inline-flex;align-items:center;justify-content:center;min-width:2rem;height:2rem;font-size:var(--d-text-base)}',
'.d-pagination-simple{display:flex;align-items:center;gap:var(--d-sp-2)}',
'.d-steps{display:flex;align-items:flex-start}',
'.d-steps-vertical{flex-direction:column}',
'.d-step{display:flex;align-items:flex-start;flex:1;gap:var(--d-sp-2)}',
'.d-step-icon{display:flex;align-items:center;justify-content:center;width:2rem;height:2rem;border-radius:50%;flex-shrink:0;font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500)}',
'.d-step-content{display:flex;flex-direction:column;gap:var(--d-sp-1);min-width:0}',
'.d-step-title{font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);line-height:2rem}',
'.d-step-desc{font-size:var(--d-text-sm);color:var(--d-muted);line-height:var(--d-lh-normal)}',
'.d-step-connector{flex:1;height:1px;margin-top:1rem;min-width:1.5rem}',
'.d-steps-vertical .d-step-connector{width:1px;height:auto;min-height:1.5rem;margin-top:0;margin-left:calc(1rem - 0.5px)}',
'.d-segmented{display:inline-flex;padding:2px;border-radius:var(--d-radius);gap:2px}',
'.d-segmented-item{display:inline-flex;align-items:center;justify-content:center;padding:var(--d-sp-1-5) var(--d-sp-3);font:inherit;font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500);cursor:pointer;border:none;background:none;outline:none;border-radius:calc(var(--d-radius) - 2px);white-space:nowrap;transition:all 0.15s}',
'.d-segmented-item:focus-visible{outline:2px solid var(--d-ring);outline-offset:2px}',
'.d-segmented-item[aria-checked="true"]{font-weight:var(--d-fw-medium,500)}',
'.d-segmented-item[disabled]{cursor:not-allowed;opacity:0.5}',
'.d-menu{display:flex;flex-direction:column;min-width:180px}',
'.d-menu-item{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base);outline:none;border:none;background:none;text-align:left;width:100%;font:inherit}',
'.d-menu-item:focus-visible{outline:2px solid var(--d-ring);outline-offset:-2px}',
'.d-menu-item-disabled{opacity:0.5;cursor:not-allowed}',
'.d-menu-item-icon{flex-shrink:0;width:1em;height:1em}',
'.d-menu-item-label{flex:1}',
'.d-menu-item-arrow{flex-shrink:0;font-size:var(--d-text-xs);opacity:0.5}',
'.d-menu-group-label{padding:var(--d-sp-1) var(--d-sp-3);font-size:var(--d-text-xs);font-weight:var(--d-fw-title);color:var(--d-muted)}',
'.d-menu-separator{height:1px;margin:var(--d-sp-1) 0;background:var(--d-border)}',
'.d-menu-sub{position:absolute;left:100%;top:0;z-index:var(--d-z-dropdown);min-width:180px}',
'.d-menubar{display:flex;align-items:center;gap:0}',
'.d-menubar-item{display:flex;align-items:center;padding:var(--d-sp-1-5) var(--d-sp-3);cursor:pointer;font:inherit;font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);background:none;border:none;outline:none}',
'.d-menubar-item:focus-visible{outline:2px solid var(--d-ring);outline-offset:-2px}',
'.d-navmenu{display:flex;align-items:center;gap:var(--d-sp-1)}',
'.d-navmenu-item{display:flex;align-items:center;padding:var(--d-sp-2) var(--d-sp-3);font:inherit;font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500);cursor:pointer;text-decoration:none;border:none;background:none;outline:none;white-space:nowrap}',
'.d-navmenu-item:focus-visible{outline:2px solid var(--d-ring);outline-offset:-2px}',
'.d-navmenu-content{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);min-width:200px;padding:var(--d-sp-3)}',
'.d-affix{position:relative}',
'.d-affix-fixed{position:fixed;z-index:var(--d-z-sticky)}',
'.d-table-wrap{overflow-x:auto}',
'.d-table{width:100%;border-collapse:collapse;font-size:var(--d-text-base)}',
'.d-th{text-align:left;font-weight:600;padding:var(--d-sp-3)}',
'.d-td{padding:var(--d-sp-3)}',
'.d-table-compact .d-th,.d-table-compact .d-td{padding:var(--d-sp-1-5) var(--d-sp-3)}',
'.d-th-sortable{cursor:pointer;user-select:none}',
'.d-th-sort-icon{display:inline-flex;margin-left:var(--d-sp-1);font-size:var(--d-text-xs);opacity:0.4}',
'.d-th-sort-active .d-th-sort-icon{opacity:1}',
'.d-table-expandable .d-td:first-child{padding-left:var(--d-sp-6)}',
'.d-table-expand-btn{background:none;border:none;cursor:pointer;padding:0;font-size:var(--d-text-sm);margin-right:var(--d-sp-2)}',
'.d-table-row-selected{font-weight:var(--d-fw-medium,500)}',
'.d-table-sticky{position:sticky;top:0;z-index:2}',
'.d-table-footer{padding:var(--d-sp-3);display:flex;align-items:center;justify-content:space-between}',
'.d-datatable{display:flex;flex-direction:column;width:100%;font-size:var(--d-text-base)}',
'.d-datatable-header{display:flex;align-items:center;gap:var(--d-sp-3);padding:var(--d-sp-3)}',
'.d-datatable-scroll{overflow:auto;flex:1}',
'.d-datatable-table{width:100%;border-collapse:collapse;table-layout:auto}',
'.d-datatable-th{text-align:left;font-weight:var(--d-fw-title,600);padding:var(--d-sp-3);position:relative;white-space:nowrap;font-size:var(--d-text-sm);letter-spacing:0.02em;text-transform:uppercase}',
'.d-datatable-th-sortable{cursor:pointer;user-select:none}',
'.d-datatable-th-sortable:hover{opacity:0.8}',
'.d-datatable-sort-icon{display:inline;margin-left:var(--d-sp-1);font-size:var(--d-text-xs);opacity:0.4}',
'.d-datatable-th-sorted-asc .d-datatable-sort-icon,.d-datatable-th-sorted-desc .d-datatable-sort-icon{opacity:1}',
'.d-datatable-td{padding:var(--d-sp-3);vertical-align:middle}',
'.d-datatable-td-editing{padding:0}',
'.d-datatable-edit-input{width:100%;padding:var(--d-sp-2) var(--d-sp-3);border:2px solid var(--d-primary);background:var(--d-surface-0);color:var(--d-fg);font:inherit;font-size:var(--d-text-base);outline:none;box-sizing:border-box}',
'.d-datatable-row{transition:background var(--d-duration-fast,100ms) var(--d-easing-standard,ease)}',
'.d-datatable-hoverable .d-datatable-row:hover{background:var(--d-surface-1,rgba(0,0,0,0.03))}',
'.d-datatable-striped .d-datatable-row:nth-child(even){background:var(--d-surface-0,rgba(0,0,0,0.02))}',
'.d-datatable-row-selected{background:var(--d-primary-subtle) !important;font-weight:var(--d-fw-medium,500)}',
'.d-datatable-row-expanded{background:var(--d-surface-1)}',
'.d-datatable-expand-row{background:var(--d-surface-0)}',
'.d-datatable-expand-row .d-datatable-td{padding:var(--d-sp-4) var(--d-sp-6)}',
'.d-datatable-expand-btn{background:none;border:none;cursor:pointer;padding:var(--d-sp-1);font-size:var(--d-text-sm);color:var(--d-muted-fg);line-height:1}',
'.d-datatable-expand-btn:hover{color:var(--d-fg)}',
'.d-datatable-checkbox{cursor:pointer;width:16px;height:16px;accent-color:var(--d-primary)}',
'.d-datatable-sticky{position:sticky;top:0;z-index:4;background:var(--d-surface-0,#fff)}',
'.d-datatable-pinned-left,.d-datatable-pinned-right{position:sticky;z-index:2;background:var(--d-surface-0,#fff)}',
'.d-datatable-resize-handle{position:absolute;right:0;top:0;bottom:0;width:4px;cursor:col-resize;user-select:none}',
'.d-datatable-resize-handle:hover{background:var(--d-primary,#3b82f6)}',
'.d-datatable-filter-icon{background:none;border:none;cursor:pointer;font-size:var(--d-text-xs);padding:var(--d-sp-1);color:var(--d-muted-fg);line-height:1}',
'.d-datatable-filter-icon:hover,.d-datatable-filter-active{color:var(--d-primary)}',
'.d-datatable-filter-popup{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown,1000);padding:var(--d-sp-2);min-width:180px}',
'.d-datatable-filter-popup input{width:100%;padding:var(--d-sp-1-5) var(--d-sp-2);border:1px solid var(--d-border);border-radius:var(--d-radius,4px);font:inherit;font-size:var(--d-text-sm);background:var(--d-surface-0);color:var(--d-fg);outline:none;box-sizing:border-box}',
'.d-datatable-filter-popup input:focus{border-color:var(--d-primary);box-shadow:0 0 0 2px var(--d-ring)}',
'.d-datatable-pagination{display:flex;align-items:center;justify-content:flex-end;gap:var(--d-sp-3);padding:var(--d-sp-3);font-size:var(--d-text-sm)}',
'.d-datatable-page-size{display:flex;align-items:center;gap:var(--d-sp-2)}',
'.d-datatable-page-size select{padding:var(--d-sp-1) var(--d-sp-2);border:1px solid var(--d-border);border-radius:var(--d-radius,4px);font:inherit;font-size:var(--d-text-sm);background:var(--d-surface-0);color:var(--d-fg);cursor:pointer}',
'.d-datatable-page-btn{background:none;border:1px solid var(--d-border);border-radius:var(--d-radius,4px);padding:var(--d-sp-1-5) var(--d-sp-3);font:inherit;font-size:var(--d-text-sm);cursor:pointer;color:var(--d-fg)}',
'.d-datatable-page-btn:hover:not([disabled]){background:var(--d-surface-1);border-color:var(--d-border-strong)}',
'.d-datatable-page-btn[disabled]{opacity:0.4;cursor:not-allowed}',
'.d-datatable-page-info{color:var(--d-muted-fg)}',
'.d-datatable-empty{text-align:center}',
'.d-datatable-empty .d-datatable-td{padding:var(--d-sp-8);color:var(--d-muted-fg);font-style:italic}',
'.d-datatable-export-btn{background:none;border:1px solid var(--d-border);border-radius:var(--d-radius,4px);padding:var(--d-sp-1-5) var(--d-sp-3);font:inherit;font-size:var(--d-text-sm);cursor:pointer;color:var(--d-fg);margin-left:auto}',
'.d-datatable-export-btn:hover{background:var(--d-surface-1);border-color:var(--d-border-strong)}',
'@media(prefers-reduced-motion:reduce){.d-datatable-row{transition:none}}',
'.d-list{display:flex;flex-direction:column}',
'.d-list-item{display:flex;align-items:flex-start;gap:var(--d-sp-3);padding:var(--d-sp-3)}',
'.d-list-item-meta{display:flex;flex-direction:column;gap:var(--d-sp-1);flex:1;min-width:0}',
'.d-list-item-title{font-size:var(--d-text-base);font-weight:var(--d-fw-medium,500)}',
'.d-list-item-desc{font-size:var(--d-text-sm);color:var(--d-muted);line-height:var(--d-lh-normal)}',
'.d-list-item-actions{display:flex;gap:var(--d-sp-2);align-items:center;flex-shrink:0}',
'.d-list-item-avatar{flex-shrink:0}',
'.d-list-header{padding:var(--d-sp-3);font-weight:var(--d-fw-title)}',
'.d-list-footer{padding:var(--d-sp-3)}',
'.d-list-grid{display:grid}',
'.d-list-loading{display:flex;justify-content:center;padding:var(--d-sp-4)}',
'.d-tree{display:flex;flex-direction:column}',
'.d-tree-node{display:flex;flex-direction:column}',
'.d-tree-node-content{display:flex;align-items:center;gap:var(--d-sp-1);padding:var(--d-sp-1) 0;cursor:pointer;font-size:var(--d-text-base)}',
'.d-tree-node-content:hover{background:var(--d-surface-1)}',
'.d-tree-node-indent{display:inline-flex;width:var(--d-tree-indent);flex-shrink:0}',
'.d-tree-node-switcher{display:inline-flex;align-items:center;justify-content:center;width:var(--d-tree-indent);cursor:pointer;font-size:var(--d-text-sm);transition:transform 0.15s;background:none;border:none;padding:0}',
'.d-tree-node-switcher-open{transform:rotate(90deg)}',
'.d-tree-node-checkbox{flex-shrink:0}',
'.d-tree-node-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'.d-tree-node-selected .d-tree-node-label{font-weight:var(--d-fw-medium,500)}',
'.d-tree-children{padding-left:var(--d-tree-indent)}',
'.d-tree-node-dragging{opacity:0.5}',
'.d-avatar{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;overflow:hidden;flex-shrink:0}',
'.d-avatar-sm{width:24px;height:24px;font-size:var(--d-text-xs)}',
'.d-avatar-lg{width:48px;height:48px;font-size:var(--d-text-md)}',
'.d-avatar-xl{width:64px;height:64px;font-size:var(--d-text-lg)}',
'.d-avatar-img{width:100%;height:100%;object-fit:cover}',
'.d-avatar-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:var(--d-text-sm);font-weight:600}',
'.d-avatar-group{display:flex}',
'.d-avatar-group>.d-avatar{margin-left:-8px;outline:2px solid var(--d-bg)}',
'.d-avatar-group>.d-avatar:first-child{margin-left:0}',
'.d-avatar-group-count{display:inline-flex;align-items:center;justify-content:center;margin-left:-8px;font-size:var(--d-text-xs);font-weight:600;z-index:1}',
'.d-progress-wrap{position:relative;width:100%}',
'.d-progress{position:relative;width:100%;height:8px;overflow:hidden}',
'.d-progress-sm{height:4px}',
'.d-progress-md{height:16px}',
'.d-progress-lg{height:24px}',
'.d-progress-bar{height:100%;transition:width 0.3s ease}',
'.d-progress-label{font-size:var(--d-text-xs);font-weight:600;line-height:var(--d-lh-none);margin-top:var(--d-sp-1);text-align:right}',
'.d-progress-md .d-progress-label,.d-progress-lg .d-progress-label{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;margin-top:0}',
'.d-progress-circle{display:inline-flex;position:relative}',
'.d-progress-circle-label{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:var(--d-text-sm);font-weight:600}',
'.d-skeleton{animation:d-shimmer 1.5s infinite linear}',
'.d-skeleton-text{height:var(--d-text-base);border-radius:4px;margin-bottom:var(--d-sp-2)}',
'.d-skeleton-rect{border-radius:4px}',
'.d-skeleton-circle{border-radius:50%}',
'.d-skeleton-group{display:flex;flex-direction:column}',
'.d-skeleton-avatar{border-radius:50%;flex-shrink:0}',
'.d-skeleton-button{height:2rem;border-radius:var(--d-radius);width:6rem}',
'.d-skeleton-input{height:2.25rem;border-radius:var(--d-radius);width:100%}',
'.d-alert{display:flex;align-items:flex-start;gap:var(--d-sp-3);padding:var(--d-sp-3) var(--d-sp-4);font-size:var(--d-text-base)}',
'.d-alert-icon{flex-shrink:0;font-size:var(--d-text-lg);line-height:var(--d-lh-none)}',
'.d-alert-body{flex:1;min-width:0}',
'.d-alert-title{font-weight:var(--d-fw-medium,500);margin-bottom:var(--d-sp-1)}',
'.d-alert-desc{font-size:var(--d-text-sm);line-height:var(--d-lh-normal);color:var(--d-muted)}',
'.d-alert-dismiss{flex-shrink:0;background:transparent;border:none;cursor:pointer;font-size:var(--d-text-lg);line-height:var(--d-lh-none);padding:0}',
'.d-alert-closable{padding-right:var(--d-sp-8)}',
'.d-toast-container{position:fixed;z-index:var(--d-z-toast);display:flex;flex-direction:column;gap:var(--d-sp-2);pointer-events:none;max-width:360px}',
'.d-toast-top-right{top:var(--d-sp-4);right:var(--d-sp-4)}',
'.d-toast-top-left{top:var(--d-sp-4);left:var(--d-sp-4)}',
'.d-toast-top-center{top:var(--d-sp-4);left:50%;transform:translateX(-50%)}',
'.d-toast-bottom-right{bottom:var(--d-sp-4);right:var(--d-sp-4)}',
'.d-toast-bottom-left{bottom:var(--d-sp-4);left:var(--d-sp-4)}',
'.d-toast-bottom-center{bottom:var(--d-sp-4);left:50%;transform:translateX(-50%)}',
'.d-toast{display:flex;align-items:flex-start;gap:var(--d-sp-2);padding:var(--d-sp-3) var(--d-sp-4);font-size:var(--d-text-base);pointer-events:auto;animation:d-slidein-t 0.2s ease}',
'.d-toast-message{flex:1}',
'.d-toast-close{flex-shrink:0;background:transparent;border:none;cursor:pointer;font-size:var(--d-text-md);line-height:var(--d-lh-none);padding:0}',
'.d-toast-exit{opacity:0;transform:translateY(-8px);transition:all 0.2s ease}',
'.d-notification-container{position:fixed;z-index:var(--d-z-toast);display:flex;flex-direction:column;gap:var(--d-sp-2);pointer-events:none;max-width:400px}',
'.d-notification-top-right{top:var(--d-sp-4);right:var(--d-sp-4)}',
'.d-notification-top-left{top:var(--d-sp-4);left:var(--d-sp-4)}',
'.d-notification-bottom-right{bottom:var(--d-sp-4);right:var(--d-sp-4);flex-direction:column-reverse}',
'.d-notification-bottom-left{bottom:var(--d-sp-4);left:var(--d-sp-4);flex-direction:column-reverse}',
'.d-notification{display:flex;align-items:flex-start;gap:var(--d-sp-3);padding:var(--d-sp-3) var(--d-sp-4);min-width:320px;max-width:400px;pointer-events:auto;animation:d-slidein-t 0.2s ease}',
'.d-notification-icon{flex-shrink:0;font-size:var(--d-text-lg);line-height:1}',
'.d-notification-content{flex:1;min-width:0}',
'.d-notification-title{font-weight:var(--d-fw-medium,500);margin-bottom:var(--d-sp-1)}',
'.d-notification-desc{font-size:var(--d-text-sm);color:var(--d-muted);line-height:var(--d-lh-normal)}',
'.d-notification-action{display:flex;gap:var(--d-sp-2);margin-top:var(--d-sp-2)}',
'.d-notification-exit{opacity:0;transform:translateY(-8px);transition:all 0.2s ease}',
'.d-message-container{position:fixed;z-index:var(--d-z-toast);top:var(--d-sp-4);left:50%;transform:translateX(-50%);display:flex;flex-direction:column;gap:var(--d-sp-2);pointer-events:none;align-items:center}',
'.d-message{display:inline-flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2) var(--d-sp-4);font-size:var(--d-text-base);pointer-events:auto;animation:d-slidein-b 0.2s ease;white-space:nowrap}',
'.d-result{display:flex;flex-direction:column;align-items:center;padding:var(--d-sp-12) var(--d-sp-4);text-align:center;gap:var(--d-sp-3)}',
'.d-result-icon{font-size:3rem;line-height:1}',
'.d-result-title{font-size:var(--d-text-xl);font-weight:var(--d-fw-title)}',
'.d-result-desc{font-size:var(--d-text-base);color:var(--d-muted);max-width:480px;line-height:var(--d-lh-normal)}',
'.d-result-actions{display:flex;gap:var(--d-sp-2);margin-top:var(--d-sp-2)}',
'.d-result-extra{margin-top:var(--d-sp-4)}',
'.d-descriptions{display:flex;flex-direction:column}',
'.d-descriptions-title{font-weight:var(--d-fw-title);font-size:var(--d-text-lg);margin-bottom:var(--d-sp-3)}',
'.d-descriptions-table{width:100%;border-collapse:collapse}',
'.d-descriptions-label{padding:var(--d-sp-2) var(--d-sp-3);font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500);color:var(--d-muted);white-space:nowrap;vertical-align:top}',
'.d-descriptions-content{padding:var(--d-sp-2) var(--d-sp-3);font-size:var(--d-text-base)}',
'.d-descriptions-horizontal .d-descriptions-label{text-align:right;width:30%}',
'.d-statistic{display:flex;flex-direction:column;gap:var(--d-sp-1)}',
'.d-statistic-label{font-size:var(--d-text-sm);color:var(--d-muted)}',
'.d-statistic-value{font-size:var(--d-text-3xl);font-weight:var(--d-fw-heading);line-height:var(--d-lh-tight);letter-spacing:var(--d-ls-heading)}',
'.d-statistic-prefix,.d-statistic-suffix{font-size:var(--d-text-lg);vertical-align:baseline}',
'.d-statistic-trend{display:inline-flex;align-items:center;gap:var(--d-sp-1);font-size:var(--d-text-sm);font-weight:var(--d-fw-medium,500)}',
'.d-statistic-countdown{font-variant-numeric:tabular-nums}',
'.d-calendar{display:flex;flex-direction:column}',
'.d-calendar-header{display:flex;align-items:center;justify-content:space-between;padding:var(--d-sp-3)}',
'.d-calendar-title{font-weight:var(--d-fw-title);font-size:var(--d-text-lg)}',
'.d-calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);text-align:center}',
'.d-calendar-weekday{font-size:var(--d-text-xs);font-weight:var(--d-fw-medium,500);padding:var(--d-sp-2);color:var(--d-muted)}',
'.d-calendar-cell{padding:var(--d-sp-1);min-height:4rem;cursor:pointer;border:none;background:none;font:inherit;text-align:left;vertical-align:top;position:relative}',
'.d-calendar-cell-content{font-size:var(--d-text-sm)}',
'.d-calendar-mini .d-calendar-cell{min-height:auto;text-align:center;padding:var(--d-sp-1)}',
'.d-carousel{position:relative;overflow:hidden}',
'.d-carousel-track{display:flex;transition:transform 0.3s ease}',
'.d-carousel-slide{flex:0 0 100%;min-width:0}',
'.d-carousel-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:1;background:none;border:none;cursor:pointer;padding:var(--d-sp-2);font-size:var(--d-text-xl);opacity:0.7}',
'.d-carousel-nav:hover{opacity:1}',
'.d-carousel-prev{left:var(--d-sp-2)}',
'.d-carousel-next{right:var(--d-sp-2)}',
'.d-carousel-dots{display:flex;justify-content:center;gap:var(--d-sp-2);padding:var(--d-sp-3)}',
'.d-carousel-dot{width:8px;height:8px;border-radius:50%;cursor:pointer;border:none;padding:0;opacity:0.3}',
'.d-carousel-dot-active{opacity:1}',
'.d-empty{display:flex;flex-direction:column;align-items:center;padding:var(--d-sp-8) var(--d-sp-4);text-align:center;gap:var(--d-sp-2)}',
'.d-empty-icon{font-size:2.5rem;opacity:0.3;line-height:1}',
'.d-empty-desc{font-size:var(--d-text-sm);color:var(--d-muted);line-height:var(--d-lh-normal)}',
'.d-image{display:inline-block;overflow:hidden;position:relative}',
'.d-image>img{display:block;width:100%;height:100%;object-fit:cover}',
'.d-image-preview{cursor:zoom-in}',
'.d-image-overlay{position:fixed;inset:0;z-index:var(--d-z-modal);background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;cursor:zoom-out}',
'.d-image-overlay>img{max-width:90vw;max-height:90vh;object-fit:contain}',
'.d-image-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:var(--d-text-sm);color:var(--d-muted)}',
'.d-timeline{display:flex;flex-direction:column}',
'.d-timeline-item{display:flex;gap:var(--d-sp-3);position:relative;padding-bottom:var(--d-sp-4)}',
'.d-timeline-item:last-child{padding-bottom:0}',
'.d-timeline-dot{display:flex;align-items:center;justify-content:center;width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:5px;z-index:1}',
'.d-timeline-dot-lg{width:24px;height:24px;margin-top:0}',
'.d-timeline-line{position:absolute;left:4px;top:15px;bottom:0;width:2px}',
'.d-timeline-item:last-child .d-timeline-line{display:none}',
'.d-timeline-content{flex:1;min-width:0}',
'.d-timeline-label{font-size:var(--d-text-xs);color:var(--d-muted);margin-bottom:var(--d-sp-1)}',
'.d-timeline-alternate .d-timeline-item:nth-child(even){flex-direction:row-reverse;text-align:right}',
'.d-kbd{display:inline-flex;align-items:center;justify-content:center;padding:0.125rem var(--d-sp-1-5);font-family:var(--d-font-mono);font-size:0.75em;line-height:1;border-radius:3px;white-space:nowrap;vertical-align:baseline}',
'.d-kbd-group{display:inline-flex;align-items:center;gap:var(--d-sp-1)}',
'.d-kbd-separator{font-size:0.75em;opacity:0.5}',
'.d-text{margin:0}',
'.d-text-secondary{color:var(--d-muted)}',
'.d-text-success{color:var(--d-success)}',
'.d-text-warning{color:var(--d-warning)}',
'.d-text-danger{color:var(--d-error)}',
'.d-text-disabled{opacity:0.5;cursor:not-allowed;user-select:none}',
'.d-text-mark{padding:0 0.125em}',
'.d-text-code{font-family:var(--d-font-mono);font-size:0.875em;padding:0.125em 0.375em;border-radius:3px}',
'.d-text-keyboard{font-family:var(--d-font-mono);font-size:0.875em}',
'.d-text-underline{text-decoration:underline}',
'.d-text-strikethrough{text-decoration:line-through}',
'.d-text-strong{font-weight:var(--d-fw-heading)}',
'.d-text-italic{font-style:italic}',
'.d-title{margin:0;font-weight:var(--d-fw-heading);letter-spacing:var(--d-ls-heading);line-height:var(--d-lh-tight)}',
'.d-title-1{font-size:var(--d-text-4xl)}',
'.d-title-2{font-size:var(--d-text-3xl)}',
'.d-title-3{font-size:var(--d-text-2xl)}',
'.d-title-4{font-size:var(--d-text-xl)}',
'.d-title-5{font-size:var(--d-text-lg)}',
'.d-paragraph{margin:0;font-size:var(--d-text-base);line-height:var(--d-lh-relaxed)}',
'.d-link{color:var(--d-primary);text-decoration:none;cursor:pointer}',
'.d-link:hover{text-decoration:underline}',
'.d-blockquote{margin:0;padding-left:var(--d-sp-4);font-style:italic;line-height:var(--d-lh-relaxed)}',
'.d-space{display:flex;gap:var(--d-sp-2)}',
'.d-space-vertical{flex-direction:column}',
'.d-space-wrap{flex-wrap:wrap}',
'.d-aspect{position:relative;width:100%}',
'.d-aspect>*{position:absolute;inset:0;width:100%;height:100%}',
'.d-resizable{display:flex;overflow:hidden;position:relative}',
'.d-resizable-vertical{flex-direction:column}',
'.d-resizable-panel{overflow:auto;min-width:0;min-height:0}',
'.d-resizable-handle{flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:col-resize;user-select:none;width:8px}',
'.d-resizable-handle-vertical{cursor:row-resize;height:8px;width:auto}',
'.d-resizable-handle-bar{width:4px;height:20px;border-radius:2px;opacity:0.3}',
'.d-resizable-handle-vertical .d-resizable-handle-bar{width:20px;height:4px}',
'.d-resizable-handle:hover .d-resizable-handle-bar{opacity:0.6}',
'.d-scrollarea{position:relative;overflow:hidden}',
'.d-scrollarea-viewport{width:100%;height:100%;overflow:auto;scrollbar-width:thin}',
'.d-scrollarea-viewport::-webkit-scrollbar{width:6px;height:6px}',
'.d-scrollarea-viewport::-webkit-scrollbar-thumb{border-radius:3px}',
'.d-watermark{position:relative}',
'.d-watermark-canvas{position:absolute;inset:0;pointer-events:none;z-index:10}',
'.d-tour-overlay{position:fixed;inset:0;z-index:var(--d-z-modal);pointer-events:none}',
'.d-tour-highlight{position:fixed;z-index:calc(var(--d-z-modal) + 1);box-shadow:0 0 0 9999px var(--d-overlay);border-radius:var(--d-radius);pointer-events:none}',
'.d-tour-popover{position:fixed;z-index:calc(var(--d-z-modal) + 2);min-width:280px;max-width:400px;padding:var(--d-sp-4);pointer-events:auto}',
'.d-tour-title{font-weight:var(--d-fw-title);font-size:var(--d-text-base);margin-bottom:var(--d-sp-2)}',
'.d-tour-desc{font-size:var(--d-text-sm);color:var(--d-muted);line-height:var(--d-lh-normal);margin-bottom:var(--d-sp-3)}',
'.d-tour-footer{display:flex;align-items:center;justify-content:space-between}',
'.d-tour-steps{font-size:var(--d-text-xs);color:var(--d-muted)}',
'.d-tour-actions{display:flex;gap:var(--d-sp-2)}',
'.d-float-btn{position:fixed;z-index:var(--d-z-sticky);display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;cursor:pointer;border:none;font-size:var(--d-text-xl);box-shadow:var(--d-elevation-2)}',
'.d-float-btn:focus-visible{outline:2px solid var(--d-ring);outline-offset:2px}',
'.d-float-btn-group{position:fixed;z-index:var(--d-z-sticky);display:flex;flex-direction:column-reverse;gap:var(--d-sp-2)}',
'.d-float-btn-group .d-float-btn{position:relative}',
'.d-float-btn-badge{position:absolute;top:-4px;right:-4px}',
'.d-option{padding:var(--d-sp-2) var(--d-sp-3);cursor:pointer;font-size:var(--d-text-base);outline:none}',
'.d-option:hover{background:var(--d-surface-1)}',
'.d-option-active{background:var(--d-surface-1)}',
'.d-option-disabled{opacity:0.5;cursor:not-allowed}',
'.d-option-selected{font-weight:var(--d-fw-medium,500)}',
'.d-disclosure-region{transition:height 0.25s ease-out;overflow:hidden}',
'.d-daterange{position:relative;display:inline-flex;flex-direction:column}',
'.d-daterange-panel{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);margin-top:var(--d-offset-dropdown);display:flex;gap:0}',
'.d-daterange-calendars{display:flex;gap:var(--d-sp-2)}',
'.d-daterange-calendar{padding:var(--d-sp-3);min-width:280px}',
'.d-daterange-presets{display:flex;flex-direction:column;gap:var(--d-sp-1);padding:var(--d-sp-3);border-right:1px solid var(--d-border);min-width:140px}',
'.d-daterange-preset{padding:var(--d-sp-1-5) var(--d-sp-2);cursor:pointer;font-size:var(--d-text-sm);border:none;background:none;font:inherit;text-align:left;border-radius:var(--d-radius);white-space:nowrap}',
'.d-daterange-preset:hover{background:var(--d-surface-1)}',
'.d-daterange-preset:focus-visible{outline:2px solid var(--d-ring);outline-offset:-2px}',
'.d-datepicker-day-in-range{background:var(--d-primary-subtle);border-radius:0}',
'.d-datepicker-day-range-start{border-radius:var(--d-radius) 0 0 var(--d-radius)}',
'.d-datepicker-day-range-end{border-radius:0 var(--d-radius) var(--d-radius) 0}',
'.d-timerange{position:relative;display:inline-flex;flex-direction:column}',
'.d-timerange-panel{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);margin-top:var(--d-offset-dropdown);display:flex;gap:0}',
'.d-timerange-section{display:flex;flex-direction:column;align-items:center}',
'.d-timerange-label{font-size:var(--d-text-xs);font-weight:var(--d-fw-medium,500);padding:var(--d-sp-1-5);color:var(--d-muted)}',
'.d-timerange-columns{display:flex;gap:0}',
'.d-timerange-divider{display:flex;align-items:center;padding:0 var(--d-sp-2);font-size:var(--d-text-sm);color:var(--d-muted)}',
'.d-timerange-error{font-size:var(--d-text-xs);color:var(--d-error);padding:var(--d-sp-1) var(--d-sp-2)}',
'.d-rangeslider{position:relative;display:flex;align-items:center;width:100%;height:32px;cursor:pointer;touch-action:none;user-select:none}',
'.d-rangeslider[data-disabled]{opacity:0.5;cursor:not-allowed;pointer-events:none}',
'.d-rangeslider-track{position:absolute;left:0;right:0;height:4px;border-radius:2px;background:var(--d-surface-1)}',
'.d-rangeslider-fill{position:absolute;height:4px;border-radius:2px;background:var(--d-primary)}',
'.d-rangeslider-thumb{position:absolute;width:16px;height:16px;border-radius:50%;background:var(--d-primary);transform:translate(-50%,-50%);top:50%;cursor:grab;outline:none;z-index:1}',
'.d-rangeslider-thumb:focus-visible{outline:2px solid var(--d-ring);outline-offset:2px}',
'.d-rangeslider-thumb:active{cursor:grabbing}',
'.d-rangeslider-tooltip{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:var(--d-offset-tooltip);font-size:var(--d-text-xs);white-space:nowrap;padding:var(--d-sp-1);border-radius:var(--d-radius);pointer-events:none}',
'.d-treeselect{position:relative;display:inline-flex;flex-direction:column}',
'.d-treeselect-trigger{display:flex;align-items:center;padding:var(--d-sp-2) var(--d-sp-3)}',
'.d-treeselect-display{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'.d-treeselect-panel{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);margin-top:var(--d-offset-dropdown);min-width:240px;max-height:var(--d-panel-max-h);overflow:auto}',
'.d-treeselect-panel .d-tree{padding:var(--d-sp-1) 0}',
'.d-treeselect-panel .d-tree-node-content{padding:var(--d-sp-1) var(--d-sp-2)}',
'.d-treeselect-search{display:block;width:100%;border:none;background:transparent;outline:none;font:inherit;padding:var(--d-sp-2) var(--d-sp-3);border-bottom:1px solid var(--d-border)}',
'.d-treeselect-tags{display:flex;flex-wrap:wrap;gap:var(--d-sp-1);padding:var(--d-sp-1) var(--d-sp-2)}',
'.d-treeselect-tag{display:inline-flex;align-items:center;gap:var(--d-sp-1);font-size:var(--d-text-xs);padding:var(--d-sp-1) var(--d-sp-1-5);border-radius:var(--d-radius)}',
'.d-treeselect-tag-remove{cursor:pointer;background:none;border:none;padding:0;font-size:0.75em;opacity:0.6;line-height:1}',
'.d-treeselect-tag-remove:hover{opacity:1}',
'.d-navmenu-list{display:flex;align-items:center;gap:0;list-style:none;margin:0;padding:0}',
'.d-navmenu-trigger{position:relative}',
'.d-navmenu-link{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2) var(--d-sp-3);font-size:var(--d-text-sm);text-decoration:none;cursor:pointer;border-radius:var(--d-radius);outline:none}',
'.d-navmenu-link:hover{background:var(--d-surface-1)}',
'.d-navmenu-link:focus-visible{outline:2px solid var(--d-ring);outline-offset:-2px}',
'.d-navmenu-link-desc{font-size:var(--d-text-xs);color:var(--d-muted);line-height:var(--d-lh-normal)}',
'.d-navmenu-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--d-sp-1)}',
'.d-splitter{display:flex;width:100%;height:100%;overflow:hidden}',
'.d-splitter-vertical{flex-direction:column}',
'.d-splitter-panel{overflow:auto;flex-shrink:0}',
'.d-splitter-handle{display:flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--d-surface-1);cursor:col-resize;user-select:none;touch-action:none}',
'.d-splitter-handle-h{width:4px;cursor:col-resize}',
'.d-splitter-handle-v{height:4px;cursor:row-resize}',
'.d-splitter-handle:hover{background:var(--d-primary-subtle)}',
'.d-splitter-handle:focus-visible{outline:2px solid var(--d-ring);outline-offset:-2px}',
'.d-splitter-handle-dot{width:4px;height:24px;border-radius:2px;background:var(--d-border-strong);pointer-events:none}',
'.d-splitter-handle-v .d-splitter-handle-dot{width:24px;height:4px}',
'.d-backtop{position:fixed;bottom:var(--d-sp-8);right:var(--d-sp-8);z-index:var(--d-z-sticky);display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;cursor:pointer;border:none;font-size:var(--d-text-lg);box-shadow:var(--d-elevation-2);transition:opacity var(--d-duration-fast,150ms) ease,transform var(--d-duration-fast,150ms) ease}',
'.d-backtop:focus-visible{outline:2px solid var(--d-ring);outline-offset:2px}',
'.d-backtop-hidden{opacity:0;pointer-events:none;transform:translateY(8px)}',
'.d-backtop-visible{opacity:1;pointer-events:auto;transform:translateY(0)}',
'd-route{display:block;view-transition-name:d-route;contain:layout}',
'.d-prose{font-size:var(--d-text-base);line-height:var(--d-lh-relaxed);color:var(--d-fg)}',
'.d-prose>*+*{margin-top:var(--d-sp-4)}',
'.d-prose>*:first-child{margin-top:0}',
'.d-prose h1{font-size:var(--d-text-4xl);font-weight:var(--d-fw-heading);line-height:var(--d-lh-tight);letter-spacing:var(--d-ls-heading);margin-top:var(--d-sp-12);margin-bottom:var(--d-sp-4)}',
'.d-prose h2{font-size:var(--d-text-3xl);font-weight:var(--d-fw-heading);line-height:var(--d-lh-tight);letter-spacing:var(--d-ls-heading);margin-top:var(--d-sp-10);margin-bottom:var(--d-sp-3)}',
'.d-prose h3{font-size:var(--d-text-2xl);font-weight:var(--d-fw-heading);line-height:var(--d-lh-snug);letter-spacing:var(--d-ls-heading);margin-top:var(--d-sp-8);margin-bottom:var(--d-sp-3)}',
'.d-prose h4{font-size:var(--d-text-xl);font-weight:var(--d-fw-title);line-height:var(--d-lh-snug);margin-top:var(--d-sp-6);margin-bottom:var(--d-sp-2)}',
'.d-prose p{margin:0}',
'.d-prose ul,.d-prose ol{padding-left:var(--d-sp-6);margin:0}',
'.d-prose li{margin-top:var(--d-sp-1)}',
'.d-prose li>p{margin:0}',
'.d-prose blockquote{border-left:3px solid var(--d-primary);padding-left:var(--d-sp-4);margin-left:0;margin-right:0;font-style:italic;color:var(--d-muted-fg)}',
'.d-prose pre{padding:var(--d-sp-4);overflow-x:auto;font-family:var(--d-font-mono);font-size:var(--d-text-sm);line-height:var(--d-lh-normal);border-radius:var(--d-radius)}',
'.d-prose code{font-family:var(--d-font-mono);font-size:0.9em;padding:var(--d-sp-1) var(--d-sp-1-5);border-radius:var(--d-radius-sm,4px)}',
'.d-prose pre code{padding:0;border-radius:0;font-size:inherit}',
'.d-prose img{max-width:100%;height:auto;border-radius:var(--d-radius)}',
'.d-prose hr{border:none;height:1px;background:var(--d-border);margin:var(--d-sp-8) 0}',
'.d-prose a{color:var(--d-primary);text-decoration:underline}',
'.d-prose a:hover{color:var(--d-primary-hover)}',
'.d-prose table{width:100%;border-collapse:collapse}',
'.d-prose th,.d-prose td{padding:var(--d-sp-2) var(--d-sp-3);text-align:left;border-bottom:1px solid var(--d-border)}',
'.d-prose th{font-weight:var(--d-fw-title)}',
'.d-spacey-1>*+*{margin-top:0.25rem}','.d-spacey-2>*+*{margin-top:0.5rem}','.d-spacey-3>*+*{margin-top:0.75rem}',
'.d-spacey-4>*+*{margin-top:1rem}','.d-spacey-5>*+*{margin-top:1.25rem}','.d-spacey-6>*+*{margin-top:1.5rem}',
'.d-spacey-8>*+*{margin-top:2rem}','.d-spacey-10>*+*{margin-top:2.5rem}','.d-spacey-12>*+*{margin-top:3rem}',
'.d-spacey-14>*+*{margin-top:3.5rem}','.d-spacey-16>*+*{margin-top:4rem}','.d-spacey-20>*+*{margin-top:5rem}',
'.d-spacey-24>*+*{margin-top:6rem}',
'.d-spacex-1>*+*{margin-left:0.25rem}','.d-spacex-2>*+*{margin-left:0.5rem}','.d-spacex-3>*+*{margin-left:0.75rem}',
'.d-spacex-4>*+*{margin-left:1rem}','.d-spacex-5>*+*{margin-left:1.25rem}','.d-spacex-6>*+*{margin-left:1.5rem}',
'.d-spacex-8>*+*{margin-left:2rem}','.d-spacex-10>*+*{margin-left:2.5rem}','.d-spacex-12>*+*{margin-left:3rem}',
'.d-spacex-14>*+*{margin-left:3.5rem}','.d-spacex-16>*+*{margin-left:4rem}','.d-spacex-20>*+*{margin-left:5rem}',
'.d-spacex-24>*+*{margin-left:6rem}',
'.d-dividey>*+*{border-top:1px solid var(--d-border)}',
'.d-dividex>*+*{border-left:1px solid var(--d-border)}',
'.d-dividey-strong>*+*{border-top:1px solid var(--d-border-strong)}',
'.d-dividex-strong>*+*{border-left:1px solid var(--d-border-strong)}',
'.d-banner{display:flex;align-items:center;gap:var(--d-sp-3);padding:var(--d-sp-2-5) var(--d-sp-4);width:100%;font-size:var(--d-text-sm);line-height:var(--d-lh-normal)}',
'.d-banner-sticky-top{position:sticky;top:0;z-index:var(--d-z-sticky)}',
'.d-banner-sticky-bottom{position:sticky;bottom:0;z-index:var(--d-z-sticky)}',
'.d-banner-icon{flex-shrink:0;font-size:var(--d-text-md)}',
'.d-banner-body{flex:1;min-width:0}',
'.d-banner-action{flex-shrink:0}',
'.d-banner-dismiss{background:none;border:none;cursor:pointer;padding:var(--d-sp-1);font-size:var(--d-text-lg);line-height:1;opacity:0.6;flex-shrink:0}',
'.d-banner-dismiss:hover{opacity:1}',
'.d-banner-dismiss:focus-visible{outline:2px solid var(--d-ring);outline-offset:2px}',
'.d-masked-input{font-family:var(--d-font-mono);letter-spacing:0.05em}',
'.d-codeblock{position:relative;border-radius:var(--d-radius);overflow:hidden}',
'.d-codeblock-header{display:flex;align-items:center;justify-content:space-between;padding:var(--d-sp-2) var(--d-sp-3);font-size:var(--d-text-xs);gap:var(--d-sp-2)}',
'.d-codeblock-lang{opacity:0.6;text-transform:uppercase;font-weight:var(--d-fw-medium,500);letter-spacing:0.05em}',
'.d-codeblock-copy{background:none;border:none;cursor:pointer;font:inherit;font-size:var(--d-text-xs);padding:var(--d-sp-1) var(--d-sp-2);border-radius:var(--d-radius);opacity:0.6}',
'.d-codeblock-copy:hover{opacity:1}',
'.d-codeblock-copy:focus-visible{outline:2px solid var(--d-ring);outline-offset:2px}',
'.d-codeblock-pre{margin:0;padding:var(--d-sp-4);overflow-x:auto;font-family:var(--d-font-mono);font-size:var(--d-text-sm);line-height:var(--d-lh-normal);display:flex;gap:var(--d-sp-4)}',
'.d-codeblock-gutter{display:flex;flex-direction:column;text-align:right;user-select:none;opacity:0.35;flex-shrink:0;min-width:2ch}',
'.d-codeblock-ln{display:block}',
'.d-codeblock-code{flex:1;min-width:0;white-space:pre;tab-size:2}',
'.d-sortable{display:flex;flex-direction:column;gap:0;position:relative}',
'.d-sortable-h{flex-direction:row}',
'.d-sortable-item{position:relative;transition:transform var(--d-duration-fast,150ms) var(--d-easing-standard,ease)}',
'.d-sortable-dragging{opacity:0.5;z-index:1}',
'.d-sortable-handle{cursor:grab;display:inline-flex;align-items:center;justify-content:center;padding:var(--d-sp-1);font-size:var(--d-text-lg);opacity:0.35;user-select:none;touch-action:none}',
'.d-sortable-handle:hover{opacity:0.7}',
'.d-sortable-handle:active{cursor:grabbing}',
'.d-sortable-indicator{height:2px;background:var(--d-primary);border-radius:1px;flex-shrink:0}',
'.d-sortable-h .d-sortable-indicator{width:2px;height:auto}',
'.d-sortable-active .d-sortable-item{transition:none}',
'.d-datetimepicker{position:relative;display:inline-flex;flex-direction:column}',
'.d-datetimepicker-panel{position:absolute;top:100%;left:0;z-index:var(--d-z-dropdown);margin-top:var(--d-offset-dropdown);display:flex;flex-direction:column;min-width:280px}',
'.d-datetimepicker-date{padding:var(--d-sp-3)}',
'.d-datetimepicker-time{padding:var(--d-sp-2) var(--d-sp-3);border-top:1px solid var(--d-border);display:flex;flex-direction:column;gap:var(--d-sp-2)}',
'.d-datetimepicker-time-label{font-size:var(--d-text-xs);font-weight:var(--d-fw-medium,500);color:var(--d-muted)}',
'.d-datetimepicker-time-row{display:flex;align-items:center;gap:var(--d-sp-1)}',
'.d-datetimepicker-spinner{width:3rem;text-align:center;font-family:var(--d-font-mono);font-size:var(--d-text-sm);padding:var(--d-sp-1);border:1px solid var(--d-border);border-radius:var(--d-radius);background:transparent;color:inherit;outline:none}',
'.d-datetimepicker-spinner:focus-visible{outline:2px solid var(--d-ring);outline-offset:-1px}',
'.d-datetimepicker-sep{font-size:var(--d-text-sm);color:var(--d-muted);font-weight:var(--d-fw-medium,500)}',
'.d-datetimepicker-ampm{font-size:var(--d-text-xs);padding:var(--d-sp-1) var(--d-sp-2);border:1px solid var(--d-border);border-radius:var(--d-radius);background:transparent;color:inherit;cursor:pointer;font-weight:var(--d-fw-medium,500)}',
'.d-datetimepicker-ampm:hover{background:var(--d-surface-1)}',
'.d-datetimepicker-now{font-size:var(--d-text-xs);color:var(--d-primary);background:none;border:none;cursor:pointer;padding:0;font:inherit;text-align:left}',
'.d-datetimepicker-now:hover{text-decoration:underline}',
'.d-datetimepicker-footer{display:flex;justify-content:flex-end;padding:var(--d-sp-2) var(--d-sp-3);border-top:1px solid var(--d-border)}',
'@media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}}'
].join('');function injectBase(){if(injected)return;if(typeof document==='undefined')return;injected=true;let el=document.querySelector('[data-decantr-base]');if(!el){el=document.createElement('style');el.setAttribute('data-decantr-base','');document.head.appendChild(el)}
el.textContent=`@layer d.base{${BASE_CSS}}`}
function cx(...classes){return classes.filter(Boolean).join(' ')}
function reactiveAttr(el,prop,attr){if(typeof prop==='function'){createEffect(()=>{prop()?el.setAttribute(attr,''):el.removeAttribute(attr)})}else if(prop){el.setAttribute(attr,'')}}
function reactiveClass(el,prop,baseClass,activeClass){if(typeof prop==='function'){createEffect(()=>{el.className=prop()?cx(baseClass,activeClass):baseClass})}else if(prop){el.className=cx(baseClass,activeClass)}}
function reactiveProp(el,prop,domProp){if(typeof prop==='function'){createEffect(()=>{el[domProp]=prop()})}else if(prop!==undefined){el[domProp]=prop}}
function resolve(prop){return typeof prop==='function'?prop():prop}
return{injectBase,cx,reactiveAttr,reactiveClass,reactiveProp,resolve}})();const _m149=(function(){const ESSENTIAL={'calendar':'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>','clock':'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>','shield':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>','code':'<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'};return{ESSENTIAL}})();const _m55=(function(){const{ESSENTIAL}=_m149;const icons=new Map(Object.entries(ESSENTIAL));function getIconPath(name){return icons.get(name)||null}
function registerIcon(name,pathData){icons.set(name,pathData)}
function registerIcons(iconMap){for(const[k,v]of Object.entries(iconMap)){icons.set(k,v)}}
return{getIconPath,registerIcon,registerIcons}})();const _m54=(function(){const{h}=_m2;const{getIconPath}=_m55;let styleEl=null;const injectedIcons=new Set();function ensureStyleEl(){if(styleEl)return styleEl;if(typeof document==='undefined')return null;styleEl=document.querySelector('style[data-decantr-icons]');if(!styleEl){styleEl=document.createElement('style');styleEl.setAttribute('data-decantr-icons','');document.head.appendChild(styleEl)}
return styleEl}
function buildDataUri(inner){return`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg'width='24'height='24'viewBox='0 0 24 24'fill='none'stroke='black'stroke-width='2'stroke-linecap='round'stroke-linejoin='round'>${inner}</svg>`)}")`}
function injectIconCSS(name,inner){if(injectedIcons.has(name))return;injectedIcons.add(name);const el=ensureStyleEl();if(!el)return;const uri=buildDataUri(inner);const sel=typeof CSS!=='undefined'&&CSS.escape?CSS.escape(`d-i-${name}`):`d-i-${name}`;el.textContent+=`.${sel}{-webkit-mask-image:${uri};mask-image:${uri}}`}
function icon(name,opts={}){const{size='1.25em',class:cls,...rest}=opts;const className=cls?`d-i d-i-${name} ${cls}`:`d-i d-i-${name}`;const el=h('span',{class:className,
role:'img',
'aria-hidden':'true',
style:{width:size,height:size},
...rest});const inner=getIconPath(name);if(inner){injectIconCSS(name,inner)}
return el}
return{icon}})();const _m26=(function(){const{injectBase,cx}=_m147;const{icon}=_m54;const SIZES={xs:12,sm:16,default:20,lg:28,xl:36};const SIZE_CLS={xs:'d-spinner-xs',sm:'d-spinner-sm',lg:'d-spinner-lg',xl:'d-spinner-xl'};const NS='http://www.w3.org/2000/svg';function createRingSVG(px,label){const svg=document.createElementNS(NS,'svg');svg.setAttribute('width',String(px));svg.setAttribute('height',String(px));svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('role','status');svg.setAttribute('aria-label',label);const track=document.createElementNS(NS,'circle');track.setAttribute('cx','12');track.setAttribute('cy','12');track.setAttribute('r','10');track.setAttribute('stroke','currentColor');track.setAttribute('stroke-opacity','0.2');track.setAttribute('stroke-width','3');svg.appendChild(track);const arc=document.createElementNS(NS,'circle');arc.setAttribute('cx','12');arc.setAttribute('cy','12');arc.setAttribute('r','10');arc.setAttribute('stroke','currentColor');arc.setAttribute('stroke-width','3');arc.setAttribute('stroke-linecap','round');arc.setAttribute('stroke-dasharray','15.7 47.1');arc.setAttribute('class','d-spinner-arc');svg.appendChild(arc);return svg}
function createDots(px){const el=document.createElement('span');el.className='d-spinner-dots';el.style.width=px+'px';el.style.height=px+'px';for(let i=0;i<3;i++)el.appendChild(document.createElement('span'));return el}
function createPulse(px){const el=document.createElement('span');el.className='d-spinner-pulse';el.style.width=px+'px';el.style.height=px+'px';el.appendChild(document.createElement('span'));return el}
function createBars(px){const el=document.createElement('span');el.className='d-spinner-bars';el.style.width=px+'px';el.style.height=px+'px';for(let i=0;i<4;i++)el.appendChild(document.createElement('span'));return el}
function createOrbit(px){const el=document.createElement('span');el.className='d-spinner-orbit';el.style.width=px+'px';el.style.height=px+'px';for(let i=0;i<2;i++)el.appendChild(document.createElement('span'));return el}
function Spinner(props={}){injectBase();const{variant='ring',size='default',icon:iconName,label='Loading',class:cls,...rest}=props;const px=SIZES[size]||SIZES.default;let inner;if(iconName){inner=document.createElement('span');inner.className=cx('d-spinner-hybrid',SIZE_CLS[size]);inner.style.width=px+'px';inner.style.height=px+'px';inner.appendChild(createRingSVG(px,label));const centerIcon=icon(iconName,{size:Math.round(px*0.45)+'px'});inner.appendChild(centerIcon)}else{switch(variant){case'dots':inner=createDots(px);break;case'pulse':inner=createPulse(px);break;case'bars':inner=createBars(px);break;case'orbit':inner=createOrbit(px);break;default:inner=createRingSVG(px,label);break}}
const className=cx('d-spinner',SIZE_CLS[size],cls);const srText=document.createElement('span');srText.className='d-sr-only';srText.textContent=label;const wrap=document.createElement('span');wrap.className=cx('d-spinner-wrap',cls);wrap.setAttribute('role','status');wrap.setAttribute('aria-label',label);for(const[k,v]of Object.entries(rest)){wrap.setAttribute(k,v)}
wrap.appendChild(inner);wrap.appendChild(srText);return wrap}
return{Spinner}})();const _m25=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx,reactiveAttr}=_m147;const{Spinner}=_m26;const{renderIcon:icon}=_m54;const SPINNER_SIZE={xs:'xs',sm:'xs',default:'sm',lg:'default',
icon:'sm','icon-xs':'xs','icon-sm':'xs','icon-lg':'sm'};function buttonVariants({variant='default',size='default'}={}){return cx('d-btn',`d-btn-${variant}`,size!=='default'&&`d-btn-${size}`)}
function Button(props={},...children){injectBase();const{variant,size,disabled,loading,block,rounded,iconLeft,iconRight,class:cls,onclick,type,...rest}=props;const variantCls=buttonVariants({variant,size});const className=cx(
variantCls,
block&&'d-btn-block',
rounded&&'d-btn-rounded',
cls
);const btnProps={class:className,type:type||'button',...rest};if(onclick)btnProps.onclick=onclick;const leftIcon=iconLeft?(typeof iconLeft==='string'?renderIcon(iconLeft,{size:'1em'}):iconLeft):null;const rightIcon=iconRight?(typeof iconRight==='string'?renderIcon(iconRight,{size:'1em'}):iconRight):null;const allChildren=[];if(leftIcon)allChildren.push(leftIcon);allChildren.push(...children);if(rightIcon)allChildren.push(rightIcon);const el=h('button',btnProps,...allChildren);reactiveAttr(el,disabled,'disabled');const resolvedSize=size||'default';if(typeof loading==='function'){createEffect(()=>{const v=loading();if(v){el.className=cx(className,'d-btn-loading');el.setAttribute('disabled','');_addSpinner(el,resolvedSize)}else{el.className=className;_removeSpinner(el);if(typeof disabled==='function'?!disabled():!disabled){el.removeAttribute('disabled')}}})}else if(loading){el.className=cx(className,'d-btn-loading');el.setAttribute('disabled','');_addSpinner(el,resolvedSize)}
return el}
function _addSpinner(el,size){if(el.querySelector('.d-btn-spinner'))return;const overlay=document.createElement('span');overlay.className='d-btn-spinner';overlay.appendChild(Spinner({size:SPINNER_SIZE[size]||'sm'}));el.appendChild(overlay)}
function _removeSpinner(el){const overlay=el.querySelector('.d-btn-spinner');if(overlay)overlay.remove()}
Button.Group=function Group(props={},...children){injectBase();const{class:cls,...rest}=props;return h('div',{class:cx('d-btn-group',cls),role:'group',...rest},...children)};return{buttonVariants,Button}})();const _m27=(function(){const{h}=_m2;const{injectBase,cx,reactiveAttr,reactiveClass,reactiveProp}=_m147;function Input(props={}){injectBase();const{type='text',placeholder,value,disabled,readonly,
prefix,suffix,error,oninput,ref,class:cls}=props;const wrapClass=cx('d-input-wrap',cls);const inputProps={class:'d-input',type};if(placeholder)inputProps.placeholder=placeholder;if(readonly)inputProps.readonly='';if(oninput)inputProps.oninput=oninput;const inputEl=h('input',inputProps);if(ref)ref(inputEl);reactiveProp(inputEl,value,'value');reactiveAttr(inputEl,disabled,'disabled');const children=[];if(prefix){const prefixEl=typeof prefix==='string'
?h('span',{class:'d-input-prefix'},prefix)
:h('span',{class:'d-input-prefix'},prefix);children.push(prefixEl)}
children.push(inputEl);if(suffix){const suffixEl=typeof suffix==='string'
?h('span',{class:'d-input-suffix'},suffix)
:h('span',{class:'d-input-suffix'},suffix);children.push(suffixEl)}
const wrap=h('div',{class:wrapClass},...children);reactiveClass(wrap,error,wrapClass,'d-input-error');return wrap}
return{Input}})();const _m28=(function(){const{h}=_m2;const{injectBase,cx,reactiveAttr,reactiveClass,reactiveProp}=_m147;function Textarea(props={}){injectBase();const{placeholder,value,disabled,error,rows=3,
resize='vertical',oninput,ref,class:cls}=props;const wrapClass=cx('d-textarea-wrap',cls);const textareaProps={class:'d-textarea',rows};if(placeholder)textareaProps.placeholder=placeholder;if(oninput)textareaProps.oninput=oninput;const textareaEl=h('textarea',textareaProps);textareaEl.style.resize=resize;if(ref)ref(textareaEl);reactiveProp(textareaEl,value,'value');reactiveAttr(textareaEl,disabled,'disabled');const wrap=h('div',{class:wrapClass},textareaEl);reactiveClass(wrap,error,wrapClass,'d-textarea-error');return wrap}
return{Textarea}})();const _m29=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx,reactiveAttr}=_m147;function Checkbox(props={}){injectBase();const{checked,disabled,label,indeterminate,onchange,class:cls}=props;const input=h('input',{type:'checkbox',class:'d-checkbox-native'});const check=h('span',{class:'d-checkbox-check'});const wrapper=h('label',{class:cx('d-checkbox',cls)},input,check);if(label){wrapper.appendChild(h('span',{class:'d-checkbox-label'},label))}
if(indeterminate)input.indeterminate=true;if(onchange){input.addEventListener('change',()=>onchange(input.checked))}
if(typeof checked==='function'){createEffect(()=>{input.checked=checked()})}else if(checked){input.checked=true}
reactiveAttr(input,disabled,'disabled');return wrapper}
return{Checkbox}})();const _m30=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx,reactiveAttr}=_m147;function Switch(props={}){injectBase();const{checked,disabled,label,size,onchange,class:cls}=props;const input=h('input',{type:'checkbox',class:'d-switch-native',role:'switch'});const track=h('span',{class:'d-switch-track'},
h('span',{class:'d-switch-thumb'})
);const wrapper=h('label',{class:cx('d-switch',size&&`d-switch-${size}`,cls)},input,track);if(label){wrapper.appendChild(h('span',{class:'d-switch-label'},label))}
if(onchange){input.addEventListener('change',()=>onchange(input.checked))}
if(typeof checked==='function'){createEffect(()=>{input.checked=checked()})}else if(checked){input.checked=true}
reactiveAttr(input,disabled,'disabled');return wrapper}
return{Switch}})();const _m148=(function(){const{createEffect,createSignal}=_m14;const{h}=_m2;const{icon}=_m54;function caret(direction='down',opts={}){const cls=opts.class?`d-caret ${opts.class}`:'d-caret';return icon(`chevron-${direction}`,{size:'1em',...opts,class:cls})}
function createOverlay(triggerEl,contentEl,opts={}){const{trigger='click',
closeOnEscape=true,
closeOnOutside=true,
hoverDelay=200,
hoverCloseDelay=150,
onOpen,
onClose,
usePopover=false,}=opts;let _open=false;let _hoverTimer=null;let _closeTimer=null;const _cleanups=[];function isOpen(){return _open}
function open(){if(_open)return;_open=true;if(usePopover&&contentEl.showPopover){contentEl.showPopover()}else{contentEl.style.display=''}
triggerEl.setAttribute('aria-expanded','true');if(onOpen)onOpen()}
function close(){if(!_open)return;_open=false;if(usePopover&&contentEl.hidePopover){try{contentEl.hidePopover()}catch(_){}}else{contentEl.style.display='none'}
triggerEl.setAttribute('aria-expanded','false');if(onClose)onClose()}
function toggle(){_open?close():open()}
if(trigger==='click'){const onClick=(e)=>{e.stopPropagation();toggle()};triggerEl.addEventListener('click',onClick);_cleanups.push(()=>triggerEl.removeEventListener('click',onClick))}
if(trigger==='hover'){const onEnter=()=>{clearTimeout(_closeTimer);_hoverTimer=setTimeout(open,hoverDelay)};const onLeave=()=>{clearTimeout(_hoverTimer);_closeTimer=setTimeout(close,hoverCloseDelay)};triggerEl.addEventListener('mouseenter',onEnter);triggerEl.addEventListener('mouseleave',onLeave);contentEl.addEventListener('mouseenter',()=>clearTimeout(_closeTimer));contentEl.addEventListener('mouseleave',onLeave);_cleanups.push(
()=>triggerEl.removeEventListener('mouseenter',onEnter),
()=>triggerEl.removeEventListener('mouseleave',onLeave)
)}
if(closeOnEscape){const onKey=(e)=>{if(e.key==='Escape'&&_open){close();triggerEl.focus()}};document.addEventListener('keydown',onKey,true);_cleanups.push(()=>document.removeEventListener('keydown',onKey,true))}
if(closeOnOutside&&trigger!=='hover'){const onDoc=(e)=>{if(_open&&!triggerEl.contains(e.target)&&!contentEl.contains(e.target))close()};document.addEventListener('mousedown',onDoc);_cleanups.push(()=>document.removeEventListener('mousedown',onDoc))}
if(usePopover){const onToggle=(e)=>{_open=e.newState==='open';triggerEl.setAttribute('aria-expanded',String(_open));if(!_open&&onClose)onClose()};contentEl.addEventListener('toggle',onToggle);_cleanups.push(()=>contentEl.removeEventListener('toggle',onToggle))}
if(!usePopover)contentEl.style.display='none';function destroy(){_cleanups.forEach(fn=>fn())}
return{open,close,toggle,isOpen,destroy}}
function createListbox(containerEl,opts={}){const{itemSelector='.d-option',
activeClass='d-option-active',
disabledSelector='.d-option-disabled',
loop=true,
orientation='vertical',
multiSelect=false,
typeAhead=false,
onSelect,
onHighlight,}=opts;let activeIndex=-1;let _typeBuffer='';let _typeTimer=null;function getItems(){return[...containerEl.querySelectorAll(itemSelector)]}
function getSelectableItems(){return getItems().filter(el=>!el.matches(disabledSelector))}
function highlight(index){const items=getItems();items.forEach((el,i)=>{el.classList.toggle(activeClass,i===index);el.setAttribute('aria-selected',i===index?'true':'false')});activeIndex=index;if(items[index])items[index].scrollIntoView?.({block:'nearest'});if(onHighlight&&items[index])onHighlight(items[index],index)}
function highlightNext(){const items=getItems();if(!items.length)return;let next=activeIndex+1; while(next<items.length&&items[next]?.matches(disabledSelector))next++;if(next>=items.length)next=loop?0:items.length-1;highlight(next)}
function highlightPrev(){const items=getItems();if(!items.length)return;let prev=activeIndex-1; while(prev>=0&&items[prev]?.matches(disabledSelector))prev--;if(prev<0)prev=loop?items.length-1:0;highlight(prev)}
function selectCurrent(){const items=getItems();if(activeIndex>=0&&items[activeIndex]&&!items[activeIndex].matches(disabledSelector)){if(onSelect)onSelect(items[activeIndex],activeIndex)}}
function handleTypeAhead(char){if(!typeAhead)return;clearTimeout(_typeTimer);_typeBuffer+=char.toLowerCase();_typeTimer=setTimeout(()=>{_typeBuffer=''},500);const items=getItems();const idx=items.findIndex(el=>
el.textContent.trim().toLowerCase().startsWith(_typeBuffer)&&!el.matches(disabledSelector)
);if(idx>=0)highlight(idx)}
const downKey=orientation==='vertical'?'ArrowDown':'ArrowRight';const upKey=orientation==='vertical'?'ArrowUp':'ArrowLeft';function handleKeydown(e){if(e.key===downKey){e.preventDefault();highlightNext()} else if(e.key===upKey){e.preventDefault();highlightPrev()} else if(e.key==='Home'){e.preventDefault();highlight(0)} else if(e.key==='End'){e.preventDefault();highlight(getItems().length-1)} else if(e.key==='Enter'||e.key===' '){e.preventDefault();selectCurrent()} else if(e.key.length===1&&typeAhead){handleTypeAhead(e.key)}}
containerEl.addEventListener('keydown',handleKeydown);function reset(){activeIndex=-1;highlight(-1)}
function getActiveIndex(){return activeIndex}
function destroy(){containerEl.removeEventListener('keydown',handleKeydown)}
return{highlight,highlightNext,highlightPrev,selectCurrent,getActiveIndex,reset,handleKeydown,destroy}}
function createDisclosure(triggerEl,contentEl,opts={}){const{defaultOpen=false,animate=true,onToggle}=opts;let _open=defaultOpen;const region=contentEl.parentElement?.classList.contains('d-disclosure-region')
?contentEl.parentElement
:contentEl;function syncState(){triggerEl.setAttribute('aria-expanded',String(_open));if(_open){if(animate&&region!==contentEl){region.style.height='0';region.style.overflow='hidden';region.style.display='';const h=contentEl.scrollHeight;region.style.height=h+'px';const onEnd=()=>{region.style.height='auto';region.style.overflow='';region.removeEventListener('transitionend',onEnd)};region.addEventListener('transitionend',onEnd)}else{region.style.display='';region.style.height='auto'}}else{if(animate&&region!==contentEl){region.style.height=region.scrollHeight+'px';region.offsetHeight;region.style.overflow='hidden';region.style.height='0';const onEnd=()=>{region.style.display='none';region.removeEventListener('transitionend',onEnd)};region.addEventListener('transitionend',onEnd)}else{region.style.display='none'}}
if(onToggle)onToggle(_open)}
function open(){_open=true;syncState()}
function close(){_open=false;syncState()}
function toggle(){_open=!_open;syncState()}
function isOpen(){return _open}
triggerEl.addEventListener('click',toggle);triggerEl.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});if(!_open){region.style.display='none';region.style.height='0'}
triggerEl.setAttribute('aria-expanded',String(_open));return{open,close,toggle,isOpen}}
function createRovingTabindex(containerEl,opts={}){const{itemSelector='[role="tab"]',
orientation='horizontal',
loop=true,
onFocus,}=opts;let activeIdx=0;function getItems(){return[...containerEl.querySelectorAll(itemSelector)]}
function setActive(index){const items=getItems();items.forEach((el,i)=>{el.setAttribute('tabindex',i===index?'0':'-1')});activeIdx=index}
function focus(index){const items=getItems();if(index<0||index>=items.length)return;setActive(index);items[index].focus();if(onFocus)onFocus(items[index],index)}
function move(delta){const items=getItems();if(!items.length)return;let next=activeIdx+delta;if(loop){next=(next+items.length)%items.length}else{next=Math.max(0,Math.min(next,items.length-1))}
focus(next)}
const hKeys={next:'ArrowRight',prev:'ArrowLeft'};const vKeys={next:'ArrowDown',prev:'ArrowUp'};function onKeydown(e){const horiz=orientation==='horizontal'||orientation==='both';const vert=orientation==='vertical'||orientation==='both';if(horiz&&e.key===hKeys.next){e.preventDefault();move(1)} else if(horiz&&e.key===hKeys.prev){e.preventDefault();move(-1)} else if(vert&&e.key===vKeys.next){e.preventDefault();move(1)} else if(vert&&e.key===vKeys.prev){e.preventDefault();move(-1)} else if(e.key==='Home'){e.preventDefault();focus(0)} else if(e.key==='End'){e.preventDefault();focus(getItems().length-1)}}
containerEl.addEventListener('keydown',onKeydown);setActive(activeIdx);function destroy(){containerEl.removeEventListener('keydown',onKeydown)}
function getActive(){return activeIdx}
return{focus,setActive,getActive,destroy}}
function createFocusTrap(containerEl){const FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';let _active=false;function getFocusable(){return[...containerEl.querySelectorAll(FOCUSABLE)].filter(el=>el.offsetParent!==null)}
function onKeydown(e){if(!_active||e.key!=='Tab')return;const focusable=getFocusable();if(!focusable.length)return;const first=focusable[0];const last=focusable[focusable.length-1];if(e.shiftKey){if(document.activeElement===first){e.preventDefault();last.focus()}}else{if(document.activeElement===last){e.preventDefault();first.focus()}}}
function activate(){_active=true;containerEl.addEventListener('keydown',onKeydown);const first=getFocusable()[0];if(first)requestAnimationFrame(()=>first.focus())}
function deactivate(){_active=false;containerEl.removeEventListener('keydown',onKeydown)}
return{activate,deactivate}}
function createFormField(controlEl,opts={}){const{label,error,help,required,class:cls}=opts;const id=controlEl.id||`d-field-${_fieldId++}`;controlEl.id=id;const wrapper=h('div',{class:cls?`d-field ${cls}`:'d-field'});if(label){const labelEl=h('label',{class:'d-field-label',for:id});labelEl.textContent=label;if(required){labelEl.appendChild(h('span',{class:'d-field-required','aria-hidden':'true'},' *'))}
wrapper.appendChild(labelEl)}
wrapper.appendChild(controlEl);if(help){const helpId=`${id}-help`;const helpEl=h('div',{class:'d-field-help',id:helpId},help);controlEl.setAttribute('aria-describedby',helpId);wrapper.appendChild(helpEl)}
if(error){const errId=`${id}-error`;const errEl=h('div',{class:'d-field-error',id:errId,role:'alert'});wrapper.appendChild(errEl);if(typeof error==='function'){createEffect(()=>{const msg=error();errEl.textContent=msg||'';errEl.style.display=msg?'':'none';controlEl.setAttribute('aria-invalid',msg?'true':'false');if(msg)controlEl.setAttribute('aria-errormessage',errId); else controlEl.removeAttribute('aria-errormessage')})}else{errEl.textContent=error;controlEl.setAttribute('aria-invalid','true');controlEl.setAttribute('aria-errormessage',errId)}}
return wrapper}
let _fieldId=0;function createDrag(el,opts){const{onMove,onStart,onEnd}=opts;let startX,startY;function onPointerDown(e){if(e.button!==0)return;startX=e.clientX;startY=e.clientY;e.preventDefault();if(onStart)onStart(startX,startY,e);document.addEventListener('pointermove',onPointerMove);document.addEventListener('pointerup',onPointerUp)}
function onPointerMove(e){onMove(e.clientX,e.clientY,e.clientX-startX,e.clientY-startY,e)}
function onPointerUp(e){document.removeEventListener('pointermove',onPointerMove);document.removeEventListener('pointerup',onPointerUp);if(onEnd)onEnd(e.clientX,e.clientY,e)}
el.addEventListener('pointerdown',onPointerDown);return{destroy:()=>el.removeEventListener('pointerdown',onPointerDown)}}
return{caret,createOverlay,createListbox,createDisclosure,createRovingTabindex,createFocusTrap,createFormField,createDrag}})();const _m31=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx,reactiveAttr,reactiveClass}=_m147;const{caret}=_m148;function Select(props={}){injectBase();const{options=[],value,placeholder,disabled,error,size,onchange,class:cls}=props;let open=false;let activeIndex=-1;let currentValue=typeof value==='function'?value():(value||'');const wrapClass=cx('d-select-wrap',size&&`d-select-${size}`,cls);const display=h('span',{class:'d-select-display'});const arrow=caret('down',{class:'d-select-arrow'});const trigger=h('button',{type:'button',
class:'d-select',
role:'combobox',
'aria-expanded':'false',
'aria-haspopup':'listbox'},display,arrow);const dropdown=h('div',{class:'d-select-dropdown',role:'listbox'});dropdown.style.display='none';const wrap=h('div',{class:wrapClass},trigger,dropdown);function updateDisplay(){const opt=options.find(o=>o.value===currentValue);display.textContent=opt?opt.label:(placeholder||'');if(!opt&&placeholder)display.classList.add('d-select-placeholder'); else display.classList.remove('d-select-placeholder')}
function renderOptions(){dropdown.replaceChildren();options.forEach((opt,i)=>{const el=h('div',{class:cx('d-select-option',opt.value===currentValue&&'d-select-option-active',opt.disabled&&'d-select-option-disabled'),
role:'option',
'aria-selected':opt.value===currentValue?'true':'false'},opt.label);if(!opt.disabled){el.addEventListener('mousedown',(e)=>{e.preventDefault();e.stopPropagation();selectOption(opt.value)})}
dropdown.appendChild(el)})}
function selectOption(val){currentValue=val;updateDisplay();closeDropdown();if(onchange)onchange(val)}
function openDropdown(){if(open)return;open=true;activeIndex=options.findIndex(o=>o.value===currentValue);renderOptions();dropdown.style.display='';trigger.setAttribute('aria-expanded','true');wrap.classList.add('d-select-open')}
function closeDropdown(){if(!open)return;open=false;dropdown.style.display='none';trigger.setAttribute('aria-expanded','false');wrap.classList.remove('d-select-open')}
trigger.addEventListener('mousedown',(e)=>{e.preventDefault();if(open)closeDropdown(); else openDropdown()});trigger.addEventListener('keydown',(e)=>{if(e.key==='ArrowDown'){e.preventDefault();if(!open)openDropdown();activeIndex=Math.min(activeIndex+1,options.length-1);highlightOption()}else if(e.key==='ArrowUp'){e.preventDefault();if(!open)openDropdown();activeIndex=Math.max(activeIndex-1,0);highlightOption()}else if(e.key==='Enter'||e.key===' '){e.preventDefault();if(open&&activeIndex>=0&&!options[activeIndex].disabled){selectOption(options[activeIndex].value)}else if(!open){openDropdown()}}else if(e.key==='Escape'){closeDropdown()}});function highlightOption(){const items=dropdown.children;for(let i=0;i<items.length;i++){items[i].classList.toggle('d-select-option-highlight',i===activeIndex)}}
if(typeof document!=='undefined'){document.addEventListener('mousedown',(e)=>{if(open&&!wrap.contains(e.target))closeDropdown()})}
updateDisplay();if(typeof value==='function'){createEffect(()=>{currentValue=value();updateDisplay();if(open)renderOptions()})}
reactiveAttr(trigger,disabled,'disabled');reactiveClass(wrap,error,wrapClass,'d-select-error');return wrap}
return{Select}})();const _m32=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Card(props={},...children){injectBase();const{title,hoverable,class:cls}=props;const cardClass=cx('d-card',hoverable&&'d-card-hover',cls);const parts=[];if(title){parts.push(h('div',{class:'d-card-header'},title))}
const hasSection=children.some(c=>
c&&typeof c==='object'&&c.nodeType===1&&
(c.className||'').split(/\s+/).some(cls=>
cls==='d-card-header'||cls==='d-card-body'||cls==='d-card-footer'
)
);if(hasSection){parts.push(...children)}else if(children.length){parts.push(h('div',{class:'d-card-body'},...children))}
return h('div',{class:cardClass},...parts)}
Card.Header=function CardHeader(props={},...children){const{class:cls}=props;return h('div',{class:cx('d-card-header',cls)},...children)};Card.Body=function CardBody(props={},...children){const{class:cls}=props;return h('div',{class:cx('d-card-body',cls)},...children)};Card.Footer=function CardFooter(props={},...children){const{class:cls}=props;return h('div',{class:cx('d-card-footer',cls)},...children)};return{Card}})();const _m33=(function(){const{h,text}=_m2;const{injectBase,cx}=_m147;function Badge(props={},...children){injectBase();const{count,color,dot,status,variant,class:cls}=props;const resolvedStatus=status||variant;const statusColor=resolvedStatus==='success'?'var(--d-success)'
:resolvedStatus==='error'?'var(--d-error)'
:resolvedStatus==='warning'?'var(--d-warning)'
:resolvedStatus==='processing'?'var(--d-primary)'
:null;const bgColor=color||statusColor;if(dot){const dotEl=h('span',{class:cx('d-badge-dot',resolvedStatus==='processing'&&'d-badge-processing',cls)});if(bgColor)dotEl.style.background=bgColor;if(children.length){return h('span',{class:'d-badge-wrapper'},
...children,
h('span',{class:'d-badge-sup'},dotEl)
)}
return dotEl}
const badgeClass=cx('d-badge',resolvedStatus==='processing'&&'d-badge-processing',cls);const badgeEl=h('span',{class:badgeClass});if(bgColor)badgeEl.style.background=bgColor;if(typeof count==='function'){badgeEl.appendChild(text(()=>String(count())))}else if(count!==undefined){badgeEl.appendChild(document.createTextNode(String(count)))}
if(children.length){return h('span',{class:'d-badge-wrapper'},
...children,
h('span',{class:'d-badge-sup'},badgeEl)
)}
return badgeEl}
return{Badge}})();const _m34=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const MODAL_SECTIONS=['d-modal-header','d-modal-body','d-modal-footer'];function hasSection(children){return children.some(c=>
c&&typeof c==='object'&&c.nodeType===1&&
(c.className||'').split(/\s+/).some(cls=>MODAL_SECTIONS.includes(cls))
)}
function Modal(props={},...children){injectBase();const{title,footer,visible,onClose,width='480px',class:cls}=props;const closeBtn=h('button',{class:'d-modal-close',
type:'button',
'aria-label':'Close'},'\u00d7');const panel=h('div',{class:cx('d-modal-panel',cls),
style:{width}});if(hasSection(children)){children.forEach(c=>{if(c)panel.appendChild(c)})}else{if(title){panel.appendChild(h('div',{class:'d-modal-header'},
h('span',{class:'d-modal-title'},title),
closeBtn
))}
if(children.length){panel.appendChild(h('div',{class:'d-modal-body'},...children))}
if(footer){const footerChildren=Array.isArray(footer)?footer:[footer];panel.appendChild(h('div',{class:'d-modal-footer'},...footerChildren))}}
if(!panel.querySelector('.d-modal-close')){const firstChild=panel.firstChild;if(firstChild)firstChild.appendChild(closeBtn)}
const dialog=h('dialog',{class:'d-modal-content'},panel);function close(){if(dialog.open)dialog.close();if(onClose)onClose()}
closeBtn.addEventListener('click',close);dialog.addEventListener('click',(e)=>{const rect=panel.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||
e.clientY<rect.top||e.clientY>rect.bottom){close()}});dialog.addEventListener('close',()=>{if(onClose)onClose()});if(typeof visible==='function'){createEffect(()=>{if(visible()){if(!dialog.open)dialog.showModal()}else{if(dialog.open)dialog.close()}})}
return dialog}
Modal.Header=function ModalHeader(props={},...children){const{class:cls}=props;return h('div',{class:cx('d-modal-header',cls)},...children)};Modal.Body=function ModalBody(props={},...children){const{class:cls}=props;return h('div',{class:cx('d-modal-body',cls)},...children)};Modal.Footer=function ModalFooter(props={},...children){const{class:cls}=props;return h('div',{class:cx('d-modal-footer',cls)},...children)};return{Modal}})();const _m35=(function(){const{h}=_m2;const{createEffect,createSignal}=_m14;const{injectBase,cx}=_m147;function Tabs(props={}){injectBase();const{tabs=[],active,onchange,class:cls}=props;const[getActive,setActive]=createSignal(
typeof active==='function'?active():(active||(tabs[0]&&tabs[0].id))
);const tabList=h('div',{class:'d-tabs-list',role:'tablist'});const panel=h('div',{class:'d-tabs-panel',role:'tabpanel'});const container=h('div',{class:cx('d-tabs',cls)},tabList,panel);const tabEls=[];tabs.forEach((tab,i)=>{const tabEl=h('button',{type:'button',
class:'d-tab',
role:'tab',
'aria-selected':'false',
tabindex:'-1'},tab.label);tabEl.addEventListener('click',()=>{setActive(tab.id);if(onchange)onchange(tab.id)});tabEl.addEventListener('keydown',(e)=>{let newIndex=i;if(e.key==='ArrowRight')newIndex=(i+1)%tabs.length; else if(e.key==='ArrowLeft')newIndex=(i-1+tabs.length)%tabs.length; else if(e.key==='Home')newIndex=0; else if(e.key==='End')newIndex=tabs.length-1; else return;e.preventDefault();setActive(tabs[newIndex].id);if(onchange)onchange(tabs[newIndex].id);tabEls[newIndex].focus()});tabEls.push(tabEl);tabList.appendChild(tabEl)});createEffect(()=>{const activeId=typeof active==='function'?active():getActive();tabEls.forEach((el,i)=>{const isActive=tabs[i].id===activeId;el.classList.toggle('d-tab-active',isActive);el.setAttribute('aria-selected',isActive?'true':'false');el.setAttribute('tabindex',isActive?'0':'-1')});const activeTab=tabs.find(t=>t.id===activeId);panel.replaceChildren();if(activeTab&&activeTab.content){const content=activeTab.content();if(typeof content==='string')panel.appendChild(document.createTextNode(content)); else if(content)panel.appendChild(content)}});return container}
return{Tabs}})();const _m36=(function(){const{h}=_m2;const{injectBase,cx}=_m147;const{caret}=_m148;const ANIM_MS=250;function animateOpen(region){if(typeof region.scrollHeight!=='number'){region.style.height='';region.style.overflow='';return}
region.style.height='0px';region.style.overflow='hidden';void region.offsetHeight;region.style.height=region.scrollHeight+'px';let done=false;const finish=()=>{if(done)return;done=true;region.removeEventListener('transitionend',onEnd);region.style.height='';region.style.overflow=''};const onEnd=(e)=>{if(e.propertyName==='height')finish()};region.addEventListener('transitionend',onEnd);setTimeout(finish,ANIM_MS+50)}
function animateClose(region){if(typeof region.offsetHeight!=='number'){region.style.height='0px';region.style.overflow='hidden';return}
region.style.height=region.offsetHeight+'px';region.style.overflow='hidden';void region.offsetHeight;region.style.height='0px';let done=false;const finish=()=>{if(done)return;done=true;region.removeEventListener('transitionend',onEnd)};const onEnd=(e)=>{if(e.propertyName==='height')finish()};region.addEventListener('transitionend',onEnd);setTimeout(finish,ANIM_MS+50)}
function Accordion(props={}){injectBase();const{items=[],multiple=false,class:cls}=props;const openSet=new Set();const container=h('div',{class:cx('d-accordion',cls)});const regions=[];const sections=[];items.forEach((item)=>{const content=h('div',{class:'d-accordion-content',role:'region'});const region=h('div',{class:'d-accordion-region'});region.appendChild(content);region.style.height='0px';region.style.overflow='hidden';regions.push(region);const trigger=h('button',{type:'button',
class:'d-accordion-trigger',
'aria-expanded':'false'},item.title,caret('down',{class:'d-accordion-icon'}));const section=h('div',{class:'d-accordion-item'},trigger,region);sections.push(section);trigger.addEventListener('click',()=>{const isOpen=openSet.has(item.id);if(isOpen){openSet.delete(item.id);animateClose(region);section.classList.remove('d-accordion-open');trigger.setAttribute('aria-expanded','false')}else{if(!multiple){items.forEach((other,i)=>{if(openSet.has(other.id)){animateClose(regions[i]);sections[i].classList.remove('d-accordion-open');sections[i].querySelector('.d-accordion-trigger')
?.setAttribute('aria-expanded','false')}});openSet.clear()}
openSet.add(item.id);content.replaceChildren();const rendered=item.content();if(typeof rendered==='string')content.appendChild(document.createTextNode(rendered)); else if(rendered)content.appendChild(rendered);animateOpen(region);section.classList.add('d-accordion-open');trigger.setAttribute('aria-expanded','true')}});container.appendChild(section)});return container}
return{Accordion}})();const _m37=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Separator(props={}){injectBase();const{vertical,label,class:cls}=props;if(label){return h('div',{class:cx('d-separator',vertical&&'d-separator-vertical',cls),
role:'separator'},
h('span',{class:'d-separator-line'}),
h('span',{class:'d-separator-label'},label),
h('span',{class:'d-separator-line'})
)}
return h('hr',{class:cx('d-separator',vertical&&'d-separator-vertical',cls),
role:'separator'})}
return{Separator}})();const _m38=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Breadcrumb(props={}){injectBase();const{items=[],separator='/',class:cls}=props;const nav=h('nav',{class:cx('d-breadcrumb',cls),'aria-label':'Breadcrumb'});const ol=h('ol',{class:'d-breadcrumb-list'});items.forEach((item,i)=>{const isLast=i===items.length-1;const li=h('li',{class:'d-breadcrumb-item'});if(isLast){li.appendChild(h('span',{class:'d-breadcrumb-current','aria-current':'page'},item.label))}else{const linkProps={class:'d-breadcrumb-link'};if(item.href)linkProps.href=item.href;if(item.onclick)linkProps.onclick=item.onclick;li.appendChild(h(item.href?'a':'button',linkProps,item.label));li.appendChild(h('span',{class:'d-breadcrumb-separator','aria-hidden':'true'},separator))}
ol.appendChild(li)});nav.appendChild(ol);return nav}
return{Breadcrumb}})();const _m39=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Table(props={}){injectBase();const{columns=[],data=[],striped,hoverable,compact,class:cls}=props;const tableClass=cx(
'd-table',
striped&&'d-table-striped',
hoverable&&'d-table-hover',
compact&&'d-table-compact',
cls
);const thead=h('thead',null,
h('tr',null,...columns.map(col=>
h('th',{class:'d-th',style:col.width?{width:col.width}:undefined},col.label)
))
);const tbody=h('tbody',null,...data.map(row=>
h('tr',{class:'d-tr'},...columns.map(col=>{const val=row[col.key];const content=col.render?col.render(val,row):(val!=null?String(val):'');return h('td',{class:'d-td'},content)}))
));return h('div',{class:'d-table-wrap'},
h('table',{class:tableClass},thead,tbody)
)}
return{Table}})();const _m40=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Avatar(props={}){injectBase();const{src,alt='',size,fallback,class:cls}=props;const avatarClass=cx('d-avatar',size&&`d-avatar-${size}`,cls);const container=h('div',{class:avatarClass});if(src){const img=h('img',{class:'d-avatar-img',src,alt});img.addEventListener('error',()=>{img.remove();container.appendChild(createFallback())});container.appendChild(img)}else{container.appendChild(createFallback())}
function createFallback(){const text=fallback||alt.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';return h('span',{class:'d-avatar-fallback','aria-hidden':'true'},text)}
return container}
return{Avatar}})();const _m41=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;function Progress(props={}){injectBase();const{value,max=100,label,variant,size,striped,animated,class:cls}=props;const progressClass=cx(
'd-progress',
size&&`d-progress-${size}`,
variant&&`d-progress-${variant}`,
striped&&'d-progress-striped',
animated&&'d-progress-animated'
);const bar=h('div',{class:'d-progress-bar',role:'progressbar','aria-valuemin':'0','aria-valuemax':String(max)});const progress=h('div',{class:progressClass},bar);const labelInside=size==='md'||size==='lg';let labelEl=null;if(label){labelEl=h('span',{class:'d-progress-label'},label);if(labelInside){progress.appendChild(labelEl)}}
const wrap=h('div',{class:cx('d-progress-wrap',cls)},progress);if(label&&!labelInside){wrap.appendChild(labelEl)}
function updateBar(val){const pct=Math.min(Math.max((val/max)*100,0),100);bar.style.width=pct+'%';bar.setAttribute('aria-valuenow',String(val))}
if(typeof value==='function'){createEffect(()=>updateBar(value()))}else{updateBar(value||0)}
return wrap}
return{Progress}})();const _m42=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Skeleton(props={}){injectBase();const{variant='text',width,height,lines,class:cls}=props;if(lines&&lines>1){const container=h('div',{class:cx('d-skeleton-group',cls)});for(let i=0;i<lines;i++){const line=h('div',{class:'d-skeleton d-skeleton-text'});if(i===lines-1)line.style.width='60%';container.appendChild(line)}
return container}
const skeletonClass=cx(
'd-skeleton',
variant==='circle'?'d-skeleton-circle':variant==='rect'?'d-skeleton-rect':'d-skeleton-text',
cls
);const el=h('div',{class:skeletonClass,'aria-hidden':'true'});if(width)el.style.width=width;if(height)el.style.height=height;return el}
return{Skeleton}})();const _m43=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Tooltip(props={},...children){injectBase();const{content,position='top',delay=200,class:cls}=props;const tooltipEl=h('div',{class:cx('d-tooltip',`d-tooltip-${position}`,cls),
role:'tooltip',
style:{display:'none'}},content);const wrapper=h('div',{class:'d-tooltip-wrap'},...children,tooltipEl);let showTimer=null;function show(){showTimer=setTimeout(()=>{tooltipEl.style.display=''},delay)}
function hide(){clearTimeout(showTimer);tooltipEl.style.display='none'}
wrapper.addEventListener('mouseenter',show);wrapper.addEventListener('mouseleave',hide);wrapper.addEventListener('focusin',show);wrapper.addEventListener('focusout',hide);return wrapper}
return{Tooltip}})();const _m44=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Alert(props={},...children){injectBase();const{variant='info',dismissible,onDismiss,icon,class:cls}=props;const alertRole=(variant==='error'||variant==='warning')?'alert':'status';const alertClass=cx('d-alert',`d-alert-${variant}`,cls);const el=h('div',{class:alertClass,role:alertRole});if(icon){const iconEl=typeof icon==='string'
?h('span',{class:'d-alert-icon','aria-hidden':'true'},icon)
:h('span',{class:'d-alert-icon','aria-hidden':'true'},icon);el.appendChild(iconEl)}
const body=h('div',{class:'d-alert-body'},...children);el.appendChild(body);if(dismissible){const closeBtn=h('button',{class:'d-alert-dismiss',
'aria-label':'Dismiss',
type:'button'},'\u00d7');closeBtn.addEventListener('click',()=>{el.remove();if(onDismiss)onDismiss()});el.appendChild(closeBtn)}
return el}
return{Alert}})();const _m45=(function(){const{h}=_m2;const{injectBase,cx}=_m147;let containerCache={};function getContainer(position){if(containerCache[position])return containerCache[position];if(typeof document==='undefined')return null;const el=h('div',{class:cx('d-toast-container',`d-toast-${position}`)});document.body.appendChild(el);containerCache[position]=el;return el}
function toast(props={}){injectBase();const{message,
variant='info',
duration=3000,
position='top-right'}=props;const container=getContainer(position);if(!container)return{dismiss:()=>{}};const toastClass=cx('d-toast',`d-toast-${variant}`);const el=h('div',{class:toastClass,role:'status','aria-live':'polite'},
h('span',{class:'d-toast-message'},message),
h('button',{class:'d-toast-close',
'aria-label':'Dismiss',
type:'button'},'\u00d7')
);const dismiss=()=>{el.classList.add('d-toast-exit');setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el)},200)};el.querySelector('.d-toast-close').addEventListener('click',dismiss);container.appendChild(el);if(duration>0){setTimeout(dismiss,duration)}
return{dismiss}}
function resetToasts(){for(const el of Object.values(containerCache)){if(el.parentNode)el.parentNode.removeChild(el)}
containerCache={}}
return{toast,resetToasts}})();const _m46=(function(){const{h}=_m2;const{injectBase,cx}=_m147;const{iconHelper:icon}=_m54;function Chip(props={}){injectBase();const{icon,label,variant,size,removable,onRemove,onClick,
selected,class:cls}=props;const className=cx(
'd-chip',
variant==='outline'&&'d-chip-outline',
variant==='filled'&&'d-chip-filled',
size==='sm'&&'d-chip-sm',
selected&&'d-chip-selected',
(onClick||removable)&&'d-chip-interactive',
cls
);const el=h('span',{class:className,
role:onClick?'button':undefined,
tabindex:onClick?'0':undefined});if(onClick){el.addEventListener('click',onClick);el.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onClick(e)}})}
if(icon){const iconEl=typeof icon==='string'
?iconHelper(icon,{size:'1em',class:'d-chip-icon'})
:icon;if(iconEl&&!iconEl.classList.contains('d-chip-icon')){iconEl.classList.add('d-chip-icon')}
iconEl.setAttribute('aria-hidden','true');el.appendChild(iconEl)}
if(label){el.appendChild(h('span',{class:'d-chip-label'},label))}
if(removable){const removeBtn=h('button',{class:'d-chip-remove',
type:'button',
'aria-label':`Remove ${label || ''}`.trim(),
onclick:(e)=>{e.stopPropagation();if(onRemove)onRemove(e)}},'\u00D7');el.appendChild(removeBtn)}
return el}
return{Chip}})();const _m47=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Dropdown(props={}){injectBase();const{trigger,items=[],align='left',class:cls}=props;let open=false;let activeIndex=-1;const menu=h('div',{class:cx('d-dropdown-menu',align==='right'&&'d-dropdown-right'),
role:'menu',
tabindex:'-1',
style:{display:'none'}});const wrap=h('div',{class:cx('d-dropdown',cls)});const triggerEl=typeof trigger==='function'?trigger():h('button',{type:'button',class:'d-dropdown-trigger'},'Menu');triggerEl.setAttribute('aria-haspopup','menu');triggerEl.setAttribute('aria-expanded','false');wrap.appendChild(triggerEl);wrap.appendChild(menu);function renderItems(){menu.replaceChildren();items.forEach((item)=>{if(item.separator){menu.appendChild(h('div',{class:'d-dropdown-separator',role:'separator'}));return}
const children=[];if(item.icon){const iconEl=typeof item.icon==='string'?h('span',{class:'d-dropdown-item-icon'},item.icon):item.icon;children.push(iconEl)}
children.push(h('span',{class:'d-dropdown-item-label'},item.label));if(item.shortcut){children.push(h('span',{class:'d-dropdown-item-shortcut'},item.shortcut))}
const el=h('div',{class:cx('d-dropdown-item',item.disabled&&'d-dropdown-item-disabled'),
role:'menuitem',
tabindex:'-1',
'aria-disabled':item.disabled?'true':undefined},...children);if(!item.disabled){el.addEventListener('click',(e)=>{e.stopPropagation();closeMenu();if(item.onclick)item.onclick(item.value||item.label)})}
menu.appendChild(el)})}
function getSelectableItems(){return[...menu.querySelectorAll('.d-dropdown-item:not(.d-dropdown-item-disabled)')]}
function highlightIndex(idx){const selectables=getSelectableItems();selectables.forEach((el,i)=>{el.classList.toggle('d-dropdown-item-highlight',i===idx)});activeIndex=idx}
function openMenu(){if(open)return;open=true;activeIndex=-1;renderItems();menu.style.display='';triggerEl.setAttribute('aria-expanded','true');wrap.classList.add('d-dropdown-open');if(typeof menu.focus==='function')menu.focus()}
function closeMenu(){if(!open)return;open=false;menu.style.display='none';triggerEl.setAttribute('aria-expanded','false');wrap.classList.remove('d-dropdown-open');if(typeof triggerEl.focus==='function')triggerEl.focus()}
triggerEl.addEventListener('click',(e)=>{e.stopPropagation();if(open)closeMenu(); else openMenu()});triggerEl.addEventListener('keydown',(e)=>{if(e.key==='ArrowDown'||e.key==='Enter'||e.key===' '){e.preventDefault();if(!open)openMenu();highlightIndex(0)}});menu.addEventListener('keydown',(e)=>{const selectables=getSelectableItems();const len=selectables.length;if(e.key==='ArrowDown'){e.preventDefault();highlightIndex(activeIndex<len-1?activeIndex+1:0)}else if(e.key==='ArrowUp'){e.preventDefault();highlightIndex(activeIndex>0?activeIndex-1:len-1)}else if(e.key==='Enter'||e.key===' '){e.preventDefault();if(activeIndex>=0&&activeIndex<len){selectables[activeIndex].click()}}else if(e.key==='Escape'||e.key==='Tab'){closeMenu()}});if(typeof document!=='undefined'){document.addEventListener('click',(e)=>{if(open&&!wrap.contains(e.target))closeMenu()})}
return wrap}
return{Dropdown}})();const _m48=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;function Drawer(props={},...children){injectBase();const{visible,
onClose,
side='right',
title,
width='320px',
height='320px',
class:cls}=props;const closeBtn=h('button',{class:'d-drawer-close',
type:'button',
'aria-label':'Close drawer'},'\u00D7');const headerChildren=[];if(title)headerChildren.push(h('span',{class:'d-drawer-title'},title));headerChildren.push(closeBtn);const header=h('div',{class:'d-drawer-header'},...headerChildren);const body=h('div',{class:'d-drawer-body'},...children);const panel=h('div',{class:cx('d-drawer-panel',`d-drawer-${side}`)},header,body);if(side==='left'||side==='right'){panel.style.width=width}else{panel.style.height=height}
const dialog=h('dialog',{class:cx('d-drawer',cls),
'aria-label':title||'Drawer'},panel);function close(){if(dialog.open)dialog.close();if(onClose)onClose()}
closeBtn.addEventListener('click',close);dialog.addEventListener('click',(e)=>{const rect=panel.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||
e.clientY<rect.top||e.clientY>rect.bottom){close()}});dialog.addEventListener('close',()=>{if(onClose)onClose()});if(typeof visible==='function'){createEffect(()=>{if(visible()){if(!dialog.open)dialog.showModal()}else{if(dialog.open)dialog.close()}})}
return dialog}
return{Drawer}})();const _m49=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;function Pagination(props={}){injectBase();const{total,
perPage=10,
current=1,
onchange,
siblings=1,
class:cls}=props;const nav=h('nav',{class:cx('d-pagination',cls),'aria-label':'Pagination'});const list=h('ul',{class:'d-pagination-list'});nav.appendChild(list);function resolve(v){return typeof v==='function'?v():v}
function getPageCount(){return Math.max(1,Math.ceil(resolve(total)/perPage))}
function getRange(cur,pageCount){const range=[];const left=Math.max(2,cur-siblings);const right=Math.min(pageCount-1,cur+siblings);range.push(1);if(left>2)range.push('...');for(let i=left;i<=right;i++)range.push(i);if(right<pageCount-1)range.push('...');if(pageCount>1)range.push(pageCount);return range}
function render(){list.replaceChildren();const cur=resolve(current);const pageCount=getPageCount();const prev=h('li',null,
h('button',{class:cx('d-pagination-btn','d-pagination-prev',cur<=1&&'d-pagination-disabled'),
type:'button',
'aria-label':'Previous page',
disabled:cur<=1?'':undefined},'\u2039')
);prev.querySelector('button').addEventListener('click',()=>{if(cur>1&&onchange)onchange(cur-1)});list.appendChild(prev);const range=getRange(cur,pageCount);for(const page of range){if(page==='...'){list.appendChild(h('li',null,h('span',{class:'d-pagination-ellipsis'},'\u2026')));continue}
const btn=h('button',{class:cx('d-pagination-btn',page===cur&&'d-pagination-active'),
type:'button',
'aria-label':`Page ${page}`,
'aria-current':page===cur?'page':undefined},String(page));btn.addEventListener('click',()=>{if(page!==cur&&onchange)onchange(page)});list.appendChild(h('li',null,btn))}
const next=h('li',null,
h('button',{class:cx('d-pagination-btn','d-pagination-next',cur>=pageCount&&'d-pagination-disabled'),
type:'button',
'aria-label':'Next page',
disabled:cur>=pageCount?'':undefined},'\u203A')
);next.querySelector('button').addEventListener('click',()=>{if(cur<pageCount&&onchange)onchange(cur+1)});list.appendChild(next)}
render();if(typeof current==='function'||typeof total==='function'){createEffect(render)}
return nav}
return{Pagination}})();const _m50=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx,reactiveAttr}=_m147;function RadioGroup(props={}){injectBase();const{options=[],
value,
name=`d-radio-${Date.now()}`,
disabled,
orientation='vertical',
onchange,
class:cls}=props;let currentValue=typeof value==='function'?value():(value||'');const group=h('div',{class:cx('d-radiogroup',orientation==='horizontal'&&'d-radiogroup-horizontal',cls),
role:'radiogroup'});const radios=[];options.forEach((opt,i)=>{const native=h('input',{type:'radio',
name,
value:opt.value,
class:'d-radio-native',
tabindex:i===0?'0':'-1',
'aria-label':opt.label});if(opt.value===currentValue)native.checked=true;if(opt.disabled)native.disabled=true;const indicator=h('span',{class:'d-radio-indicator'},
h('span',{class:'d-radio-dot'})
);const label=h('span',{class:'d-radio-label'},opt.label);const wrapper=h('label',{class:cx('d-radio',opt.disabled&&'d-radio-disabled')},native,indicator,label);native.addEventListener('change',()=>{if(native.checked){currentValue=opt.value;updateChecked();if(onchange)onchange(opt.value)}});native.addEventListener('keydown',(e)=>{let next=-1;if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();next=findNext(i,1)}else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();next=findNext(i,-1)}
if(next>=0){radios[next].native.checked=true;radios[next].native.focus();radios[next].native.dispatchEvent(new Event('change'))}});radios.push({native,wrapper,opt});group.appendChild(wrapper)});function findNext(from,dir){let idx=from;for(let j=0;j<options.length;j++){idx=(idx+dir+options.length)%options.length;if(!options[idx].disabled)return idx}
return-1}
function updateChecked(){radios.forEach(({native,opt})=>{native.checked=opt.value===currentValue;native.tabIndex=native.checked?0:-1})}
if(typeof value==='function'){createEffect(()=>{currentValue=value();updateChecked()})}
if(typeof disabled==='function'){createEffect(()=>{const v=disabled();radios.forEach(({native})=>{native.disabled=v})})}else if(disabled){radios.forEach(({native})=>{native.disabled=true})}
return group}
return{RadioGroup}})();const _m51=(function(){const{h}=_m2;const{injectBase,cx}=_m147;const{createOverlay}=_m148;function Popover(props={},...children){injectBase();const{trigger,
position='bottom',
align='center',
class:cls}=props;const content=h('div',{class:cx('d-popover-content',`d-popover-${position}`,align!=='center'&&`d-popover-align-${align}`,cls),
role:'dialog',
style:{display:'none'}},...children);const wrap=h('div',{class:'d-popover'});const triggerEl=typeof trigger==='function'?trigger():h('button',{type:'button'},'Open');triggerEl.setAttribute('aria-haspopup','dialog');triggerEl.setAttribute('aria-expanded','false');wrap.appendChild(triggerEl);wrap.appendChild(content);createOverlay(triggerEl,content,{trigger:'click',
closeOnEscape:true,
closeOnOutside:true,
onOpen:()=>wrap.classList.add('d-popover-open'),
onClose:()=>wrap.classList.remove('d-popover-open')});return wrap}
return{Popover}})();const _m52=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const{caret}=_m148;function Combobox(props={}){injectBase();const{options=[],
value,
placeholder='Search...',
disabled,
error,
onchange,
onfilter,
class:cls}=props;let open=false;let activeIndex=-1;let currentValue=typeof value==='function'?value():(value||'');let filtered=[...options];const input=h('input',{type:'text',
class:'d-combobox-input',
placeholder,
role:'combobox',
autocomplete:'off',
'aria-expanded':'false',
'aria-haspopup':'listbox',
'aria-autocomplete':'list'});const arrow=caret('down',{class:'d-combobox-arrow'});const inputWrap=h('div',{class:'d-combobox-input-wrap'},input,arrow);const listbox=h('div',{class:'d-combobox-listbox',role:'listbox'});listbox.style.display='none';const wrap=h('div',{class:cx('d-combobox',cls)},inputWrap,listbox);function updateDisplay(){const opt=options.find(o=>o.value===currentValue);input.value=opt?opt.label:''}
function filterOptions(query){if(onfilter){filtered=onfilter(query,options)}else{const q=query.toLowerCase();filtered=q?options.filter(o=>o.label.toLowerCase().includes(q)):[...options]}}
function renderList(){listbox.replaceChildren();if(filtered.length===0){listbox.appendChild(h('div',{class:'d-combobox-empty'},'No results'));return}
filtered.forEach((opt,i)=>{const el=h('div',{class:cx('d-combobox-option',opt.value===currentValue&&'d-combobox-option-active',opt.disabled&&'d-combobox-option-disabled'),
role:'option',
'aria-selected':opt.value===currentValue?'true':'false'},opt.label);if(!opt.disabled){el.addEventListener('click',(e)=>{e.stopPropagation();selectOption(opt.value)})}
listbox.appendChild(el)})}
function selectOption(val){currentValue=val;updateDisplay();closeList();if(onchange)onchange(val)}
function openList(){if(open)return;open=true;filterOptions(input.value);renderList();listbox.style.display='';input.setAttribute('aria-expanded','true');wrap.classList.add('d-combobox-open')}
function closeList(){if(!open)return;open=false;activeIndex=-1;listbox.style.display='none';input.setAttribute('aria-expanded','false');wrap.classList.remove('d-combobox-open')}
function highlightOption(idx){const items=listbox.querySelectorAll('.d-combobox-option:not(.d-combobox-option-disabled)');items.forEach((el,i)=>el.classList.toggle('d-combobox-option-highlight',i===idx));activeIndex=idx}
input.addEventListener('focus',openList);input.addEventListener('input',()=>{if(!open)openList();filterOptions(input.value);renderList();activeIndex=-1});arrow.addEventListener('click',(e)=>{e.stopPropagation();if(open)closeList(); else{input.focus();openList()}});input.addEventListener('keydown',(e)=>{const items=listbox.querySelectorAll('.d-combobox-option:not(.d-combobox-option-disabled)');const len=items.length;if(e.key==='ArrowDown'){e.preventDefault();if(!open)openList();highlightOption(activeIndex<len-1?activeIndex+1:0)}else if(e.key==='ArrowUp'){e.preventDefault();if(!open)openList();highlightOption(activeIndex>0?activeIndex-1:len-1)}else if(e.key==='Enter'){e.preventDefault();if(open&&activeIndex>=0&&activeIndex<len){const val=filtered.filter(o=>!o.disabled)[activeIndex];if(val)selectOption(val.value)}}else if(e.key==='Escape'){closeList();updateDisplay()}});if(typeof document!=='undefined'){document.addEventListener('click',(e)=>{if(open&&!wrap.contains(e.target)){closeList();updateDisplay()}})}
updateDisplay();if(typeof value==='function'){createEffect(()=>{currentValue=value();updateDisplay()})}
if(typeof disabled==='function'){createEffect(()=>{input.disabled=disabled()})}else if(disabled){input.disabled=true}
if(typeof error==='function'){createEffect(()=>{wrap.className=cx('d-combobox',error()&&'d-combobox-error',cls)})}else if(error){wrap.classList.add('d-combobox-error')}
return wrap}
return{Combobox}})();const _m53=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;function Slider(props={}){injectBase();const{value=0,
min=0,
max=100,
step=1,
disabled,
onchange,
oninput,
showValue=false,
class:cls}=props;let currentValue=typeof value==='function'?value():value;const track=h('div',{class:'d-slider-track'});const fill=h('div',{class:'d-slider-fill'});const thumb=h('div',{class:'d-slider-thumb',
role:'slider',
tabindex:'0',
'aria-valuemin':String(min),
'aria-valuemax':String(max),
'aria-valuenow':String(currentValue),
'aria-label':'Slider'});track.appendChild(fill);track.appendChild(thumb);const valueLabel=showValue?h('span',{class:'d-slider-value'},String(currentValue)):null;const wrap=h('div',{class:cx('d-slider',cls)},track);if(valueLabel)wrap.appendChild(valueLabel);function clamp(val){const stepped=Math.round((val-min)/step)*step+min;return Math.max(min,Math.min(max,stepped))}
function getPercent(val){return((val-min)/(max-min))*100}
function updateUI(){const pct=getPercent(currentValue);fill.style.width=`${pct}%`;thumb.style.left=`${pct}%`;thumb.setAttribute('aria-valuenow',String(currentValue));if(valueLabel)valueLabel.textContent=String(currentValue)}
function setValue(val){const clamped=clamp(val);if(clamped===currentValue)return;currentValue=clamped;updateUI();if(oninput)oninput(currentValue)}
function commitValue(){if(onchange)onchange(currentValue)}
let dragging=false;function onPointerDown(e){if(typeof disabled==='function'?disabled():disabled)return;e.preventDefault();dragging=true;wrap.classList.add('d-slider-active');updateFromEvent(e);document.addEventListener('pointermove',onPointerMove);document.addEventListener('pointerup',onPointerUp)}
function onPointerMove(e){if(!dragging)return;updateFromEvent(e)}
function onPointerUp(){dragging=false;wrap.classList.remove('d-slider-active');commitValue();document.removeEventListener('pointermove',onPointerMove);document.removeEventListener('pointerup',onPointerUp)}
function updateFromEvent(e){const rect=track.getBoundingClientRect();const pct=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));setValue(min+pct*(max-min))}
track.addEventListener('pointerdown',onPointerDown);thumb.addEventListener('pointerdown',onPointerDown);thumb.addEventListener('keydown',(e)=>{if(typeof disabled==='function'?disabled():disabled)return;let newVal=currentValue;if(e.key==='ArrowRight'||e.key==='ArrowUp'){e.preventDefault();newVal=currentValue+step}else if(e.key==='ArrowLeft'||e.key==='ArrowDown'){e.preventDefault();newVal=currentValue-step}else if(e.key==='Home'){e.preventDefault();newVal=min}else if(e.key==='End'){e.preventDefault();newVal=max}else{return}
setValue(newVal);commitValue()});updateUI();if(typeof value==='function'){createEffect(()=>{currentValue=value();updateUI()})}
if(typeof disabled==='function'){createEffect(()=>{wrap.classList.toggle('d-slider-disabled',disabled())})}else if(disabled){wrap.classList.add('d-slider-disabled')}
return wrap}
return{Slider}})();const _m56=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx,reactiveAttr}=_m147;function Toggle(props={},...children){injectBase();const{pressed=false,variant,size,disabled,onchange,class:cls,...rest}=props;const className=cx(
'd-toggle',
variant&&`d-toggle-${variant}`,
size&&`d-toggle-${size}`,
cls
);let _pressed=typeof pressed==='function'?pressed():pressed;const el=h('button',{type:'button',
class:className,
role:'button',
'aria-pressed':String(_pressed),
...rest},...children);el.addEventListener('click',()=>{_pressed=!_pressed;el.setAttribute('aria-pressed',String(_pressed));if(onchange)onchange(_pressed)});reactiveAttr(el,disabled,'disabled');if(typeof pressed==='function'){createEffect(()=>{_pressed=pressed();el.setAttribute('aria-pressed',String(_pressed))})}
return el}
function ToggleGroup(props={}){injectBase();const{items=[],value,type,multiple,variant,size,onchange,class:cls}=props;const effectiveType=multiple?'multiple':(type||'single');let current=typeof value==='function'?value():(value||(effectiveType==='multiple'?[]:''));const group=h('div',{class:cx('d-toggle-group',cls),
role:'group'});const indicator=effectiveType==='single'
?h('div',{class:'d-toggle-indicator'})
:null;if(indicator){indicator.style.opacity='0';group.appendChild(indicator)}
function isSelected(val){return effectiveType==='multiple'?current.includes(val):current===val}
function select(val){if(effectiveType==='multiple'){current=current.includes(val)?current.filter(v=>v!==val):[...current,val]}else{current=current===val?'':val}
updateAll();if(onchange)onchange(current)}
const buttons=items.map(item=>{const content=item.icon
?(typeof item.icon==='string'?item.icon:item.icon)
:(item.label||item.value);const btn=h('button',{type:'button',
class:cx('d-toggle',variant&&`d-toggle-${variant}`,size&&`d-toggle-${size}`),
role:'button',
'aria-pressed':String(isSelected(item.value)),
'aria-label':item.label||item.value,
disabled:item.disabled?'':undefined},content);btn.addEventListener('click',()=>{if(!item.disabled)select(item.value)});group.appendChild(btn);return{btn,value:item.value}});function positionIndicator(){if(!indicator)return;const selected=buttons.find(b=>isSelected(b.value));if(selected){const btn=selected.btn;indicator.style.transform=`translateX(${btn.offsetLeft - 2}px)`;indicator.style.width=`${btn.offsetWidth}px`;indicator.style.opacity='1'}else{indicator.style.opacity='0'}}
function updateAll(){buttons.forEach(({btn,value:v})=>{btn.setAttribute('aria-pressed',String(isSelected(v)))});requestAnimationFrame(positionIndicator)}
if(typeof value==='function'){createEffect(()=>{current=value();updateAll()})}
requestAnimationFrame(positionIndicator);return group}
return{Toggle,ToggleGroup}})();const _m57=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Title(props={},...children){injectBase();const{level=3,type,mark,underline,strikethrough,disabled,class:cls,...rest}=props;const tag=`h${Math.max(1, Math.min(5, level))}`;const className=cx(
'd-title',
`d-title-${level}`,
type&&`d-text-${type}`,
disabled&&'d-text-disabled',
cls
);let content=children;if(mark)content=[h('mark',{class:'d-text-mark'},...content)];if(underline)content=[h('u',null,...content)];if(strikethrough)content=[h('s',null,...content)];return h(tag,{class:className,...rest},...content)}
function Text(props={},...children){injectBase();const{type,strong,italic,underline,strikethrough,code,keyboard,mark,disabled,class:cls,...rest}=props;if(code)return h('code',{class:cx('d-text-code',type&&`d-text-${type}`,cls),...rest},...children);if(keyboard)return h('kbd',{class:cx('d-kbd',cls),...rest},...children);const className=cx(
'd-text',
type&&`d-text-${type}`,
strong&&'d-text-strong',
italic&&'d-text-italic',
underline&&'d-text-underline',
strikethrough&&'d-text-strikethrough',
disabled&&'d-text-disabled',
cls
);let content=children;if(mark)content=[h('mark',{class:'d-text-mark'},...content)];return h('span',{class:className,...rest},...content)}
function Paragraph(props={},...children){injectBase();const{type,strong,italic,class:cls,...rest}=props;const className=cx(
'd-paragraph',
type&&`d-text-${type}`,
strong&&'d-text-strong',
italic&&'d-text-italic',
cls
);return h('p',{class:className,...rest},...children)}
function Link(props={},...children){injectBase();const{href,target,type,disabled,class:cls,...rest}=props;const className=cx('d-link',type&&`d-text-${type}`,disabled&&'d-text-disabled',cls);const el=h('a',{class:className,href,target,...rest},...children);if(target==='_blank')el.setAttribute('rel','noopener noreferrer');if(disabled){el.setAttribute('aria-disabled','true');el.setAttribute('tabindex','-1')}
return el}
function Blockquote(props={},...children){injectBase();const{class:cls,...rest}=props;return h('blockquote',{class:cx('d-blockquote',cls),...rest},...children)}
return{Title,Text,Paragraph,Link,Blockquote}})();const _m58=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Kbd(props={},...children){injectBase();const{keys,separator='+',class:cls,...rest}=props;if(keys){const keyArr=Array.isArray(keys)?keys:[keys];if(keyArr.length===1){return h('kbd',{class:cx('d-kbd',cls),...rest},keyArr[0])}
const group=h('span',{class:cx('d-kbd-group',cls),...rest});keyArr.forEach((key,i)=>{if(i>0)group.appendChild(h('span',{class:'d-kbd-separator'},separator));group.appendChild(h('kbd',{class:'d-kbd'},key))});return group}
return h('kbd',{class:cx('d-kbd',cls),...rest},...children)}
return{Kbd}})();const _m59=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Space(props={},...children){injectBase();const{direction='horizontal',align,gap,wrap,class:cls,...rest}=props;const className=cx(
'd-space',
direction==='vertical'&&'d-space-vertical',
wrap&&'d-space-wrap',
cls
);const style={};if(gap!==undefined){style.gap=typeof gap==='number'?`var(--d-sp-${gap})`:gap}
if(align){const map={start:'flex-start',end:'flex-end',center:'center',between:'space-between',around:'space-around',evenly:'space-evenly'};if(direction==='vertical')style.alignItems=map[align]||align; else style.justifyContent=map[align]||align}
return h('div',{class:className,style:Object.keys(style).length?style:undefined,...rest},...children)}
return{Space}})();const _m60=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function AspectRatio(props={},...children){injectBase();const{ratio=16/9,class:cls,...rest}=props;return h('div',{class:cx('d-aspect',cls),
style:{aspectRatio:String(ratio)},
...rest},...children)}
return{AspectRatio}})();const _m61=(function(){const{h}=_m2;const{injectBase,cx}=_m147;const{createDrag}=_m148;function Resizable(props={},...children){injectBase();const{direction='horizontal',defaultSize=50,minSize=10,maxSize=90,onResize,class:cls,...rest}=props;const isVert=direction==='vertical';let size=defaultSize;const panel1=h('div',{class:'d-resizable-panel'});const panel2=h('div',{class:'d-resizable-panel'});if(children[0])panel1.appendChild(children[0]);if(children[1])panel2.appendChild(children[1]);const handleBar=h('div',{class:'d-resizable-handle-bar'});const handle=h('div',{class:cx('d-resizable-handle',isVert&&'d-resizable-handle-vertical'),
role:'separator',
'aria-orientation':isVert?'horizontal':'vertical',
tabindex:'0',
'aria-valuenow':String(size),
'aria-valuemin':String(minSize),
'aria-valuemax':String(maxSize)},handleBar);const container=h('div',{class:cx('d-resizable',isVert&&'d-resizable-vertical',cls),
...rest},panel1,handle,panel2);function applySize(){const prop=isVert?'height':'width';panel1.style[prop]=`${size}%`;panel2.style[prop]=`${100 - size}%`;handle.setAttribute('aria-valuenow',String(Math.round(size)));if(onResize)onResize(size)}
createDrag(handle,{onMove(x,y,dx,dy){const rect=container.getBoundingClientRect();const total=isVert?rect.height:rect.width;const delta=isVert?dy:dx;const pct=(delta/total)*100;size=Math.max(minSize,Math.min(maxSize,defaultSize+pct));applySize()},
onStart(){container.style.userSelect='none'},
onEnd(){container.style.userSelect=''}});handle.addEventListener('keydown',(e)=>{const step=e.shiftKey?10:2;if(e.key===(isVert?'ArrowUp':'ArrowLeft')){e.preventDefault();size=Math.max(minSize,size-step);applySize()} else if(e.key===(isVert?'ArrowDown':'ArrowRight')){e.preventDefault();size=Math.min(maxSize,size+step);applySize()} else if(e.key==='Home'){e.preventDefault();size=minSize;applySize()} else if(e.key==='End'){e.preventDefault();size=maxSize;applySize()}});applySize();return container}
return{Resizable}})();const _m62=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function ScrollArea(props={},...children){injectBase();const{height,width,direction='vertical',class:cls,...rest}=props;const style={};if(height)style.height=height;if(width)style.width=width;const viewportStyle={};if(direction==='vertical')viewportStyle.overflowX='hidden'; else if(direction==='horizontal')viewportStyle.overflowY='hidden';const viewport=h('div',{class:'d-scrollarea-viewport',
style:Object.keys(viewportStyle).length?viewportStyle:undefined,
tabindex:'0',
role:'region',
'aria-label':'Scrollable content'},...children);return h('div',{class:cx('d-scrollarea',cls),
style:Object.keys(style).length?style:undefined,
...rest},viewport)}
return{ScrollArea}})();const _m63=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const{createDisclosure}=_m148;function Collapsible(props={},...children){injectBase();const{open=false,onToggle,trigger,class:cls,...rest}=props;const triggerEl=typeof trigger==='function'?trigger():h('button',{type:'button'},'Toggle');const content=h('div',{class:'d-collapsible-content'},...children);const region=h('div',{class:'d-disclosure-region'},content);const wrap=h('div',{class:cx('d-collapsible',cls),
...rest},triggerEl,region);const defaultOpen=typeof open==='function'?open():open;const disclosure=createDisclosure(triggerEl,content,{defaultOpen,
animate:true,
onToggle:(isOpen)=>{if(onToggle)onToggle(isOpen)}});if(typeof open==='function'){createEffect(()=>{const v=open();if(v&&!disclosure.isOpen())disclosure.open(); else if(!v&&disclosure.isOpen())disclosure.close()})}
return wrap}
return{Collapsible}})();const _m64=(function(){const{h}=_m2;const{injectBase,cx}=_m147;const{createDrag}=_m148;function Splitter(props={}){injectBase();const{direction='horizontal',panels=[],class:cls}=props;const isVert=direction==='vertical';const container=h('div',{class:cx('d-splitter',isVert&&'d-splitter-vertical',cls),
role:'group',
'aria-label':'Resizable panels'});const panelEls=[];const handleEls=[];panels.forEach((panelDef,i)=>{const panelEl=h('div',{class:'d-splitter-panel'});if(panelDef.size){if(isVert)panelEl.style.height=panelDef.size; else panelEl.style.width=panelDef.size}else{panelEl.style.flex='1'}
if(panelDef.min){if(isVert)panelEl.style.minHeight=panelDef.min+'px'; else panelEl.style.minWidth=panelDef.min+'px'}
if(panelDef.max){if(isVert)panelEl.style.maxHeight=panelDef.max+'px'; else panelEl.style.maxWidth=panelDef.max+'px'}
if(panelDef.content){if(panelDef.content.nodeType)panelEl.appendChild(panelDef.content); else panelEl.textContent=String(panelDef.content)}
panelEls.push(panelEl);container.appendChild(panelEl);if(i<panels.length-1){const handleCls=isVert?'d-splitter-handle-v':'d-splitter-handle-h';const handle=h('div',{class:cx('d-splitter-handle',handleCls),
role:'separator',
'aria-orientation':isVert?'horizontal':'vertical',
'aria-valuenow':'50',
tabindex:'0',
'aria-label':`Resize handle ${i + 1}`},h('div',{class:'d-splitter-handle-dot'}));handleEls.push(handle);container.appendChild(handle);const leftPanel=panelEls[i];let startSize=0;createDrag(handle,{onStart:()=>{startSize=isVert?leftPanel.offsetHeight:leftPanel.offsetWidth;leftPanel.style.flex='none'},
onMove:(x,y,dx,dy)=>{const delta=isVert?dy:dx;let newSize=startSize+delta;const minSize=parseInt(panels[i].min)||0;const maxSize=parseInt(panels[i].max)||Infinity;newSize=Math.max(minSize,Math.min(maxSize,newSize));if(isVert)leftPanel.style.height=newSize+'px'; else leftPanel.style.width=newSize+'px'}});handle.addEventListener('keydown',(e)=>{const stepPx=e.shiftKey?20:4;let delta=0;if(!isVert&&e.key==='ArrowLeft')delta=-stepPx; else if(!isVert&&e.key==='ArrowRight')delta=stepPx; else if(isVert&&e.key==='ArrowUp')delta=-stepPx; else if(isVert&&e.key==='ArrowDown')delta=stepPx; else if(e.key==='Home'){e.preventDefault();const minSize=parseInt(panels[i].min)||0;leftPanel.style.flex='none';if(isVert)leftPanel.style.height=minSize+'px'; else leftPanel.style.width=minSize+'px';return}else if(e.key==='End'){e.preventDefault();const maxSize=parseInt(panels[i].max)||(isVert?container.offsetHeight:container.offsetWidth);leftPanel.style.flex='none';if(isVert)leftPanel.style.height=maxSize+'px'; else leftPanel.style.width=maxSize+'px';return}else return;e.preventDefault();leftPanel.style.flex='none';const curSize=isVert?leftPanel.offsetHeight:leftPanel.offsetWidth;let newSize=curSize+delta;const minSize=parseInt(panels[i].min)||0;const maxSize=parseInt(panels[i].max)||Infinity;newSize=Math.max(minSize,Math.min(maxSize,newSize));if(isVert)leftPanel.style.height=newSize+'px'; else leftPanel.style.width=newSize+'px'})}});return container}
return{Splitter}})();const _m65=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const{createListbox,caret}=_m148;function Menu(props={}){injectBase();const{items=[],selected,onSelect,collapsed=false,class:cls}=props;const menu=h('nav',{class:cx('d-menu',cls),
role:'menu'});let currentSelected=typeof selected==='function'?selected():selected;function renderItem(item){if(item.separator){return h('div',{class:'d-menu-separator',role:'separator'})}
if(item.group){const groupEl=h('div',{class:'d-menu-group-label'},item.group);return groupEl}
const children=[];if(item.icon){const iconEl=typeof item.icon==='string'
?h('span',{class:'d-menu-item-icon','aria-hidden':'true'},item.icon)
:item.icon;children.push(iconEl)}
if(!collapsed){children.push(h('span',{class:'d-menu-item-label'},item.label))}
if(item.children&&item.children.length&&!collapsed){children.push(caret('right',{class:'d-menu-item-arrow'}))}
const isSelected=item.value===currentSelected;const el=h('button',{type:'button',
class:cx('d-menu-item',item.disabled&&'d-menu-item-disabled',isSelected&&'d-menu-item-active'),
role:'menuitem',
'aria-disabled':item.disabled?'true':undefined,
'aria-label':collapsed?item.label:undefined,
tabindex:'-1'},...children);if(!item.disabled){el.addEventListener('click',(e)=>{e.stopPropagation();if(item.onclick)item.onclick(item.value||item.label);if(onSelect)onSelect(item.value||item.label)})}
if(item.children&&item.children.length){const subWrap=h('div',{style:{position:'relative'}});subWrap.appendChild(el);const submenu=h('div',{class:'d-menu-sub',role:'menu',style:{display:'none'}});item.children.forEach(child=>submenu.appendChild(renderItem(child)));subWrap.appendChild(submenu);el.addEventListener('mouseenter',()=>{submenu.style.display=''});subWrap.addEventListener('mouseleave',()=>{submenu.style.display='none'});el.addEventListener('keydown',(e)=>{if(e.key==='ArrowRight'){e.preventDefault();submenu.style.display='';const first=submenu.querySelector('.d-menu-item');if(first)first.focus()}});return subWrap}
return el}
function render(){menu.replaceChildren();items.forEach(item=>menu.appendChild(renderItem(item)));createListbox(menu,{itemSelector:'.d-menu-item:not(.d-menu-item-disabled)',
activeClass:'d-menu-item-highlight',
orientation:'vertical',
onSelect:(el)=>el.click()})}
render();if(typeof selected==='function'){createEffect(()=>{currentSelected=selected();render()})}
return menu}
Menu.Bar=function Menubar(props={}){injectBase();const{menus=[],class:cls}=props;const bar=h('div',{class:cx('d-menubar',cls),role:'menubar'});menus.forEach(menuDef=>{const trigger=h('button',{type:'button',
class:'d-menubar-item',
'aria-haspopup':'menu',
'aria-expanded':'false'},menuDef.label);const dropdown=h('div',{class:'d-dropdown-menu',
role:'menu',
popover:'auto',
style:{position:'absolute',top:'100%',left:'0'}});menuDef.items.forEach(item=>{if(item.separator){dropdown.appendChild(h('div',{class:'d-dropdown-separator',role:'separator'}));return}
const el=h('button',{type:'button',
class:cx('d-dropdown-item',item.disabled&&'d-dropdown-item-disabled'),
role:'menuitem',
tabindex:'-1'},h('span',{class:'d-dropdown-item-label'},item.label));if(!item.disabled){el.addEventListener('click',()=>{dropdown.hidePopover();if(item.onclick)item.onclick(item.value||item.label)})}
dropdown.appendChild(el)});const wrap=h('div',{style:{position:'relative',display:'inline-flex'}});wrap.appendChild(trigger);wrap.appendChild(dropdown);trigger.addEventListener('click',()=>{if(dropdown.matches(':popover-open'))dropdown.hidePopover(); else dropdown.showPopover()});dropdown.addEventListener('toggle',(e)=>{trigger.setAttribute('aria-expanded',e.newState==='open'?'true':'false')});bar.appendChild(wrap)});return bar};return{Menu}})();const _m66=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;function Steps(props={}){injectBase();const{items=[],current=0,direction='horizontal',onChange,clickable=false,class:cls}=props;const isVert=direction==='vertical';const container=h('div',{class:cx('d-steps',isVert&&'d-steps-vertical',cls),
role:'list'});function getStatus(index,cur){const item=items[index];if(item.status)return item.status;if(index<cur)return'finish';if(index===cur)return'process';return'wait'}
function renderIcon(index,status){const item=items[index];if(item.icon){return typeof item.icon==='string'
?h('span',null,item.icon)
:item.icon}
if(status==='finish')return h('span',null,'\u2713');if(status==='error')return h('span',null,'\u2717');return h('span',null,String(index+1))}
function render(){const cur=typeof current==='function'?current():current;container.replaceChildren();items.forEach((item,i)=>{const status=getStatus(i,cur);const iconEl=h('div',{class:cx('d-step-icon',`d-step-icon-${status}`)},renderIcon(i,status));const content=h('div',{class:'d-step-content'});content.appendChild(h('div',{class:'d-step-title'},item.title));if(item.description){content.appendChild(h('div',{class:'d-step-desc'},item.description))}
const step=h('div',{class:cx('d-step',`d-step-${status}`),
role:'listitem',
'aria-current':status==='process'?'step':undefined},iconEl,content);if(clickable&&onChange){step.style.cursor='pointer';step.addEventListener('click',()=>onChange(i))}
container.appendChild(step);if(i<items.length-1){const connector=h('div',{class:cx('d-step-connector',i<cur&&'d-step-connector-done')});container.appendChild(connector)}})}
render();if(typeof current==='function'){createEffect(()=>{current();render()})}
return container}
return{Steps}})();const _m67=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const{createRovingTabindex}=_m148;function Segmented(props={}){injectBase();const{options=[],value,onchange,block,size,class:cls}=props;let current=typeof value==='function'?value():(value||(options[0]?.value??''));const container=h('div',{class:cx('d-segmented',block&&'d-segmented-block',size&&`d-segmented-${size}`,cls),
role:'radiogroup'});const items=options.map(opt=>{const content=opt.icon
?(typeof opt.icon==='string'?h('span',null,opt.icon):opt.icon)
:null;const label=opt.label||opt.value;const el=h('button',{type:'button',
class:'d-segmented-item',
role:'radio',
'aria-checked':current===opt.value?'true':'false',
'aria-label':label,
disabled:opt.disabled?'':undefined});if(content)el.appendChild(content);if(!opt.icon||opt.label)el.appendChild(document.createTextNode(label));el.addEventListener('click',()=>{if(opt.disabled)return;current=opt.value;updateAll();if(onchange)onchange(current)});container.appendChild(el);return{el,value:opt.value}});function updateAll(){items.forEach(({el,value:v})=>{el.setAttribute('aria-checked',v===current?'true':'false')})}
createRovingTabindex(container,{itemSelector:'.d-segmented-item:not([disabled])',
orientation:'horizontal',
onFocus:(el)=>el.click()});if(typeof value==='function'){createEffect(()=>{current=value();updateAll()})}
return container}
return{Segmented}})();const _m68=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Affix(props={},...children){injectBase();const{offsetTop=0,offsetBottom,onChange,class:cls,...rest}=props;const placeholder=h('div',{class:cx('d-affix',cls),...rest});const content=h('div',null,...children);placeholder.appendChild(content);let fixed=false;function check(){const rect=placeholder.getBoundingClientRect();const shouldFix=offsetBottom!==undefined
?(window.innerHeight-rect.bottom)<offsetBottom
:rect.top<offsetTop;if(shouldFix&&!fixed){fixed=true;content.classList.add('d-affix-fixed');if(offsetBottom!==undefined){content.style.bottom=`${offsetBottom}px`}else{content.style.top=`${offsetTop}px`}
content.style.width=`${rect.width}px`;placeholder.style.height=`${rect.height}px`;if(onChange)onChange(true)}else if(!shouldFix&&fixed){fixed=false;content.classList.remove('d-affix-fixed');content.style.top='';content.style.bottom='';content.style.width='';placeholder.style.height='';if(onChange)onChange(false)}}
if(typeof window!=='undefined'){window.addEventListener('scroll',check,{passive:true});window.addEventListener('resize',check,{passive:true})}
return placeholder}
return{Affix}})();const _m69=(function(){const{h}=_m2;const{injectBase,cx}=_m147;const{createListbox}=_m148;function ContextMenu(props={}){injectBase();const{target,items=[],onSelect,class:cls}=props;let _open=false;const menu=h('div',{class:cx('d-contextmenu',cls),
role:'menu',
tabindex:'-1'});function renderItems(){menu.replaceChildren();items.forEach(item=>{if(item.separator){menu.appendChild(h('div',{class:'d-dropdown-separator',role:'separator'}));return}
const children=[];if(item.icon){children.push(typeof item.icon==='string'
?h('span',{class:'d-dropdown-item-icon','aria-hidden':'true'},item.icon)
:item.icon)}
children.push(h('span',{class:'d-dropdown-item-label'},item.label));if(item.shortcut){children.push(h('span',{class:'d-dropdown-item-shortcut'},item.shortcut))}
const el=h('div',{class:cx('d-dropdown-item',item.disabled&&'d-dropdown-item-disabled'),
role:'menuitem',
tabindex:'-1'},...children);if(!item.disabled){el.addEventListener('click',(e)=>{e.stopPropagation();closeMenu();if(item.onclick)item.onclick(item.value||item.label);if(onSelect)onSelect(item.value||item.label)})}
menu.appendChild(el)})}
function closeMenu(){if(!_open)return;_open=false;menu.style.display='none'}
const listbox=createListbox(menu,{itemSelector:'.d-dropdown-item:not(.d-dropdown-item-disabled)',
activeClass:'d-dropdown-item-highlight',
orientation:'vertical',
onSelect:(el)=>el.click()});menu.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeMenu()});if(target){target.addEventListener('contextmenu',(e)=>{e.preventDefault();renderItems();listbox.reset();menu.style.left=`${e.clientX}px`;menu.style.top=`${e.clientY}px`;menu.style.display='';_open=true;menu.focus()})}
if(typeof document!=='undefined'){document.addEventListener('click',(e)=>{if(_open&&!menu.contains(e.target))closeMenu()})}
if(typeof document!=='undefined'){document.body.appendChild(menu)}
return menu}
return{ContextMenu}})();const _m70=(function(){const{h}=_m2;const{injectBase,cx}=_m147;const{createOverlay,createRovingTabindex,caret}=_m148;function NavigationMenu(props={}){injectBase();const{items=[],class:cls}=props;const nav=h('nav',{class:cx('d-navmenu',cls),'aria-label':'Navigation'});const list=h('ul',{class:'d-navmenu-list',role:'menubar'});const overlays=[];items.forEach((item,idx)=>{const hasChildren=item.children&&item.children.length;const li=h('li',{class:'d-navmenu-trigger',role:'none'});if(hasChildren){const btn=h('button',{type:'button',
class:'d-navmenu-item',
role:'menuitem',
'aria-haspopup':'true',
'aria-expanded':'false',
tabindex:idx===0?'0':'-1'},item.label,caret('down'));const content=h('div',{class:'d-navmenu-content',
role:'menu',
style:{display:'none'}});const useGrid=item.children.length>1;const grid=h('div',{class:useGrid?'d-navmenu-grid':''});item.children.forEach(child=>{const link=h('a',{class:'d-navmenu-link',
href:child.href||'#',
role:'menuitem',
tabindex:'-1'});const labelEl=h('div',null,child.label);link.appendChild(labelEl);if(child.description){link.appendChild(h('div',{class:'d-navmenu-link-desc'},child.description))}
link.addEventListener('keydown',(e)=>{if(e.key==='Escape'){ov.close();btn.focus()}});grid.appendChild(link)});content.appendChild(grid);const ov=createOverlay(btn,content,{trigger:'hover',
closeOnEscape:true,
closeOnOutside:false,
hoverDelay:100,
hoverCloseDelay:200,
onOpen:()=>{overlays.forEach((o,i)=>{if(i!==idx)o.close()});const firstLink=content.querySelector('.d-navmenu-link');if(firstLink)firstLink.setAttribute('tabindex','0')}});overlays.push(ov);btn.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'){e.preventDefault();ov.open();requestAnimationFrame(()=>{const first=content.querySelector('.d-navmenu-link');if(first)first.focus()})}});content.addEventListener('keydown',(e)=>{const links=[...content.querySelectorAll('.d-navmenu-link')];const cur=links.indexOf(document.activeElement);if(e.key==='ArrowDown'){e.preventDefault();const next=cur<links.length-1?cur+1:0;links[next]?.focus()}else if(e.key==='ArrowUp'){e.preventDefault();const prev=cur>0?cur-1:links.length-1;links[prev]?.focus()}else if(e.key==='Escape'){e.preventDefault();ov.close();btn.focus()}});li.appendChild(btn);li.appendChild(content)}else{const link=h('a',{class:'d-navmenu-item',
href:item.href||'#',
role:'menuitem',
tabindex:idx===0?'0':'-1'},item.label);li.appendChild(link);overlays.push(null)}
list.appendChild(li)});createRovingTabindex(list,{itemSelector:'[role="menuitem"]',
orientation:'horizontal',
loop:true});nav.appendChild(list);return nav}
return{NavigationMenu}})();const _m71=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function BackTop(props={},...children){injectBase();const{visibilityHeight=400,target,class:cls}=props;const hasCustomContent=children.flat().filter(c=>c&&c.nodeType).length>0;const content=hasCustomContent
?children.flat().filter(c=>c&&c.nodeType)
:[h('span',{'aria-hidden':'true'},'\u2191')];const btn=h('button',{type:'button',
class:cx('d-backtop','d-backtop-hidden',cls),
'aria-label':'Scroll to top'},...content);function getScrollTop(){if(target)return target.scrollTop;return document.documentElement.scrollTop||document.body.scrollTop}
function scrollToTop(){const scrollEl=target||window;if(scrollEl.scrollTo){scrollEl.scrollTo({top:0,behavior:'smooth'})}else{scrollEl.scrollTop=0}}
function onScroll(){const scrollTop=getScrollTop();if(scrollTop>=visibilityHeight){btn.classList.remove('d-backtop-hidden');btn.classList.add('d-backtop-visible')}else{btn.classList.remove('d-backtop-visible');btn.classList.add('d-backtop-hidden')}}
btn.addEventListener('click',scrollToTop);const scrollTarget=target||window;scrollTarget.addEventListener('scroll',onScroll,{passive:true});if(typeof requestAnimationFrame!=='undefined'){requestAnimationFrame(onScroll)}
btn._destroy=()=>{scrollTarget.removeEventListener('scroll',onScroll)};return btn}
return{BackTop}})();const _m72=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx,reactiveClass,reactiveAttr,resolve}=_m147;function InputGroup(props={},...children){injectBase();const{vertical=false,size,error,disabled,class:cls,...rest}=props;const className=cx(
'd-input-group',
vertical&&'d-input-group-vertical',
size&&`d-input-group-${size}`,
cls
);const el=h('div',{class:className,role:'group',...rest},...children);reactiveClass(el,error,className,cx(className,'d-input-group-error'));reactiveAttr(el,disabled,'data-disabled');return el}
InputGroup.Addon=function Addon(propsOrChild,...children){injectBase();if(propsOrChild==null||typeof propsOrChild==='string'||(propsOrChild&&propsOrChild.nodeType)){return h('div',{class:'d-input-group-addon'},
...(propsOrChild!=null?[propsOrChild,...children]:children))}
const{class:cls,...rest}=propsOrChild;return h('div',{class:cx('d-input-group-addon',cls),...rest},...children)};function CompactGroup(props={},...children){injectBase();const{class:cls,...rest}=props;return h('div',{class:cx('d-compact-group',cls),role:'group',...rest},...children)}
return{InputGroup,CompactGroup}})();const _m73=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx,reactiveAttr}=_m147;function InputNumber(props={}){injectBase();const{value,min=-Infinity,max=Infinity,step=1,precision,disabled,controls=true,placeholder,onchange,class:cls,...rest}=props;let current=typeof value==='function'?value():(value??0);const input=h('input',{type:'text',
inputmode:'decimal',
class:'d-inputnumber-input',
placeholder,
role:'spinbutton',
'aria-valuemin':min===-Infinity?undefined:String(min),
'aria-valuemax':max===Infinity?undefined:String(max),
'aria-valuenow':String(current),
...rest});function format(n){return precision!==undefined?n.toFixed(precision):String(n)}
function clamp(n){return Math.max(min,Math.min(max,n))}
function setValue(n){current=clamp(n);input.value=format(current);input.setAttribute('aria-valuenow',String(current));updateStepState();if(onchange)onchange(current)}
function updateStepState(){if(decBtn){current<=min?decBtn.setAttribute('disabled',''):decBtn.removeAttribute('disabled')}
if(incBtn){current>=max?incBtn.setAttribute('disabled',''):incBtn.removeAttribute('disabled')}}
input.value=format(current);input.addEventListener('change',()=>{const parsed=parseFloat(input.value);if(!isNaN(parsed))setValue(parsed); else input.value=format(current)});input.addEventListener('keydown',(e)=>{if(e.key==='ArrowUp'){e.preventDefault();setValue(current+step)} else if(e.key==='ArrowDown'){e.preventDefault();setValue(current-step)}});let decBtn=null,incBtn=null;const wrap=h('div',{class:cx('d-inputnumber',cls)});if(controls){decBtn=h('button',{type:'button',class:'d-inputnumber-step','aria-label':'Decrease'},'\u2212');incBtn=h('button',{type:'button',class:'d-inputnumber-step','aria-label':'Increase'},'+');decBtn.addEventListener('click',()=>setValue(current-step));incBtn.addEventListener('click',()=>setValue(current+step));wrap.appendChild(decBtn);wrap.appendChild(input);wrap.appendChild(incBtn);updateStepState()}else{wrap.appendChild(input)}
reactiveAttr(input,disabled,'disabled');if(typeof value==='function'){createEffect(()=>{current=value();input.value=format(current);input.setAttribute('aria-valuenow',String(current));updateStepState()})}
return wrap}
return{InputNumber}})();const _m74=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function InputOTP(props={}){injectBase();const{length=6,value,masked=false,separator,onComplete,onchange,disabled,class:cls}=props;const container=h('div',{class:cx('d-otp',cls),role:'group','aria-label':'One-time password'});const slots=[];function getValue(){return slots.map(s=>s.value).join('')}
function focusSlot(idx){if(idx>=0&&idx<slots.length)slots[idx].focus()}
for(let i=0;i<length;i++){if(separator&&i>0&&i%separator===0){container.appendChild(h('span',{class:'d-otp-separator'},'\u2013'))}
const slot=h('input',{type:masked?'password':'text',
inputmode:'numeric',
maxlength:'1',
class:'d-otp-slot',
'aria-label':`Digit ${i + 1}`,
autocomplete:'one-time-code',
disabled:disabled?'':undefined});slot.addEventListener('input',(e)=>{const val=slot.value.replace(/\D/g,'');slot.value=val.slice(0,1);if(val&&i<length-1)focusSlot(i+1);const full=getValue();if(onchange)onchange(full);if(full.length===length&&onComplete)onComplete(full)});slot.addEventListener('keydown',(e)=>{if(e.key==='Backspace'){if(!slot.value&&i>0){e.preventDefault();slots[i-1].value='';focusSlot(i-1)}}else if(e.key==='ArrowLeft'){e.preventDefault();focusSlot(i-1)}else if(e.key==='ArrowRight'){e.preventDefault();focusSlot(i+1)}});slot.addEventListener('paste',(e)=>{e.preventDefault();const text=(e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'');for(let j=0;j<Math.min(text.length,length-i);j++){slots[i+j].value=text[j]}
focusSlot(Math.min(i+text.length,length-1));const full=getValue();if(onchange)onchange(full);if(full.length===length&&onComplete)onComplete(full)});slot.addEventListener('focus',()=>slot.select());slots.push(slot);container.appendChild(slot)}
const initVal=typeof value==='function'?value():(value||'');for(let i=0;i<Math.min(initVal.length,length);i++){slots[i].value=initVal[i]}
return container}
return{InputOTP}})();const _m75=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;function Rate(props={}){injectBase();const{value=0,count=5,half=false,disabled=false,readonly=false,size,character='\u2605',onchange,class:cls}=props;let current=typeof value==='function'?value():value;let hoverVal=-1;const container=h('div',{class:cx('d-rate',size&&`d-rate-${size}`,cls),
role:'radiogroup',
'aria-label':'Rating',
'aria-disabled':(typeof disabled==='function'?disabled():disabled)?'true':'false'});const stars=[];function isDisabled(){return readonly||(typeof disabled==='function'?disabled():disabled)}
function updateStars(){const displayVal=hoverVal>=0?hoverVal:current;stars.forEach((star,i)=>{const val=i+1;const filled=displayVal>=val;const halfFilled=half&&displayVal>=val-0.5&&displayVal<val;star.style.opacity=filled?'1':halfFilled?'0.5':'0.2';star.setAttribute('aria-checked',filled||halfFilled?'true':'false')})}
for(let i=0;i<count;i++){const star=h('button',{type:'button',
class:'d-rate-star',
role:'radio',
'aria-label':`${i + 1} star${i > 0 ? 's' : ''}`,
tabindex:i===0?'0':'-1'},character);star.addEventListener('click',()=>{if(isDisabled())return;const newVal=i+1;current=current===newVal?0:newVal;updateStars();if(onchange)onchange(current)});if(half){star.addEventListener('mousemove',(e)=>{if(isDisabled())return;const rect=star.getBoundingClientRect();hoverVal=e.clientX<rect.left+rect.width/2?i+0.5:i+1;updateStars()})}else{star.addEventListener('mouseenter',()=>{if(isDisabled())return;hoverVal=i+1;updateStars()})}
star.addEventListener('keydown',(e)=>{if(isDisabled())return;if(e.key==='ArrowRight'||e.key==='ArrowUp'){e.preventDefault();const step=half?0.5:1;current=Math.min(count,current+step);updateStars();if(onchange)onchange(current);const next=Math.min(count-1,i+1);stars[next].focus()}else if(e.key==='ArrowLeft'||e.key==='ArrowDown'){e.preventDefault();const step=half?0.5:1;current=Math.max(0,current-step);updateStars();if(onchange)onchange(current);const prev=Math.max(0,i-1);stars[prev].focus()}});stars.push(star);container.appendChild(star)}
container.addEventListener('mouseleave',()=>{hoverVal=-1;updateStars()});updateStars();if(typeof value==='function'){createEffect(()=>{current=value();updateStars()})}
return container}
return{Rate}})();const _m76=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const{createOverlay,createDrag}=_m148;function ColorPicker(props={}){injectBase();const{value='#1366D9',alpha=false,presets,disabled,onchange,class:cls}=props;let current=typeof value==='function'?value():value;let _h=0,_s=100,_v=100,_a=1;function hexToHSV(hex){hex=hex.replace('#','');if(hex.length===3)hex=hex.split('').map(c=>c+c).join('');const r=parseInt(hex.substr(0,2),16)/255;const g=parseInt(hex.substr(2,2),16)/255;const b=parseInt(hex.substr(4,2),16)/255;const max=Math.max(r,g,b),min=Math.min(r,g,b);const d=max-min;let hue=0;if(d!==0){if(max===r)hue=((g-b)/d+6)%6; else if(max===g)hue=(b-r)/d+2; else hue=(r-g)/d+4;hue*=60}
return{h:hue,s:max===0?0:(d/max)*100,v:max*100}}
function hsvToHex(hue,sat,val){const s=sat/100,v=val/100;const c=v*s,x=c*(1-Math.abs((hue/60)%2-1)),m=v-c;let r,g,b;if(hue<60)[r,g,b]=[c,x,0]; else if(hue<120)[r,g,b]=[x,c,0]; else if(hue<180)[r,g,b]=[0,c,x]; else if(hue<240)[r,g,b]=[0,x,c]; else if(hue<300)[r,g,b]=[x,0,c]; else[r,g,b]=[c,0,x];const toHex=n=>Math.round((n+m)*255).toString(16).padStart(2,'0');return`#${toHex(r)}${toHex(g)}${toHex(b)}`}
const init=hexToHSV(current);_h=init.h;_s=init.s;_v=init.v;const swatch=h('div',{class:'d-colorpicker-swatch',style:{background:current}});const hexLabel=h('span',null,current);const trigger=h('button',{type:'button',
class:'d-colorpicker-trigger',
'aria-label':'Pick color'},swatch,hexLabel);const satThumb=h('div',{class:'d-colorpicker-thumb'});const satPanel=h('div',{class:'d-colorpicker-saturation'},satThumb);const hueThumb=h('div',{class:'d-colorpicker-thumb',style:{top:'50%'}});const hueBar=h('div',{class:'d-colorpicker-hue'},hueThumb);const panel=h('div',{class:'d-colorpicker-panel',style:{display:'none'}});panel.appendChild(satPanel);panel.appendChild(hueBar);if(presets&&presets.length){const presetsRow=h('div',{class:'d-colorpicker-presets'});presets.forEach(color=>{const p=h('button',{type:'button',
class:'d-colorpicker-preset',
style:{background:color},
'aria-label':color});p.addEventListener('click',()=>{current=color;const hsv=hexToHSV(color);_h=hsv.h;_s=hsv.s;_v=hsv.v;update()});presetsRow.appendChild(p)});panel.appendChild(presetsRow)}
const wrap=h('div',{class:cx('d-colorpicker',cls)},trigger,panel);function update(){current=hsvToHex(_h,_s,_v);swatch.style.background=current;hexLabel.textContent=current;satPanel.style.background=`linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(${_h},100%,50%))`;satThumb.style.left=`${_s}%`;satThumb.style.top=`${100 - _v}%`;hueThumb.style.left=`${(_h / 360) * 100}%`;if(onchange)onchange(current)}
createDrag(satPanel,{onMove(x,y){const rect=satPanel.getBoundingClientRect();_s=Math.max(0,Math.min(100,((x-rect.left)/rect.width)*100));_v=Math.max(0,Math.min(100,100-((y-rect.top)/rect.height)*100));update()}});createDrag(hueBar,{onMove(x){const rect=hueBar.getBoundingClientRect();_h=Math.max(0,Math.min(360,((x-rect.left)/rect.width)*360));update()}});createOverlay(trigger,panel,{trigger:'click',closeOnEscape:true,closeOnOutside:true});update();if(typeof value==='function'){createEffect(()=>{current=value();const hsv=hexToHSV(current);_h=hsv.h;_s=hsv.s;_v=hsv.v;update()})}
return wrap}
return{ColorPicker}})();const _m77=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const{createOverlay}=_m148;const{icon}=_m54;const DAYS=['Su','Mo','Tu','We','Th','Fr','Sa'];const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];function DatePicker(props={}){injectBase();const{value,placeholder='Select date',format='yyyy-MM-dd',min,max,disabledDate,disabled,onchange,class:cls}=props;let selected=parseDate(typeof value==='function'?value():value);let viewDate=selected?new Date(selected):new Date();let viewMode='day';function parseDate(v){if(!v)return null;if(v instanceof Date)return v;const d=new Date(v);return isNaN(d)?null:d}
function formatDate(d){if(!d)return'';const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return format.replace('yyyy',y).replace('MM',m).replace('dd',day)}
function isDateDisabled(d){if(min&&d<min)return true;if(max&&d>max)return true;if(disabledDate&&disabledDate(d))return true;return false}
function sameDay(a,b){return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
const displayEl=h('span',{class:'d-select-display'});const arrow=icon('calendar',{size:'1em',class:'d-select-arrow'});const trigger=h('button',{type:'button',
class:'d-select',
'aria-haspopup':'dialog',
'aria-expanded':'false'},displayEl,arrow);const panel=h('div',{class:'d-datepicker-panel',style:{display:'none'}});const wrap=h('div',{class:cx('d-datepicker',cls)},trigger,panel);function updateDisplay(){displayEl.textContent=selected?formatDate(selected):placeholder;if(!selected)displayEl.classList.add('d-select-placeholder'); else displayEl.classList.remove('d-select-placeholder')}
function renderDayView(){panel.replaceChildren();const year=viewDate.getFullYear();const month=viewDate.getMonth();const prevBtn=h('button',{type:'button',class:'d-datepicker-nav-btn','aria-label':'Previous month'},'\u2039');const nextBtn=h('button',{type:'button',class:'d-datepicker-nav-btn','aria-label':'Next month'},'\u203A');const titleBtn=h('button',{type:'button',class:'d-datepicker-title'},`${MONTHS[month]} ${year}`);prevBtn.addEventListener('click',()=>{viewDate.setMonth(month-1);renderDayView()});nextBtn.addEventListener('click',()=>{viewDate.setMonth(month+1);renderDayView()});titleBtn.addEventListener('click',()=>{viewMode='month';renderMonthView()});const header=h('div',{class:'d-datepicker-header'},
h('div',{class:'d-datepicker-nav'},prevBtn),
titleBtn,
h('div',{class:'d-datepicker-nav'},nextBtn)
);panel.appendChild(header);const grid=h('div',{class:'d-datepicker-grid',role:'grid'});DAYS.forEach(d=>grid.appendChild(h('div',{class:'d-datepicker-weekday'},d)));const firstDay=new Date(year,month,1).getDay();const daysInMonth=new Date(year,month+1,0).getDate();const daysInPrev=new Date(year,month,0).getDate();const today=new Date();for(let i=firstDay-1;i>=0;i--){const d=new Date(year,month-1,daysInPrev-i);const btn=h('button',{type:'button',class:'d-datepicker-day d-datepicker-day-outside',tabindex:'-1'},String(daysInPrev-i));btn.addEventListener('click',()=>selectDate(d));grid.appendChild(btn)}
for(let i=1;i<=daysInMonth;i++){const d=new Date(year,month,i);const dis=isDateDisabled(d);const cls=cx(
'd-datepicker-day',
sameDay(d,today)&&'d-datepicker-day-today',
sameDay(d,selected)&&'d-datepicker-day-selected',
dis&&'d-datepicker-day-disabled'
);const btn=h('button',{type:'button',class:cls,tabindex:'-1',disabled:dis?'':undefined},String(i));if(!dis)btn.addEventListener('click',()=>selectDate(d));grid.appendChild(btn)}
const totalCells=firstDay+daysInMonth;const remaining=(7-(totalCells%7))%7;for(let i=1;i<=remaining;i++){const d=new Date(year,month+1,i);const btn=h('button',{type:'button',class:'d-datepicker-day d-datepicker-day-outside',tabindex:'-1'},String(i));btn.addEventListener('click',()=>selectDate(d));grid.appendChild(btn)}
panel.appendChild(grid)}
function renderMonthView(){panel.replaceChildren();const year=viewDate.getFullYear();const prevBtn=h('button',{type:'button',class:'d-datepicker-nav-btn','aria-label':'Previous year'},'\u2039');const nextBtn=h('button',{type:'button',class:'d-datepicker-nav-btn','aria-label':'Next year'},'\u203A');const titleBtn=h('button',{type:'button',class:'d-datepicker-title'},String(year));prevBtn.addEventListener('click',()=>{viewDate.setFullYear(year-1);renderMonthView()});nextBtn.addEventListener('click',()=>{viewDate.setFullYear(year+1);renderMonthView()});titleBtn.addEventListener('click',()=>{viewMode='year';renderYearView()});panel.appendChild(h('div',{class:'d-datepicker-header'},
h('div',{class:'d-datepicker-nav'},prevBtn),
titleBtn,
h('div',{class:'d-datepicker-nav'},nextBtn)
));const grid=h('div',{class:'d-datepicker-months'});MONTHS.forEach((m,i)=>{const isSelected=selected&&selected.getFullYear()===year&&selected.getMonth()===i;const btn=h('button',{type:'button',
class:cx('d-datepicker-month',isSelected&&'d-datepicker-day-selected')},m);btn.addEventListener('click',()=>{viewDate.setMonth(i);viewMode='day';renderDayView()});grid.appendChild(btn)});panel.appendChild(grid)}
function renderYearView(){panel.replaceChildren();const year=viewDate.getFullYear();const startYear=Math.floor(year/12)*12;const prevBtn=h('button',{type:'button',class:'d-datepicker-nav-btn'},'\u2039');const nextBtn=h('button',{type:'button',class:'d-datepicker-nav-btn'},'\u203A');const title=h('span',{class:'d-datepicker-title'},`${startYear} - ${startYear + 11}`);prevBtn.addEventListener('click',()=>{viewDate.setFullYear(year-12);renderYearView()});nextBtn.addEventListener('click',()=>{viewDate.setFullYear(year+12);renderYearView()});panel.appendChild(h('div',{class:'d-datepicker-header'},
h('div',{class:'d-datepicker-nav'},prevBtn),
title,
h('div',{class:'d-datepicker-nav'},nextBtn)
));const grid=h('div',{class:'d-datepicker-years'});for(let i=0;i<12;i++){const y=startYear+i;const isSelected=selected&&selected.getFullYear()===y;const btn=h('button',{type:'button',
class:cx('d-datepicker-year',isSelected&&'d-datepicker-day-selected')},String(y));btn.addEventListener('click',()=>{viewDate.setFullYear(y);viewMode='month';renderMonthView()});grid.appendChild(btn)}
panel.appendChild(grid)}
function selectDate(d){selected=d;viewDate=new Date(d);updateDisplay();overlay.close();if(onchange)onchange(d)}
const overlay=createOverlay(trigger,panel,{trigger:'click',
closeOnEscape:true,
closeOnOutside:true,
onOpen:()=>{viewMode='day';renderDayView()}});updateDisplay();if(typeof value==='function'){createEffect(()=>{selected=parseDate(value());if(selected)viewDate=new Date(selected);updateDisplay()})}
return wrap}
return{DatePicker}})();const _m78=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const{createOverlay}=_m148;const{icon}=_m54;function TimePicker(props={}){injectBase();const{value,placeholder='Select time',seconds=false,use12h=false,hourStep=1,minuteStep=1,secondStep=1,disabled,onchange,class:cls}=props;let _h=0,_m=0,_s=0,_period='AM';function parseTime(v){if(!v)return;const parts=v.split(':').map(Number);_h=parts[0]||0;_m=parts[1]||0;_s=parts[2]||0;if(use12h){_period=_h>=12?'PM':'AM';_h=_h%12||12}}
function formatTime(){let hour=_h;if(use12h)hour=_period==='PM'?(_h===12?12:_h+12):(_h===12?0:_h);const hh=String(hour).padStart(2,'0');const mm=String(_m).padStart(2,'0');if(seconds){const ss=String(_s).padStart(2,'0');return`${hh}:${mm}:${ss}`}
return`${hh}:${mm}`}
function displayTime(){const hh=String(_h).padStart(2,'0');const mm=String(_m).padStart(2,'0');let t=`${hh}:${mm}`;if(seconds)t+=`:${String(_s).padStart(2, '0')}`;if(use12h)t+=` ${_period}`;return t}
parseTime(typeof value==='function'?value():value);const displayEl=h('span',{class:'d-select-display'});const trigger=h('button',{type:'button',
class:'d-select',
'aria-haspopup':'dialog',
'aria-expanded':'false'},displayEl,icon('clock',{size:'1em',class:'d-select-arrow'}));const panel=h('div',{class:'d-timepicker-panel',style:{display:'none'}});const wrap=h('div',{class:cx('d-timepicker',cls)},trigger,panel);function updateDisplay(){const initVal=typeof value==='function'?value():value;displayEl.textContent=initVal||_h||_m||_s?displayTime():placeholder;if(!initVal&&!_h&&!_m&&!_s)displayEl.classList.add('d-select-placeholder'); else displayEl.classList.remove('d-select-placeholder')}
function createColumn(count,step,selected,onSelect){const col=h('div',{class:'d-timepicker-column'});for(let i=0;i<count;i+=step){const cell=h('button',{type:'button',
class:cx('d-timepicker-cell',i===selected&&'d-timepicker-cell-selected'),
tabindex:'-1'},String(i).padStart(2,'0'));cell.addEventListener('click',()=>{onSelect(i);col.querySelectorAll('.d-timepicker-cell').forEach(c=>c.classList.remove('d-timepicker-cell-selected'));cell.classList.add('d-timepicker-cell-selected');emitChange()});col.appendChild(cell)}
requestAnimationFrame(()=>{const sel=col.querySelector('.d-timepicker-cell-selected');if(sel)sel.scrollIntoView({block:'center'})});return col}
function emitChange(){updateDisplay();if(onchange)onchange(formatTime())}
function renderPanel(){panel.replaceChildren();const maxH=use12h?13:24;const startH=use12h?1:0;const hourCol=h('div',{class:'d-timepicker-column'});for(let i=startH;i<maxH;i+=hourStep){const cell=h('button',{type:'button',
class:cx('d-timepicker-cell',i===_h&&'d-timepicker-cell-selected'),
tabindex:'-1'},String(i).padStart(2,'0'));cell.addEventListener('click',()=>{_h=i;hourCol.querySelectorAll('.d-timepicker-cell').forEach(c=>c.classList.remove('d-timepicker-cell-selected'));cell.classList.add('d-timepicker-cell-selected');emitChange()});hourCol.appendChild(cell)}
panel.appendChild(hourCol);panel.appendChild(createColumn(60,minuteStep,_m,(v)=>{_m=v}));if(seconds)panel.appendChild(createColumn(60,secondStep,_s,(v)=>{_s=v}));if(use12h){const periodCol=h('div',{class:'d-timepicker-column'});['AM','PM'].forEach(p=>{const cell=h('button',{type:'button',
class:cx('d-timepicker-cell',p===_period&&'d-timepicker-cell-selected'),
tabindex:'-1'},p);cell.addEventListener('click',()=>{_period=p;periodCol.querySelectorAll('.d-timepicker-cell').forEach(c=>c.classList.remove('d-timepicker-cell-selected'));cell.classList.add('d-timepicker-cell-selected');emitChange()});periodCol.appendChild(cell)});panel.appendChild(periodCol)}
requestAnimationFrame(()=>{panel.querySelectorAll('.d-timepicker-cell-selected').forEach(el=>el.scrollIntoView({block:'center'}))})}
createOverlay(trigger,panel,{trigger:'click',
closeOnEscape:true,
closeOnOutside:true,
onOpen:renderPanel});updateDisplay();if(typeof value==='function'){createEffect(()=>{parseTime(value());updateDisplay()})}
return wrap}
return{TimePicker}})();const _m79=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Upload(props={},...children){injectBase();const{multiple=false,accept,drag=false,maxSize,maxCount,onchange,onRemove,customRequest,disabled,class:cls}=props;const files=[];const fileInput=h('input',{type:'file',
class:'d-upload-input',
multiple:multiple?'':undefined,
accept});const fileList=h('div',{class:'d-upload-list'});const container=h('div',{class:cx('d-upload',cls)});function addFiles(newFiles){for(const file of newFiles){if(maxSize&&file.size>maxSize)continue;if(maxCount&&files.length>=maxCount)break;files.push(file);renderFileItem(file);if(customRequest)customRequest(file)}
if(onchange)onchange([...files])}
function removeFile(file){const idx=files.indexOf(file);if(idx>=0)files.splice(idx,1);renderFileList();if(onRemove)onRemove(file);if(onchange)onchange([...files])}
function renderFileItem(file){const item=h('div',{class:'d-upload-item'});item.appendChild(h('span',{class:'d-upload-item-name'},file.name));const removeBtn=h('button',{type:'button',class:'d-upload-item-remove','aria-label':`Remove ${file.name}`},'\u00d7');removeBtn.addEventListener('click',()=>removeFile(file));item.appendChild(removeBtn);fileList.appendChild(item)}
function renderFileList(){fileList.replaceChildren();files.forEach(renderFileItem)}
fileInput.addEventListener('change',()=>{if(fileInput.files.length)addFiles(fileInput.files);fileInput.value=''});if(drag){const dragger=h('div',{class:'d-upload-dragger'},
...children.length?children:[h('span',null,'Click or drag files here')]
);dragger.addEventListener('click',()=>{if(typeof disabled==='function'?disabled():disabled)return;fileInput.click()});dragger.addEventListener('dragover',(e)=>{e.preventDefault();dragger.classList.add('d-upload-dragger-active')});dragger.addEventListener('dragleave',()=>{dragger.classList.remove('d-upload-dragger-active')});dragger.addEventListener('drop',(e)=>{e.preventDefault();dragger.classList.remove('d-upload-dragger-active');if(e.dataTransfer.files.length)addFiles(e.dataTransfer.files)});container.appendChild(fileInput);container.appendChild(dragger)}else{const triggerBtn=children.length
?h('div',{style:{cursor:'pointer'}},...children)
:h('button',{type:'button',class:'d-btn d-btn-default'},'Upload');triggerBtn.addEventListener('click',()=>{if(typeof disabled==='function'?disabled():disabled)return;fileInput.click()});container.appendChild(fileInput);container.appendChild(triggerBtn)}
container.appendChild(fileList);return container}
return{Upload}})();const _m80=(function(){const{h}=_m2;const{createEffect,createSignal}=_m14;const{injectBase,cx}=_m147;function Transfer(props={}){injectBase();const{dataSource=[],targetKeys:initTarget=[],searchable=false,titles=['Source','Target'],onchange,class:cls}=props;let targetKeys=[...initTarget];let leftChecked=new Set();let rightChecked=new Set();const container=h('div',{class:cx('d-transfer',cls)});function getLeftItems(){return dataSource.filter(d=>!targetKeys.includes(d.key))}
function getRightItems(){return dataSource.filter(d=>targetKeys.includes(d.key))}
function renderPanel(items,checked,searchFilter,title){const panel=h('div',{class:'d-transfer-panel'});const allChecked=items.length>0&&items.filter(i=>!i.disabled).every(i=>checked.has(i.key));const selectAll=h('input',{type:'checkbox'});selectAll.checked=allChecked;selectAll.indeterminate=checked.size>0&&!allChecked;selectAll.addEventListener('change',()=>{if(selectAll.checked)items.filter(i=>!i.disabled).forEach(i=>checked.add(i.key)); else checked.clear();render()});const header=h('div',{class:'d-transfer-header'},
h('label',{style:{display:'flex',alignItems:'center',gap:'var(--d-sp-2)',cursor:'pointer'}},
selectAll,
h('span',null,`${checked.size}/${items.length}`)
),
h('span',null,title)
);panel.appendChild(header);let filteredItems=items;if(searchable){const search=h('input',{type:'text',
class:'d-input',
placeholder:'Search...',
style:{fontSize:'var(--d-text-sm)'}});search.addEventListener('input',()=>{searchFilter.value=search.value.toLowerCase();render()});panel.appendChild(h('div',{class:'d-transfer-search'},search));if(searchFilter.value){filteredItems=items.filter(i=>i.label.toLowerCase().includes(searchFilter.value))}}
const body=h('div',{class:'d-transfer-body'});filteredItems.forEach(item=>{const cb=h('input',{type:'checkbox',disabled:item.disabled?'':undefined});cb.checked=checked.has(item.key);cb.addEventListener('change',()=>{if(cb.checked)checked.add(item.key); else checked.delete(item.key);render()});const row=h('div',{class:cx('d-transfer-item',item.disabled&&'d-transfer-item-disabled')},cb,h('span',null,item.label));if(!item.disabled){row.addEventListener('click',(e)=>{if(e.target===cb)return;cb.checked=!cb.checked;if(cb.checked)checked.add(item.key); else checked.delete(item.key);render()})}
body.appendChild(row)});panel.appendChild(body);return panel}
const leftSearch={value:''};const rightSearch={value:''};function render(){container.replaceChildren();const leftItems=getLeftItems();const rightItems=getRightItems();const leftPanel=renderPanel(leftItems,leftChecked,leftSearch,titles[0]);const rightPanel=renderPanel(rightItems,rightChecked,rightSearch,titles[1]);const moveRight=h('button',{type:'button',
class:'d-btn d-btn-sm',
disabled:leftChecked.size===0?'':undefined,
'aria-label':'Move to target'},'\u203A');const moveLeft=h('button',{type:'button',
class:'d-btn d-btn-sm',
disabled:rightChecked.size===0?'':undefined,
'aria-label':'Move to source'},'\u2039');moveRight.addEventListener('click',()=>{const moved=[...leftChecked];targetKeys=[...targetKeys,...moved];leftChecked.clear();render();if(onchange)onchange(targetKeys,'right',moved)});moveLeft.addEventListener('click',()=>{const moved=[...rightChecked];targetKeys=targetKeys.filter(k=>!rightChecked.has(k));rightChecked.clear();render();if(onchange)onchange(targetKeys,'left',moved)});const actions=h('div',{class:'d-transfer-actions'},moveRight,moveLeft);container.appendChild(leftPanel);container.appendChild(actions);container.appendChild(rightPanel)}
render();return container}
return{Transfer}})();const _m81=(function(){const{h}=_m2;const{createSignal,createEffect}=_m14;const{injectBase,cx}=_m147;const{createOverlay,caret}=_m148;function Cascader(props={}){injectBase();const{options=[],value,onChange,placeholder='Select',disabled=false,
clearable=true,separator=' / ',expandTrigger='click',
searchable=false,class:cls}=props;const[selectedPath,setSelectedPath]=createSignal(value||[]);const[columns,setColumns]=createSignal([options]);const displayInput=h('input',{type:'text',
class:'d-cascader-input',
placeholder,
readonly:!searchable,
disabled:disabled||undefined});const clearBtn=h('button',{type:'button',class:'d-cascader-clear','aria-label':'Clear',style:{display:'none'}},'\u00d7');const trigger=h('div',{class:cx('d-cascader-trigger',disabled&&'d-cascader-disabled',cls),
tabindex:disabled?undefined:'0'},displayInput,clearBtn);const dropdown=h('div',{class:'d-cascader-dropdown',
style:{display:'none'}});const wrap=h('div',{class:'d-cascader'},trigger,dropdown);const overlay=createOverlay(trigger,dropdown,{trigger:disabled?'manual':'click',
closeOnEscape:true,
closeOnOutside:true,
onOpen:()=>{wrap.classList.add('d-cascader-open')},
onClose:()=>{wrap.classList.remove('d-cascader-open');if(searchable)displayInput.value=getDisplayText()}});function getDisplayText(){const path=selectedPath();if(!path.length)return'';const labels=[];let current=options;for(const val of path){const opt=current.find(o=>o.value===val);if(!opt)break;labels.push(opt.label);current=opt.children||[]}
return labels.join(separator)}
function renderColumns(){const cols=columns();dropdown.replaceChildren();cols.forEach((colOptions,colIdx)=>{const colEl=h('div',{class:'d-cascader-column',role:'listbox'});colOptions.forEach(opt=>{const isSelected=selectedPath()[colIdx]===opt.value;const hasChildren=opt.children&&opt.children.length>0;const itemEl=h('div',{class:cx('d-cascader-option',isSelected&&'d-cascader-option-active',opt.disabled&&'d-cascader-option-disabled'),
role:'option',
'aria-selected':isSelected?'true':'false',
tabindex:'-1'},
h('span',{class:'d-cascader-option-label'},opt.label),
hasChildren?caret('right',{class:'d-cascader-option-arrow'}):null
);if(!opt.disabled){const selectItem=()=>{const newPath=selectedPath().slice(0,colIdx);newPath[colIdx]=opt.value;if(hasChildren){const newCols=cols.slice(0,colIdx+1);newCols.push(opt.children);setColumns(newCols);setSelectedPath(newPath)}else{setSelectedPath(newPath);setColumns([options]);displayInput.value=getDisplayText();overlay.close();if(onChange){const selectedOpts=[];let cur=options;for(const v of newPath){const o=cur.find(x=>x.value===v);if(o){selectedOpts.push(o);cur=o.children||[]}}
onChange(newPath,selectedOpts)}}
renderColumns()};if(expandTrigger==='hover'&&hasChildren){itemEl.addEventListener('mouseenter',selectItem)}
itemEl.addEventListener('click',selectItem)}
colEl.appendChild(itemEl)});dropdown.appendChild(colEl)})}
if(clearable){clearBtn.addEventListener('click',(e)=>{e.stopPropagation();setSelectedPath([]);setColumns([options]);displayInput.value='';clearBtn.style.display='none';if(onChange)onChange([],[])})}
if(searchable){displayInput.removeAttribute('readonly');displayInput.addEventListener('input',()=>{const q=displayInput.value.toLowerCase();if(!q){setColumns([options]);renderColumns();return}
const flat=[];function walk(opts,path,labels){opts.forEach(o=>{const newPath=[...path,o.value];const newLabels=[...labels,o.label];if(o.children&&o.children.length)walk(o.children,newPath,newLabels); else flat.push({label:newLabels.join(separator),value:newPath,option:o})})}
walk(options,[],[]);const filtered=flat.filter(f=>f.label.toLowerCase().includes(q));const searchCol=filtered.map(f=>({label:f.label,value:f.value.join(','),children:null,_path:f.value}));setColumns([searchCol]);renderColumns()})}
createEffect(()=>{const path=selectedPath();displayInput.value=getDisplayText();clearBtn.style.display=(clearable&&path.length)?'':'none'});createEffect(()=>{renderColumns()});return wrap}
return{Cascader}})();const _m82=(function(){const{h}=_m2;const{injectBase,cx}=_m147;const{createListbox}=_m148;function Mentions(props={}){injectBase();const{options=[],prefix='@',value,placeholder,rows=3,disabled,onchange,onSelect,class:cls}=props;let mentionStart=-1;let mentionQuery='';const textarea=h('textarea',{class:'d-textarea',
placeholder,
rows:String(rows),
disabled:(typeof disabled==='function'?disabled():disabled)?'':undefined});if(typeof value==='function')textarea.value=value(); else if(value)textarea.value=value;const dropdown=h('div',{class:'d-mentions-dropdown',
role:'listbox',
style:{display:'none'}});const wrap=h('div',{class:cx('d-mentions',cls)});const textWrap=h('div',{class:'d-textarea-wrap'},textarea);wrap.appendChild(textWrap);wrap.appendChild(dropdown);const listbox=createListbox(dropdown,{itemSelector:'.d-mentions-option',
activeClass:'d-option-active',
orientation:'vertical',
onSelect:(el)=>{const val=el.dataset.value;insertMention(val)}});function showDropdown(filtered){dropdown.replaceChildren();if(!filtered.length){dropdown.style.display='none';return}
filtered.forEach(opt=>{const el=h('div',{class:'d-mentions-option',
role:'option',
'data-value':opt.value},opt.label);el.addEventListener('click',()=>insertMention(opt.value));dropdown.appendChild(el)});dropdown.style.display='';listbox.highlight(0)}
function hideDropdown(){dropdown.style.display='none';mentionStart=-1;mentionQuery=''}
function insertMention(val){const text=textarea.value;const before=text.slice(0,mentionStart);const after=text.slice(textarea.selectionStart);textarea.value=`${before}${prefix}${val} ${after}`;const cursorPos=before.length+prefix.length+val.length+1;textarea.setSelectionRange(cursorPos,cursorPos);textarea.focus();hideDropdown();if(onSelect)onSelect(val);if(onchange)onchange(textarea.value)}
textarea.addEventListener('input',()=>{const pos=textarea.selectionStart;const text=textarea.value;let triggerIdx=-1;for(let i=pos-1;i>=0;i--){if(text[i]===prefix){triggerIdx=i;break}
if(text[i]===' '||text[i]==='\n')break}
if(triggerIdx>=0){mentionStart=triggerIdx;mentionQuery=text.slice(triggerIdx+prefix.length,pos).toLowerCase();const filtered=options.filter(o=>
o.label.toLowerCase().includes(mentionQuery)||o.value.toLowerCase().includes(mentionQuery)
);showDropdown(filtered)}else{hideDropdown()}
if(onchange)onchange(textarea.value)});textarea.addEventListener('keydown',(e)=>{if(dropdown.style.display!=='none'){if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='Enter'){e.preventDefault();listbox.handleKeydown(e)}else if(e.key==='Escape'){hideDropdown()}}});textarea.addEventListener('blur',()=>{setTimeout(hideDropdown,150)});return wrap}
return{Mentions}})();const _m83=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Label(props={},...children){injectBase();const{for:htmlFor,required,class:cls,...rest}=props;return h('label',{class:cx('d-label',required&&'d-label-required',cls),
for:htmlFor,
...rest},...children)}
return{Label}})();const _m84=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const{createFormField}=_m148;function Form(props={},...children){injectBase();const{layout='vertical',onSubmit,class:cls,...rest}=props;const form=h('form',{class:cx('d-form',layout==='horizontal'&&'d-form-horizontal',layout==='inline'&&'d-form-inline',cls),
...rest},...children);form.addEventListener('submit',(e)=>{e.preventDefault();if(onSubmit)onSubmit(e)});return form}
Form.Actions=function Actions(props={},...children){injectBase();const{class:cls,...rest}=props;return h('div',{class:cx('d-form-actions',cls),...rest},...children)};function Field(props={},...children){injectBase();const{label,error,help,required,class:cls,...rest}=props;const wrapper=h('div',{class:cx('d-field',cls),...rest});if(label){const labelEl=h('label',{class:'d-field-label'},label);if(required){labelEl.appendChild(h('span',{class:'d-field-required','aria-hidden':'true'},' *'))}
wrapper.appendChild(labelEl)}
children.forEach(child=>{if(child&&child.nodeType)wrapper.appendChild(child)});if(help){wrapper.appendChild(h('div',{class:'d-field-help'},help))}
if(error){const errEl=h('div',{class:'d-field-error',role:'alert'});wrapper.appendChild(errEl);if(typeof error==='function'){createEffect(()=>{const msg=error();errEl.textContent=msg||'';errEl.style.display=msg?'':'none'})}else{errEl.textContent=error}}
return wrapper}
return{Form,Field,createFormField}})();const _m85=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const{createOverlay}=_m148;const DAYS=['Su','Mo','Tu','We','Th','Fr','Sa'];const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];function DateRangePicker(props={}){injectBase();const{value,placeholder='Select range',min,max,onchange,disabled,class:cls}=props;let rangeStart=null;let rangeEnd=null;let hoverDate=null;let picking=false;let leftDate=new Date();let rightDate=new Date();rightDate.setMonth(rightDate.getMonth()+1);function parseRange(v){if(!v||!Array.isArray(v))return;const s=v[0]instanceof Date?v[0]:v[0]?new Date(v[0]):null;const e=v[1]instanceof Date?v[1]:v[1]?new Date(v[1]):null;if(s&&!isNaN(s))rangeStart=s;if(e&&!isNaN(e))rangeEnd=e;if(rangeStart){leftDate=new Date(rangeStart);rightDate=new Date(rangeStart);rightDate.setMonth(rightDate.getMonth()+1)}}
parseRange(typeof value==='function'?value():value);function formatDate(d){if(!d)return'';return`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`}
function sameDay(a,b){return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
function isDisabled(d){if(min&&d<min)return true;if(max&&d>max)return true;return false}
function inRange(d,start,end){if(!start||!end)return false;const t=d.getTime();return t>=start.getTime()&&t<=end.getTime()}
const displayEl=h('span',{class:'d-select-display'});const arrow=h('span',{class:'d-select-arrow'},'\uD83D\uDCC5');const trigger=h('button',{type:'button',
class:'d-select',
'aria-haspopup':'dialog',
'aria-expanded':'false'},displayEl,arrow);const panel=h('div',{class:'d-daterange-panel',style:{display:'none'}});const wrap=h('div',{class:cx('d-daterange',cls)},trigger,panel);function updateDisplay(){if(rangeStart&&rangeEnd){displayEl.textContent=`${formatDate(rangeStart)} — ${formatDate(rangeEnd)}`;displayEl.classList.remove('d-select-placeholder')}else{displayEl.textContent=placeholder;displayEl.classList.add('d-select-placeholder')}}
function selectDay(d){if(isDisabled(d))return;if(!picking){rangeStart=d;rangeEnd=null;picking=true;renderPanel()}else{if(d<rangeStart){rangeEnd=rangeStart;rangeStart=d}else{rangeEnd=d}
picking=false;hoverDate=null;updateDisplay();overlay.close();if(onchange)onchange([rangeStart,rangeEnd])}}
function applyPreset(start,end){rangeStart=start;rangeEnd=end;picking=false;hoverDate=null;leftDate=new Date(start);rightDate=new Date(start);rightDate.setMonth(rightDate.getMonth()+1);updateDisplay();overlay.close();if(onchange)onchange([rangeStart,rangeEnd])}
function getPresets(){const today=new Date();today.setHours(0,0,0,0);const d=(offset)=>{const r=new Date(today);r.setDate(r.getDate()+offset);return r};const monthStart=new Date(today.getFullYear(),today.getMonth(),1);const lastMonthStart=new Date(today.getFullYear(),today.getMonth()-1,1);const lastMonthEnd=new Date(today.getFullYear(),today.getMonth(),0);return[
{label:'Today',start:today,end:today},
{label:'Last 7 days',start:d(-6),end:today},
{label:'Last 30 days',start:d(-29),end:today},
{label:'This month',start:monthStart,end:today},
{label:'Last month',start:lastMonthStart,end:lastMonthEnd},
]}
function renderCalendar(container,viewDate){container.replaceChildren();const year=viewDate.getFullYear();const month=viewDate.getMonth();const prevBtn=h('button',{type:'button',class:'d-datepicker-nav-btn','aria-label':'Previous month'},'\u2039');const nextBtn=h('button',{type:'button',class:'d-datepicker-nav-btn','aria-label':'Next month'},'\u203A');const title=h('span',{class:'d-datepicker-title'},`${MONTHS[month]} ${year}`);prevBtn.addEventListener('click',()=>{leftDate.setMonth(leftDate.getMonth()-1);rightDate.setMonth(rightDate.getMonth()-1);renderPanel()});nextBtn.addEventListener('click',()=>{leftDate.setMonth(leftDate.getMonth()+1);rightDate.setMonth(rightDate.getMonth()+1);renderPanel()});container.appendChild(h('div',{class:'d-datepicker-header'},
h('div',{class:'d-datepicker-nav'},prevBtn),
title,
h('div',{class:'d-datepicker-nav'},nextBtn)
));const grid=h('div',{class:'d-datepicker-grid',role:'grid'});DAYS.forEach(d=>grid.appendChild(h('div',{class:'d-datepicker-weekday'},d)));const firstDay=new Date(year,month,1).getDay();const daysInMonth=new Date(year,month+1,0).getDate();const daysInPrev=new Date(year,month,0).getDate();const today=new Date();const effStart=rangeStart;const effEnd=picking&&hoverDate?(hoverDate>=rangeStart?hoverDate:rangeStart):rangeEnd;const effMin=effStart&&effEnd&&effEnd<effStart?effEnd:effStart;const effMax=effStart&&effEnd&&effEnd<effStart?effStart:effEnd;function dayClasses(d){const classes=['d-datepicker-day'];if(sameDay(d,today))classes.push('d-datepicker-day-today');if(isDisabled(d))classes.push('d-datepicker-day-disabled');if(effMin&&effMax){if(sameDay(d,effMin))classes.push('d-datepicker-day-selected','d-datepicker-day-range-start');if(sameDay(d,effMax))classes.push('d-datepicker-day-selected','d-datepicker-day-range-end');if(inRange(d,effMin,effMax)&&!sameDay(d,effMin)&&!sameDay(d,effMax)){classes.push('d-datepicker-day-in-range')}}else if(effMin&&sameDay(d,effMin)){classes.push('d-datepicker-day-selected')}
return classes.join(' ')}
for(let i=firstDay-1;i>=0;i--){grid.appendChild(h('div',{class:'d-datepicker-day d-datepicker-day-outside'},String(daysInPrev-i)))}
for(let i=1;i<=daysInMonth;i++){const d=new Date(year,month,i);const dis=isDisabled(d);const btn=h('button',{type:'button',
class:dayClasses(d),
tabindex:'-1',
disabled:dis?'':undefined},String(i));if(!dis){btn.addEventListener('click',()=>selectDay(d));btn.addEventListener('mouseenter',()=>{if(picking){hoverDate=d;renderPanel()}})}
grid.appendChild(btn)}
const totalCells=firstDay+daysInMonth;const remaining=(7-(totalCells%7))%7;for(let i=1;i<=remaining;i++){grid.appendChild(h('div',{class:'d-datepicker-day d-datepicker-day-outside'},String(i)))}
container.appendChild(grid)}
function renderPanel(){panel.replaceChildren();const presets=h('div',{class:'d-daterange-presets'});getPresets().forEach(p=>{const btn=h('button',{type:'button',class:'d-daterange-preset'},p.label);btn.addEventListener('click',()=>applyPreset(p.start,p.end));presets.appendChild(btn)});const leftCal=h('div',{class:'d-daterange-calendar'});const rightCal=h('div',{class:'d-daterange-calendar'});renderCalendar(leftCal,leftDate);renderCalendar(rightCal,rightDate);const calendars=h('div',{class:'d-daterange-calendars'},leftCal,rightCal);panel.appendChild(presets);panel.appendChild(calendars)}
const overlay=createOverlay(trigger,panel,{trigger:'click',
closeOnEscape:true,
closeOnOutside:true,
onOpen:()=>{picking=false;hoverDate=null;if(rangeStart){leftDate=new Date(rangeStart);rightDate=new Date(rangeStart);rightDate.setMonth(rightDate.getMonth()+1)}
renderPanel()},
onClose:()=>{picking=false;hoverDate=null}});if(typeof disabled==='function'){createEffect(()=>{trigger.disabled=disabled();trigger.setAttribute('aria-disabled',String(!!disabled()))})}else if(disabled){trigger.disabled=true;trigger.setAttribute('aria-disabled','true')}
if(typeof value==='function'){createEffect(()=>{parseRange(value());updateDisplay()})}
updateDisplay();return wrap}
return{DateRangePicker}})();const _m86=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const{createOverlay}=_m148;function TimeRangePicker(props={}){injectBase();const{value,placeholder='Select time range',onchange,disabled,class:cls}=props;let _sh=9,_sm=0,_eh=17,_em=0;let _hasValue=false;function parseValue(v){if(!v||!Array.isArray(v)||v.length<2)return;const sp=(v[0]||'').split(':').map(Number);const ep=(v[1]||'').split(':').map(Number);_sh=sp[0]||0;_sm=sp[1]||0;_eh=ep[0]||0;_em=ep[1]||0;_hasValue=true}
parseValue(typeof value==='function'?value():value);function formatTime(hh,mm){return`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`}
function toMinutes(hh,mm){return hh*60+mm}
function isValid(){return toMinutes(_eh,_em)>toMinutes(_sh,_sm)}
const displayEl=h('span',{class:'d-select-display'});const trigger=h('button',{type:'button',
class:'d-select',
'aria-haspopup':'dialog',
'aria-expanded':'false'},displayEl,h('span',{class:'d-select-arrow'},'\u23F0'));const panel=h('div',{class:'d-timerange-panel',style:{display:'none'}});const wrap=h('div',{class:cx('d-timerange',cls)},trigger,panel);function updateDisplay(){if(_hasValue){displayEl.textContent=`${formatTime(_sh, _sm)} — ${formatTime(_eh, _em)}`;displayEl.classList.remove('d-select-placeholder')}else{displayEl.textContent=placeholder;displayEl.classList.add('d-select-placeholder')}}
function emitChange(){_hasValue=true;updateDisplay();if(onchange)onchange([formatTime(_sh,_sm),formatTime(_eh,_em)])}
function createColumn(count,step,selected,onSelect){const col=h('div',{class:'d-timepicker-column'});for(let i=0;i<count;i+=step){const cell=h('button',{type:'button',
class:cx('d-timepicker-cell',i===selected&&'d-timepicker-cell-selected'),
tabindex:'-1'},String(i).padStart(2,'0'));cell.addEventListener('click',()=>{onSelect(i);col.querySelectorAll('.d-timepicker-cell').forEach(c=>c.classList.remove('d-timepicker-cell-selected'));cell.classList.add('d-timepicker-cell-selected');renderValidation();emitChange()});col.appendChild(cell)}
requestAnimationFrame(()=>{const sel=col.querySelector('.d-timepicker-cell-selected');if(sel)sel.scrollIntoView({block:'center'})});return col}
let errorEl=null;function renderValidation(){if(!errorEl)return;if(!isValid()){errorEl.textContent='End time must be after start time';errorEl.style.display=''}else{errorEl.textContent='';errorEl.style.display='none'}}
function renderPanel(){panel.replaceChildren();const startLabel=h('div',{class:'d-timerange-label'},'Start');const startCols=h('div',{class:'d-timerange-columns'},
createColumn(24,1,_sh,(v)=>{_sh=v}),
createColumn(60,1,_sm,(v)=>{_sm=v})
);const startSection=h('div',{class:'d-timerange-section'},startLabel,startCols);const divider=h('div',{class:'d-timerange-divider'},'\u2014');const endLabel=h('div',{class:'d-timerange-label'},'End');const endCols=h('div',{class:'d-timerange-columns'},
createColumn(24,1,_eh,(v)=>{_eh=v}),
createColumn(60,1,_em,(v)=>{_em=v})
);const endSection=h('div',{class:'d-timerange-section'},endLabel,endCols);errorEl=h('div',{class:'d-timerange-error',role:'alert',style:{display:'none'}});const row=h('div',{style:{display:'flex'}},startSection,divider,endSection);panel.appendChild(row);panel.appendChild(errorEl);renderValidation()}
createOverlay(trigger,panel,{trigger:'click',
closeOnEscape:true,
closeOnOutside:true,
onOpen:renderPanel});if(typeof disabled==='function'){createEffect(()=>{trigger.disabled=disabled();trigger.setAttribute('aria-disabled',String(!!disabled()))})}else if(disabled){trigger.disabled=true;trigger.setAttribute('aria-disabled','true')}
if(typeof value==='function'){createEffect(()=>{parseValue(value());updateDisplay()})}
updateDisplay();return wrap}
return{TimeRangePicker}})();const _m87=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const{createDrag}=_m148;function RangeSlider(props={}){injectBase();const{value,min:pMin=0,max:pMax=100,step=1,
onchange,disabled,class:cls}=props;let low=pMin;let high=pMax;function parseValue(v){if(!v||!Array.isArray(v))return;low=clamp(v[0]??pMin);high=clamp(v[1]??pMax);if(low>high){const t=low;low=high;high=t}}
function clamp(v){return Math.min(pMax,Math.max(pMin,Math.round(v/step)*step))}
function pct(v){return((v-pMin)/(pMax-pMin))*100}
parseValue(typeof value==='function'?value():value);const track=h('div',{class:'d-rangeslider-track'});const fill=h('div',{class:'d-rangeslider-fill'});const thumbLow=h('div',{class:'d-rangeslider-thumb',
role:'slider',
tabindex:'0',
'aria-valuemin':String(pMin),
'aria-valuemax':String(pMax),
'aria-valuenow':String(low),
'aria-label':'Range start'});const thumbHigh=h('div',{class:'d-rangeslider-thumb',
role:'slider',
tabindex:'0',
'aria-valuemin':String(pMin),
'aria-valuemax':String(pMax),
'aria-valuenow':String(high),
'aria-label':'Range end'});const container=h('div',{class:cx('d-rangeslider',cls),
role:'group',
'aria-label':'Range slider'},track,fill,thumbLow,thumbHigh);function syncDOM(){const lp=pct(low);const hp=pct(high);thumbLow.style.left=lp+'%';thumbHigh.style.left=hp+'%';fill.style.left=lp+'%';fill.style.width=(hp-lp)+'%';thumbLow.setAttribute('aria-valuenow',String(low));thumbHigh.setAttribute('aria-valuenow',String(high))}
function emit(){if(onchange)onchange([low,high])}
function valueFromX(clientX){const rect=container.getBoundingClientRect();const ratio=(clientX-rect.left)/rect.width;return clamp(pMin+ratio*(pMax-pMin))}
createDrag(thumbLow,{onMove:(x)=>{const v=valueFromX(x);if(v<=high){low=v}else{low=high;high=v}
syncDOM()},
onEnd:()=>emit()});createDrag(thumbHigh,{onMove:(x)=>{const v=valueFromX(x);if(v>=low){high=v}else{high=low;low=v}
syncDOM()},
onEnd:()=>emit()});container.addEventListener('pointerdown',(e)=>{if(e.target===thumbLow||e.target===thumbHigh)return;const v=valueFromX(e.clientX);if(Math.abs(v-low)<=Math.abs(v-high)){low=v;thumbLow.focus()}else{high=v;thumbHigh.focus()}
syncDOM();emit()});function handleKey(e,isLow){let delta=0;if(e.key==='ArrowRight'||e.key==='ArrowUp')delta=step; else if(e.key==='ArrowLeft'||e.key==='ArrowDown')delta=-step; else if(e.key==='Home'){delta=pMin-(isLow?low:high)} else if(e.key==='End'){delta=pMax-(isLow?low:high)} else return;e.preventDefault();if(isLow){low=clamp(low+delta);if(low>high)low=high}else{high=clamp(high+delta);if(high<low)high=low}
syncDOM();emit()}
thumbLow.addEventListener('keydown',(e)=>handleKey(e,true));thumbHigh.addEventListener('keydown',(e)=>handleKey(e,false));if(typeof disabled==='function'){createEffect(()=>{if(disabled())container.setAttribute('data-disabled',''); else container.removeAttribute('data-disabled')})}else if(disabled){container.setAttribute('data-disabled','')}
if(typeof value==='function'){createEffect(()=>{parseValue(value());syncDOM()})}
syncDOM();return container}
return{RangeSlider}})();const _m88=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const{createOverlay,caret}=_m148;function TreeSelect(props={}){injectBase();const{options=[],value,multiple=false,checkable=false,
onchange,placeholder='Select',disabled,class:cls}=props;const selected=new Set();const expanded=new Set();let searchText='';function parseValue(v){selected.clear();if(!v)return;const val=typeof v==='function'?v():v;if(Array.isArray(val))val.forEach(s=>selected.add(s)); else if(val)selected.add(val)}
parseValue(value);function findLabel(nodes,val){for(const n of nodes){if(n.value===val)return n.label;if(n.children){const r=findLabel(n.children,val);if(r)return r}}
return null}
function getDisplayText(){if(!selected.size)return'';const vals=[...selected];return vals.map(v=>findLabel(options,v)||v).join(', ')}
const displayEl=h('span',{class:'d-treeselect-display'});const arrowEl=caret('down',{class:'d-treeselect-arrow'});const trigger=h('button',{type:'button',
class:cx('d-treeselect-trigger','d-select'),
'aria-haspopup':'listbox',
'aria-expanded':'false'},displayEl,arrowEl);const panel=h('div',{class:'d-treeselect-panel',
style:{display:'none'},
role:'tree'});const wrap=h('div',{class:cx('d-treeselect',cls)},trigger,panel);function updateDisplay(){const text=getDisplayText();displayEl.textContent=text||placeholder;if(!text)displayEl.classList.add('d-select-placeholder'); else displayEl.classList.remove('d-select-placeholder')}
function emit(){updateDisplay();if(!onchange)return;if(multiple||checkable)onchange([...selected]); else onchange(selected.size?[...selected][0]:null)}
function selectNode(node){if(node.disabled)return;if(multiple||checkable){if(selected.has(node.value))selected.delete(node.value); else selected.add(node.value)}else{selected.clear();selected.add(node.value);overlay.close()}
emit();renderTree()}
function toggleExpand(node){if(expanded.has(node.value))expanded.delete(node.value); else expanded.add(node.value);renderTree()}
function matchesSearch(node){if(!searchText)return true;const q=searchText.toLowerCase();if(node.label.toLowerCase().includes(q))return true;if(node.children)return node.children.some(c=>matchesSearch(c));return false}
function renderNode(node,depth){if(!matchesSearch(node))return null;const hasChildren=node.children&&node.children.length;const isExpanded=expanded.has(node.value);const isSelected=selected.has(node.value);const content=h('div',{class:cx('d-tree-node-content',isSelected&&'d-tree-node-selected'),
role:'treeitem',
'aria-selected':String(isSelected),
'aria-expanded':hasChildren?String(isExpanded):undefined});for(let i=0;i<depth;i++){content.appendChild(h('span',{class:'d-tree-node-indent'}))}
if(hasChildren){const switcher=h('button',{type:'button',
class:cx('d-tree-node-switcher',isExpanded&&'d-tree-node-switcher-open'),
'aria-label':isExpanded?'Collapse':'Expand',
tabindex:'-1'},caret('right',{size:'0.875em'}));switcher.addEventListener('click',(e)=>{e.stopPropagation();toggleExpand(node)});content.appendChild(switcher)}else{content.appendChild(h('span',{class:'d-tree-node-indent'}))}
if(checkable){const cb=h('input',{type:'checkbox',
class:'d-tree-node-checkbox',
tabindex:'-1',
disabled:node.disabled?'':undefined});cb.checked=isSelected;cb.addEventListener('change',(e)=>{e.stopPropagation();selectNode(node)});content.appendChild(cb)}
const label=h('span',{class:'d-tree-node-label'},node.label);content.appendChild(label);if(!checkable&&!node.disabled){content.addEventListener('click',()=>selectNode(node))}
const wrapper=h('div',{class:'d-tree-node'},content);if(hasChildren&&isExpanded){const childContainer=h('div',{class:'d-tree-children',role:'group'});node.children.forEach(child=>{const childEl=renderNode(child,depth+1);if(childEl)childContainer.appendChild(childEl)});wrapper.appendChild(childContainer)}
return wrapper}
function renderTree(){const existingSearch=panel.querySelector('.d-treeselect-search');const hadFocus=existingSearch&&document.activeElement===existingSearch;const cursorPos=existingSearch?existingSearch.selectionStart:0;panel.replaceChildren();const searchInput=h('input',{type:'text',
class:'d-treeselect-search',
placeholder:'Search...',
'aria-label':'Search options'});searchInput.value=searchText;searchInput.addEventListener('input',(e)=>{searchText=e.target.value;renderTree()});panel.appendChild(searchInput);const treeWrap=h('div',{class:'d-tree',role:'tree'});options.forEach(node=>{const el=renderNode(node,0);if(el)treeWrap.appendChild(el)});panel.appendChild(treeWrap);if(hadFocus){requestAnimationFrame(()=>{searchInput.focus();searchInput.setSelectionRange(cursorPos,cursorPos)})}}
const overlay=createOverlay(trigger,panel,{trigger:'click',
closeOnEscape:true,
closeOnOutside:true,
onOpen:()=>{searchText='';wrap.classList.add('d-treeselect-open');renderTree()},
onClose:()=>{searchText='';wrap.classList.remove('d-treeselect-open')}});if(typeof disabled==='function'){createEffect(()=>{const dis=disabled();trigger.disabled=dis;trigger.setAttribute('aria-disabled',String(!!dis))})}else if(disabled){trigger.disabled=true;trigger.setAttribute('aria-disabled','true')}
if(typeof value==='function'){createEffect(()=>{parseValue(value);updateDisplay()})}
updateDisplay();return wrap}
return{TreeSelect}})();const _m89=(function(){const{h,text}=_m2;const{createSignal,createEffect,batch}=_m14;const{injectBase,cx}=_m147;const{caret}=_m148;const resolve=(v)=>typeof v==='function'?v():v;const ROW_H=40;const VIRT_THRESHOLD=500;const MIN_COL_W=50;function defaultCmp(a,b){if(a==null&&b==null)return 0;if(a==null)return-1;if(b==null)return 1;if(typeof a==='number'&&typeof b==='number')return a-b;return String(a).localeCompare(String(b))}
function csvCell(v){if(v==null)return'';const s=String(v);return/[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s}
function DataTable(props={}){injectBase();const{columns:rawCols=[],
data:rawData,
pagination:pgCfg,
selection='none',
onSelectionChange,
striped=false,
hoverable=true,
stickyHeader=false,
onSort,
rowKey=(r,i)=>i,
onCellEdit,
expandable=false,
expandRender,
exportable=false,
emptyText='No data',
class:cls}=props;const[sortCols,setSortCols]=createSignal([]);const[page,setPage]=createSignal(1);const[pageSize,setPageSize]=createSignal(pgCfg?pgCfg.pageSize||10:10);const[selected,setSelected]=createSignal(new Set());let lastClickIdx=-1;const[expanded,setExpanded]=createSignal(new Set());const[filters,setFilters]=createSignal({});const[colWidths,setColWidths]=createSignal({});const[scrollTop,setScrollTop]=createSignal(0);const getData=()=>resolve(rawData)||[];const getFiltered=()=>{const d=getData();const f=filters();const keys=Object.keys(f).filter(k=>f[k]);if(!keys.length)return d;return d.filter(row=>
keys.every(k=>{const v=row[k];return v!=null&&String(v).toLowerCase().includes(f[k].toLowerCase())})
)};const getSorted=()=>{const d=getFiltered();const sc=sortCols();if(!sc.length)return d;const sorted=[...d];sorted.sort((a,b)=>{for(const{key,direction}of sc){const col=rawCols.find(c=>c.key===key);const cmp=col&&col.sort?col.sort:defaultCmp;const r=cmp(a[key],b[key]);if(r!==0)return direction==='asc'?r:-r}
return 0});return sorted};const getTotal=()=>{if(pgCfg&&pgCfg.serverSide&&pgCfg.total!=null)return resolve(pgCfg.total);return getSorted().length};const getPageCount=()=>Math.max(1,Math.ceil(getTotal()/pageSize()));const getPageData=()=>{const sorted=getSorted();if(!pgCfg||pgCfg.serverSide)return sorted;const ps=pageSize();const p=page();return sorted.slice((p-1)*ps,p*ps)};function handleSort(key,multi){setSortCols(prev=>{const idx=prev.findIndex(s=>s.key===key);let next;if(idx===-1){const entry={key,direction:'asc'};next=multi?[...prev,entry]:[entry]}else{const cur=prev[idx];if(cur.direction==='asc'){next=[...prev];next[idx]={key,direction:'desc'}}else{next=prev.filter((_,i)=>i!==idx)}
if(!multi&&next.length>1)next=next.filter(s=>s.key===key)}
if(onSort&&next.length)onSort(next[next.length-1]);return next});setPage(1)}
function fireSelection(set){if(!onSelectionChange)return;const data=getPageData();onSelectionChange(data.filter((r,i)=>set.has(rowKey(r,i))))}
function toggleSelect(row,idx,shiftKey){if(selection==='none')return;const key=rowKey(row,idx);if(selection==='single'){setSelected(prev=>{const next=new Set();if(!prev.has(key))next.add(key);fireSelection(next);return next})}else{if(shiftKey&&lastClickIdx>=0){const rows=getPageData();const lo=Math.min(lastClickIdx,idx);const hi=Math.max(lastClickIdx,idx);setSelected(prev=>{const next=new Set(prev);for(let i=lo;i<=hi;i++)next.add(rowKey(rows[i],i));fireSelection(next);return next})}else{setSelected(prev=>{const next=new Set(prev);next.has(key)?next.delete(key):next.add(key);fireSelection(next);return next})}
lastClickIdx=idx}}
function toggleSelectAll(){const rows=getPageData();const sel=selected();const allKeys=rows.map((r,i)=>rowKey(r,i));const allSelected=allKeys.length>0&&allKeys.every(k=>sel.has(k));const next=new Set(sel);if(allSelected){allKeys.forEach(k=>next.delete(k))}else{allKeys.forEach(k=>next.add(k))}
setSelected(next);fireSelection(next)}
function toggleExpand(row,idx){const key=rowKey(row,idx);setExpanded(prev=>{const next=new Set(prev);next.has(key)?next.delete(key):next.add(key);return next})}
function setFilter(key,value){setFilters(prev=>({...prev,[key]:value}));setPage(1)}
function exportCSV(){const rows=getSorted();const header=rawCols.map(c=>csvCell(c.label)).join(',');const body=rows.map(r=>rawCols.map(c=>csvCell(r[c.key])).join(',')).join('\n');const csv=header+'\n'+body;const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='data.csv';a.click();URL.revokeObjectURL(url)}
function startEdit(td,row,col){if(td.querySelector('input'))return;const oldValue=row[col.key];td.classList.add('d-datatable-td-editing');const input=h('input',{type:'text',
value:oldValue!=null?String(oldValue):'',
class:'d-datatable-edit-input',
onKeydown(e){if(e.key==='Enter')commitEdit();if(e.key==='Escape')cancelEdit()},
onBlur(){commitEdit()}});td.textContent='';td.appendChild(input);input.focus();input.select();function commitEdit(){const newValue=input.value;td.classList.remove('d-datatable-td-editing');td.textContent=newValue;if(newValue!==String(oldValue??'')&&onCellEdit){onCellEdit({row,column:col,value:newValue,oldValue})}}
function cancelEdit(){td.classList.remove('d-datatable-td-editing');td.textContent=oldValue!=null?String(oldValue):''}}
function initResize(e,col,thEl){e.preventDefault();const startX=e.clientX;const startW=thEl.offsetWidth;function onMove(ev){const diff=ev.clientX-startX;const newW=Math.max(MIN_COL_W,startW+diff);setColWidths(prev=>({...prev,[col.key]:newW}));thEl.style.width=newW+'px'}
function onUp(){document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp)}
document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp)}
function getPinOffsets(){const widths=colWidths();const leftPins=[];const rightPins=[];const allCols=getEffectiveCols();allCols.forEach((c,i)=>{if(c.pinned==='left')leftPins.push(i);if(c.pinned==='right')rightPins.push(i)});const offsets={};let leftAcc=0;for(const i of leftPins){offsets[i]={left:leftAcc};const w=widths[allCols[i].key]||parseInt(allCols[i].width)||150;leftAcc+=w}
let rightAcc=0;for(let j=rightPins.length-1;j>=0;j--){const i=rightPins[j];offsets[i]={right:rightAcc};const w=widths[allCols[i].key]||parseInt(allCols[i].width)||150;rightAcc+=w}
return offsets}
function getEffectiveCols(){return rawCols}
const root=h('div',{class:cx('d-datatable',cls),
role:'region',
'aria-label':'Data table'});if(exportable){const toolbar=h('div',{class:'d-datatable-header'},
h('button',{class:'d-datatable-export-btn',
type:'button',
onclick:exportCSV,
'aria-label':'Export as CSV'},'Export CSV')
);root.appendChild(toolbar)}
const scrollWrap=h('div',{class:'d-datatable-scroll',
style:{overflow:'auto',position:'relative'}});const table=h('table',{class:cx(
'd-datatable-table',
striped&&'d-datatable-striped',
hoverable&&'d-datatable-hoverable'
),
role:'grid'});const thead=h('thead',{class:stickyHeader?'d-datatable-sticky':null});const headerRow=h('tr',null);if(expandable){headerRow.appendChild(h('th',{class:'d-datatable-th',
style:{width:'40px'},
'aria-label':'Expand'}))}
if(selection==='multi'){const selAllTh=h('th',{class:'d-datatable-th',style:{width:'40px'}});const cb=h('input',{type:'checkbox',
class:'d-datatable-checkbox',
'aria-label':'Select all rows',
onchange:toggleSelectAll});selAllTh.appendChild(cb);headerRow.appendChild(selAllTh);createEffect(()=>{const sel=selected();const rows=getPageData();const allKeys=rows.map((r,i)=>rowKey(r,i));const allSel=allKeys.length>0&&allKeys.every(k=>sel.has(k));const someSel=!allSel&&allKeys.some(k=>sel.has(k));cb.checked=allSel;cb.indeterminate=someSel})}
rawCols.forEach((col,ci)=>{const th=h('th',{class:cx(
'd-datatable-th',
col.sortable&&'d-datatable-th-sortable',
col.pinned==='left'&&'d-datatable-pinned-left',
col.pinned==='right'&&'d-datatable-pinned-right'
),
style:{width:col.width||'auto',
textAlign:col.align||'left',
...(col.pinned?{position:'sticky',zIndex:3}:{})},
'aria-sort':'none'});const labelSpan=h('span',null,col.label);th.appendChild(labelSpan);if(col.sortable){const sortIndicator=h('span',{class:'d-datatable-sort-icon',
'aria-hidden':'true'});th.appendChild(sortIndicator);createEffect(()=>{const sc=sortCols();const entry=sc.find(s=>s.key===col.key);sortIndicator.replaceChildren(entry?(entry.direction==='asc'?caret('up'):caret('down')):caret('down'));th.setAttribute('aria-sort',entry?(entry.direction==='asc'?'ascending':'descending'):'none');th.classList.toggle('d-datatable-th-sorted-asc',!!(entry&&entry.direction==='asc'));th.classList.toggle('d-datatable-th-sorted-desc',!!(entry&&entry.direction==='desc'))});th.addEventListener('click',(e)=>{handleSort(col.key,e.shiftKey)});th.style.cursor='pointer';th.style.userSelect='none'}
if(col.filterable){const filterWrap=h('span',{style:{position:'relative',display:'inline-block',marginLeft:'4px'}});const filterBtn=h('button',{class:'d-datatable-filter-icon',
type:'button',
'aria-label':`Filter ${col.label}`,
onclick(e){e.stopPropagation();const popup=filterWrap.querySelector('.d-datatable-filter-popup');if(popup){popup.style.display=popup.style.display==='none'?'block':'none';if(popup.style.display==='block')popup.querySelector('input').focus()}}},'\u25BD');const filterPopup=h('div',{class:'d-datatable-filter-popup',
style:{display:'none'},
onclick(e){e.stopPropagation()}});const filterInput=h('input',{type:'text',
placeholder:`Filter ${col.label}...`,
'aria-label':`Filter by ${col.label}`,
oninput(e){setFilter(col.key,e.target.value)}});filterPopup.appendChild(filterInput);filterWrap.appendChild(filterBtn);filterWrap.appendChild(filterPopup);th.appendChild(filterWrap);createEffect(()=>{const f=filters();filterBtn.classList.toggle('d-datatable-filter-active',!!f[col.key])})}
const handle=h('span',{class:'d-datatable-resize-handle',
onmousedown(e){initResize(e,col,th)},
'aria-hidden':'true'});th.appendChild(handle);headerRow.appendChild(th)});thead.appendChild(headerRow);table.appendChild(thead);const tbody=h('tbody',null);table.appendChild(tbody);let useVirtual=false;let visibleStart=0;let visibleEnd=0;const spacerTop=h('tr',{style:{height:'0px'},'aria-hidden':'true'},
h('td',{style:{padding:0,border:'none'}})
);const spacerBottom=h('tr',{style:{height:'0px'},'aria-hidden':'true'},
h('td',{style:{padding:0,border:'none'}})
);function buildRow(row,idx){const key=rowKey(row,idx);const sel=selected();const exp=expanded();const isSelected=sel.has(key);const isExpanded=exp.has(key);const tr=h('tr',{class:cx(
'd-datatable-row',
isSelected&&'d-datatable-row-selected',
isExpanded&&'d-datatable-row-expanded'
),
onclick(e){toggleSelect(row,idx,e.shiftKey)},
'data-row-key':key});if(expandable){const expandTd=h('td',{class:'d-datatable-td',style:{width:'40px',textAlign:'center'}});const expandBtn=h('button',{type:'button',
class:'d-datatable-expand-btn',
'aria-label':isExpanded?'Collapse row':'Expand row',
'aria-expanded':isExpanded?'true':'false',
onclick(e){e.stopPropagation();toggleExpand(row,idx)}},isExpanded?caret('down'):caret('right'));expandTd.appendChild(expandBtn);tr.appendChild(expandTd)}
if(selection==='multi'){const cbTd=h('td',{class:'d-datatable-td',style:{width:'40px',textAlign:'center'}});const cb=h('input',{type:'checkbox',
class:'d-datatable-checkbox',
checked:isSelected?'':undefined,
'aria-label':`Select row ${idx + 1}`,
onclick(e){e.stopPropagation()},
onchange(){toggleSelect(row,idx,false)}});if(isSelected)cb.checked=true;cbTd.appendChild(cb);tr.appendChild(cbTd)}
rawCols.forEach(col=>{const val=row[col.key];const content=col.render?col.render(val,row):(val!=null?String(val):'');const td=h('td',{class:cx(
'd-datatable-td',
col.pinned==='left'&&'d-datatable-pinned-left',
col.pinned==='right'&&'d-datatable-pinned-right'
),
style:{textAlign:col.align||'left',
...(col.pinned?{position:'sticky',zIndex:1}:{})}});if(typeof content==='object'&&content instanceof Node){td.appendChild(content)}else{td.textContent=content}
if(col.editable){td.addEventListener('dblclick',(e)=>{e.stopPropagation();startEdit(td,row,col)});td.style.cursor='text'}
tr.appendChild(td)});const frag=[tr];if(expandable&&isExpanded&&expandRender){const totalCols=rawCols.length+(selection==='multi'?1:0)+1;const expandTr=h('tr',{class:'d-datatable-expand-row'});const expandTd=h('td',{colspan:totalCols,class:'d-datatable-td'});const content=expandRender(row);if(content instanceof Node)expandTd.appendChild(content); else expandTd.textContent=content;expandTr.appendChild(expandTd);frag.push(expandTr)}
return frag}
createEffect(()=>{const rows=getPageData();const _sel=selected();const _exp=expanded();const _filters=filters();const _sort=sortCols();const _pg=page();const _ps=pageSize(); while(tbody.firstChild)tbody.removeChild(tbody.firstChild);if(rows.length===0){const totalCols=rawCols.length
+(selection==='multi'?1:0)
+(expandable?1:0);tbody.appendChild(
h('tr',{class:'d-datatable-empty'},
h('td',{colspan:totalCols,class:'d-datatable-td'},emptyText)
)
);return}
useVirtual=rows.length>VIRT_THRESHOLD;if(useVirtual){const containerH=scrollWrap.clientHeight||400;const st=scrollTop();visibleStart=Math.max(0,Math.floor(st/ROW_H)-5);visibleEnd=Math.min(rows.length,Math.ceil((st+containerH)/ROW_H)+5);spacerTop.style.height=(visibleStart*ROW_H)+'px';spacerBottom.style.height=((rows.length-visibleEnd)*ROW_H)+'px';tbody.appendChild(spacerTop);for(let i=visibleStart;i<visibleEnd;i++){const trs=buildRow(rows[i],i);trs.forEach(tr=>tbody.appendChild(tr))}
tbody.appendChild(spacerBottom)}else{const frag=document.createDocumentFragment();for(let i=0;i<rows.length;i++){const trs=buildRow(rows[i],i);trs.forEach(tr=>frag.appendChild(tr))}
tbody.appendChild(frag)}});scrollWrap.addEventListener('scroll',()=>{if(useVirtual)setScrollTop(scrollWrap.scrollTop)});scrollWrap.appendChild(table);root.appendChild(scrollWrap);if(pgCfg){const pgBar=h('div',{class:'d-datatable-pagination',role:'navigation','aria-label':'Table pagination'});const sizeLabel=h('label',{class:'d-datatable-page-size'},
'Rows: '
);const sizeSelect=h('select',{'aria-label':'Rows per page',
onchange(e){batch(()=>{setPageSize(Number(e.target.value));setPage(1)});if(pgCfg.onPageChange)pgCfg.onPageChange({page:1,pageSize:Number(e.target.value)})}});[10,20,50,100].forEach(n=>{const opt=h('option',{value:n},String(n));if(n===(pgCfg.pageSize||10))opt.selected=true;sizeSelect.appendChild(opt)});sizeLabel.appendChild(sizeSelect);pgBar.appendChild(sizeLabel);const pgInfo=h('span',{class:'d-datatable-page-info'});pgBar.appendChild(pgInfo);const prevBtn=h('button',{type:'button',
class:'d-datatable-page-btn',
'aria-label':'Previous page',
onclick(){const p=page();if(p>1){setPage(p-1);if(pgCfg.onPageChange)pgCfg.onPageChange({page:p-1,pageSize:pageSize()})}}},'\u2039 Prev');const nextBtn=h('button',{type:'button',
class:'d-datatable-page-btn',
'aria-label':'Next page',
onclick(){const p=page();if(p<getPageCount()){setPage(p+1);if(pgCfg.onPageChange)pgCfg.onPageChange({page:p+1,pageSize:pageSize()})}}},'Next \u203A');pgBar.appendChild(prevBtn);pgBar.appendChild(nextBtn);createEffect(()=>{const p=page();const pc=getPageCount();const total=getTotal();const ps=pageSize();const start=(p-1)*ps+1;const end=Math.min(p*ps,total);pgInfo.textContent=total>0?`${start}\u2013${end} of ${total}`:'0 results';prevBtn.disabled=p<=1;nextBtn.disabled=p>=pc});root.appendChild(pgBar)}
createEffect(()=>{const _cw=colWidths();const offsets=getPinOffsets();const allCols=getEffectiveCols();const ths=headerRow.querySelectorAll('.d-datatable-th');let leftAcc=0;const extraCols=(expandable?1:0)+(selection==='multi'?1:0);allCols.forEach((col,ci)=>{if(!col.pinned)return;const thIdx=ci+extraCols;const th=ths[thIdx];if(!th)return;if(col.pinned==='left'){th.style.left=leftAcc+'px';const tds=tbody.querySelectorAll(`tr > .d-datatable-td:nth-child(${thIdx + 1})`);tds.forEach(td=>{td.style.left=leftAcc+'px'});leftAcc+=th.offsetWidth}});let rightAcc=0;for(let ci=allCols.length-1;ci>=0;ci--){const col=allCols[ci];if(col.pinned!=='right')continue;const thIdx=ci+extraCols;const th=ths[thIdx];if(!th)continue;th.style.right=rightAcc+'px';const tds=tbody.querySelectorAll(`tr > .d-datatable-td:nth-child(${thIdx + 1})`);tds.forEach(td=>{td.style.right=rightAcc+'px'});rightAcc+=th.offsetWidth}});return root}
return{DataTable}})();const _m90=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function AvatarGroup(props={},...children){injectBase();const{max=5,size,class:cls}=props;const group=h('div',{class:cx('d-avatar-group',cls),
role:'group',
'aria-label':'Avatar group'});const avatars=children.flat().filter(c=>c&&c.nodeType);const total=avatars.length;const visible=avatars.slice(0,max);if(size){visible.forEach(av=>{if(av.classList&&!av.classList.contains(`d-avatar-${size}`)){av.classList.add(`d-avatar-${size}`)}})}
visible.forEach(av=>group.appendChild(av));if(total>max){const sizeClass=size?`d-avatar d-avatar-${size}`:'d-avatar';const overflow=h('span',{class:cx('d-avatar-group-count',sizeClass),
'aria-label':`${total - max} more`},`+${total - max}`);group.appendChild(overflow)}
return group}
return{AvatarGroup}})();const _m91=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;function Tag(props={},...children){injectBase();const{color,closable,checked,onClose,onCheck,class:cls,...rest}=props;const isCheckable=checked!==undefined;const isCustomColor=color&&!['primary','success','warning','danger'].includes(color);const className=cx(
'd-tag',
color&&!isCustomColor&&`d-tag-${color}`,
isCheckable&&'d-tag-checkable',
cls
);const tag=isCheckable
?h('button',{type:'button',class:className,role:'checkbox',...rest})
:h('span',{class:className,...rest});if(isCustomColor){tag.style.backgroundColor=color;tag.style.color='#fff';tag.style.borderColor=color}
children.forEach(child=>{if(child&&typeof child==='object'&&child.nodeType)tag.appendChild(child); else if(child!=null)tag.appendChild(document.createTextNode(String(child)))});if(closable){const closeBtn=h('button',{type:'button',
class:'d-tag-close',
'aria-label':'Remove'},'\u00d7');closeBtn.addEventListener('click',(e)=>{e.stopPropagation();if(onClose)onClose();tag.remove()});tag.appendChild(closeBtn)}
if(isCheckable){let _checked=typeof checked==='function'?checked():checked;tag.setAttribute('aria-checked',String(!!_checked));tag.addEventListener('click',()=>{_checked=!_checked;tag.setAttribute('aria-checked',String(_checked));if(onCheck)onCheck(_checked)});if(typeof checked==='function'){createEffect(()=>{_checked=checked();tag.setAttribute('aria-checked',String(!!_checked))})}}
return tag}
Tag.CheckableGroup=function CheckableGroup(props={}){injectBase();const{options=[],value=[],onchange,class:cls}=props;let selected=[...value];const group=h('div',{class:cx('d-space d-space-wrap',cls),role:'group'});options.forEach(opt=>{const tag=Tag({checked:selected.includes(opt.value),
onCheck:(checked)=>{if(checked)selected.push(opt.value); else selected=selected.filter(v=>v!==opt.value);if(onchange)onchange([...selected])}},opt.label);group.appendChild(tag)});return group};return{Tag}})();const _m92=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;function List(props={}){injectBase();const{items,renderItem,header,footer,bordered,grid,loading,emptyText='No data',class:cls}=props;const container=h('div',{class:cx('d-list',bordered&&'d-list-bordered',cls),role:'list'});function render(){container.replaceChildren();if(header)container.appendChild(h('div',{class:'d-list-header'},header));const data=typeof items==='function'?items():(items||[]);if(typeof loading==='function'?loading():loading){container.appendChild(h('div',{class:'d-list-loading'},'\u23F3'));return}
if(!data.length){container.appendChild(h('div',{class:'d-empty'},
h('div',{class:'d-empty-desc'},emptyText)
));if(footer)container.appendChild(h('div',{class:'d-list-footer'},footer));return}
const body=grid
?h('div',{class:'d-list-grid',style:{gridTemplateColumns:`repeat(${grid},1fr)`,gap:'var(--d-sp-3)'}})
:document.createDocumentFragment();data.forEach((item,i)=>{if(renderItem){const node=renderItem(item,i);if(node)body.appendChild(node);return}
const el=h('div',{class:'d-list-item',role:'listitem'});if(item.avatar){el.appendChild(h('div',{class:'d-list-item-avatar'},item.avatar))}
const meta=h('div',{class:'d-list-item-meta'});if(item.title)meta.appendChild(h('div',{class:'d-list-item-title'},item.title));if(item.description)meta.appendChild(h('div',{class:'d-list-item-desc'},item.description));el.appendChild(meta);if(item.extra)el.appendChild(item.extra);if(item.actions&&item.actions.length){const actions=h('div',{class:'d-list-item-actions'});item.actions.forEach(a=>actions.appendChild(a));el.appendChild(actions)}
body.appendChild(el)});container.appendChild(grid?body:body);if(footer)container.appendChild(h('div',{class:'d-list-footer'},footer))}
render();if(typeof items==='function'){createEffect(()=>{items();render()})}
if(typeof loading==='function'){createEffect(()=>{loading();render()})}
return container}
List.Item=function Item(props={},...children){injectBase();const{class:cls,...rest}=props;return h('div',{class:cx('d-list-item',cls),role:'listitem',...rest},...children)};List.Item.Meta=function Meta(props={}){injectBase();const{title,description,avatar,class:cls}=props;const el=h('div',{class:cx('d-list-item-meta',cls)});if(title)el.appendChild(h('div',{class:'d-list-item-title'},title));if(description)el.appendChild(h('div',{class:'d-list-item-desc'},description));return el};return{List}})();const _m93=(function(){const{h}=_m2;const{injectBase,cx}=_m147;const{caret}=_m148;function Tree(props={}){injectBase();const{data=[],expandedKeys:initExpanded=[],selectedKeys:initSelected=[],checkedKeys:initChecked=[],checkable=false,selectable=true,defaultExpandAll=false,onSelect,onCheck,onExpand,class:cls}=props;const expanded=new Set(initExpanded);const selected=new Set(initSelected);const checked=new Set(initChecked);if(defaultExpandAll){const collectKeys=(nodes)=>{nodes.forEach(n=>{if(n.children?.length){expanded.add(n.key);collectKeys(n.children)}})};collectKeys(data)}
const tree=h('div',{class:cx('d-tree',cls),role:'tree'});function renderNode(node,depth){const hasChildren=node.children&&node.children.length;const isExpanded=expanded.has(node.key);const isSelected=selected.has(node.key);const isChecked=checked.has(node.key);const nodeEl=h('div',{class:cx('d-tree-node',isSelected&&'d-tree-node-selected'),role:'treeitem','aria-expanded':hasChildren?String(isExpanded):undefined});const content=h('div',{class:'d-tree-node-content'});for(let i=0;i<depth;i++){content.appendChild(h('span',{class:'d-tree-node-indent'}))}
if(hasChildren){const switcher=h('button',{type:'button',
class:cx('d-tree-node-switcher',isExpanded&&'d-tree-node-switcher-open'),
'aria-label':isExpanded?'Collapse':'Expand'},caret('right'));switcher.addEventListener('click',(e)=>{e.stopPropagation();if(expanded.has(node.key))expanded.delete(node.key); else expanded.add(node.key);render();if(onExpand)onExpand([...expanded],{node,expanded:expanded.has(node.key)})});content.appendChild(switcher)}else{content.appendChild(h('span',{class:'d-tree-node-indent'}))}
if(checkable){const cb=h('input',{type:'checkbox',
class:'d-tree-node-checkbox',
disabled:node.disabled?'':undefined});cb.checked=isChecked;cb.addEventListener('change',(e)=>{e.stopPropagation();if(cb.checked)checked.add(node.key); else checked.delete(node.key);if(onCheck)onCheck([...checked],{node,checked:cb.checked})});content.appendChild(cb)}
if(node.icon){const icon=typeof node.icon==='string'
?h('span',{'aria-hidden':'true'},node.icon)
:node.icon;content.appendChild(icon)}
const label=h('span',{class:'d-tree-node-label'},node.label);content.appendChild(label);if(selectable&&!node.disabled){content.addEventListener('click',()=>{if(selected.has(node.key))selected.delete(node.key); else{selected.clear();selected.add(node.key)}
render();if(onSelect)onSelect([...selected],{node,selected:selected.has(node.key)})})}
nodeEl.appendChild(content);if(hasChildren&&isExpanded){const childContainer=h('div',{class:'d-tree-children',role:'group'});node.children.forEach(child=>childContainer.appendChild(renderNode(child,depth+1)));nodeEl.appendChild(childContainer)}
return nodeEl}
function render(){tree.replaceChildren();data.forEach(node=>tree.appendChild(renderNode(node,0)))}
render();return tree}
return{Tree}})();const _m94=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Descriptions(props={}){injectBase();const{title,items=[],columns=3,layout='horizontal',bordered,class:cls}=props;const container=h('div',{class:cx('d-descriptions',layout==='horizontal'&&'d-descriptions-horizontal',cls)});if(title){container.appendChild(h('div',{class:'d-descriptions-title'},title))}
const table=h('table',{class:'d-descriptions-table'});const tbody=h('tbody',null);if(layout==='horizontal'){let currentRow=null;let currentSpan=0;items.forEach(item=>{const span=item.span||1;if(!currentRow||currentSpan+span>columns){currentRow=h('tr',null);tbody.appendChild(currentRow);currentSpan=0}
currentRow.appendChild(h('td',{class:'d-descriptions-label'},item.label));const contentEl=h('td',{class:'d-descriptions-content',colspan:span>1?String(span*2-1):undefined});if(typeof item.value==='object'&&item.value?.nodeType)contentEl.appendChild(item.value); else contentEl.textContent=String(item.value??'');currentRow.appendChild(contentEl);currentSpan+=span})}else{items.forEach(item=>{const labelRow=h('tr',null,h('td',{class:'d-descriptions-label',colspan:'2'},item.label));tbody.appendChild(labelRow);const contentEl=h('td',{class:'d-descriptions-content',colspan:'2'});if(typeof item.value==='object'&&item.value?.nodeType)contentEl.appendChild(item.value); else contentEl.textContent=String(item.value??'');tbody.appendChild(h('tr',null,contentEl))})}
table.appendChild(tbody);container.appendChild(table);return container}
return{Descriptions}})();const _m95=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;function Statistic(props={}){injectBase();const{label,value,precision,prefix,suffix,trend,trendValue,groupSeparator=true,class:cls}=props;const container=h('div',{class:cx('d-statistic',cls)});if(label){container.appendChild(h('div',{class:'d-statistic-label'},label))}
const valueRow=h('div',{class:'d-statistic-value'});if(prefix){const pre=h('span',{class:'d-statistic-prefix'});if(typeof prefix==='string')pre.textContent=prefix; else pre.appendChild(prefix);valueRow.appendChild(pre)}
const valueSpan=h('span',null);valueRow.appendChild(valueSpan);if(suffix){const suf=h('span',{class:'d-statistic-suffix'});if(typeof suffix==='string')suf.textContent=suffix; else suf.appendChild(suffix);valueRow.appendChild(suf)}
container.appendChild(valueRow);function formatValue(v){if(v==null)return'';let num=typeof v==='number'?v:parseFloat(v);if(isNaN(num))return String(v);if(precision!==undefined)num=num.toFixed(precision); else num=String(num);if(groupSeparator){const parts=num.split('.');parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,',');num=parts.join('.')}
return num}
function update(){const v=typeof value==='function'?value():value;valueSpan.textContent=formatValue(v)}
update();if(typeof value==='function'){createEffect(update)}
if(trend){const trendEl=h('div',{class:cx('d-statistic-trend',`d-statistic-trend-${trend}`)});const arrow=trend==='up'?'\u2191':'\u2193';trendEl.appendChild(h('span',null,arrow));if(trendValue)trendEl.appendChild(h('span',null,trendValue));container.appendChild(trendEl)}
return container}
Statistic.Countdown=function Countdown(props={}){injectBase();const{label,target,format='HH:mm:ss',onFinish,class:cls}=props;const container=h('div',{class:cx('d-statistic',cls)});if(label)container.appendChild(h('div',{class:'d-statistic-label'},label));const valueEl=h('div',{class:'d-statistic-value d-statistic-countdown'});container.appendChild(valueEl);const targetTime=target instanceof Date?target.getTime():(target||0);function formatDuration(ms){if(ms<=0)return format.replace('HH','00').replace('mm','00').replace('ss','00');const totalSec=Math.floor(ms/1000);const hours=String(Math.floor(totalSec/3600)).padStart(2,'0');const minutes=String(Math.floor((totalSec%3600)/60)).padStart(2,'0');const seconds=String(totalSec%60).padStart(2,'0');return format.replace('HH',hours).replace('mm',minutes).replace('ss',seconds)}
function tick(){const remaining=targetTime-Date.now();valueEl.textContent=formatDuration(remaining);if(remaining<=0){if(onFinish)onFinish();return}
requestAnimationFrame(tick)}
tick();return container};return{Statistic}})();const _m96=(function(){const{h}=_m2;const{createEffect,createSignal}=_m14;const{injectBase,cx}=_m147;const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];function Calendar(props={}){injectBase();const{value,mode:initMode='month',mini=false,dateCellRender,onSelect,onPanelChange,class:cls}=props;const[getView,setView]=createSignal(typeof value==='function'?(value()||new Date()):(value||new Date()));const[getMode,setMode]=createSignal(initMode);const container=h('div',{class:cx('d-calendar',mini&&'d-calendar-mini',cls)});function render(){container.replaceChildren();const viewDate=getView();const mode=getMode();const headerRow=h('div',{class:'d-calendar-header'});const prevBtn=h('button',{type:'button',class:'d-datepicker-nav-btn','aria-label':'Previous'},'\u2039');const nextBtn=h('button',{type:'button',class:'d-datepicker-nav-btn','aria-label':'Next'},'\u203A');const title=h('span',{class:'d-calendar-title'},
mode==='month'?`${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`:String(viewDate.getFullYear())
);prevBtn.addEventListener('click',()=>{const d=new Date(viewDate);if(mode==='month')d.setMonth(d.getMonth()-1); else d.setFullYear(d.getFullYear()-1);setView(d);if(onPanelChange)onPanelChange(d,mode)});nextBtn.addEventListener('click',()=>{const d=new Date(viewDate);if(mode==='month')d.setMonth(d.getMonth()+1); else d.setFullYear(d.getFullYear()+1);setView(d);if(onPanelChange)onPanelChange(d,mode)});headerRow.appendChild(h('div',{class:'d-datepicker-nav'},prevBtn));headerRow.appendChild(title);headerRow.appendChild(h('div',{class:'d-datepicker-nav'},nextBtn));container.appendChild(headerRow);if(mode==='month')renderMonth(viewDate); else renderYear(viewDate)}
function renderMonth(viewDate){const grid=h('div',{class:'d-calendar-grid'});DAYS.forEach(d=>grid.appendChild(h('div',{class:'d-calendar-weekday'},mini?d[0]:d)));const year=viewDate.getFullYear();const month=viewDate.getMonth();const firstDay=new Date(year,month,1).getDay();const daysInMonth=new Date(year,month+1,0).getDate();const today=new Date();const selected=typeof value==='function'?value():value;for(let i=0;i<firstDay;i++){grid.appendChild(h('div',{class:'d-calendar-cell',style:{opacity:'0.3'}}))}
for(let i=1;i<=daysInMonth;i++){const d=new Date(year,month,i);const isToday=d.toDateString()===today.toDateString();const isSel=selected&&d.toDateString()===new Date(selected).toDateString();const cell=h('button',{type:'button',
class:cx('d-calendar-cell',isToday&&'d-datepicker-day-today',isSel&&'d-datepicker-day-selected')});cell.appendChild(h('div',{class:'d-calendar-cell-content'},String(i)));if(dateCellRender&&!mini){const custom=dateCellRender(d);if(custom)cell.appendChild(custom)}
cell.addEventListener('click',()=>{if(onSelect)onSelect(d)});grid.appendChild(cell)}
container.appendChild(grid)}
function renderYear(viewDate){const grid=h('div',{class:'d-datepicker-months'});MONTHS.forEach((m,i)=>{const btn=h('button',{type:'button',class:'d-datepicker-month'},m.slice(0,3));btn.addEventListener('click',()=>{const d=new Date(viewDate);d.setMonth(i);setView(d);setMode('month');if(onPanelChange)onPanelChange(d,'month')});grid.appendChild(btn)});container.appendChild(grid)}
createEffect(render);return container}
return{Calendar}})();const _m97=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Carousel(props={}){injectBase();const{slides=[],autoplay=false,interval=3000,arrows=true,dots=true,loop=true,onChange,class:cls}=props;let current=0;let _timer=null;const track=h('div',{class:'d-carousel-track'});slides.forEach(slide=>{const slideEl=h('div',{class:'d-carousel-slide'});slideEl.appendChild(slide);track.appendChild(slideEl)});const container=h('div',{class:cx('d-carousel',cls)},track);function goTo(idx){if(!loop)idx=Math.max(0,Math.min(idx,slides.length-1)); else idx=(idx+slides.length)%slides.length;current=idx;track.style.transform=`translateX(-${current * 100}%)`;updateDots();if(onChange)onChange(current)}
function next(){goTo(current+1)}
function prev(){goTo(current-1)}
if(arrows&&slides.length>1){const prevBtn=h('button',{type:'button',class:'d-carousel-nav d-carousel-prev','aria-label':'Previous slide'},'\u2039');const nextBtn=h('button',{type:'button',class:'d-carousel-nav d-carousel-next','aria-label':'Next slide'},'\u203A');prevBtn.addEventListener('click',prev);nextBtn.addEventListener('click',next);container.appendChild(prevBtn);container.appendChild(nextBtn)}
let dotEls=[];function updateDots(){dotEls.forEach((d,i)=>d.classList.toggle('d-carousel-dot-active',i===current))}
if(dots&&slides.length>1){const dotsContainer=h('div',{class:'d-carousel-dots'});slides.forEach((_,i)=>{const dot=h('button',{type:'button',
class:cx('d-carousel-dot',i===0&&'d-carousel-dot-active'),
'aria-label':`Slide ${i + 1}`});dot.addEventListener('click',()=>goTo(i));dotEls.push(dot);dotsContainer.appendChild(dot)});container.appendChild(dotsContainer)}
if(autoplay&&slides.length>1){function startTimer(){_timer=setInterval(next,interval)}
function stopTimer(){clearInterval(_timer)}
startTimer();container.addEventListener('mouseenter',stopTimer);container.addEventListener('mouseleave',startTimer)}
container.setAttribute('tabindex','0');container.addEventListener('keydown',(e)=>{if(e.key==='ArrowLeft'){e.preventDefault();prev()} else if(e.key==='ArrowRight'){e.preventDefault();next()}});return container}
return{Carousel}})();const _m98=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Empty(props={},...children){injectBase();const{icon,description='No data',class:cls,...rest}=props;const container=h('div',{class:cx('d-empty',cls),...rest});const iconEl=h('div',{class:'d-empty-icon'});if(icon){if(typeof icon==='string')iconEl.textContent=icon; else iconEl.appendChild(icon)}else{iconEl.textContent='\uD83D\uDDC3'}
container.appendChild(iconEl);if(description){container.appendChild(h('div',{class:'d-empty-desc'},description))}
children.forEach(child=>{if(child&&child.nodeType)container.appendChild(child)});return container}
return{Empty}})();const _m99=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Image(props={}){injectBase();const{src,alt='',width,height,fit='cover',preview=false,fallback='Image not available',placeholder,class:cls,...rest}=props;const style={};if(width)style.width=width;if(height)style.height=height;const container=h('div',{class:cx('d-image',preview&&'d-image-preview',cls),
style,
...rest});const img=h('img',{src,
alt,
style:{objectFit:fit},
loading:'lazy'});img.addEventListener('error',()=>{img.remove();container.appendChild(h('div',{class:'d-image-fallback'},fallback))});container.appendChild(img);if(preview){container.addEventListener('click',()=>{const overlay=h('div',{class:'d-image-overlay',role:'dialog','aria-label':'Image preview'});const previewImg=h('img',{src,alt,style:{objectFit:'contain'}});overlay.appendChild(previewImg);overlay.addEventListener('click',()=>overlay.remove());document.addEventListener('keydown',function handler(e){if(e.key==='Escape'){overlay.remove();document.removeEventListener('keydown',handler)}});document.body.appendChild(overlay)});container.setAttribute('role','button');container.setAttribute('tabindex','0');container.setAttribute('aria-label',`Preview ${alt || 'image'}`);container.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();container.click()}})}
return container}
Image.Group=function Group(props={},...children){injectBase();const{class:cls,...rest}=props;return h('div',{class:cx('d-space d-space-wrap',cls),...rest},...children)};return{Image}})();const _m100=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Timeline(props={}){injectBase();const{items=[],mode='left',pending=false,class:cls}=props;const container=h('div',{class:cx('d-timeline',mode==='alternate'&&'d-timeline-alternate',cls)});items.forEach((item,i)=>{const el=h('div',{class:'d-timeline-item'});const dot=h('div',{class:cx('d-timeline-dot',item.icon&&'d-timeline-dot-lg')});if(item.icon){if(typeof item.icon==='string')dot.textContent=item.icon; else dot.appendChild(item.icon)}
if(item.color)dot.style.backgroundColor=item.color;el.appendChild(dot);if(i<items.length-1||pending){const line=h('div',{class:'d-timeline-line'});if(item.color)line.style.backgroundColor=item.color;el.appendChild(line)}
const content=h('div',{class:'d-timeline-content'});if(item.time)content.appendChild(h('div',{class:'d-timeline-label'},item.time));if(typeof item.content==='string'){content.appendChild(h('div',null,item.content))}else if(item.content?.nodeType){content.appendChild(item.content)}
el.appendChild(content);container.appendChild(el)});if(pending){const pendingItem=h('div',{class:'d-timeline-item'});const dot=h('div',{class:'d-timeline-dot',style:{opacity:'0.3'}});pendingItem.appendChild(dot);pendingItem.appendChild(h('div',{class:'d-timeline-content'},
h('div',{style:{color:'var(--d-muted)'}},typeof pending==='string'?pending:'Loading...')
));container.appendChild(pendingItem)}
return container}
return{Timeline}})();const _m101=(function(){const{h}=_m2;const{injectBase,cx}=_m147;const{createOverlay}=_m148;function HoverCard(props={},...children){injectBase();const{trigger,position='bottom',openDelay=300,closeDelay=200,class:cls,...rest}=props;const triggerEl=typeof trigger==='function'?trigger():h('span',null,'Hover me');const content=h('div',{class:cx('d-hovercard-content',`d-popover-${position}`,cls),
style:{display:'none'},
...rest},...children);const wrap=h('div',{class:'d-hovercard'},triggerEl,content);createOverlay(triggerEl,content,{trigger:'hover',
hoverDelay:openDelay,
hoverCloseDelay:closeDelay,
closeOnEscape:true});return wrap}
return{HoverCard}})();const _m102=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;function AlertDialog(props={}){injectBase();const{title,description,visible,onConfirm,onCancel,confirmText='Confirm',cancelText='Cancel',variant='destructive',class:cls}=props;const body=h('div',{class:'d-alertdialog-body'});if(title)body.appendChild(h('div',{class:'d-alertdialog-title',id:'d-alertdialog-title'},title));if(description)body.appendChild(h('div',{class:'d-alertdialog-desc'},description));const cancelBtn=h('button',{type:'button',class:'d-btn d-btn-outline'},cancelText);const confirmBtn=h('button',{type:'button',class:`d-btn d-btn-${variant}`},confirmText);const footer=h('div',{class:'d-alertdialog-footer'},cancelBtn,confirmBtn);const panel=h('div',{class:cx('d-alertdialog-panel',cls)},body,footer);const dialog=h('dialog',{class:'d-alertdialog',
role:'alertdialog',
'aria-modal':'true',
'aria-labelledby':title?'d-alertdialog-title':undefined},panel);function close(){if(dialog.open)dialog.close()}
cancelBtn.addEventListener('click',()=>{close();if(onCancel)onCancel()});confirmBtn.addEventListener('click',()=>{close();if(onConfirm)onConfirm()});dialog.addEventListener('cancel',(e)=>{e.preventDefault();close();if(onCancel)onCancel()});if(typeof visible==='function'){createEffect(()=>{if(visible()){if(!dialog.open)dialog.showModal()} else close()})}
return dialog}
return{AlertDialog}})();const _m103=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const{createFocusTrap}=_m148;const SHEET_SECTIONS=['d-sheet-header','d-sheet-body','d-sheet-footer'];function hasSection(children){return children.some(c=>
c&&typeof c==='object'&&c.nodeType===1&&
(c.className||'').split(/\s+/).some(cls=>SHEET_SECTIONS.includes(cls))
)}
function Sheet(props={},...children){injectBase();const{title,footer,visible,onClose,side='right',size='320px',closeOnOutside=true,class:cls}=props;const closeBtn=h('button',{type:'button',class:'d-sheet-close','aria-label':'Close'},'\u00d7');const sizeStyle=(side==='left'||side==='right')?{width:size}:{height:size};const panel=h('div',{class:cx('d-sheet-panel',`d-sheet-${side}`),
style:sizeStyle});if(hasSection(children)){children.forEach(c=>{if(c)panel.appendChild(c)})}else{const header=h('div',{class:'d-sheet-header'});if(title)header.appendChild(h('span',{class:'d-sheet-title'},title));header.appendChild(closeBtn);panel.appendChild(header);if(children.length){panel.appendChild(h('div',{class:'d-sheet-body'},...children))}
if(footer){const footerChildren=Array.isArray(footer)?footer:[footer];panel.appendChild(h('div',{class:'d-sheet-footer'},...footerChildren))}}
const dialog=h('dialog',{class:cx('d-sheet',cls),
role:'dialog',
'aria-modal':'true',
'aria-label':title||'Panel'},panel);const trap=createFocusTrap(dialog);function close(){if(dialog.open)dialog.close()}
closeBtn.addEventListener('click',()=>{close();if(onClose)onClose()});dialog.addEventListener('close',()=>{trap.deactivate();if(onClose)onClose()});if(closeOnOutside){dialog.addEventListener('click',(e)=>{const rect=panel.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom){close();if(onClose)onClose()}})}
dialog.addEventListener('cancel',(e)=>{if(onClose)onClose()});if(typeof visible==='function'){createEffect(()=>{if(visible()){if(!dialog.open){dialog.showModal();trap.activate()}}else{close()}})}
return dialog}
Sheet.Header=function SheetHeader(props={},...children){const{class:cls}=props;return h('div',{class:cx('d-sheet-header',cls)},...children)};Sheet.Body=function SheetBody(props={},...children){const{class:cls}=props;return h('div',{class:cx('d-sheet-body',cls)},...children)};Sheet.Footer=function SheetFooter(props={},...children){const{class:cls}=props;return h('div',{class:cx('d-sheet-footer',cls)},...children)};return{Sheet}})();const _m104=(function(){const{h}=_m2;const{injectBase,cx}=_m147;let _containers={};function getContainer(placement){if(_containers[placement])return _containers[placement];if(typeof document==='undefined')return null;const el=h('div',{class:cx('d-notification-container',`d-notification-${placement}`)});document.body.appendChild(el);_containers[placement]=el;return el}
function notification(props={}){injectBase();const{title,description,type='info',duration=4500,placement='top-right',icon,action,onClose,class:cls}=props;const container=getContainer(placement);if(!container)return{close(){}};const closeBtn=h('button',{type:'button',class:'d-notification-close','aria-label':'Close'},'\u00d7');const content=h('div',{class:'d-notification-content'});if(title)content.appendChild(h('div',{class:'d-notification-title'},title));if(description)content.appendChild(h('div',{class:'d-notification-desc'},description));if(action)content.appendChild(h('div',{class:'d-notification-action'},action));const el=h('div',{class:cx('d-notification',`d-notification-${type}`,cls),
role:'alert',
'aria-live':'assertive'});if(icon)el.appendChild(h('div',{class:'d-notification-icon'},typeof icon==='string'?h('span',null,icon):icon));el.appendChild(content);el.appendChild(closeBtn);function close(){el.classList.add('d-notification-exit');setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el)},250);if(onClose)onClose()}
closeBtn.addEventListener('click',close);container.appendChild(el);let timer;if(duration>0)timer=setTimeout(close,duration);el.addEventListener('mouseenter',()=>{if(timer)clearTimeout(timer)});el.addEventListener('mouseleave',()=>{if(duration>0)timer=setTimeout(close,duration)});return{close}}
function resetNotifications(){for(const el of Object.values(_containers)){if(el.parentNode)el.parentNode.removeChild(el)}
_containers={}}
return{notification,resetNotifications}})();const _m105=(function(){const{h}=_m2;const{injectBase,cx}=_m147;let _container=null;function getContainer(){if(_container)return _container;if(typeof document==='undefined')return null;_container=h('div',{class:'d-message-container'});document.body.appendChild(_container);return _container}
const ICONS={info:'\u2139\ufe0f',
success:'\u2705',
warning:'\u26a0\ufe0f',
error:'\u274c',
loading:'\u23f3'};function message(props={}){injectBase();const{content,type='info',duration=3000,icon,onClose,class:cls}=props;const container=getContainer();if(!container)return{close(){}};const iconEl=icon
?(typeof icon==='string'?h('span',{class:'d-message-icon'},icon):icon)
:h('span',{class:'d-message-icon'},ICONS[type]||ICONS.info);const el=h('div',{class:cx('d-message',`d-message-${type}`,cls),
role:'status',
'aria-live':'polite'},iconEl,h('span',{class:'d-message-text'},content));container.appendChild(el);function close(){el.classList.add('d-message-exit');setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el)},200);if(onClose)onClose()}
if(duration>0)setTimeout(close,duration);return{close}}
message.info=(content,duration)=>message({content,type:'info',duration});message.success=(content,duration)=>message({content,type:'success',duration});message.warning=(content,duration)=>message({content,type:'warning',duration});message.error=(content,duration)=>message({content,type:'error',duration});message.loading=(content,duration=0)=>message({content,type:'loading',duration});function resetMessages(){if(_container&&_container.parentNode)_container.parentNode.removeChild(_container);_container=null}
return{message,resetMessages}})();const _m106=(function(){const{h}=_m2;const{injectBase,cx}=_m147;const STATUS_ICONS={success:'\u2705',
error:'\u274c',
info:'\u2139\ufe0f',
warning:'\u26a0\ufe0f',
403:'\ud83d\udeab',
404:'\ud83d\udd0d',
500:'\ud83d\udca5'};function Result(props={},...children){injectBase();const{status='info',title,subTitle,icon,extra,class:cls}=props;const iconNode=icon
?(typeof icon==='string'?h('div',{class:'d-result-icon'},icon):h('div',{class:'d-result-icon'},icon))
:h('div',{class:cx('d-result-icon',`d-result-icon-${status}`)},STATUS_ICONS[status]||STATUS_ICONS.info);const el=h('div',{class:cx('d-result',cls)});el.appendChild(iconNode);if(title)el.appendChild(h('div',{class:'d-result-title'},title));if(subTitle)el.appendChild(h('div',{class:'d-result-subtitle'},subTitle));if(children.length){const content=h('div',{class:'d-result-content'});children.forEach(c=>{if(c&&c.nodeType)content.appendChild(c)});el.appendChild(content)}
if(extra&&extra.length){const actions=h('div',{class:'d-result-extra'});extra.forEach(node=>{if(node&&node.nodeType)actions.appendChild(node)});el.appendChild(actions)}
return el}
return{Result}})();const _m107=(function(){const{h}=_m2;const{injectBase,cx}=_m147;const{createOverlay}=_m148;function Popconfirm(props={}){injectBase();const{title='Are you sure?',description,onConfirm,onCancel,
confirmText='Yes',cancelText='No',icon,position='top',
trigger,class:cls}=props;const triggerEl=typeof trigger==='function'?trigger():h('button',{type:'button'},'Click');const cancelBtn=h('button',{type:'button',class:'d-btn d-btn-sm d-btn-outline'},cancelText);const confirmBtn=h('button',{type:'button',class:'d-btn d-btn-sm d-btn-primary'},confirmText);const body=h('div',{class:'d-popconfirm-body'});if(icon)body.appendChild(h('span',{class:'d-popconfirm-icon'},typeof icon==='string'?icon:icon));const textWrap=h('div',{class:'d-popconfirm-text'});textWrap.appendChild(h('div',{class:'d-popconfirm-title'},title));if(description)textWrap.appendChild(h('div',{class:'d-popconfirm-desc'},description));body.appendChild(textWrap);const footer=h('div',{class:'d-popconfirm-footer'},cancelBtn,confirmBtn);const content=h('div',{class:cx('d-popconfirm',`d-popover-${position}`,cls),
style:{display:'none'}},body,footer);const wrap=h('div',{class:'d-popconfirm-wrap'},triggerEl,content);const overlay=createOverlay(triggerEl,content,{trigger:'click',
closeOnEscape:true,
closeOnOutside:true});cancelBtn.addEventListener('click',()=>{overlay.close();if(onCancel)onCancel()});confirmBtn.addEventListener('click',()=>{overlay.close();if(onConfirm)onConfirm()});return wrap}
return{Popconfirm}})();const _m108=(function(){const{h}=_m2;const{createSignal,createEffect}=_m14;const{injectBase,cx}=_m147;const{createListbox,createFocusTrap}=_m148;function Command(props={}){injectBase();const{visible,items=[],onSelect,onClose,placeholder='Type a command or search...',filter,class:cls}=props;const input=h('input',{type:'text',
class:'d-command-input',
placeholder,
autocomplete:'off',
spellcheck:'false'});const searchWrap=h('div',{class:'d-command-search'},
h('span',{class:'d-command-search-icon','aria-hidden':'true'},'\ud83d\udd0d'),
input
);const listEl=h('div',{class:'d-command-list',role:'listbox'});const emptyEl=h('div',{class:'d-command-empty',style:{display:'none'}},'No results found.');const panel=h('div',{class:cx('d-command-panel',cls)},searchWrap,listEl,emptyEl);const dialog=h('dialog',{class:'d-command',
role:'dialog',
'aria-modal':'true',
'aria-label':'Command palette'},panel);const trap=createFocusTrap(dialog);const listbox=createListbox(listEl,{itemSelector:'.d-command-item:not(.d-command-item-disabled)',
activeClass:'d-command-item-active',
orientation:'vertical',
onSelect:(el)=>{const idx=parseInt(el.dataset.index,10);const item=_filteredItems[idx];if(item){if(item.onSelect)item.onSelect(item);if(onSelect)onSelect(item);close()}}});let _filteredItems=[];const defaultFilter=(item,query)=>{if(!query)return true;const q=query.toLowerCase();return item.label.toLowerCase().includes(q)||(item.value&&item.value.toLowerCase().includes(q))};function renderItems(query){const filterFn=filter||defaultFilter;_filteredItems=items.filter(item=>filterFn(item,query));listEl.replaceChildren();let currentGroup=null;_filteredItems.forEach((item,i)=>{if(item.group&&item.group!==currentGroup){currentGroup=item.group;listEl.appendChild(h('div',{class:'d-command-group'},currentGroup))}
const children=[];if(item.icon){children.push(typeof item.icon==='string'
?h('span',{class:'d-command-item-icon','aria-hidden':'true'},item.icon)
:item.icon)}
children.push(h('span',{class:'d-command-item-label'},item.label));if(item.shortcut){children.push(h('span',{class:'d-command-item-shortcut'},item.shortcut))}
const el=h('div',{class:cx('d-command-item',item.disabled&&'d-command-item-disabled'),
role:'option',
tabindex:'-1',
'data-index':String(i)},...children);if(!item.disabled){el.addEventListener('click',()=>{if(item.onSelect)item.onSelect(item);if(onSelect)onSelect(item);close()})}
listEl.appendChild(el)});emptyEl.style.display=_filteredItems.length?'none':'';listbox.reset();if(_filteredItems.length)listbox.highlight(0)}
input.addEventListener('input',()=>renderItems(input.value));function close(){if(dialog.open)dialog.close()}
dialog.addEventListener('close',()=>{trap.deactivate();input.value='';if(onClose)onClose()});dialog.addEventListener('cancel',()=>{if(onClose)onClose()});dialog.addEventListener('click',(e)=>{const rect=panel.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||
e.clientY<rect.top||e.clientY>rect.bottom){close()}});input.addEventListener('keydown',(e)=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='Enter'){listbox.handleKeydown(e)}});if(typeof visible==='function'){createEffect(()=>{if(visible()){if(!dialog.open){renderItems('');dialog.showModal();trap.activate();input.focus()}}else{close()}})}
return dialog}
return{Command}})();const _m109=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function FloatButton(props={}){injectBase();const{icon='+',tooltip,shape='circle',type='default',onClick,position='right-bottom',class:cls}=props;const iconEl=typeof icon==='string'?h('span',{class:'d-float-btn-icon'},icon):icon;const btn=h('button',{type:'button',
class:cx('d-float-btn',`d-float-btn-${shape}`,`d-float-btn-${type}`,cls),
'aria-label':tooltip||'Action'},iconEl);if(tooltip){btn.setAttribute('title',tooltip)}
if(onClick)btn.addEventListener('click',onClick);const wrap=h('div',{class:cx('d-float-btn-wrap',`d-float-btn-${position}`)},btn);return wrap}
FloatButton.Group=function FloatButtonGroup(props={},...children){injectBase();const{icon='+',shape='circle',direction='top',position='right-bottom',class:cls}=props;const iconEl=typeof icon==='string'?h('span',{class:'d-float-btn-icon'},icon):icon;const trigger=h('button',{type:'button',
class:cx('d-float-btn',`d-float-btn-${shape}`,'d-float-btn-primary'),
'aria-label':'Actions',
'aria-expanded':'false'},iconEl);const menu=h('div',{class:cx('d-float-btn-group-menu',`d-float-btn-group-${direction}`),style:{display:'none'}});children.forEach(c=>{if(c&&c.nodeType)menu.appendChild(c)});let open=false;trigger.addEventListener('click',()=>{open=!open;menu.style.display=open?'':'none';trigger.setAttribute('aria-expanded',String(open));trigger.classList.toggle('d-float-btn-active',open)});const wrap=h('div',{class:cx('d-float-btn-wrap',`d-float-btn-${position}`,cls)},menu,trigger);return wrap};return{FloatButton}})();const _m110=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Tour(props={}){injectBase();const{steps=[],onFinish,onChange,onClose,class:cls}=props;let current=0;let overlay=null;let popover=null;function resolveTarget(target){if(typeof target==='string')return document.querySelector(target);return target}
function createOverlayEl(){return h('div',{class:cx('d-tour-overlay',cls)})}
function positionPopover(targetEl,placement='bottom'){if(!targetEl||!popover)return;const rect=targetEl.getBoundingClientRect();const scrollX=window.scrollX;const scrollY=window.scrollY;overlay.style.setProperty('--tour-x',`${rect.left + scrollX}px`);overlay.style.setProperty('--tour-y',`${rect.top + scrollY}px`);overlay.style.setProperty('--tour-w',`${rect.width}px`);overlay.style.setProperty('--tour-h',`${rect.height}px`);let top,left;if(placement==='bottom'){top=rect.bottom+scrollY+12;left=rect.left+scrollX} else if(placement==='top'){top=rect.top+scrollY-12;left=rect.left+scrollX;popover.style.transform='translateY(-100%)'} else if(placement==='left'){top=rect.top+scrollY;left=rect.left+scrollX-12;popover.style.transform='translateX(-100%)'} else{top=rect.top+scrollY;left=rect.right+scrollX+12}
popover.style.position='absolute';popover.style.top=`${top}px`;popover.style.left=`${left}px`}
function renderStep(){const step=steps[current];if(!step)return;const targetEl=resolveTarget(step.target);if(popover)popover.remove();const prevBtn=h('button',{type:'button',class:'d-btn d-btn-sm d-btn-outline',disabled:current===0},'Prev');const nextBtn=h('button',{type:'button',class:'d-btn d-btn-sm d-btn-primary'},
current===steps.length-1?'Finish':'Next');const closeBtn=h('button',{type:'button',class:'d-tour-close','aria-label':'Close tour'},'\u00d7');const body=h('div',{class:'d-tour-body'});if(step.title)body.appendChild(h('div',{class:'d-tour-title'},step.title));if(step.description)body.appendChild(h('div',{class:'d-tour-desc'},step.description));const footer=h('div',{class:'d-tour-footer'},
h('span',{class:'d-tour-steps'},`${current + 1} / ${steps.length}`),
h('div',{class:'d-tour-actions'},prevBtn,nextBtn)
);popover=h('div',{class:cx('d-tour-popover',cls)},closeBtn,body,footer);document.body.appendChild(popover);prevBtn.addEventListener('click',prev);nextBtn.addEventListener('click',()=>{if(current===steps.length-1){close();if(onFinish)onFinish()} else next()});closeBtn.addEventListener('click',close);if(targetEl){targetEl.scrollIntoView({behavior:'smooth',block:'center'});requestAnimationFrame(()=>positionPopover(targetEl,step.placement))}}
function start(stepIndex=0){if(typeof document==='undefined')return;current=stepIndex;overlay=createOverlayEl();document.body.appendChild(overlay);renderStep();document.addEventListener('keydown',_onKey)}
function _onKey(e){if(e.key==='Escape')close()}
function next(){if(current<steps.length-1){current++;if(onChange)onChange(current,'next');renderStep()}}
function prev(){if(current>0){current--;if(onChange)onChange(current,'prev');renderStep()}}
function goTo(index){if(index>=0&&index<steps.length){current=index;if(onChange)onChange(current,'goto');renderStep()}}
function close(){if(overlay){overlay.remove();overlay=null}
if(popover){popover.remove();popover=null}
document.removeEventListener('keydown',_onKey);if(onClose)onClose()}
return{start,next,prev,close,goTo}}
return{Tour}})();const _m111=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Watermark(props={},...children){injectBase();const{content,image,rotate=-22,fontSize=14,fontColor='rgba(0,0,0,0.1)',
gap=[100,100],offset=[0,0],zIndex=9,class:cls}=props;const container=h('div',{class:cx('d-watermark',cls),style:{position:'relative'}});children.forEach(c=>{if(c&&c.nodeType)container.appendChild(c)});const watermarkLayer=h('div',{class:'d-watermark-layer',
style:{position:'absolute',
inset:'0',
pointerEvents:'none',
zIndex:String(zIndex),
overflow:'hidden'}});container.appendChild(watermarkLayer);function render(){if(typeof document==='undefined')return;const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');if(!ctx)return;const texts=Array.isArray(content)?content:(content?[content]:[]);const lineHeight=fontSize*1.5;const textHeight=texts.length*lineHeight;const markWidth=120+gap[0];const markHeight=Math.max(textHeight,40)+gap[1];canvas.width=markWidth*2;canvas.height=markHeight*2;ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate((rotate*Math.PI)/180);ctx.translate(-canvas.width/2,-canvas.height/2);if(image){const img=new Image();img.crossOrigin='anonymous';img.onload=()=>{const imgW=Math.min(img.width,markWidth-gap[0]);const imgH=(img.height/img.width)*imgW;ctx.drawImage(img,offset[0]+(markWidth-imgW)/2,offset[1]+(markHeight-imgH)/2,imgW,imgH);applyPattern(canvas)};img.src=image}else if(texts.length){ctx.font=`${fontSize}px sans-serif`;ctx.fillStyle=fontColor;ctx.textAlign='center';ctx.textBaseline='middle';const cx0=canvas.width/2+offset[0];const cy0=canvas.height/2+offset[1]-(textHeight/2)+(lineHeight/2);texts.forEach((line,i)=>{ctx.fillText(line,cx0,cy0+i*lineHeight)});applyPattern(canvas)}}
function applyPattern(canvas){const dataURL=canvas.toDataURL();watermarkLayer.style.backgroundImage=`url(${dataURL})`;watermarkLayer.style.backgroundRepeat='repeat';watermarkLayer.style.backgroundSize=`${canvas.width / 2}px ${canvas.height / 2}px`}
if(typeof MutationObserver!=='undefined'){const observer=new MutationObserver((mutations)=>{for(const m of mutations){for(const removed of m.removedNodes){if(removed===watermarkLayer){container.appendChild(watermarkLayer);render();return}}}});observer.observe(container,{childList:true})}
requestAnimationFrame(render);return container}
return{Watermark}})();const _m112=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;function MaskedInput(props={}){injectBase();const{mask,
placeholder:ph='_',
value,
disabled,
readonly,
error,
onchange,
oncomplete,
class:cls,}=props;if(!mask)throw new Error('MaskedInput requires a mask prop');const slots=[];for(let i=0;i<mask.length;i++){const c=mask[i];if(c==='#')slots.push({type:'digit',index:i}); else if(c==='A')slots.push({type:'letter',index:i}); else if(c==='*')slots.push({type:'alnum',index:i}); else slots.push({type:'literal',char:c,index:i})}
const editableSlots=slots.filter(s=>s.type!=='literal');const totalEditable=editableSlots.length;function testChar(slot,ch){if(slot.type==='digit')return/\d/.test(ch);if(slot.type==='letter')return/[a-zA-Z]/.test(ch);if(slot.type==='alnum')return/[a-zA-Z0-9]/.test(ch);return false}
function unmasked(display){let raw='';for(const s of editableSlots){const ch=display[s.index];if(ch&&ch!==ph)raw+=ch}
return raw}
function toDisplay(raw){let out='';let rawIdx=0;for(const s of slots){if(s.type==='literal'){out+=s.char}else if(rawIdx<raw.length){out+=raw[rawIdx++]}else{out+=ph}}
return out}
function cursorToEditableIndex(pos){let count=0;for(let i=0;i<slots.length;i++){if(slots[i].type!=='literal'){if(i>=pos)return count;count++}}
return count}
function editableIndexToCursor(idx){let count=0;for(let i=0;i<slots.length;i++){if(slots[i].type!=='literal'){if(count===idx)return i;count++}}
return mask.length}
function nextEditablePos(pos){for(let i=pos;i<slots.length;i++){if(slots[i].type!=='literal')return i}
return-1}
function prevEditablePos(pos){for(let i=pos;i>=0;i--){if(slots[i].type!=='literal')return i}
return-1}
const initRaw=typeof value==='function'?value():(value||'');let _display=toDisplay(initRaw);const input=h('input',{type:'text',
class:cx('d-input','d-masked-input',error&&'d-input-error',cls),
value:_display,
disabled:(typeof disabled==='function'?disabled():disabled)?'':undefined,
readonly:readonly?'':undefined,
'aria-invalid':error?'true':undefined,});function sync(){input.value=_display;const raw=unmasked(_display);if(onchange)onchange(raw);if(raw.length===totalEditable&&oncomplete)oncomplete(raw)}
input.addEventListener('focus',()=>{requestAnimationFrame(()=>{const firstEmpty=_display.indexOf(ph);if(firstEmpty>=0)input.setSelectionRange(firstEmpty,firstEmpty)})});input.addEventListener('keydown',(e)=>{const pos=input.selectionStart;if(e.key==='Backspace'){e.preventDefault();const ep=prevEditablePos(pos-1);if(ep>=0){const chars=_display.split('');chars[ep]=ph;_display=chars.join('');sync();input.setSelectionRange(ep,ep)}
return}
if(e.key==='Delete'){e.preventDefault();const ep=nextEditablePos(pos);if(ep>=0){const chars=_display.split('');chars[ep]=ph;_display=chars.join('');sync();input.setSelectionRange(pos,pos)}
return}
if(e.key==='ArrowLeft'||e.key==='ArrowRight')return;if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();const ep=nextEditablePos(pos);if(ep>=0&&testChar(slots[ep],e.key)){const chars=_display.split('');chars[ep]=e.key;_display=chars.join('');sync();const next=nextEditablePos(ep+1);input.setSelectionRange(next>=0?next:ep+1,next>=0?next:ep+1)}}});input.addEventListener('paste',(e)=>{e.preventDefault();const text=(e.clipboardData||window.clipboardData).getData('text');const chars=_display.split('');let rawIdx=cursorToEditableIndex(input.selectionStart);for(const ch of text){if(rawIdx>=totalEditable)break;const slot=editableSlots[rawIdx];if(testChar(slot,ch)){chars[slot.index]=ch;rawIdx++}}
_display=chars.join('');sync();const nextPos=editableIndexToCursor(rawIdx);input.setSelectionRange(nextPos,nextPos)});input.addEventListener('input',(e)=>{input.value=_display});if(typeof value==='function'){createEffect(()=>{_display=toDisplay(value());input.value=_display})}
if(typeof disabled==='function'){createEffect(()=>{input.disabled=!!disabled()})}
return input}
return{MaskedInput}})();const _m113=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function Banner(props={},...children){injectBase();const{variant='info',dismissible=false,onDismiss,sticky=false,icon,action,class:cls}=props;const bannerClass=cx(
'd-banner',
`d-banner-${variant}`,
sticky==='top'&&'d-banner-sticky-top',
sticky==='bottom'&&'d-banner-sticky-bottom',
cls
);const el=h('div',{class:bannerClass,role:'banner'});if(icon){const iconEl=typeof icon==='string'
?h('span',{class:'d-banner-icon','aria-hidden':'true'},icon)
:h('span',{class:'d-banner-icon','aria-hidden':'true'},icon);el.appendChild(iconEl)}
const body=h('div',{class:'d-banner-body'},...children);el.appendChild(body);if(action){const actionEl=h('div',{class:'d-banner-action'},
typeof action==='string'?h('span',null,action):action
);el.appendChild(actionEl)}
if(dismissible){const closeBtn=h('button',{class:'d-banner-dismiss',
'aria-label':'Dismiss banner',
type:'button'},'\u00d7');closeBtn.addEventListener('click',()=>{el.remove();if(onDismiss)onDismiss()});el.appendChild(closeBtn)}
return el}
return{Banner}})();const _m114=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function CodeBlock(props={},...children){injectBase();const{language,lineNumbers=false,copyable=true,maxHeight,class:cls}=props;const code=children.join('');const lines=code.split('\n');const wrap=h('div',{class:cx('d-codeblock',cls)});if(language||copyable){const header=h('div',{class:'d-codeblock-header'});if(language){header.appendChild(h('span',{class:'d-codeblock-lang'},language))}
if(copyable){const copyBtn=h('button',{type:'button',
class:'d-codeblock-copy',
'aria-label':'Copy code'},'Copy');copyBtn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(code);copyBtn.textContent='Copied!';setTimeout(()=>{copyBtn.textContent='Copy'},2000)}catch(_){copyBtn.textContent='Failed';setTimeout(()=>{copyBtn.textContent='Copy'},2000)}});header.appendChild(copyBtn)}
wrap.appendChild(header)}
const pre=h('pre',{class:'d-codeblock-pre',
style:maxHeight?{maxHeight:`${maxHeight}px`,overflow:'auto'}:undefined});if(lineNumbers){const gutter=h('span',{class:'d-codeblock-gutter','aria-hidden':'true'});for(let i=1;i<=lines.length;i++){gutter.appendChild(h('span',{class:'d-codeblock-ln'},String(i)));if(i<lines.length)gutter.appendChild(document.createTextNode('\n'))}
pre.appendChild(gutter)}
const codeEl=h('code',{class:cx('d-codeblock-code',language&&`language-${language}`)});codeEl.textContent=code;pre.appendChild(codeEl);wrap.appendChild(pre);return wrap}
return{CodeBlock}})();const _m115=(function(){const{h}=_m2;const{injectBase,cx}=_m147;const{createDrag}=_m148;function SortableList(props={}){injectBase();const{items:initialItems,
keyFn=(_,i)=>String(i),
renderFn,
onReorder,
direction='vertical',
disabled=false,
class:cls,}=props;let items=[...initialItems];const isVertical=direction==='vertical';const container=h('div',{class:cx('d-sortable',isVertical?'d-sortable-v':'d-sortable-h',cls),
role:'list',
'aria-label':'Reorderable list',});const liveRegion=h('div',{class:'d-sr-only','aria-live':'assertive','aria-atomic':'true'});container.appendChild(liveRegion);function announce(msg){liveRegion.textContent=msg}
const indicator=h('div',{class:'d-sortable-indicator'});let dragIdx=-1;let dropIdx=-1;function render(){while(container.children.length>1)container.removeChild(container.lastChild);items.forEach((item,i)=>{const handle=h('div',{class:'d-sortable-handle',
'aria-hidden':'true',},'\u2261');const row=renderFn(item,i,handle);row.setAttribute('role','listitem');row.classList.add('d-sortable-item');row.setAttribute('data-sortable-index',String(i));row.setAttribute('tabindex',i===0?'0':'-1');row.setAttribute('aria-roledescription','sortable item');if(!disabled){createDrag(handle,{onStart:()=>{dragIdx=i;row.classList.add('d-sortable-dragging');container.classList.add('d-sortable-active')},
onMove:(x,y)=>{const children=getItemElements();let newDropIdx=items.length;for(let j=0;j<children.length;j++){const rect=children[j].getBoundingClientRect();const mid=isVertical?rect.top+rect.height/2:rect.left+rect.width/2;const pos=isVertical?y:x;if(pos<mid){newDropIdx=j;break}}
if(newDropIdx!==dropIdx){dropIdx=newDropIdx;positionIndicator(dropIdx)}},
onEnd:()=>{row.classList.remove('d-sortable-dragging');container.classList.remove('d-sortable-active');indicator.remove();if(dragIdx>=0&&dropIdx>=0&&dragIdx!==dropIdx&&dragIdx!==dropIdx-1){const moved=items.splice(dragIdx,1)[0];const insertAt=dropIdx>dragIdx?dropIdx-1:dropIdx;items.splice(insertAt,0,moved);render();if(onReorder)onReorder([...items])}
dragIdx=-1;dropIdx=-1}});row.addEventListener('keydown',(e)=>{if(!e.altKey){if(e.key===(isVertical?'ArrowDown':'ArrowRight')){e.preventDefault();focusItem(i+1)}else if(e.key===(isVertical?'ArrowUp':'ArrowLeft')){e.preventDefault();focusItem(i-1)}
return}
const moveUp=e.key===(isVertical?'ArrowUp':'ArrowLeft');const moveDown=e.key===(isVertical?'ArrowDown':'ArrowRight');if(moveUp&&i>0){e.preventDefault();[items[i],items[i-1]]=[items[i-1],items[i]];render();focusItem(i-1);announce(`Moved to position ${i}`);if(onReorder)onReorder([...items])}else if(moveDown&&i<items.length-1){e.preventDefault();[items[i],items[i+1]]=[items[i+1],items[i]];render();focusItem(i+1);announce(`Moved to position ${i + 2}`);if(onReorder)onReorder([...items])}})}
container.appendChild(row)})}
function getItemElements(){return[...container.querySelectorAll('.d-sortable-item')]}
function focusItem(idx){const els=getItemElements();if(idx>=0&&idx<els.length){els.forEach(el=>el.setAttribute('tabindex','-1'));els[idx].setAttribute('tabindex','0');els[idx].focus()}}
function positionIndicator(idx){const children=getItemElements();indicator.remove();if(idx<=children.length){const ref=children[idx]||null;container.insertBefore(indicator,ref)}}
render();return container}
return{SortableList}})();const _m116=(function(){const{h}=_m2;const{createEffect}=_m14;const{injectBase,cx}=_m147;const{createOverlay}=_m148;const{icon}=_m54;const DAYS_HDR=['Su','Mo','Tu','We','Th','Fr','Sa'];const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];function DateTimePicker(props={}){injectBase();const{value,placeholder='Select date and time',
min,max,seconds=false,use12h=false,
disabled,onchange,class:cls}=props;let selected=parseVal(typeof value==='function'?value():value);let viewDate=selected?new Date(selected):new Date();let _h=selected?selected.getHours():12;let _m=selected?selected.getMinutes():0;let _s=selected?selected.getSeconds():0;function parseVal(v){if(!v)return null;if(v instanceof Date)return v;const d=new Date(v);return isNaN(d)?null:d}
function formatDisplay(d){if(!d)return'';const y=d.getFullYear();const mo=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');let h=d.getHours(),period='';if(use12h){period=h>=12?' PM':' AM';h=h%12||12}
const time=`${String(h).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}${seconds ? ':' + String(d.getSeconds()).padStart(2, '0') : ''}${period}`;return`${y}-${mo}-${day} ${time}`}
function buildDateTime(date,hours,mins,secs){const d=new Date(date);d.setHours(hours,mins,secs,0);return d}
const displayEl=h('span',{class:'d-select-display'});const arrow=icon('calendar',{size:'1em',class:'d-select-arrow'});const trigger=h('button',{type:'button',
class:'d-select',
'aria-haspopup':'dialog',
'aria-expanded':'false'},displayEl,arrow);const panel=h('div',{class:'d-datetimepicker-panel',style:{display:'none'}});const wrap=h('div',{class:cx('d-datetimepicker',cls)},trigger,panel);function updateDisplay(){displayEl.textContent=selected?formatDisplay(selected):placeholder;if(!selected)displayEl.classList.add('d-select-placeholder'); else displayEl.classList.remove('d-select-placeholder')}
function renderPanel(){panel.replaceChildren();const year=viewDate.getFullYear();const month=viewDate.getMonth();const calSection=h('div',{class:'d-datetimepicker-date'});const prevBtn=h('button',{type:'button',class:'d-datepicker-nav-btn','aria-label':'Previous month'},'\u2039');const nextBtn=h('button',{type:'button',class:'d-datepicker-nav-btn','aria-label':'Next month'},'\u203A');const title=h('span',{class:'d-datepicker-title'},`${MONTHS[month]} ${year}`);prevBtn.addEventListener('click',()=>{viewDate.setMonth(month-1);renderPanel()});nextBtn.addEventListener('click',()=>{viewDate.setMonth(month+1);renderPanel()});calSection.appendChild(h('div',{class:'d-datepicker-header'},
h('div',{class:'d-datepicker-nav'},prevBtn),title,h('div',{class:'d-datepicker-nav'},nextBtn)));const grid=h('div',{class:'d-datepicker-grid',role:'grid'});DAYS_HDR.forEach(d=>grid.appendChild(h('div',{class:'d-datepicker-weekday'},d)));const firstDay=new Date(year,month,1).getDay();const daysInMonth=new Date(year,month+1,0).getDate();const daysInPrev=new Date(year,month,0).getDate();const today=new Date();function sameDay(a,b){return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
for(let i=firstDay-1;i>=0;i--){grid.appendChild(h('button',{type:'button',class:'d-datepicker-day d-datepicker-day-outside',tabindex:'-1'},String(daysInPrev-i)))}
for(let i=1;i<=daysInMonth;i++){const d=new Date(year,month,i);const dayClass=cx(
'd-datepicker-day',
sameDay(d,today)&&'d-datepicker-day-today',
sameDay(d,selected)&&'d-datepicker-day-selected',
);const btn=h('button',{type:'button',class:dayClass,tabindex:'-1'},String(i));btn.addEventListener('click',()=>{viewDate=new Date(d);selected=buildDateTime(d,_h,_m,_s);updateDisplay();renderPanel();if(onchange)onchange(new Date(selected))});grid.appendChild(btn)}
const totalCells=firstDay+daysInMonth;const remaining=(7-(totalCells%7))%7;for(let i=1;i<=remaining;i++){grid.appendChild(h('button',{type:'button',class:'d-datepicker-day d-datepicker-day-outside',tabindex:'-1'},String(i)))}
calSection.appendChild(grid);panel.appendChild(calSection);const timeSection=h('div',{class:'d-datetimepicker-time'});const timeLabel=h('div',{class:'d-datetimepicker-time-label'},'Time');timeSection.appendChild(timeLabel);const timeRow=h('div',{class:'d-datetimepicker-time-row'});function createSpinner(val,minV,maxV,onChange){const input=h('input',{type:'number',
class:'d-datetimepicker-spinner',
min:String(minV),
max:String(maxV),
value:String(val).padStart(2,'0'),});input.addEventListener('change',()=>{let v=parseInt(input.value,10);if(isNaN(v))v=minV;v=Math.max(minV,Math.min(maxV,v));input.value=String(v).padStart(2,'0');onChange(v)});return input}
const hInput=createSpinner(use12h?(_h%12||12):_h,use12h?1:0,use12h?12:23,(v)=>{_h=use12h?(v%12)+(_h>=12?12:0):v;if(selected){selected=buildDateTime(selected,_h,_m,_s);updateDisplay();if(onchange)onchange(new Date(selected))}});timeRow.appendChild(hInput);timeRow.appendChild(h('span',{class:'d-datetimepicker-sep'},':'));const mInput=createSpinner(_m,0,59,(v)=>{_m=v;if(selected){selected=buildDateTime(selected,_h,_m,_s);updateDisplay();if(onchange)onchange(new Date(selected))}});timeRow.appendChild(mInput);if(seconds){timeRow.appendChild(h('span',{class:'d-datetimepicker-sep'},':'));const sInput=createSpinner(_s,0,59,(v)=>{_s=v;if(selected){selected=buildDateTime(selected,_h,_m,_s);updateDisplay();if(onchange)onchange(new Date(selected))}});timeRow.appendChild(sInput)}
if(use12h){const ampm=h('button',{type:'button',class:'d-datetimepicker-ampm'},_h>=12?'PM':'AM');ampm.addEventListener('click',()=>{_h=_h>=12?_h-12:_h+12;ampm.textContent=_h>=12?'PM':'AM';if(selected){selected=buildDateTime(selected,_h,_m,_s);updateDisplay();if(onchange)onchange(new Date(selected))}});timeRow.appendChild(ampm)}
timeSection.appendChild(timeRow);const nowBtn=h('button',{type:'button',class:'d-datetimepicker-now'},'Now');nowBtn.addEventListener('click',()=>{const now=new Date();selected=now;viewDate=new Date(now);_h=now.getHours();_m=now.getMinutes();_s=now.getSeconds();updateDisplay();renderPanel();if(onchange)onchange(new Date(selected))});timeSection.appendChild(nowBtn);panel.appendChild(timeSection);const footer=h('div',{class:'d-datetimepicker-footer'});const okBtn=h('button',{type:'button',class:'d-btn d-btn-sm'},'OK');okBtn.addEventListener('click',()=>overlay.close());footer.appendChild(okBtn);panel.appendChild(footer)}
const overlay=createOverlay(trigger,panel,{trigger:'click',
closeOnEscape:true,
closeOnOutside:true,
onOpen:renderPanel,});updateDisplay();if(typeof value==='function'){createEffect(()=>{selected=parseVal(value());if(selected){viewDate=new Date(selected);_h=selected.getHours();_m=selected.getMinutes();_s=selected.getSeconds()}
updateDisplay()})}
if(typeof disabled==='function'){createEffect(()=>{trigger.disabled=!!disabled()})}else if(disabled){trigger.disabled=true}
return wrap}
return{DateTimePicker}})();const _m117=(function(){const{h}=_m2;const{injectBase,cx}=_m147;function VisuallyHidden(props={},...children){injectBase();const{class:cls,...rest}=props;return h('span',{class:cx('d-sr-only',cls),...rest},...children)}
return{VisuallyHidden}})();const _m16=(function(){const{Button,buttonVariants}=_m25;const{Spinner}=_m26;const{Input}=_m27;const{Textarea}=_m28;const{Checkbox}=_m29;const{Switch}=_m30;const{Select}=_m31;const{Card}=_m32;const{Badge}=_m33;const{Modal}=_m34;const{Tabs}=_m35;const{Accordion}=_m36;const{Separator}=_m37;const{Breadcrumb}=_m38;const{Table}=_m39;const{Avatar}=_m40;const{Progress}=_m41;const{Skeleton}=_m42;const{Tooltip}=_m43;const{Alert}=_m44;const{toast,resetToasts}=_m45;const{Chip}=_m46;const{Dropdown}=_m47;const{Drawer}=_m48;const{Pagination}=_m49;const{RadioGroup}=_m50;const{Popover}=_m51;const{Combobox}=_m52;const{Slider}=_m53;const{icon}=_m54;const{registerIcon,registerIcons}=_m55;const{Toggle,ToggleGroup}=_m56;const{Title,Text,Paragraph,Link,Blockquote}=_m57;const{Kbd}=_m58;const{Space}=_m59;const{AspectRatio}=_m60;const{Resizable}=_m61;const{ScrollArea}=_m62;const{Collapsible}=_m63;const{Splitter}=_m64;const{Menu}=_m65;const{Steps}=_m66;const{Segmented}=_m67;const{Affix}=_m68;const{ContextMenu}=_m69;const{NavigationMenu}=_m70;const{BackTop}=_m71;const{InputGroup,CompactGroup}=_m72;const{InputNumber}=_m73;const{InputOTP}=_m74;const{Rate}=_m75;const{ColorPicker}=_m76;const{DatePicker}=_m77;const{TimePicker}=_m78;const{Upload}=_m79;const{Transfer}=_m80;const{Cascader}=_m81;const{Mentions}=_m82;const{Label}=_m83;const{Form,Field,createFormField}=_m84;const{DateRangePicker}=_m85;const{TimeRangePicker}=_m86;const{RangeSlider}=_m87;const{TreeSelect}=_m88;const{DataTable}=_m89;const{AvatarGroup}=_m90;const{Tag}=_m91;const{List}=_m92;const{Tree}=_m93;const{Descriptions}=_m94;const{Statistic}=_m95;const{Calendar}=_m96;const{Carousel}=_m97;const{Empty}=_m98;const{Image}=_m99;const{Timeline}=_m100;const{HoverCard}=_m101;const{AlertDialog}=_m102;const{Sheet}=_m103;const{notification,resetNotifications}=_m104;const{message,resetMessages}=_m105;const{Result}=_m106;const{Popconfirm}=_m107;const{Command}=_m108;const{FloatButton}=_m109;const{Tour}=_m110;const{Watermark}=_m111;const{MaskedInput}=_m112;const{Banner}=_m113;const{CodeBlock}=_m114;const{SortableList}=_m115;const{DateTimePicker}=_m116;const{VisuallyHidden}=_m117;return{Button,buttonVariants,Spinner,Input,Textarea,Checkbox,Switch,Select,Card,Badge,Modal,Tabs,Accordion,Separator,Breadcrumb,Table,Avatar,Progress,Skeleton,Tooltip,Alert,toast,resetToasts,Chip,Dropdown,Drawer,Pagination,RadioGroup,Popover,Combobox,Slider,icon,registerIcon,registerIcons,Toggle,ToggleGroup,Title,Text,Paragraph,Link,Blockquote,Kbd,Space,AspectRatio,Resizable,ScrollArea,Collapsible,Splitter,Menu,Steps,Segmented,Affix,ContextMenu,NavigationMenu,BackTop,InputGroup,CompactGroup,InputNumber,InputOTP,Rate,ColorPicker,DatePicker,TimePicker,Upload,Transfer,Cascader,Mentions,Label,Form,Field,createFormField,DateRangePicker,TimeRangePicker,RangeSlider,TreeSelect,DataTable,AvatarGroup,Tag,List,Tree,Descriptions,Statistic,Calendar,Carousel,Empty,Image,Timeline,HoverCard,AlertDialog,Sheet,notification,resetNotifications,message,resetMessages,Result,Popconfirm,Command,FloatButton,Tour,Watermark,MaskedInput,Banner,CodeBlock,SortableList,DateTimePicker,VisuallyHidden}})();const _m5=(function(){const{css}=_m1;const{tags}=_m3;const{Button}=_m16;const{section,div,img,h1,p,span,a}=tags;function HeroSection(){return section({class:`ds-mesh ${css('_flex _col _aic _jcc _minhscreen _relative _ohidden')}`,id:'hero'},
div({class:'ds-orb ds-pulse',style:'width:500px;height:500px;background:rgba(101,0,198,0.12);top:-10%;left:-10%'}),
div({class:'ds-orb ds-pulse',style:'width:400px;height:400px;background:rgba(10,243,235,0.08);bottom:-5%;right:-5%;animation-delay:1.5s'}),
div({class:'ds-orb ds-pulse',style:'width:300px;height:300px;background:rgba(254,68,116,0.06);top:60%;left:50%;animation-delay:3s'}),
div({class:css('_flex _row _aic _gap12 _relative _z10 _wrap _jcc'),style:'max-width:1100px;width:100%;padding:0 2rem'},
div({class:`ds-float ${css('_flex _aic _jcc _shrink0')}`,style:'flex-basis:300px'},
img({src:'./images/logo.svg',
alt:'decantr logo',
style:'width:280px;height:auto;filter:drop-shadow(0 0 40px rgba(101,0,198,0.3))',}),
),
div({class:css('_flex _col _gap6')},
h1({style:'font-size:clamp(3rem,7vw,5.5rem);font-weight:900;letter-spacing:-0.04em;line-height:1'},
span('decantr'),
span({class:'ds-pink'},'.'),
span('a'),
span({class:'ds-pink',style:'position:relative'},
'i',
),
),
p({class:css('_textxl _lhrelaxed'),style:'color:var(--d-muted-fg);max-width:500px'},
'The last UI framework you\'ll ever install. ',
span({class:'ds-gradient-text',style:'font-weight:700'},'AI-first. Zero dependencies. No React. No Angular. No Vue. No Tailwind. No TypeScript. No third parties. Just pure, unadulterated power...'),
),
div({class:css('_flex _row _gap4 _mt2')},
a({href:'#power',style:'text-decoration:none'},
Button({variant:'primary',size:'lg',class:'ds-glow'},'Explore the Power'),
),
a({href:'https://github.com/decantr-ai/decantr',target:'_blank',rel:'noopener',style:'text-decoration:none'},
Button({variant:'outline',size:'lg'},'GitHub'),
),
),
),
),
div({class:css('_absolute _bottom0 _flex _col _aic _pb6'),style:'left:50%;transform:translateX(-50%)'},
div({style:'width:1px;height:40px;background:linear-gradient(to bottom,transparent,var(--d-muted));animation:ds-pulse 2s infinite'}),
),
)}
return{HeroSection}})();const _m6=(function(){const{css}=_m1;const{tags}=_m3;const{icon}=_m16;const{section,div,h2,h3,p,span}=tags;function StatCard({value,label,iconName,delay}){return div({class:`ds-glass ds-animate ds-delay-${delay} ${css('_flex _col _aic _p6 _gap3')}`},
div({style:'color:var(--d-accent)'},icon(iconName,{size:'28px'})),
span({class:'ds-stat ds-gradient-text'},value),
p({class:css('_textsm'),style:'color:var(--d-muted-fg);font-weight:500'},label),
)}
function ClaimCard({title,description,delay}){return div({class:`ds-glass ds-animate ds-delay-${delay} ${css('_flex _col _gap3 _p6')}`},
h3({class:css('_textlg _fwheading'),style:'color:var(--d-fg)'},title),
p({class:css('_textbase _lhrelaxed'),style:'color:var(--d-muted-fg)'},description),
)}
function PowerSection(){return section({class:`ds-section ds-reveal ${css('_flex _col _aic')}`,id:'power'},
div({class:'ds-orb',style:'width:600px;height:600px;background:rgba(101,0,198,0.08);top:0;right:-20%'}),
div({class:css('_flex _col _aic _gap12 _relative _z10'),style:'max-width:1100px;width:100%'},
div({class:css('_flex _col _aic _gap4 _tc')},
h2({class:'ds-gradient-text ds-animate',style:'font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.03em;line-height:1.1'},
'The Most Powerful UI Framework',
),
p({class:`ds-animate ds-delay-1 ${css('_textlg _lhrelaxed')}`,style:'color:var(--d-muted-fg);max-width:700px'},
'No React. No Angular. No Vue. No Tailwind. No third parties. ',
span({style:'color:var(--d-fg);font-weight:600'},'Just pure, unadulterated power.'),
),
),
div({class:css('_grid _gcaf220 _gap4'),style:'width:100%'},
StatCard({value:'97+',label:'Components',iconName:'layers',delay:2}),
StatCard({value:'170+',label:'Design Tokens',iconName:'tool',delay:3}),
StatCard({value:'25+',label:'Chart Types',iconName:'bar-chart',delay:4}),
StatCard({value:'0',label:'Dependencies',iconName:'package',delay:5}),
),
div({class:css('_grid _gcaf300 _gap4'),style:'width:100%'},
ClaimCard({title:'Real DOM. Real Performance.',
description:'No virtual DOM. No diffing. No reconciliation overhead. Direct DOM manipulation with surgical signal updates. The browser was already fast — we just stopped getting in its way.',
delay:3,}),
ClaimCard({title:'No Build Required.',
description:'Native ES modules. Import and ship. No webpack. No Vite config. No bundler wars. Your framework should work the moment you write it, not after 47 plugins agree to cooperate.',
delay:4,}),
ClaimCard({title:'Runtime CSS Engine.',
description:'1000+ atomic utilities generated on demand. Zero bytes shipped unused. No purging. No config files. No Tailwind breakpoint debates at 2am. Just css(\'_flex _gap4 _p6\') and move on.',
delay:5,}),
),
),
)}
return{PowerSection}})();const _m7=(function(){const{css}=_m1;const{tags}=_m3;const{icon,Chip}=_m16;const{section,div,h2,h3,p,span,code}=tags;function FeatureCard({iconName,badge,title,description,highlights,delay}){return div({class:`ds-glass ds-animate ds-delay-${delay} ${css('_flex _col _gap4 _p8')}`},
div({class:css('_flex _row _aic _gap3')},
div({style:'color:var(--d-accent);background:rgba(10,243,235,0.1);padding:0.75rem;border-radius:var(--d-radius-lg);display:inline-flex'},
icon(iconName,{size:'24px'}),
),
Chip({label:badge,variant:'outline',size:'sm'}),
),
h3({class:css('_textxl _fwheading'),style:'color:var(--d-fg)'},title),
p({class:css('_textbase _lhrelaxed'),style:'color:var(--d-muted-fg)'},description),
div({class:css('_flex _row _wrap _gap2')},
...highlights.map(h=>
span({class:css('_textsm'),style:'color:var(--d-accent);background:rgba(10,243,235,0.08);padding:0.25rem 0.75rem;border-radius:var(--d-radius-full);border:1px solid rgba(10,243,235,0.15)'},h)
),
),
)}
function FeaturesSection(){return section({class:`ds-section ds-reveal ${css('_flex _col _aic')}`},
div({class:'ds-orb',style:'width:500px;height:500px;background:rgba(254,68,116,0.06);bottom:10%;left:-15%'}),
div({class:css('_flex _col _aic _gap12 _relative _z10'),style:'max-width:1100px;width:100%'},
div({class:css('_flex _col _aic _gap4 _tc')},
h2({class:'ds-gradient-text ds-animate',style:'font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.03em;line-height:1.1'},
'Built Different',
),
p({class:`ds-animate ds-delay-1 ${css('_textlg _lhrelaxed')}`,style:'color:var(--d-muted-fg);max-width:650px'},
'Every piece of decantr was designed from scratch. No borrowed ideas. No inherited baggage. Just ',
span({style:'color:var(--d-fg);font-weight:600'},'solutions that didn\'t exist before.'),
),
),
div({class:css('_grid _gcaf320 _gap6'),style:'width:100%'},
FeatureCard({iconName:'pie-chart',
badge:'Visualization',
title:'25 Chart Types. One API.',
description:'From sparklines to Sankey diagrams. SVG, Canvas, and WebGPU renderers. Every chart is responsive, animated, and theme-aware out of the box. Your dashboards just got dangerous.',
highlights:['SVG','Canvas','WebGPU','Animated','Theme-Aware'],
delay:2,}),
FeatureCard({iconName:'star',
badge:'Iconography',
title:'150+ Icons. Zero Weight.',
description:'Stroke-based SVG icons rendered inline. No icon fonts. No sprite sheets. No external requests. Tree-shaken automatically — you only ship what you use. Every icon respects your theme colors.',
highlights:['Stroke SVGs','Tree-Shaken','Theme Colors','Inline'],
delay:3,}),
FeatureCard({iconName:'zap',
badge:'Styling',
title:'1000+ Atoms. Runtime Generated.',
description:'Underscore-prefixed atomic utilities that never collide with anything. No config files. No PostCSS plugins. No purge step. They exist when you need them and vanish when you don\'t.',
highlights:['Zero Config','No Conflicts','On-Demand','Composable'],
delay:4,}),
FeatureCard({iconName:'cpu',
badge:'Design System',
title:'10 Seeds. 170+ Tokens.',
description:'Define 10 colors and a personality. The derivation engine algorithmically expands them into 170+ design tokens — surfaces, elevations, gradients, focus rings, chart palettes. WCAG AA contrast guaranteed. Mathematically.',
highlights:['Algorithmic','WCAG AA','Auto-Derived','Multi-Mode'],
delay:5,}),
),
div({class:`ds-glass-strong ds-animate ds-delay-6 ${css('_flex _col _aic _tc _gap4 _p8')}`,style:'width:100%'},
div({class:css('_flex _row _gap4 _aic')},
icon('shield',{size:'24px',style:'color:var(--d-success)'}),
h3({class:css('_textlg _fwheading'),style:'color:var(--d-fg)'},'Enterprise-Grade. Day One.'),
),
p({class:css('_textbase _lhrelaxed'),style:'color:var(--d-muted-fg);max-width:700px'},
'Form validation. Data tables with virtual scroll. Route guards. Error boundaries. Suspense. Context injection. TypeScript declarations. ',
span({style:'color:var(--d-fg);font-weight:600'},'Everything you need to ship production apps, without reaching for a single third-party package.'),
),
),
),
)}
return{FeaturesSection}})();const _m8=(function(){const{css}=_m1;const{tags}=_m3;const{section,div,h2,p,span,blockquote}=tags;const quotes=[
'Zero entries in package.json dependencies. By design.',
'What happens when you strip a framework down to pure intent? You get this.',
'Built from scratch. Built for AI. Built to make you wonder why you ever needed anything else.',
'The enterprise UI framework that ships with everything and depends on nothing.',
'97 components. 170 design tokens. 25 chart types. Zero dependencies. One framework to end the debate.',
'Engineered for the AI era. No compromises. No dependencies. No competition.',
'One framework. Zero dependencies. Infinite possibilities.',
'The framework that ships everything and imports nothing.',
'Everything you need. Nothing you don\'t. Built for what comes next.',
];function QuoteCard({text,delay}){return blockquote({class:`ds-glass ds-animate ds-delay-${delay} ${css('_flex _col _jcc _p8 _relative _ohidden')}`,style:'min-height:140px'},
span({style:'position:absolute;top:-0.25rem;left:1rem;font-size:5rem;line-height:1;font-weight:900;background:linear-gradient(135deg,var(--d-primary),var(--d-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;opacity:0.3;pointer-events:none'},'\u201C'),
p({style:'font-size:clamp(1.05rem,2.2vw,1.3rem);font-weight:700;line-height:1.4;letter-spacing:-0.01em;position:relative;z-index:1;padding-top:1.5rem;color:rgba(255,255,255,0.92);background:linear-gradient(135deg,rgba(255,255,255,0.95) 60%,var(--d-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text'},
text,
),
)}
function QuotesSection(){return section({class:`ds-section ds-reveal ${css('_flex _col _aic')}`},
div({class:'ds-orb',style:'width:400px;height:400px;background:rgba(253,163,3,0.06);top:30%;right:-10%'}),
div({class:css('_flex _col _aic _gap12 _relative _z10'),style:'max-width:1100px;width:100%'},
div({class:css('_flex _col _aic _gap4 _tc')},
h2({class:'ds-gradient-text ds-animate',style:'font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.03em;line-height:1.1'},
'We Couldn\'t Pick Just One',
),
p({class:`ds-animate ds-delay-1 ${css('_textlg _lhrelaxed')}`,style:'color:var(--d-muted-fg);max-width:600px'},
'Our marketing team quit, so we asked the AI to write taglines. It got a little ',
span({style:'color:var(--d-fg);font-weight:600'},'carried away.'),
' We kept them all.',
),
),
div({class:css('_grid _gcaf300 _gap4'),style:'width:100%'},
...quotes.map((text,i)=>QuoteCard({text,delay:(i%5)+2})),
),
),
)}
return{QuotesSection}})();const _m118=(function(){let injected=false;const BASE_CSS=[
'.d-chart{position:relative;width:100%;overflow:visible}',
'.d-chart-inner{position:relative}',
'.d-chart-svg{display:block;width:100%;overflow:visible}',
'.d-chart-title{font-size:var(--d-text-lg);font-weight:var(--d-fw-title);line-height:var(--d-lh-snug);color:var(--d-fg);margin:0 0 var(--d-sp-3) 0}',
'.d-chart-axis text{font-size:var(--d-text-xs);fill:var(--d-muted);font-family:var(--d-font)}',
'.d-chart-axis line,.d-chart-axis path{stroke:var(--d-border);fill:none;shape-rendering:crispEdges}',
'.d-chart-axis-label{font-size:var(--d-text-sm);fill:var(--d-muted);font-family:var(--d-font)}',
'.d-chart-grid line{stroke:var(--d-border);stroke-opacity:0.5;shape-rendering:crispEdges}',
'.d-chart-line{fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
'.d-chart-area{opacity:0.15}',
'.d-chart-bar{shape-rendering:crispEdges}',
'.d-chart-point{cursor:pointer}',
'.d-chart-point:focus{outline:2px solid var(--d-primary);outline-offset:2px}',
'.d-chart-slice{cursor:pointer;transition:opacity 0.15s}',
'.d-chart-slice:hover{opacity:0.85}',
'.d-chart-legend{display:flex;flex-wrap:wrap;gap:var(--d-sp-3);padding:var(--d-sp-3) 0 0;font-size:var(--d-text-sm);color:var(--d-fg)}',
'.d-chart-legend-item{display:inline-flex;align-items:center;gap:var(--d-sp-1-5);cursor:pointer;user-select:none}',
'.d-chart-legend-swatch{width:12px;height:12px;border-radius:2px;flex-shrink:0}',
'.d-chart-legend-disabled{opacity:0.35}',
'.d-chart-tooltip{position:absolute;z-index:1002;pointer-events:none;padding:var(--d-sp-2) var(--d-sp-3);font-size:var(--d-text-sm);line-height:var(--d-lh-normal);white-space:nowrap;border-radius:var(--d-radius);background:var(--d-chart-tooltip-bg,var(--d-surface-1));color:var(--d-fg);border:1px solid var(--d-border);box-shadow:0 2px 8px rgba(0,0,0,0.12);opacity:0;transition:opacity 0.12s}',
'.d-chart-tooltip-visible{opacity:1}',
'.d-chart-tooltip-label{font-weight:var(--d-fw-title);margin-bottom:var(--d-sp-1)}',
'.d-chart-tooltip-row{display:flex;align-items:center;gap:var(--d-sp-2)}',
'.d-chart-tooltip-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}',
'.d-chart-table{width:100%;border-collapse:collapse;font-size:var(--d-text-sm);margin-top:var(--d-sp-2)}',
'.d-chart-table th{text-align:left;font-weight:600;padding:var(--d-sp-2);border-bottom:2px solid var(--d-border)}',
'.d-chart-table td{padding:var(--d-sp-2);border-bottom:1px solid var(--d-border)}',
'.d-chart-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}',
'.d-chart-spark{display:inline-block;vertical-align:middle}',
'.d-chart-spark svg{display:block}',
'.d-chart-annotation-line{stroke-dasharray:4,3}',
'.d-chart-annotation-label{font-size:var(--d-text-xs);fill:var(--d-muted);font-family:var(--d-font)}',
'.d-chart-annotation-band{opacity:0.08}',
'.d-chart-crosshair{pointer-events:none}',
'.d-chart-brush{fill:var(--d-chart-selection,var(--d-primary-subtle));stroke:var(--d-primary-border);pointer-events:none}',
'.d-chart-grid line{stroke:var(--d-chart-grid,var(--d-border));stroke-opacity:0.5;shape-rendering:crispEdges}',
'.d-chart-tick{stroke:var(--d-border);shape-rendering:crispEdges}',
'.d-chart text{font-family:var(--d-font)}',
'@media(prefers-reduced-motion:reduce){.d-chart-line,.d-chart-area,.d-chart-bar,.d-chart-slice,.d-chart-point,.d-chart-tooltip{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}}'
].join('');function injectChartBase(){if(injected)return;if(typeof document==='undefined')return;injected=true;let el=document.querySelector('[data-decantr-chart]');if(!el){el=document.createElement('style');el.setAttribute('data-decantr-chart','');document.head.appendChild(el)}
el.textContent=`@layer d.base{${BASE_CSS}}`}
return{injectChartBase}})();const _m119=(function(){const{createEffect}=_m14;const{getTheme}=_m13;function resolve(prop){return typeof prop==='function'?prop():prop}
function scaleLinear(domain,range){const[d0,d1]=domain;const[r0,r1]=range;const span=d1-d0||1;const rSpan=r1-r0;function scale(v){return r0+((v-d0)/span)*rSpan}
scale.invert=function(px){return d0+((px-r0)/rSpan)*span};scale.ticks=function(count=5){const step=niceStep(span/count);const start=Math.ceil(d0/step)*step;const result=[];for(let v=start;v<=d1;v+=step){result.push(+v.toPrecision(12))}
return result};return scale}
function scaleBand(domain,range,padding=0.2){const[r0,r1]=range;const n=domain.length||1;const totalPad=padding*(n+1);const bandWidth=(r1-r0)/(n+totalPad);const step=bandWidth*(1+padding);const offset=bandWidth*padding;const map=new Map();for(let i=0;i<domain.length;i++){map.set(domain[i],r0+offset+i*step)}
function scale(v){return map.get(v)??r0}
scale.bandwidth=function(){return bandWidth};return scale}
function scaleTime(domain,range){const d0=+domain[0];const d1=+domain[1];const inner=scaleLinear([d0,d1],range);function scale(v){return inner(+v)}
scale.invert=function(px){return new Date(inner.invert(px))};scale.ticks=function(count=5){return inner.ticks(count).map(t=>new Date(t))};return scale}
function niceStep(rawStep){const mag=Math.pow(10,Math.floor(Math.log10(rawStep)));const norm=rawStep/mag;let nice;if(norm<=1.5)nice=1; else if(norm<=3)nice=2; else if(norm<=7)nice=5; else nice=10;return nice*mag}
function extent(data,field){let min=Infinity,max=-Infinity;for(let i=0;i<data.length;i++){const v=+data[i][field];if(v<min)min=v;if(v>max)max=v}
return[min,max]}
function unique(data,field){const seen=new Set();const result=[];for(let i=0;i<data.length;i++){const v=data[i][field];if(!seen.has(v)){seen.add(v);result.push(v)}}
return result}
function groupBy(data,field){const groups=new Map();for(let i=0;i<data.length;i++){const key=data[i][field];if(!groups.has(key))groups.set(key,[]);groups.get(key).push(data[i])}
return groups}
function downsampleLTTB(data,xField,yField,targetCount){if(data.length<=targetCount)return data;const result=[data[0]];const bucketSize=(data.length-2)/(targetCount-2);let prevIndex=0;for(let i=1;i<targetCount-1;i++){const bucketStart=Math.floor((i-1)*bucketSize)+1;const bucketEnd=Math.min(Math.floor(i*bucketSize)+1,data.length-1);const nextBucketStart=Math.min(Math.floor(i*bucketSize)+1,data.length-1);const nextBucketEnd=Math.min(Math.floor((i+1)*bucketSize)+1,data.length-1);let avgX=0,avgY=0,count=0;for(let j=nextBucketStart;j<=nextBucketEnd;j++){avgX+=+data[j][xField];avgY+=+data[j][yField];count++}
avgX/=count;avgY/=count;let maxArea=-1;let maxIndex=bucketStart;const px=+data[prevIndex][xField];const py=+data[prevIndex][yField];for(let j=bucketStart;j<=bucketEnd;j++){const area=Math.abs(
(px-avgX)*(+data[j][yField]-py)-
(px-+data[j][xField])*(avgY-py)
);if(area>maxArea){maxArea=area;maxIndex=j}}
result.push(data[maxIndex]);prevIndex=maxIndex}
result.push(data[data.length-1]);return result}
function padExtent(ext,fraction=0.05){const span=ext[1]-ext[0]||1;const pad=span*fraction;return[ext[0]-pad,ext[1]+pad]}
function isDateLike(values){if(!values.length)return false;const v=values[0];if(v instanceof Date)return true;if(typeof v==='string'&&!isNaN(Date.parse(v)))return true;return false}
function toDate(v){return v instanceof Date?v:new Date(v)}
return{resolve,scaleLinear,scaleBand,scaleTime,extent,unique,groupBy,downsampleLTTB,padExtent,isDateLike,toDate}})();const _m152=(function(){function scene(width,height,children,meta){return{type:'scene',width,height,children:children||[],meta:meta||{}}}
function group(attrs,children){return{type:'group',...attrs,children:children||[]}}
function path(attrs){return{type:'path',...attrs}}
function rect(attrs){return{type:'rect',...attrs}}
function circle(attrs){return{type:'circle',...attrs}}
function text(attrs){return{type:'text',...attrs}}
function line(attrs){return{type:'line',...attrs}}
function arc(attrs){return{type:'arc',...attrs}}
function polygon(attrs){return{type:'polygon',...attrs}}
function image(attrs){return{type:'image',...attrs}}
function axisTicks(ticks,axis,innerW,innerH){const nodes=[];if(axis==='x'){for(const t of ticks){nodes.push(line({x1:t.position,y1:innerH,x2:t.position,y2:innerH+4,stroke:'var(--d-border)',class:'d-chart-tick'}));nodes.push(text({x:t.position,y:innerH+18,content:t.label,anchor:'middle',class:'d-chart-axis'}))}}else{for(const t of ticks){nodes.push(line({x1:-4,y1:t.position,x2:0,y2:t.position,stroke:'var(--d-border)',class:'d-chart-tick'}));nodes.push(text({x:-8,y:t.position+4,content:t.label,anchor:'end',class:'d-chart-axis'}))}}
return nodes}
function gridLines(ticks,innerW){return ticks.map(t=>line({x1:0,y1:t.position,x2:innerW,y2:t.position,class:'d-chart-grid'}))}
function arcToPath(cx,cy,outerR,innerR,startAngle,endAngle){const x1=cx+outerR*Math.cos(startAngle);const y1=cy+outerR*Math.sin(startAngle);const x2=cx+outerR*Math.cos(endAngle);const y2=cy+outerR*Math.sin(endAngle);const largeArc=endAngle-startAngle>Math.PI?1:0;let d=`M${x1},${y1}A${outerR},${outerR},0,${largeArc},1,${x2},${y2}`;if(innerR>0){const x3=cx+innerR*Math.cos(endAngle);const y3=cy+innerR*Math.sin(endAngle);const x4=cx+innerR*Math.cos(startAngle);const y4=cy+innerR*Math.sin(startAngle);d+=`L${x3},${y3}A${innerR},${innerR},0,${largeArc},0,${x4},${y4}Z`}else{d+=`L${cx},${cy}Z`}
return d}
function pointsToPathD(points){if(!points.length)return'';let d=`M${points[0].x},${points[0].y}`;for(let i=1;i<points.length;i++)d+=`L${points[i].x},${points[i].y}`;return d}
function smoothPathD(points,tension=0.5){if(points.length<2)return pointsToPathD(points);if(points.length===2)return pointsToPathD(points);let d=`M${points[0].x},${points[0].y}`;for(let i=0;i<points.length-1;i++){const p0=points[Math.max(0,i-1)];const p1=points[i];const p2=points[i+1];const p3=points[Math.min(points.length-1,i+2)];const cp1x=p1.x+(p2.x-p0.x)/6*tension;const cp1y=p1.y+(p2.y-p0.y)/6*tension;const cp2x=p2.x-(p3.x-p1.x)/6*tension;const cp2y=p2.y-(p3.y-p1.y)/6*tension;d+=`C${cp1x},${cp1y},${cp2x},${cp2y},${p2.x},${p2.y}`}
return d}
function areaPathD(points){if(!points.length)return'';let d=`M${points[0].x},${points[0].y0}`;for(let i=1;i<points.length;i++)d+=`L${points[i].x},${points[i].y0}`;for(let i=points.length-1;i>=0;i--)d+=`L${points[i].x},${points[i].y1}`;d+='Z';return d}
function stepPathD(points){if(points.length<2)return pointsToPathD(points);let d=`M${points[0].x},${points[0].y}`;for(let i=1;i<points.length;i++){d+=`H${points[i].x}V${points[i].y}`}
return d}
return{scene,group,path,rect,circle,text,line,arc,polygon,image,axisTicks,gridLines,arcToPath,pointsToPathD,smoothPathD,areaPathD,stepPathD}})();const _m150=(function(){const{arcToPath}=_m152;const SVG_NS='http://www.w3.org/2000/svg';function svgEl(tag,attrs,...children){const el=document.createElementNS(SVG_NS,tag);if(attrs){for(const[k,v]of Object.entries(attrs)){if(v!==undefined&&v!==null&&v!==false)el.setAttribute(k,String(v))}}
for(const c of children){if(typeof c==='string')el.appendChild(document.createTextNode(c)); else if(c)el.appendChild(c)}
return el}
function renderSVG(sceneNode){if(!sceneNode||sceneNode.type!=='scene'){return svgEl('svg',{width:100,height:100})}
const{width,height,children}=sceneNode;const root=svgEl('svg',{class:'d-chart-svg',
viewBox:`0 0 ${width} ${height}`,
width,height});for(const child of children){const el=renderNode(child);if(el)root.appendChild(el)}
return root}
function renderNode(node){if(!node)return null;switch(node.type){case'group':return renderGroup(node);case'path':return renderPath(node);case'rect':return renderRect(node);case'circle':return renderCircle(node);case'text':return renderText(node);case'line':return renderLine(node);case'arc':return renderArc(node);case'polygon':return renderPolygon(node);case'image':return renderImage(node);default:return null}}
function renderGroup(node){const attrs={};if(node.transform)attrs.transform=node.transform;if(node.class)attrs.class=node.class;if(node.clip)attrs['clip-path']=node.clip;if(node.opacity!=null)attrs.opacity=node.opacity;const g=svgEl('g',attrs);if(node.children){for(const child of node.children){const el=renderNode(child);if(el)g.appendChild(el)}}
return g}
function renderPath(node){const attrs={d:node.d};if(node.fill)attrs.fill=node.fill;else attrs.fill='none';if(node.stroke)attrs.stroke=node.stroke;if(node.strokeWidth)attrs['stroke-width']=node.strokeWidth;if(node.strokeDash)attrs['stroke-dasharray']=node.strokeDash;if(node.strokeLinecap)attrs['stroke-linecap']=node.strokeLinecap;if(node.strokeLinejoin)attrs['stroke-linejoin']=node.strokeLinejoin;if(node.class)attrs.class=node.class;if(node.opacity!=null)attrs.opacity=node.opacity;applyData(attrs,node);return svgEl('path',attrs)}
function renderRect(node){if(isNaN(node.x)||isNaN(node.y))return null;const attrs={x:node.x,y:node.y,
width:Math.max(0,node.w||0),
height:Math.max(0,node.h||0)};if(node.rx)attrs.rx=node.rx;if(node.ry)attrs.ry=node.ry;if(node.fill)attrs.fill=node.fill;if(node.stroke)attrs.stroke=node.stroke;if(node.strokeWidth)attrs['stroke-width']=node.strokeWidth;if(node.class)attrs.class=node.class;if(node.opacity!=null)attrs.opacity=node.opacity;applyData(attrs,node);return svgEl('rect',attrs)}
function renderCircle(node){const attrs={cx:node.cx,cy:node.cy,r:node.r};if(node.fill)attrs.fill=node.fill;if(node.stroke)attrs.stroke=node.stroke;if(node.strokeWidth)attrs['stroke-width']=node.strokeWidth;if(node.class)attrs.class=node.class;if(node.opacity!=null)attrs.opacity=node.opacity;applyData(attrs,node);return svgEl('circle',attrs)}
function renderText(node){if(isNaN(node.x)||isNaN(node.y))return null;const attrs={x:node.x,y:node.y};if(node.anchor)attrs['text-anchor']=node.anchor;if(node.baseline)attrs['dominant-baseline']=node.baseline;if(node.fill)attrs.fill=node.fill;if(node.class)attrs.class=node.class;if(node.fontSize)attrs['font-size']=node.fontSize;if(node.fontWeight)attrs['font-weight']=node.fontWeight;if(node.rotate)attrs.transform=`rotate(${node.rotate},${node.x},${node.y})`;return svgEl('text',attrs,node.content||'')}
function renderLine(node){const attrs={x1:node.x1,y1:node.y1,
x2:node.x2,y2:node.y2};if(node.stroke)attrs.stroke=node.stroke;if(node.strokeWidth)attrs['stroke-width']=node.strokeWidth;if(node.strokeDash)attrs['stroke-dasharray']=node.strokeDash;if(node.class)attrs.class=node.class;return svgEl('line',attrs)}
function renderArc(node){const d=arcToPath(node.cx,node.cy,node.outerR,node.innerR||0,node.startAngle,node.endAngle);const attrs={d};if(node.fill)attrs.fill=node.fill;if(node.stroke)attrs.stroke=node.stroke;if(node.class)attrs.class=node.class;if(node.opacity!=null)attrs.opacity=node.opacity;applyData(attrs,node);if(node.data){if(node.data.label)attrs['aria-label']=node.data.ariaLabel||`${node.data.label}: ${node.data.value}`;attrs.tabindex='0';attrs.role='listitem'}
return svgEl('path',attrs)}
function renderPolygon(node){if(!node.points||!node.points.length)return null;const pointsStr=node.points.map(p=>`${p.x},${p.y}`).join(' ');const attrs={points:pointsStr};if(node.fill)attrs.fill=node.fill;if(node.stroke)attrs.stroke=node.stroke;if(node.strokeWidth)attrs['stroke-width']=node.strokeWidth;if(node.class)attrs.class=node.class;if(node.opacity!=null)attrs.opacity=node.opacity;applyData(attrs,node);return svgEl('polygon',attrs)}
function renderImage(node){const attrs={x:node.x,y:node.y,
width:node.w,height:node.h,
href:node.href};if(node.class)attrs.class=node.class;return svgEl('image',attrs)}
function applyData(attrs,node){if(node.data){if(node.data.series)attrs['data-series']=node.data.series;if(node.data.label)attrs['data-label']=node.data.label;if(node.data.value!=null)attrs['data-value']=node.data.value}
if(node.key)attrs['data-key']=node.key}
return{renderSVG}})();const _m151=(function(){const{arcToPath}=_m152;function renderCanvas(sceneNode){if(!sceneNode||sceneNode.type!=='scene'){const c=document.createElement('canvas');c.width=100;c.height=100;return c}
const{width,height,children}=sceneNode;const dpr=typeof window!=='undefined'?window.devicePixelRatio||1:1;const canvas=document.createElement('canvas');canvas.width=width*dpr;canvas.height=height*dpr;canvas.style.width=width+'px';canvas.style.height=height+'px';canvas.className='d-chart-svg';const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);const colorCache=new Map();const resolveColor=(color)=>{if(!color||color==='none')return null;if(color.startsWith('var(')){if(colorCache.has(color))return colorCache.get(color);const prop=color.match(/var\((--[^,)]+)/)?.[1];if(prop&&typeof getComputedStyle==='function'){const resolved=getComputedStyle(document.documentElement).getPropertyValue(prop).trim();if(resolved){colorCache.set(color,resolved);return resolved}}
const fallback=color.match(/,\s*([^)]+)\)/)?.[1];return fallback||'#666'}
return color};for(const child of children){renderNode(ctx,child,resolveColor)}
return canvas}
function renderNode(ctx,node,resolveColor){if(!node)return;ctx.save();if(node.opacity!=null)ctx.globalAlpha=node.opacity;switch(node.type){case'group':renderGroup(ctx,node,resolveColor);break;case'path':renderPath(ctx,node,resolveColor);break;case'rect':renderRect(ctx,node,resolveColor);break;case'circle':renderCircle(ctx,node,resolveColor);break;case'text':renderText(ctx,node,resolveColor);break;case'line':renderLine(ctx,node,resolveColor);break;case'arc':renderArc(ctx,node,resolveColor);break;case'polygon':renderPolygon(ctx,node,resolveColor);break}
ctx.restore()}
function renderGroup(ctx,node,resolveColor){if(node.transform){const match=node.transform.match(/translate\(([^,]+),([^)]+)\)/);if(match)ctx.translate(+match[1],+match[2])}
if(node.children){for(const child of node.children)renderNode(ctx,child,resolveColor)}}
function renderPath(ctx,node,resolveColor){if(!node.d)return;const p=new Path2D(node.d);const fill=resolveColor(node.fill);const stroke=resolveColor(node.stroke);if(fill){ctx.fillStyle=fill;ctx.fill(p)}
if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=node.strokeWidth||1;if(node.strokeLinecap)ctx.lineCap=node.strokeLinecap;if(node.strokeLinejoin)ctx.lineJoin=node.strokeLinejoin;if(node.strokeDash)ctx.setLineDash(node.strokeDash.split(',').map(Number));ctx.stroke(p);ctx.setLineDash([])}}
function renderRect(ctx,node,resolveColor){const{x,y,w,h,rx}=node;const fill=resolveColor(node.fill);const stroke=resolveColor(node.stroke);if(rx&&rx>0){const r=Math.min(rx,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}
if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=node.strokeWidth||1;ctx.stroke()}}else{if(fill){ctx.fillStyle=fill;ctx.fillRect(x,y,Math.max(0,w),Math.max(0,h))}
if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=node.strokeWidth||1;ctx.strokeRect(x,y,Math.max(0,w),Math.max(0,h))}}}
function renderCircle(ctx,node,resolveColor){ctx.beginPath();ctx.arc(node.cx,node.cy,node.r,0,Math.PI*2);const fill=resolveColor(node.fill);const stroke=resolveColor(node.stroke);if(fill){ctx.fillStyle=fill;ctx.fill()}
if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=node.strokeWidth||1;ctx.stroke()}}
function renderText(ctx,node,resolveColor){const fill=resolveColor(node.fill)||resolveColor('var(--d-muted)')||'#666';ctx.fillStyle=fill;ctx.font=`${node.fontWeight || ''} ${node.fontSize || '10px'} ${getComputedStyle(document.documentElement).getPropertyValue('--d-font').trim() || 'sans-serif'}`.trim();ctx.textAlign=node.anchor==='middle'?'center':(node.anchor==='end'?'right':'left');ctx.textBaseline=node.baseline==='middle'?'middle':'alphabetic';ctx.fillText(node.content||'',node.x,node.y)}
function renderLine(ctx,node,resolveColor){const stroke=resolveColor(node.stroke)||resolveColor('var(--d-border)')||'#ccc';ctx.beginPath();ctx.moveTo(node.x1,node.y1);ctx.lineTo(node.x2,node.y2);ctx.strokeStyle=stroke;ctx.lineWidth=node.strokeWidth||1;if(node.strokeDash)ctx.setLineDash(node.strokeDash.split(',').map(Number));ctx.stroke();ctx.setLineDash([])}
function renderArc(ctx,node,resolveColor){const d=arcToPath(node.cx,node.cy,node.outerR,node.innerR||0,node.startAngle,node.endAngle);const p=new Path2D(d);const fill=resolveColor(node.fill);if(fill){ctx.fillStyle=fill;ctx.fill(p)}
if(node.stroke){ctx.strokeStyle=resolveColor(node.stroke);ctx.lineWidth=node.strokeWidth||1;ctx.stroke(p)}}
function renderPolygon(ctx,node,resolveColor){if(!node.points||!node.points.length)return;ctx.beginPath();ctx.moveTo(node.points[0].x,node.points[0].y);for(let i=1;i<node.points.length;i++)ctx.lineTo(node.points[i].x,node.points[i].y);ctx.closePath();const fill=resolveColor(node.fill);if(fill){ctx.fillStyle=fill;ctx.fill()}
if(node.stroke){ctx.strokeStyle=resolveColor(node.stroke);ctx.lineWidth=node.strokeWidth||1;ctx.stroke()}}
return{renderCanvas}})();const _m120=(function(){const{renderSVG}=_m150;const{renderCanvas}=_m151;const SVG_THRESHOLD=3000;const CANVAS_THRESHOLD=50000;function render(sceneGraph,spec){const renderer=spec.renderer||'auto';const dataLen=sceneGraph.meta?.dataLength||0;if(renderer==='svg'||(renderer==='auto'&&dataLen<SVG_THRESHOLD)){return renderSVG(sceneGraph)}
if(renderer==='canvas'||(renderer==='auto'&&dataLen<CANVAS_THRESHOLD)){return renderCanvas(sceneGraph)}
if(renderer==='webgpu'||(renderer==='auto'&&dataLen>=CANVAS_THRESHOLD)){if(renderWebGPU)return renderWebGPU(sceneGraph);return renderCanvas(sceneGraph)}
return renderSVG(sceneGraph)}
let renderWebGPU=null;function registerRenderer(type,renderFn){if(type==='webgpu')renderWebGPU=renderFn}
return{render,registerRenderer}})();const _m146=(function(){const{scaleLinear,scaleBand,scaleTime,extent,unique,padExtent,isDateLike,toDate}=_m119;const{scene,group,line,text,rect,gridLines,axisTicks}=_m152;const MARGINS={top:24,right:16,bottom:40,left:48};const MARGINS_NONE={top:0,right:0,bottom:0,left:0};const MARGINS_PIE={top:4,right:4,bottom:4,left:4};function innerDimensions(width,height,margins){return{innerW:Math.max(0,width-margins.left-margins.right),
innerH:Math.max(0,height-margins.top-margins.bottom),
margins}}
function buildXScale(data,xField,innerW){const values=data.map(d=>d[xField]);if(isDateLike(values)){const dates=values.map(toDate);const[min,max]=[Math.min(...dates),Math.max(...dates)];return{scale:scaleTime([new Date(min),new Date(max)],[0,innerW]),type:'time'}}
if(typeof values[0]==='number'){const ext=padExtent(extent(data,xField));return{scale:scaleLinear(ext,[0,innerW]),type:'linear'}}
const cats=unique(data,xField);return{scale:scaleBand(cats,[0,innerW]),type:'band'}}
function buildYScale(data,yFields,innerH,opts={}){const fields=Array.isArray(yFields)?yFields:[yFields];let min=opts.min!=null?opts.min:Infinity;let max=opts.max!=null?opts.max:-Infinity;if(min===Infinity||max===-Infinity){if(opts.stacked){for(let i=0;i<data.length;i++){let sum=0;for(const f of fields)sum+=+data[i][f]||0;if(sum>max)max=sum}
if(min===Infinity)min=0}else{for(const f of fields){const[lo,hi]=extent(data,f);if(lo<min)min=lo;if(hi>max)max=hi}}}
if(opts.padBottom!==false&&min>0)min=0;const ext=padExtent([min,max],0.05);if(ext[0]>0&&min===0)ext[0]=0;return scaleLinear(ext,[innerH,0])}
function formatNumber(v){if(Math.abs(v)>=1e9)return(v/1e9).toFixed(1)+'B';if(Math.abs(v)>=1e6)return(v/1e6).toFixed(1)+'M';if(Math.abs(v)>=1e3)return(v/1e3).toFixed(1)+'K';if(Number.isInteger(v))return String(v);return v.toFixed(1)}
function formatDate(d){if(!(d instanceof Date))d=new Date(d);return`${d.getMonth() + 1}/${d.getDate()}`}
function computeTicks(scale,type,count=5,format){if(type==='band')return[];const ticks=scale.ticks(count);return ticks.map(t=>({value:t,
position:scale(t),
label:format?format(t):(type==='time'?formatDate(t):formatNumber(t))}))}
function chartColor(index){return`var(--d-chart-${index % 8})`}
const PALETTE_SIZE=8;function buildXAxisNodes(xScale,xType,innerH,innerW,spec,layout){const nodes=[
line({x1:0,y1:innerH,x2:innerW,y2:innerH,stroke:'var(--d-border)',class:'d-chart-axis'})
];if(xType==='band'&&layout&&layout.categories){const bandW=xScale.bandwidth();for(const cat of layout.categories){const x=xScale(cat)+bandW/2;nodes.push(text({x,y:innerH+20,content:String(cat),anchor:'middle',class:'d-chart-axis'}))}}else if(xType!=='band'){const fmt=spec.xFormat||(xType==='time'?formatDate:formatNumber);const ticks=computeTicks(xScale,xType,6,fmt);for(const t of ticks){nodes.push(text({x:t.position,y:innerH+20,content:t.label,anchor:'middle',class:'d-chart-axis'}))}}
return nodes}
function buildYAxisNodes(yScale,innerH,spec){const fmt=spec.yFormat||formatNumber;const ticks=yScale.ticks(5);const nodes=[
line({x1:0,y1:0,x2:0,y2:innerH,stroke:'var(--d-border)',class:'d-chart-axis'})
];for(const t of ticks){const y=yScale(t);nodes.push(text({x:-8,y:y+4,content:fmt(t),anchor:'end',class:'d-chart-axis'}))}
return nodes}
function buildGridNodes(yScale,innerW){const ticks=yScale.ticks(5);return ticks.map(t=>line({x1:0,y1:yScale(t),x2:innerW,y2:yScale(t),
class:'d-chart-grid'}))}
return{innerDimensions,buildXScale,buildYScale,formatNumber,formatDate,computeTicks,chartColor,buildXAxisNodes,buildYAxisNodes,buildGridNodes,MARGINS,MARGINS_NONE,MARGINS_PIE,PALETTE_SIZE}})();const _m153=(function(){const{scene,group}=_m152;const{MARGINS,innerDimensions,buildXScale,buildYScale,buildXAxisNodes,buildYAxisNodes,buildGridNodes,chartColor}=_m146;const{scaleBand,scaleLinear,unique,extent,padExtent}=_m119;function cartesian(spec,width,height,opts={}){const data=Array.isArray(spec.data)?spec.data:[];const horizontal=!!spec.horizontal;const margins=opts.margins||{...MARGINS};if(horizontal)margins.left=Math.max(margins.left,72);if(spec.y2)margins.right=Math.max(margins.right,48);const{innerW,innerH}=innerDimensions(width,height,margins);const xField=spec.x;const yFields=Array.isArray(spec.y)?spec.y:[spec.y];let xScale,xType,yScale,y2Scale,categories;if(horizontal){categories=unique(data,xField);xScale=scaleBand(categories,[0,innerH],0.2);xType='band';yScale=buildYScale(data,yFields,innerW,{...opts.yOpts,padBottom:opts.yOpts?.padBottom});const yMin=0,yMax=extent(data,yFields[0])[1];yScale=scaleLinear(padExtent([yMin,yMax],0.05),[0,innerW]);if(yScale.ticks){}}else{if(opts.bandX){categories=unique(data,xField);xScale=scaleBand(categories,[0,innerW],0.2);xType='band'}else{const built=buildXScale(data,xField,innerW);xScale=built.scale;xType=built.type;if(xType==='band')categories=unique(data,xField)}
yScale=buildYScale(data,yFields,innerH,opts.yOpts||{stacked:!!spec.stacked});if(spec.y2){const y2Fields=Array.isArray(spec.y2)?spec.y2:[spec.y2];y2Scale=buildYScale(data,y2Fields,innerH,{padBottom:true})}}
let axisNodes=[];let gridNodes=[];if(!opts.skipAxes){if(horizontal){axisNodes.push(...buildHorizontalValueAxis(yScale,innerW,innerH,spec));axisNodes.push(...buildHorizontalCategoryAxis(xScale,categories,innerH));gridNodes=buildHorizontalGrid(yScale,innerH)}else{axisNodes.push(...buildXAxisNodes(xScale,xType,innerH,innerW,spec,{categories}));axisNodes.push(...buildYAxisNodes(yScale,innerH,spec));gridNodes=buildGridNodes(yScale,innerW)}}
return{width,height,innerW,innerH,margins,
xScale,yScale,xType,y2Scale,
categories,axisNodes,gridNodes,
horizontal,data,spec}}
const{line,text}=_m152;function buildHorizontalValueAxis(valueScale,innerW,innerH,spec){const nodes=[
line({x1:0,y1:innerH,x2:innerW,y2:innerH,stroke:'var(--d-border)',class:'d-chart-axis'})
];const ticks=valueScale.ticks(5);const fmt=spec.yFormat||(v=>{if(Math.abs(v)>=1e6)return(v/1e6).toFixed(1)+'M';if(Math.abs(v)>=1e3)return(v/1e3).toFixed(1)+'K';if(Number.isInteger(v))return String(v);return v.toFixed(1)});for(const t of ticks){const x=valueScale(t);nodes.push(text({x,y:innerH+20,content:fmt(t),anchor:'middle',class:'d-chart-axis'}))}
return nodes}
function buildHorizontalCategoryAxis(bandScale,categories,innerH){const nodes=[
line({x1:0,y1:0,x2:0,y2:innerH,stroke:'var(--d-border)',class:'d-chart-axis'})
];const bandW=bandScale.bandwidth();for(const cat of categories){const y=bandScale(cat)+bandW/2;nodes.push(text({x:-8,y:y+4,content:String(cat),anchor:'end',class:'d-chart-axis'}))}
return nodes}
function buildHorizontalGrid(valueScale,innerH){const ticks=valueScale.ticks(5);return ticks.map(t=>line({x1:valueScale(t),y1:0,x2:valueScale(t),y2:innerH,
class:'d-chart-grid'}))}
return{cartesian}})();const _m121=(function(){const{scene,group,path,circle,text}=_m152;const{pointsToPathD,smoothPathD,stepPathD}=_m152;const{cartesian}=_m153;const{chartColor}=_m146;const{resolve,groupBy,downsampleLTTB}=_m119;function layoutLine(spec,width,height){const data=resolve(spec.data);const coords=cartesian(spec,width,height);const{innerW,innerH,margins,xScale,yScale,xType,axisNodes,gridNodes}=coords;const fields=Array.isArray(spec.y)?spec.y:[spec.y];let series;if(spec.series){const groups=groupBy(data,spec.series);series=[...groups.entries()].map(([key,rows],i)=>{const sampled=rows.length>innerW*2?downsampleLTTB(rows,spec.x,fields[0],Math.round(innerW*2)):rows;return{key,color:chartColor(i),
points:mapPoints(sampled,spec,xScale,yScale,xType,fields[0])}})}else{series=fields.map((f,i)=>{const sampled=data.length>innerW*2?downsampleLTTB(data,spec.x,f,Math.round(innerW*2)):data;return{key:f,color:chartColor(i),
points:mapPoints(sampled,spec,xScale,yScale,xType,f)}})}
const children=[];if(spec.grid!==false)children.push(...gridNodes);children.push(...axisNodes);for(const s of series){if(s.points.length<2)continue;let d;if(spec.step)d=stepPathD(s.points); else if(spec.smooth)d=smoothPathD(s.points); else d=pointsToPathD(s.points);children.push(path({d,stroke:s.color,strokeWidth:2,
strokeLinecap:'round',strokeLinejoin:'round',
class:'d-chart-line',
data:{series:s.key},key:`line-${s.key}`}));if(spec.labels){for(const p of s.points){children.push(text({x:p.x,y:p.y-8,
content:String(p.raw[Array.isArray(spec.y)?s.key:spec.y]),
anchor:'middle',class:'d-chart-axis',fontSize:'var(--d-text-xs)'}))}}}
return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'line',series,xScale,yScale,xType,margins,innerW,innerH,dataLength:data.length})}
function mapPoints(data,spec,xScale,yScale,xType,field){return data.map(d=>{const xVal=xType==='band'?d[spec.x]:(xType==='time'?new Date(d[spec.x]):+d[spec.x]);const x=xScale(xVal)+(xType==='band'?xScale.bandwidth()/2:0);return{x,y:yScale(+d[field]),raw:d}})}
return{layoutLine}})();const _m122=(function(){const{scene,group,rect,text}=_m152;const{cartesian}=_m153;const{chartColor,buildYScale,MARGINS,innerDimensions}=_m146;const{resolve,unique,scaleBand}=_m119;function layoutBar(spec,width,height){const data=resolve(spec.data);const yFields=Array.isArray(spec.y)?spec.y:[spec.y];const horizontal=!!spec.horizontal;if(horizontal)return layoutHorizontalBar(spec,data,yFields,width,height);const categories=unique(data,spec.x);const margins={...MARGINS};const{innerW,innerH}=innerDimensions(width,height,margins);const xScale=scaleBand(categories,[0,innerW],0.2);const yScale=buildYScale(data,yFields,innerH,{stacked:!!spec.stacked});const bandW=xScale.bandwidth();const bars=buildBars(data,spec,categories,yFields,xScale,yScale,bandW);const coords=cartesian(spec,width,height,{bandX:true,yOpts:{stacked:!!spec.stacked}});const children=[];if(spec.grid!==false)children.push(...coords.gridNodes);children.push(...coords.axisNodes);for(const bar of bars){for(const seg of bar.segments){children.push(rect({x:seg.x,y:seg.y,w:Math.max(0,seg.width),h:Math.max(0,seg.height),
rx:Math.min(2,seg.width/4),fill:seg.color,
class:'d-chart-bar',
data:{series:seg.field,value:seg.value,label:bar.category},
key:`bar-${bar.category}-${seg.field}`}));if(spec.labels){children.push(text({x:seg.x+seg.width/2,y:seg.y-4,
content:String(seg.value),anchor:'middle',
class:'d-chart-axis',fontSize:'var(--d-text-xs)'}))}}}
const series=yFields.map((f,i)=>({key:f,color:chartColor(i)}));return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'bar',series,xScale,yScale,xType:'band',categories,bars,margins,innerW,innerH,dataLength:data.length})}
function layoutHorizontalBar(spec,data,yFields,width,height){const coords=cartesian({...spec,horizontal:true},width,height,{bandX:true,yOpts:{stacked:!!spec.stacked}});const{innerW,innerH,margins,xScale,yScale,categories,axisNodes,gridNodes}=coords;const bandW=xScale.bandwidth();const children=[];if(spec.grid!==false)children.push(...gridNodes);children.push(...axisNodes);const bars=[];for(const cat of categories){const row=data.find(d=>d[spec.x]===cat);if(!row)continue;const segments=yFields.map((f,i)=>{const val=+row[f]||0;return{field:f,color:chartColor(i),
x:0,y:xScale(cat),width:yScale(val),height:bandW,
value:val,raw:row}});bars.push({category:cat,segments});for(const seg of segments){children.push(rect({x:seg.x,y:seg.y,w:Math.max(0,seg.width),h:Math.max(0,seg.height),
rx:Math.min(2,seg.height/4),fill:seg.color,
class:'d-chart-bar',
data:{series:seg.field,value:seg.value,label:cat},
key:`bar-h-${cat}-${seg.field}`}))}}
const series=yFields.map((f,i)=>({key:f,color:chartColor(i)}));return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'bar',series,bars,categories,margins,innerW,innerH,dataLength:data.length,horizontal:true})}
function buildBars(data,spec,categories,yFields,xScale,yScale,bandW){if(spec.stacked&&yFields.length>1){return categories.map(cat=>{const row=data.find(d=>d[spec.x]===cat);if(!row)return null;let cumY=0;const segments=yFields.map((f,i)=>{const val=+row[f]||0;const y0=cumY;cumY+=val;return{field:f,color:chartColor(i),
x:xScale(cat),y:yScale(cumY),width:bandW,
height:yScale(y0)-yScale(cumY),value:val,raw:row}});return{category:cat,segments}}).filter(Boolean)}
if(yFields.length>1){const groupBandW=bandW/yFields.length;return categories.map(cat=>{const row=data.find(d=>d[spec.x]===cat);if(!row)return null;const segments=yFields.map((f,i)=>{const val=+row[f]||0;return{field:f,color:chartColor(i),
x:xScale(cat)+i*groupBandW,y:yScale(val),
width:groupBandW*0.85,height:yScale(0)-yScale(val),
value:val,raw:row}});return{category:cat,segments}}).filter(Boolean)}
return data.map(d=>{const val=+d[yFields[0]]||0;return{category:d[spec.x],
segments:[{field:yFields[0],color:chartColor(0),
x:xScale(d[spec.x]),y:yScale(val),width:bandW,
height:yScale(0)-yScale(val),value:val,raw:d}]}})}
return{layoutBar}})();const _m123=(function(){const{scene,group,path}=_m152;const{areaPathD,pointsToPathD,smoothPathD}=_m152;const{cartesian}=_m153;const{chartColor}=_m146;const{resolve,groupBy,downsampleLTTB}=_m119;function layoutArea(spec,width,height){const data=resolve(spec.data);const coords=cartesian(spec,width,height,{yOpts:{stacked:!!spec.stacked}});const{innerW,innerH,margins,xScale,yScale,xType,axisNodes,gridNodes}=coords;const yFields=Array.isArray(spec.y)?spec.y:[spec.y];const baseline=yScale(0);let series;if(spec.stacked&&yFields.length>1){const prevBaselines=data.map(()=>baseline);series=yFields.map((f,i)=>{const points=data.map((d,j)=>{const xVal=xType==='band'?d[spec.x]:(xType==='time'?new Date(d[spec.x]):+d[spec.x]);const x=xScale(xVal)+(xType==='band'?xScale.bandwidth()/2:0);const val=+d[f]||0;const y1=prevBaselines[j];const y0=yScale(yScale.invert(y1)+val);return{x,y0:y0,y1,raw:d}});for(let j=0;j<data.length;j++)prevBaselines[j]=points[j].y0;return{key:f,color:chartColor(i),points}})}else if(spec.series){const groups=groupBy(data,spec.series);series=[...groups.entries()].map(([key,rows],i)=>{const sampled=rows.length>innerW*2?downsampleLTTB(rows,spec.x,yFields[0],Math.round(innerW*2)):rows;return{key,color:chartColor(i),
points:sampled.map(d=>{const xVal=xType==='band'?d[spec.x]:(xType==='time'?new Date(d[spec.x]):+d[spec.x]);const x=xScale(xVal)+(xType==='band'?xScale.bandwidth()/2:0);return{x,y0:yScale(+d[yFields[0]]),y1:baseline,raw:d}})}})}else{series=yFields.map((f,i)=>{const sampled=data.length>innerW*2?downsampleLTTB(data,spec.x,f,Math.round(innerW*2)):data;return{key:f,color:chartColor(i),
points:sampled.map(d=>{const xVal=xType==='band'?d[spec.x]:(xType==='time'?new Date(d[spec.x]):+d[spec.x]);const x=xScale(xVal)+(xType==='band'?xScale.bandwidth()/2:0);return{x,y0:yScale(+d[f]),y1:baseline,raw:d}})}})}
const children=[];if(spec.grid!==false)children.push(...gridNodes);children.push(...axisNodes);for(const s of series){if(s.points.length<2)continue;const areaD=areaPathD(s.points);children.push(path({d:areaD,fill:s.color,class:'d-chart-area',
data:{series:s.key},key:`area-${s.key}`}));const linePts=s.points.map(p=>({x:p.x,y:p.y0}));const lineD=spec.smooth?smoothPathD(linePts):pointsToPathD(linePts);children.push(path({d:lineD,stroke:s.color,strokeWidth:2,
strokeLinecap:'round',strokeLinejoin:'round',
class:'d-chart-line',
data:{series:s.key},key:`area-line-${s.key}`}))}
return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'area',series,xScale,yScale,xType,margins,innerW,innerH,baseline,dataLength:data.length})}
return{layoutArea}})();const _m154=(function(){const{scaleLinear}=_m119;const{MARGINS_PIE,innerDimensions}=_m146;function polar(width,height,opts={}){const margins=opts.margins||MARGINS_PIE;const{innerW,innerH}=innerDimensions(width,height,margins);const padding=opts.padding!=null?opts.padding:8;const cx=margins.left+innerW/2;const cy=margins.top+innerH/2;const radius=Math.max(0,Math.min(innerW,innerH)/2-padding);const innerRadiusRatio=opts.innerRadiusRatio||0;const innerRadius=radius*innerRadiusRatio;const startAngle=opts.startAngle!=null?opts.startAngle:-Math.PI/2;const endAngle=opts.endAngle!=null?opts.endAngle:Math.PI*3/2;const totalAngle=endAngle-startAngle;function angularScale(v,total){return startAngle+(v/(total||1))*totalAngle}
function radialScale(domain){return scaleLinear(domain,[innerRadius,radius])}
return{cx,cy,radius,innerRadius,
startAngle,endAngle,totalAngle,
angularScale,radialScale,
innerW,innerH,margins,
width,height}}
function polarPoint(cx,cy,r,angle){return{x:cx+r*Math.cos(angle),
y:cy+r*Math.sin(angle)}}
function sliceAngles(values,startAngle,totalAngle){let total=0;for(let i=0;i<values.length;i++)total+=Math.abs(values[i])||0;if(total===0)total=1;let angle=startAngle;return values.map(v=>{const val=Math.abs(v)||0;const sweep=(val/total)*totalAngle;const sa=angle;angle+=sweep;return{startAngle:sa,endAngle:sa+sweep,percentage:(val/total)*100}})}
return{polar,polarPoint,sliceAngles}})();const _m124=(function(){const{scene,arc,text}=_m152;const{polar,sliceAngles}=_m154;const{chartColor,MARGINS_NONE}=_m146;const{resolve}=_m119;function layoutPie(spec,width,height){const data=resolve(spec.data);const yField=Array.isArray(spec.y)?spec.y[0]:spec.y;const xField=spec.x;const innerRadiusRatio=spec.donut!==false?0.55:0;const coords=polar(width,height,{innerRadiusRatio,padding:8});const{cx,cy,radius,innerRadius,startAngle,totalAngle}=coords;const values=data.map(d=>Math.abs(+d[yField]||0));const angles=sliceAngles(values,startAngle,totalAngle);let total=0;for(const v of values)total+=v;const slices=data.map((d,i)=>({label:d[xField],
value:values[i],
percentage:angles[i].percentage,
startAngle:angles[i].startAngle,
endAngle:angles[i].endAngle,
color:chartColor(i),
raw:d}));const children=[];for(const s of slices){children.push(arc({cx,cy,outerR:radius,innerR:innerRadius,
startAngle:s.startAngle,endAngle:s.endAngle,
fill:s.color,class:'d-chart-slice',
data:{label:s.label,value:s.value,
ariaLabel:`${s.label}: ${s.value} (${s.percentage.toFixed(1)}%)`,
series:s.label},
key:`slice-${s.label}`}));if(spec.labels){const midAngle=(s.startAngle+s.endAngle)/2;const labelR=(radius+innerRadius)/2;const lx=cx+labelR*Math.cos(midAngle);const ly=cy+labelR*Math.sin(midAngle);children.push(text({x:lx,y:ly,content:`${s.percentage.toFixed(0)}%`,
anchor:'middle',baseline:'middle',
class:'d-chart-axis',fontSize:'var(--d-text-xs)',
fill:'var(--d-fg)'}))}}
const series=slices.map(s=>({key:s.label,color:s.color}));return scene(width,height,children,{type:'pie',series,slices,
cx,cy,radius,innerRadius,
margins:MARGINS_NONE,
innerW:width,innerH:height,
dataLength:data.length})}
return{layoutPie}})();const _m125=(function(){const{scene,path,rect}=_m152;const{pointsToPathD,areaPathD}=_m152;const{scaleLinear}=_m119;function layoutSparkline(spec,width,height){const data=Array.isArray(spec.data)?spec.data:[];const isFlat=data.length>0&&typeof data[0]==='number';const points=isFlat
?data.map((v,i)=>({x:i,y:v}))
:data.map(d=>({x:+d[spec.x],y:+d[spec.y]}));if(points.length===0){return scene(width,height,[],{type:'sparkline',dataLength:0})}
let xMin=Infinity,xMax=-Infinity,yMin=Infinity,yMax=-Infinity;for(const p of points){if(p.x<xMin)xMin=p.x;if(p.x>xMax)xMax=p.x;if(p.y<yMin)yMin=p.y;if(p.y>yMax)yMax=p.y}
const pad=2;const xScale=scaleLinear([xMin,xMax],[pad,width-pad]);const yScale=scaleLinear([yMin,yMax],[height-pad,pad]);const scaled=points.map(p=>({x:xScale(p.x),y:yScale(p.y)}));const variant=spec.variant||'line';const children=[];if(variant==='bar'){const barWidth=Math.max(1,(width-pad*2)/points.length*0.8);const baseline=yScale(Math.max(0,yMin));for(let i=0;i<scaled.length;i++){children.push(rect({x:scaled[i].x-barWidth/2,y:Math.min(scaled[i].y,baseline),
w:barWidth,h:Math.abs(scaled[i].y-baseline),
fill:'var(--d-chart-0,var(--d-primary))',
key:`spark-bar-${i}`}))}}else if(variant==='area'){const baseline=height-pad;const areaPoints=scaled.map(p=>({x:p.x,y0:p.y,y1:baseline}));children.push(path({d:areaPathD(areaPoints),
fill:'var(--d-chart-0,var(--d-primary))',
opacity:0.15,class:'d-chart-area'}));children.push(path({d:pointsToPathD(scaled),
stroke:'var(--d-chart-0,var(--d-primary))',
strokeWidth:1.5,class:'d-chart-line'}))}else{children.push(path({d:pointsToPathD(scaled),
stroke:'var(--d-chart-0,var(--d-primary))',
strokeWidth:1.5,class:'d-chart-line'}))}
return scene(width,height,children,{type:'sparkline',dataLength:points.length})}
return{layoutSparkline}})();const _m126=(function(){const{scene,group,circle,text}=_m152;const{cartesian}=_m153;const{chartColor}=_m146;const{resolve,groupBy}=_m119;function layoutScatter(spec,width,height){const data=resolve(spec.data);const coords=cartesian(spec,width,height);const{innerW,innerH,margins,xScale,yScale,xType,axisNodes,gridNodes}=coords;const yField=Array.isArray(spec.y)?spec.y[0]:spec.y;const markerSize=spec.markerSize||4;let series;if(spec.series){const groups=groupBy(data,spec.series);series=[...groups.entries()].map(([key,rows],i)=>({key,color:chartColor(i),
points:rows.map(d=>mapPoint(d,spec,xScale,yScale,xType,yField))}))}else{series=[{key:yField,color:chartColor(0),
points:data.map(d=>mapPoint(d,spec,xScale,yScale,xType,yField))}]}
const children=[];if(spec.grid!==false)children.push(...gridNodes);children.push(...axisNodes);for(const s of series){for(let i=0;i<s.points.length;i++){const p=s.points[i];children.push(circle({cx:p.x,cy:p.y,r:markerSize,
fill:s.color,class:'d-chart-point',
data:{series:s.key,value:p.raw[yField],label:String(p.raw[spec.x])},
key:`scatter-${s.key}-${i}`}));if(spec.labels){children.push(text({x:p.x,y:p.y-markerSize-4,
content:String(p.raw[yField]),anchor:'middle',
class:'d-chart-axis',fontSize:'var(--d-text-xs)'}))}}}
return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'scatter',series,margins,innerW,innerH,dataLength:data.length})}
function mapPoint(d,spec,xScale,yScale,xType,yField){const xVal=xType==='band'?d[spec.x]:(xType==='time'?new Date(d[spec.x]):+d[spec.x]);const x=xScale(xVal)+(xType==='band'?xScale.bandwidth()/2:0);return{x,y:yScale(+d[yField]),raw:d}}
return{layoutScatter}})();const _m127=(function(){const{scene,group,circle,text}=_m152;const{cartesian}=_m153;const{chartColor}=_m146;const{resolve,groupBy,extent}=_m119;function layoutBubble(spec,width,height){const data=resolve(spec.data);const coords=cartesian(spec,width,height);const{innerW,innerH,margins,xScale,yScale,xType,axisNodes,gridNodes}=coords;const yField=Array.isArray(spec.y)?spec.y[0]:spec.y;const sizeField=spec.size||spec.z||yField;const[sizeMin,sizeMax]=extent(data,sizeField);const minR=4,maxR=Math.min(innerW,innerH)/12;function bubbleR(v){const t=sizeMax>sizeMin?(v-sizeMin)/(sizeMax-sizeMin):0.5;return minR+Math.sqrt(t)*(maxR-minR)}
let series;if(spec.series){const groups=groupBy(data,spec.series);series=[...groups.entries()].map(([key,rows],i)=>({key,color:chartColor(i),
points:rows.map(d=>({...mapPt(d,spec,xScale,yScale,xType,yField),r:bubbleR(+d[sizeField])}))}))}else{series=[{key:yField,color:chartColor(0),
points:data.map(d=>({...mapPt(d,spec,xScale,yScale,xType,yField),r:bubbleR(+d[sizeField])}))}]}
const children=[];if(spec.grid!==false)children.push(...gridNodes);children.push(...axisNodes);for(const s of series){for(let i=0;i<s.points.length;i++){const p=s.points[i];children.push(circle({cx:p.x,cy:p.y,r:p.r,
fill:s.color,opacity:0.7,class:'d-chart-point',
data:{series:s.key,value:p.raw[yField],label:String(p.raw[spec.x])},
key:`bubble-${s.key}-${i}`}))}}
return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'bubble',series,margins,innerW,innerH,dataLength:data.length})}
function mapPt(d,spec,xScale,yScale,xType,yField){const xVal=xType==='band'?d[spec.x]:(xType==='time'?new Date(d[spec.x]):+d[spec.x]);const x=xScale(xVal)+(xType==='band'?xScale.bandwidth()/2:0);return{x,y:yScale(+d[yField]),raw:d}}
return{layoutBubble}})();const _m128=(function(){const{scene,group,rect,text}=_m152;const{chartColor,MARGINS,innerDimensions,buildGridNodes,buildYAxisNodes}=_m146;const{resolve,scaleLinear,scaleBand,extent}=_m119;const{line}=_m152;function layoutHistogram(spec,width,height){const data=resolve(spec.data);const field=spec.x||(Array.isArray(spec.y)?spec.y[0]:(spec.y!=='y'?spec.y:null))||'value';const values=data.map(d=>+d[field]).filter(v=>!isNaN(v));const margins={...MARGINS};const{innerW,innerH}=innerDimensions(width,height,margins);const binCount=spec.bins||Math.max(5,Math.ceil(Math.sqrt(values.length)));const[minVal,maxVal]=extent(data,field);const binWidth=spec.binWidth||(maxVal-minVal)/binCount||1;const bins=[];for(let i=0;i<binCount;i++){const lo=minVal+i*binWidth;const hi=lo+binWidth;const count=values.filter(v=>v>=lo&&(i===binCount-1?v<=hi:v<hi)).length;bins.push({lo,hi,count,label:`${lo.toFixed(1)}-${hi.toFixed(1)}`})}
const xScale=scaleLinear([minVal,minVal+binCount*binWidth],[0,innerW]);const maxCount=Math.max(...bins.map(b=>b.count),1);const yScale=scaleLinear([0,maxCount*1.1],[innerH,0]);const children=[];if(spec.grid!==false)children.push(...buildGridNodes(yScale,innerW));children.push(line({x1:0,y1:innerH,x2:innerW,y2:innerH,stroke:'var(--d-border)',class:'d-chart-axis'}));for(const bin of bins){const x=xScale((bin.lo+bin.hi)/2);children.push(text({x,y:innerH+18,content:bin.lo.toFixed(0),anchor:'middle',class:'d-chart-axis'}))}
children.push(...buildYAxisNodes(yScale,innerH,spec));const gap=1;for(let i=0;i<bins.length;i++){const bin=bins[i];const x=xScale(bin.lo)+gap;const w=xScale(bin.hi)-xScale(bin.lo)-gap*2;const y=yScale(bin.count);const h=innerH-y;children.push(rect({x,y,w:Math.max(0,w),h:Math.max(0,h),
fill:chartColor(0),class:'d-chart-bar',
data:{label:bin.label,value:bin.count,series:field},
key:`hist-${i}`}))}
return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'histogram',bins,margins,innerW,innerH,dataLength:data.length})}
return{layoutHistogram}})();const _m129=(function(){const{scene,group,rect,line,circle,text}=_m152;const{cartesian}=_m153;const{chartColor,MARGINS,innerDimensions,buildGridNodes,buildYAxisNodes}=_m146;const{resolve,unique,scaleBand,scaleLinear,extent}=_m119;function layoutBoxPlot(spec,width,height){const data=resolve(spec.data);const xField=spec.x;const yField=Array.isArray(spec.y)?spec.y[0]:spec.y;const whiskerType=spec.whiskerType||'1.5IQR';const categories=unique(data,xField);const margins={...MARGINS};const{innerW,innerH}=innerDimensions(width,height,margins);const xScale=scaleBand(categories,[0,innerW],0.3);const bandW=xScale.bandwidth();const boxes=categories.map((cat,ci)=>{const values=data.filter(d=>d[xField]===cat).map(d=>+d[yField]).sort((a,b)=>a-b);return{category:cat,color:chartColor(ci),...computeBoxStats(values,whiskerType)}});let yMin=Infinity,yMax=-Infinity;for(const b of boxes){if(b.whiskerLow<yMin)yMin=b.whiskerLow;if(b.whiskerHigh>yMax)yMax=b.whiskerHigh;for(const o of b.outliers){if(o<yMin)yMin=o;if(o>yMax)yMax=o}}
const pad=(yMax-yMin)*0.1||1;const yScale=scaleLinear([yMin-pad,yMax+pad],[innerH,0]);const children=[];if(spec.grid!==false)children.push(...buildGridNodes(yScale,innerW));children.push(line({x1:0,y1:innerH,x2:innerW,y2:innerH,stroke:'var(--d-border)',class:'d-chart-axis'}));for(const cat of categories){const x=xScale(cat)+bandW/2;children.push(text({x,y:innerH+18,content:String(cat),anchor:'middle',class:'d-chart-axis'}))}
children.push(...buildYAxisNodes(yScale,innerH,spec));for(const b of boxes){const cx=xScale(b.category)+bandW/2;const boxW=bandW*0.6;const x0=cx-boxW/2;children.push(line({x1:cx,y1:yScale(b.whiskerHigh),x2:cx,y2:yScale(b.q3),stroke:b.color,strokeWidth:1.5,strokeDash:'3,2'}));children.push(line({x1:cx,y1:yScale(b.q1),x2:cx,y2:yScale(b.whiskerLow),stroke:b.color,strokeWidth:1.5,strokeDash:'3,2'}));const capW=boxW*0.4;children.push(line({x1:cx-capW,y1:yScale(b.whiskerHigh),x2:cx+capW,y2:yScale(b.whiskerHigh),stroke:b.color,strokeWidth:1.5}));children.push(line({x1:cx-capW,y1:yScale(b.whiskerLow),x2:cx+capW,y2:yScale(b.whiskerLow),stroke:b.color,strokeWidth:1.5}));children.push(rect({x:x0,y:yScale(b.q3),w:boxW,h:yScale(b.q1)-yScale(b.q3),
fill:b.color,opacity:0.3,stroke:b.color,strokeWidth:1.5,
class:'d-chart-bar',
data:{label:b.category,value:`Q1:${b.q1.toFixed(1)} Med:${b.median.toFixed(1)} Q3:${b.q3.toFixed(1)}`,series:b.category},
key:`box-${b.category}`}));children.push(line({x1:x0,y1:yScale(b.median),x2:x0+boxW,y2:yScale(b.median),stroke:b.color,strokeWidth:2}));for(const o of b.outliers){children.push(circle({cx,cy:yScale(o),r:3,fill:'none',stroke:b.color,strokeWidth:1.5,class:'d-chart-point'}))}}
return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'box-plot',boxes,margins,innerW,innerH,dataLength:data.length})}
function computeBoxStats(sorted,whiskerType){const n=sorted.length;if(n===0)return{q1:0,median:0,q3:0,whiskerLow:0,whiskerHigh:0,outliers:[]};const median=quantile(sorted,0.5);const q1=quantile(sorted,0.25);const q3=quantile(sorted,0.75);const iqr=q3-q1;let whiskerLow,whiskerHigh,outliers=[];if(whiskerType==='min-max'){whiskerLow=sorted[0];whiskerHigh=sorted[n-1]}else{const lowerFence=q1-1.5*iqr;const upperFence=q3+1.5*iqr;whiskerLow=sorted.find(v=>v>=lowerFence)??sorted[0];whiskerHigh=[...sorted].reverse().find(v=>v<=upperFence)??sorted[n-1];outliers=sorted.filter(v=>v<lowerFence||v>upperFence)}
return{q1,median,q3,whiskerLow,whiskerHigh,outliers}}
function quantile(sorted,p){const idx=(sorted.length-1)*p;const lo=Math.floor(idx);const hi=Math.ceil(idx);if(lo===hi)return sorted[lo];return sorted[lo]+(sorted[hi]-sorted[lo])*(idx-lo)}
return{layoutBoxPlot}})();const _m130=(function(){const{scene,group,rect,line,text}=_m152;const{MARGINS,innerDimensions,buildGridNodes,buildYAxisNodes,chartColor}=_m146;const{resolve,scaleBand,scaleLinear,unique,extent}=_m119;function layoutCandlestick(spec,width,height){const data=resolve(spec.data);const xField=spec.x;const openField=spec.open||'open';const highField=spec.high||'high';const lowField=spec.low||'low';const closeField=spec.close||'close';const volumeField=spec.volume;const margins={...MARGINS};if(volumeField)margins.bottom+=60;const{innerW,innerH:rawInnerH}=innerDimensions(width,height,margins);const volumeH=volumeField?50:0;const innerH=rawInnerH-volumeH;const categories=data.map(d=>d[xField]);const xScale=scaleBand(categories,[0,innerW],0.1);const bandW=xScale.bandwidth();let yMin=Infinity,yMax=-Infinity;for(const d of data){const lo=+d[lowField],hi=+d[highField];if(lo<yMin)yMin=lo;if(hi>yMax)yMax=hi}
const pad=(yMax-yMin)*0.05;const yScale=scaleLinear([yMin-pad,yMax+pad],[innerH,0]);const children=[];if(spec.grid!==false)children.push(...buildGridNodes(yScale,innerW));children.push(line({x1:0,y1:innerH,x2:innerW,y2:innerH,stroke:'var(--d-border)',class:'d-chart-axis'}));const labelInterval=Math.max(1,Math.floor(categories.length/8));for(let i=0;i<categories.length;i++){if(i%labelInterval!==0)continue;const x=xScale(categories[i])+bandW/2;children.push(text({x,y:innerH+18,content:String(categories[i]),anchor:'middle',class:'d-chart-axis'}))}
children.push(...buildYAxisNodes(yScale,innerH,spec));const upColor='var(--d-success)';const downColor='var(--d-error)';for(let i=0;i<data.length;i++){const d=data[i];const open=+d[openField],close=+d[closeField];const high=+d[highField],low=+d[lowField];const isUp=close>=open;const color=isUp?upColor:downColor;const cx=xScale(d[xField])+bandW/2;const bodyW=bandW*0.6;children.push(line({x1:cx,y1:yScale(high),x2:cx,y2:yScale(low),stroke:color,strokeWidth:1}));const bodyTop=yScale(Math.max(open,close));const bodyBottom=yScale(Math.min(open,close));const bodyH=Math.max(1,bodyBottom-bodyTop);if(spec.hollow&&isUp){children.push(rect({x:cx-bodyW/2,y:bodyTop,w:bodyW,h:bodyH,
fill:'none',stroke:color,strokeWidth:1.5,
class:'d-chart-bar',
data:{label:String(d[xField]),value:`O:${open} H:${high} L:${low} C:${close}`,series:'candle'},
key:`candle-${i}`}))}else{children.push(rect({x:cx-bodyW/2,y:bodyTop,w:bodyW,h:bodyH,
fill:color,class:'d-chart-bar',
data:{label:String(d[xField]),value:`O:${open} H:${high} L:${low} C:${close}`,series:'candle'},
key:`candle-${i}`}))}}
if(volumeField){const volMax=Math.max(...data.map(d=>+d[volumeField]||0),1);const volScale=scaleLinear([0,volMax],[0,volumeH]);const volY0=innerH+30;for(let i=0;i<data.length;i++){const d=data[i];const vol=+d[volumeField]||0;const isUp=+d[closeField]>=+d[openField];const h=volScale(vol);children.push(rect({x:xScale(d[xField]),y:volY0+volumeH-h,w:bandW,h,
fill:isUp?upColor:downColor,opacity:0.3,
key:`vol-${i}`}))}}
return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'candlestick',margins,innerW,innerH,dataLength:data.length})}
return{layoutCandlestick}})();const _m131=(function(){const{scene,group,rect,line,text}=_m152;const{MARGINS,innerDimensions,buildGridNodes,buildYAxisNodes}=_m146;const{resolve,unique,scaleBand,scaleLinear}=_m119;function layoutWaterfall(spec,width,height){const data=resolve(spec.data);const xField=spec.x;const yField=Array.isArray(spec.y)?spec.y[0]:spec.y;const categories=data.map(d=>d[xField]);const margins={...MARGINS};const{innerW,innerH}=innerDimensions(width,height,margins);const xScale=scaleBand(categories,[0,innerW],0.2);const bandW=xScale.bandwidth();const items=[];let running=0;for(const d of data){const val=+d[yField]||0;const isTotal=d.total===true||d.subtotal===true;if(isTotal){items.push({label:d[xField],start:0,end:running,value:running,isTotal:true,raw:d})}else{const start=running;running+=val;items.push({label:d[xField],start,end:running,value:val,isTotal:false,raw:d})}}
let yMin=0,yMax=0;for(const it of items){yMin=Math.min(yMin,it.start,it.end);yMax=Math.max(yMax,it.start,it.end)}
const pad=(yMax-yMin)*0.1||10;const yScale=scaleLinear([yMin-pad,yMax+pad],[innerH,0]);const children=[];if(spec.grid!==false)children.push(...buildGridNodes(yScale,innerW));children.push(line({x1:0,y1:innerH,x2:innerW,y2:innerH,stroke:'var(--d-border)',class:'d-chart-axis'}));for(const cat of categories){const x=xScale(cat)+bandW/2;children.push(text({x,y:innerH+18,content:String(cat),anchor:'middle',class:'d-chart-axis'}))}
children.push(...buildYAxisNodes(yScale,innerH,spec));for(let i=0;i<items.length;i++){const it=items[i];const x=xScale(it.label);const top=yScale(Math.max(it.start,it.end));const bottom=yScale(Math.min(it.start,it.end));const h=Math.max(1,bottom-top);let color;if(it.isTotal)color='var(--d-primary)'; else if(it.value>=0)color='var(--d-success)'; else color='var(--d-error)';children.push(rect({x,y:top,w:bandW,h,fill:color,class:'d-chart-bar',
data:{label:it.label,value:it.value,series:'waterfall'},
key:`wf-${i}`}));if(i<items.length-1&&!items[i+1].isTotal){const nextX=xScale(items[i+1].label);children.push(line({x1:x+bandW,y1:yScale(it.end),
x2:nextX,y2:yScale(it.end),
stroke:'var(--d-muted)',strokeDash:'3,2',strokeWidth:1}))}
if(spec.labels){children.push(text({x:x+bandW/2,y:top-6,
content:it.value>=0?`+${it.value}`:String(it.value),
anchor:'middle',class:'d-chart-axis',fontSize:'var(--d-text-xs)'}))}}
return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'waterfall',items,margins,innerW,innerH,dataLength:data.length})}
return{layoutWaterfall}})();const _m132=(function(){const{scene,group,rect,text,line}=_m152;const{MARGINS,innerDimensions,buildGridNodes,buildYAxisNodes,chartColor}=_m146;const{resolve,unique,scaleBand,scaleLinear,extent}=_m119;function layoutRangeBar(spec,width,height){const data=resolve(spec.data);const xField=spec.x;const lowField=spec.low||(Array.isArray(spec.y)?spec.y[0]:'low');const highField=spec.high||(Array.isArray(spec.y)?spec.y[1]:'high');const categories=unique(data,xField);const margins={...MARGINS};const{innerW,innerH}=innerDimensions(width,height,margins);const xScale=scaleBand(categories,[0,innerW],0.2);const bandW=xScale.bandwidth();let yMin=Infinity,yMax=-Infinity;for(const d of data){const lo=+d[lowField],hi=+d[highField];if(lo<yMin)yMin=lo;if(hi>yMax)yMax=hi}
const pad=(yMax-yMin)*0.1||1;const yScale=scaleLinear([yMin-pad,yMax+pad],[innerH,0]);const children=[];if(spec.grid!==false)children.push(...buildGridNodes(yScale,innerW));children.push(line({x1:0,y1:innerH,x2:innerW,y2:innerH,stroke:'var(--d-border)',class:'d-chart-axis'}));for(const cat of categories){children.push(text({x:xScale(cat)+bandW/2,y:innerH+18,content:String(cat),anchor:'middle',class:'d-chart-axis'}))}
children.push(...buildYAxisNodes(yScale,innerH,spec));for(let i=0;i<data.length;i++){const d=data[i];const lo=+d[lowField],hi=+d[highField];const x=xScale(d[xField]);children.push(rect({x,y:yScale(hi),w:bandW,h:yScale(lo)-yScale(hi),
fill:chartColor(i%8),rx:2,class:'d-chart-bar',
data:{label:d[xField],value:`${lo}-${hi}`,series:'range'},
key:`rbar-${i}`}));if(spec.labels){children.push(text({x:x+bandW/2,y:yScale(hi)-6,content:String(hi),anchor:'middle',class:'d-chart-axis',fontSize:'var(--d-text-xs)'}));children.push(text({x:x+bandW/2,y:yScale(lo)+14,content:String(lo),anchor:'middle',class:'d-chart-axis',fontSize:'var(--d-text-xs)'}))}}
return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'range-bar',margins,innerW,innerH,dataLength:data.length})}
return{layoutRangeBar}})();const _m133=(function(){const{scene,group,path,text}=_m152;const{pointsToPathD}=_m152;const{cartesian}=_m153;const{chartColor}=_m146;const{resolve}=_m119;function layoutRangeArea(spec,width,height){const data=resolve(spec.data);const lowField=spec.low||(Array.isArray(spec.y)?spec.y[0]:'low');const highField=spec.high||(Array.isArray(spec.y)?spec.y[1]:'high');const coords=cartesian({...spec,y:[lowField,highField]},width,height);const{innerW,innerH,margins,xScale,yScale,xType,axisNodes,gridNodes}=coords;const children=[];if(spec.grid!==false)children.push(...gridNodes);children.push(...axisNodes);const points=data.map(d=>{const xVal=xType==='band'?d[spec.x]:(xType==='time'?new Date(d[spec.x]):+d[spec.x]);const x=xScale(xVal)+(xType==='band'?xScale.bandwidth()/2:0);return{x,yLow:yScale(+d[lowField]),yHigh:yScale(+d[highField])}});let areaD=`M${points[0].x},${points[0].yHigh}`;for(let i=1;i<points.length;i++)areaD+=`L${points[i].x},${points[i].yHigh}`;for(let i=points.length-1;i>=0;i--)areaD+=`L${points[i].x},${points[i].yLow}`;areaD+='Z';children.push(path({d:areaD,fill:chartColor(0),opacity:0.2,class:'d-chart-area',key:'range-area-fill'}));children.push(path({d:pointsToPathD(points.map(p=>({x:p.x,y:p.yHigh}))),
stroke:chartColor(0),strokeWidth:1.5,class:'d-chart-line',key:'range-area-high'}));children.push(path({d:pointsToPathD(points.map(p=>({x:p.x,y:p.yLow}))),
stroke:chartColor(0),strokeWidth:1.5,strokeDash:'4,3',class:'d-chart-line',key:'range-area-low'}));const series=[{key:`${lowField}-${highField}`,color:chartColor(0)}];return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'range-area',series,margins,innerW,innerH,dataLength:data.length})}
return{layoutRangeArea}})();const _m134=(function(){const{scene,group,rect,text,line}=_m152;const{MARGINS,innerDimensions}=_m146;const{resolve,unique}=_m119;function layoutHeatmap(spec,width,height){const data=resolve(spec.data);const xField=spec.x;const yField=spec.row||spec.series||(Array.isArray(spec.y)?spec.y[0]:spec.y);const valueField=spec.value||(Array.isArray(spec.y)?spec.y[1]:'value');const xCats=unique(data,xField);const yCats=unique(data,yField);const margins={...MARGINS,left:72};const{innerW,innerH}=innerDimensions(width,height,margins);const cellW=innerW/(xCats.length||1);const cellH=innerH/(yCats.length||1);let vMin=Infinity,vMax=-Infinity;for(const d of data){const v=+d[valueField];if(v<vMin)vMin=v;if(v>vMax)vMax=v}
const colorStops=spec.colorScale||['#f0f9ff','#0369a1'];function cellColor(v){const t=vMax>vMin?(v-vMin)/(vMax-vMin):0.5;return lerpHex(colorStops[0],colorStops[colorStops.length-1],t)}
const lookup=new Map();for(const d of data)lookup.set(`${d[xField]}|${d[yField]}`,d);const children=[];for(let i=0;i<xCats.length;i++){children.push(text({x:i*cellW+cellW/2,y:-8,
content:String(xCats[i]),anchor:'middle',class:'d-chart-axis'}))}
for(let j=0;j<yCats.length;j++){children.push(text({x:-8,y:j*cellH+cellH/2+4,
content:String(yCats[j]),anchor:'end',class:'d-chart-axis'}))}
for(let j=0;j<yCats.length;j++){for(let i=0;i<xCats.length;i++){const d=lookup.get(`${xCats[i]}|${yCats[j]}`);const val=d?+d[valueField]:0;const x=i*cellW;const y=j*cellH;children.push(rect({x:x+1,y:y+1,w:cellW-2,h:cellH-2,
rx:2,fill:cellColor(val),
class:'d-chart-bar',
data:{label:`${xCats[i]}, ${yCats[j]}`,value:val,series:'heatmap'},
key:`heat-${i}-${j}`}));if(spec.labels&&cellW>30&&cellH>20){children.push(text({x:x+cellW/2,y:y+cellH/2+4,
content:String(val),anchor:'middle',fill:val>(vMin+vMax)/2?'#fff':'#000',
fontSize:'var(--d-text-xs)'}))}}}
return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'heatmap',margins,innerW,innerH,dataLength:data.length})}
function lerpHex(hex1,hex2,t){const r1=parseInt(hex1.slice(1,3),16),g1=parseInt(hex1.slice(3,5),16),b1=parseInt(hex1.slice(5,7),16);const r2=parseInt(hex2.slice(1,3),16),g2=parseInt(hex2.slice(3,5),16),b2=parseInt(hex2.slice(5,7),16);const r=Math.round(r1+(r2-r1)*t),g=Math.round(g1+(g2-g1)*t),b=Math.round(b1+(b2-b1)*t);return'#'+[r,g,b].map(c=>Math.max(0,Math.min(255,c)).toString(16).padStart(2,'0')).join('')}
return{layoutHeatmap}})();const _m135=(function(){const{scene,group,path,rect}=_m152;const{pointsToPathD,smoothPathD,areaPathD}=_m152;const{cartesian}=_m153;const{chartColor}=_m146;const{resolve,scaleBand}=_m119;function layoutCombination(spec,width,height){const data=resolve(spec.data);const layers=spec.layers||[];if(!layers.length){return scene(width,height,[],{type:'combination',dataLength:0})}
const allYFields=layers.map(l=>l.y).filter(Boolean);const coords=cartesian({...spec,y:allYFields},width,height,{bandX:layers.some(l=>l.type==='bar')});const{innerW,innerH,margins,xScale,yScale,xType,axisNodes,gridNodes,categories}=coords;const children=[];if(spec.grid!==false)children.push(...gridNodes);children.push(...axisNodes);const series=[];const bandW=xType==='band'&&xScale.bandwidth?xScale.bandwidth():0;let barLayerIdx=0;const barLayers=layers.filter(l=>l.type==='bar');for(let li=0;li<layers.length;li++){const layer=layers[li];const yField=layer.y;const color=layer.color||chartColor(li);series.push({key:yField,color});if(layer.type==='bar'){const subBandW=barLayers.length>1?bandW/barLayers.length:bandW;const offset=barLayers.length>1?barLayerIdx*subBandW:0;barLayerIdx++;for(const d of data){const val=+d[yField]||0;const x=xScale(d[spec.x])+offset;children.push(rect({x,y:yScale(val),w:subBandW*0.85,h:yScale(0)-yScale(val),
fill:color,rx:2,class:'d-chart-bar',
data:{series:yField,value:val,label:String(d[spec.x])},
key:`combo-bar-${li}-${d[spec.x]}`}))}}else if(layer.type==='area'){const baseline=yScale(0);const points=data.map(d=>{const xVal=xType==='band'?d[spec.x]:+d[spec.x];const x=xScale(xVal)+(xType==='band'?bandW/2:0);return{x,y0:yScale(+d[yField]||0),y1:baseline}});children.push(path({d:areaPathD(points),fill:color,class:'d-chart-area',key:`combo-area-${li}`}));children.push(path({d:pointsToPathD(points.map(p=>({x:p.x,y:p.y0}))),
stroke:color,strokeWidth:2,class:'d-chart-line',key:`combo-area-line-${li}`}))}else{const points=data.map(d=>{const xVal=xType==='band'?d[spec.x]:+d[spec.x];const x=xScale(xVal)+(xType==='band'?bandW/2:0);return{x,y:yScale(+d[yField]||0)}});const pathD=layer.smooth?smoothPathD(points):pointsToPathD(points);children.push(path({d:pathD,stroke:color,strokeWidth:2,
strokeLinecap:'round',strokeLinejoin:'round',
class:'d-chart-line',
data:{series:yField},key:`combo-line-${li}`}))}}
return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'combination',series,margins,innerW,innerH,dataLength:data.length})}
return{layoutCombination}})();const _m136=(function(){const{scene,group,path,circle,text,line,polygon}=_m152;const{polar,polarPoint}=_m154;const{chartColor,MARGINS_NONE}=_m146;const{resolve,groupBy,extent}=_m119;function layoutRadar(spec,width,height){const data=resolve(spec.data);const xField=spec.x;const yFields=Array.isArray(spec.y)?spec.y:[spec.y];const categories=data.map(d=>d[xField]);const n=categories.length;const coords=polar(width,height,{padding:40});const{cx,cy,radius}=coords;let maxVal=-Infinity;for(const d of data){for(const f of yFields){const v=+d[f]||0;if(v>maxVal)maxVal=v}}
if(maxVal<=0)maxVal=1;const levels=5;const children=[];for(let l=1;l<=levels;l++){const r=(l/levels)*radius;const ringPts=[];for(let i=0;i<n;i++){const angle=-Math.PI/2+(i/n)*Math.PI*2;ringPts.push(polarPoint(cx,cy,r,angle))}
children.push(polygon({points:ringPts,fill:'none',
stroke:'var(--d-border)',strokeWidth:0.5,opacity:0.5}))}
for(let i=0;i<n;i++){const angle=-Math.PI/2+(i/n)*Math.PI*2;const outer=polarPoint(cx,cy,radius,angle);children.push(line({x1:cx,y1:cy,x2:outer.x,y2:outer.y,stroke:'var(--d-border)',strokeWidth:0.5}));const labelPt=polarPoint(cx,cy,radius+16,angle);children.push(text({x:labelPt.x,y:labelPt.y+4,
content:String(categories[i]),
anchor:Math.abs(angle+Math.PI/2)<0.1?'middle':(labelPt.x>cx?'start':'end'),
class:'d-chart-axis',fontSize:'var(--d-text-xs)'}))}
const series=yFields.map((f,fi)=>{const color=chartColor(fi);const pts=data.map((d,i)=>{const val=+d[f]||0;const r=(val/maxVal)*radius;const angle=-Math.PI/2+(i/n)*Math.PI*2;return polarPoint(cx,cy,r,angle)});children.push(polygon({points:pts,fill:color,opacity:0.15,stroke:color,strokeWidth:2}));for(let i=0;i<pts.length;i++){children.push(circle({cx:pts[i].x,cy:pts[i].y,r:3,
fill:color,class:'d-chart-point',
data:{series:f,value:data[i][f],label:categories[i]},
key:`radar-${f}-${i}`}))}
return{key:f,color,points:pts}});return scene(width,height,children,{type:'radar',series,margins:MARGINS_NONE,
innerW:width,innerH:height,dataLength:data.length})}
return{layoutRadar}})();const _m137=(function(){const{scene,arc,text}=_m152;const{polar,polarPoint}=_m154;const{chartColor,MARGINS_NONE}=_m146;const{resolve}=_m119;function layoutRadial(spec,width,height){const data=resolve(spec.data);const xField=spec.x;const yField=Array.isArray(spec.y)?spec.y[0]:spec.y;const n=data.length;const coords=polar(width,height,{innerRadiusRatio:0.3,padding:24});const{cx,cy,radius,innerRadius,startAngle,totalAngle}=coords;let maxVal=-Infinity;for(const d of data){const v=+d[yField]||0;if(v>maxVal)maxVal=v}
if(maxVal<=0)maxVal=1;const sliceAngle=totalAngle/n;const gap=0.02;const children=[];const series=[];for(let i=0;i<n;i++){const d=data[i];const val=+d[yField]||0;const sa=startAngle+i*sliceAngle+gap;const ea=startAngle+(i+1)*sliceAngle-gap;const outerR=innerRadius+(val/maxVal)*(radius-innerRadius);const color=chartColor(i);children.push(arc({cx,cy,innerR:innerRadius,outerR,
startAngle:sa,endAngle:ea,
fill:color,class:'d-chart-slice',
data:{label:d[xField],value:val,series:d[xField],
ariaLabel:`${d[xField]}: ${val}`},
key:`radial-${i}`}));const midAngle=(sa+ea)/2;const labelPt=polarPoint(cx,cy,radius+14,midAngle);children.push(text({x:labelPt.x,y:labelPt.y+4,
content:String(d[xField]),
anchor:labelPt.x>cx?'start':'end',
class:'d-chart-axis',fontSize:'var(--d-text-xs)'}));series.push({key:d[xField],color})}
return scene(width,height,children,{type:'radial',series,margins:MARGINS_NONE,
innerW:width,innerH:height,cx,cy,radius,innerRadius,
dataLength:data.length})}
return{layoutRadial}})();const _m138=(function(){const{scene,arc,line,text,rect,circle}=_m152;const{polar,polarPoint}=_m154;const{MARGINS_NONE}=_m146;const{resolve}=_m119;function layoutGauge(spec,width,height){const rawData=resolve(spec.data);const val=resolve(spec.value)??(typeof rawData==='number'?rawData:Array.isArray(rawData)?(+rawData[0]?.[spec.y]||+rawData[0]||0):0);const min=spec.min??0;const max=spec.max??100;const target=spec.target;const segments=spec.segments||[];const variant=spec.variant||'radial';if(variant==='bullet'||variant==='linear'||variant==='horizontal'){return layoutLinearGauge(spec,val,min,max,target,segments,width,height)}
return layoutRadialGauge(spec,val,min,max,target,segments,width,height)}
function layoutRadialGauge(spec,val,min,max,target,segments,width,height){const startAngle=-Math.PI*0.75;const endAngle=Math.PI*0.75;const totalAngle=endAngle-startAngle;const coords=polar(width,height,{innerRadiusRatio:0.7,padding:24,startAngle,endAngle});const{cx,cy,radius,innerRadius}=coords;const children=[];const range=max-min||1;const fraction=Math.max(0,Math.min(1,(val-min)/range));children.push(arc({cx,cy,innerR:innerRadius,outerR:radius,
startAngle,endAngle,
fill:'var(--d-border)',opacity:0.2}));if(segments.length){for(const seg of segments){const sa=startAngle+((seg.from-min)/range)*totalAngle;const ea=startAngle+((seg.to-min)/range)*totalAngle;children.push(arc({cx,cy,innerR:innerRadius,outerR:radius,
startAngle:sa,endAngle:ea,
fill:seg.color||'var(--d-muted)',opacity:0.3}))}}
const valAngle=startAngle+fraction*totalAngle;const valueColor=getValueColor(fraction);children.push(arc({cx,cy,innerR:innerRadius,outerR:radius,
startAngle,endAngle:valAngle,
fill:valueColor,class:'d-chart-slice',
data:{label:'value',value:val,series:'gauge'},
key:'gauge-value'}));const needlePt=polarPoint(cx,cy,innerRadius-4,valAngle);children.push(line({x1:cx,y1:cy,x2:needlePt.x,y2:needlePt.y,stroke:'var(--d-fg)',strokeWidth:2}));children.push(circle({cx,cy,r:4,fill:'var(--d-fg)'}));if(target!=null){const tFrac=Math.max(0,Math.min(1,(target-min)/range));const tAngle=startAngle+tFrac*totalAngle;const tPt=polarPoint(cx,cy,radius+6,tAngle);children.push(line({x1:polarPoint(cx,cy,innerRadius-2,tAngle).x,
y1:polarPoint(cx,cy,innerRadius-2,tAngle).y,
x2:tPt.x,y2:tPt.y,
stroke:'var(--d-warning)',strokeWidth:2}))}
children.push(text({x:cx,y:cy+radius*0.35,
content:String(val),anchor:'middle',
fontSize:'var(--d-text-2xl)',fontWeight:'var(--d-fw-heading)',
fill:'var(--d-fg)'}));const minPt=polarPoint(cx,cy,radius+14,startAngle);const maxPt=polarPoint(cx,cy,radius+14,endAngle);children.push(text({x:minPt.x,y:minPt.y+4,content:String(min),anchor:'end',class:'d-chart-axis',fontSize:'var(--d-text-xs)'}));children.push(text({x:maxPt.x,y:maxPt.y+4,content:String(max),anchor:'start',class:'d-chart-axis',fontSize:'var(--d-text-xs)'}));return scene(width,height,children,{type:'gauge',margins:MARGINS_NONE,
innerW:width,innerH:height,
value:val,min,max,fraction,dataLength:1})}
function layoutLinearGauge(spec,val,min,max,target,segments,width,height){const margins={top:20,right:16,bottom:20,left:16};const barH=Math.min(24,height/3);const innerW=width-margins.left-margins.right;const cy=height/2;const range=max-min||1;const fraction=Math.max(0,Math.min(1,(val-min)/range));const children=[];children.push(rect({x:0,y:cy-barH/2,w:innerW,h:barH,rx:barH/2,fill:'var(--d-border)',opacity:0.2}));if(segments.length){for(const seg of segments){const x0=((seg.from-min)/range)*innerW;const x1=((seg.to-min)/range)*innerW;children.push(rect({x:x0,y:cy-barH/2,w:x1-x0,h:barH,fill:seg.color||'var(--d-muted)',opacity:0.3}))}}
children.push(rect({x:0,y:cy-barH/2,w:fraction*innerW,h:barH,
rx:barH/2,fill:getValueColor(fraction),
data:{label:'value',value:val,series:'gauge'},
key:'gauge-bar'}));if(target!=null){const tx=((target-min)/range)*innerW;children.push(line({x1:tx,y1:cy-barH,x2:tx,y2:cy+barH,stroke:'var(--d-warning)',strokeWidth:2}))}
children.push(text({x:0,y:cy+barH/2+16,content:String(min),anchor:'start',class:'d-chart-axis',fontSize:'var(--d-text-xs)'}));children.push(text({x:innerW,y:cy+barH/2+16,content:String(max),anchor:'end',class:'d-chart-axis',fontSize:'var(--d-text-xs)'}));children.push(text({x:fraction*innerW,y:cy-barH/2-8,content:String(val),anchor:'middle',fontSize:'var(--d-text-base)',fontWeight:'var(--d-fw-heading)',fill:'var(--d-fg)'}));return scene(width,height,[
group({transform:`translate(${margins.left},0)`},children)
],{type:'gauge',margins,innerW,innerH:height,value:val,min,max,fraction,dataLength:1})}
const{group}=_m152;function getValueColor(fraction){if(fraction<0.33)return'var(--d-error)';if(fraction<0.66)return'var(--d-warning)';return'var(--d-success)'}
return{layoutGauge}})();const _m139=(function(){const{scene,polygon,text}=_m152;const{chartColor,MARGINS}=_m146;const{resolve}=_m119;function layoutFunnel(spec,width,height){const data=resolve(spec.data);const xField=spec.x;const yField=Array.isArray(spec.y)?spec.y[0]:spec.y;const isPyramid=spec.pyramid===true;const margins={top:16,right:40,bottom:16,left:40};const innerW=width-margins.left-margins.right;const innerH=height-margins.top-margins.bottom;const maxVal=Math.max(...data.map(d=>Math.abs(+d[yField]||0)),1);const n=data.length;const segH=innerH/n;const gap=4;const children=[];const series=[];for(let i=0;i<n;i++){const d=data[i];const val=Math.abs(+d[yField]||0);const nextVal=i<n-1?Math.abs(+data[i+1][yField]||0):(isPyramid?0:val*0.5);const topW=(val/maxVal)*innerW;const bottomW=(nextVal/maxVal)*innerW;const cx=innerW/2;const y0=i*segH+gap/2;const y1=(i+1)*segH-gap/2;const points=[
{x:cx-topW/2,y:y0},
{x:cx+topW/2,y:y0},
{x:cx+bottomW/2,y:y1},
{x:cx-bottomW/2,y:y1}
];const color=chartColor(i);children.push(polygon({points,fill:color,class:'d-chart-slice',
data:{label:d[xField],value:val,series:d[xField],
ariaLabel:`${d[xField]}: ${val}`},
key:`funnel-${i}`}));const ly=(y0+y1)/2+4;children.push(text({x:cx,y:ly,content:`${d[xField]} (${val})`,
anchor:'middle',fill:'var(--d-fg)',
fontSize:'var(--d-text-sm)',fontWeight:'var(--d-fw-title)'}));series.push({key:d[xField],color})}
return scene(width,height,[
{type:'group',transform:`translate(${margins.left},${margins.top})`,children}
],{type:'funnel',series,margins,innerW,innerH,dataLength:data.length})}
return{layoutFunnel}})();const _m155=(function(){function buildHierarchy(data,idField,parentField,valueField){const map=new Map();const roots=[];for(const d of data){map.set(d[idField],{id:d[idField],value:+d[valueField]||0,children:[],data:d,depth:0})}
for(const d of data){const node=map.get(d[idField]);const parentId=d[parentField];if(parentId!=null&&map.has(parentId)){map.get(parentId).children.push(node)}else{roots.push(node)}}
function walk(node,depth){node.depth=depth;if(node.children.length>0){let sum=0;for(const child of node.children){walk(child,depth+1);sum+=child.value}
if(node.value===0)node.value=sum}}
const root=roots.length===1?roots[0]:{id:'__root',value:0,children:roots,data:null,depth:0};walk(root,0);return root}
function treemapLayout(root,x,y,w,h,algorithm='squarify'){const result=[];function squarify(node,bx,by,bw,bh){result.push({id:node.id,x:bx,y:by,w:bw,h:bh,value:node.value,depth:node.depth,data:node.data});if(!node.children.length)return;const children=[...node.children].sort((a,b)=>b.value-a.value);const total=children.reduce((s,c)=>s+c.value,0)||1;if(algorithm==='slice'){layoutSlice(children,total,bx,by,bw,bh)}else if(algorithm==='binary'){layoutBinary(children,total,bx,by,bw,bh)}else{layoutSquarify(children,total,bx,by,bw,bh)}}
function layoutSquarify(children,total,bx,by,bw,bh){let cx=bx,cy=by,cw=bw,ch=bh,remaining=total;let row=[],rowValue=0;for(let i=0;i<children.length;i++){const child=children[i];const prev=worstAspect(row,rowValue,cw,ch,remaining);row.push(child);rowValue+=child.value;const curr=worstAspect(row,rowValue,cw,ch,remaining);if(row.length>1&&curr>prev){row.pop();rowValue-=child.value;const laid=layRow(row,rowValue,cx,cy,cw,ch,remaining);cx=laid.cx;cy=laid.cy;cw=laid.cw;ch=laid.ch;remaining-=rowValue;row=[child];rowValue=child.value}}
if(row.length)layRow(row,rowValue,cx,cy,cw,ch,remaining)}
function worstAspect(row,rowValue,cw,ch,remaining){if(!row.length)return Infinity;const area=(rowValue/(remaining||1))*cw*ch;const side=cw>=ch?area/ch:area/cw;let worst=0;for(const c of row){const cellArea=(c.value/(rowValue||1))*area;const dim=cellArea/side;const aspect=Math.max(side/dim,dim/side);if(aspect>worst)worst=aspect}
return worst}
function layRow(row,rowValue,cx,cy,cw,ch,remaining){const area=(rowValue/(remaining||1))*cw*ch;const isHorizontal=cw>=ch;const side=isHorizontal?area/ch:area/cw;let offset=0;for(const child of row){const frac=child.value/(rowValue||1);if(isHorizontal){const cellH=ch*frac;squarify(child,cx,cy+offset,side,cellH);offset+=cellH}else{const cellW=cw*frac;squarify(child,cx+offset,cy,cellW,side);offset+=cellW}}
if(isHorizontal)return{cx:cx+side,cy,cw:cw-side,ch};return{cx,cy:cy+side,cw,ch:ch-side}}
function layoutSlice(children,total,bx,by,bw,bh){let offset=0;for(const child of children){const frac=child.value/total;const cellH=bh*frac;squarify(child,bx,by+offset,bw,cellH);offset+=cellH}}
function layoutBinary(children,total,bx,by,bw,bh){if(children.length<=1){if(children[0])squarify(children[0],bx,by,bw,bh);return}
let halfValue=total/2,sum=0,splitIdx=0;for(let i=0;i<children.length;i++){sum+=children[i].value;if(sum>=halfValue){splitIdx=i+1;break}}
splitIdx=Math.max(1,Math.min(children.length-1,splitIdx));const left=children.slice(0,splitIdx);const right=children.slice(splitIdx);const leftTotal=left.reduce((s,c)=>s+c.value,0);const rightTotal=right.reduce((s,c)=>s+c.value,0);if(bw>=bh){const leftW=bw*(leftTotal/total);layoutBinary(left,leftTotal,bx,by,leftW,bh);layoutBinary(right,rightTotal,bx+leftW,by,bw-leftW,bh)}else{const leftH=bh*(leftTotal/total);layoutBinary(left,leftTotal,bx,by,bw,leftH);layoutBinary(right,rightTotal,bx,by+leftH,bw,bh-leftH)}}
squarify(root,x,y,w,h);return result}
function sunburstLayout(root,cx,cy,outerRadius,innerRadius,maxDepth=4){const result=[];const ringWidth=(outerRadius-innerRadius)/maxDepth;function walk(node,sa,ea,depth){if(depth>maxDepth)return;const innerR=innerRadius+(depth-1)*ringWidth;const outerR=innerRadius+depth*ringWidth;if(depth>0){result.push({id:node.id,startAngle:sa,endAngle:ea,
innerR,outerR,value:node.value,depth,
data:node.data,cx,cy})}
if(!node.children.length)return;const total=node.children.reduce((s,c)=>s+c.value,0)||1;let angle=sa;for(const child of node.children){const sweep=(child.value/total)*(ea-sa);walk(child,angle,angle+sweep,depth+1);angle+=sweep}}
walk(root,-Math.PI/2,Math.PI*3/2,0);return result}
function sankeyLayout(nodes,links,width,height,opts={}){const nodeWidth=opts.nodeWidth||20;const nodePadding=opts.nodePadding||12;const iterations=opts.iterations||32;const nodeMap=new Map();for(const n of nodes){const node=typeof n==='string'?{id:n,label:n}:n;nodeMap.set(node.id,{...node,sourceLinks:[],targetLinks:[],value:0,x:0,y:0,dy:0})}
const processedLinks=links.map(l=>({source:nodeMap.get(l.source),target:nodeMap.get(l.target),
value:l.value,sy:0,ty:0,dy:0}));for(const l of processedLinks){if(l.source)l.source.sourceLinks.push(l);if(l.target)l.target.targetLinks.push(l)}
for(const[,n]of nodeMap){const srcVal=n.sourceLinks.reduce((s,l)=>s+l.value,0);const tgtVal=n.targetLinks.reduce((s,l)=>s+l.value,0);n.value=Math.max(srcVal,tgtVal)}
const allNodes=[...nodeMap.values()];const roots=allNodes.filter(n=>n.targetLinks.length===0);const visited=new Set();const queue=roots.map(n=>({node:n,col:0}));let maxCol=0; while(queue.length){const{node,col}=queue.shift();if(visited.has(node.id))continue;visited.add(node.id);node.col=col;if(col>maxCol)maxCol=col;for(const l of node.sourceLinks){if(l.target&&!visited.has(l.target.id)){queue.push({node:l.target,col:col+1})}}}
const colWidth=maxCol>0?(width-nodeWidth)/maxCol:0;for(const n of allNodes)n.x=n.col*colWidth;const cols=new Map();for(const n of allNodes){if(!cols.has(n.col))cols.set(n.col,[]);cols.get(n.col).push(n)}
const totalValue=Math.max(...allNodes.map(n=>n.value),1);for(const[,col]of cols){const colTotal=col.reduce((s,n)=>s+n.value,0);const scale=(height-(col.length-1)*nodePadding)/(colTotal||1);let y=0;for(const n of col){n.y=y;n.dy=Math.max(1,n.value*scale);y+=n.dy+nodePadding}}
for(let iter=0;iter<iterations;iter++){for(const n of allNodes){if(n.targetLinks.length){let sum=0,weight=0;for(const l of n.targetLinks){sum+=(l.source.y+l.sy+l.dy/2)*l.value;weight+=l.value}
if(weight)n.y=sum/weight-n.dy/2}}
for(const[,col]of cols){col.sort((a,b)=>a.y-b.y);let y=0;for(const n of col){if(n.y<y)n.y=y;y=n.y+n.dy+nodePadding}
const overflow=y-nodePadding-height;if(overflow>0){for(let i=col.length-1;i>=0;i--){col[i].y=Math.max(0,col[i].y-overflow*((i+1)/col.length))}}}}
for(const n of allNodes){n.sourceLinks.sort((a,b)=>a.target.y-b.target.y);n.targetLinks.sort((a,b)=>a.source.y-b.source.y);let sy=0,ty=0;for(const l of n.sourceLinks){const scale=n.dy/(n.value||1);l.sy=sy;l.dy=l.value*scale;sy+=l.dy}
for(const l of n.targetLinks){const scale=n.dy/(n.value||1);l.ty=ty;l.dy=l.dy||l.value*scale;ty+=l.value*scale}}
return{nodes:allNodes.map(n=>({id:n.id,label:n.label||n.id,x:n.x,y:n.y,w:nodeWidth,h:n.dy,value:n.value,data:n})),
links:processedLinks.map(l=>({source:l.source,target:l.target,value:l.value,
x0:l.source.x+nodeWidth,y0:l.source.y+l.sy+l.dy/2,
x1:l.target.x,y1:l.target.y+l.ty+l.dy/2,
width:Math.max(1,l.dy)}))}}
function chordLayout(matrix,labels,cx,cy,outerR,innerR){const n=matrix.length;const totals=matrix.map(row=>row.reduce((s,v)=>s+v,0));const grandTotal=totals.reduce((s,v)=>s+v,0)||1;const padAngle=0.04;const totalAngle=Math.PI*2-padAngle*n;const arcs=[];let angle=0;for(let i=0;i<n;i++){const sweep=(totals[i]/grandTotal)*totalAngle;arcs.push({index:i,label:labels[i]||`${i}`,
startAngle:angle,endAngle:angle+sweep,
value:totals[i],cx,cy,innerR,outerR});angle+=sweep+padAngle}
const ribbons=[];const sourceOffsets=new Array(n).fill(0);const targetOffsets=new Array(n).fill(0);for(let i=0;i<n;i++){for(let j=0;j<n;j++){if(matrix[i][j]<=0)continue;const value=matrix[i][j];const srcStart=arcs[i].startAngle+(sourceOffsets[i]/(totals[i]||1))*(arcs[i].endAngle-arcs[i].startAngle);const srcEnd=srcStart+(value/(totals[i]||1))*(arcs[i].endAngle-arcs[i].startAngle);const tgtStart=arcs[j].startAngle+(targetOffsets[j]/(totals[j]||1))*(arcs[j].endAngle-arcs[j].startAngle);const tgtEnd=tgtStart+(value/(totals[j]||1))*(arcs[j].endAngle-arcs[j].startAngle);ribbons.push({source:{index:i,startAngle:srcStart,endAngle:srcEnd},
target:{index:j,startAngle:tgtStart,endAngle:tgtEnd},
value,cx,cy,r:innerR});sourceOffsets[i]+=value;targetOffsets[j]+=value}}
return{arcs,ribbons}}
function walkerLayout(root,width,height,orientation='top-down',opts={}){const nodeWidth=opts.nodeWidth||120;const nodeHeight=opts.nodeHeight||60;const siblingGap=opts.siblingGap||24;const levelGap=opts.levelGap||80;function firstWalk(node){if(!node.children.length){node._x=0;return}
for(const child of node.children)firstWalk(child);const firstChild=node.children[0];const lastChild=node.children[node.children.length-1];node._x=(firstChild._x+lastChild._x)/2}
function spreadSiblings(nodes){for(let i=1;i<nodes.length;i++){const gap=nodes[i]._x-nodes[i-1]._x;if(gap<nodeWidth+siblingGap){const shift=nodeWidth+siblingGap-gap;for(let j=i;j<nodes.length;j++){nodes[j]._x+=shift}}}}
const levels=[];function collectLevels(node,depth){if(!levels[depth])levels[depth]=[];levels[depth].push(node);for(const child of node.children)collectLevels(child,depth+1)}
firstWalk(root);collectLevels(root,0);for(const level of levels)spreadSiblings(level);for(let d=levels.length-2;d>=0;d--){for(const node of levels[d]){if(node.children.length){const first=node.children[0];const last=node.children[node.children.length-1];node._x=(first._x+last._x)/2}}}
let minX=Infinity,maxX=-Infinity;for(const level of levels){for(const n of level){if(n._x<minX)minX=n._x;if(n._x>maxX)maxX=n._x}}
const treeWidth=maxX-minX+nodeWidth;const treeHeight=levels.length*(nodeHeight+levelGap)-levelGap;const scaleX=Math.min(1,(width-40)/(treeWidth||1));const scaleY=Math.min(1,(height-40)/(treeHeight||1));const offsetX=(width-treeWidth*scaleX)/2-minX*scaleX;const offsetY=20;const resultNodes=[];const edges=[];function buildOutput(node,depth){let nx,ny;if(orientation==='left-right'){nx=offsetY+depth*(nodeHeight+levelGap)*scaleY;ny=offsetX+node._x*scaleX}else{nx=offsetX+node._x*scaleX;ny=offsetY+depth*(nodeHeight+levelGap)*scaleY}
resultNodes.push({id:node.id,x:nx,y:ny,w:nodeWidth*scaleX,h:nodeHeight*scaleY,
value:node.value,depth,data:node.data,children:node.children});for(const child of node.children){const cn=buildOutput(child,depth+1);edges.push({x0:orientation==='left-right'?nx+nodeHeight*scaleY:nx+nodeWidth*scaleX/2,
y0:orientation==='left-right'?ny+nodeWidth*scaleX/2:ny+nodeHeight*scaleY,
x1:orientation==='left-right'?cn.x:cn.x+nodeWidth*scaleX/2,
y1:orientation==='left-right'?cn.y+nodeWidth*scaleX/2:cn.y,
source:node.id,target:child.id})}
return{x:nx,y:ny}}
buildOutput(root,0);return{nodes:resultNodes,edges}}
return{buildHierarchy,treemapLayout,sunburstLayout,sankeyLayout,chordLayout,walkerLayout}})();const _m140=(function(){const{scene,group,rect,text}=_m152;const{buildHierarchy,treemapLayout}=_m155;const{chartColor,MARGINS}=_m146;const{resolve}=_m119;function layoutTreemap(spec,width,height){const data=resolve(spec.data);const idField=spec.id||'id';const parentField=spec.parent||'parent';const valueField=spec.value||(Array.isArray(spec.y)?spec.y[0]:(spec.y!=='y'?spec.y:null))||'value';const labelField=spec.label||spec.x||idField;const tile=spec.tile||'squarify';const margins={top:8,right:8,bottom:8,left:8};const innerW=width-margins.left-margins.right;const innerH=height-margins.top-margins.bottom;const root=buildHierarchy(data,idField,parentField,valueField);const rects=treemapLayout(root,0,0,innerW,innerH,tile);const children=[];const maxDepth=Math.max(...rects.map(r=>r.depth),1);for(const r of rects){if(r.w<2||r.h<2)continue;const color=chartColor(r.depth%8);const opacity=r.depth===0?0:0.3+0.4*(1-r.depth/maxDepth);children.push(rect({x:r.x,y:r.y,w:r.w,h:r.h,
rx:2,fill:color,opacity,
stroke:'var(--d-bg)',strokeWidth:2,
class:'d-chart-bar',
data:{label:r.data?.[labelField]||r.id,
value:r.value,series:'treemap'},
key:`treemap-${r.id}`}));if(r.w>40&&r.h>20&&r.children&&r.data){children.push(text({x:r.x+4,y:r.y+14,
content:r.data[labelField]||r.id,
anchor:'start',fill:'var(--d-fg)',
fontSize:'var(--d-text-xs)'}))}}
return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'treemap',rects,margins,innerW,innerH,dataLength:data.length})}
return{layoutTreemap}})();const _m141=(function(){const{scene,arc,text}=_m152;const{buildHierarchy,sunburstLayout}=_m155;const{polar,polarPoint}=_m154;const{chartColor,MARGINS_NONE}=_m146;const{resolve}=_m119;function layoutSunburst(spec,width,height){const data=resolve(spec.data);const idField=spec.id||'id';const parentField=spec.parent||'parent';const valueField=spec.value||(Array.isArray(spec.y)?spec.y[0]:(spec.y!=='y'?spec.y:null))||'value';const labelField=spec.label||spec.x||idField;const maxDepth=spec.maxDepth||4;const coords=polar(width,height,{innerRadiusRatio:0.15,padding:16});const{cx,cy,radius,innerRadius}=coords;const root=buildHierarchy(data,idField,parentField,valueField);const segments=sunburstLayout(root,cx,cy,radius,innerRadius,maxDepth);const children=[];const series=[];for(const seg of segments){const color=chartColor((seg.depth-1)%8);const opacity=0.4+0.5*(1-(seg.depth-1)/maxDepth);children.push(arc({cx:seg.cx,cy:seg.cy,
innerR:seg.innerR,outerR:seg.outerR,
startAngle:seg.startAngle,endAngle:seg.endAngle,
fill:color,opacity,class:'d-chart-slice',
data:{label:seg.data?.[labelField]||seg.id,
value:seg.value,series:'sunburst',
ariaLabel:`${seg.data?.[labelField] || seg.id}: ${seg.value}`},
key:`sunburst-${seg.id}`}));const angleSpan=seg.endAngle-seg.startAngle;if(angleSpan>0.3&&seg.outerR-seg.innerR>20){const midAngle=(seg.startAngle+seg.endAngle)/2;const midR=(seg.innerR+seg.outerR)/2;const pt=polarPoint(cx,cy,midR,midAngle);children.push(text({x:pt.x,y:pt.y+4,
content:String(seg.data?.[labelField]||seg.id).slice(0,10),
anchor:'middle',fill:'var(--d-fg)',
fontSize:'var(--d-text-xs)'}))}
series.push({key:seg.id,color})}
return scene(width,height,children,{type:'sunburst',series,segments,
margins:MARGINS_NONE,innerW:width,innerH:height,
cx,cy,radius,innerRadius,dataLength:data.length})}
return{layoutSunburst}})();const _m142=(function(){const{scene,group,rect,path,text}=_m152;const{sankeyLayout}=_m155;const{chartColor,MARGINS}=_m146;const{resolve}=_m119;function layoutSankey(spec,width,height){const rawData=resolve(spec.data);const nodes=resolve(spec.nodes)||(rawData&&rawData.nodes)||(Array.isArray(rawData)?rawData:[]);const links=resolve(spec.links)||(rawData&&rawData.links)||[];const margins={top:16,right:16,bottom:16,left:16};const innerW=width-margins.left-margins.right;const innerH=height-margins.top-margins.bottom;const layout=sankeyLayout(nodes,links,innerW,innerH,{nodeWidth:spec.nodeWidth||20,
nodePadding:spec.nodePadding||12,
iterations:32});const children=[];const series=[];for(let i=0;i<layout.links.length;i++){const l=layout.links[i];const curvature=0.5;const xi=l.x0+(l.x1-l.x0)*curvature;const d=`M${l.x0},${l.y0}C${xi},${l.y0},${xi},${l.y1},${l.x1},${l.y1}`;children.push(path({d,stroke:chartColor(i%8),strokeWidth:Math.max(1,l.width),
opacity:0.4,strokeLinecap:'butt',
class:'d-chart-line',
data:{label:`${l.source.id} → ${l.target.id}`,value:l.value,series:'sankey-link'},
key:`sankey-link-${i}`}))}
for(let i=0;i<layout.nodes.length;i++){const n=layout.nodes[i];const color=chartColor(i%8);children.push(rect({x:n.x,y:n.y,w:n.w,h:Math.max(1,n.h),
fill:color,class:'d-chart-bar',
data:{label:n.label,value:n.value,series:'sankey-node'},
key:`sankey-node-${n.id}`}));const labelX=n.x<innerW/2?n.x+n.w+6:n.x-6;const anchor=n.x<innerW/2?'start':'end';children.push(text({x:labelX,y:n.y+n.h/2+4,
content:n.label,anchor,
class:'d-chart-axis',fontSize:'var(--d-text-xs)'}));series.push({key:n.label,color})}
return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'sankey',series,layout,margins,innerW,innerH,dataLength:nodes.length})}
return{layoutSankey}})();const _m143=(function(){const{scene,arc,path,text}=_m152;const{chordLayout}=_m155;const{polar,polarPoint}=_m154;const{chartColor,MARGINS_NONE}=_m146;const{arcToPath}=_m152;const{resolve}=_m119;function layoutChord(spec,width,height){const rawData=resolve(spec.data);const matrix=resolve(spec.matrix)||(rawData&&rawData.matrix)||(Array.isArray(rawData)?rawData:[]);const labels=resolve(spec.labels)||(rawData&&rawData.labels)||[];const coords=polar(width,height,{padding:40});const{cx,cy,radius}=coords;const outerR=radius;const innerR=radius*0.9;const ribbonR=innerR*0.95;const layout=chordLayout(matrix,labels,cx,cy,outerR,innerR);const children=[];const series=[];for(const a of layout.arcs){const color=chartColor(a.index%8);children.push(arc({cx,cy,innerR,outerR,
startAngle:a.startAngle,endAngle:a.endAngle,
fill:color,class:'d-chart-slice',
data:{label:a.label,value:a.value,series:a.label,
ariaLabel:`${a.label}: ${a.value}`},
key:`chord-arc-${a.index}`}));const midAngle=(a.startAngle+a.endAngle)/2;const pt=polarPoint(cx,cy,outerR+14,midAngle);children.push(text({x:pt.x,y:pt.y+4,
content:a.label,anchor:pt.x>cx?'start':'end',
class:'d-chart-axis',fontSize:'var(--d-text-xs)'}));series.push({key:a.label,color})}
for(let i=0;i<layout.ribbons.length;i++){const r=layout.ribbons[i];const color=chartColor(r.source.index%8);const s1=polarPoint(cx,cy,ribbonR,r.source.startAngle);const s2=polarPoint(cx,cy,ribbonR,r.source.endAngle);const t1=polarPoint(cx,cy,ribbonR,r.target.startAngle);const t2=polarPoint(cx,cy,ribbonR,r.target.endAngle);const d=`M${s1.x},${s1.y}`+
`A${ribbonR},${ribbonR},0,${r.source.endAngle - r.source.startAngle > Math.PI ? 1 : 0},1,${s2.x},${s2.y}`+
`Q${cx},${cy},${t1.x},${t1.y}`+
`A${ribbonR},${ribbonR},0,${r.target.endAngle - r.target.startAngle > Math.PI ? 1 : 0},1,${t2.x},${t2.y}`+
`Q${cx},${cy},${s1.x},${s1.y}Z`;children.push(path({d,fill:color,opacity:0.3,class:'d-chart-area',
data:{label:`${labels[r.source.index] || r.source.index} → ${labels[r.target.index] || r.target.index}`,
value:r.value,series:'chord-ribbon'},
key:`chord-ribbon-${i}`}))}
return scene(width,height,children,{type:'chord',series,layout,
margins:MARGINS_NONE,innerW:width,innerH:height,
cx,cy,radius,dataLength:matrix.length})}
return{layoutChord}})();const _m144=(function(){const{scene,group,rect,text,line}=_m152;const{chartColor,MARGINS}=_m146;const{resolve,groupBy,unique}=_m119;function layoutSwimlane(spec,width,height){const rawData=resolve(spec.data);const data=Array.isArray(rawData)?rawData:(rawData&&rawData.items)||[];const laneField=spec.lane||spec.x||'lane';const labelField=spec.label||spec.y||'label';const idField=spec.id||'id';const margins={top:40,right:8,bottom:8,left:8};const innerW=width-margins.left-margins.right;const innerH=height-margins.top-margins.bottom;const lanesDef=rawData&&rawData.lanes;const lanes=lanesDef?lanesDef.map(l=>typeof l==='string'?l:l.label||l.id):unique(data,laneField);const laneIds=lanesDef?lanesDef.map(l=>typeof l==='string'?l:l.id):lanes;const laneW=innerW/(lanes.length||1);const cardPad=8;const cardH=36;const headerH=28;const children=[];for(let li=0;li<lanes.length;li++){const laneName=lanes[li];const lx=li*laneW;const color=chartColor(li);children.push(rect({x:lx+2,y:0,w:laneW-4,h:innerH,
rx:4,fill:color,opacity:0.05,
key:`lane-bg-${li}`}));if(li>0){children.push(line({x1:lx,y1:0,x2:lx,y2:innerH,stroke:'var(--d-border)',strokeWidth:1}))}
children.push(text({x:lx+laneW/2,y:headerH/2+4,
content:String(laneName),anchor:'middle',
fill:'var(--d-fg)',fontSize:'var(--d-text-sm)',
fontWeight:'var(--d-fw-title)'}));const laneId=laneIds[li];const laneData=data.filter(d=>d[laneField]===laneId||d[laneField]===laneName);for(let ci=0;ci<laneData.length;ci++){const d=laneData[ci];const cy=headerH+cardPad+ci*(cardH+cardPad);children.push(rect({x:lx+cardPad,y:cy,w:laneW-cardPad*2,h:cardH,
rx:4,fill:'var(--d-surface-1)',stroke:'var(--d-border)',strokeWidth:1,
class:'d-chart-bar',
data:{label:d[labelField]||d[idField],value:laneName,series:'swimlane'},
key:`card-${d[idField] || `${li}-${ci}`}`}));children.push(text({x:lx+cardPad+8,y:cy+cardH/2+4,
content:String(d[labelField]||d[idField]||'').slice(0,25),
anchor:'start',fill:'var(--d-fg)',
fontSize:'var(--d-text-xs)'}))}}
const series=lanes.map((l,i)=>({key:l,color:chartColor(i)}));return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'swimlane',series,lanes,margins,innerW,innerH,dataLength:data.length})}
return{layoutSwimlane}})();const _m145=(function(){const{scene,group,rect,text,path}=_m152;const{buildHierarchy,walkerLayout}=_m155;const{chartColor,MARGINS}=_m146;const{resolve}=_m119;function layoutOrgChart(spec,width,height){const data=resolve(spec.data);const idField=spec.id||'id';const parentField=spec.parent||'parent';const labelField=spec.label||spec.x||'label';const valueField=spec.y||'value';const orientation=spec.orientation||'top-down';const margins={top:16,right:16,bottom:16,left:16};const innerW=width-margins.left-margins.right;const innerH=height-margins.top-margins.bottom;const root=buildHierarchy(data,idField,parentField,valueField);const layout=walkerLayout(root,innerW,innerH,orientation,{nodeWidth:spec.nodeWidth||120,
nodeHeight:spec.nodeHeight||50,
siblingGap:16,
levelGap:60});const children=[];for(const edge of layout.edges){const midY=(edge.y0+edge.y1)/2;let d;if(orientation==='left-right'){const midX=(edge.x0+edge.x1)/2;d=`M${edge.x0},${edge.y0}C${midX},${edge.y0},${midX},${edge.y1},${edge.x1},${edge.y1}`}else{d=`M${edge.x0},${edge.y0}C${edge.x0},${midY},${edge.x1},${midY},${edge.x1},${edge.y1}`}
children.push(path({d,stroke:'var(--d-border)',strokeWidth:1.5,
class:'d-chart-line',key:`org-edge-${edge.source}-${edge.target}`}))}
for(const n of layout.nodes){const color=chartColor(n.depth%8);const nodeData=n.data;children.push(rect({x:n.x,y:n.y,w:n.w,h:n.h,
rx:6,fill:color,opacity:0.15,
stroke:color,strokeWidth:1.5,
class:'d-chart-bar',
data:{label:nodeData?.[labelField]||n.id,
value:n.value,series:'org-chart'},
key:`org-node-${n.id}`}));const label=String(nodeData?.[labelField]||n.id).slice(0,18);children.push(text({x:n.x+n.w/2,y:n.y+n.h/2+4,
content:label,anchor:'middle',fill:'var(--d-fg)',
fontSize:'var(--d-text-xs)',fontWeight:'var(--d-fw-title)'}));if(n.children&&n.children.length>0){children.push(text({x:n.x+n.w-12,y:n.y+14,
content:`(${n.children.length})`,anchor:'middle',
fill:'var(--d-muted)',fontSize:'8px'}))}}
const series=layout.nodes.map(n=>({key:n.data?.[labelField]||n.id,
color:chartColor(n.depth%8)}));return scene(width,height,[
group({transform:`translate(${margins.left},${margins.top})`},children)
],{type:'org-chart',series,layout,margins,innerW,innerH,dataLength:data.length})}
return{layoutOrgChart}})();const _m17=(function(){const{createEffect,createSignal}=_m14;const{getAnimations}=_m13;const{injectChartBase}=_m118;const{resolve}=_m119;const{render}=_m120;const{layoutLine}=_m121;const{layoutBar}=_m122;const{layoutArea}=_m123;const{layoutPie}=_m124;const{layoutSparkline}=_m125;const{layoutScatter}=_m126;const{layoutBubble}=_m127;const{layoutHistogram}=_m128;const{layoutBoxPlot}=_m129;const{layoutCandlestick}=_m130;const{layoutWaterfall}=_m131;const{layoutRangeBar}=_m132;const{layoutRangeArea}=_m133;const{layoutHeatmap}=_m134;const{layoutCombination}=_m135;const{layoutRadar}=_m136;const{layoutRadial}=_m137;const{layoutGauge}=_m138;const{layoutFunnel}=_m139;const{layoutTreemap}=_m140;const{layoutSunburst}=_m141;const{layoutSankey}=_m142;const{layoutChord}=_m143;const{layoutSwimlane}=_m144;const{layoutOrgChart}=_m145;const LAYOUT_MAP={line:layoutLine,
bar:layoutBar,
area:layoutArea,
pie:layoutPie,
scatter:layoutScatter,
bubble:layoutBubble,
histogram:layoutHistogram,
'box-plot':layoutBoxPlot,
candlestick:layoutCandlestick,
waterfall:layoutWaterfall,
'range-bar':layoutRangeBar,
'range-area':layoutRangeArea,
heatmap:layoutHeatmap,
combination:layoutCombination,
radar:layoutRadar,
radial:layoutRadial,
gauge:layoutGauge,
funnel:layoutFunnel,
treemap:layoutTreemap,
sunburst:layoutSunburst,
sankey:layoutSankey,
chord:layoutChord,
swimlane:layoutSwimlane,
'org-chart':layoutOrgChart};const DEFAULTS={type:'line',
tooltip:true,
legend:true,
grid:true,
stacked:false,
animate:true,
renderer:'auto',
height:'300px',
donut:true,
tableAlt:true};function chartSpec(overrides={}){const spec={...DEFAULTS,...overrides};if(!spec.data)spec.data=[];if(!spec.x&&spec.type!=='sparkline')spec.x='x';if(!spec.y&&spec.type!=='sparkline')spec.y='y';return spec}
function Chart(specInput){injectChartBase();const spec=chartSpec(specInput);const container=document.createElement('div');container.className='d-chart'+(spec.class?' '+spec.class:'');container.setAttribute('role','img');if(spec['aria-label'])container.setAttribute('aria-label',spec['aria-label']); else if(spec.title)container.setAttribute('aria-label',spec.title);const heightStr=spec.height||'300px';const heightPx=parseInt(heightStr,10)||300;if(spec.title){const titleEl=document.createElement('div');titleEl.className='d-chart-title';titleEl.textContent=resolve(spec.title);container.appendChild(titleEl)}
const inner=document.createElement('div');inner.className='d-chart-inner';inner.style.height=heightStr;container.appendChild(inner);const layoutFn=LAYOUT_MAP[spec.type];if(!layoutFn){inner.textContent=`Unknown chart type: ${spec.type}`;return container}
let currentLegend=null;const isReactive=typeof specInput.data==='function';function renderChart(){const width=inner.offsetWidth||600;const height=heightPx;const resolvedSpec={...spec,data:resolve(spec.data)};const sceneGraph=layoutFn(resolvedSpec,width,height);const svgEl=render(sceneGraph,spec);inner.textContent='';inner.appendChild(svgEl);if(currentLegend){currentLegend.remove();currentLegend=null}
const meta=sceneGraph.meta||{};if(spec.legend!==false&&meta.series){currentLegend=buildLegend(meta.series,spec);container.appendChild(currentLegend)}
if(spec.tooltip){attachTooltip(inner,svgEl,meta,spec)}
if(spec.onClick){attachClickHandler(svgEl,meta,spec)}}
if(isReactive){createEffect(()=>{resolve(specInput.data);renderChart()})}else{requestAnimationFrame(renderChart)}
if(spec.tableAlt){const details=document.createElement('details');const summary=document.createElement('summary');summary.className='d-chart-sr';summary.textContent='View data table';details.appendChild(summary);details.addEventListener('toggle',()=>{if(details.open&&!details.querySelector('table')){details.appendChild(buildDataTable(spec))}});container.appendChild(details)}
return container}
function Sparkline(specInput){injectChartBase();const spec={...specInput};const heightPx=parseInt(spec.height||'32',10)||32;const widthPx=parseInt(spec.width||'120',10)||120;const container=document.createElement('span');container.className='d-chart-spark'+(spec.class?' '+spec.class:'');container.setAttribute('role','img');container.setAttribute('aria-label',spec['aria-label']||'Sparkline');const isReactive=typeof specInput.data==='function';function renderSpark(){const data=resolve(spec.data);const sceneGraph=layoutSparkline({...spec,data},widthPx,heightPx);const svgEl=render(sceneGraph,{renderer:'svg'});container.textContent='';container.appendChild(svgEl)}
if(isReactive){createEffect(()=>{resolve(specInput.data);renderSpark()})}else{renderSpark()}
return container}
function createStream(opts={}){const maxPoints=opts.maxPoints||500;const buffer=[];const[data,setData]=createSignal([]);function append(point){if(Array.isArray(point)){buffer.push(...point)}else{buffer.push(point)} while(buffer.length>maxPoints)buffer.shift();setData([...buffer])}
function window(start,end){return buffer.slice(start,end)}
function destroy(){buffer.length=0;setData([])}
return{append,data,window,destroy}}
function colorScale(domain,stops){if(!stops||stops.length<2)return()=>stops?.[0]||'#000';const segments=stops.length-1;return function(value){const t=Math.max(0,Math.min(1,(value-domain[0])/((domain[domain.length-1]||1)-domain[0])));const seg=Math.min(Math.floor(t*segments),segments-1);const localT=(t*segments)-seg;return interpolateHex(stops[seg],stops[seg+1],localT)}}
function interpolateHex(hex1,hex2,t){const r1=parseInt(hex1.slice(1,3),16),g1=parseInt(hex1.slice(3,5),16),b1=parseInt(hex1.slice(5,7),16);const r2=parseInt(hex2.slice(1,3),16),g2=parseInt(hex2.slice(3,5),16),b2=parseInt(hex2.slice(5,7),16);const r=Math.round(r1+(r2-r1)*t);const g=Math.round(g1+(g2-g1)*t);const b=Math.round(b1+(b2-b1)*t);return'#'+[r,g,b].map(c=>Math.max(0,Math.min(255,c)).toString(16).padStart(2,'0')).join('')}
function resolvePalette(count,el){const colors=[];const target=el||document.documentElement;const style=typeof getComputedStyle==='function'?getComputedStyle(target):null;for(let i=0;i<count;i++){const prop=i<8?`--d-chart-${i}`:`--d-chart-${i % 8}-ext-${Math.floor((i - 8) / 8) + 1}`;let color=style?style.getPropertyValue(prop).trim():'';if(!color)color=FALLBACK_COLORS[i%FALLBACK_COLORS.length];colors.push(color)}
return colors}
const FALLBACK_COLORS=['#1366D9','#7c3aed','#0891b2','#22c55e','#f59e0b','#ef4444','#3b82f6','#71717a'];function buildLegend(series,spec){const legend=document.createElement('div');legend.className='d-chart-legend';for(const s of series){const item=document.createElement('span');item.className='d-chart-legend-item';const swatch=document.createElement('span');swatch.className='d-chart-legend-swatch';swatch.style.background=s.color;item.appendChild(swatch);item.appendChild(document.createTextNode(s.key));let disabled=false;item.addEventListener('click',()=>{disabled=!disabled;item.classList.toggle('d-chart-legend-disabled',disabled);if(spec.onLegendToggle){spec.onLegendToggle({series:s.key,visible:!disabled})}});legend.appendChild(item)}
return legend}
function attachTooltip(inner,svgEl,meta,spec){const tooltip=document.createElement('div');tooltip.className='d-chart-tooltip';inner.appendChild(tooltip);const elements=svgEl.querySelectorAll('[data-series],[data-label]');for(const el of elements){el.addEventListener('mouseenter',()=>{const value=el.getAttribute('data-value')||'';const label=el.getAttribute('data-label')||el.getAttribute('data-series')||'';if(typeof spec.tooltip==='function'){tooltip.textContent='';const result=spec.tooltip({label,value,element:el});if(typeof result==='string')tooltip.textContent=result; else if(result)tooltip.appendChild(result)}else{tooltip.textContent=label+(value?': '+value:'')}
tooltip.classList.add('d-chart-tooltip-visible')});el.addEventListener('mousemove',(e)=>{const r=inner.getBoundingClientRect();tooltip.style.left=(e.clientX-r.left+12)+'px';tooltip.style.top=(e.clientY-r.top-8)+'px'});el.addEventListener('mouseleave',()=>{tooltip.classList.remove('d-chart-tooltip-visible')})}}
function attachClickHandler(svgEl,meta,spec){const elements=svgEl.querySelectorAll('[data-series],[data-label]');for(const el of elements){el.style.cursor='pointer';el.addEventListener('click',(e)=>{const series=el.getAttribute('data-series')||'';const value=el.getAttribute('data-value')||'';const label=el.getAttribute('data-label')||'';spec.onClick({point:{label,value},series,event:e})})}}
function buildDataTable(spec){const data=resolve(spec.data);if(!data||!data.length)return document.createTextNode('No data');const table=document.createElement('table');table.className='d-chart-table';const fields=[spec.x,...(Array.isArray(spec.y)?spec.y:[spec.y])].filter(Boolean);const thead=document.createElement('thead');const headerRow=document.createElement('tr');for(const f of fields){const th=document.createElement('th');th.textContent=f;headerRow.appendChild(th)}
thead.appendChild(headerRow);table.appendChild(thead);const tbody=document.createElement('tbody');for(const row of data){const tr=document.createElement('tr');for(const f of fields){const td=document.createElement('td');td.textContent=row[f]!=null?String(row[f]):'';tr.appendChild(td)}
tbody.appendChild(tr)}
table.appendChild(tbody);return table}
const{chartColor,PALETTE_SIZE}=_m146;const{registerRenderer}=_m120;return{chartSpec,Chart,Sparkline,createStream,colorScale,resolvePalette,chartColor,PALETTE_SIZE,registerRenderer}})();const _m9=(function(){const{css}=_m1;const{tags}=_m3;const{icon}=_m16;const{Chart}=_m17;const{section,div,h2,h3,p,span,blockquote,small}=tags;const runtimeData=[
{framework:'Angular',kb:90},
{framework:'React',kb:42},
{framework:'Vue',kb:33},
{framework:'Svelte',kb:7},
{framework:'Decantr',kb:0},
];const tokenData=[
{task:'Form',react:298,decantr:313},
{task:'Dashboard',react:506,decantr:259},
{task:'Full App',react:1415,decantr:611},
];const scaffoldData=[
{framework:'Decantr',files:6,deps:1,configs:1},
{framework:'React+Vite',files:17,deps:10,configs:4},
{framework:'Vue+Vite',files:15,deps:8,configs:4},
{framework:'Angular',files:28,deps:18,configs:7},
];function MetricRow({stat,statColor,label,description,footnote,visual,reverse,delay}){const textSide=div({class:css('_flex _col _gap4 _jcc'),style:'flex:1;min-width:280px'},
span({class:'ds-stat',style:`color:${statColor || 'var(--d-accent)'}`},stat),
h3({class:css('_textxl _fwheading'),style:'color:var(--d-fg)'},label),
p({class:css('_textbase _lhrelaxed'),style:'color:var(--d-muted-fg)'},description),
footnote?small({class:css('_textsm'),style:'color:rgba(255,255,255,0.35);font-style:italic'},footnote):null,
);const chartSide=div({class:css('_flex _aic _jcc'),style:'flex:1;min-width:280px'},visual);const divider=div({style:'width:1px;background:linear-gradient(to bottom,transparent,rgba(255,255,255,0.1),transparent);align-self:stretch;margin:0 0.5rem;flex-shrink:0'});return div({class:`ds-glass ds-animate ds-delay-${delay} ${css('_flex _row _wrap _gap6 _p8 _aic')}`,style:'width:100%'},
...(reverse?[chartSide,divider,textSide]:[textSide,divider,chartSide]),
)}
function PillarCard({iconName,title,description,delay}){return div({class:`ds-glass ds-animate ds-delay-${delay} ${css('_flex _col _gap4 _p8')}`},
div({style:'color:var(--d-accent);background:rgba(10,243,235,0.1);padding:0.75rem;border-radius:var(--d-radius-lg);display:inline-flex;align-self:flex-start'},
icon(iconName,{size:'28px'}),
),
h3({class:css('_textxl _fwheading'),style:'color:var(--d-fg)'},title),
p({class:css('_textbase _lhrelaxed'),style:'color:var(--d-muted-fg)'},description),
)}
function PhilosophySection(){return section({class:`ds-section ds-reveal ${css('_flex _col _aic')}`},
div({class:'ds-orb',style:'width:500px;height:500px;background:rgba(10,243,235,0.06);top:20%;right:-15%'}),
div({class:'ds-orb',style:'width:400px;height:400px;background:rgba(101,0,198,0.08);bottom:10%;left:-10%'}),
div({class:css('_flex _col _aic _gap12 _relative _z10'),style:'max-width:1100px;width:100%'},
div({class:css('_flex _col _aic _gap4 _tc')},
h2({class:'ds-gradient-text ds-animate',style:'font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.03em;line-height:1.1'},
'The Decantr Way',
),
p({class:`ds-animate ds-delay-1 ${css('_textlg _lhrelaxed')}`,style:'color:var(--d-muted-fg);max-width:650px'},
'Designed for AI. Built for developers. Engineered for ',
span({style:'color:var(--d-fg);font-weight:600'},'world domination.'),
),
),
MetricRow({stat:'0',
statColor:'var(--d-success)',
label:'npm Dependencies',
description:'Decantr\'s package.json has zero entries in dependencies. No transitive deps, no supply chain risk, no version conflicts. Every byte is ours. The chart shows framework runtime overhead (min+gzip) — before you write a single line of code.',
footnote:'Runtime sizes from bundlephobia.com (min+gzip)',
delay:2,
reverse:false,
visual:Chart({type:'bar',
data:runtimeData,
x:'framework',
y:'kb',
height:'180px',
grid:false,
legend:false,
tooltip:true,
animate:true,
labels:true,
yFormat:v=>v===0?'0':`${v}KB`,
'aria-label':'Framework runtime size comparison — minified and gzipped',}),}),
MetricRow({stat:'57%',
statColor:'var(--d-accent)',
label:'Fewer Tokens (Full App)',
description:'We measured token counts for equivalent code: a full app with router, dashboard, KPI cards, data table, chart, and contact form. Decantr: 611 tokens. React + ecosystem: 1,415 tokens. The savings come from built-in kit components — Sidebar, DataTable, Chart — that React apps must build or import from third parties.',
footnote:'Measured: equivalent features, idiomatic code, ~4 chars/token',
delay:3,
reverse:true,
visual:Chart({type:'bar',
data:tokenData,
x:'task',
y:['react','decantr'],
height:'180px',
grid:false,
legend:true,
tooltip:true,
animate:true,
'aria-label':'Token count comparison — React vs Decantr for equivalent UI code',}),}),
MetricRow({stat:'1',
statColor:'var(--d-tertiary)',
label:'Dependency to Install',
description:'decantr init generates 6 files with 1 config. React+Vite scaffolds 17 files with 4 configs and 10 dependencies. Angular: 28 files, 7 configs, 18 dependencies. One npm install. One framework. Everything included.',
footnote:'Counted from each framework\'s official init/create CLI',
delay:4,
reverse:false,
visual:Chart({type:'bar',
data:scaffoldData,
x:'framework',
y:['files','deps','configs'],
height:'180px',
grid:false,
legend:true,
tooltip:true,
animate:true,
'aria-label':'Scaffold comparison — files, dependencies, and config files per framework',}),}),
div({class:css('_grid _gcaf300 _gap6'),style:'width:100%'},
PillarCard({iconName:'cpu',
title:'AI-First Architecture',
description:'Every API is optimized for token efficiency. Proxy-based tag functions eliminate string tag names. A machine-readable registry lets AI agents generate correct code without parsing source files. Decantr doesn\'t just support AI — it speaks AI natively.',
delay:5,}),
PillarCard({iconName:'shield',
title:'Zero Dependencies',
description:'No node_modules bloat. No supply chain vulnerabilities. No version conflicts at 3am. Every line of code is ours — audited, tested, and owned. When your framework has zero dependencies, your attack surface is zero.',
delay:6,}),
PillarCard({iconName:'layers',
title:'Systems Thinking',
description:'10 seed colors derive 170+ tokens. One style definition drives every component across every mode. Change a personality trait and the entire universe transforms — radius, shadows, motion, spacing, gradients. This is design at scale.',
delay:7,}),
),
div({class:`ds-glass-strong ds-animate ds-delay-8 ${css('_flex _col _aic _tc _p10 _gap6')}`,style:'width:100%'},
div({style:'width:60px;height:2px;background:var(--d-gradient-brand);border-radius:var(--d-radius-full)'}),
blockquote({style:'font-size:clamp(1.25rem,3vw,1.75rem);font-weight:600;line-height:1.4;color:var(--d-fg);max-width:800px;font-style:italic'},
'"The future of web development is AI-generated, human-curated, and zero-compromise. We didn\'t build another framework. We built the last one you\'ll ever need."',
),
div({style:'width:60px;height:2px;background:var(--d-gradient-brand);border-radius:var(--d-radius-full)'}),
),
div({class:`ds-animate ds-delay-9 ${css('_flex _col _aic _tc _gap3')}`},
p({class:css('_textlg'),style:'color:var(--d-muted-fg)'},'Something massive is coming.'),
p({class:'ds-gradient-text',style:'font-size:clamp(1.5rem,4vw,2.5rem);font-weight:800;letter-spacing:-0.02em'},
'Stay tuned.',
),
),
),
)}
return{PhilosophySection}})();const _m10=(function(){const{css}=_m1;const{tags}=_m3;const{icon}=_m16;const{footer,div,a,p,span,img}=tags;function SiteFooter(){return footer({class:css('_flex _col _aic _gap6 _py12 _px8'),style:'border-top:1px solid var(--d-border)'},
div({class:css('_flex _row _aic _gap4')},
img({src:'./images/logo.svg',alt:'decantr',style:'width:32px;height:auto'}),
span({style:'font-size:1.25rem;font-weight:700;letter-spacing:-0.02em;color:var(--d-fg)'},
'decantr',
span({class:'ds-pink'},'.'),
'ai',
),
),
div({class:css('_flex _row _aic _gap6')},
a({href:'https://github.com/decantr-ai/decantr',
target:'_blank',
rel:'noopener',
class:css('_flex _row _aic _gap2'),
style:'color:var(--d-muted-fg);text-decoration:none;font-size:0.875rem;transition:color 0.15s',
onmouseenter:(e)=>e.currentTarget.style.color='var(--d-accent)',
onmouseleave:(e)=>e.currentTarget.style.color='var(--d-muted-fg)',},
icon('code',{size:'16px'}),
'GitHub',
),
span({style:'color:var(--d-border-strong)'},'|'),
span({style:'color:var(--d-muted);font-size:0.875rem'},'Docs \u2014 Coming Soon'),
span({style:'color:var(--d-border-strong)'},'|'),
span({style:'color:var(--d-muted);font-size:0.875rem'},'Discord \u2014 Coming Soon'),
),
p({style:'color:var(--d-muted);font-size:0.75rem'},
'\u00A9 2026 decantr. AI-first web framework. Built with decantr.',
),
)}
return{SiteFooter}})();const _m0=(function(){const{setStyle,setMode,css}=_m1;const{mount}=_m2;const{tags}=_m3;const{docsSiteCSS}=_m4;const{HeroSection}=_m5;const{PowerSection}=_m6;const{FeaturesSection}=_m7;const{QuotesSection}=_m8;const{PhilosophySection}=_m9;const{SiteFooter}=_m10;setStyle('auradecantism');setMode('dark');const docsStyle=document.createElement('style');docsStyle.setAttribute('data-decantr-docs','');docsStyle.textContent=docsSiteCSS;document.head.appendChild(docsStyle);const{div}=tags;function App(){return div({class:css('_flex _col')},
HeroSection(),
PowerSection(),
FeaturesSection(),
QuotesSection(),
PhilosophySection(),
SiteFooter(),
)}
const root=document.getElementById('app');mount(root,App);root.classList.add('ds-ready');if(typeof IntersectionObserver!=='undefined'){const observer=new IntersectionObserver((entries)=>{entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add('ds-visible');observer.unobserve(entry.target)}})},{threshold:0.1,rootMargin:'0px 0px -50px 0px'});document.querySelectorAll('.ds-reveal').forEach((el)=>observer.observe(el))}
return{}})()})();
//# sourceMappingURL=./app.a35f86c2.js.map