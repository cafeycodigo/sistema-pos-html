/* Punto de venta · catálogo, carrito, cobro y comprobante */
(function () {
  "use strict";

  var P = window.POS;
  var U = window.UI;
  var H = window.H;
  if (!H) return;
  var $ = U.$;
  var $$ = U.$$;

  var carrito = [];
  var clienteId = null;
  var metodo = "efectivo";
  var filtros = { q: "", cat: "" };

  /* ---------------- catálogo ---------------- */
  function renderCatalogo() {
    var sel = $("#venta-cat");
    if (sel.options.length <= 1) H.selectCategorias(sel, filtros.cat, true);

    var cats = {};
    P.list("categorias").forEach(function (c) { cats[c.id] = c.nombre; });

    var lista = P.list("productos").filter(function (p) {
      if (!p.activo) return false;
      var q = filtros.q.toLowerCase();
      if (q && p.nombre.toLowerCase().indexOf(q) < 0 && p.sku.toLowerCase().indexOf(q) < 0) return false;
      if (filtros.cat && p.categoriaId !== filtros.cat) return false;
      return true;
    });

    var grid = $("#catalogo");
    var vac = $("#empty-catalogo");
    if (!lista.length) {
      grid.innerHTML = "";
      H.vacio(vac, "No hay productos para esa búsqueda", "Prueba con otro término o quita el filtro de categoría.");
      return;
    }
    vac.innerHTML = "";
    grid.innerHTML = lista.map(function (p) {
      var enCarro = carrito.filter(function (l) { return l.productoId === p.id; })[0];
      var quedan = p.stock - (enCarro ? enCarro.cantidad : 0);
      return '<button class="prod" type="button" data-add="' + p.id + '"' + (quedan <= 0 ? " disabled" : "") + ">" +
        '<span class="prod__cat">' + P.esc(cats[p.categoriaId] || "Sin categoría") + "</span>" +
        '<span class="prod__name">' + P.esc(p.nombre) + "</span>" +
        '<span class="prod__price">' + P.esc(P.money(p.precio)) + "</span>" +
        '<span class="prod__stock">' + (quedan <= 0 ? "Sin stock" : "Quedan " + P.plain(quedan)) + "</span>" +
        "</button>";
    }).join("");
  }

  $("#catalogo").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-add]");
    if (b) agregar(b.getAttribute("data-add"));
  });
  $("#venta-buscar").addEventListener("input", function (e) { filtros.q = e.target.value; renderCatalogo(); });
  $("#venta-cat").addEventListener("change", function (e) { filtros.cat = e.target.value; renderCatalogo(); });

  function agregar(id) {
    var p = P.find("productos", id);
    if (!p) return;
    var linea = carrito.filter(function (l) { return l.productoId === id; })[0];
    var enCarro = linea ? linea.cantidad : 0;
    if (enCarro + 1 > p.stock) {
      U.toast("Solo quedan " + p.stock + " unidades de " + p.nombre + ".", { tone: "error" });
      return;
    }
    if (linea) linea.cantidad++;
    else carrito.push({ productoId: id, cantidad: 1 });
    renderCarrito();
    renderCatalogo();
  }

  function cambiar(id, delta) {
    var linea = carrito.filter(function (l) { return l.productoId === id; })[0];
    if (!linea) return;
    var p = P.find("productos", id);
    var nueva = linea.cantidad + delta;
    if (nueva > p.stock) { U.toast("No hay más stock de " + p.nombre + ".", { tone: "error" }); return; }
    if (nueva <= 0) carrito = carrito.filter(function (l) { return l.productoId !== id; });
    else linea.cantidad = nueva;
    renderCarrito();
    renderCatalogo();
  }

  /* ---------------- carrito ---------------- */
  function totales() {
    var cfg = P.config();
    var subtotal = carrito.reduce(function (s, l) {
      var p = P.find("productos", l.productoId);
      return s + (p ? p.precio * l.cantidad : 0);
    }, 0);
    var descuento = Math.round(subtotal * (Number(cfg.descuento) || 0) / 100);
    var total = subtotal - descuento;
    var iva = Math.round((total * Number(cfg.iva)) / (100 + Number(cfg.iva)));
    return { subtotal: subtotal, descuento: descuento, total: total, iva: iva, cfg: cfg };
  }

  function renderCarrito() {
    var t = totales();
    var cont = $("#carrito");

    if (!carrito.length) {
      cont.innerHTML = '<div class="empty"><span class="empty__mark">[0]</span>' +
        '<span class="empty__title">Carrito vacío</span>' +
        '<span class="empty__text">Toca un producto del catálogo para empezar la venta.</span></div>';
    } else {
      cont.innerHTML = carrito.map(function (l) {
        var p = P.find("productos", l.productoId);
        if (!p) return "";
        return '<div class="line">' +
          '<div><div class="line__name">' + P.esc(p.nombre) + "</div>" +
          '<div class="line__unit">' + P.esc(P.money(p.precio)) + " c/u</div>" +
          '<div class="qty mt-1">' +
          '<button type="button" data-menos="' + p.id + '" aria-label="Quitar una unidad de ' + P.esc(p.nombre) + '">−</button>' +
          '<span class="qty__n">' + l.cantidad + "</span>" +
          '<button type="button" data-mas="' + p.id + '" aria-label="Agregar una unidad de ' + P.esc(p.nombre) + '">+</button>' +
          "</div></div>" +
          '<div class="line__total">' + P.esc(P.money(p.precio * l.cantidad)) + "</div>" +
          "</div>";
      }).join("");
    }

    $("#t-subtotal").textContent = P.money(t.subtotal);
    $("#t-iva").textContent = P.money(t.iva);
    $("#t-total").textContent = P.money(t.total);
    $("#t-iva-label").textContent = "IVA incluido (" + t.cfg.iva + " %)";
    var fila = $("#fila-descuento");
    if (t.descuento > 0) {
      fila.hidden = false;
      $("#t-descuento").textContent = "−" + P.money(t.descuento);
    } else fila.hidden = true;

    $("#btn-cobrar").disabled = !carrito.length;
    $("#btn-cobrar").querySelector(".btn__label").textContent = carrito.length ? "Cobrar " + P.money(t.total) : "Cobrar";
    $("#btn-vaciar").disabled = !carrito.length;
  }

  $("#carrito").addEventListener("click", function (ev) {
    var mas = ev.target.closest("[data-mas]");
    var menos = ev.target.closest("[data-menos]");
    if (mas) cambiar(mas.getAttribute("data-mas"), 1);
    if (menos) cambiar(menos.getAttribute("data-menos"), -1);
  });

  $("#btn-vaciar").addEventListener("click", function () {
    if (!carrito.length) return;
    var previo = carrito.slice();
    carrito = [];
    renderCarrito();
    renderCatalogo();
    U.toast("Carrito vaciado.", {
      tone: "undo",
      dwell: 6000,
      action: { label: "Deshacer", run: function () { carrito = previo; renderCarrito(); renderCatalogo(); } }
    });
  });

  /* ---------------- cliente ---------------- */
  $("#btn-cliente").addEventListener("click", function () {
    var sel = $("#sel-cliente");
    sel.innerHTML = '<option value="">Consumidor final</option>' + P.list("clientes").map(function (c) {
      return '<option value="' + c.id + '">' + P.esc(c.nombre) + " · " + P.esc(c.rut || "sin RUT") + "</option>";
    }).join("");
    sel.value = clienteId || "";
    U.abrir($("#dlg-cliente"));
  });

  $("#btn-guardar-cliente").addEventListener("click", function () {
    clienteId = $("#sel-cliente").value || null;
    $("#venta-cliente-label").textContent = nombreCliente();
    pintarResumen(totales());
    U.cerrar($("#dlg-cliente"));
  });

  /* ---------------- cobro ---------------- */
  var dlgPago = $("#dlg-pago");

  function articulos() {
    return carrito.reduce(function (s, l) { return s + l.cantidad; }, 0);
  }

  function etiquetaArticulos(n) {
    return n + (n === 1 ? " artículo" : " artículos");
  }

  function nombreCliente() {
    return clienteId ? H.cli(clienteId) : "Consumidor final";
  }

  function pintarResumen(t) {
    $("#pago-items").textContent = etiquetaArticulos(articulos());
    $("#pago-iva").textContent = P.money(t.iva);
    $("#pago-cliente").textContent = nombreCliente();
    $("#pago-sub").textContent = etiquetaArticulos(articulos()) + " · " + nombreCliente();
  }

  $("#btn-cobrar").addEventListener("click", function () {
    if (!carrito.length) return;
    var t = totales();
    $("#pago-total").textContent = P.money(t.total);
    pintarResumen(t);
    $("#m-recibido").value = "";
    $("#cambio").textContent = P.money(0);
    $("#cambio-wrap").setAttribute("data-state", "ok");
    $("#cambio-label").textContent = "Cambio a devolver";
    $("#t-numero").value = ""; $("#t-nombre").value = ""; $("#t-vence").value = ""; $("#t-cvv").value = "";
    U.setError($("#m-recibido"), $("#m-recibido-help"), "");
    U.setError($("#t-numero"), $("#t-numero-help"), "");

    var cfg = t.cfg.metodosPago;
    $$("#metodos .paymethod").forEach(function (b) {
      var m = b.getAttribute("data-metodo");
      b.disabled = !cfg[m];
      b.setAttribute("aria-pressed", String(m === metodo));
    });
    if (!cfg[metodo]) metodo = ["efectivo", "debito", "credito"].filter(function (m) { return cfg[m]; })[0] || "efectivo";
    $$("#metodos .paymethod").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-metodo") === metodo));
    });
    pintarMetodo();
    renderBilletes(t.total);
    U.abrir(dlgPago);
  });

  function pintarMetodo() {
    var efectivo = metodo === "efectivo";
    var nombres = { efectivo: "Efectivo", debito: "Débito", credito: "Crédito" };
    $("#panel-efectivo").hidden = !efectivo;
    $("#panel-tarjeta").hidden = efectivo;
    $("#cambio-wrap").hidden = !efectivo;
    $("#pago-metodo").textContent = nombres[metodo] || metodo;
    $("#btn-confirmar").querySelector(".btn__label").textContent =
      (efectivo ? "Confirmar pago · " : "Procesar pago · ") + P.money(totales().total);
  }

  $("#metodos").addEventListener("click", function (ev) {
    var b = ev.target.closest(".paymethod");
    if (!b || b.disabled) return;
    metodo = b.getAttribute("data-metodo");
    $$("#metodos .paymethod").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    pintarMetodo();
  });

  function renderBilletes(total) {
    var candidatos = [total, Math.ceil(total / 1000) * 1000];
    [2000, 5000, 10000, 20000, 50000, 100000].forEach(function (b) { candidatos.push(b); });
    candidatos.push(Math.ceil(total / 5000) * 5000, Math.ceil(total / 10000) * 10000);

    var vistas = {};
    var chips = [];
    candidatos.forEach(function (b) {
      if (b < total || vistas[b] || chips.length >= 4) return;
      vistas[b] = 1;
      chips.push({ v: b, t: chips.length === 0 ? "Exacto" : P.plain(b) });
    });

    $("#billetes").innerHTML = chips.map(function (c, i) {
      return '<button class="cash__btn' + (i === 0 ? " cash__btn--exacto" : "") + '" type="button" data-billete="' + c.v + '">' + c.t + "</button>";
    }).join("");
  }

  $("#billetes").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-billete]");
    if (!b) return;
    $("#m-recibido").value = P.plain(Number(b.getAttribute("data-billete")));
    calcularCambio();
  });

  function digitos(v) {
    return String(v == null ? "" : v).replace(/\D/g, "");
  }

  function recibidoActual() {
    var campo = $("#m-recibido");
    var d = digitos(campo.value);
    campo.value = d ? P.plain(Number(d)) : "";
    return Number(d) || 0;
  }

  function calcularCambio() {
    var t = totales();
    var recibido = recibidoActual();
    var cambio = recibido - t.total;
    var wrap = $("#cambio-wrap");
    wrap.setAttribute("data-state", cambio < 0 ? "falta" : "ok");
    $("#cambio-label").textContent = cambio < 0 ? "Faltan" : "Cambio a devolver";
    $("#cambio").textContent = P.money(Math.abs(cambio));
    return cambio;
  }

  $("#m-recibido").addEventListener("input", calcularCambio);

  $("#btn-confirmar").addEventListener("click", function () {
    var btn = $("#btn-confirmar");
    var t = totales();
    var datos = {
      metodo: metodo,
      usuarioId: H.sesion.id,
      clienteId: clienteId,
      items: carrito.map(function (l) { return { productoId: l.productoId, cantidad: l.cantidad }; })
    };

    if (metodo === "efectivo") {
      var recibido = recibidoActual();
      if (recibido < t.total) {
        U.setError($("#m-recibido"), $("#m-recibido-help"), "El monto recibido es menor que el total. Faltan " + P.money(t.total - recibido) + ".");
        return;
      }
      datos.montoRecibido = recibido;
      datos.cambio = recibido - t.total;
    } else {
      var num = $("#t-numero").value.replace(/\s+/g, "");
      if (num.length < 15) {
        U.setError($("#t-numero"), $("#t-numero-help"), "La tarjeta necesita 16 dígitos. Revisa el número.");
        return;
      }
      if (!$("#t-nombre").value.trim()) { U.setError($("#t-nombre"), $("#t-nombre").parentNode.querySelector(".field__help"), "Escribe el nombre del titular."); return; }
      if (!/^\d{2}\/\d{2}$/.test($("#t-vence").value.trim())) { U.setError($("#t-vence"), $("#t-vence").parentNode.querySelector(".field__help"), "Usa el formato MM/AA."); return; }
      if ($("#t-cvv").value.trim().length < 3) { U.setError($("#t-cvv"), $("#t-cvv").parentNode.querySelector(".field__help"), "El CVV tiene 3 o 4 dígitos."); return; }
      datos.montoRecibido = t.total;
      datos.cambio = 0;
      datos.ultima4 = num.slice(-4);
    }

    btn.setAttribute("data-state", "loading");
    btn.setAttribute("aria-busy", "true");

    window.setTimeout(function () {
      var r = P.crearBoleta(datos);
      btn.removeAttribute("data-state");
      btn.removeAttribute("aria-busy");

      if (!r.ok) {
        U.toast(r.error, { tone: "error" });
        U.cerrar(dlgPago);
        renderCatalogo();
        return;
      }

      U.cerrar(dlgPago);
      carrito = [];
      clienteId = null;
      $("#venta-cliente-label").textContent = "Consumidor final";
      renderCarrito();
      mostrarComprobante(r.boleta);
      mostrarPanel("comprobante");
    }, 950);
  });

  /* ---------------- paneles: venta / comprobante ---------------- */
  function mostrarPanel(cual) {
    $("#panel-venta").hidden = cual !== "venta";
    $("#panel-comprobante").hidden = cual !== "comprobante";
    window.scrollTo({ top: 0 });
  }

  $("#btn-nueva-venta").addEventListener("click", function () {
    mostrarPanel("venta");
    renderCatalogo();
  });

  /* ---------------- comprobante ---------------- */
  function mostrarComprobante(b) {
    var cfg = P.config();
    var v = P.find("usuarios", b.usuarioId);
    $("#comprobante").innerHTML =
      '<div class="receipt">' +
      '<div class="receipt__title">' + P.esc(cfg.negocio) + "</div>" +
      '<div class="receipt__sub">' + P.esc(cfg.rut) + " · " + P.esc(cfg.direccion) + "</div>" +
      "<hr />" +
      '<div class="receipt__row"><span>Boleta</span><span>' + P.esc(P.numeroBoleta(b.numero)) + "</span></div>" +
      '<div class="receipt__row"><span>Fecha</span><span>' + P.esc(P.fechaHora(b.fecha)) + "</span></div>" +
      '<div class="receipt__row"><span>Vendedor</span><span>' + P.esc(v ? v.nombre : "—") + "</span></div>" +
      '<div class="receipt__row"><span>Cliente</span><span>' + P.esc(H.cli(b.clienteId)) + "</span></div>" +
      "<hr />" +
      '<div class="receipt__items">' + b.items.map(function (i) {
        return '<div class="receipt__row"><span>' + i.cantidad + " × " + P.esc(i.nombre) + "</span><span>" + P.esc(P.money(i.precio * i.cantidad)) + "</span></div>";
      }).join("") + "</div>" +
      "<hr />" +
      '<div class="receipt__row"><span>Subtotal</span><span>' + P.esc(P.money(b.subtotal)) + "</span></div>" +
      (b.descuento ? '<div class="receipt__row"><span>Descuento</span><span>−' + P.esc(P.money(b.descuento)) + "</span></div>" : "") +
      '<div class="receipt__row"><span>IVA incluido (' + cfg.iva + ' %)</span><span>' + P.esc(P.money(b.iva)) + "</span></div>" +
      '<div class="receipt__row receipt__row--total"><span>Total</span><span>' + P.esc(P.money(b.total)) + "</span></div>" +
      "<hr />" +
      '<div class="receipt__row"><span>Pago</span><span>' + P.esc(b.pago.metodo) + "</span></div>" +
      (b.pago.metodo === "efectivo"
        ? '<div class="receipt__row"><span>Recibido</span><span>' + P.esc(P.money(b.pago.montoRecibido)) + "</span></div>" +
          '<div class="receipt__row"><span>Cambio</span><span>' + P.esc(P.money(b.pago.cambio)) + "</span></div>"
        : '<div class="receipt__row"><span>Tarjeta</span><span>•••• ' + P.esc(b.pago.ultima4 || "0000") + "</span></div>") +
      '<p class="receipt__foot">' + P.esc(cfg.pieBoleta) + "</p>" +
      "</div>";
  }

  /* ---------------- arranque ---------------- */
  renderCarrito();
  renderCatalogo();
})();
