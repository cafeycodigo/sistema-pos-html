Sistema pos 


es un sistema simple mockups en tailwind css usando solo html de punto de venta, que permite a los usuarios realizar ventas, gestionar inventario y generar reportes de ventas. Está diseñado para ser fácil de usar y personalizable según las necesidades del negocio.


tendra un login

el login permitirá a los usuarios acceder al sistema de manera segura, asegurando que solo personal autorizado pueda realizar transacciones y gestionar el inventario. Los usuarios podrán registrarse y crear cuentas con diferentes niveles de acceso según su rol en la empresa.

que puede hacer el administrador 
 - El administrador tendrá la capacidad de:
   - Agregar, editar y eliminar productos del inventario.
    - Gestionar usuarios, asignando roles y permisos según las necesidades del negocio. (vendedor , administrador)
    - categoria de productos
    - clientes 
    - boletas 
    - Generar reportes de ventas detallados, incluyendo ventas por producto, por usuario y por fecha.
    - Configurar ajustes del sistema, como impuestos, descuentos y métodos de pago.


cuan entre al admin tendra botones para ver - productos, usuarios, categorias, clientes, boletas y reportes de venta y configuracion

productos es un crud -> al entrar se listaran los producots y se podra crear, update, eleminiar, mostrar productos

a cliente lo mismo, a los usuarios lo mismo, categoria tambien 

las boletas, solo podra ver las boletas generadas y sus detalles, pero no podrá modificarlas ni eliminarlas, ya que estas representan transacciones completadas.


el vendedor podrá:
   - Realizar ventas de productos, registrando la información del cliente y generando boletas de venta.
   - Consultar el inventario disponible para verificar la disponibilidad de productos.
   

inicia la vista con tres botones : ver productos, categoria o iniciar venta . tambien salir 
 
 ver productos y cartegoria solo vera informacion de ellos y no podra editar

 iniciar venta 

 tendra un pos - lado izquierdo se mostrara el listado de productos disponibles para la venta, con opciones para agregar productos al carrito. El lado derecho mostrará el carrito de compras, donde se podrán ver los productos seleccionados, sus cantidades y el total a pagar, al final tendra la opcion de pago donde se mostrara Efectivo , debito o credito .. estoos tienen su configuracion 

 si es efectivo, se mostrara un campo para ingresar el monto recibido y calcular el cambio a devolver. Si es débito o crédito, se mostrará un formulario para ingresar los datos de la tarjeta y procesar el pago. 

 luego al finalizar se mostrara el comprobante. 


