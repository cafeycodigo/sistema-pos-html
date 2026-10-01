/* Inicio del panel · KPIs, atajos y últimas boletas */
(function () {
  "use strict";

  var P = window.POS;
  var H = window.H;
  if (!H) return;

  var db = P.read();
  var hoy = P.diaISO(new Date());
  var siete = P.diaISO(new Date(Date.now() - 6 * 86400000));
  var boletasHoy = db.boletas.filter(function (b) { return P.diaISO(b.fecha) === hoy; });
  var ult7 = db.boletas.filter(function (b) { return P.diaISO(b.fecha) >= siete; });
  var bajos = db.productos.filter(function (p) { return p.activo && p.stock <= 5; });

  function suma(arr) { return arr.reduce(function (s, b) { return s + b.total; }, 0); }

  var kpis = [
    ["Ventas de hoy", P.money(suma(boletasHoy)), true],
    ["Boletas de hoy", P.plain(boletasHoy.length), false],
    ["Últimos 7 días", P.money(suma(ult7)), false],
    ["Stock bajo", P.plain(bajos.length), false]
  ];

  document.getElementById("kpis").innerHTML = kpis.map(function (k) {
    return '<div class="stat"><span class="stat__value' + (k[2] ? " stat__value--accent" : "") + '">' + P.esc(k[1]) +
      '</span><span class="stat__label">' + P.esc(k[0]) + "</span></div>";
  }).join("");

  document.getElementById("saludo").textContent = "Hola, " + H.sesion.nombre.split(" ")[0];

  var resumen = {
    productos: P.plain(db.productos.length) + " en inventario",
    boletas: P.plain(db.boletas.length) + " emitidas",
    config: "IVA " + db.config.iva + " % · descuento " + db.config.descuento + " %"
  };
  document.querySelectorAll("[data-resumen]").forEach(function (n) {
    n.textContent = resumen[n.getAttribute("data-resumen")];
  });

  var ultimas = db.boletas.slice().sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); }).slice(0, 6);
  var cuerpo = document.getElementById("tbody-ultimas");

  if (!ultimas.length) {
    cuerpo.innerHTML = '<tr><td colspan="6" class="muted">Todavía no se emite ninguna boleta. Abre el punto de venta y cobra la primera.</td></tr>';
    return;
  }

  cuerpo.innerHTML = ultimas.map(function (b) {
    return "<tr>" +
      '<td class="mono">' + P.esc(P.numeroBoleta(b.numero)) + "</td>" +
      "<td>" + P.esc(P.fechaHora(b.fecha)) + "</td>" +
      "<td>" + P.esc(H.usr(b.usuarioId)) + "</td>" +
      "<td>" + P.esc(H.cli(b.clienteId)) + "</td>" +
      '<td><span class="chip">' + P.esc(b.pago.metodo) + "</span></td>" +
      '<td class="num ink">' + P.esc(P.money(b.total)) + "</td>" +
      "</tr>";
  }).join("");
})();
