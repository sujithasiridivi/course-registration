(function () {
  var form = document.getElementById('reg');
  var $ = function (id) { return document.getElementById(id); };
  var fields = ['name', 'email', 'mobile', 'course', 'password', 'confirm', 'mode', 'terms'];
  var typoDomains = { 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmail.co': 'gmail.com',
                      'yaho.com': 'yahoo.com', 'yahoo.con': 'yahoo.com', 'hotmial.com': 'hotmail.com', 'outlok.com': 'outlook.com' };

  // Each checker returns an error message, or '' when valid.
  // HTML5 validity flags give the first pass; JS adds the stricter rules.
  var check = {
    name: function (el) {
      var v = el.value.trim();
      if (el.validity.valueMissing || !v) return 'Enter your full name.';
      if (v.length < 3) return 'Name must be at least 3 characters.';
      if (/\d/.test(v)) return 'Name cannot contain numbers.';
      if (el.validity.patternMismatch || /\s{2,}/.test(el.value)) return 'Use letters, spaces, apostrophes or hyphens only.';
      if (v.split(/\s+/).length < 2) return 'Include your first and last name.';
      return '';
    },
    email: function (el) {
      var v = el.value.trim();
      if (!v) return 'Enter your email address.';
      if (el.validity.typeMismatch || el.validity.patternMismatch || /\.\./.test(v)) return 'Enter a valid email, like name@example.com.';
      var domain = v.split('@')[1].toLowerCase();
      if (typoDomains[domain]) return 'Did you mean ' + v.split('@')[0] + '@' + typoDomains[domain] + '?';
      return '';
    },
    mobile: function (el) {
      var v = el.value;
      if (!v) return 'Enter your mobile number.';
      if (!/^\d+$/.test(v)) return 'Use digits only, with no spaces or +91.';
      if (v.length !== 10) return 'Mobile number must be exactly 10 digits (' + v.length + ' entered).';
      if (!/^[6-9]/.test(v)) return 'Mobile number must start with 6, 7, 8 or 9.';
      if (/^(\d)\1{9}$/.test(v)) return 'That number looks invalid. Check it and try again.';
      return '';
    },
    course: function (el) { return el.value ? '' : 'Select a course.'; },
    password: function (el) {
      var v = el.value, nm = $('name').value.trim().split(/\s+/)[0].toLowerCase();
      if (!v) return 'Create a password.';
      var miss = [];
      if (v.length < 8) miss.push('at least 8 characters');
      if (!/[a-z]/.test(v)) miss.push('a lowercase letter');
      if (!/[A-Z]/.test(v)) miss.push('an uppercase letter');
      if (!/[0-9]/.test(v)) miss.push('a number');
      if (!/[^A-Za-z0-9]/.test(v)) miss.push('a symbol');
      if (miss.length) return 'Password needs ' + miss.join(', ') + '.';
      if (/\s/.test(v)) return 'Password cannot contain spaces.';
      if (nm.length > 2 && v.toLowerCase().indexOf(nm) > -1) return 'Password should not contain your name.';
      return '';
    },
    confirm: function (el) {
      if (!el.value) return 'Re-enter your password.';
      return el.value === $('password').value ? '' : 'Passwords do not match.';
    },
    mode: function () { return form.elements.mode.value ? '' : 'Choose how you will attend.'; },
    terms: function (el) { return el.checked ? '' : 'You must confirm to continue.'; }
  };

  function show(id, msg) {
    var wrap = id === 'mode' ? $('modeField') : $(id).closest('.field');
    var err = $(id + '-e');
    err.textContent = msg;
    wrap.classList.toggle('invalid', !!msg);
    wrap.classList.toggle('valid', !msg && id !== 'terms' && id !== 'mode');
    var control = id === 'mode' ? form.elements.mode[0] : $(id);
    if (id !== 'mode') control.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function validate(id) {
    var el = id === 'mode' ? form.elements.mode[0] : $(id);
    var msg = check[id](el);
    show(id, msg);
    return !msg;
  }

  function updatePassword() {
    var v = $('password').value;
    var tests = { len: v.length >= 8, low: /[a-z]/.test(v), up: /[A-Z]/.test(v), num: /[0-9]/.test(v), sym: /[^A-Za-z0-9]/.test(v) };
    var score = 0;
    document.querySelectorAll('#rules li').forEach(function (li) {
      var ok = tests[li.dataset.r];
      li.classList.toggle('ok', ok);
      if (ok) score++;
    });
    var level = !v ? 0 : score <= 2 ? 1 : score <= 4 ? 2 : (v.length >= 12 ? 4 : 3);
    var colors = ['', '#b3261e', '#c77700', '#2f8f5b', '#1b7a43'];
    document.querySelectorAll('.meter i').forEach(function (bar, i) {
      bar.style.background = i < level ? colors[level] : '';
    });
  }

  // Live validation: wait until a field is touched, then re-check as the user types.
  var touched = {};
  fields.forEach(function (id) {
    var els = id === 'mode' ? form.elements.mode : [$(id)];
    Array.prototype.forEach.call(els, function (el) {
      el.addEventListener('blur', function () { touched[id] = true; validate(id); });
      el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'radio' ? 'change' : 'input', function () {
        if (id === 'mobile') el.value = el.value.replace(/\D/g, '').slice(0, 10);
        if (id === 'password') { updatePassword(); if (touched.confirm) validate('confirm'); }
        if (touched[id] || el.type === 'radio' || el.type === 'checkbox' || el.tagName === 'SELECT') { touched[id] = true; validate(id); }
      });
    });
  });

  document.querySelectorAll('[data-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = $(btn.dataset.toggle), hidden = input.type === 'password';
      input.type = hidden ? 'text' : 'password';
      btn.textContent = hidden ? 'Hide' : 'Show';
      btn.setAttribute('aria-label', (hidden ? 'Hide ' : 'Show ') + (input.id === 'password' ? 'password' : 'confirm password'));
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null, bad = 0;
    fields.forEach(function (id) {
      touched[id] = true;
      if (!validate(id)) { bad++; if (!firstBad) firstBad = id === 'mode' ? form.elements.mode[0] : $(id); }
    });
    var status = $('status');
    if (bad) {
      status.textContent = bad + (bad === 1 ? ' field needs' : ' fields need') + ' attention.';
      firstBad.focus();
      return;
    }
    status.textContent = '';
    var rows = [['Name', $('name').value.trim()], ['Email', $('email').value.trim()], ['Mobile', '+91 ' + $('mobile').value],
                ['Course', $('course').value], ['Mode', form.elements.mode.value],
                ['Registration ID', 'REG-' + Date.now().toString(36).toUpperCase()]];
    var dl = $('summary');
    dl.textContent = '';
    rows.forEach(function (r) {
      var dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = r[0]; dd.textContent = r[1];
      dl.appendChild(dt); dl.appendChild(dd);
    });
    form.hidden = true;
    $('done').hidden = false;
    $('done').focus();
  });

  function clearAll() {
    touched = {};
    fields.forEach(function (id) { show(id, ''); });
    document.querySelectorAll('.valid').forEach(function (n) { n.classList.remove('valid'); });
    $('status').textContent = '';
    setTimeout(updatePassword, 0);
  }
  form.addEventListener('reset', clearAll);
  $('again').addEventListener('click', function () {
    form.reset(); form.hidden = false; $('done').hidden = true; $('name').focus();
  });
})();
