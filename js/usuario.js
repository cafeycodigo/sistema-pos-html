/* Usuario · página de formulario: nuevo, editar y detalle (solo lectura) */
(function () {
  "use strict";

  var P = window.POS;
  var U = window.UI;
  var H = window.H;
  if (!H) return;
  var $ = U.$;
  var $$ = U.$$;

  var params = new URLSearchParams(window.location.search);
  var soloLectura = !!params.get("ver");
  var registro = soloLectura ? params.get("ver") : (params.get("id") || "");
  var u = registro ? P.find("usuarios", registro) : null;
  if (registro && !u) U.toast("No encontramos esa cuenta.", { tone: "error" });

  var form = $("#form-usuario");
  form.registro.value = u ? u.id : "";
  form.nombre.value = u ? u.nombre : "";
  form.email.value = u ? u.email : "";
  form.password.value = u ? u.password : "";
  form.rol.value = u ? u.rol : "vendedor";
  form.activo.checked = u ? !!u.activo : true;

  var encabezado = soloLectura ? "Detalle del usuario" : (u ? "Editar usuario" : "Nuevo usuario");
  document.title = encabezado + " · Panel · Punto POS";
  var topo = document.querySelector(".topbar__title");
  if (topo) topo.textContent = encabezado;
  $("#f-modo").textContent = soloLectura ? "Solo lectura" : (u ? "Editando" : "Nuevo");
  $("#f-titulo").textContent = u ? u.nombre : "Usuario";

  if (soloLectura) {
    $$("input:not([type=hidden]), select", form).forEach(function (el) { el.disabled = true; });
    $("#f-guardar").hidden = true;
    $("#f-cancelar").hidden = true;
    var editar = $("#f-editar");
    editar.hidden = false;
    editar.setAttribute("href", "usuario.html?id=" + encodeURIComponent(u ? u.id : registro));
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var helpNombre = form.nombre.parentNode.querySelector(".field__help");
    var helpMail = form.email.parentNode.querySelector(".field__help");
    var helpPass = form.password.parentNode.querySelector(".field__help");
    var ok = true;
    ok = U.requerido(form.nombre, helpNombre, "el nombre completo") && ok;
    ok = U.requerido(form.email, helpMail, "el correo") && ok;
    if (ok && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim())) {
      U.setError(form.email, helpMail, "Ese correo no tiene un formato válido."); ok = false;
    }
    if (ok && form.password.value.length < 6) {
      U.setError(form.password, helpPass, "La contraseña necesita al menos 6 caracteres."); ok = false;
    }
    if (!ok) return;

    var datos = {
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim().toLowerCase(),
      password: form.password.value,
      rol: form.rol.value,
      activo: form.activo.checked
    };
    if (form.registro.value) P.update("usuarios", form.registro.value, datos);
    else P.insert("usuarios", datos);

    H.ir("admin/usuarios.html?ok=1");
  });
})();
