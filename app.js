"use strict";
// Catalog state stays in memory. No forms, network calls, cookies or browser storage.
const $=s=>document.querySelector(s);
const products=catalogProducts,categories=catalogCategories;
let category="all",activeProduct=null,galleryIndex=0;
const byId=id=>products.find(p=>p.id===id);
const categoryName=id=>categories.find(c=>c.id===id)?.name||"Все решения";
const photo=id=>`assets/${String(id).padStart(2,"0")}.webp`;
const portrait=id=>![2,8,9,10,17,20,23,29,30,32,43,46,47].includes(id);
const plural=(n,one,few,many)=>n%10===1&&n%100!==11?one:n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?few:many;
const managerPhone="79637000626";
const publicCatalogUrl="https://okna-bolshoy-strany-catalog.netlify.app/";
function whatsappLink(product){
  const message=product?[
    "Здравствуйте! Хочу заказать вариант из вашего каталога:",
    product.name,
    `Категория: ${categoryName(product.category)}`,
    `Композиция: ${product.shape}`,
    `Отделка: ${product.finish}`,
    `Ссылка на вариант: ${publicCatalogUrl}?product=${encodeURIComponent(product.id)}#catalog`,
    "Подскажите стоимость и помогите уточнить размеры и комплектацию."
  ].join("\n"):"Здравствуйте! Хочу обсудить заказ по каталогу «Окна большой страны».";
  return `https://wa.me/${managerPhone}?text=${encodeURIComponent(message)}`;
}
document.querySelectorAll("[data-manager-wa]").forEach(link=>link.href=whatsappLink());

