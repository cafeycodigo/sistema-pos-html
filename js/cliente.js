/* Cliente · página de formulario: nuevo, editar y detalle (solo lectura) */
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
  var c = registro ? P.find("clientes", registro) : null;
  if (registro && !c) U.toast("No encontramos ese cliente.", { tone: "error" });

  var form = $("#form-cliente");
  form.registro.value = c ? c.id : "";
  form.nombre.value = c ? c.nombre : "";
  form.rut.value = c ? c.rut : "";
  form.telefono.value = c ? c.telefono : "";
  form.email.value = c ? c.email : "";

  var encabezado = soloLectura ? "Detalle del cliente" : (c ? "Editar cliente" : "Nuevo cliente");
  document.title = encabezado + " · Panel · Punto POS";
  var topo = document.querySelector(".topbar__title");
  if (topo) topo.textContent = encabezado;
  $("#f-modo").textContent = soloLectura ? "Solo lectura" : (c ? "Editando" : "Nuevo");
  $("#f-titulo").textContent = c ? c.nombre : "Cliente";

  if (soloLectura) {
    $$("input:not([type=hidden]), select", form).forEach(function (el) { el.disabled = true; });
    $("#f-guardar").hidden = true;
    $("#f-cancelar").hidden = true;
    var editar = $("#f-editar");
    editar.hidden = false;
    editar.setAttribute("href", "cliente.html?id=" + encodeURIComponent(c ? c.id : registro));
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!U.requerido(form.nombre, form.nombre.parentNode.querySelector(".field__help"), "el nombre del cliente")) return;

    var datos = {
      nombre: form.nombre.value.trim(),
      rut: form.rut.value.trim(),
      telefono: form.telefono.value.trim(),
      email: form.email.value.trim()
    };
    if (form.registro.value) P.update("clientes", form.registro.value, datos);
    else P.insert("clientes", datos);

    H.ir("admin/clientes.html?ok=1");
  });
})();
