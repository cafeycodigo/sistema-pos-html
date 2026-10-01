/* Shell · inyecta el chrome compartido (rail, topbar, footer, ⌘K, toasts)
 * y mueve el <main data-page> de cada página a su sitio.
 * Requiere: store.js y ui.js cargados antes. */
(function () {
  "use strict";

  var script = document.currentScript;
  var ROOT = script ? script.src.replace(/js\/[^\/]*$/, "") : "";
  var area = document.body.getAttribute("data-shell");

  var P = window.POS;
  var U = window.UI;

  /* ---------- sesión ---------- */
  var sesion = P.session();
  if (!area || !sesion) {
    if (area) window.location.replace(ROOT + "index.html");
    return;
  }
  if (area === "admin" && sesion.rol !== "admin") {
    window.location.replace(ROOT + "pos/inicio.html");
    return;
  }

  var pagina = document.body.getAttribute("data-page") || "";
  var titulo = document.body.getAttribute("data-title") || "";

  /* ---------- helpers compartidos ---------- */
  function cat(id) { var c = P.find("categorias", id); return c ? c.nombre : "—"; }
  function usr(id) { var u = P.find("usuarios", id); return u ? u.nombre : "—"; }
  function cli(id) { var c = P.find("clientes", id); return c ? c.nombre : "Consumidor final"; }

  function vacio(nodo, t, texto, accion) {
    nodo.innerHTML =
      '<div class="empty">' +
      '<span class="empty__mark">[ ]</span>' +
      '<span class="empty__title">' + P.esc(t) + "</span>" +
      '<span class="empty__text">' + P.esc(texto) + "</span>" +
      (accion ? '<button class="btn btn--sm mt-2" type="button" data-empty-action>' + P.esc(accion.label) + "</button>" : "") +
      "</div>";
    if (accion) {
      var b = nodo.querySelector("[data-empty-action]");
      if (b) b.addEventListener("click", accion.run);
    }
  }

  function estadoChip(activo) {
    return activo ? '<span class="chip chip--ok">Activo</span>' : '<span class="chip chip--off">Inactivo</span>';
  }

  function stockChip(stock) {
    if (stock <= 0) return '<span class="chip chip--warn">Agotado</span>';
    if (stock <= 5) return '<span class="chip chip--warn">Quedan ' + stock + "</span>";
    return '<span class="num">' + P.plain(stock) + "</span>";
  }

  var pendiente = null;

  function eliminar(cola, id, label, refrescar) {
    var ejecutar = function () {
      var fila = P.remove(cola, id);
      if (!fila) return;
      refrescar();
      contar();
      U.toast(label + " eliminado.", {
        tone: "undo",
        dwell: 7000,
        action: { label: "Deshacer", run: function () { P.restore(cola, fila); refrescar(); contar(); } }
      });
    };
    var dlg = document.getElementById("dlg-confirmar");
    if (!dlg) { ejecutar(); return; }
    var nombre = String(label).toLowerCase();
    document.getElementById("dlg-confirmar-t").textContent = "Eliminar " + nombre;
    document.getElementById("dlg-confirmar-msg").textContent =
      "Vas a eliminar " + nombre + " del listado. Puedes deshacerlo durante unos segundos.";
    pendiente = ejecutar;
    U.abrir(dlg);
  }

  function selectCategorias(sel, valor, conTodas) {
    var cats = P.list("categorias");
    sel.innerHTML = (conTodas ? '<option value="">Todas</option>' : '<option value="">Sin categoría</option>') +
      cats.map(function (c) { return '<option value="' + c.id + '">' + P.esc(c.nombre) + "</option>"; }).join("");
    sel.value = valor || "";
  }

  function selectVendedores(sel, conTodos) {
    sel.innerHTML = (conTodos ? '<option value="">Todos</option>' : "") +
      P.list("usuarios").map(function (u) { return '<option value="' + u.id + '">' + P.esc(u.nombre) + "</option>"; }).join("");
  }

  window.H = {
    ROOT: ROOT, area: area, pagina: pagina, sesion: sesion,
    cat: cat, usr: usr, cli: cli, vacio: vacio,
    estadoChip: estadoChip, stockChip: stockChip, eliminar: eliminar,
    selectCategorias: selectCategorias, selectVendedores: selectVendedores,
    ir: function (ruta) { window.location.href = ROOT + ruta; }
  };

  /* ---------- chrome ---------- */
  var main = document.querySelector("main[data-page]");
  var body = document.body;

  var toasts = document.createElement("div");
  toasts.className = "toasts";
  toasts.setAttribute("aria-live", "polite");
  body.appendChild(toasts);

  var envoltura = document.createElement("div");
  envoltura.className = area === "admin" ? "shell" : "main";

  if (area === "admin") {
    envoltura.innerHTML =
      '<nav class="rail" aria-label="Secciones del panel">' +
        '<div class="rail__brand">PUNTO<span>·</span>POS</div>' +
        '<div class="rail__group">' +
          link("inicio", "Inicio") +
          link("productos", "Productos", "productos") +
          link("usuarios", "Usuarios", "usuarios") +
          link("categorias", "Categorías", "categorias") +
          link("clientes", "Clientes", "clientes") +
        "</div>" +
        '<div class="rail__sep" role="presentation"></div>' +
        '<div class="rail__group">' +
          link("boletas", "Boletas", "boletas") +
          link("reportes", "Reportes de venta") +
          link("configuracion", "Configuración") +
        "</div>" +
        '<div style="margin-top:auto" class="rail__group">' +
          '<a class="rail__link" href="' + ROOT + 'pos/inicio.html"><span>Punto de venta</span><i class="tick" aria-hidden="true"></i></a>' +
          '<button class="rail__link" type="button" data-salir><span>Salir</span><i class="tick" aria-hidden="true"></i></button>' +
        "</div>" +
      "</nav>";

    var columna = document.createElement("div");
    columna.className = "main";
    columna.appendChild(topbarAdmin());
    if (main) columna.appendChild(main);
    columna.appendChild(foot());
    envoltura.appendChild(columna);

    /* paleta ⌘K */
    var palette = document.createElement("div");
    palette.className = "palette";
    palette.setAttribute("role", "dialog");
    palette.setAttribute("aria-modal", "true");
    palette.setAttribute("aria-label", "Buscar en el panel");
    palette.innerHTML =
      '<div class="palette__box">' +
        '<input class="palette__input" type="text" placeholder="Buscar productos, clientes o secciones…" aria-label="Buscar" />' +
        '<ul class="palette__list" role="listbox"></ul>' +
      "</div>";
    body.appendChild(palette);
  } else {
    envoltura.appendChild(topbarPos());
    if (main) envoltura.appendChild(main);
    envoltura.appendChild(foot());
  }

  body.insertBefore(envoltura, body.firstChild);

  function link(id, texto, conteo) {
    var activo = pagina === id;
    return '<button class="rail__link" type="button" data-nav="' + id + '"' + (activo ? ' aria-current="page"' : "") + ">" +
      "<span>" + texto + "</span>" +
      (conteo ? '<span class="rail__count" data-count="' + conteo + '"></span>' : '<i class="tick" aria-hidden="true"></i>') +
      "</button>";
  }

  function topbarAdmin() {
    var h = document.createElement("header");
    h.className = "topbar";
    h.innerHTML =
      '<span class="topbar__title">' + P.esc(titulo) + "</span>" +
      '<div class="topbar__meta">' +
        '<button class="btn btn--sm" type="button" data-paleta>Buscar <span class="mono muted">⌘K</span></button>' +
        '<span class="row" data-usuario style="gap:0.5rem"></span>' +
      "</div>";
    return h;
  }

  function topbarPos() {
    var h = document.createElement("header");
    h.className = "topbar";
    h.innerHTML =
      '<div class="row" style="gap:0.75rem">' +
        '<span class="split__brand">PUNTO<span>·</span>POS</span>' +
        '<span class="chip">' + P.esc(titulo) + "</span>" +
      "</div>" +
      '<div class="topbar__meta">' +
        '<span class="row" data-usuario style="gap:0.5rem"></span>' +
        '<button class="btn btn--sm" type="button" data-salir>Salir</button>' +
      "</div>";
    return h;
  }

  function foot() {
    var f = document.createElement("footer");
    f.className = "foot";
    f.innerHTML =
      "<span>" + P.esc(P.config().negocio) + "</span>" +
      "<span>" + (area === "admin" ? "Panel de administración" : "Punto de venta") + "</span>" +
      "<span>Punto POS · 2026</span>";
    return f;
  }

  U.pintarUsuario(sesion, envoltura.querySelector("[data-usuario]"));

  /* ---------- navegación del rail ---------- */
  var destinos = {
    inicio: "admin/inicio.html",
    productos: "admin/productos.html",
    usuarios: "admin/usuarios.html",
    categorias: "admin/categorias.html",
    clientes: "admin/clientes.html",
    boletas: "admin/boletas.html",
    reportes: "admin/reportes.html",
    configuracion: "admin/configuracion.html"
  };

  envoltura.querySelectorAll("[data-nav]").forEach(function (b) {
    b.addEventListener("click", function () { H.ir(destinos[b.getAttribute("data-nav")]); });
  });
  envoltura.querySelectorAll("[data-salir]").forEach(function (b) {
    b.addEventListener("click", U.salir);
  });

  /* ---------- contadores ---------- */
  function contar() {
    var db = P.read();
    var mapa = {
      productos: db.productos.length,
      usuarios: db.usuarios.length,
      categorias: db.categorias.length,
      clientes: db.clientes.length,
      boletas: db.boletas.length
    };
    document.querySelectorAll("[data-count]").forEach(function (n) {
      n.textContent = P.plain(mapa[n.getAttribute("data-count")] || 0);
    });
  }
  contar();
  H.contar = contar;

  /* ---------- paleta ⌘K ---------- */
  if (area === "admin") {
    var paleta = U.paleta(function () {
      var base = Object.keys(destinos).map(function (v) {
        var nombre = { inicio: "Inicio", productos: "Productos", usuarios: "Usuarios", categorias: "Categorías", clientes: "Clientes", boletas: "Boletas", reportes: "Reportes de venta", configuracion: "Configuración" }[v];
        return { label: "Ir a " + nombre, hint: "sección", run: function () { H.ir(destinos[v]); } };
      });
      var prods = P.list("productos").map(function (p) {
        return { label: p.nombre, hint: p.sku, run: function () { H.ir("admin/productos.html?q=" + encodeURIComponent(p.nombre)); } };
      });
      var clis = P.list("clientes").map(function (c) {
        return { label: c.nombre, hint: "cliente", run: function () { H.ir("admin/clientes.html?q=" + encodeURIComponent(c.nombre)); } };
      });
      return base.concat(prods, clis);
    });
    var btnPaleta = document.querySelector("[data-paleta]");
    if (btnPaleta) btnPaleta.addEventListener("click", paleta.open);
  }

  /* ---------- confirmación de borrado: el único modal del panel ---------- */
  if (area === "admin") {
    var dlgConfirmar = document.createElement("dialog");
    dlgConfirmar.className = "sheet sheet--sm";
    dlgConfirmar.id = "dlg-confirmar";
    dlgConfirmar.setAttribute("aria-labelledby", "dlg-confirmar-t");
    dlgConfirmar.innerHTML =
      '<div class="sheet__head"><span class="sheet__title" id="dlg-confirmar-t">Eliminar</span></div>' +
      '<div class="sheet__body"><p class="view__sub" id="dlg-confirmar-msg"></p></div>' +
      '<div class="sheet__foot">' +
        '<button class="btn" type="button" data-close>Cancelar</button>' +
        '<button class="btn btn--danger" type="button" id="btn-confirmar-eliminar">Eliminar</button>' +
      "</div>";
    body.appendChild(dlgConfirmar);
    dlgConfirmar.querySelector("#btn-confirmar-eliminar").addEventListener("click", function () {
      U.cerrar(dlgConfirmar);
      var f = pendiente;
      pendiente = null;
      if (f) f();
    });
  }

  /* ---------- diálogos: backdrop y botones ---------- */
  document.querySelectorAll("dialog.sheet").forEach(function (dlg) {
    dlg.addEventListener("click", function (ev) { if (ev.target === dlg) U.cerrar(dlg); });
    dlg.querySelectorAll("[data-close]").forEach(function (b) {
      b.addEventListener("click", function () { U.cerrar(dlg); });
    });
  });
})();