const icons={
  all:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  glazing:'<path d="M3 20h18M4.5 20V7l7.5-3.5L19.5 7v13"/><path d="M9 20v-8h6v8M12 12v8"/>',
  railings:'<path d="M3 20h4v-4h4v-4h4V8h4"/><path d="M5 13V6M10 9V4M15 6V3"/><path d="M5 6l10-3"/>',
  showers:'<path d="M5 21V8a4 4 0 0 1 4-4h1"/><path d="M8 7h8l-1.5 3h-5z"/><path d="M10 13v1M12 13v2M14 13v1M11 17v1M13 17v1"/>',
  partitions:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M12 3v18M10 12h.01M14 12h.01"/>',
  canopies:'<path d="M3 9h18l-2 3H5z"/><path d="M7 12v9M17 12v9M10 21v-5h4v5"/>',
  "pvc-windows":'<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M12 3v18M4 12h16M15 8.5v2"/>',
  "aluminum-doors":'<rect x="4" y="2.5" width="16" height="19" rx="1"/><path d="M12 2.5v19M10 11v3M14 11v3"/>'
};
const icon=id=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[id]||icons.all}</svg>`;
const covers={glazing:43,railings:36,showers:1,partitions:23,canopies:25,"pvc-windows":47,"aluminum-doors":48};
const newCategories=["pvc-windows","aluminum-doors"];
const countIn=id=>id==="all"?products.length:products.filter(p=>p.category===id).length;
const photosIn=id=>products.filter(p=>id==="all"||p.category===id).reduce((s,p)=>s+p.photos.length,0);
const options=()=>[{id:"all",name:"Все решения"},...categories];

function renderMenu(){
  $("#category-list").innerHTML=options().map(c=>`<button class="category-choice" data-category="${c.id}" aria-pressed="${category===c.id}"><span class="ci">${icon(c.id)}</span><span>${c.name}</span><small>${countIn(c.id)}</small></button>`).join("");
}
function renderChips(){
  $("#category-chips").innerHTML=options().map(c=>`<button class="chip" data-category="${c.id}" data-stay aria-pressed="${category===c.id}">${icon(c.id)}${c.name}<small>${countIn(c.id)}</small></button>`).join("");
  const active=$("#category-chips [aria-pressed=true]");
  if(active){const bar=$("#category-chips");bar.scrollTo({left:active.offsetLeft-bar.clientWidth/2+active.clientWidth/2,behavior:"smooth"});}
}
function renderTiles(){
  $("#category-tiles").innerHTML=categories.map((c,i)=>{const n=countIn(c.id);return `<button class="tile" data-category="${c.id}" aria-label="${c.name}: ${n} ${plural(n,"вариант","варианта","вариантов")}"><img src="${photo(covers[c.id]||products.find(p=>p.category===c.id)?.photos[0])}" alt="" width="800" height="800" loading="${i<4?"eager":"lazy"}"><span class="tile-icon">${icon(c.id)}</span>${newCategories.includes(c.id)?'<span class="tile-new">Новое</span>':""}<span class="tile-body"><span class="tile-name">${c.name}</span><span class="tile-count">${n} ${plural(n,"вариант","варианта","вариантов")}</span></span></button>`}).join("");
}
function card(p,i){
  const n=p.photos.length;
  return `<article class="product-card"><button class="photo-button ${portrait(p.photos[0])?"portrait":""}" data-detail="${p.id}" aria-label="Подробнее: ${p.name}"><img src="${photo(p.photos[0])}" alt="${p.name}: ${p.finish}" width="1200" height="920" loading="${i<3?"eager":"lazy"}"><span class="badge">${icon(p.category)}<span>${categoryName(p.category)}</span></span>${n>1?`<span class="photo-count"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/></svg>${n} фото</span>`:""}</button><div class="product-info"><h3 class="product-title"><button data-detail="${p.id}">${p.name}</button></h3><p class="product-summary">${p.description}</p><div class="product-meta"><span>${p.shape}</span></div><div class="product-actions"><button class="open" data-detail="${p.id}" aria-label="Открыть галерею: ${p.name}">Смотреть${n>1?" галерею":""}</button></div></div></article>`;
}
function render(){
  const current=categories.find(c=>c.id===category),visible=products.filter(p=>category==="all"||p.category===category);
  $("#catalog-title").textContent=current?.name||"Все решения";
  $("#catalog-description").textContent=current?.description||"Выберите направление, форму и отделку, которые подходят вашему пространству.";
  $("#reset-category").hidden=category==="all";
  const photos=photosIn(category);
  $("#result-count").textContent=`${visible.length} ${plural(visible.length,"вариант","варианта","вариантов")} · ${photos} ${plural(photos,"фотография","фотографии","фотографий")}`;
  if(category==="all"){
    let k=0;
    $("#products").className="groups";
    $("#products").innerHTML=categories.map(c=>{const items=products.filter(p=>p.category===c.id);if(!items.length)return"";const shown=items.slice(0,3);
      return `<section class="group" aria-label="${c.name}"><div class="group-head"><div class="group-title"><span class="group-icon">${icon(c.id)}</span><div><h3>${c.name}</h3><p>${items.length} ${plural(items.length,"вариант","варианта","вариантов")}</p></div></div>${items.length>shown.length?`<button class="group-more" data-category="${c.id}" data-stay>Все ${items.length}</button>`:""}</div><div class="product-grid">${shown.map(p=>card(p,k++)).join("")}</div></section>`}).join("");
  }else{
    $("#products").className="product-grid";
    $("#products").innerHTML=visible.map(card).join("");
  }
  renderMenu();renderChips();
}
function renderStats(){
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set("stat-categories",categories.length);set("stat-products",products.length);set("stat-photos",products.reduce((s,p)=>s+p.photos.length,0));
  const sp=document.getElementById("stat-products");if(sp)sp.nextElementSibling.textContent=plural(products.length,"готовый вариант","готовых варианта","готовых вариантов");
}
function syncLock(){document.body.classList.toggle("dialog-open",!!document.querySelector("dialog[open]"));}
function openDialog(dialog){dialog.showModal();syncLock();}
function closeDialog(dialog){dialog.close();syncLock();}
function chooseCategory(id){
  category=id;closeDialog($("#category-menu"));render();
  $("#catalog").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"instant":"smooth"});
  $("#catalog-title").focus({preventScroll:true});
}
$("#menu-trigger").addEventListener("click",()=>{renderMenu();openDialog($("#category-menu"));$("#menu-trigger").setAttribute("aria-expanded","true");});
$("#category-menu").addEventListener("close",()=>{$("#menu-trigger").setAttribute("aria-expanded","false");syncLock();});
$("#reset-category").addEventListener("click",()=>{category="all";render();$("#catalog-title").focus({preventScroll:true});});

function showPhoto(index){
  galleryIndex=(index+activeProduct.photos.length)%activeProduct.photos.length;
  $("#gallery-image").src=photo(activeProduct.photos[galleryIndex]);
  $("#gallery-image").alt=`${activeProduct.name}, фотография ${galleryIndex+1}`;
  $("#gallery-count").textContent=`${galleryIndex+1} из ${activeProduct.photos.length}`;
  const single=activeProduct.photos.length===1;
  $("#gallery-prev").disabled=single;$("#gallery-next").disabled=single;
  $("#gallery-thumbnails").hidden=single;
  document.querySelectorAll("[data-photo]").forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.photo)===galleryIndex)));
}
function openProduct(id){
  activeProduct=byId(id);galleryIndex=0;
  $("#product-title").textContent=activeProduct.name;
  $("#gallery-category").innerHTML=`${icon(activeProduct.category)}${categoryName(activeProduct.category)}`;
  $("#product-description").textContent=activeProduct.description;
  $("#product-properties").innerHTML=`<div><dt>Композиция</dt><dd>${activeProduct.shape}</dd></div><div><dt>Отделка</dt><dd>${activeProduct.finish}</dd></div>`;
  $("#gallery-thumbnails").innerHTML=activeProduct.photos.map((id,i)=>`<button data-photo="${i}" aria-label="Фотография ${i+1}" aria-pressed="${i===0}"><img src="${photo(id)}" alt="" width="62" height="62" loading="lazy"></button>`).join("");
  $("#product-whatsapp").href=whatsappLink(activeProduct);
  showPhoto(0);openDialog($("#product-dialog"));
}
$("#gallery-prev").addEventListener("click",()=>showPhoto(galleryIndex-1));
$("#gallery-next").addEventListener("click",()=>showPhoto(galleryIndex+1));
$("#product-dialog").addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();showPhoto(galleryIndex+(e.key==="ArrowRight"?1:-1));}});
document.addEventListener("click",e=>{
  const close=e.target.closest("[data-close]");if(close){closeDialog(close.closest("dialog"));return;}
  const cat=e.target.closest("[data-category]");if(cat){chooseCategory(cat.dataset.category);return;}
  const detail=e.target.closest("[data-detail]");if(detail){openProduct(detail.dataset.detail);return;}
  const image=e.target.closest("[data-photo]");if(image){showPhoto(Number(image.dataset.photo));return;}
});
document.querySelectorAll("dialog").forEach(dialog=>{
  dialog.addEventListener("close",syncLock);
  dialog.addEventListener("click",e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(dialog);});
});
document.addEventListener("error",e=>{if(e.target.tagName==="IMG"){e.target.alt="Не удалось загрузить фотографию. Обновите страницу.";}},true);
renderTiles();renderStats();render();
const requestedProduct=new URLSearchParams(location.search).get("product");
if(requestedProduct&&byId(requestedProduct))openProduct(requestedProduct);
