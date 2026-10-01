/* Login · validación en blur + estado de carga + redirección por rol */
(function () {
  "use strict";

  var P = window.POS;
  var U = window.UI;

  var sesion = P.session();
  if (sesion) {
    window.location.replace(sesion.rol === "admin" ? "admin/inicio.html" : "pos/inicio.html");
  }

  /* lectura del sistema en el panel derecho */
  var db = P.read();
  var activos = db.productos.filter(function (p) { return p.activo; }).length;
  var bajos = db.productos.filter(function (p) { return p.stock > 0 && p.stock <= 5; }).length;
  var hoy = P.diaISO(new Date());
  var boletasHoy = db.boletas.filter(function (b) { return P.diaISO(b.fecha) === hoy; }).length;

  var filas = [
    ["Productos activos", P.plain(activos)],
    ["Con stock bajo", P.plain(bajos)],
    ["Boletas emitidas", P.plain(db.boletas.length)],
    ["Boletas de hoy", P.plain(boletasHoy)],
    ["Cuentas", P.plain(db.usuarios.filter(function (u) { return u.activo; }).length)],
    ["Almacenamiento", "local · v" + db.version]
  ];

  document.getElementById("readout").innerHTML = filas.map(function (f) {
    return '<div class="readout__row"><span class="readout__k">' + P.esc(f[0]) + '</span><span class="readout__v">' + P.esc(f[1]) + "</span></div>";
  }).join("");

  var form = document.getElementById("login");
  var email = document.getElementById("email");
  var password = document.getElementById("password");
  var emailHelp = document.getElementById("email-help");
  var passHelp = document.getElementById("password-help");
  var boton = document.getElementById("entrar");

  function toque(input, help, validar) {
    var ok = validar();
    input.dataset.touched = "1";
    if (!ok) return false;
    U.setError(input, help, "");
    return true;
  }

  email.addEventListener("blur", function () {
    if (!email.dataset.touched) return;
    validarEmail();
  });
  password.addEventListener("blur", function () {
    if (!password.dataset.touched) return;
    validarPass();
  });

  function validarEmail() {
    var v = email.value.trim();
    if (!v) return U.setError(email, emailHelp, "Escribe tu correo para continuar.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return U.setError(email, emailHelp, "Ese correo no tiene un formato válido. Revisa la arroba y el dominio.");
    return U.setError(email, emailHelp, "");
  }

  function validarPass() {
    if (!password.value) return U.setError(password, passHelp, "Escribe tu contraseña para entrar.");
    if (password.value.length < 6) return U.setError(password, passHelp, "La contraseña tiene al menos 6 caracteres.");
    return U.setError(password, passHelp, "");
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var okMail = toque(email, emailHelp, validarEmail);
    var okPass = toque(password, passHelp, validarPass);
    if (!okMail || !okPass) return;

    boton.setAttribute("data-state", "loading");
    boton.setAttribute("aria-busy", "true");

    window.setTimeout(function () {
      var r = P.login(email.value, password.value);
      if (!r.ok) {
        boton.removeAttribute("data-state");
        boton.removeAttribute("aria-busy");
        U.setError(password, passHelp, r.error);
        return;
      }
      boton.setAttribute("data-state", "success");
      window.location.href = r.user.rol === "admin" ? "admin/inicio.html" : "pos/inicio.html";
    }, 550);
  });

})();
