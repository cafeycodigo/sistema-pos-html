/* Clientes · fichas con búsqueda y detalle de boletas asociadas */
(function () {
  "use strict";

  var P = window.POS;
  var U = window.UI;
  var H = window.H;
  if (!H) return;
  var $ = U.$;
  var $$ = U.$$;

  var params = new URLSearchParams(window.location.search);
  var q = params.get("q") || "";

  if (params.get("ok")) {
    U.toast("Cliente guardado.");
    params.delete("ok");
    window.history.replaceState({}, "", window.location.pathname + (params.toString() ? "?" + params.toString() : ""));
  }

  function render() {
    var texto = q.toLowerCase();
    var boletas = P.list("boletas");
    var lista = P.list("clientes").filter(function (c) {
      return !texto ||
        c.nombre.toLowerCase().indexOf(texto) > -1 ||
        (c.rut || "").toLowerCase().indexOf(texto) > -1 ||
        (c.email || "").toLowerCase().indexOf(texto) > -1;
    });
    var cuerpo = $("#tbody-clientes");
    if (!lista.length) {
      cuerpo.innerHTML = "";
      H.vacio($("#empty-clientes"), "Ningún cliente coincide", "Prueba con otro nombre o RUT, o crea una ficha nueva.", {
        label: "Crear cliente",
        run: function () { H.ir("admin/cliente.html"); }
      });
      return;
    }
    $("#empty-clientes").innerHTML = "";
    cuerpo.innerHTML = lista.map(function (c) {
      var n = boletas.filter(function (b) { return b.clienteId === c.id; }).length;
      return "<tr>" +
        '<td class="ink">' + P.esc(c.nombre) + "</td>" +
        '<td class="mono">' + P.esc(c.rut || "—") + "</td>" +
        "<td>" + P.esc(c.telefono || "—") + "</td>" +
        '<td class="mono">' + P.esc(c.email || "—") + "</td>" +
        '<td class="num">' + P.plain(n) + "</td>" +
        '<td><div class="row-actions">' +
        '<button class="btn btn--sm" type="button" data-ver="' + c.id + '">Ver</button>' +
        '<button class="btn btn--sm" type="button" data-editar="' + c.id + '">Editar</button>' +
        '<button class="btn btn--sm btn--danger" type="button" data-eliminar="' + c.id + '">Eliminar</button>' +
        "</div></td></tr>";
    }).join("");
  }

  var campoBusqueda = $("#f-cliente-buscar");
  campoBusqueda.value = q;
  campoBusqueda.addEventListener("input", function (e) { q = e.target.value; render(); });
  $("#btn-nuevo-cliente").addEventListener("click", function () { H.ir("admin/cliente.html"); });

  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-editar],[data-eliminar],[data-ver]");
    if (!t) return;
    var id = t.getAttribute("data-editar") || t.getAttribute("data-eliminar") || t.getAttribute("data-ver");
    if (t.hasAttribute("data-eliminar")) return H.eliminar("clientes", id, "Cliente", render);
    H.ir("admin/cliente.html?" + (t.hasAttribute("data-ver") ? "ver=" : "id=") + encodeURIComponent(id));
  });

  render();
})();
