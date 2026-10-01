/* Categoría · página de formulario: nueva, editar y detalle (solo lectura) */
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
  var c = registro ? P.find("categorias", registro) : null;
  if (registro && !c) U.toast("No encontramos esa categoría.", { tone: "error" });

  var form = $("#form-categoria");
  form.registro.value = c ? c.id : "";
  form.nombre.value = c ? c.nombre : "";

  var encabezado = soloLectura ? "Detalle de la categoría" : (c ? "Editar categoría" : "Nueva categoría");
  document.title = encabezado + " · Panel · Punto POS";
  var topo = document.querySelector(".topbar__title");
  if (topo) topo.textContent = encabezado;
  $("#f-modo").textContent = soloLectura ? "Solo lectura" : (c ? "Editando" : "Nueva");
  $("#f-titulo").textContent = c ? c.nombre : "Nueva categoría";

  if (soloLectura) {
    $$("input:not([type=hidden]), select", form).forEach(function (el) { el.disabled = true; });
    $("#f-guardar").hidden = true;
    $("#f-cancelar").hidden = true;
    var editar = $("#f-editar");
    editar.hidden = false;
    editar.setAttribute("href", "categoria.html?id=" + encodeURIComponent(c ? c.id : registro));
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!U.requerido(form.nombre, form.nombre.parentNode.querySelector(".field__help"), "el nombre de la categoría")) return;

    var datos = { nombre: form.nombre.value.trim() };
    if (form.registro.value) P.update("categorias", form.registro.value, datos);
    else P.insert("categorias", datos);

    H.ir("admin/categorias.html?ok=1");
  });
})();
