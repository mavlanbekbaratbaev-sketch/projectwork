const $=s=>document.querySelector(s);
const rooms=["Все","Гостиная","Спальня","Кухня","Прихожая","Участок"];
const D=[
 {id:"l1",r:"Гостиная",n:"Основной свет",t:"light",on:true,v:70,w:40,top:"living/light"},
 {id:"t1",r:"Гостиная",n:"Климат",t:"temp",on:true,v:22,w:900,top:"living/climate"},
 {id:"b1",r:"Гостиная",n:"Шторы",t:"blind",on:false,v:0,w:0,top:"living/blinds"},
 {id:"tv",r:"Гостиная",n:"Розетка ТВ",t:"plug",on:true,w:120,top:"living/plug1"},
 {id:"l2",r:"Спальня",n:"Ночник",t:"light",on:false,v:30,w:10,top:"bed/light"},
 {id:"t2",r:"Спальня",n:"Климат",t:"temp",on:false,v:21,w:700,top:"bed/climate"},
 {id:"k1",r:"Кухня",n:"Свет над столом",t:"light",on:true,v:90,w:30,top:"kitchen/light"},
 {id:"lk",r:"Кухня",n:"Датчик протечки",t:"sensor",st:"Сухо",w:1,top:"kitchen/leak"},
 {id:"sm",r:"Кухня",n:"Датчик дыма",t:"sensor",st:"Норма",w:1,top:"kitchen/smoke"},
 {id:"d1",r:"Прихожая",n:"Умный замок",t:"lock",on:true,w:2,top:"hall/lock"},
 {id:"c1",r:"Прихожая",n:"Камера входа",t:"cam",on:true,w:6,top:"hall/cam"},
 {id:"m1",r:"Прихожая",n:"Датчик движения",t:"sensor",st:"Нет движения",w:1,top:"hall/motion"},
 {id:"sr",r:"Прихожая",n:"Сирена",t:"siren",on:false,w:5,top:"hall/siren"},
 {id:"vl",r:"Кухня",n:"Клапан воды",t:"valve",on:true,w:3,top:"kitchen/valve"},
 {id:"gs",r:"Кухня",n:"Датчик газа",t:"sensor",st:"Норма",w:1,top:"kitchen/gas"},
 {id:"w1",r:"Гостиная",n:"Окно",t:"sensor",st:"Закрыто",w:1,top:"living/window"},
 {id:"sp",r:"Гостиная",n:"Умная колонка",t:"plug",on:false,w:8,top:"living/speaker"},
 {id:"w2",r:"Спальня",n:"Влажность и CO₂",t:"sensor",st:"CO₂ в норме",w:1,top:"bed/air"},
 {id:"gt",r:"Участок",n:"Ворота",t:"gate",on:false,w:60,top:"yard/gate"},
 {id:"ir",r:"Участок",n:"Полив",t:"plug",on:false,w:30,top:"yard/irrigation"},
 {id:"sl",r:"Участок",n:"Датчик почвы",t:"sensor",st:"Влажность 42%",w:1,top:"yard/soil"}
];
const SC=[
 ["Утро","Свет 60%, шторы открыты",d=>{set("l1",{on:true,v:60});set("b1",{on:true});set("t1",{v:22})}],
 ["Ухожу","Всё выключено, замок закрыт",d=>{D.forEach(x=>{if(["light","plug"].includes(x.t))x.on=false});set("t1",{v:18});set("d1",{on:true});$("#sMode").textContent="Охрана"}],
 ["Кино","Приглушённый свет, шторы закрыты",d=>{set("l1",{on:true,v:15});set("b1",{on:false});set("tv",{on:true})}],
 ["Ночь","Свет выкл., ночник 10%",d=>{D.forEach(x=>{if(x.t==="light")x.on=false});set("l2",{on:true,v:10});set("d1",{on:true});$("#sMode").textContent="Ночной"}],
 ["Отпуск","Охрана, вода перекрыта, полив",d=>{D.forEach(x=>{if(["light","plug"].includes(x.t))x.on=false});set("vl",{on:false});set("gt",{on:false});set("ir",{on:true});set("d1",{on:true});$("#sMode").textContent="Отпуск"}]
];
let room="Все";
function log(m){const e=$("#log"),p=document.createElement("div");p.innerHTML="<b>"+new Date().toLocaleTimeString("ru-RU")+"</b> "+m;e.prepend(p);while(e.children.length>30)e.lastChild.remove()}
function set(id,o){const d=D.find(x=>x.id===id);Object.assign(d,o);log("MQTT publish <b>home/"+d.top+"</b> "+JSON.stringify(o))}
function pw(d){if(d.t==="sensor"||d.t==="cam")return d.w;if(!d.on)return 0;return d.t==="light"?Math.round(d.w*d.v/100):d.w}
function render(){
 $("#rooms").innerHTML=rooms.map(r=>`<button class="chip" aria-pressed="${r===room}" data-r="${r}">${r}</button>`).join("");
 $("#devs").innerHTML=D.filter(d=>room==="Все"||d.r===room).map(d=>{
  let body="",head="";
  const tg=`<button class="sw" role="switch" aria-checked="${!!d.on}" aria-label="${d.n}" data-a="tg" data-id="${d.id}"></button>`;
  if(d.t==="light")head=tg,body=`<input type="range" min="5" max="100" value="${d.v}" aria-label="Яркость" data-a="br" data-id="${d.id}"><span class="meta">Яркость ${d.v}%</span>`;
  if(d.t==="temp")head=tg,body=`<div class="row"><button class="step" data-a="dn" data-id="${d.id}" aria-label="Холоднее">−</button><span class="val">${d.v}°</span><button class="step" data-a="up" data-id="${d.id}" aria-label="Теплее">+</button></div>`;
  if(d.t==="blind")head=tg,body=`<span class="meta">${d.on?"Открыты":"Закрыты"}</span>`;
  if(d.t==="plug")head=tg,body=`<span class="meta">${d.on?d.w+" Вт":"Выключена"}</span>`;
  if(d.t==="lock")head=tg,body=`<span class="badge ${d.on?"ok":""}">${d.on?"Закрыт":"Открыт"}</span>`;
  if(d.t==="cam")head=tg,body=`<span class="badge ok">${d.on?"Запись RTSP":"Отключена"}</span>`;
  if(d.t==="valve")head=tg,body=`<span class="badge ${d.on?"ok":""}">${d.on?"Открыт":"Перекрыт"}</span>`;
  if(d.t==="siren")head=tg,body=`<span class="badge">${d.on?"Включена":"Готова"}</span>`;
  if(d.t==="gate")head=tg,body=`<span class="badge ${d.on?"":"ok"}">${d.on?"Открыты":"Закрыты"}</span>`;
  if(d.t==="sensor")head=`<span class="badge ok">${d.st}</span>`,body=`<button class="chip" data-a="trig" data-id="${d.id}">Проверить сработку</button>`;
  return `<article class="dev ${d.on?"on":""}"><header><div><h3>${d.n}</h3><span class="meta">${d.r}</span></div>${head}</header>${body}</article>`}).join("");
 $("#sOn").textContent=D.filter(d=>d.on).length;
 $("#sPw").textContent=D.reduce((a,d)=>a+pw(d),0)+" Вт";
 const rm=rooms.slice(1),rp=rm.map(r=>D.filter(d=>d.r===r).reduce((a,d)=>a+pw(d),0)),mx=Math.max(1,...rp);
 $("#en").innerHTML="<h3 style='font-size:15px;margin-bottom:8px'>Потребление по комнатам</h3>"+rm.map((r,i)=>`<div class="row" style="margin:4px 0"><span style="width:90px">${r}</span><div style="flex:1;background:var(--bg);border-radius:6px;height:10px"><div style="width:${rp[i]/mx*100}%;height:10px;border-radius:6px;background:var(--ac)"></div></div><span style="width:60px;text-align:right">${rp[i]} Вт</span></div>`).join("");
}
document.addEventListener("click",e=>{
 const r=e.target.closest("[data-r]");if(r){room=r.dataset.r;render();return}
 const b=e.target.closest("[data-a]");if(!b)return;
 const d=D.find(x=>x.id===b.dataset.id),a=b.dataset.a;
 if(a==="tg")set(d.id,{on:!d.on});
 if(a==="up")set(d.id,{v:Math.min(30,d.v+1)});
 if(a==="dn")set(d.id,{v:Math.max(16,d.v-1)});
 if(a==="trig"){const m={lk:["Протечка!","Сухо"],sm:["Дым!","Норма"],gs:["Утечка газа!","Норма"],w1:["Открыто","Закрыто"],w2:["CO₂ высокий","CO₂ в норме"],sl:["Сухо, нужен полив","Влажность 42%"],m1:["Движение","Нет движения"]}[d.id];d.st=m[0];log("ALERT <b>"+d.n+"</b>: "+m[0]);
  if(d.id==="lk")set("vl",{on:false});
  if(d.id==="sm"||d.id==="gs")set("sr",{on:true});
  if(d.id==="sl")set("ir",{on:true});
  if(d.id==="w2")log("Автоправило: включить вентиляцию");
  if(d.id==="w1")log("Автоправило: уведомление «окно открыто»");
  render();setTimeout(()=>{d.st=m[1];if(d.id==="sm"||d.id==="gs")set("sr",{on:false});if(d.id==="sl")set("ir",{on:false});render()},2500);return}
 render()});
