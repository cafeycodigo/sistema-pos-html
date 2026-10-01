/* Punto de venta · productos en solo lectura */
(function () {
  "use strict";

  var P = window.POS;
  var U = window.UI;
  var H = window.H;
  if (!H) return;
  var $ = U.$;

  var filtros = { q: "", cat: "" };

  function render() {
    var sel = $("#p-cat");
    if (sel.options.length <= 1) H.selectCategorias(sel, filtros.cat, true);

    var cats = {};
    P.list("categorias").forEach(function (c) { cats[c.id] = c.nombre; });

    var lista = P.list("productos").filter(function (p) {
      var q = filtros.q.toLowerCase();
      if (q && p.nombre.toLowerCase().indexOf(q) < 0 && p.sku.toLowerCase().indexOf(q) < 0) return false;
      if (filtros.cat && p.categoriaId !== filtros.cat) return false;
      return true;
    });

    var cuerpo = $("#tbody-productos");
    if (!lista.length) {
      cuerpo.innerHTML = "";
      H.vacio($("#empty-productos"), "Sin resultados", "Ningún producto coincide con esa búsqueda.");
      return;
    }
    $("#empty-productos").innerHTML = "";
    cuerpo.innerHTML = lista.map(function (p) {
      return "<tr>" +
        '<td class="mono">' + P.esc(p.sku) + "</td>" +
        '<td class="ink">' + P.esc(p.nombre) + (p.activo ? "" : ' <span class="chip chip--off">Inactivo</span>') + "</td>" +
        "<td>" + P.esc(cats[p.categoriaId] || "—") + "</td>" +
        '<td class="num">' + P.esc(P.money(p.precio)) + "</td>" +
        '<td class="num">' + H.stockChip(p.stock) + "</td>" +
        "</tr>";
    }).join("");
  }

  $("#p-buscar").addEventListener("input", function (e) { filtros.q = e.target.value; render(); });
  $("#p-cat").addEventListener("change", function (e) { filtros.cat = e.target.value; render(); });

  render();
})();
