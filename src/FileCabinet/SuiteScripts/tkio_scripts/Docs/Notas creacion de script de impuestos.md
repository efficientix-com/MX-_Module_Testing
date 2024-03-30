Notas creacion de script de impuestos
Consideraciones del script
1. Impuestos del IVA (16,8 y 0), IEPS, Retenciones y Exentos
2. Descuentos globales (% o $)
3. Descuentos de línea

Pasos:
1. Extrae los artículos que son de descuentos en linea
    a. crea variable arreglo de objeto de la siguiente estructura:
        var discount_items=[
            {
                amount_of_discount:0.00, --> has to be using 2 decimal places
                has_been_applied:false
            }
        ]

2. Extrae los descuentos de cabecera
    a. crea variable de tipo objeto que contenga la siguiente estructura:
        var global_discount={
            type_of_discount:'percentage' || 'amount' || 'none',
            amount_or_rate:0.00,
            has_been_applied:false
        }
3. Crea escenarios:
    a. Si tiene descuento global de porcentaje:
        1. Itera por todos los articulos y extrae el monto de linea
        2. Crea funcion de descuentos globales
        if(global_discount.type_of_discount=='percentage'){
            var discount_to_apply= ((descuento * monto de linea)/100).toFixed(4). 
        
            En objeto JSON del articulo te debe de poner la información en descuentoSinImpuesto.

            item.descuentoSinImpuesto=discount_to_apply;
            item.montoLinea_menosDescuentos=item.montoLinea - item.descuentoSinImpuesto

        }else if(global_discount.type_of_discount=='amount'){
            if(global_discount.amount_or_rate>item.montoLinea){
                for(var i=global_discount.amount_or_rate;i==0;i--){

                    var get_half_amount_of_item=((item.montoLinea*50)/100).toFixed(4);
                    if(get_half_amount_of_item>global_discount.amount_or_rate){
                        get_hal_amount_of_item=global_discount.amount_or_rate;
                    }
                    item.descuentoSinImpuesto=get_half_amount_of_item;
                    item.montoLinea_menosDescuentos=item.descuentoSinImpuesto;
                    global_discount.amount_or_rate=global_discount.amount_or_rate-get_half_amount_of_item;
                    i=global_discount.amount_or_rate
                }
            }else{
                item.descuentoSinImpuesto=0.00
                item.montoLinea_menosDescuentos=item.montoLinea-global_discount.amount_or_rate
            }
        }else{
            item.montoLinea_menosDescuentos=item.montoLinea
        }
        2a. Crea función que itere por cada articulo de descuento:
            if(discount_items.length>0){
                discount_items.forEach((discount_element)=>{
                    if(discount_element.has_been_applied==false){

                        item.montoLinea_menosDescuentos=(item.montoLinea_menosDescuentos) - discount_element.amount_of_discount;
                        discount_element.has_been_applied=true;
                    }
                })
            }
        
        3. Crea funcion que por cada json del articulo ponga name, id, rate y base
        
        4. Crea función que esté condicionada:
        <!-- MontoLinea_menosDescuentos siempre existe con o sin los descuentos -->
            define función que saque base_importe,importe y descuento

            function execute_tax_operations(){
                if(item.locales.id!==''){
                     <!-- Va sección de impuestos Locales -->
                    item.locales.base_importe=item.montoLinea_menosDescuentos;
                    item.locales.importe=(item.locales.rate*item.locales.base_importe)/item.locales.base;
                   
                }
                if(item.ieps.id!=='){
                    <!-- Va sección de IEPS -->
                    item.ieps.base_importe=item.montoLinea_menosDescuentos;
                    item.ieps.importe=(item.ieps.rate*item.ieps.base_importe)/item.ieps.base;
                    

                   
                }
                if(item.iva.id!==''){
                    <!-- Va seccion de IVA -->
                    item.iva.base_importe=item.montoLinea_menosDescuentos;
                    item.iva.importe=(item.iva.rate*item.iva.base_importe)/item.iva.base;
                }
                if(item.retenciones.id!==''){
                    <!-- Va seccion de RETENCIONES -->
                    item.retenciones.base_importe=item.montoLinea_menosDescuentos;
                    item.retenciones.importe=(item.retenciones.rate*item.retenciones.base_importe)/item.retenciones.base;
                }
                if(item.exento.id!==''){
                    <!-- Va seccion de RETENCIONES -->
                    item.exento.base_importe=item.montoLinea_menosDescuentos;
                    item.exento.importe=(item.exento.rate*item.exento.base_importe)/item.exento.base;
                }

            }

            En general, el orden de aplicación de impuestos que mencionas sería adecuado para un producto sujeto a impuestos locales, IEPS y IVA. Esto significa que primero se aplicarían los impuestos locales, luego el IEPS y finalmente el IVA. Sin embargo, es importante recordar que el orden puede variar según las regulaciones específicas y las circunstancias particulares.

En cuanto a las retenciones y los productos exentos, aquí hay una clarificación:

- **Retenciones y combinación con impuestos:** Las retenciones fiscales, como la retención del ISR, generalmente se aplican sobre los ingresos o transacciones antes de la aplicación de otros impuestos como el IVA. Por lo tanto, si hay una retención de ISR sobre un pago, esta retención se deduciría primero y luego se calcularía el IVA sobre el monto restante, si corresponde. La retención en sí misma no está relacionada con la aplicación del IVA; son procesos independientes.

- **Productos exentos de impuestos:** Si un producto está exento de impuestos, como el IVA, esto significa que no se aplicaría el IVA sobre ese producto en particular. En este caso, no habría combinación con otros impuestos como el IEPS, ya que el producto está exento de impuestos. La exención de impuestos generalmente significa que el producto está exento de todos los impuestos específicos aplicables, y por lo tanto no se aplicaría ningún otro impuesto sobre él.

En resumen:

- Para productos sujetos a impuestos locales, IEPS y IVA, el orden mencionado (impuestos locales, IEPS, IVA) es apropiado.
- Las retenciones fiscales se aplican antes de la aplicación del IVA u otros impuestos sobre los ingresos o transacciones.
- Los productos exentos de impuestos no están sujetos a la aplicación de impuestos específicos, como el IVA o el IEPS.