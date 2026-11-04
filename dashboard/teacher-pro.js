/* Empira Teacher Pro — UI-only subscription flow.
   Real entitlement and payment processing MUST be added server-side before activation.
   This module never stores card details or marks orders as paid. */
(function () {
  'use strict';
  var PLANS = {
    quarter: {label:"Fizika Teacher Pro · 1 chorak", price:25000, period:"1 chorak"},
    year: {label:"Fizika Teacher Pro · 1 o‘quv yili", price:100000, period:"4 chorak"}
  };
  var selected = "quarter";
  var money = function (amount) { return new Intl.NumberFormat("ru-RU").format(amount) + " so‘m"; };
  var get = function (id) { return document.getElementById(id); };
  var openScreen = function (target) {
    if (typeof show === 'function') show(target);
    else location.hash = target;
  };
  function refreshCheckout () {
    var plan = PLANS[selected];
    var total = get('ep-checkout-total');
    var term = get('ep-checkout-term');
    var line = get('ep-checkout-plan');
    if(total) total.textContent = money(plan.price);
    if(term) term.textContent = plan.period;
    if(line) line.textContent = plan.label;
    document.querySelectorAll('input[name="ep-plan"]').forEach(function (radio) {
      radio.checked = radio.value === selected;
    });
    var mail = get('ep-contact-order');
    if(mail) {
      var subject = 'Empira Teacher Pro — obuna so‘rovi';
      var body = 'Assalomu alaykum!\n\nMen ' + plan.label + ' (' + money(plan.price) + ') bo‘yicha to‘lov va ulanish tartibini bilmoqchiman.\n\nRahmat.';
      mail.href = 'mailto:hello@empira.uz?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }
  }
  document.querySelectorAll('[data-ep-plan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      selected = btn.getAttribute('data-ep-plan') === 'year' ? 'year' : 'quarter';
      refreshCheckout();
      openScreen('checkout');
    });
  });
  document.querySelectorAll('input[name="ep-plan"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      if(!radio.checked) return;
      selected = radio.value === 'year' ? 'year' : 'quarter';
      refreshCheckout();
    });
  });
  // Reminder: client-side screens do not grant Pro access.
  // The subscription status is intentionally labelled unverified until
  // a server-authenticated subscriptions endpoint is implemented.
  refreshCheckout();
})();
