/* Usuarios · listado de cuentas, con acceso a la página de formulario */
(function () {
  "use strict";

  var P = window.POS;
  var U = window.UI;
  var H = window.H;
  if (!H) return;
  var $ = U.$;

  var params = new URLSearchParams(window.location.search);
  if (params.get("ok")) {
    U.toast("Usuario guardado.");
    params.delete("ok");
    window.history.replaceState({}, "", window.location.pathname + (params.toString() ? "?" + params.toString() : ""));
  }

  function render() {
    var lista = P.list("usuarios");
    var cuerpo = $("#tbody-usuarios");
    if (!lista.length) {
      cuerpo.innerHTML = "";
      H.vacio($("#empty-usuarios"), "Sin usuarios", "Crea la primera cuenta para dar acceso al sistema.");
      return;
    }
    $("#empty-usuarios").innerHTML = "";
    cuerpo.innerHTML = lista.map(function (u) {
      return "<tr>" +
        '<td class="ink">' + P.esc(u.nombre) + "</td>" +
        '<td class="mono">' + P.esc(u.email) + "</td>" +
        "<td>" + (u.rol === "admin" ? '<span class="chip chip--accent">Administrador</span>' : '<span class="chip">Vendedor</span>') + "</td>" +
        "<td>" + H.estadoChip(u.activo) + "</td>" +
        "<td>" + P.esc(P.fecha(u.creado)) + "</td>" +
        '<td><div class="row-actions">' +
        '<button class="btn btn--sm" type="button" data-ver="' + u.id + '">Ver</button>' +
        '<button class="btn btn--sm" type="button" data-editar="' + u.id + '">Editar</button>' +
        (u.id === H.sesion.id ? "" : '<button class="btn btn--sm btn--danger" type="button" data-eliminar="' + u.id + '">Eliminar</button>') +
        "</div></td></tr>";
    }).join("");
  }

  $("#btn-nuevo-usuario").addEventListener("click", function () { H.ir("admin/usuario.html"); });

  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-editar],[data-eliminar],[data-ver]");
    if (!t) return;
    var id = t.getAttribute("data-editar") || t.getAttribute("data-eliminar") || t.getAttribute("data-ver");
    if (t.hasAttribute("data-eliminar")) return H.eliminar("usuarios", id, "Usuario", render);
    H.ir("admin/usuario.html?" + (t.hasAttribute("data-ver") ? "ver=" : "id=") + encodeURIComponent(id));
  });

  render();
})();
