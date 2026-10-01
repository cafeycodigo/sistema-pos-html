/* Configuración · negocio, impuestos, métodos de pago y restablecer datos */
(function () {
  "use strict";

  var P = window.POS;
  var U = window.UI;
  var H = window.H;
  if (!H) return;
  var $ = U.$;

  function cargar() {
    var c = P.config();
    var f = $("#form-config");
    f.negocio.value = c.negocio;
    f.rut.value = c.rut;
    f.direccion.value = c.direccion;
    f.pieBoleta.value = c.pieBoleta;
    f.iva.value = c.iva;
    f.descuento.value = c.descuento;
    f.efectivo.checked = !!c.metodosPago.efectivo;
    f.debito.checked = !!c.metodosPago.debito;
    f.credito.checked = !!c.metodosPago.credito;
  }

  $("#form-config").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = ev.target;
    var help = f.negocio.parentNode.querySelector(".field__help");
    if (!U.requerido(f.negocio, help, "el nombre del negocio")) return;
    if (!f.efectivo.checked && !f.debito.checked && !f.credito.checked) {
      U.toast("Deja al menos un método de pago habilitado.", { tone: "error" });
      return;
    }
    var iva = Number(f.iva.value);
    var desc = Number(f.descuento.value);
    if (!(iva >= 0 && iva <= 35)) { U.setError(f.iva, f.iva.parentNode.querySelector(".field__help"), "El IVA va entre 0 y 35."); return; }
    if (!(desc >= 0 && desc <= 50)) { U.setError(f.descuento, f.descuento.parentNode.querySelector(".field__help"), "El descuento va entre 0 y 50."); return; }

    P.saveConfig({
      negocio: f.negocio.value.trim(),
      rut: f.rut.value.trim(),
      direccion: f.direccion.value.trim(),
      pieBoleta: f.pieBoleta.value.trim(),
      iva: iva,
      descuento: desc,
      metodosPago: { efectivo: f.efectivo.checked, debito: f.debito.checked, credito: f.credito.checked }
    });
    U.setError(f.negocio, help, "");
    U.toast("Configuración guardada. Las próximas boletas usan estos valores.");
  });

  var resetArmado = false;
  $("#btn-reset").addEventListener("click", function (ev) {
    var b = ev.currentTarget;
    if (!resetArmado) {
      resetArmado = true;
      b.textContent = "Confirmar restablecimiento";
      b.setAttribute("data-state", "error");
      U.toast("Esto borra ventas y cambios locales. Pulsa de nuevo para confirmar.", { tone: "error", dwell: 6000 });
      window.setTimeout(function () {
        resetArmado = false;
        b.textContent = "Restablecer datos de ejemplo";
        b.removeAttribute("data-state");
      }, 6000);
      return;
    }
    P.reset();
    U.toast("Datos de ejemplo restablecidos.");
    window.setTimeout(function () { window.location.reload(); }, 600);
  });

  cargar();
})();
