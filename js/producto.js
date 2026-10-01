/* Producto · página de formulario: nuevo, editar y detalle (solo lectura) */
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
  var p = registro ? P.find("productos", registro) : null;
  if (registro && !p) U.toast("No encontramos ese producto.", { tone: "error" });

  var form = $("#form-producto");
  H.selectCategorias($("#p-categoria"), p ? p.categoriaId : "", false);
  form.registro.value = p ? p.id : "";
  form.nombre.value = p ? p.nombre : "";
  form.sku.value = p ? p.sku : "";
  form.precio.value = p ? p.precio : "";
  form.stock.value = p ? p.stock : "";
  form.activo.checked = p ? !!p.activo : true;

  var encabezado = soloLectura ? "Detalle del producto" : (p ? "Editar producto" : "Nuevo producto");
  document.title = encabezado + " · Panel · Punto POS";
  var topo = document.querySelector(".topbar__title");
  if (topo) topo.textContent = encabezado;
  $("#f-modo").textContent = soloLectura ? "Solo lectura" : (p ? "Editando" : "Nuevo");
  $("#f-titulo").textContent = p ? p.nombre : "Producto";

  if (soloLectura) {
    $$("input:not([type=hidden]), select", form).forEach(function (el) { el.disabled = true; });
    $("#f-guardar").hidden = true;
    $("#f-cancelar").hidden = true;
    var editar = $("#f-editar");
    editar.hidden = false;
    editar.setAttribute("href", "producto.html?id=" + encodeURIComponent(p ? p.id : registro));
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!U.requerido(form.nombre, form.nombre.parentNode.querySelector(".field__help"), "el nombre del producto")) return;
    var precio = Number(form.precio.value);
    if (!(precio >= 0)) {
      U.setError(form.precio, form.precio.parentNode.querySelector(".field__help"), "El precio debe ser 0 o más.");
      return;
    }

    var datos = {
      nombre: form.nombre.value.trim(),
      sku: (form.sku.value.trim() || "SKU-" + Date.now().toString().slice(-5)).toUpperCase(),
      categoriaId: form.categoriaId.value,
      precio: precio,
      stock: Number(form.stock.value) || 0,
      activo: form.activo.checked
    };
    if (form.registro.value) P.update("productos", form.registro.value, datos);
    else P.insert("productos", datos);

    H.ir("admin/productos.html?ok=1");
  });
})();
