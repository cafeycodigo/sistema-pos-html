/* Punto de venta · inicio del vendedor */
(function () {
  "use strict";

  var P = window.POS;
  var U = window.UI;
  var H = window.H;
  if (!H) return;
  var $ = U.$;

  document.getElementById("saludo").textContent = "Hola, " + H.sesion.nombre.split(" ")[0];
  document.getElementById("salir").addEventListener("click", U.salir);

  var db = P.read();
  var hoy = P.diaISO(new Date());
  var delDia = db.boletas.filter(function (b) { return P.diaISO(b.fecha) === hoy; });
  var mias = delDia.filter(function (b) { return b.usuarioId === H.sesion.id; });
  var total = mias.reduce(function (s, b) { return s + b.total; }, 0);

  $("#kpis").innerHTML = [
    ["Vendido hoy", P.money(total), true],
    ["Boletas tuyas", P.plain(mias.length), false],
    ["Boletas del local", P.plain(delDia.length), false],
    ["Productos activos", P.plain(db.productos.filter(function (p) { return p.activo && p.stock > 0; }).length), false]
  ].map(function (k) {
    return '<div class="stat"><span class="stat__value' + (k[2] ? " stat__value--accent" : "") + '">' + P.esc(k[1]) +
      '</span><span class="stat__label">' + P.esc(k[0]) + "</span></div>";
  }).join("");

  var cuerpo = $("#tbody-hoy");
  var lista = mias.slice().sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
  if (!lista.length) {
    cuerpo.innerHTML = '<tr><td colspan="5" class="muted">Todavía no cobras nada hoy. Pulsa “Iniciar venta” para abrir el carrito.</td></tr>';
    return;
  }
  cuerpo.innerHTML = lista.map(function (b) {
    return "<tr>" +
      '<td class="mono">' + P.esc(P.numeroBoleta(b.numero)) + "</td>" +
      "<td>" + P.esc((P.fechaHora(b.fecha).split(" ")[1]) || "—") + "</td>" +
      "<td>" + P.esc(H.cli(b.clienteId)) + "</td>" +
      '<td><span class="chip">' + P.esc(b.pago.metodo) + "</span></td>" +
      '<td class="num ink">' + P.esc(P.money(b.total)) + "</td></tr>";
  }).join("");
})();
