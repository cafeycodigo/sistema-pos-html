/* Boletas · consulta filtrada en solo lectura con detalle imprimible */
(function () {
  "use strict";

  var P = window.POS;
  var U = window.UI;
  var H = window.H;
  if (!H) return;
  var $ = U.$;
  var $$ = U.$$;

  var filtros = { desde: "", hasta: "", vendedor: "" };

  function filtradas(f) {
    return P.list("boletas").filter(function (b) {
      var d = P.diaISO(b.fecha);
      if (f.desde && d < f.desde) return false;
      if (f.hasta && d > f.hasta) return false;
      if (f.vendedor && b.usuarioId !== f.vendedor) return false;
      return true;
    }).sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
  }

  function render() {
    var sel = $("#f-bol-vendedor");
    if (sel.options.length <= 1) H.selectVendedores(sel, true);
    sel.value = filtros.vendedor;

    var lista = filtradas(filtros);
    var total = lista.reduce(function (s, b) { return s + b.total; }, 0);
    var items = lista.reduce(function (s, b) {
      return s + b.items.reduce(function (t, i) { return t + i.cantidad; }, 0);
    }, 0);

    $("#kpis-boletas").innerHTML = [
      ["Boletas", P.plain(lista.length), true],
      ["Total vendido", P.money(total), false],
      ["Ticket promedio", P.money(lista.length ? Math.round(total / lista.length) : 0), false],
      ["Unidades", P.plain(items), false]
    ].map(function (k) {
      return '<div class="stat"><span class="stat__value' + (k[2] ? " stat__value--accent" : "") + '">' + P.esc(k[1]) +
        '</span><span class="stat__label">' + P.esc(k[0]) + "</span></div>";
    }).join("");

    var cuerpo = $("#tbody-boletas");
    if (!lista.length) {
      cuerpo.innerHTML = "";
      H.vacio($("#empty-boletas"), "No hay boletas en ese rango", "Amplia las fechas o limpia los filtros para ver transacciones anteriores.");
      return;
    }
    $("#empty-boletas").innerHTML = "";
    cuerpo.innerHTML = lista.map(function (b) {
      var it = b.items.reduce(function (s, i) { return s + i.cantidad; }, 0);
      return "<tr>" +
        '<td class="mono ink">' + P.esc(P.numeroBoleta(b.numero)) + "</td>" +
        "<td>" + P.esc(P.fechaHora(b.fecha)) + "</td>" +
        "<td>" + P.esc(H.usr(b.usuarioId)) + "</td>" +
        "<td>" + P.esc(H.cli(b.clienteId)) + "</td>" +
        '<td class="num">' + P.plain(it) + "</td>" +
        '<td><span class="chip">' + P.esc(b.pago.metodo) + "</span></td>" +
        '<td class="num ink">' + P.esc(P.money(b.total)) + "</td>" +
        '<td><div class="row-actions"><button class="btn btn--sm" type="button" data-boleta="' + b.id + '">Ver boleta</button></div></td>' +
        "</tr>";
    }).join("");
  }

  ["desde", "hasta", "vendedor"].forEach(function (k) {
    $("#f-bol-" + k).addEventListener("change", function (e) { filtros[k] = e.target.value; render(); });
  });

  $("#btn-limpiar-boletas").addEventListener("click", function () {
    filtros = { desde: "", hasta: "", vendedor: "" };
    $("#f-bol-desde").value = "";
    $("#f-bol-hasta").value = "";
    $("#f-bol-vendedor").value = "";
    render();
  });

  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-boleta]");
    if (t) H.ir("admin/boleta.html?id=" + encodeURIComponent(t.getAttribute("data-boleta")));
  });

  render();
})();
