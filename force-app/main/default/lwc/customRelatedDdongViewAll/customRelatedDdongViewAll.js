/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 01-11-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { api, LightningElement, track, wire } from 'lwc';
import { setUrlTypeColumns, setUrlColumns } from 'c/customRelated';
import { CurrentPageReference } from 'lightning/navigation';

// APEX
import getRelatedRecords from "@salesforce/apex/CustomRelatedDdong.getRelatedRecords";

// LABEL DI_LAB_INDEX
import COM_BTN_EDIT from '@salesforce/label/c.COM_BTN_EDIT';

export default class CustomRelatedDdongViewAll extends LightningElement {
    
    @api parentObject;
    @api parentObjectLabel;
    @api parentRecordName;
    @api parentRecordId;
    @api objectLabel;
    @api objectApiName;
    @api columns;

    @track sortDirection = 'desc';
    @track sortBy = 'Id';
    @track isShowEditModal = false;
    @track isBTN = false;

    maxRowCount = 0;
    totalCount = 0; // records 수,
    setLimit = 50; // 로딩 갯수
    isInfiniteLoad = false;
    isUseRefreshAction = true;

    records = [];
    urlSet = new Set(); // type이 url인 columns set

    refreshEventName = 'refreshRelatedData';  // refresh Event name 
    customActions = {};
    
    LABEL ={
        COM_BTN_EDIT
    };

    // @wire(CurrentPageReference)
	// getStateParameters(currentPageReference) {
	// 	if (currentPageReference) {
    //         console.log(currentPageReference.state);
	// 		// this.recordId = currentPageReference.state.recordId;
    //         this.parentObject= currentPageReference.state.c__parentObject;
    //         this.parentObjectLabel= currentPageReference.state.c__parentObjectLabel;
    //         this.parentRecordName= currentPageReference.state.c__parentRecordName;
    //         this.parentRecordId= currentPageReference.state.c__parentRecordId;
    //         this.objectLabel= currentPageReference.state.c__objectLabel;
    //         this.objectApiName= currentPageReference.state.c__objectApiName;
    //         this.columns = JSON.parse(currentPageReference.state.c__columns);
	// 	}
	// }

    connectedCallback(){
        console.log('TEST VIEW ALL COMP');
        // console.log('parentObject @@ ', this.parentObject);
        // console.log('parentObjectLabel @@ ', this.parentObjectLabel);
        // console.log('parentRecordName @@ ', this.parentRecordName);
        // console.log('parentRecordId @@ ', this.parentRecordId);
        // console.log('objectLabel @@ ', this.objectLabel);
        // console.log('objectApiName @@ ', this.objectApiName);
        // console.log('columns @@ ', this.columns);

        this.urlSet = setUrlTypeColumns(this.columns);
        this.getRelatedRecords();

        this.template.addEventListener(this.refreshEventName, event=>{
            this.getRelatedRecords();
        });
            
        this.template.addEventListener('closeModal', event=>{
            this.isShowEditModal = false;
            this.template.querySelector('c-custom-related-view-all').refreshData();
        });
    }

    getRelatedRecords(){
        this.toggleSpinner(true);
        if(this.sortBy == 'Name'){
            this.sortBy = 'Id';
        } 
        this.records?.length >= this.maxRowCount ? this.maxRowCount += this.setLimit : '';
        getRelatedRecords({ 
                'recordId' : this.parentRecordId 
                , 'recordLimit' : this.maxRowCount
                , 'sortBy' : this.sortBy
                , 'sortDirection' : this.sortDirection
        })
        .then(result => {
            this.records = result.recordList;
            this.setHeaderAction();
            setUrlColumns(this.records, this.urlSet);
            this.totalCount = result.total;
            this.records.length >= this.totalCount ? this.isInfiniteLoad = false : this.isInfiniteLoad = true;
            
            console.log('records @@ ', JSON.parse(JSON.stringify(this.records)));
            this.toggleSpinner(false);
        })
        .catch(errors => {
            console.log('[CustomRelatedDdongViewAll.js > getRelatedRecords] Error ::', errors);
            this.errorHandler(errors);
        }).finally(() => {
            if(this.sortBy == 'Name'){
                this.sortBy = 'Id';
            }

            this.isBTN = true;
        });
    }

    sortdata(event){
        this.sortBy = event.detail.sortBy;
        this.sortDirection = event.detail.sortDirection;
        this.getRelatedRecords();
    }

    loadmore(){
        if(this.isInfiniteLoad){
            this.isInfiniteLoad = false;
            this.getRelatedRecords();
        }
    }

    toggleSpinner(toggle){
        this.template.querySelector('c-custom-related-view-all')?.toggleSpinner(toggle);
    }

    
    errorHandler(errors){
        this.template.querySelector('c-custom-related-view-all')?.errorHandler(errors);
    }

    setHeaderAction(){
        const testAction = ()=>{
            console.log('또로로로롱똥똥');
        }

        this.customActions = {
            'headerActions' : [{ 'testAction' : {'fire' : testAction, 'label' : 'Test DDONG'}}]
        };
    }
}