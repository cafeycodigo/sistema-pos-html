/* POS · capa de datos · localStorage + semilla fake
 * Todo el estado vive en una sola clave; se reemplaza completo con POS.reset(). */
(function (global) {
  "use strict";

  var DB_KEY = "pos_aromos_v1";
  var SESSION_KEY = "pos_aromos_sesion";

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  /* ---------------- semilla ---------------- */
  function seed() {
    var hoy = new Date();
    function diaISO(offset) {
      var d = new Date(hoy.getTime() + offset * 86400000);
      return d.toISOString().slice(0, 10);
    }
    function horaISO(offset, h, m) {
      var d = new Date(hoy.getTime() + offset * 86400000);
      d.setHours(h, m, 0, 0);
      return d.toISOString();
    }

    var usuarios = [
      { id: "u1", nombre: "Andrea Villalobos", email: "admin@aromos.cl", password: "admin123", rol: "admin", activo: true, creado: diaISO(-180) },
      { id: "u2", nombre: "Rodrigo Cáceres", email: "vendedor@aromos.cl", password: "vende123", rol: "vendedor", activo: true, creado: diaISO(-120) },
      { id: "u3", nombre: "Marta Quilodrán", email: "marta@aromos.cl", password: "vende123", rol: "vendedor", activo: true, creado: diaISO(-64) },
      { id: "u4", nombre: "Héctor San Martín", email: "hector@aromos.cl", password: "admin123", rol: "admin", activo: false, creado: diaISO(-40) }
    ];

    var categorias = [
      { id: "c1", nombre: "Bebidas", creado: diaISO(-180) },
      { id: "c2", nombre: "Snacks", creado: diaISO(-180) },
      { id: "c3", nombre: "Lácteos", creado: diaISO(-175) },
      { id: "c4", nombre: "Aseo", creado: diaISO(-175) },
      { id: "c5", nombre: "Frutas y verduras", creado: diaISO(-170) },
      { id: "c6", nombre: "Panadería", creado: diaISO(-170) }
    ];

    var productos = [
      { id: "p1", sku: "BEB-001", nombre: "Agua mineral 1 L", categoriaId: "c1", precio: 990, stock: 48, activo: true },
      { id: "p2", sku: "BEB-002", nombre: "Té frío durazno 1,5 L", categoriaId: "c1", precio: 1490, stock: 24, activo: true },
      { id: "p3", sku: "BEB-003", nombre: "Jugo de uva 1 L", categoriaId: "c1", precio: 1790, stock: 18, activo: true },
      { id: "p4", sku: "SNK-001", nombre: "Papas clásicas 150 g", categoriaId: "c2", precio: 1290, stock: 36, activo: true },
      { id: "p5", sku: "SNK-002", nombre: "Maní salado 200 g", categoriaId: "c2", precio: 1590, stock: 20, activo: true },
      { id: "p6", sku: "SNK-003", nombre: "Galletas de chocolate", categoriaId: "c2", precio: 1190, stock: 30, activo: true },
      { id: "p7", sku: "LAC-001", nombre: "Leche entera 1 L", categoriaId: "c3", precio: 1350, stock: 40, activo: true },
      { id: "p8", sku: "LAC-002", nombre: "Yogur natural 1 kg", categoriaId: "c3", precio: 2490, stock: 12, activo: true },
      { id: "p9", sku: "LAC-003", nombre: "Queso gouda 200 g", categoriaId: "c3", precio: 3290, stock: 8, activo: true },
      { id: "p10", sku: "ASE-001", nombre: "Detergente líquido 1 L", categoriaId: "c4", precio: 2890, stock: 15, activo: true },
      { id: "p11", sku: "ASE-002", nombre: "Papel higiénico 4 unidades", categoriaId: "c4", precio: 2190, stock: 22, activo: true },
      { id: "p12", sku: "ASE-003", nombre: "Jabón de lavar 400 g", categoriaId: "c4", precio: 1690, stock: 3, activo: true },
      { id: "p13", sku: "FRV-001", nombre: "Tomate por kg", categoriaId: "c5", precio: 1890, stock: 12, activo: true },
      { id: "p14", sku: "FRV-002", nombre: "Plátano por kg", categoriaId: "c5", precio: 1490, stock: 16, activo: true },
      { id: "p15", sku: "PAN-001", nombre: "Pan francés unidad", categoriaId: "c6", precio: 450, stock: 60, activo: true },
      { id: "p16", sku: "PAN-002", nombre: "Marraqueta unidad", categoriaId: "c6", precio: 450, stock: 0, activo: true }
    ];

    var clientes = [
      { id: "cl1", nombre: "Camila Rojas", rut: "12.345.678-9", telefono: "9 8123 4567", email: "camila.rojas@correo.cl", creado: diaISO(-150) },
      { id: "cl2", nombre: "Esteban Muñoz", rut: "9.876.543-2", telefono: "9 7788 1122", email: "esteban.munoz@correo.cl", creado: diaISO(-90) },
      { id: "cl3", nombre: "Paulina Errázuriz", rut: "14.555.666-3", telefono: "9 6655 4433", email: "paulina.errazuriz@correo.cl", creado: diaISO(-45) },
      { id: "cl4", nombre: "Café Ñuñoa SpA", rut: "76.555.444-8", telefono: "2 2345 678", email: "compras@cafenuñoa.cl", creado: diaISO(-30) }
    ];

    var config = {
      negocio: "Minimarket Los Aromos",
      rut: "77.123.456-7",
      direccion: "Av. Los Aromos 1420, Ñuñoa",
      iva: 19,
      descuento: 0,
      moneda: "CLP",
      metodosPago: { efectivo: true, debito: true, credito: true },
      pieBoleta: "Gracias por su compra. Cambios dentro de los 30 días con boleta."
    };

    var boletas = [];

    function armar(offset, hora, min, clienteId, usuarioId, metodo, lineas, extra) {
      var items = lineas.map(function (l) {
        var p = productos.filter(function (x) { return x.id === l[0]; })[0];
        return { productoId: p.id, nombre: p.nombre, sku: p.sku, precio: p.precio, cantidad: l[1] };
      });
      var subtotal = items.reduce(function (s, i) { return s + i.precio * i.cantidad; }, 0);
      var descuento = extra && extra.descuento ? extra.descuento : 0;
      var total = subtotal - descuento;
      return {
        id: uid("b"),
        numero: extra && extra.numero,
        fecha: horaISO(offset, hora, min),
        usuarioId: usuarioId,
        clienteId: clienteId || null,
        items: items,
        subtotal: subtotal,
        descuento: descuento,
        total: total,
        iva: Math.round((total * config.iva) / (100 + config.iva)),
        pago: {
          metodo: metodo,
          montoRecibido: metodo === "efectivo" ? Math.ceil(total / 1000) * 1000 : total,
          cambio: metodo === "efectivo" ? Math.ceil(total / 1000) * 1000 - total : 0,
          ultima4: metodo === "efectivo" ? null : "4417"
        }
      };
    }

    boletas.push(armar(0, 9, 12, "cl1", "u2", "efectivo", [["p15", 4], ["p7", 1], ["p4", 1]], { numero: 1 }));
    boletas.push(armar(0, 10, 48, null, "u3", "debito", [["p10", 1], ["p11", 1], ["p5", 2]], { numero: 2 }));
    boletas.push(armar(0, 12, 5, "cl4", "u2", "credito", [["p7", 12], ["p6", 6], ["p3", 4]], { numero: 3, descuento: 3500 }));
    boletas.push(armar(-1, 16, 33, "cl2", "u3", "efectivo", [["p13", 2], ["p14", 1], ["p15", 6]], { numero: 4 }));
    boletas.push(armar(-1, 18, 20, null, "u2", "debito", [["p8", 1], ["p9", 1]], { numero: 5 }));
    boletas.push(armar(-2, 11, 2, "cl3", "u3", "efectivo", [["p1", 3], ["p2", 2], ["p4", 2]], { numero: 6 }));
    boletas.push(armar(-3, 15, 47, null, "u2", "credito", [["p10", 2], ["p12", 1]], { numero: 7 }));
    boletas.push(armar(-4, 17, 9, "cl1", "u3", "efectivo", [["p16", 8], ["p15", 8]], { numero: 8 }));

    return {
      version: 1,
      creado: new Date().toISOString(),
      usuarios: usuarios,
      categorias: categorias,
      productos: productos,
      clientes: clientes,
      boletas: boletas,
      config: config,
      secuencias: { boleta: 9 }
    };
  }

  /* ---------------- persistencia ---------------- */
  function read() {
    var raw = null;
    try { raw = global.localStorage.getItem(DB_KEY); } catch (e) { raw = null; }
    if (!raw) {
      var s = seed();
      write(s);
      return s;
    }
    try { return JSON.parse(raw); } catch (e) { var f = seed(); write(f); return f; }
  }

  function write(db) {
    try { global.localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) { /* modo privado */ }
    return db;
  }

  /* ---------------- colecciones ---------------- */
  function list(cola) { return clone(read()[cola] || []); }

  function find(cola, id) {
    var row = (read()[cola] || []).filter(function (x) { return x.id === id; })[0];
    return row ? clone(row) : null;
  }

  function insert(cola, row) {
    var db = read();
    row.id = row.id || uid(cola.slice(0, 2));
    row.creado = row.creado || new Date().toISOString().slice(0, 10);
    db[cola] = db[cola] || [];
    db[cola].push(row);
    write(db);
    return clone(row);
  }

  function update(cola, id, patch) {
    var db = read();
    var found = -1;
    (db[cola] || []).forEach(function (x, i) { if (x.id === id) found = i; });
    if (found < 0) return null;
    Object.keys(patch).forEach(function (k) { db[cola][found][k] = patch[k]; });
    write(db);
    return clone(db[cola][found]);
  }

  function remove(cola, id) {
    var db = read();
    var gone = null;
    db[cola] = (db[cola] || []).filter(function (x) {
      if (x.id === id) { gone = clone(x); return false; }
      return true;
    });
    write(db);
    return gone;
  }

  function restore(cola, row) {
    var db = read();
    db[cola] = db[cola] || [];
    db[cola].push(row);
    write(db);
  }

  /* ---------------- sesión ---------------- */
  function session() {
    try {
      var id = global.localStorage.getItem(SESSION_KEY);
      if (!id) return null;
      var u = find("usuarios", id);
      return u && u.activo ? u : null;
    } catch (e) { return null; }
  }

  function login(email, password) {
    var user = list("usuarios").filter(function (u) {
      return u.email.toLowerCase() === String(email || "").trim().toLowerCase() && u.password === password;
    })[0];
    if (!user) return { ok: false, error: "No encontramos una cuenta con ese correo y esa contraseña." };
    if (!user.activo) return { ok: false, error: "Esta cuenta está desactivada. Pide al administrador que la reactive." };
    try { global.localStorage.setItem(SESSION_KEY, user.id); } catch (e) { /* ignorado */ }
    return { ok: true, user: user };
  }

  function logout() {
    try { global.localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignorado */ }
  }

  /* ---------------- ventas ---------------- */
  function crearBoleta(datos) {
    var db = read();
    var items = datos.items.map(function (it) {
      var p = db.productos.filter(function (x) { return x.id === it.productoId; })[0];
      if (!p) return null;
      return { productoId: p.id, nombre: p.nombre, sku: p.sku, precio: p.precio, cantidad: it.cantidad };
    }).filter(Boolean);

    if (!items.length) return { ok: false, error: "El carrito está vacío." };

    var faltan = items.filter(function (it) {
      var p = db.productos.filter(function (x) { return x.id === it.productoId; })[0];
      return !p || p.stock < it.cantidad;
    });
    if (faltan.length) {
      return { ok: false, error: "Stock insuficiente en: " + faltan.map(function (f) { return f.nombre; }).join(", ") + "." };
    }

    var subtotal = items.reduce(function (s, i) { return s + i.precio * i.cantidad; }, 0);
    var descuento = Math.round(subtotal * (Number(db.config.descuento) || 0) / 100);
    var total = subtotal - descuento;
    var numero = db.secuencias.boleta++;

    var boleta = {
      id: uid("b"),
      numero: numero,
      fecha: new Date().toISOString(),
      usuarioId: datos.usuarioId,
      clienteId: datos.clienteId || null,
      items: items,
      subtotal: subtotal,
      descuento: descuento,
      total: total,
      iva: Math.round((total * Number(db.config.iva)) / (100 + Number(db.config.iva))),
      pago: {
        metodo: datos.metodo,
        montoRecibido: datos.montoRecibido || total,
        cambio: datos.cambio || 0,
        ultima4: datos.ultima4 || null
      }
    };

    items.forEach(function (it) {
      db.productos.forEach(function (p) {
        if (p.id === it.productoId) p.stock -= it.cantidad;
      });
    });
    db.boletas.push(boleta);
    write(db);
    return { ok: true, boleta: boleta };
  }

  function config() { return clone(read().config); }

  function saveConfig(patch) {
    var db = read();
    Object.keys(patch).forEach(function (k) { db.config[k] = patch[k]; });
    write(db);
    return clone(db.config);
  }

  function reset() { write(seed()); }

  /* ---------------- formato ---------------- */
  var clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
  var num = new Intl.NumberFormat("es-CL");

  function money(n) { return clp.format(Number(n) || 0); }
  function plain(n) { return num.format(Number(n) || 0); }

  function fecha(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  function fechaHora(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" }) + " " +
      d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  }
  function diaISO(d) {
    var x = new Date(d);
    var m = String(x.getMonth() + 1).padStart(2, "0");
    var dd = String(x.getDate()).padStart(2, "0");
    return x.getFullYear() + "-" + m + "-" + dd;
  }
  function numeroBoleta(n) { return "B-" + String(n).padStart(6, "0"); }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  global.POS = {
    uid: uid, clone: clone,
    read: read, write: write, reset: reset,
    list: list, find: find, insert: insert, update: update, remove: remove, restore: restore,
    session: session, login: login, logout: logout,
    crearBoleta: crearBoleta, config: config, saveConfig: saveConfig,
    money: money, plain: plain, fecha: fecha, fechaHora: fechaHora, diaISO: diaISO,
    numeroBoleta: numeroBoleta, esc: esc
  };
})(window);
