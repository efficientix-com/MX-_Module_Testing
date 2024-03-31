/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/runtime', 'N/record','./Lib/_tkio_tax_fields_lib'],
    /**
 * @param{log} log
 */
    (log, runtime, record,taxFieldsLib) => {

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            var record_actual=scriptContext.newRecord;
            var rcrd_type=record_actual.type;
            var has_subsidiaries=runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
            var has_SuiteTax=runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
            var nexo='';
            var subsidiariaTransaccion=''
            // Load transaction record
            var rcrd_transaccion=record.load({
                type: rcrd_type,
                id: record_actual.id,
                isDynamic: false
            });
            // Obten la subsidiaria de la transaccion y el nexo en caso de que existan subsidiarias
            if(has_subsidiaries){
                subsidiariaTransaccion = rcrd_transaccion.getValue({ fieldId: 'subsidiary' });
                nexo = rcrd_transaccion.getValue({ fieldId: 'nexus_country' });
            }else{
                var objImpuestos = taxFieldsLib.obtenObjImpuesto(subsidiariaTransaccion, nexo);
            }
            // Obten las configuraciones de Impuestos
            var desglose_config=taxFieldsLib.getTaxConfigurations();
            if(desglose_config.success==true){
                var config_ieps = desglose_config.config_ieps;
                var config_iva = desglose_config.config_iva;
                var config_exento = desglose_config.config_exento;
                var config_local = desglose_config.config_local;
                var config_retencion = desglose_config.config_retencion;

                // Inicia conteo de lineas de los articulos
                var conteo_lineas=rcrd_transaccion.getLineCount({ sublistId: 'item' });
                
            }else{
                // Create a MX+ Log Audit in MX+ Tab to display the errors that a script creates
            }


        }

        return {afterSubmit }

    });
