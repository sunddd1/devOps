/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 01-11-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class Utils {
    public static List<Schema.SObjectField> getFieldList(String sObjectName){
        List<Schema.SObjectField> listField = schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap().values();
        List<Schema.SObjectField> listResult = new List<Schema.SObjectField>();
        
        for(Schema.SObjectField f : listField){
            try{
                DescribeFieldResult dfr = f.getDescribe();
                if(dfr.isAccessible()) listResult.add(f);
            }
            catch(Exception e){
                System.debug('e.getMessage() : ' + e.getMessage());
            }
        }
        
        return listResult;
    }

    public static String getAllFieldString(String sObjectName, Set<String> addFieldStringSet, Boolean isAddedRichTextField){
        List<Schema.SObjectField> listField = getFieldList(sObjectName);
        Boolean isFirst = true;
        Set<String> fieldStringSet = new Set<String>();
        String fieldString = '';

        try {
            for(Schema.SObjectField f : listField){
                DescribeFieldResult dfr = f.getDescribe();
                
                // Check RichText Type
                if((dfr.getType() == Schema.DisplayType.TEXTAREA) && dfr.isHtmlFormatted() ) {
                    if(!isAddedRichTextField) {
                        continue;
                    }
                }

                fieldStringSet.add(f.getDescribe().getName());
                
                // Picklist Type toLabel() query
                if(dfr.getType() == Schema.DisplayType.PICKLIST || dfr.getType() == Schema.DisplayType.MultiPicklist) {
                    fieldStringSet.add('toLabel(' + f.getDescribe().getName() + ') toLabel_'+f.getDescribe().getName());
                    
                }
                // Date, DateTime Type format() query
                if(dfr.getType() == Schema.DisplayType.DATE || dfr.getType() == Schema.DisplayType.DATETIME) {
                    fieldStringSet.add('format(' + f.getDescribe().getName() + ') format_'+f.getDescribe().getName());
                }
            }

            if(addfieldStringSet != null && addfieldStringSet.size() > 0) {
                fieldStringSet.addAll(addFieldStringSet);
            }

            fieldString = String.join(new List<String>(fieldStringSet), ', ');

        } catch(Exception e) {
            System.debug(LoggingLevel.ERROR, 'ERROR:' + e);
        }

        system.debug('==== getAllFieldString : ' + fieldString);

        return fieldString;
    }
}
/*
 import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FORM_FACTOR from '@salesforce/client/formFactor';

//APEX
import callDetail from '@salesforce/apex/KnowledgeController.callDetail';
import getLayoutInfo from '@salesforce/apex/KnowledgeController.getLayoutInfo';

//LABEL
import COM_LAB_WARNING from '@salesforce/label/c.COM_LAB_WARNING';
import COM_MSG_SAVED_SUCCESS from '@salesforce/label/c.COM_MSG_SAVED_SUCCESS';
import COM_MSG_CONTACT_ADMIN from '@salesforce/label/c.COM_MSG_CONTACT_ADMIN';

export default class KnowledgeDetail extends LightningElement {
    @api recordId;
    @api objectApiName;

    @track fieldInfo;
    @track isMobile = false;
    @track isShowModal = false;
    @track records = [];

    iconName = 'utility:chevrondown';
    richTextFields = ['Answer__c', 'Question__c']; 

    LABEL = {
        COM_LAB_WARNING
        , COM_MSG_SAVED_SUCCESS
        , COM_MSG_CONTACT_ADMIN
    };

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    getLabel({ error, data }){
        if (data) {
            console.log(data);
            this.fieldInfo = data.fields;
            
            this.getLayoutInfo();
        } else if (error) {
            console.log('[ KnowledgeDetail.js ].getLabel Error ==> ', error);
            this.showMyToast('warning', this.LABEL.COM_LAB_WARNING, this.LABEL.COM_MSG_CONTACT_ADMIN);
        }
    }
    
    connectedCallback(){

        if(FORM_FACTOR == 'Small') {
            this.isMobile = true;
        }
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
    
    async innerText(){
        let wait = await this.callDetail(this.recordId);
        const emptyValue = `<div id="cafe-note-contents" style="font-family:'굴림',Gulim,Arial;font-size:10pt;line-height:1.2;"><p>&nbsp;</p></div>`;
        if(wait){
            this.records.forEach( item => {
                if(item.value != emptyValue){
                    let innerTarget = this.template.querySelector('[data-field=' + item.Name.replace('Long__c', '__c') + ']');
                    if(innerTarget != undefined) innerTarget.innerHTML = item.value;

                    let cafenoteTarget = this.template.querySelector('[data-trans=' + item.Name.replace('Long__c', '__c') + ']');
                    if(cafenoteTarget != undefined) cafenoteTarget.sourceTxt = item.value;
                }
            });
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
            console.log('[ KnowledgeDetail.js ].sectionView Error ==> ', error);
            this.showMyToast('warning', this.LABEL.COM_LAB_WARNING, this.LABEL.COM_MSG_CONTACT_ADMIN);
        }
    }
    

    async callDetail(){
        let wait = await callDetail({
            recordId : this.recordId
        })
        .then(result => {
            // console.log('result ==> ', result);
            let fieldNames = Object.keys(result.longText).filter(item => item != 'Id');

            this.records = fieldNames.map( (item, idx) => {
                // console.log('item ==> ', item);
                return {value : result.longText[item], Name : item , Label : this.fieldInfo[item]?.label};
            }).filter( item => item != undefined);
            // console.log('records ==> ', this.records);
            return true;
        })
        .catch(error => {
            console.log('[ KnowledgeDetail.js ].callDetail Error ==> ', error);
            this.showMyToast('warning', this.LABEL.COM_LAB_WARNING, this.LABEL.COM_MSG_CONTACT_ADMIN);
        })
        .finally(() => {
            // console.log('fin');
            this.isShowModal = true;
        });
        return wait;
    }

    @track pageInfo;
    getLayoutInfo(){
        getLayoutInfo({
            recordId : this.recordId
        })
        .then(result => {
            this.pageInfo = result.map( section => {
                return {...JSON.parse(JSON.stringify(section))};
            });
            // console.log('pageInfo == ', this.pageInfo);
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
            return this.innerText();
        })
        .catch(error => {
            console.log('[ KnowledgeDetail.js ].getLayoutInfo Error ==> ', error);
            // window.location.reload();
            this.showMyToast('warning', this.LABEL.COM_LAB_WARNING, this.LABEL.COM_MSG_CONTACT_ADMIN);
        })
        .finally(() => {
            // console.log('CaseNewModal getLayoutInfo');
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

---------------------------------------------------------------------------------------
<template>
    
    <div class="slds-is-relative detailContent" style="font-size: var(--lwc-inputStaticFontSize,0.875rem); background-color: white;">
        <!-- spinner  -->
        <template if:false={isShowModal}>
            <lightning-spinner size="medium" alternative-text="Loading..."></lightning-spinner>
            <div style="height: 20vh;"></div>
        </template>
        <div class="KLGRendStyle">
            <lightning-record-view-form
            object-api-name={objectApiName}
            record-id={recordId}>
                <template for:each={pageInfo} for:item="section">
                    <div key={section}>
                        <template if:true={section.labelView}>
                            <h3 class="slds-theme--shade slds-section__title section-label" onclick={sectionView}>
                                <lightning-icon icon-name={iconName} alternative-text={iconName} title={iconName} size="x-small"></lightning-icon>
                                <span class="slds-p-left_xx-small">
                                    {section.sectionLabel}
                                </span>
                            </h3>
                        </template>
                        
                        <template if:false={section.IsOneColumn}>
                            <div class="section-div">
                                <template for:each={section.fieldInfos} for:item="row">
                                    <table key={row} style="height: fit-content;">
                                        <template for:each={row.fieldInfo} for:item="field">
                                            <tr key={field}>
                                                <td class="field-td">
                                                    <template if:true={field.Name}>
                                                        <div class="slds-border_bottom" style="display: flex; margin-bottom: 0.25rem;" >
                                                            <lightning-output-field field-name={field.Name} style="margin-bottom: 0.25rem;"></lightning-output-field>
                                                        </div>
                                                    </template>
                                                    <template if:false={field.Name}>
                                                        <!-- <div style="height: 32px !important;"></div> -->
                                                    </template>
                                                </td>
                                            </tr>
                                        </template>
                                    </table>
                                </template>
                            </div>
                        </template>

                        <template if:true={section.IsOneColumn}>
                            <div class="onerich">
                                <template for:each={section.fieldInfos} for:item="row">
                                    <div key={row} style="height: fit-content;">
                                        <template for:each={row.fieldInfo} for:item="field">
                                            <div key={field}>
                                                <div class="field-td" style="height: fit-content !important;">
                                                    <template if:false={field.IsRich}>
                                                        <template if:true={field.Name}>
                                                            <div class="slds-border_bottom isOneColumn">
                                                                <!-- <div class="slds-border_bottom" style="margin-bottom: var(-lwc-spacingXSmall,0.5rem);"> -->
                                                                <!-- <template if:true={field.isSummary}>
                                                                    <span style="float: left; padding-left: 4px;">
                                                                        <label class="slds-form-element__label slds-no-flex" style="margin-bottom: 0px; margin-top: 2px;">Answer Summary</label>
                                                                    </span>
                                                                </template> -->
                                                                <lightning-output-field field-name={field.Name}></lightning-output-field>
                                                            </div>
                                                        </template>
                                                    </template>
    
                                                    <template if:true={field.IsRich}>
                                                        <div class="slds-form-element_1-col slds-form-element_horizontal slds-border_bottom" style="margin-bottom: 0.75rem !important;">
                                                            <template if:false={isMobile}>
                                                                <c-u-trans-modal source-txt='' data-trans={field.Name} class="ds_uTrans_button"></c-u-trans-modal>
                                                            </template>
                                                            <span class="field-label">{field.Label}</span>
                                                            <div class="contentArea slds-scrollable" style="width: inherit;">
                                                                <span class="contentT" data-field={field.Name} lwc:dom="manual"></span>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </template>
                            </div>
                        </template>
                    </div>
                </template>
            </lightning-record-view-form>
        </div>
    </div>
</template>
-----------------------------------------------------------------------------
.contentArea{
    margin-top: 2px;
}


.contentT{
    overflow: auto;
}

.ds_uTrans_button{
    float: right;
    margin-bottom: 8px;
}

.field-label {
    overflow-wrap: break-word;
    word-wrap: break-word;
    -webkit-hyphens: auto;
    -ms-hyphens: auto;
    hyphens: auto;
    display: inline-block;
    color: var(--slds-g-color-neutral-base-30, var(--lwc-colorTextLabel,rgb(68, 68, 68)));
    font-size: 0.75rem;
    padding-right: var(--lwc-spacingXSmall,0.5rem);
    padding-top: var(--lwc-spacingXxSmall,0.25rem);
}

.field-td {
    padding-left: var(--lwc-spacingSmall,0.75rem);
    padding-right: var(--lwc-spacingSmall,0.75rem);

}

.section-div {
    padding-top: var(--lwc-spacingXSmall,0.5rem);
    visibility: visible;
    opacity: 1;
    height: auto;
    display: flex;
}

.section-label{
    margin-top: var(--lwc-spacingMedium,1rem);
    cursor: pointer;
    padding-left: 14px;
    font-size: 16px;
}
.section-label:hover{
}

.contentT img {
    max-width: fit-content;
}

.onerich{
    padding-top: var(--lwc-spacingXSmall,0.5rem);
}
*/

