/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 01-11-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { api, LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { lightningConfirm } from 'c/ldsUtils';

// Current Login User's Language Setting
import LANG from '@salesforce/i18n/lang';

//APEX
import hasObejctAccess from '@salesforce/apex/CustomRelatedController.hasObejctAccess';

// custom label 
import COM_BTN_NEW from '@salesforce/label/c.COM_BTN_NEW';
import COM_LAB_SORTED_BY from '@salesforce/label/c.COM_LAB_SORTED_BY'; 
import COM_LAB_WARNING from '@salesforce/label/c.COM_LAB_WARNING'; 
import COM_MSG_CONFIRM_DELETE_RECORD from '@salesforce/label/c.COM_MSG_CONFIRM_DELETE_RECORD';
import COM_MSG_NO_PERMISSION from '@salesforce/label/c.COM_MSG_NO_PERMISSION';
import COM_LAB_UPDATED from '@salesforce/label/c.COM_LAB_UPDATED';
import COM_MSG_REFRESH_LIST from '@salesforce/label/c.COM_MSG_REFRESH_LIST';
import COM_LAB_ITEM from '@salesforce/label/c.COM_LAB_ITEM';


export default class CustomRelatedViewAll extends NavigationMixin(LightningElement) {
    
    /** require **/
    @api parentObject;
    @api parentObjectLabel;
    @api parentRecordName;
    @api parentRecordId;
    @api objectLabel;
    @api objectApiName;
    @api columns;

    @api records = [];
    /** ------- **/

    @api maxRowCount; // related List에서 보여질 최대 Record Count 수
    @api totalCount; //  related Object 전체 records 수

    // data table
    @api sortBy = 'Id';
    @api sortDirection = 'asc';

    // data table
    @api refreshEventName = 'refreshRelatedData'; // customEvent Name
    @api isUseRefreshAction = false; // Refresh 사용 유무
    @api isUseCreateAction = false;
    @api isInfiniteLoad = false; // data table infinite-loading
    @api customActions = {};
    /* customActions example
    customActions = {
                    'headerActions' : [{ 'actionName' : {'fire' : examfunction, 'label' : 'examLabel'}}]
                    , 'rowActions' :  [
                        { 'actionName' : {'fire' : examfunction, 'label' : 'examLabel'}} 
                    ,   { 'testAction' : {'fire' : this.testAction, 'label' : 'testLabel'}}
    ]};
    */

    // New, Edit, Delete 권한
    @track hasCreateAccess;
    @track hasEditAccess;
    @track hasDeleteAccess;

    @track getSummary;
    @track updatedDate;
    @track headerActions = [];
    @track showSpinner = false;

    draftRecords = [];
    hasRendered = false;
    LABEL = {
        COM_BTN_NEW
        , COM_LAB_SORTED_BY
        , COM_LAB_WARNING
        , COM_MSG_CONFIRM_DELETE_RECORD
        , COM_MSG_NO_PERMISSION
        , COM_LAB_UPDATED
        , COM_MSG_REFRESH_LIST
        , COM_LAB_ITEM
    };

    // record 존재 유무 체크
    get hasRecords(){
        return this.records?.length > 0 ? true : false;
    }

    get getSortedName(){
        return this.columns.filter(item => item.fieldName == this.sortBy.split('.')[0])[0]?.label;
    }

    get currentUserLanguage() {
        return LANG === 'ko' ? true : false;
    }

    get setHeaderBTN(){
        return this.customActions?.headerActions?.length > 0 ? true : false;
    }

    connectedCallback() {
        this.hasObejctAccess();
    }
    
    // lwc component 외부의 slds-card style 변경
    renderedCallback() {
        if(this.isUseRefreshAction && this.hasUpdatedRecords()) {
            this.updatedDate = Date.now();
            this.draftRecords = this.records;
        }

        // this.getSummary = this.records?.length < this.totalCount ? this.maxRowCount + '+ items' : this.records?.length + ' item' + (this.records?.length > 1 ? 's' : '') ;
        this.getSummary = this.translateSummary();
        if (this.hasRendered) return;
        this.hasRendered = true;

        
        const style = document.createElement('style');
        style.innerText = `
        .windowViewMode-normal > .slds-card {
            height: calc(100vh - 117px);
            max-height: calc(100vh - 117px);
            background: #f3f3f3;
        }
        `;
        window.document.body?.appendChild(style);        
    }
    
    hasObejctAccess(){
        this.showSpinner = true;
        hasObejctAccess({
            'ObjectApiName' : this.objectApiName
        })
        .then(result=>{
            console.log(this.objectApiName, ' hasAccess ==> ', result);
            this.hasCreateAccess = result.isCreateable;
            this.hasEditAccess = result.isUpdateable;
            this.hasDeleteAccess = result.isDeletable;
            this.setHeaderAction();
        })
        .catch(errors=>{
            console.log('[customRelatedViewAll.js > hasObejctAccess] Error ::', errors);
        })
        .finally(() => {
            this.showSpinner = false;
        });
    }

    // Custom Event 호출
    eventFire(eventName, params){
        const customEvent = new CustomEvent(
                eventName
                , { bubbles: true 
                    , composed : true 
                    , detail : params
                }
        );
        this.dispatchEvent(customEvent);
    }

    // 상위 Component로 부터 데이터를 다시 받아오기 위한 Refresh Event
    @api
    refreshData() {
        this.eventFire(this.refreshEventName);
    }

    // data table sort
    handleSort(event) {
        console.log(JSON.parse(JSON.stringify(event.detail)));
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;

        let sortBy = this.sortBy;
        
        if(sortBy.toLowerCase() == 'id'){
            sortBy = 'Name';
        } else if(sortBy.includes('__r', sortBy.length-3)){
            sortBy += '.Name';
        } else if(sortBy.includes('format_')){
            sortBy = sortBy.substring(7);
        }

        sortBy.includes('__r', sortBy.length-3) ? sortBy += '.Name' : '';
        this.records?.length > 1 ? this.eventFire('sortdata', {'sortBy' :sortBy, 'sortDirection' : this.sortDirection}) : '';

        if(this.isUseRefreshAction === true) {
            this.updatedDate = Date.now();
        }
    }

    // data table infinite
    loadmore(){
        try {
            if(this.isInfiniteLoad){
                this.eventFire('loadmore', this.isInfiniteLoad); 
                this.records.length < this.totalCount ? this.isInfiniteLoad = true : this.isInfiniteLoad = false;
            }
            
        } catch (errors) {
            console.log('[customRelatedViewAll.js > loadmore] Error ::', errors);
        }
    }

    setHeaderAction(){
        if(this.customActions?.headerActions?.length > 0){
            this.customActions.headerActions.forEach(item =>{
                let actionName = Object.keys(item)[0];
                this.headerActions.push({ title : actionName , label : item[actionName].label});
            });
        }
    }

    handleRowAction(event) {
        try {
            const actionName = event.detail.action.name;
            const row = event.detail.row;
            const rowId = row?.Id.substring(row?.Id.lastIndexOf('/')+1);
            switch (actionName) {
                case 'edit': 
                    this.hasEditAccess ? this.editAction(rowId) : this.showMyToast('warning', this.LABEL.COM_LAB_WARNING, this.LABEL.COM_MSG_NO_PERMISSION);
                    break;
                case 'delete':
                    this.hasDeleteAccess ? this.deleteAtion(rowId) : this.showMyToast('warning', this.LABEL.COM_LAB_WARNING, this.LABEL.COM_MSG_NO_PERMISSION);
                    break;
                case actionName:
                    let action = this.customActions.rowActions.filter(item => item[actionName] != undefined);
                    action[0][actionName].fire(rowId);
                    break;
                default:
            }
        } catch (errors) {
            console.log('[customRelatedViewAll.js > handleRowAction] Error ::', errors);
            this.errorHandler(errors);
        }
    }
    
    customHeaderAction(event){
        try {
            let actionName = event.currentTarget.title;
            let action = this.customActions.headerActions.filter(item => item[actionName] != undefined);
            action[0][actionName].fire(this.parentRecordId);
        } catch (errors) {
            console.log('[customRelatedViewAll.js > customHeaderAction] Error ::', errors);
            this.errorHandler(errors);
        }
    }

    newAction(){
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: this.objectApiName,
                actionName: 'new'
            }
        });
    }

    editAction(rowId){
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: rowId,
                objectApiName: this.objectApiName,
                actionName: 'edit'
            }
        });
    }

    async deleteAtion(rowId){
        const isConfirmDelete = await lightningConfirm(this.LABEL.COM_MSG_CONFIRM_DELETE_RECORD); 
        if(!isConfirmDelete) return;
        deleteRecord(rowId)
        .then(()=>{
            console.log('delete');
            this.refreshData();
        })
        .catch(errors=>{
            console.log('[customRelatedViewAll.js > deleteAtion] Error ::', errors);
            this.errorHandler(errors);
        });
    }

    hasUpdatedRecords() {
        if((this.draftRecords.length !== this.records.length) || (JSON.stringify(this.draftRecords) !== JSON.stringify(this.records))) {
            return true;
        }

        return false;
    }

    translateSummary() {
        if(LANG === 'ko') {
            return this.records?.length < this.totalCount ? 
                    `${this.maxRowCount}개 ${COM_LAB_ITEM}+` : `${this.records?.length}개 ${COM_LAB_ITEM}`;
        } else {
            return this.records?.length < this.totalCount ?
                    `${this.maxRowCount}+ ${COM_LAB_ITEM}s` : `${this.records?.length} ${COM_LAB_ITEM}` + (this.records.length > 1 ? 's' : '');
        }
    }
    
    /**
     * @description Object Home으로 이동
     */
     navigateToObjectHome() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: this.parentObject,
                actionName: 'home'
            }
        });
    }

    /**
     * @description 상위 Record Page로 이동
     */
     navigateToRecordPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.parentRecordId,
                objectApiName: this.parentObject, 
                actionName: 'view'
            }
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

    // Spinner toggle
    @api
	toggleSpinner(mode){
        this.showSpinner = mode;
	}

    @api
    errorHandler(errors){
		if(Array.isArray(errors)){
			errors.forEach(error => {
				this.showMyToast('error', 'Error', error.message, 'sticky');
			})
		} else {
			console.log(errors);
			this.showMyToast('error', 'Error', 'Unknown error in javascript controller/helper.', 'sticky');
		}
	}
}