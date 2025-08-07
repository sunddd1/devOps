/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 01-29-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement, api, track, wire } from 'lwc';

import getRelatedRecords from '@salesforce/apex/CustomRelatedDdong.getRelatedRecords';

import { setUrlTypeColumns, setUrlColumns } from 'c/customRelated';


import testModal from "c/testModal";

const DEFAULT_COLUMNS = [
    { label: 'Name',                        fieldName: 'Id',                                type : 'url',   
    typeAttributes: {label: { fieldName: 'Name' },value:{fieldName: 'Name'}, target: '_blank'}, sortable : true }
    , { label: 'Account__c',                fieldName: 'Account__r.Id',                     type : 'url',   
    typeAttributes: {label: { fieldName: 'Account__r.Name' },value:{fieldName: 'Account__r.Name'}, target: '_blank'}, sortable : true }
];

export default class CustomRelatedDdong extends LightningElement {

    @api     recordId;
    @api     maxRowCount; // related List에서 보여질 최대 Record Count 수
    @api     title; // related List 헤더에 보여질 Title
    @api     relatedObjectApiName; // object API Name
    
    @track sortDirection = 'desc';
    @track sortBy = 'Id';
    @track isShowEditModal = false;
    
    isUseEditAction = true; // Edit Row Action 사용 유무
    isUseDeleteAction = true; // Delete Row Action 사용 유무
    isUseRefreshAction = true;
    viewAllLwcComponentName = 'customRelatedDdongViewAll';
    records = []; // related List에 보여질 데이터
    columnsInfo = DEFAULT_COLUMNS; // 보여질 columns 정보
    urlSet = new Set(); // type이 url인 columns set
    totalCount = 0; // records 수,

    refreshEventName = 'refreshRelatedData';
    customActions = {};

    connectedCallback(){
        this.urlSet = setUrlTypeColumns(this.columnsInfo);
        this.getRelatedRecords();

        this.template.addEventListener(this.refreshEventName, event=>{
            this.getRelatedRecords();
        });
    }

    getRelatedRecords(){
        this.toggleSpinner(true);

        // if(this.sortBy == 'Id'){
        //     this.sortBy == 'Name';
        // }
        // console.log('sortBy @@@ ', this.sortBy);

        getRelatedRecords({
            'recordId' : this.recordId 
            , 'recordLimit' : this.maxRowCount
            , 'sortBy' : this.sortBy
            , 'sortDirection' : this.sortDirection
        })
        .then(result => {
            console.log(result);
            this.records = result.recordList;
            setUrlColumns(this.records, this.urlSet);
            this.totalCount = result.total;
            
            this.setHeaderAction();
            // this.toggleSpinner(false);

            this.toggleSpinner(false);
        })
        .catch(error => {
            console.log('[CustomRelatedDdong.js > getRelatedRecords] Error ::', error);
            this.errorHandler(error);
            // this.toggleSpinner(false);
        })
        .finally(()=>{
            if(this.sortBy == 'Name'){
                this.sortBy = 'Id';
            }
        
        });
    }

    sortdata(event){
        this.sortBy = event.detail.sortBy;
        this.sortDirection = event.detail.sortDirection;
        this.getRelatedRecords();
    }

    toggleSpinner(toggle){
        this.template.querySelector('c-custom-related')?.toggleSpinner(toggle);
    }
    
    errorHandler(errors){
        this.template.querySelector('c-custom-related')?.errorHandler(errors);
    }

    setHeaderAction(){
        const testAction = async ()=>{
            console.log('또로로로롱똥똥');
            const result = await testModal.open({
                // `label` is not included here in this example.
                // it is set on lightning-modal-header instead
                size: 'large',
                description: 'Accessible description of modal\'s purpose',
                content: 'Passed into content api',
                title: 'TEST MODAL',
            });
            // if modal closed with X button, promise returns result = 'undefined'
            // if modal closed with OK button, promise returns result = 'okay'
            console.log(result);
            console.log(JSON.stringify(result));
            console.log(result.result);
            console.log(result.content);
        }
        const testAction2 = async ()=>{
            console.log('또로로로롱똥똥22');
            const result = await testModal.open({
                // `label` is not included here in this example.
                // it is set on lightning-modal-header instead
                size: 'large',
                description: 'Accessible description of modal\'s purpose',
                content: 'Passed into content api',
                title: 'TEST MODAL',
            });
            // if modal closed with X button, promise returns result = 'undefined'
            // if modal closed with OK button, promise returns result = 'okay'
            console.log(result);
            console.log(JSON.stringify(result));
            console.log(result.result);
            console.log(result.content);
        }

        this.customActions = {
            'headerActions' : [
                { 'testAction' : {'fire' : testAction, 'label' : 'Test DDONG'}}
                , { 'testAction2' : {'fire' : testAction2, 'label' : 'Test DDONG2'}}
            ]
        };
    }
}