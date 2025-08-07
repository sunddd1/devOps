/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 01-11-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import LightningDatatable from "lightning/datatable";
import richTextColumnType from "./richTextColumnType.html";

/**
 * Custom component that extends LightningDatatable
 * and adds a new column type
 */
export default class CustomDatatable extends LightningDatatable {
    static customTypes={
        // custom type definition
        richText: {
            template: richTextColumnType,
            standardCellLayout: true
        }
    }
}