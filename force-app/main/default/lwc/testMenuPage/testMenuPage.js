/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 03-07-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement, track } from 'lwc';

export default class TestMenuPage extends LightningElement {
    
    @track objectName;

    @track flag = false;
    /// tab 프로퍼티 받는거 작업해야함...
    connectedCallback(){
        console.log('LWC1 connected@@@');
    }

    getData(event){
        try {
            this.flag = false;
            this.objectName = event.detail;
            console.log('TestMenuPage @@@ objectName ### ', this.objectName);
            this.template.querySelector('c-your-component').resetData(this.objectName);
            this.flag = true;
            
        } catch (error) {
            console.log('error #### ', error);
        }
    }
}