document.addEventListener("change",e=>{const b=e.target.closest("[data-a=br]");if(b){set(b.dataset.id,{v:+b.value});render()}});
$("#scenes").innerHTML=SC.map((s,i)=>`<button class="scene" data-s="${i}">${s[0]}<small>${s[1]}</small></button>`).join("");
$("#scenes").addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b)return;const s=SC[+b.dataset.s];log("Сцена «"+s[0]+"»");s[2]();render()});
function clk(){$("#clock").textContent=new Date().toLocaleString("ru-RU",{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})}
clk();setInterval(clk,30000);
// Nav
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{
 document.querySelectorAll(".nav").forEach(x=>x.setAttribute("aria-selected",x===b));
 document.querySelectorAll(".view").forEach(v=>v.hidden=v.id!==b.dataset.v);
 try{history.replaceState(null,"","#"+b.dataset.v)}catch(e){}
});
const h=location.hash.slice(1);if(["ctl","net","addr","spec"].includes(h))document.querySelector(`.nav[data-v=${h}]`).click();
$("#theme").onclick=()=>{const r=document.documentElement,dk=getComputedStyle(r).getPropertyValue("--bg").trim()==="#0e1823";r.dataset.theme=dk?"light":"dark"};
// VLANs
const V=[
 [10,"Управление","192.168.10.0/24","192.168.10.1","—","Сетевое оборудование, сервер","#14263a"],
 [20,"IoT: свет, климат, датчики","192.168.20.0/24","192.168.20.1",".50–.250","Умные устройства","#e8590c"],
 [30,"Безопасность: камеры, замок","192.168.30.0/24","192.168.30.1",".50–.250","Камеры, замок","#c2255c"],
 [40,"Пользователи","192.168.40.0/24","192.168.40.1",".50–.250","Смартфоны, ноутбуки","#1b8a5a"],
 [50,"Гости","192.168.50.0/24","192.168.50.1",".50–.250","Гостевой Wi-Fi","#7048e8"]];
