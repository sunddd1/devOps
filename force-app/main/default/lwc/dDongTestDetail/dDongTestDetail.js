/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 01-16-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

//APEX
import getLayoutInfo from '@salesforce/apex/CustomRelatedDdong.getLayoutInfo';


export default class DDongTestDetail extends LightningElement {
    @api recordId;
    @api objectApiName;

    @track fieldInfo;
    @track isMobile = false;
    @track isShowModal = false;
    @track records = [];

    iconName = 'utility:chevrondown';
    richTextFields = ['Answer__c', 'Question__c']; 

    LABEL = {
        // COM_LAB_WARNING
        // , COM_MSG_SAVED_SUCCESS
        // , COM_MSG_CONTACT_ADMIN
    };

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    getLabel({ error, data }){
        if (data) {
            console.log(data);
            this.fieldInfo = data.fields;
            
            this.getLayoutInfo();
        } else if (error) {
            console.log('[ DDongTestDetail.js ].getLabel Error ==> ', error);
        }
    }
    
    connectedCallback(){
        console.log('recordId @@' , this.recordId);
    }

    renderedCallback() {
        if (!this.hasRendered){   
            this.hasRendered = true;
        
            const style = document.createElement('style');
            style.innerText = `
            lightning-output-field .slds-form-element__control{
                padding-top: 0.25rem !important;
            }
            .isOneColumn .slds-form-element__control{
                padding-left: calc((50% - 1rem) * 0.33);
            }
            `;
            this.template.querySelector('.KLGRendStyle').appendChild(style);
        }
    }
    
    sectionView(event){ // chevronright chevrondown
        try {
            let iconTag = event.currentTarget.childNodes[0];

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
            console.log('[ DDongTestDetail.js ].sectionView Error ==> ', error);
        }
    }

    @track pageInfo;
    getLayoutInfo(){
        getLayoutInfo({
            skipSection : ['Custom Links']
        })
        .then(result => {
            this.pageInfo = result.map( section => {
                return {...JSON.parse(JSON.stringify(section))};
            });
            console.log('pageInfo == ', this.pageInfo);
            // console.log('Status__c == ', this.Status__c);
            this.pageInfo.forEach( sectionInfo => {
                sectionInfo.IsOneColumn = sectionInfo.sectionStyle.includes('OneColumn');
                // console.log(sectionInfo.sectionStyle.includes('TwoColumn') + ' / ' + sectionInfo.sectionStyle);
                sectionInfo.fieldInfos = sectionInfo.fieldInfos.map( (fieldInfo1, idx) => {
                    // console.log(fieldInfo);
                    let fieldInfo = [];
                    fieldInfo1.forEach( info => {

                        if(info.lastIndexOf('//') == -1){ //  Blank
                            return {Name : '', Required : ''};
                        }
                        
                        let field = info.substring(0, info.lastIndexOf('//'));

                        // let variant = '';
                        // let isSummary = false;
                        
                        // if(field == 'Summary'){
                        //     variant = 'label-hidden';
                        //     isSummary = true;
                        // }
                        
                        let isRich = this.richTextFields.includes(field);

                        fieldInfo.push({
                            Name : field
                            , IsRich : isRich
                            , Label : this.fieldInfo[field].label
                            // , variant : variant
                            // , isSummary : isSummary
                        });
                    });
                    return {fieldInfo};
                });
            });

            // console.log('pageInfo == ', JSON.parse(JSON.stringify(this.pageInfo)));
            // return this.innerText();
        })
        .catch(error => {
            console.log('[ DDongTestDetail.js ].getLayoutInfo Error ==> ', JSON.stringify(error));
            // window.location.reload();
        })
        .finally(() => {
            // console.log('CaseNewModal getLayoutInfo');
            this.isShowModal = true;
        });

    }

    showMyToast(variant, title, msg, mode){
        let dismissible = mode != undefined ? mode : 'dismissible';
        const event = new ShowToastEvent({
            'variant' : variant,
            'title' : title,
            'message' : msg,
            'mode' : dismissible
        });
        this.dispatchEvent(event);
    }
}