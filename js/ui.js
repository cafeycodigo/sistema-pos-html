/* POS · utilidades de interfaz compartidas: guard, toasts, diálogos, paleta ⌘K */
(function (global) {
  "use strict";

  var P = global.POS;

  /* raíz del sitio, calculada desde la URL de este script (funciona en / y en subcarpetas) */
  var ROOT = (function () {
    var s = document.currentScript;
    return s ? s.src.replace(/js\/[^\/]*$/, "") : "";
  })();

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------------- guard de sesión ---------------- */
  function exigirRol(rol) {
    var u = P.session();
    if (!u) { global.location.replace(ROOT + "index.html"); return null; }
    if (rol && u.rol !== rol) { global.location.replace(ROOT + (u.rol === "admin" ? "admin/inicio.html" : "pos/inicio.html")); return null; }
    return u;
  }

  function pintarUsuario(user, nodo) {
    if (!nodo) return;
    nodo.innerHTML =
      '<span class="chip chip--accent">' + P.esc(user.rol === "admin" ? "Administrador" : "Vendedor") + "</span>" +
      '<span class="text-sm text-ink2">' + P.esc(user.nombre) + "</span>";
  }

  function salir() {
    P.logout();
    global.location.href = ROOT + "index.html";
  }

  /* ---------------- toasts ---------------- */
  function contenedorToasts() {
    var c = $(".toasts");
    if (!c) {
      c = document.createElement("div");
      c.className = "toasts";
      c.setAttribute("aria-live", "polite");
      document.body.appendChild(c);
    }
    return c;
  }

  function toast(mensaje, op) {
    op = op || {};
    var c = contenedorToasts();
    var el = document.createElement("div");
    el.className = "toast";
    if (op.tone) el.setAttribute("data-tone", op.tone);
    el.setAttribute("role", op.tone === "error" ? "alert" : "status");

    var texto = document.createElement("span");
    texto.style.flex = "1 1 auto";
    texto.textContent = mensaje;
    el.appendChild(texto);

    if (op.action) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = op.action.label;
      btn.addEventListener("click", function () { op.action.run(); cerrar(); });
      el.appendChild(btn);
    }

    c.appendChild(el);
    var t = global.setTimeout(cerrar, op.dwell || 5200);
    el.addEventListener("mouseenter", pausar);
    el.addEventListener("focusin", pausar);

    function pausar() { global.clearTimeout(t); }
    function cerrar() {
      global.clearTimeout(t);
      if (!el.parentNode) return;
      el.classList.add("is-out");
      global.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 240);
    }
    return { close: cerrar };
  }

  /* ---------------- diálogos ---------------- */
  function abrir(dlg) {
    if (!dlg) return;
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    var primero = dlg.querySelector("input:not([type=hidden]), select, textarea, button");
    if (primero) global.setTimeout(function () { primero.focus(); }, 60);
  }

  function cerrar(dlg) {
    if (!dlg) return;
    if (typeof dlg.close === "function" && dlg.open) dlg.close();
    else dlg.removeAttribute("open");
  }

  function alCerrar(dlg, fn) {
    if (!dlg) return;
    dlg.addEventListener("close", fn);
    dlg.addEventListener("cancel", fn);
    dlg.addEventListener("click", function (ev) {
      if (ev.target === dlg) cerrar(dlg);
    });
  }

  /* ---------------- errores de formulario ---------------- */
  function setError(input, help, mensaje) {
    if (mensaje) {
      input.setAttribute("aria-invalid", "true");
      help.textContent = mensaje;
      help.setAttribute("data-state", "error");
      input.focus();
      return false;
    }
    input.removeAttribute("aria-invalid");
    help.removeAttribute("data-state");
    help.textContent = help.getAttribute("data-hint") || "";
    return true;
  }

  function requerido(input, help, campo) {
    var v = String(input.value || "").trim();
    return setError(input, help, v ? "" : "Escribe " + campo + " para continuar.");
  }

  /* ---------------- paleta ⌘K ---------------- */
  function paleta(fuente) {
    var overlay = $(".palette");
    if (!overlay) return { open: function () {} };
    var input = $(".palette__input", overlay);
    var lista = $(".palette__list", overlay);
    var seleccion = 0;
    var items = [];
    var opciones = [];

    function abrir() {
      opciones = typeof fuente === "function" ? fuente() : (fuente || []);
      overlay.setAttribute("open", "");
      input.value = "";
      filtrar("");
      input.focus();
    }
    function cerrarP() { overlay.removeAttribute("open"); }

    function filtrar(q) {
      var texto = q.trim().toLowerCase();
      items = opciones.filter(function (o) {
        return !texto || o.label.toLowerCase().indexOf(texto) > -1 || (o.hint || "").toLowerCase().indexOf(texto) > -1;
      });
      seleccion = 0;
      pintar();
    }

    function pintar() {
      if (!items.length) {
        lista.innerHTML = '<li class="palette__empty">Sin resultados para esa búsqueda.</li>';
        return;
      }
      lista.innerHTML = items.map(function (o, i) {
        return '<li class="palette__item" role="option" data-i="' + i + '" aria-selected="' + (i === seleccion) + '">' +
          "<span>" + P.esc(o.label) + "</span>" +
          '<span class="k">' + P.esc(o.hint || "") + "</span></li>";
      }).join("");
    }

    function ejecutar(i) {
      var it = items[i];
      if (!it) return;
      cerrarP();
      it.run();
    }

    input.addEventListener("input", function () { filtrar(input.value); });
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown") { ev.preventDefault(); seleccion = Math.min(seleccion + 1, items.length - 1); pintar(); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); seleccion = Math.max(seleccion - 1, 0); pintar(); }
      else if (ev.key === "Enter") { ev.preventDefault(); ejecutar(seleccion); }
      else if (ev.key === "Escape") { ev.preventDefault(); cerrarP(); }
    });
    lista.addEventListener("click", function (ev) {
      var li = ev.target.closest(".palette__item");
      if (li) ejecutar(Number(li.getAttribute("data-i")));
    });
    overlay.addEventListener("click", function (ev) { if (ev.target === overlay) cerrarP(); });

    document.addEventListener("keydown", function (ev) {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        overlay.hasAttribute("open") ? cerrarP() : abrir();
      }
    });

    return { open: abrir, close: cerrarP };
  }

  global.UI = {
    $: $, $$: $$, ROOT: ROOT,
    exigirRol: exigirRol, pintarUsuario: pintarUsuario, salir: salir,
    toast: toast, abrir: abrir, cerrar: cerrar, alCerrar: alCerrar,
    setError: setError, requerido: requerido, paleta: paleta
  };
})(window);
