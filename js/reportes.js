/* Reportes · ingresos por producto, vendedor y fecha con filtros de período */
(function () {
  "use strict";

  var P = window.POS;
  var U = window.UI;
  var H = window.H;
  if (!H) return;
  var $ = U.$;
  var $$ = U.$$;

  var filtros = {
    desde: P.diaISO(new Date(Date.now() - 6 * 86400000)),
    hasta: P.diaISO(new Date()),
    vendedor: "",
    cat: ""
  };

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
    var selV = $("#f-rep-vendedor");
    if (selV.options.length <= 1) H.selectVendedores(selV, true);
    var selC = $("#f-rep-cat");
    if (selC.options.length <= 1) H.selectCategorias(selC, filtros.cat, true);

    $("#f-rep-desde").value = filtros.desde;
    $("#f-rep-hasta").value = filtros.hasta;
    selV.value = filtros.vendedor;
    selC.value = filtros.cat;

    var lista = filtradas(filtros);
    var porProducto = {};
    var porVendedor = {};
    var porFecha = {};
    var unidades = 0;

    lista.forEach(function (b) {
      porVendedor[b.usuarioId] = porVendedor[b.usuarioId] || { n: 0, total: 0 };
      porVendedor[b.usuarioId].n++;
      porVendedor[b.usuarioId].total += b.total;

      var d = P.diaISO(b.fecha);
      porFecha[d] = porFecha[d] || { n: 0, total: 0 };
      porFecha[d].n++;
      porFecha[d].total += b.total;

      b.items.forEach(function (i) {
        if (filtros.cat) {
          var p = P.find("productos", i.productoId);
          if (!p || p.categoriaId !== filtros.cat) return;
        }
        porProducto[i.productoId] = porProducto[i.productoId] || { nombre: i.nombre, u: 0, total: 0 };
        porProducto[i.productoId].u += i.cantidad;
        porProducto[i.productoId].total += i.precio * i.cantidad;
        unidades += i.cantidad;
      });
    });

    var ingresos = lista.reduce(function (s, b) { return s + b.total; }, 0);
    $("#kpis-reporte").innerHTML = [
      ["Ingresos", P.money(ingresos), true],
      ["Boletas", P.plain(lista.length), false],
      ["Ticket promedio", P.money(lista.length ? Math.round(ingresos / lista.length) : 0), false],
      ["Unidades", P.plain(unidades), false]
    ].map(function (k) {
      return '<div class="stat"><span class="stat__value' + (k[2] ? " stat__value--accent" : "") + '">' + P.esc(k[1]) +
        '</span><span class="stat__label">' + P.esc(k[0]) + "</span></div>";
    }).join("");

    var filasProducto = Object.keys(porProducto)
      .map(function (k) { return Object.assign({ id: k }, porProducto[k]); })
      .sort(function (a, b) { return b.total - a.total; });
    var max = filasProducto.length ? filasProducto[0].total : 1;

    var cuerpoP = $("#tbody-rep-producto");
    if (!filasProducto.length) {
      cuerpoP.innerHTML = "";
      H.vacio($("#empty-rep-producto"), "Sin ventas en este rango", "Cambia el período o los filtros para ver resultados.");
    } else {
      $("#empty-rep-producto").innerHTML = "";
      cuerpoP.innerHTML = filasProducto.map(function (f) {
        return "<tr>" +
          '<td class="ink">' + P.esc(f.nombre) +
          '<div class="bar mt-1" style="max-width:160px"><i style="width:' + Math.round((f.total / max) * 100) + '%"></i></div></td>' +
          '<td class="num">' + P.plain(f.u) + "</td>" +
          '<td class="num ink">' + P.esc(P.money(f.total)) + "</td>" +
          "<td></td></tr>";
      }).join("");
    }

    var filasV = Object.keys(porVendedor)
      .map(function (k) { return { nombre: H.usr(k), n: porVendedor[k].n, total: porVendedor[k].total }; })
      .sort(function (a, b) { return b.total - a.total; });
    $("#tbody-rep-vendedor").innerHTML = filasV.length
      ? filasV.map(function (f) {
          return '<tr><td class="ink">' + P.esc(f.nombre) + '</td><td class="num">' + P.plain(f.n) +
            '</td><td class="num ink">' + P.esc(P.money(f.total)) + "</td></tr>";
        }).join("")
      : '<tr><td colspan="3" class="muted">Sin ventas registradas.</td></tr>';

    var filasF = Object.keys(porFecha).sort(function (a, b) { return b.localeCompare(a); })
      .map(function (k) { return { fecha: k, n: porFecha[k].n, total: porFecha[k].total }; });
    $("#tbody-rep-fecha").innerHTML = filasF.length
      ? filasF.map(function (f) {
          return '<tr><td class="ink">' + P.esc(P.fecha(f.fecha)) + '</td><td class="num">' + P.plain(f.n) +
            '</td><td class="num ink">' + P.esc(P.money(f.total)) + "</td></tr>";
        }).join("")
      : '<tr><td colspan="3" class="muted">Sin ventas registradas.</td></tr>';
  }

  ["desde", "hasta", "vendedor", "cat"].forEach(function (k) {
    $("#f-rep-" + k).addEventListener("change", function (e) { filtros[k] = e.target.value; render(); });
  });

  $("#btn-limpiar-rep").addEventListener("click", function () {
    filtros = { desde: "", hasta: "", vendedor: "", cat: "" };
    render();
  });

  render();
})();
