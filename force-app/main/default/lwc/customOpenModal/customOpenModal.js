/**
 * @description       : 
 * @author            : 
 * @group             : 
 * @last modified on  : 08-06-2025
 * @last modified by  : 
 * Modifications Log
 * Ver   Date         Author   Modification
 * 1.0   08-04-2025      Initial Version
**/
import { LightningElement, track } from 'lwc';
import customModal from 'c/customModal';

export default class CustomOpenModal extends LightningElement {
    
    async handleClick(){
        try {
            const result = await customModal.open({
                size: 'medium',
                label: 'Modal Heading',
            });
            console.log('result ==> ', result);
        } catch (error) {
            console.log('error ==> ', error);
        }
    }
}