$("#vt").innerHTML=V.map(v=>`<tr><td><span class="dot" style="background:${v[6]}"></span>${v[0]}</td><td>${v[1]}</td><td>${v[2]}</td><td>${v[3]}</td><td>${v[4]}</td><td>${v[5]}</td></tr>`).join("");
function calc(){const n=Math.max(1,+$("#nd").value||1)+2;let b=2;while(Math.pow(2,b)<n+2)b++;$("#nr").innerHTML=`Нужно адресов: <b>${n}</b> → маска <b>/${32-b}</b> (${Math.pow(2,b)-2} хостов)`}
$("#nd").oninput=calc;calc();
// Topology
const N=[
 ["inet","Интернет",380,22,"Провайдер","Внешний канал, публичный IP.",null],
 ["rt","Роутер Cisco 2911",380,100,"Gi0/0: WAN; Gi0/1.10–50: подинтерфейсы","NAT, DHCP, межVLAN-маршрутизация, ACL.","inet"],
 ["sw0","Коммутатор SW-CORE",380,185,"Trunk (802.1Q) на все VLAN","Ядро сети дома, все VLAN разрешены на магистралях.","rt"],
 ["sw1","SW-1 PoE",160,270,"Access: VLAN 10 и 30, PoE","Коммутатор с PoE (Cisco 2960-PoE): питает камеры и точки доступа по кабелю. Сервер, NAS, замок.","sw0"],
 ["sw2","SW-2 (Cisco 2960)",380,270,"Access: VLAN 20","Освещение, розетки, датчики.","sw0"],
 ["ap","Точка доступа Wi-Fi",600,270,"Trunk: VLAN 40 и 50","SSID «Home» и «Guest».","sw0"],
 ["srv","Сервер умного дома",80,365,"VLAN 10, 192.168.10.10","MQTT-брокер, веб-интерфейс, автоматизация.","sw1"],
 ["cam","Камеры и замок",240,365,"VLAN 30, 192.168.30.x","RTSP-поток на сервер.","sw1"],
 ["hub","Zigbee-хаб",380,365,"VLAN 20, 192.168.20.5","Шлюз для Zigbee-устройств: лампы, датчики, кнопки. Подключён по Ethernet, общается с сервером по MQTT.","sw2"],
 ["zig","Датчики Zigbee",380,430,"Mesh-сеть 2,4 ГГц","Датчики окон, протечки, дыма, газа, температуры. Малое энергопотребление, батарейки служат годами.","hub"],
 ["nas","NAS (записи)",160,430,"VLAN 10, 192.168.10.20","Хранение видео с камер и резервных копий конфигурации.","sw1"],
 ["g4","Резерв 4G",160,22,"Резервный канал","Запасной выход в интернет при сбое основного провайдера.","inet",1],
 ["vpn","VPN-доступ",160,100,"VPN на роутере","Безопасный удалённый доступ хозяина к дому. VPN-клиентам доступен только сервер умного дома.","rt",1],
 ["ups","ИБП",600,100,"Резервное питание","Питает роутер, коммутаторы и сервер. Охрана и связь работают при отключении света.","rt",1],
 ["usr","Смартфоны и ПК",540,365,"VLAN 40, 192.168.40.x","Приложение и веб-интерфейс.","ap"],
 ["gst","Гости",680,365,"VLAN 50, 192.168.50.x","Только интернет.","ap"]];
