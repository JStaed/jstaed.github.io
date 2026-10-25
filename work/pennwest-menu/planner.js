/* Edinboro Meal Planner. Menu data comes from data.js (regenerate it with update_menu.py). */
(function(){
/* Portion conversion: ounces -> things you can picture */
var FRAC_OPTS=[0,0.25,1/3,0.5,2/3,0.75,1], FRAC_SYM=['','¼','⅓','½','⅔','¾',''];
function fracNum(x){
  var w=Math.floor(x), f=x-w, bi=0, bd=9;
  for(var i=0;i<FRAC_OPTS.length;i++){var d=Math.abs(f-FRAC_OPTS[i]); if(d<bd){bd=d;bi=i}}
  if(bi===6){w+=1;bi=0}
  return {w:w, i:bi, v:w+FRAC_OPTS[bi]};
}
function fracText(x){var n=fracNum(x); if(n.w===0&&n.i===0) return '¼'; return (n.w?String(n.w):'')+FRAC_SYM[n.i]}
function plural(v){return v>1.001}
function tbspPart(cups){
  var t=cups*16;
  if(t<0.75){var s=Math.max(0.5,Math.round(t*3*2)/2); return {main:fmtHalf(s)+' tsp', cue:''}}
  var h=t<3.5?Math.max(1,Math.round(t*2)/2):Math.round(t);
  var cue=h<=1.5?'a thumb tip':(h<=2.5?'a ping-pong ball':'a golf ball');
  return {main:fmtHalf(h)+' tbsp', cue:cue};
}
function fmtHalf(x){var w=Math.floor(x), h=(x-w)>=0.5; if(w===0) return h?'½':'0'; return String(w)+(h?'½':'')}
function cupPart(cups){
  if(cups<0.22) return tbspPart(cups);
  var n=fracNum(cups), v=n.v, main=fracText(cups)+' '+(plural(v)?'cups':'cup'), cue;
  if(v<=0.34) cue='a golf ball'; else if(v<=0.58) cue='a tennis ball'; else if(v<=0.8) cue='a bit under a fist';
  else { var f=Math.round(v*2)/2; cue=(f===1?'1 fist':fmtHalf(f)+' fists'); }
  return {main:main,cue:cue};
}
function visual(v, oz, qty){
  qty=qty||1; var p=v.split(':'), k=p[0], total=oz*qty;
  if(k==='c') return cupPart(total/parseFloat(p[1]));
  if(k==='t') return cupPart(total/parseFloat(p[1])/16);
  if(k==='p'){var x=total/3; var n=fracNum(Math.max(x,0.25)); return {main:fracText(Math.max(x,0.25))+' '+(plural(n.v)?'palms':'palm'), cue:'a deck of cards'}}
  if(k==='w'){var nm=p[1].split('|'); return {main:fracText(qty)+' '+(plural(qty)?nm[1]:nm[0]), cue:''}}
  if(k==='n'){var nm2=p[1].split('|'), c=Math.max(1,Math.round(total/parseFloat(p[2]))); return {main:c+' '+(c===1?nm2[0]:nm2[1]), cue:''}}
  return {main:total.toFixed(1)+' oz',cue:''};
}



'use strict';
var D = window.MENU_DATA;

/* ---------- data ---------- */
var ITEMS = {};
D.I.forEach(function(r){
  ITEMS[r[0]] = {id:r[0],name:r[1],st:D.S[r[2]],oz:r[3],cal:r[4],fat:r[5],sat:r[6],trans:r[7],chol:r[8],sod:r[9],
    carb:r[10],fiber:r[11],sugar:r[12],added:r[13],prot:r[14],am:r[15],pm:r[16],v:r[17],desc:r[18]};
});
function bit(list,name){var i=list.indexOf(name);return i<0?0:(1<<i)}
var F = {vegan:bit(D.P,'Vegan'), veg:bit(D.P,'Vegetarian'), gs:bit(D.P,'Gluten Sensitive'), ng:bit(D.P,'NutriGOOD')};

/* Drinks and cereal. Values are label values from product listings and generic milk
   references, not from the dining hall. One serving = one can (12 oz), one glass of milk
   (1 cup, 8 fl oz) or one bowl measure of cereal (1 cup). */
function ex(id,kind,name,cal,fat,sat,chol,sod,carb,fiber,sugar,prot){
  return {id:id,kind:kind,name:name,cal:cal,fat:fat,sat:sat,trans:0,chol:chol,sod:sod,carb:carb,fiber:fiber,sugar:sugar,added:0,prot:prot};
}
var EXTRAS = [
  ex('milk-whole','milk','Whole milk',150,8,4.5,35,125,12,0,12,8),
  ex('milk-2','milk','2% milk',120,5,3,20,120,12,0,11,8),
  ex('milk-choc-1','milk','1% chocolate milk',160,2.5,1.5,10,150,26,1,24,8),
  ex('cer-cinnamon','cereal','Cinnamon Toast Crunch',170,4,0.5,0,230,33,3,12,2),
  ex('cer-raisin','cereal','Raisin Bran',190,1,0,0,210,47,7,18,5),
  ex('cer-cocoa','cereal','Cocoa Puffs',140,2,0,0,130,31,2,12,2),
  ex('cer-lucky','cereal','Lucky Charms',140,1.5,0,0,220,30,2,12,3),
  ex('cer-cheerios','cereal','Cheerios',93,1.7,0.3,0,127,19,2.7,1.3,3.3),
  ex('cer-capn','cereal','Cap’n Crunch',150,2,1,0,290,33,1,16,2),
  ex('bagel-plain','bagel','Plain bagel',240,1.5,0,0,400,47,3,6,9),
  ex('cc-regular','spread','Cream cheese',80,7,4.5,20,125,2,0,1,2),
  ex('cc-strawberry','spread','Strawberry cream cheese',70,4,3,20,110,5,0,5,2),
  ex('pepsi','soda','Pepsi',150,0,0,0,30,41,0,41,0),
  ex('diet-pepsi','soda','Diet Pepsi',0,0,0,0,35,0,0,0,0),
  ex('pepsi-zero','soda','Pepsi Zero Sugar',0,0,0,0,35,0,0,0,0),
  ex('mtn-dew','soda','Mountain Dew',170,0,0,0,65,46,0,46,0),
  ex('mtn-dew-zero','soda','Mountain Dew Zero Sugar',0,0,0,0,40,0,0,0,0)
];
var EXTRA = {}; EXTRAS.forEach(function(d){EXTRA[d.id]=d});
var EXTRA_GROUPS = [
  {kind:'milk',title:'Milk · 1 cup (8 fl oz)'},
  {kind:'cereal',title:'Cereal · 1 cup'},
  {kind:'bagel',title:'Bagel · 1 bagel'},
  {kind:'spread',title:'Cream cheese · 2 tbsp'},
  {kind:'soda',title:'Soda · 12 oz can'}
];
var EXTRA_ALLERGENS = {milk:['Milk'],spread:['Milk'],bagel:['Wheat']};
function extraPortion(d,q){
  if(d.kind==='soda') return (q===1?'1 can':qtyText(q)+' cans')+' (12 oz)';
  if(d.kind==='bagel') return qtyText(q)+' '+(q>1?'bagels':'bagel');
  if(d.kind==='spread') return fmtHalf(2*q)+' tbsp'+(q===1?' (a ping-pong ball)':'');
  return qtyText(q)+' '+(q>1?'cups':'cup')+(d.kind==='milk'?' (8 fl oz)':'');
}

var SLOTS = [{k:'B',name:'Breakfast',time:'7–11 am'},{k:'L',name:'Lunch',time:'11 am–4 pm'},{k:'D',name:'Dinner',time:'4–8 pm'}];
var SLOTNAME = {B:'Breakfast',L:'Lunch',D:'Dinner'};
var STATION_ORDER = ['Homestead','Roots','Clarity','Fusion','Smoke N Fire','Trattoria Pizza','Trattoria Pasta','Carvery','Nutribar','Soups','Drinks','Cereal','Bagels & cream cheese'];
var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var DOWS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var DV = {fat:78,sat:20,sod:2300,carb:275,fiber:28,prot:50,cal:2000};
var FIELDS = ['cal','fat','sat','trans','chol','sod','carb','fiber','sugar','added','prot'];

/* ---------- helpers ---------- */
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function pad(n){return n<10?'0'+n:''+n}
function keyOf(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function parseKey(k){var p=k.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function fmt(n){return Math.round(n).toLocaleString('en-US')}
function g(n){return Math.round(n)+'g'}
function mg(n){return fmt(n)+'mg'}
function qtyText(q){return fracText(q)}
function uid(){return 'm'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function fresh(){var o={};FIELDS.forEach(function(f){o[f]=0});return o}
function addTo(t,src,q){FIELDS.forEach(function(f){t[f]+=(src[f]||0)*q})}

/* ---------- state ---------- */
var dates = Object.keys(D.M).sort();
var firstDate = dates[0], lastDate = dates[dates.length-1];
var now = new Date(), todayKey = keyOf(now);
var st = {y:0,m:0,sel:'',slot:'L',view:'build',q:'',sort:'station',diet:{veg:false,vegan:false,gs:false},
          open:{},trayOpen:false,active:{},confirm:null};
var plans = {};

(function initState(){
  var sel = (todayKey>=firstDate && todayKey<=lastDate) ? todayKey : firstDate;
  var d = parseKey(sel); st.sel = sel; st.y = d.getFullYear(); st.m = d.getMonth();
  var h = now.getHours(); st.slot = h<11?'B':(h<16?'L':'D');
  if(!hasMenu(sel,st.slot)) st.slot = firstSlotWithMenu(sel);
})();

function hasMenu(date,slot){var m=D.M[date];return !!(m&&m[slot]&&m[slot].length)}
function firstSlotWithMenu(date){for(var i=0;i<3;i++){if(hasMenu(date,SLOTS[i].k))return SLOTS[i].k}return 'L'}

/* ---------- plans ---------- */
function dayMeals(date){return (plans[date]&&plans[date].meals)||[]}
function slotMeals(date,slot){return dayMeals(date).filter(function(m){return m.slot===slot})}
function mealLabel(meal){
  if(meal.name) return meal.name;
  var same = slotMeals(st.sel,meal.slot), idx = same.indexOf(meal);
  return SLOTNAME[meal.slot] + (same.length>1 ? ' '+(idx+1) : '');
}
function newMeal(date,slot){
  if(!plans[date]) plans[date]={meals:[]};
  var m={id:uid(),name:'',slot:slot,items:[],drinks:[]};
  plans[date].meals.push(m); st.active[date+slot]=m.id; return m;
}
function activeMeal(date,slot,create){
  var list = slotMeals(date,slot), id = st.active[date+slot], m=null;
  list.forEach(function(x){if(x.id===id)m=x});
  if(!m && list.length) m=list[0];
  if(!m && create) m=newMeal(date,slot);
  if(m) st.active[date+slot]=m.id;
  return m;
}
function mealTotals(meal){
  var t=fresh();
  meal.items.forEach(function(e){var it=ITEMS[e.i]; if(it) addTo(t,it,e.q)});
  meal.drinks.forEach(function(e){var d=EXTRA[e.d]; if(d) addTo(t,d,e.q)});
  return t;
}
function dayTotals(date){var t=fresh();dayMeals(date).forEach(function(m){addTo(t,mealTotals(m),1)});return t}
function mealAllergens(meal){
  var mask=0; meal.items.forEach(function(e){var it=ITEMS[e.i]; if(it) mask|=it.am});
  var names=maskNames(mask);
  meal.drinks.forEach(function(e){var d=EXTRA[e.d]; if(d) (EXTRA_ALLERGENS[d.kind]||[]).forEach(function(n){if(names.indexOf(n)<0) names.push(n)})});
  return names;
}
function hasKind(meal,kind){return meal.drinks.some(function(e){var d=EXTRA[e.d];return d&&d.kind===kind})}
function needsNote(meal){return hasKind(meal,'cereal')||hasKind(meal,'bagel')||hasKind(meal,'spread')}
function allergyNote(meal){return needsNote(meal)?' Allergens for cereal, bagels and cream cheese are only partly tracked here, so check the label.':''}
function maskNames(mask){var out=[];D.A.forEach(function(n,i){if(mask&(1<<i))out.push(n)});return out}
function countEntries(m){return m.items.length+m.drinks.length}

/* ---------- persistence (this browser only) ---------- */
var STORE_KEY = 'edinboro-meal-plans-v1';
function setStatus(text,warn){var el=$('status');el.textContent=text;el.className='status'+(warn?' warn':'')}
function cleanMeal(m){
  if(!m||typeof m!=='object')return null;
  var items=(Array.isArray(m.items)?m.items:[]).filter(function(e){return e&&typeof e.i==='number'&&typeof e.q==='number'&&e.q>0}).map(function(e){return {i:e.i,q:e.q}});
  var drinks=(Array.isArray(m.drinks)?m.drinks:[]).filter(function(e){return e&&typeof e.d==='string'&&typeof e.q==='number'&&e.q>0}).map(function(e){return {d:e.d,q:e.q}});
  var slot=(m.slot==='B'||m.slot==='L'||m.slot==='D')?m.slot:'L';
  return {id:String(m.id||uid()),name:String(m.name||'').slice(0,60),slot:slot,items:items,drinks:drinks};
}
function cleanPlan(data){
  var meals=(data&&Array.isArray(data.meals)?data.meals:[]).map(cleanMeal).filter(Boolean);
  return {meals:meals};
}
function loadLocal(){
  try{var raw=localStorage.getItem(STORE_KEY); if(raw){var o=JSON.parse(raw); Object.keys(o).forEach(function(k){plans[k]=cleanPlan(o[k])})}}catch(e){}
}
function persist(){
  var out={};
  Object.keys(plans).forEach(function(k){if(plans[k].meals.length) out[k]=plans[k]});
  try{localStorage.setItem(STORE_KEY,JSON.stringify(out));setStatus('Meals are saved in this browser')}
  catch(e){setStatus('Not saved: browser storage is blocked. Meals last until you close this page.',true)}
}
function initStore(){loadLocal();setStatus('Meals are saved in this browser');renderAll()}

/* ---------- visuals ---------- */
function macroBar(t){
  var p=t.prot*4,c=t.carb*4,f=t.fat*9,sum=p+c+f;
  if(sum<=0) return '<div class="bar" aria-hidden="true"></div><div class="barlbl"><span>No calories from protein, carbs or fat</span></div>';
  var pp=Math.round(p/sum*100), cc=Math.round(c/sum*100), ff=Math.max(0,100-pp-cc);
  return '<div class="bar" aria-hidden="true"><i class="p" style="width:'+pp+'%"></i><i class="c" style="width:'+cc+'%"></i><i class="f" style="width:'+ff+'%"></i></div>'+
    '<div class="barlbl"><span class="m p">Protein <b>'+pp+'%</b></span><span class="m c">Carbs <b>'+cc+'%</b></span><span class="m f">Fat <b>'+ff+'%</b></span></div>';
}
function dv(v,key){return DV[key]?Math.round(v/DV[key]*100)+'% DV':''}
function nutGrid(t){
  function nx(label,val,key){return '<div class="nx"><small>'+label+'</small><b class="num">'+val+'</b>'+(key?'<em>'+dv(t[key],key)+'</em>':'<em>&nbsp;</em>')+'</div>'}
  return '<div class="ngrid">'+nx('Protein',g(t.prot),'prot')+nx('Carbs',g(t.carb),'carb')+nx('Fat',g(t.fat),'fat')+
    nx('Sodium',mg(t.sod),'sod')+nx('Sugars',g(t.sugar),'')+nx('Fiber',g(t.fiber),'fiber')+'</div>';
}
function portionHtml(it,q){
  var v=visual(it.v,it.oz,q);
  return '<b>'+esc(v.main)+'</b>'+(v.cue?' <span>≈ '+esc(v.cue)+'</span>':'');
}
function portionPlain(it,q){var v=visual(it.v,it.oz,q);return v.main}

/* ---------- calendar ---------- */
var CHEV_L='<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>';
var CHEV_R='<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';
function monthIndex(y,m){return y*12+m}
function renderCalendar(){
  var y=st.y,m=st.m, first=new Date(y,m,1), lead=first.getDay(), dim=new Date(y,m+1,0).getDate();
  var fd=parseKey(firstDate), ld=parseKey(lastDate);
  var canPrev = monthIndex(y,m)>monthIndex(fd.getFullYear(),fd.getMonth());
  var canNext = monthIndex(y,m)<monthIndex(ld.getFullYear(),ld.getMonth());
  var h='<div class="cal-head"><button class="icon-btn" data-act="prev" aria-label="Previous month"'+(canPrev?'':' disabled')+'>'+CHEV_L+'</button>'+
    '<h2>'+MONTHS[m]+' '+y+'</h2><button class="icon-btn" data-act="next" aria-label="Next month"'+(canNext?'':' disabled')+'>'+CHEV_R+'</button></div>';
  h+='<div class="dow" aria-hidden="true">'+DOWS.map(function(d){return '<span>'+d+'</span>'}).join('')+'</div><div class="grid">';
  for(var i=0;i<lead;i++) h+='<div class="cell blank"></div>';
  for(var d=1;d<=dim;d++){
    var k=y+'-'+pad(m+1)+'-'+pad(d), meals=dayMeals(k), menu=!!D.M[k], t=meals.length?dayTotals(k):null;
    var cls='cell'+(k===st.sel?' sel':'')+(k===todayKey?' today':'')+(menu?'':' nomenu');
    var dots=SLOTS.map(function(s){return '<i class="'+(meals.some(function(x){return x.slot===s.k})?'on':'')+'">'+s.k+'</i>'}).join('');
    var date=new Date(y,m,d);
    var label=DOWS[date.getDay()]+' '+MONTHS[m]+' '+d+(menu?'':', no menu posted')+(meals.length?', '+meals.length+' meal'+(meals.length>1?'s':'')+' planned, '+fmt(t.cal)+' calories':'');
    h+='<button class="'+cls+'" data-act="pick" data-date="'+k+'" aria-label="'+esc(label)+'"'+(k===st.sel?' aria-current="date"':'')+'><span class="dn num">'+d+'</span><span class="dots">'+dots+'</span><span class="ck num">'+(t?fmt(t.cal):'')+'</span></button>';
  }
  h+='</div><div class="cal-foot"><span>B Breakfast · L Lunch · D Dinner. Filled means a meal is planned.</span>'+
     '<button class="link-btn" data-act="today">Go to today</button></div>';
  $('calendar').innerHTML=h;
}

/* ---------- day header / tabs / periods ---------- */
function renderDayHead(){
  var d=parseKey(st.sel), t=dayTotals(st.sel), n=dayMeals(st.sel).length;
  var long=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
  $('dayhead').innerHTML='<div><p class="eyebrow">'+long+(st.sel===todayKey?' · Today':'')+'</p><h2>'+MONTHS[d.getMonth()]+' '+d.getDate()+'</h2></div>'+
    '<div class="day-kpi">'+(n?'<b class="num">'+fmt(t.cal)+'</b> kcal planned<br>'+n+' meal'+(n>1?'s':''):(D.M[st.sel]?'Nothing planned yet':'No menu posted for this day'))+'</div>';
  $('tabs').innerHTML='<button role="tab" data-act="view" data-view="build" aria-selected="'+(st.view==='build')+'">Build a meal</button>'+
    '<button role="tab" data-act="view" data-view="summary" aria-selected="'+(st.view==='summary')+'">Day summary</button>';
}
function renderPeriods(){
  $('periods').innerHTML=SLOTS.map(function(s){
    var cnt=(D.M[st.sel]&&D.M[st.sel][s.k]||[]).length, planned=slotMeals(st.sel,s.k).length;
    return '<button class="period" data-act="slot" data-slot="'+s.k+'" aria-pressed="'+(st.slot===s.k)+'"><b>'+s.name+'</b><small>'+s.time+' · '+cnt+' items'+(planned?' · <span class="pm">'+planned+' planned</span>':'')+'</small></button>';
  }).join('');
}
function renderFilters(){
  function chip(k,label){return '<button class="fchip" data-act="diet" data-k="'+k+'" aria-pressed="'+st.diet[k]+'">'+label+'</button>'}
  $('filters').innerHTML=chip('veg','Vegetarian')+chip('vegan','Vegan')+chip('gs','Gluten sensitive');
}

/* ---------- menu list ---------- */
function visibleItems(){
  var ids=(D.M[st.sel]&&D.M[st.sel][st.slot])||[], q=st.q.trim().toLowerCase();
  return ids.map(function(id){return ITEMS[id]}).filter(function(it){
    if(!it)return false;
    if(q && (it.name+' '+it.st+' '+(it.desc||'')).toLowerCase().indexOf(q)<0) return false;
    if(st.diet.vegan && !(it.pm&F.vegan)) return false;
    if(st.diet.veg && !(it.pm&(F.veg|F.vegan))) return false;
    if(st.diet.gs && !(it.pm&F.gs)) return false;
    return true;
  });
}
function tagsHtml(it){
  var t='';
  if(it.pm&F.vegan) t+='<span class="tag good">Vegan</span>'; else if(it.pm&F.veg) t+='<span class="tag good">Vegetarian</span>';
  if(it.pm&F.gs) t+='<span class="tag">Gluten sens.</span>';
  return t;
}
function rowHtml(it,entry){
  var ctl = entry
    ? '<div class="stepper" role="group" aria-label="Servings of '+esc(it.name)+'"><button data-act="dec" data-id="'+it.id+'" aria-label="Fewer">−</button><span class="num">'+qtyText(entry.q)+'</span><button data-act="inc" data-id="'+it.id+'" aria-label="More">+</button></div>'
    : '<button class="add" data-act="add" data-id="'+it.id+'" aria-label="Add '+esc(it.name)+' to '+SLOTNAME[st.slot]+'"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>';
  var open = !!st.open[it.id];
  var h='<li class="row"><div class="row-main"><button class="name-btn" data-act="toggle" data-id="'+it.id+'" aria-expanded="'+open+'"><span class="name">'+esc(it.name)+'</span><span class="portion">'+portionHtml(it,1)+'</span></button>'+
    '<div class="kcal"><b class="num">'+fmt(it.cal)+'</b><small>kcal</small></div>'+ctl+'</div>'+
    '<div class="macros"><span class="m p">Protein <b class="num">'+g(it.prot)+'</b></span><span class="m c">Carbs <b class="num">'+g(it.carb)+'</b></span><span class="m f">Fat <b class="num">'+g(it.fat)+'</b></span><span class="m">Sodium <b class="num">'+mg(it.sod)+'</b></span>'+tagsHtml(it)+'</div>';
  if(open){
    var al=maskNames(it.am);
    h+='<div class="detail">'+(it.desc?'<p>'+esc(it.desc)+'</p>':'')+
      '<dl class="facts">'+
      '<div><dt>Serving</dt><dd>'+esc(visual(it.v,it.oz,1).main)+' ('+it.oz+' oz)</dd></div>'+
      '<div><dt>Calories</dt><dd class="num">'+fmt(it.cal)+'</dd></div>'+
      '<div><dt>Total fat</dt><dd class="num">'+g(it.fat)+'</dd></div>'+
      '<div><dt>Saturated fat</dt><dd class="num">'+g(it.sat)+'</dd></div>'+
      '<div><dt>Trans fat</dt><dd class="num">'+g(it.trans)+'</dd></div>'+
      '<div><dt>Cholesterol</dt><dd class="num">'+mg(it.chol)+'</dd></div>'+
      '<div><dt>Sodium</dt><dd class="num">'+mg(it.sod)+'</dd></div>'+
      '<div><dt>Carbs</dt><dd class="num">'+g(it.carb)+'</dd></div>'+
      '<div><dt>Fiber</dt><dd class="num">'+g(it.fiber)+'</dd></div>'+
      '<div><dt>Sugars</dt><dd class="num">'+g(it.sugar)+' (added '+g(it.added)+')</dd></div>'+
      '<div><dt>Protein</dt><dd class="num">'+g(it.prot)+'</dd></div>'+
      '</dl><p style="margin:0;color:var(--muted)">'+(al.length?'Allergens listed: '+esc(al.join(', ')):'No allergens listed.')+' Confirm with dining staff if you have an allergy.</p></div>';
  }
  return h+'</li>';
}
var EXTRA_STATION = {milk:'Drinks',soda:'Drinks',cereal:'Cereal',bagel:'Bagels & cream cheese',spread:'Bagels & cream cheese'};
function extraOk(d){
  if(st.diet.vegan && d.kind!=='soda') return false;
  if(st.diet.gs && (d.kind==='cereal'||d.kind==='bagel')) return false;
  return true;
}
function visibleExtras(){
  var q=st.q.trim().toLowerCase();
  return EXTRAS.filter(function(d){
    if(q && (d.name+' '+EXTRA_STATION[d.kind]).toLowerCase().indexOf(q)<0) return false;
    return extraOk(d);
  });
}
function extraRowHtml(d,entry){
  var ctl = entry
    ? '<div class="stepper" role="group" aria-label="Servings of '+esc(d.name)+'"><button data-act="ddec" data-id="'+d.id+'" aria-label="Fewer">−</button><span class="num">'+qtyText(entry.q)+'</span><button data-act="dinc" data-id="'+d.id+'" aria-label="More">+</button></div>'
    : '<button class="add" data-act="dadd" data-id="'+d.id+'" aria-label="Add '+esc(d.name)+' to '+SLOTNAME[st.slot]+'"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>';
  var open=!!st.open[d.id];
  var portion=extraPortion(d,1), cue='';
  if(d.kind==='cereal'||d.kind==='milk') cue='1 fist';
  var h='<li class="row"><div class="row-main"><button class="name-btn" data-act="toggle" data-id="'+d.id+'" aria-expanded="'+open+'"><span class="name">'+esc(d.name)+'</span><span class="portion"><b>'+esc(portion)+'</b>'+(cue?' <span>≈ '+cue+'</span>':'')+'</span></button>'+
    '<div class="kcal"><b class="num">'+fmt(d.cal)+'</b><small>kcal</small></div>'+ctl+'</div>'+
    '<div class="macros"><span class="m p">Protein <b class="num">'+g(d.prot)+'</b></span><span class="m c">Carbs <b class="num">'+g(d.carb)+'</b></span><span class="m f">Fat <b class="num">'+g(d.fat)+'</b></span><span class="m">Sodium <b class="num">'+mg(d.sod)+'</b></span><span class="m">Sugars <b class="num">'+g(d.sugar)+'</b></span><span class="tag">Label values</span></div>';
  if(open){
    var al=EXTRA_ALLERGENS[d.kind]||[];
    h+='<div class="detail"><dl class="facts">'+
      '<div><dt>Serving</dt><dd>'+esc(portion)+'</dd></div>'+
      '<div><dt>Calories</dt><dd class="num">'+fmt(d.cal)+'</dd></div>'+
      '<div><dt>Total fat</dt><dd class="num">'+g(d.fat)+'</dd></div>'+
      '<div><dt>Saturated fat</dt><dd class="num">'+g(d.sat)+'</dd></div>'+
      '<div><dt>Cholesterol</dt><dd class="num">'+mg(d.chol)+'</dd></div>'+
      '<div><dt>Sodium</dt><dd class="num">'+mg(d.sod)+'</dd></div>'+
      '<div><dt>Carbs</dt><dd class="num">'+g(d.carb)+'</dd></div>'+
      '<div><dt>Fiber</dt><dd class="num">'+g(d.fiber)+'</dd></div>'+
      '<div><dt>Sugars</dt><dd class="num">'+g(d.sugar)+'</dd></div>'+
      '<div><dt>Protein</dt><dd class="num">'+g(d.prot)+'</dd></div>'+
      '</dl><p style="margin:0;color:var(--muted)">Typical label values from product listings, not dining hall data. '+(al.length?'Allergens: '+esc(al.join(', '))+'. ':'')+'Check the package for the full allergen list.</p></div>';
  }
  return h+'</li>';
}
function renderMenuList(){
  var el=$('menulist');
  if(!hasMenu(st.sel,st.slot)){
    el.innerHTML='<div class="empty">No '+SLOTNAME[st.slot].toLowerCase()+' menu is posted for this day.'+(D.M[st.sel]?' Try another meal period.':' Menus on this site cover '+fmtShort(firstDate)+' to '+fmtShort(lastDate)+'.')+'</div>';
    return;
  }
  var all=visibleItems().map(function(it){return {x:false,o:it,s:it.st}})
    .concat(visibleExtras().map(function(d){return {x:true,o:d,s:EXTRA_STATION[d.kind]}}));
  if(!all.length){el.innerHTML='<div class="empty">Nothing matches those filters.</div>';return}
  var meal=activeMeal(st.sel,st.slot,false), inMeal={}, inEx={};
  if(meal){ meal.items.forEach(function(e){inMeal[e.i]=e}); meal.drinks.forEach(function(e){inEx[e.d]=e}) }
  function row(r){return r.x?extraRowHtml(r.o,inEx[r.o.id]):rowHtml(r.o,inMeal[r.o.id])}
  var h='';
  if(st.sort==='station'){
    var groups={}; all.forEach(function(r){(groups[r.s]=groups[r.s]||[]).push(r)});
    Object.keys(groups).sort(function(a,b){var x=STATION_ORDER.indexOf(a),y=STATION_ORDER.indexOf(b);return (x<0?99:x)-(y<0?99:y)}).forEach(function(s){
      h+='<h3 class="station">'+esc(s)+'<span>'+groups[s].length+'</span></h3><ul class="rows">'+groups[s].map(row).join('')+'</ul>';
    });
  } else {
    var key={cal:function(a,b){return a.o.cal-b.o.cal},prot:function(a,b){return b.o.prot-a.o.prot},sod:function(a,b){return a.o.sod-b.o.sod}}[st.sort];
    h='<ul class="rows">'+all.slice().sort(key).map(row).join('')+'</ul>';
  }
  el.innerHTML=h;
}
function fmtShort(k){var d=parseKey(k);return MONTHS[d.getMonth()].slice(0,3)+' '+d.getDate()}

/* ---------- tray ---------- */
var CHEV_UP='<i class="fa-solid fa-chevron-up" aria-hidden="true"></i>';
function renderTray(){
  var tray=$('tray'), slot=st.slot, meals=slotMeals(st.sel,slot), meal=activeMeal(st.sel,slot,false);
  tray.className='tray'+(st.trayOpen?' open':'');
  if(st.view!=='build'){tray.hidden=true;return}
  tray.hidden=false;
  var t=meal?mealTotals(meal):fresh(), n=meal?countEntries(meal):0;
  var title=meal?mealLabel(meal):('Your '+SLOTNAME[slot].toLowerCase());
  var head='<button class="tray-head" data-act="tray" aria-expanded="'+st.trayOpen+'"><span class="tt">'+esc(title)+'</span><span class="ts num">'+(n?n+' item'+(n>1?'s':'')+' · '+fmt(t.cal)+' kcal':'Empty')+'</span>'+CHEV_UP+'</button>';
  var body='<div class="tray-body">';
  if(!hasMenu(st.sel,slot)){
    body+='<p class="tempty">There is no '+SLOTNAME[slot].toLowerCase()+' menu for this day, so there is nothing to build.</p></div>';
    tray.innerHTML=head+body; return;
  }
  body+='<div class="mtabs">'+meals.map(function(m){return '<button class="mtab" data-act="pickmeal" data-id="'+m.id+'" aria-pressed="'+(meal&&m.id===meal.id)+'">'+esc(mealLabel(m))+'</button>'}).join('')+
        '<button class="mtab new" data-act="newmeal">+ New '+SLOTNAME[slot].toLowerCase()+'</button></div>';
  if(!meal){
    body+='<p class="tempty">Nothing here yet. Tap + next to any item on the menu, including drinks, cereal and bagels, to start your '+SLOTNAME[slot].toLowerCase()+'.</p>';
  } else {
    body+='<input class="mname" id="mname" type="text" maxlength="60" placeholder="Name this meal (optional)" aria-label="Meal name" value="'+esc(meal.name)+'">';
    if(meal.items.length||meal.drinks.length){
      body+='<ul class="titems">';
      meal.items.forEach(function(e){
        var it=ITEMS[e.i];
        if(!it){body+='<li class="titem"><span class="tn">Item no longer on file</span><span class="stepper"><button data-act="rm" data-id="'+e.i+'" aria-label="Remove">×</button></span></li>';return}
        body+='<li class="titem"><span class="tn">'+esc(it.name)+'</span><div class="stepper" role="group" aria-label="Servings of '+esc(it.name)+'"><button data-act="dec" data-id="'+it.id+'" aria-label="Fewer">−</button><span class="num">'+qtyText(e.q)+'</span><button data-act="inc" data-id="'+it.id+'" aria-label="More">+</button></div>'+
          '<span class="tk num">'+esc(portionPlain(it,e.q))+' · '+fmt(it.cal*e.q)+' kcal · '+g(it.prot*e.q)+' protein</span></li>';
      });
      meal.drinks.forEach(function(e){
        var d=EXTRA[e.d]; if(!d)return;
        body+='<li class="titem"><span class="tn">'+esc(d.name)+'</span><div class="stepper" role="group" aria-label="Servings of '+esc(d.name)+'"><button data-act="ddec" data-id="'+d.id+'" aria-label="Fewer">−</button><span class="num">'+qtyText(e.q)+'</span><button data-act="dinc" data-id="'+d.id+'" aria-label="More">+</button></div>'+
          '<span class="tk num">'+esc(extraPortion(d,e.q))+' · '+fmt(d.cal*e.q)+' kcal · '+g(d.prot*e.q)+' protein</span></li>';
      });
      body+='</ul>';
    }
  }
  if(meal && countEntries(meal)){
    body+='<div class="totals"><div class="tot-top"><div class="big num">'+fmt(t.cal)+'<small>kcal</small></div><div class="ref num">'+Math.round(t.cal/DV.cal*100)+'% of a 2,000 kcal day</div></div>'+macroBar(t)+nutGrid(t)+'</div>';
    var al=mealAllergens(meal);
    body+=al.length?'<p class="allergy"><b>Allergens listed:</b> '+esc(al.join(', '))+'.'+esc(allergyNote(meal))+'</p>':'<p class="allergy none">No allergens listed for the food in this meal.'+esc(allergyNote(meal))+'</p>';
  }
  if(meal){
    var sure=st.confirm===meal.id;
    body+='<div class="tact">'+(countEntries(meal)?mfpButton(meal):'<span></span>')+'<button class="danger'+(sure?' sure':'')+'" data-act="delmeal" data-id="'+meal.id+'">'+(sure?'Tap again to delete this meal':'Delete meal')+'</button></div>'+(countEntries(meal)?mfpPanel(meal):'');
  }
  tray.innerHTML=head+body+'</div>';
  var nm=$('mname');
  if(nm) nm.addEventListener('input',function(){
    meal.name=nm.value; persist(st.sel);
    var tt=tray.querySelector('.tt'); if(tt) tt.textContent=mealLabel(meal);
    var tabs=tray.querySelectorAll('.mtab:not(.new)'); slotMeals(st.sel,slot).forEach(function(m,i){if(tabs[i])tabs[i].textContent=mealLabel(m)});
  });
}

/* ---------- MyFitnessPal export ---------- */
/* MyFitnessPal has no public way for other sites to add to a diary, so this gives the
   meal's totals in the form its Quick Add screen asks for, plus a link to open the app. */
var MFP_URL='https://www.myfitnesspal.com/food/diary';
function mfpVals(meal){var t=mealTotals(meal);return {cal:Math.round(t.cal),carb:Math.round(t.carb),fat:Math.round(t.fat),prot:Math.round(t.prot)}}
function mfpButton(meal){
  var open=st.mfp===meal.id;
  return '<button class="btn ghost mfp-btn" data-act="mfp" data-id="'+meal.id+'" aria-expanded="'+open+'" aria-controls="mfp-'+meal.id+'"><i class="fa-solid fa-utensils" aria-hidden="true"></i> '+(open?'Hide MyFitnessPal':'Export to MyFitnessPal')+'</button>';
}
function mfpPanel(meal){
  if(st.mfp!==meal.id) return '';
  var v=mfpVals(meal), meals={B:'Breakfast',L:'Lunch',D:'Dinner'};
  function tile(label,val,unit){return '<button class="mfp-num" data-act="mfpnum" data-v="'+val+'" aria-label="Copy '+label+' '+val+(unit?' grams':'')+'"><span class="mfp-l">'+label+'</span><b class="num">'+val+(unit?' g':'')+'</b><span class="mfp-c">Tap to copy</span></button>'}
  return '<div class="mfp" id="mfp-'+meal.id+'"><p class="mfp-s">MyFitnessPal does not let other sites add to your diary, so use its <b>Quick Add</b>: open the app, go to <b>Diary, '+meals[meal.slot]+', Add Food, Quick Add</b>. Tap a number below to copy it, then paste it into the matching box.</p>'+
    '<div class="mfp-nums">'+tile('Calories',v.cal,false)+tile('Carbs',v.carb,true)+tile('Fat',v.fat,true)+tile('Protein',v.prot,true)+'</div>'+
    '<div class="sum-actions"><a class="btn ghost mfp-open" href="'+MFP_URL+'" target="_blank" rel="noopener">Open MyFitnessPal</a><span class="num mfpnote" role="status" style="font-size:12.5px;color:var(--muted)"></span></div><div class="mfpfall"></div></div>';
}
function findMeal(id){var f=null;Object.keys(plans).forEach(function(k){plans[k].meals.forEach(function(m){if(m.id===id)f=m})});return f}

/* ---------- summary ---------- */
function summaryText(){
  var d=parseKey(st.sel), t=dayTotals(st.sel), lines=[];
  lines.push(['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]+', '+MONTHS[d.getMonth()]+' '+d.getDate()+': '+fmt(t.cal)+' kcal, '+g(t.prot)+' protein, '+g(t.carb)+' carbs, '+g(t.fat)+' fat, '+mg(t.sod)+' sodium');
  SLOTS.forEach(function(s){slotMeals(st.sel,s.k).forEach(function(m){
    var mt=mealTotals(m); lines.push(''); lines.push(mealLabel(m)+' ('+fmt(mt.cal)+' kcal)');
    m.items.forEach(function(e){var it=ITEMS[e.i]; if(it) lines.push('- '+it.name+': '+portionPlain(it,e.q)+', '+fmt(it.cal*e.q)+' kcal')});
    m.drinks.forEach(function(e){var dr=EXTRA[e.d]; if(dr) lines.push('- '+dr.name+': '+extraPortion(dr,e.q)+', '+fmt(dr.cal*e.q)+' kcal')});
  })});
  return lines.join('\n');
}
function renderSummary(){
  var el=$('summaryview');
  if(st.view!=='summary'){el.hidden=true;return}
  el.hidden=false;
  var meals=dayMeals(st.sel);
  if(!meals.length){
    el.innerHTML='<div class="card sum-day"><p class="empty" style="padding:12px 0">No meals planned for this day. Switch to <b>Build a meal</b> to add one from the menu.</p><div style="text-align:center"><button class="btn" data-act="view" data-view="build">Build a meal</button></div></div>';
    return;
  }
  var t=dayTotals(st.sel), pct=Math.min(100,Math.round(t.cal/DV.cal*100));
  var h='<div class="card sum-day"><div class="tot-top"><div class="big num" style="font-family:var(--display);font-size:40px;font-weight:700;line-height:1">'+fmt(t.cal)+'<small style="font-family:var(--body);font-size:14px;font-weight:500;color:var(--muted);margin-left:5px">kcal planned</small></div><div class="ref num">'+Math.round(t.cal/DV.cal*100)+'% of a 2,000 kcal day</div></div>'+
    '<div class="bar" aria-hidden="true" style="margin-top:12px"><i style="width:'+pct+'%;background:var(--accent)"></i></div>'+macroBar(t)+nutGrid(t)+
    '<div class="sum-actions" style="margin-top:14px"><button class="btn ghost" data-act="copy">Copy this day as text</button><span id="copynote" class="num" style="font-size:12.5px;color:var(--muted)"></span></div><div id="copyfall"></div></div>';
  h+='<div class="sum-meals">';
  SLOTS.forEach(function(s){slotMeals(st.sel,s.k).forEach(function(m){
    var mt=mealTotals(m), al=mealAllergens(m);
    h+='<div class="card sum-meal"><h3>'+esc(mealLabel(m))+'<span class="num">'+fmt(mt.cal)+' kcal</span></h3>';
    h+='<div class="macros" style="margin:6px 0 4px"><span class="m p">Protein <b class="num">'+g(mt.prot)+'</b></span><span class="m c">Carbs <b class="num">'+g(mt.carb)+'</b></span><span class="m f">Fat <b class="num">'+g(mt.fat)+'</b></span><span class="m">Sodium <b class="num">'+mg(mt.sod)+'</b></span></div>';
    h+='<ul>';
    m.items.forEach(function(e){var it=ITEMS[e.i]; if(it) h+='<li><span>'+esc(it.name)+'</span><span class="num">'+esc(portionPlain(it,e.q))+'</span></li>'});
    m.drinks.forEach(function(e){var dr=EXTRA[e.d]; if(dr) h+='<li><span>'+esc(dr.name)+'</span><span class="num">'+esc(extraPortion(dr,e.q))+'</span></li>'});
    h+='</ul>'+(al.length||needsNote(m)?'<p class="allergy" style="margin-top:10px">'+(al.length?'<b>Allergens listed:</b> '+esc(al.join(', '))+'.':'')+esc(allergyNote(m))+'</p>':'')+
      '<div class="sum-meal-actions"><button class="link-btn" data-act="editmeal" data-id="'+m.id+'" data-slot="'+m.slot+'">Edit this meal</button>'+(countEntries(m)?mfpButton(m):'')+'</div>'+(countEntries(m)?mfpPanel(m):'')+'</div>';
  })});
  el.innerHTML=h+'</div>';
}

/* ---------- render orchestration ---------- */
function renderAll(){renderCalendar();renderDayHead();renderPeriods();renderFilters();renderMenuList();renderTray();renderSummary();
  $('buildview').hidden = st.view!=='build'}
function renderAfterChange(){renderCalendar();renderDayHead();renderPeriods();renderMenuList();renderTray();renderSummary()}
var toastTimer;
function toast(msg){var t=$('toast');t.textContent=msg;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.hidden=true},1700)}

/* ---------- actions ---------- */
function curMeal(create){return activeMeal(st.sel,st.slot,create)}
function entryOf(meal,id){var r=null;meal.items.forEach(function(e){if(e.i===id)r=e});return r}
function change(){st.confirm=null;persist(st.sel);renderAfterChange()}
var actions = {
  prev:function(){st.m--; if(st.m<0){st.m=11;st.y--} renderCalendar()},
  next:function(){st.m++; if(st.m>11){st.m=0;st.y++} renderCalendar()},
  today:function(){var k=(todayKey>=firstDate&&todayKey<=lastDate)?todayKey:firstDate;actions.pick(null,k)},
  pick:function(el,k){
    k=k||el.getAttribute('data-date'); st.sel=k; var d=parseKey(k); st.y=d.getFullYear(); st.m=d.getMonth(); st.confirm=null;
    if(!hasMenu(k,st.slot)&&D.M[k]) st.slot=firstSlotWithMenu(k);
    renderAll();
    if(window.matchMedia('(max-width:899px)').matches){var dh=$('dayhead'); if(dh&&dh.scrollIntoView) dh.scrollIntoView({behavior:'smooth',block:'start'})}
  },
  view:function(el){st.view=el.getAttribute('data-view');renderAll()},
  slot:function(el){st.slot=el.getAttribute('data-slot');st.confirm=null;renderPeriods();renderMenuList();renderTray()},
  diet:function(el){var k=el.getAttribute('data-k');st.diet[k]=!st.diet[k];renderFilters();renderMenuList()},
  toggle:function(el){var id=el.getAttribute('data-id');st.open[id]=!st.open[id];renderMenuList()},
  tray:function(){st.trayOpen=!st.trayOpen;renderTray()},
  add:function(el){
    var id=+el.getAttribute('data-id'), m=curMeal(true), e=entryOf(m,id);
    if(e) e.q+=1; else m.items.push({i:id,q:1});
    toast('Added to '+mealLabel(m)); change();
  },
  inc:function(el){var id=+el.getAttribute('data-id'),m=curMeal(false);if(!m)return;var e=entryOf(m,id);if(e){e.q+=0.5;change()}},
  dec:function(el){var id=+el.getAttribute('data-id'),m=curMeal(false);if(!m)return;var e=entryOf(m,id);if(!e)return;
    e.q-=0.5; if(e.q<0.5) m.items=m.items.filter(function(x){return x!==e}); change()},
  rm:function(el){var id=+el.getAttribute('data-id'),m=curMeal(false);if(!m)return;m.items=m.items.filter(function(x){return x.i!==id});change()},
  dadd:function(el){var id=el.getAttribute('data-id'),m=curMeal(true),e=null;m.drinks.forEach(function(x){if(x.d===id)e=x});
    if(e) e.q+=1; else m.drinks.push({d:id,q:1}); toast(EXTRA[id].name+' added'); change()},
  dinc:function(el){var id=el.getAttribute('data-id'),m=curMeal(false);if(!m)return;m.drinks.forEach(function(x){if(x.d===id)x.q+=0.5});change()},
  ddec:function(el){var id=el.getAttribute('data-id'),m=curMeal(false);if(!m)return;
    m.drinks.forEach(function(x){if(x.d===id)x.q-=0.5}); m.drinks=m.drinks.filter(function(x){return x.q>=0.5}); change()},
  newmeal:function(){newMeal(st.sel,st.slot);st.trayOpen=true;change()},
  pickmeal:function(el){st.active[st.sel+st.slot]=el.getAttribute('data-id');st.confirm=null;renderMenuList();renderTray()},
  delmeal:function(el){
    var id=el.getAttribute('data-id');
    if(st.confirm!==id){st.confirm=id;renderTray();return}
    plans[st.sel].meals=plans[st.sel].meals.filter(function(m){return m.id!==id});
    delete st.active[st.sel+st.slot]; st.confirm=null; persist(st.sel); renderAfterChange(); toast('Meal deleted');
  },
  editmeal:function(el){st.slot=el.getAttribute('data-slot');st.active[st.sel+st.slot]=el.getAttribute('data-id');st.view='build';st.trayOpen=true;renderAll()},
  mfp:function(el){var id=el.getAttribute('data-id');st.mfp=st.mfp===id?null:id;renderTray();renderSummary()},
  mfpnum:function(el){
    var val=el.getAttribute('data-v'), box=el.closest('.mfp'), note=box.querySelector('.mfpnote'), fb=box.querySelector('.mfpfall');
    var label=el.querySelector('.mfp-l').textContent;
    function mark(){box.querySelectorAll('.mfp-num').forEach(function(b){b.classList.remove('done')});el.classList.add('done');note.textContent=label+' ('+val+') copied'}
    function fall(){ fb.innerHTML='<input class="copybox mfp-fall" readonly style="margin-top:10px;min-height:0;height:38px">'; var ta=fb.firstChild; ta.value=val; ta.focus(); ta.select(); note.textContent='Copy was blocked here. The number is selected for you to copy.' }
    try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(val).then(mark,fall) } else fall() }catch(e){fall()}
  },
  copy:function(){
    var text=summaryText(), note=$('copynote');
    function fall(){ $('copyfall').innerHTML='<textarea class="copybox" id="copyta" readonly style="margin-top:10px"></textarea>'; var ta=$('copyta'); ta.value=text; ta.focus(); ta.select(); if(note)note.textContent='Copy was blocked here. The text is selected for you to copy.' }
    try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(function(){if(note)note.textContent='Copied'},fall) } else fall() }catch(e){fall()}
  }
};
/* "Open MyFitnessPal": on phones try the app first, and fall back to the website if it is not installed. */
document.addEventListener('click',function(ev){
  var a=ev.target.closest('a.mfp-open'); if(!a)return;
  var ua=navigator.userAgent||'', ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1), android=/Android/.test(ua);
  if(!ios&&!android)return; /* desktop: the normal link opens the website */
  ev.preventDefault();
  var web=a.getAttribute('href');
  if(android){ location.href='intent://#Intent;scheme=mfp;package=com.myfitnesspal.android;S.browser_fallback_url='+encodeURIComponent(web)+';end'; return }
  var left=false, onHide=function(){left=true};
  document.addEventListener('visibilitychange',onHide); window.addEventListener('pagehide',onHide);
  location.href='mfp://';
  setTimeout(function(){document.removeEventListener('visibilitychange',onHide); if(!left&&!document.hidden) location.href=web},1500);
});
document.addEventListener('click',function(ev){
  var el=ev.target.closest('[data-act]'); if(!el)return;
  var fn=actions[el.getAttribute('data-act')]; if(fn) fn(el);
});
$('q').addEventListener('input',function(e){st.q=e.target.value;renderMenuList()});
$('sort').addEventListener('change',function(e){st.sort=e.target.value;renderMenuList()});

/* ---------- boot ---------- */
$('subtitle').textContent='Menus for '+fmtShort(firstDate)+' to '+fmtShort(lastDate)+', loaded '+fmtShort(D.asof)+'. Build meals from what is served each day.';
$('foot').textContent='Menu items, serving weights, allergens and nutrition come from the PennWest Edinboro dining hall menu. Portion sizes in cups, palms and pieces are estimates converted from those weights. Milk, cereal, bagels, cream cheese and soda use typical label values (1 cup of milk or cereal, one bagel, 2 tbsp of cream cheese, 12 oz soda cans), not dining hall data. Meals you build are saved in this browser only. This is a planning aid, not medical advice. Confirm allergens with dining staff.';
renderAll();
initStore();
})();
