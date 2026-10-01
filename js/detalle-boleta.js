/* Boleta · página de detalle en solo lectura con impresión */
(function () {
  "use strict";

  var P = window.POS;
  var U = window.UI;
  var H = window.H;
  if (!H) return;
  var $ = U.$;

  var params = new URLSearchParams(window.location.search);
  var id = params.get("id") || "";
  var b = id ? P.find("boletas", id) : null;
  var cont = $("#detalle-boleta");

  if (!b) {
    cont.innerHTML = "";
    H.vacio(cont, "No encontramos esa boleta", "Puede haber sido retirada del listado.", {
      label: "Volver a boletas",
      run: function () { H.ir("admin/boletas.html"); }
    });
    $("#b-numero").textContent = "Boleta";
    $("#btn-imprimir").hidden = true;
    return;
  }

  var cfg = P.config();
  $("#b-numero").textContent = P.numeroBoleta(b.numero);
  document.title = P.numeroBoleta(b.numero) + " · Panel · Punto POS";
  var topo = document.querySelector(".topbar__title");
  if (topo) topo.textContent = "Boleta " + P.numeroBoleta(b.numero);

  cont.innerHTML =
    '<div class="receipt">' +
    '<div class="receipt__title">' + P.esc(cfg.negocio) + "</div>" +
    '<div class="receipt__sub">' + P.esc(cfg.rut) + " · " + P.esc(cfg.direccion) + "</div>" +
    "<hr />" +
    '<div class="receipt__row"><span>Boleta</span><span>' + P.esc(P.numeroBoleta(b.numero)) + "</span></div>" +
    '<div class="receipt__row"><span>Fecha</span><span>' + P.esc(P.fechaHora(b.fecha)) + "</span></div>" +
    '<div class="receipt__row"><span>Vendedor</span><span>' + P.esc(H.usr(b.usuarioId)) + "</span></div>" +
    '<div class="receipt__row"><span>Cliente</span><span>' + P.esc(H.cli(b.clienteId)) + "</span></div>" +
    "<hr />" +
    '<div class="receipt__items">' + b.items.map(function (i) {
      return '<div class="receipt__row"><span>' + i.cantidad + " × " + P.esc(i.nombre) + "</span><span>" + P.esc(P.money(i.precio * i.cantidad)) + "</span></div>";
    }).join("") + "</div>" +
    "<hr />" +
    '<div class="receipt__row"><span>Subtotal</span><span>' + P.esc(P.money(b.subtotal)) + "</span></div>" +
    (b.descuento ? '<div class="receipt__row"><span>Descuento</span><span>−' + P.esc(P.money(b.descuento)) + "</span></div>" : "") +
    '<div class="receipt__row"><span>IVA incluido</span><span>' + P.esc(P.money(b.iva)) + "</span></div>" +
    '<div class="receipt__row receipt__row--total"><span>Total</span><span>' + P.esc(P.money(b.total)) + "</span></div>" +
    "<hr />" +
    '<div class="receipt__row"><span>Pago</span><span>' + P.esc(b.pago.metodo) + "</span></div>" +
    (b.pago.metodo === "efectivo"
      ? '<div class="receipt__row"><span>Recibido</span><span>' + P.esc(P.money(b.pago.montoRecibido)) + "</span></div>" +
        '<div class="receipt__row"><span>Cambio</span><span>' + P.esc(P.money(b.pago.cambio)) + "</span></div>"
      : '<div class="receipt__row"><span>Tarjeta</span><span>•••• ' + P.esc(b.pago.ultima4 || "0000") + "</span></div>") +
    '<p class="receipt__foot">' + P.esc(cfg.pieBoleta) + "</p>" +
    "</div>";

  $("#btn-imprimir").addEventListener("click", function () {
    if (typeof window.print === "function") window.print();
  });
})();
