/* Empira Teacher Pro: UI-only; no live billing or entitlement grants. */
(function(){
'use strict';
var el=function(id){return document.getElementById(id)}, selected='quarter';
var price={quarter:25000,year:100000},term={quarter:'1 chorak',year:'4 chorak'};
var money=function(n){return n.toLocaleString('ru-RU')+' so‘m'};
var go=function(id){if(typeof show==='function')show(id);else location.hash=id};
var style=document.createElement('link');style.rel='stylesheet';style.href='/dashboard/teacher-pro.css';document.head.appendChild(style);
var board=el('sc-dashboard');if(!board)return;
var tiles=board.querySelector('.tiles');if(!tiles)return;
var hub=document.createElement('section');hub.className='ep-hub';hub.innerHTML=[
'<div class="ep-hub__hero"><div class="ep-hub__main">',
'<div class="ep-kicker">EMPIRA · O‘QITUVCHILAR UCHUN</div>',
'<h2>Darsga tayyorlanish<br>endi osonroq.</h2>',
'<p>3D laboratoriyalar hamma uchun bepul. Prezentatsiyalar va Build Mode — Teacher Pro obunasida.</p>',
'<div class="ep-hub__actions"><button class="ep-btn ep-btn--bright" data-ep-go="subscription">Teacher Pro tariflari ↗</button>',
'<button class="ep-btn ep-btn--light" data-ep-go="topics">Prezentatsiyalarni ko‘rish</button></div></div>',
'<aside class="ep-hub__aside"><div class="ep-aside-label">EMPIRA TEACHER PRO</div><strong>25 000 so‘m</strong>',
'<p>Bir akademik chorak uchun. Bitta o‘qituvchining barcha sinflari.</p><div class="ep-aside-rule"></div>',
'<p class="ep-aside-sub">✓ Prezentatsiyalar</p><p class="ep-aside-sub">✓ Build Mode</p></aside></div>',
'<div class="ep-hub__strip"><span><b>✓</b> 3D laboratoriyalar — bepul</span><span>▣ Prezentatsiyalar — Pro</span><span>◈ Build Mode — Pro</span></div>'
].join('');
tiles.parentElement.insertBefore(hub,tiles);
var right=board.querySelector('.tbar .right');
if(right){var quick=document.createElement('button');quick.className='ep-tbar-cta';quick.textContent='Obunam ↗';quick.setAttribute('data-ep-go','subscription');right.insertBefore(quick,right.firstChild)}
var acc=el('sc-account'), actions=acc&&acc.querySelector('.acc-actions');
if(actions){var shortcut=document.createElement('div');shortcut.className='ep-account-shortcut';shortcut.innerHTML='<span>Teacher Pro obuna va tariflar</span><button type="button" data-ep-go="subscription">Ko‘rish →</button>';actions.parentElement.insertBefore(shortcut,actions)}
var screens=document.createElement('div');
screens.innerHTML=[
'<section class="screen" id="sc-subscription"><div class="ep-section">',
'<div class="ep-page-top"><button class="ep-back" data-ep-go="dashboard">← O‘qituvchi kabineti</button><b class="ep-small-brand"><span class="ep-small-brand__mark">E</span> Empira</b></div>',
'<header class="ep-intro"><div class="ep-kicker">EMPIRA · TEACHER PRO</div><h1>Darsga tayyorlanish<br>endi osonroq.</h1>',
'<p>3D laboratoriyalar doim bepul. O‘qituvchilar uchun tayyor prezentatsiyalar va Build Mode Pro tarifida mavjud.</p>',
'<div class="ep-intro__status">● Obuna integratsiyasi kutilmoqda</div></header>',
'<div class="ep-subbar"><div><strong>Obunam</strong><small>Obuna holati serverga hali ulanmagan.</small></div><span class="ep-status">To‘lov tizimi tayyorlanmoqda</span></div>',
'<h2 class="ep-section-title">Tariflar</h2><p class="ep-section-note">Bitta o‘qituvchi — barcha sinflari. Fizika bo‘yicha narxlar.</p>',
'<div class="ep-pricing-grid">',
'<article class="ep-plan"><div class="ep-plan__tag">BARCHA UCHUN</div><h3>Empira Free</h3><div class="ep-plan__price">0 so‘m</div><div class="ep-plan__term">Doim bepul</div>',
'<ul><li>Barcha mavjud 3D laboratoriyalar</li><li>Tajriba va simulyatsiyalar</li><li>O‘quvchilar va o‘qituvchilar uchun</li></ul><button class="ep-btn ep-btn--muted" disabled>Doim bepul</button></article>',
'<article class="ep-plan ep-plan--featured"><div class="ep-plan__tag">✦ O‘QITUVCHILAR UCHUN</div><h3>Teacher Pro</h3>',
'<div class="ep-plan__price">25 000 so‘m <small>/ chorak</small></div><div class="ep-plan__term">Bir akademik chorak</div>',
'<ul><li>Barcha bepul laboratoriyalar</li><li>Tayyor prezentatsiyalar</li><li>Build Mode — tajribalarni yig‘ish</li><li>Barcha sinflar uchun bitta obuna</li></ul>',
'<button class="ep-btn ep-btn--blue" data-ep-plan="quarter">Tarifni tanlash →</button></article></div>',
'<div class="ep-subbar"><div><strong>1 o‘quv yili — 100 000 so‘m</strong><small>4 chorak uchun hisoblangan taklif.</small></div>',
'<button class="ep-btn ep-btn--outline" data-ep-plan="year">Yillik variant ↗</button></div>',
'<h2 class="ep-section-title">Bepul va Pro o‘rtasidagi farq</h2><div class="ep-table" role="table">',
'<div class="ep-table__row"><span>Imkoniyat</span><span>Free</span><span>Pro</span></div>',
'<div class="ep-table__row"><span>3D laboratoriyalar</span><span class="ep-table__yes">✓</span><span class="ep-table__yes">✓</span></div>',
'<div class="ep-table__row"><span>Simulyatsiyalar</span><span class="ep-table__yes">✓</span><span class="ep-table__yes">✓</span></div>',
'<div class="ep-table__row"><span>Prezentatsiyalar</span><span class="ep-table__no">—</span><span class="ep-table__yes">✓</span></div>',
'<div class="ep-table__row"><span>Build Mode</span><span class="ep-table__no">—</span><span class="ep-table__yes">✓</span></div></div>',
'<div class="ep-notice"><b>To‘lovlar hali ulanmagan.</b> Bu bosqichda tarifni tanlash va jamoaga so‘rov yuborish mumkin. Haqiqiy to‘lov yoki obuna faollashuvi bajarilmaydi.</div>',
'</div></section>',
'<section class="screen" id="sc-checkout"><div class="ep-section">',
'<div class="ep-page-top"><button class="ep-back" data-ep-go="subscription">← Tariflarga qaytish</button><b class="ep-small-brand"><span class="ep-small-brand__mark">E</span> Empira</b></div>',
'<header class="ep-intro"><div class="ep-kicker">OBUNA SO‘ROVI</div><h1>Teacher Pro obunasi</h1>',
'<p>Tarifni tanlang. Onlayn to‘lov hali ulanmagani uchun jamoaga so‘rov yuborishingiz mumkin.</p></header>',
'<div class="ep-checkout-layout"><div class="ep-checkout-box"><h2>Obuna muddati</h2>',
'<div class="ep-select-row"><label><input name="ep-plan" type="radio" value="quarter" checked> Bir chorak</label><span>25 000 so‘m</span></div>',
'<div class="ep-select-row"><label><input name="ep-plan" type="radio" value="year"> Bir o‘quv yili</label><span>100 000 so‘m</span></div>',
'<h2 style="margin-top:28px">To‘lov usullari</h2><p class="ep-section-note">Hozircha karta ma’lumotlarini kiritmang.</p>',
'<div class="ep-method-grid"><div class="ep-method">CLICK<small>Tez orada</small></div><div class="ep-method">PAYME<small>Tez orada</small></div></div></div>',
'<aside class="ep-checkout-box"><h2>Buyurtmangiz</h2><div class="ep-sum-row"><span>Tarif</span><b>Teacher Pro</b></div>',
'<div class="ep-sum-row"><span>Fan</span><b>Fizika</b></div><div class="ep-sum-row"><span>Muddat</span><b id="ep-checkout-term">1 chorak</b></div>',
'<p class="ep-section-note" id="ep-checkout-plan" style="margin-top:20px">Fizika Teacher Pro · 1 chorak</p>',
'<div class="ep-checkout-total" id="ep-checkout-total">25 000 so‘m</div>',
'<a href="mailto:hello@empira.uz" id="ep-contact-order" class="ep-btn ep-btn--blue">Jamoaga so‘rov yuborish ↗</a>',
'<p class="ep-helper">Pochta ilovasida so‘rov tayyorlanadi. To‘lov amalga oshmaydi.</p>',
'<button class="ep-btn ep-btn--outline" style="width:100%;margin-top:12px" data-ep-go="subscription">Tariflarni ko‘rish</button></aside></div>',
'</div></section>'
].join('');
while(screens.firstElementChild)board.parentElement.insertBefore(screens.firstElementChild,board.nextSibling);
document.querySelectorAll('[data-ep-go]').forEach(function(b){b.addEventListener('click',function(){go(b.getAttribute('data-ep-go'))})});
document.querySelectorAll('[data-ep-plan]').forEach(function(b){b.addEventListener('click',function(){selected=b.getAttribute('data-ep-plan')==='year'?'year':'quarter';refresh();go('checkout')})});
document.querySelectorAll('input[name="ep-plan"]').forEach(function(r){r.addEventListener('change',function(){if(r.checked){selected=r.value;refresh()}})});
function refresh(){
 var p=price[selected];
 if(el('ep-checkout-total'))el('ep-checkout-total').textContent=money(p);
 if(el('ep-checkout-term'))el('ep-checkout-term').textContent=term[selected];
 if(el('ep-checkout-plan'))el('ep-checkout-plan').textContent='Fizika Teacher Pro · '+term[selected];
 document.querySelectorAll('input[name="ep-plan"]').forEach(function(r){r.checked=(r.value===selected)});
 var mail=el('ep-contact-order');
 if(mail){var body='Assalomu alaykum!\n\nMen Empira Teacher Pro '+term[selected]+' ('+money(p)+') uchun obuna bo‘yicha ma’lumot olmoqchiman.\n\nRahmat.';
 mail.href='mailto:hello@empira.uz?subject='+encodeURIComponent('Empira Pro obuna so‘rovi')+'&body='+encodeURIComponent(body)}
}
refresh();
})();