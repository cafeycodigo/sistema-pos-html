/* Productos · listado con filtros, y acceso a la página de formulario */
(function () {
  "use strict";

  var P = window.POS;
  var U = window.UI;
  var H = window.H;
  if (!H) return;
  var $ = U.$;

  var params = new URLSearchParams(window.location.search);
  var filtros = { q: params.get("q") || "", cat: "", estado: "" };

  if (params.get("ok")) {
    U.toast("Producto guardado.");
    params.delete("ok");
    window.history.replaceState({}, "", window.location.pathname + (params.toString() ? "?" + params.toString() : ""));
  }

  function nuevo() { H.ir("admin/producto.html"); }

  /* ---------------- tabla ---------------- */
  function render() {
    var sel = $("#f-prod-cat");
    if (sel.options.length <= 1) H.selectCategorias(sel, filtros.cat, true);

    var lista = P.list("productos").filter(function (p) {
      var q = filtros.q.toLowerCase();
      if (q && p.nombre.toLowerCase().indexOf(q) < 0 && p.sku.toLowerCase().indexOf(q) < 0) return false;
      if (filtros.cat && p.categoriaId !== filtros.cat) return false;
      if (filtros.estado === "activo" && !p.activo) return false;
      if (filtros.estado === "inactivo" && p.activo) return false;
      if (filtros.estado === "bajo" && p.stock > 5) return false;
      return true;
    });

    var cuerpo = $("#tbody-productos");
    var vac = $("#empty-productos");
    if (!lista.length) {
      cuerpo.innerHTML = "";
      H.vacio(vac, "Ningún producto coincide", "Ajusta la búsqueda o los filtros para ver más resultados.", {
        label: "Crear producto",
        run: nuevo
      });
      return;
    }
    vac.innerHTML = "";
    cuerpo.innerHTML = lista.map(function (p) {
      return "<tr>" +
        '<td class="mono">' + P.esc(p.sku) + "</td>" +
        '<td class="ink">' + P.esc(p.nombre) + "</td>" +
        "<td>" + P.esc(H.cat(p.categoriaId)) + "</td>" +
        '<td class="num">' + P.esc(P.money(p.precio)) + "</td>" +
        '<td class="num">' + H.stockChip(p.stock) + "</td>" +
        "<td>" + H.estadoChip(p.activo) + "</td>" +
        '<td><div class="row-actions">' +
        '<button class="btn btn--sm" type="button" data-ver="' + p.id + '">Ver</button>' +
        '<button class="btn btn--sm" type="button" data-editar="' + p.id + '">Editar</button>' +
        '<button class="btn btn--sm btn--danger" type="button" data-eliminar="' + p.id + '">Eliminar</button>' +
        "</div></td></tr>";
    }).join("");
  }

  $("#f-prod-buscar").value = filtros.q;
  $("#f-prod-buscar").addEventListener("input", function (e) { filtros.q = e.target.value; render(); });
  $("#f-prod-cat").addEventListener("change", function (e) { filtros.cat = e.target.value; render(); });
  $("#f-prod-estado").addEventListener("change", function (e) { filtros.estado = e.target.value; render(); });
  $("#btn-nuevo-producto").addEventListener("click", nuevo);

  /* ---------------- acciones de fila ---------------- */
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-editar],[data-eliminar],[data-ver]");
    if (!t) return;
    var id = t.getAttribute("data-editar") || t.getAttribute("data-eliminar") || t.getAttribute("data-ver");
    if (t.hasAttribute("data-eliminar")) return H.eliminar("productos", id, "Producto", render);
    H.ir("admin/producto.html?" + (t.hasAttribute("data-ver") ? "ver=" : "id=") + encodeURIComponent(id));
  });

  render();
})();
