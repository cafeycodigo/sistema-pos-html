/* Punto de venta · categorías en solo lectura */
(function () {
  "use strict";

  var P = window.POS;
  var U = window.UI;
  var H = window.H;
  if (!H) return;
  var $ = U.$;

  var prods = P.list("productos");
  var cats = P.list("categorias");

  if (!cats.length) {
    H.vacio($("#empty-categorias"), "Sin categorías", "El administrador todavía no crea ninguna categoría.");
    return;
  }

  $("#tbody-categorias").innerHTML = cats.map(function (c) {
    var mios = prods.filter(function (p) { return p.categoriaId === c.id; });
    var disponibles = mios.filter(function (p) { return p.stock > 0; }).length;
    var precios = mios.map(function (p) { return p.precio; });
    var rango = precios.length
      ? P.money(Math.min.apply(null, precios)) + " — " + P.money(Math.max.apply(null, precios))
      : "—";
    return '<tr><td class="ink">' + P.esc(c.nombre) + '</td><td class="num">' + P.plain(mios.length) +
      '</td><td class="num">' + P.plain(disponibles) + "</td><td>" + P.esc(rango) + "</td></tr>";
  }).join("");
})();
