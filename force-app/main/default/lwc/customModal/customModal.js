/**
 * @description       : 
 * @author            : 
 * @group             : 
 * @last modified on  : 08-04-2025
 * @last modified by  : 
 * Modifications Log
 * Ver   Date         Author   Modification
 * 1.0   08-04-2025      Initial Version
**/
import { LightningElement, track } from 'lwc';
import LightningModal from 'lightning/modal';

export default class CustomModal extends LightningModal {

    @track text;

    connectedCallback(){
        console.log('label ==> ', this.label);
    }

    handleChange(event){
        const value = event.target.value;
        this.text = value;
    }

    handleOkay(){
        this.close(this.text);
    }
}