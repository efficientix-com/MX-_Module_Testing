/**
 * @NApiVersion 2.1
 */
define(['N/log', 'N/search'],
    /**
 * @param{log} log
 */
    (log, search) => {

        const getTaxConfigurations = () => {
            var dataToReturn = {
                success:false,
                msg:'',
                config_ieps: '',
                config_retencion: '',
                config_local: '',
                config_iva: '',
                config_exento: ''
            }
            try {

                var desglose_config = search.create({
                    type: 'customrecord_efx_fe_desglose_tax',
                    filters: ['isinactive', search.Operator.IS, 'F'],
                    columns: [
                        search.createColumn({ name: 'custrecord_efx_fe_desglose_ieps' }),
                        search.createColumn({ name: 'custrecord_efx_fe_desglose_ret' }),
                        search.createColumn({ name: 'custrecord_efx_fe_desglose_locales' }),
                        search.createColumn({ name: 'custrecord_efx_fe_desglose_iva' }),
                        search.createColumn({ name: 'custrecord_efx_fe_desglose_exento' }),
                    ]
                });

                var ejecutar = desglose_config.run();
                var resultado = ejecutar.getRange(0, 100);

                dataToReturn.config_ieps = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_ieps' })).split(',');
                dataToReturn.config_retencion = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_ret' })).split(',');
                dataToReturn.config_local = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_locales' })).split(',');
                dataToReturn.config_iva = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_iva' })).split(',');
                dataToReturn.config_exento = (resultado[0].getValue({ name: 'custrecord_efx_fe_desglose_exento' })).split(',');
                dataToReturn.success=true;
                
                return dataToReturn

            } catch (err) {
                log.error({ title: 'Error occurred in getTaxConfigurations', details: err });
                dataToReturn.msg='No se encontró una configuración adecuada del desglose de impuestos'
                return dataToReturn;
            }
        }
        const obtenObjImpuesto = (subsidiariaTransaccion, nexo) => {
            var objcodigosMainFull = {};
            var objcodigosMain = {};
            var objcodigosMainCodes = {};
            var arrayobjcodigos = new Array();

            var arraybusquedagroup = new Array();
            var arraybusquedacode = new Array();
            arraybusquedagroup.push(["isinactive", search.Operator.IS, "F"]);
            arraybusquedacode.push(["isinactive", search.Operator.IS, "F"]);

            if (subsidiariaTransaccion) {
                arraybusquedagroup.push("AND");
                arraybusquedacode.push("AND");
                arraybusquedagroup.push(["subsidiary", search.Operator.ANYOF, subsidiariaTransaccion]);
                arraybusquedacode.push(["subsidiary", search.Operator.ANYOF, subsidiariaTransaccion]);
                arraybusquedagroup.push("AND");
                arraybusquedagroup.push(["country", search.Operator.ANYOF, nexo]);
                arraybusquedacode.push("AND");
                arraybusquedacode.push(["country", search.Operator.ANYOF, nexo]);
            }
            log.audit({ title: 'arraybusquedagroup', details: arraybusquedagroup });
            log.audit({ title: 'arraybusquedacode', details: arraybusquedacode });

            //busca grupos de impuestos
            var taxgroupSearchObj = search.create({
                type: search.Type.TAX_GROUP,
                filters: arraybusquedagroup,
                columns:
                    [
                        search.createColumn({ name: "itemid", }),
                        search.createColumn({ name: "rate", label: "Tasa" }),
                        search.createColumn({ name: "country", label: "País" }),
                        search.createColumn({ name: "internalid", label: "ID interno" })
                    ]
            });
            var ejecutar = taxgroupSearchObj.run();
            var resultado = ejecutar.getRange(0, 900);

            for (var i = 0; i < resultado.length; i++) {
                var tax_code = resultado[i].getValue({ name: "internalid" });

                var info_tax_rec = record.load({
                    type: record.Type.TAX_GROUP,
                    id: tax_code,
                    isDynamic: true
                });
                objcodigosMain[tax_code] = new Array();

                var tax_lines_count = info_tax_rec.getLineCount({ sublistId: 'taxitem' });
                for (var x = 0; x < tax_lines_count; x++) {
                    var objcodigos = {
                        taxname2: '',
                        taxname: '',
                        rate: '',
                        basis: '',
                        taxtype: '',
                    }
                    objcodigos.taxname2 = info_tax_rec.getSublistValue({
                        sublistId: 'taxitem',
                        fieldId: 'taxname2',
                        line: x
                    });
                    objcodigos.taxname = info_tax_rec.getSublistValue({
                        sublistId: 'taxitem',
                        fieldId: 'taxname',
                        line: x
                    });
                    objcodigos.rate = info_tax_rec.getSublistValue({
                        sublistId: 'taxitem',
                        fieldId: 'rate',
                        line: x
                    });
                    objcodigos.basis = info_tax_rec.getSublistValue({
                        sublistId: 'taxitem',
                        fieldId: 'basis',
                        line: x
                    });
                    objcodigos.taxtype = info_tax_rec.getSublistValue({
                        sublistId: 'taxitem',
                        fieldId: 'taxtype',
                        line: x
                    });
                    objcodigosMain[tax_code].push(objcodigos);
                }
            }


            //busca codigos de impuestos

            var salestaxitemSearchObj = search.create({
                type: search.Type.SALES_TAX_ITEM,
                filters: arraybusquedacode,
                columns: [
                    search.createColumn({ name: "name", }),
                    search.createColumn({ name: "itemid", label: "ID de artículo" }),
                    search.createColumn({ name: "rate", label: "Tasa" }),
                    search.createColumn({ name: "country", label: "País" }),
                    //search.createColumn({name: "custrecord_4110_category", label: "Categoría"}),
                    search.createColumn({ name: "internalid", label: "ID interno" }),
                    search.createColumn({ name: "taxtype", label: "Tipo Impuesto" })
                ]
            });

            var ejecutar = salestaxitemSearchObj.run();
            var resultado = ejecutar.getRange(0, 900);


            //objcodigosMainCodes.codigos = new Array();
            for (i = 0; i < resultado.length; i++) {

                var tax_code = resultado[i].getValue({ name: "internalid" });


                objcodigosMainCodes[tax_code] = new Array();

                var objcodigos = {
                    itemid: '',
                    id: '',
                    rate: '',
                    basis: '100',
                    taxtype: '',
                }

                objcodigos.itemid = resultado[i].getValue({ name: "itemid" });
                objcodigos.id = resultado[i].getValue({ name: "internalid" });
                var ratecode = (resultado[i].getValue({ name: "rate" })).replace('%', '');
                objcodigos.rate = parseFloat(ratecode);
                objcodigos.basis = '100';

                objcodigos.taxtype = resultado[i].getText({ name: "taxtype" });
                objcodigosMainCodes[tax_code].push(objcodigos);

            }

            objcodigosMainFull.TaxGroup = objcodigosMain;
            objcodigosMainFull.TaxCodes = objcodigosMainCodes;

            log.audit({ title: 'objcodigosMainFull', details: objcodigosMainFull });

            return objcodigosMainFull;
        }
        const getLineDiscountItems=(rcrd_transaccion)=>{
            try{
                var discount_items=[];
                var item_type=rcrd_transacciongetSublistValue({
                    sublistId: 'item',
                    fieldId: 'itemtype',
                    line: index
                });
                if(item_type=='Discount'){
                    discount_items.push({
                        amount
                    })
                }
            
            }catch(err){
            log.error({title:'Error occurred in getLineDiscountItems',details:err});
            }
        }



        return { getTaxConfigurations,obtenObjImpuesto,getLineDiscountItems }

    });
