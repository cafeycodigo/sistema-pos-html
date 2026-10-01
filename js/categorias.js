/* Categorías · listado con conteo de productos y valor de inventario */
(function () {
  "use strict";

  var P = window.POS;
  var U = window.UI;
  var H = window.H;
  if (!H) return;
  var $ = U.$;

  var params = new URLSearchParams(window.location.search);
  if (params.get("ok")) {
    U.toast("Categoría guardada.");
    params.delete("ok");
    window.history.replaceState({}, "", window.location.pathname + (params.toString() ? "?" + params.toString() : ""));
  }

  function render() {
    var cats = P.list("categorias");
    var prods = P.list("productos");
    var cuerpo = $("#tbody-categorias");
    if (!cats.length) {
      cuerpo.innerHTML = "";
      H.vacio($("#empty-categorias"), "Sin categorías", "Crea la primera categoría para agrupar productos.", {
        label: "Crear categoría",
        run: function () { H.ir("admin/categoria.html"); }
      });
      return;
    }
    $("#empty-categorias").innerHTML = "";
    cuerpo.innerHTML = cats.map(function (c) {
      var mios = prods.filter(function (p) { return p.categoriaId === c.id; });
      var valor = mios.reduce(function (s, p) { return s + p.precio * p.stock; }, 0);
      return "<tr>" +
        '<td class="ink">' + P.esc(c.nombre) + "</td>" +
        '<td class="num">' + P.plain(mios.length) + "</td>" +
        '<td class="num">' + P.esc(P.money(valor)) + "</td>" +
        '<td><div class="row-actions">' +
        '<button class="btn btn--sm" type="button" data-ver="' + c.id + '">Ver</button>' +
        '<button class="btn btn--sm" type="button" data-editar="' + c.id + '">Editar</button>' +
        '<button class="btn btn--sm btn--danger" type="button" data-eliminar="' + c.id + '">Eliminar</button>' +
        "</div></td></tr>";
    }).join("");
  }

  $("#btn-nueva-categoria").addEventListener("click", function () { H.ir("admin/categoria.html"); });

  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-editar],[data-eliminar],[data-ver]");
    if (!t) return;
    var id = t.getAttribute("data-editar") || t.getAttribute("data-eliminar") || t.getAttribute("data-ver");
    if (t.hasAttribute("data-eliminar")) {
      var usados = P.list("productos").filter(function (p) { return p.categoriaId === id; }).length;
      if (usados) {
        U.toast("Hay " + usados + " productos en esa categoría. Muévelos antes de eliminarla.", { tone: "error" });
        return;
      }
      return H.eliminar("categorias", id, "Categoría", render);
    }
    H.ir("admin/categoria.html?" + (t.hasAttribute("data-ver") ? "ver=" : "id=") + encodeURIComponent(id));
  });

  render();
})();
