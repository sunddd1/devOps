/**
 * @description       : 
 * @author            : 
 * @group             : 
 * @last modified on  : 08-27-2025
 * @last modified by  :  
 * Modifications Log
 * Ver   Date         Author   Modification
 * 1.0   08-27-2025      Initial Version
**/
import { api, LightningElement } from 'lwc';
import DessertComparisonModal from 'c/dessertComparisonModal';

export default class DessertCompareButton extends LightningElement {
    @api recordId;

    connectedCallback(){
        console.log('recordId ### ', this.recordId);
    }
    handleOpenModal() {
        DessertComparisonModal.open({
            size: 'medium',
            description: 'Compare bread product prices'
        });
    }
}