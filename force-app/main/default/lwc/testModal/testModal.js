/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 01-29-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement, api } from 'lwc';
import LightningModal from 'lightning/modal';


export default class TestModal extends LightningModal {
    connectedCallback(){
        console.log('title Modal ;;; ', this.title);
        console.log('description Modal ;;; ', this.description);
    }

    @api content;
    @api title;
    @api description;

    handleOkay() {
        const test = {
            content : this.title + '123'
            , result : this.content + '444'
        };
        this.close(test);
    }
}