/*
@AuraEnabled
    public static Map<String, Object> getDetails(String recordId) {
        Map<String, Object> result = new Map<String, Object>();
        List<Knowledge__kav> klgList = [SELECT Id, Title, Summary, AnswerLong__c, QuestionLong__c, ApprovalStatus__c FROM Knowledge__kav WHERE Id = :recordId];

        String subject = '';
        String contents = '';
        List<String> formatList = new List<String>();

        if(klgList.size() > 0){
            EmailTemplate et = [SELECT Id, Name, DeveloperName, HtmlValue, Subject FROM EmailTemplate WHERE DeveloperName = 'knowledgeAPPROVAL'];
            Knowledge__kav klh = klgList[0];

            subject = String.valueOf(klh.get('Title'));
            contents = et.HtmlValue;
            // contents += '<div>하기 Knowledge Article에 대한 배포 승인 요청 드립니다.</div>';
            // contents += '</br></br>';
            // contents += '<div>';
            // contents += '<div><b>◎ Knowledge Information</b></div>';
            // contents += '<div style="padding-left: 24px;"> <b>Title :</b> {1}</div>';
            // contents += '<div style="padding-left: 24px;"> <b>Answer Summary :</b> {2}</div>';
            // contents += '<div> <b>Question :</b> {3}  </div>';
            // contents += '<div> <b>Answer :</b> {4}</div>';
            // contents += '<div style="padding-left: 24px;"> <b>URL : </b> <a href="{0}">{0}</a></div>';
            // contents += '</div>';
            
            formatList.add(System.URL.getOrgDomainUrl().toExternalForm() + '/' + String.valueOf(klh.get('Id')));
            formatList.add(String.valueOf(klh.get('Title')));
            if(klh.get('Summary') == null){
                formatList.add('');
            } else {
                formatList.add(String.valueOf(klh.get('Summary')));
            }
            if(klh.get('QuestionLong__c') == null){
                formatList.add('');
            } else {
                formatList.add(String.valueOf(klh.get('QuestionLong__c')));
            }
            if(klh.get('AnswerLong__c') == null){
                formatList.add('');
            } else {
                formatList.add(String.valueOf(klh.get('AnswerLong__c')));
            }
            contents = String.format(contents, formatList);
            result.put('STATUS', klh.ApprovalStatus__c);
        }
        result.put('subject', subject);
        result.put('contents', contents);
        return result;
    }

    @AuraEnabled
    public static List<Object> getLayoutInfo(List<String> skipSections) {
        
        List<Object> result = new List<Object>();

        List<String> layoutName = new List<String>{'Knowledge__kav-Knowledge Layout'};

        List<Metadata.Metadata> layouts = Metadata.Operations.retrieve(Metadata.MetadataType.Layout, layoutName);

        // system.debug('layouts  ' + layouts);
        Metadata.Layout layoutMd = (Metadata.Layout) layouts.get(0);

        // system.debug('layoutMd  ' + layoutMd);

        for (Metadata.LayoutSection section : layoutMd.layoutSections) {
            Map<String, Object> secitonObj = new Map<String, Object>();
            List<List<String>> fieldInfos = new List<List<String>>(); // List<map> 으로 수정하기. 
            String sectionLabel = String.valueOf(section.label);  

            if(skipSections.contains(sectionLabel)){
                continue;
            }

            // section.detailHeading, section.editHeading 라벨 비지블
            if(section.detailHeading && section.editHeading ){
                secitonObj.put('labelView', true);
            }
            secitonObj.put('sectionLabel', sectionLabel);

            secitonObj.put('sectionStyle', String.valueOf(section.style));
            system.debug('section  ' + section);

            // for (Metadata.LayoutColumn column : section.layoutColumns) {
            for (Integer i=0;i<section.layoutColumns.size();i++) {
                Metadata.LayoutColumn column = section.layoutColumns[i];
                system.debug('column  ' + column);
                List<String> fields = new List<String>(); // List<map> 으로 수정하기. 
                if (column.layoutItems != null) {
                    for (Metadata.LayoutItem item : column.layoutItems) {
                    // for (Integer j=0;j<column.layoutItems.size();j++) {
                        // Metadata.LayoutItem item = column.layoutItems[j];
                        system.debug('item  ' + item);
                        if(item.field == null){
                            fields.add('BlankSpace');
                        } else {
                            fields.add(item.field + '//' + item.behavior);
                        }
                        // item.behavior; // 마킹.
                    }
                    fieldInfos.add(fields);
                }
            }
            secitonObj.put('fieldInfos', fieldInfos);
            system.debug('fieldInfos  ' + fieldInfos);

            if(fieldInfos.size() > 0){
                result.add(secitonObj);
            }

        }

        return result;
    } 
*/