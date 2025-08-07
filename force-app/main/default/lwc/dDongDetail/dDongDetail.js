/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 08-07-2025
 * @last modified by  : 
**/
import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPagelayoytInfo from '@salesforce/apex/CustomRelatedDdong.getPagelayoytInfo';
// import { loadStyle } from 'lightning/platformResourceLoader';
// import customCSS from '@salesforce/resourceUrl/toastCSS';

export default class DDongDetail extends LightningElement {
    @api recordId;
    @api objectApiName;

    @track pageInfo;
    @track fieldInfo;
    @track isShowModal = false;

    // @track iconName = 'utility:chevrondown'; //chevronright
    handleToastMsg(){
        var value = 'First Message \n';
        value += 'Second Message';

        const evt = new ShowToastEvent({
            title: 'Toast Success',
            message: value,
            variant: 'success',
            mode: 'sticky'
        });
        this.dispatchEvent(evt);
    }
    
    @track isCSSLoaded = false;
    

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    getLabel({ error, data }){
        if (data) {
            console.log(data);
            this.fieldInfo = data.fields;
            
            // this.getLayoutInfo();
        } else if (error) {
            console.log('[ DDongDetail.js ].getLabel Error ==> ', error);
            // this.showMyToast('warning', this.LABEL.COM_LAB_WARNING, this.LABEL.COM_MSG_CONTACT_ADMIN);
        }
    }

    connectedCallback(){
        console.log('detail @@@@ ', this.objectApiName + ' / ' + this.recordId);
        console.log('test commit');
        console.log('test commit2222');
        this.getPagelayoytInfo();
    }

    renderedCallback(){
        console.log('renderedCallback ### ');

        if (!this.hasRendered){   
            this.hasRendered = true;
        
            const style = document.createElement('style');
            style.innerText = `
            .isOneColumn .slds-form-element__control{
                padding-left: calc((50% - 1rem) * 0.33);
            }
            .toastMessage {
                    white-space: break-spaces !important;
            }
                
            `;
            document.body.appendChild(style);
            console.log('aaa');
        }
    }

    getPagelayoytInfo(){
        this.isShowModal = false;
        getPagelayoytInfo({
            skipSection : ['Custom Links']
        })
        .then(result => {
            console.log('result @@ ', result);
            this.pageInfo = result.pageInfo;
            
            this.isShowModal = true;
        })
        .catch(error => {
            console.log('error @@ ', error);
            this.isShowModal = true;
        })
        .finally(()=>{
            console.log('finish');
        });
    }

    // handleSectionVissble(event){
    //     console.log('handleSectionVissble @@', event);
    //     console.log('handleSectionVissble @@', event.currentTarget.nextSibling);
    //     let nextA = event.currentTarget.nextSibling;
    // }

    handleSectionVissble(event){ // chevronright chevrondown
        try {
            let iconTag = event.currentTarget.childNodes[0].childNodes[0];

            let currentSection = event.currentTarget.parentElement.childNodes[1];

            let nextSection = event.currentTarget.parentElement.nextSibling;
            let HasNextSection = nextSection?.childNodes[0].tagName.toUpperCase() != 'H3';

            if(currentSection?.style.display == ''){
                currentSection.style.display = 'none';
                iconTag.iconName = 'utility:chevronright';
            } else {
                currentSection.style.display= '';
                iconTag.iconName = 'utility:chevrondown';
            }

            while(nextSection != null && HasNextSection){ // 그 다음 section 확인

                if(nextSection?.style.display == ''){
                    nextSection.style.display = 'none';
                } else {
                    nextSection.style.display = '';
                }
                
                nextSection = nextSection.nextSibling;

                if(nextSection != null){
                    HasNextSection = nextSection?.childNodes[0].tagName.toUpperCase() != 'H3';
                } else {
                    HasNextSection = false;
                }
            }

        } catch (error) {
            console.log('[ DDongDetail.js ].handleSectionVissble Error ==> ', error);
            // this.showMyToast('warning', this.LABEL.COM_LAB_WARNING, this.LABEL.COM_MSG_CONTACT_ADMIN);
        }
    }
}