const col={sw1:"#14263a",srv:"#14263a",cam:"#c2255c",hub:"#e8590c",zig:"#e8590c",nas:"#14263a",usr:"#1b8a5a",gst:"#7048e8"};
let s="";const P=Object.fromEntries(N.map(n=>[n[0],n]));
N.forEach(n=>{if(n[7]){s+=`<path class="lnk" stroke-dasharray="5 4" d="M${n[2]} ${n[3]}H${P[n[6]][2]}"/>`}else if(n[6]){const p=P[n[6]];s+=`<path class="lnk" d="M${p[2]} ${p[3]+18}V${(p[3]+n[3])/2}H${n[2]}V${n[3]-18}" ${n[0] in col?`style="stroke:${col[n[0]]}"`:""}/>`}});
N.forEach(n=>{s+=`<g class="node" tabindex="0" role="button" data-n="${n[0]}"><rect x="${n[2]-62}" y="${n[3]-18}" width="124" height="36" rx="8"/><text x="${n[2]}" y="${n[3]+4}" text-anchor="middle" font-size="11.5">${n[1].length>20?n[1].slice(0,19)+"…":n[1]}</text></g>`});
$("#topo").innerHTML=s;
function pick(id){const n=P[id];document.querySelectorAll(".node").forEach(g=>g.classList.toggle("sel",g.dataset.n===id));
 $("#info").innerHTML=`<h3 style="font-size:15px;margin-bottom:6px">${n[1]}</h3><div>${n[4]}</div><div class="meta" style="color:var(--mut)">${n[5]}</div>`}
$("#topo").addEventListener("click",e=>{const g=e.target.closest("[data-n]");if(g)pick(g.dataset.n)});
$("#topo").addEventListener("keydown",e=>{if(e.key==="Enter"){const g=e.target.closest("[data-n]");if(g)pick(g.dataset.n)}});
render();log("Система запущена, сервер 192.168.10.10 доступен");
