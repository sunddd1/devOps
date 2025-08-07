/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 02-20-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
import { lightningConfirm } from 'c/ldsUtils';

// Current Login User's Language Setting
import LANG from '@salesforce/i18n/lang';

// Apex class hasObejctAccess
import getRelatedInfo from '@salesforce/apex/CustomRelatedController.getRelatedInfo';
import hasObejctAccess from '@salesforce/apex/CustomRelatedController.hasObejctAccess';

// Custom Label 
import COM_BTN_NEW from '@salesforce/label/c.COM_BTN_NEW';
import COM_BTN_EDIT from '@salesforce/label/c.COM_BTN_EDIT';
import COM_BTN_DELETE from '@salesforce/label/c.COM_BTN_DELETE';
import COM_LAB_VIEW_ALL from '@salesforce/label/c.COM_LAB_VIEW_ALL'; 
import COM_LAB_SORTED_BY from '@salesforce/label/c.COM_LAB_SORTED_BY'; 
import COM_LAB_WARNING from '@salesforce/label/c.COM_LAB_WARNING'; 
import COM_MSG_CONFIRM_DELETE_RECORD from '@salesforce/label/c.COM_MSG_CONFIRM_DELETE_RECORD';
import COM_MSG_NO_PERMISSION from '@salesforce/label/c.COM_MSG_NO_PERMISSION';
import COM_LAB_UPDATED from '@salesforce/label/c.COM_LAB_UPDATED';
import COM_LAB_ITEM from '@salesforce/label/c.COM_LAB_ITEM';

// const DEFAULT_COLUMNS = [
//     { label: 'Name', fieldName: 'Id', type : 'url', typeAttributes: {label: { fieldName: 'Name' },value:{fieldName: 'Name'}, target: '_blank'}, sortable : true },
//     { label: 'Created Date', fieldName: 'CreatedDate', type : 'date', sortable : true }
// ];

export default class CustomRelated extends NavigationMixin(LightningElement) {

    /** require **/ 
    @api recordId; // parent record Id
    @api relatedObjectApiName; // related Objec Api Name
    @api columnsInfo = []; // 보여질 columns 정보
    @api records = []; // related Record List
    @api pageName = 'TestViewAll__c';
    /** ------- **/
        
    // Datatalbe 
    @api sortBy = 'Id'; // datatable Sorted by 표현 field,
    @api sortDirection = 'asc';
    @api maxRowCount; // related List에서 보여질 최대 Record Count 수
    @api totalCount; //  related Object 전체 records 수

    // Datatalbe Action 설정
    @api viewAllLwcComponentName; // c: 를 제외한 component 이름 *필수*
    @api refreshEventName = 'refreshRelatedData'; // customEvent Name
    @api isUseEditAction = false; // Edit Row Action 사용 유무
    @api isUseDeleteAction = false; // Delete Row Action 사용 유무
    @api isUseRefreshAction = false; // Refresh 사용 유무
    @api isUseCreateAction = false; // New Button 사용 유무
    @api isViewAll = !false; // View All 사용 유무
    @api customUrl; // View All URL을 customUrl로 변경
    @api customActions = {}; // Custom Action 사용 *
    /* customActions example
    customActions = {
                    'headerActions' : [{ 'actionName' : {'fire' : examfunction, 'label' : 'examLabel'}}]
                    , 'rowActions' :  [
                        { 'actionName' : {'fire' : examfunction, 'label' : 'examLabel'}} 
                    ,   { 'testAction' : {'fire' : this.testAction, 'label' : 'testLabel'}}
                    ]};
    */
    @api iconName = 'standard:default'; // object icon image
    @api relatedTitle = ''; //  Child Object Name , 전달 받은 Label이 없을경우 Object Label 사용

    @track parentObjectApiName; // parent api 
    @track parentRecordName;    // parent record name
    @track parentObjectLabel;   // parent label
    
    // New, Edit, Delete 권한
    @track hasCreateAccess;
    @track hasEditAccess;
    @track hasDeleteAccess;
    
    @track columns = [];
    @track updatedDate;
    @track titleCount;
    @track getSummary;
    @track auraComponentUrl;
    @track headerActions = [];
    @track showSpinner = true;

    @track loadInfo = {
        iconName : false
    };

    draftRecords = [];
    relatedObjectLabel;
    relatedFields = {};
    minColumnWidth = 150; // table td 최소 넓이
    LABEL = {
        COM_BTN_NEW
        , COM_BTN_EDIT
        , COM_BTN_DELETE
        , COM_LAB_VIEW_ALL
        , COM_LAB_SORTED_BY
        , COM_LAB_WARNING
        , COM_MSG_CONFIRM_DELETE_RECORD
        , COM_MSG_NO_PERMISSION
        , COM_LAB_UPDATED
    };

    @wire(getObjectInfo, { objectApiName: '$relatedObjectApiName' })
    handleResult({error, data}) {
        console.log('data :: ', data);
        if(data) {
            // 전달 받은 Label이 없을경우 Object Label 사용
            if(this.relatedTitle == ''){
                this.relatedObjectLabel = data.labelPlural;
                this.relatedTitle = this.relatedObjectLabel;
            }
            
            // related Object Icon
            let iconUrl = data.themeInfo.iconUrl;
            if(iconUrl && this.iconName == 'standard:default' ){
                // ttv2/custom/custom30_120 형태로 들어옴
                let iconInfo = iconUrl.substring(
                    iconUrl.indexOf('icon/') + 1, 
                    iconUrl.lastIndexOf('.png')
                ).split('/');
                let iconCategory = iconInfo[2];
                let iconNum = iconInfo[3].split('_')[0]; 
                this.iconName = iconCategory + ':' + iconNum;
            }
            
            this.loadInfo.iconName = true;
            this.relatedFields = data.fields;
            this.columns = [...this.columnsInfo];
        }
        if(error) {
            console.log('[customRelated.js > getObjectInfo] Error ::', error);
        }
    }

    get viewAllUrl() {
        return this.records?.length > 0  && this.isViewAll ? true : false;
    }

    get currentUserLanguage() {
        return LANG === 'ko' ? true : false;
    }

    get getHeaderStyle(){
        return this.records?.length > 0 ? 'slds-col slds-has-flexi-truncate firstHeaderRow' : 'slds-col slds-has-flexi-truncate firstHeaderRow align-center';
    }
    
    get getRefreshBtnStyle(){
        return this.isUseCreateAction ? 'slds-m-right_xx-small' : (this.customActions?.headerActions?.length > 0? 'slds-m-right_xx-small' : '' );
    }

    get hasRecords(){
        return this.records?.length > 0 ? true : false;
    }
    
    get getSortedName(){
        return this.columns.filter(item => item.fieldName == this.sortBy)[0]?.label;
    }

    get setHeaderBTN(){
        return this.customActions?.headerActions?.length > 0 ? true : false;
    }

    connectedCallback(){
        this.getRelatedInfo();
        // this.hasObejctAccess();
    }

    renderedCallback() {
        if(this.hasRecords && this.isUseRefreshAction && this.hasUpdatedRecords()) {
            this.updatedDate = Date.now();
            this.draftRecords = this.records;
        }

        if(this.totalCount == undefined){
            this.titleCount = '(' + this.records?.length + ')';
            // this.getSummary = this.records?.length + ' item' + (this.records.length > 1 ? 's' : '');
            this.getSummary = this.translateSummary();
        }
        if (this.isCount != this.totalCount ) {
            this.isCount = this.totalCount;
            this.titleCount =  (this.records?.length < this.totalCount ? '(' + this.maxRowCount + '+)' : '(' + this.records?.length + ')');
            // this.getSummary =  (this.records?.length < this.totalCount ? this.maxRowCount + '+ items' : this.records?.length + ' item' + (this.records.length > 1 ? 's' : ''));
            this.getSummary = this.translateSummary();
        }
    }

    /**
     * @description Object 권한 확인
     */
    hasObejctAccess(){
        this.showSpinner = true;
        hasObejctAccess({
            'ObjectApiName' : this.relatedObjectApiName
        })
        .then(result=>{
            this.hasCreateAccess = result.isCreateable;
            this.hasEditAccess = result.isUpdateable;
            this.hasDeleteAccess = result.isDeletable;
            
            this.translateColumns();
            this.setHeaderAction(this.customActions);
            this.setActions();
        })
        // .then(()=>{
        //     return this.generateAuraUrl();
        // })
        .catch(errors=>{
            console.log('[customRelated.js > hasObejctAccess] Error ::', errors);
            this.errorHandler(errors);
        })
        .finally(() => {
            // this.showSpinner = false;
        });
    }

    /**
     * @description parnetRecord의 정보를 가져옴
     */
    getRelatedInfo(){
        this.showSpinner = true;
        getRelatedInfo({ 
                'recordId' : this.recordId 
            })
            .then(result => {
                this.parentObjectApiName = result.parentObjectApiName;
                this.parentObjectLabel = result.parentObjectLabel;
                this.parentRecordName = result.parentRecord.Name;
                return this.hasObejctAccess();
            })
            .catch(errors => {
                console.log('[customRelated.js > getRelatedInfo] Error ::', errors);
                this.errorHandler(errors);
            })
            .finally(() => {
                this.showSpinner = false;
            });
    }

    /**
     * @description Custom Event 호출
     */
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

    /**
     * @description 상위 Component로 부터 데이터를 다시 받아오기 위한 Refresh Event
     */ 
    @api
    refreshData(){
        this.eventFire(this.refreshEventName);
    }

    /**
     * @description column label을 사용자의 언어에 맞게 번역함
     */ 
    translateColumns(){
         // column 번역
        let tempColumns = JSON.parse(JSON.stringify(this.columns));
        for(let i = 0; i < tempColumns.length; i ++){
            if(tempColumns[i].type != 'action'){
                let colInfo = this.relatedFields[tempColumns[i].label];
                if(colInfo) tempColumns[i].label = colInfo.label;                    
            }
        }
        this.columns = tempColumns;
    }
    
    /**
     * @description data table sort
     */ 
    handleSort(event) {
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
        console.log('sortBy ##@@!# ', sortBy);
        
        // sortBy.includes('__r', sortBy.length-3) ? sortBy += '.Name' : '';
        this.records?.length > 1 ? this.eventFire('sortdata', {'sortBy' :sortBy, 'sortDirection' : this.sortDirection}) : '';

        if(this.isUseRefreshAction === true) {
            this.updatedDate = Date.now();
        }
    }

    /**
     * @description Action 버튼 사용 여부를 설정함
     */
    setActions(){
        try {
            let actions = [];
            if(this.isUseEditAction && this.hasEditAccess){
                actions.push({ label: this.LABEL.COM_BTN_EDIT, name: 'edit' });
            }
            if(this.isUseDeleteAction && this.hasDeleteAccess){
                actions.push({ label: this.LABEL.COM_BTN_DELETE, name: 'delete' });
            }
            
            if(this.customActions?.rowActions?.length > 0){
                this.customActions.rowActions.forEach(item =>{
                    let actionName = Object.keys(item)[0];
                    actions.push({ label : item[actionName].label, name : actionName  });
                });
            }
            
            if(actions.length > 0){
                const actionInfo = { type: 'action', typeAttributes: { rowActions: actions } };
                this.columns.push(actionInfo);
            }
        } catch (errors ) {
            console.log('[customRelated.js > setActions] Error ::', errors);
            this.errorHandler(errors);
        }
    }


    /**
     * @description Header Action 셋팅 (사용 하는 곳 에서 셋팅필요)
     */
    @api
    setHeaderAction(customAction){
        this.headerActions = [];
        if(customAction?.headerActions?.length > 0){
            customAction.headerActions.forEach(item =>{
                let actionName = Object.keys(item)[0];
                this.headerActions.push({ title : actionName , label : item[actionName].label});
            });
        }
    }

    // Action 구현 필요
    handleRowAction(event) {
        try {
            // rowAction record 별 permission check 필요

            const actionName = event.detail.action.name;
            const row = event.detail.row;
            // const rowId = row?.Id.substring(row?.Id.lastIndexOf('/')+1); 
            const rowId = row?.originId;
            switch (actionName) {
                case 'edit':
                    this.hasEditAccess ?  this.editAction(rowId) : this.showMyToast('warning', this.LABEL.COM_LAB_WARNING, this.LABEL.COM_MSG_NO_PERMISSION);
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
            console.log('[customRelated.js > handleRowAction] Error ::', errors);
            this.errorHandler(errors);
        }
    }

    /**
     * @description Header Action 호출
     */
    customHeaderAction(event){
        try {
            let actionName = event.currentTarget.title;
            let action = this.customActions.headerActions.filter(item => item[actionName] != undefined);
            action[0][actionName].fire(this.recordId);
        } catch (errors) {
            console.log('[customRelated.js > customHeaderAction] Error ::', errors);
            this.errorHandler(errors);
        }
    }
    
    /**
     * @description Standard new 
     */
    newAction(){
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: this.relatedObjectApiName,
                actionName: 'new'
            }
        });
    }

    /**
     * @description Standard edit 
     */
    editAction(rowId){
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: rowId,
                objectApiName: this.relatedObjectApiName,
                actionName: 'edit'
            }
        });
    }

    /**
     * @description Standard delete
     */
    async deleteAtion(rowId){
        const isConfirmDelete = await lightningConfirm(this.LABEL.COM_MSG_CONFIRM_DELETE_RECORD); 
        if(!isConfirmDelete) return;
        deleteRecord(rowId)
        .then(()=>{
            this.refreshData();
        })
        .catch(errors=>{
            console.log('[customRelated.js > deleteAtion] Error ::', errors);
            this.errorHandler(errors);
        });
    }

    /**
     * @description View All Url 생성
     */
    //  generateAuraUrl() {
    //     console.log('generateAuraUrl @@@@');
    //     this[NavigationMixin.GenerateUrl]({
    //         type: 'standard__component',
    //         attributes: {
    //             componentName: 'c__customRelatedNavigateToViewAll'
    //         },
    //         state: {
    //             // component name
    //             c__lwcComponentName : this.viewAllLwcComponentName,
    //             // Object ApiName                
    //             c__objectApiName : this.relatedObjectApiName,
    //             c__objectLabel : this.relatedTitle,
    //             // Object Label
    //             c__parentObjectLabel : this.parentObjectLabel,
    //             c__parentObject : this.parentObjectApiName,
    //             // Parent Id
    //             c__parentRecordId: this.recordId,
    //             // Parent Name --> 인식불가 
    //             c__parentRecordName: this.parentRecordName,
    //             c__columns: JSON.stringify(this.columns)
    //         }            
    //     })
    //     .then(url => {
    //         console.log('url @@@@ ', url);
    //         this.customUrl != undefined ? this.auraComponentUrl = this.customUrl : this.auraComponentUrl = url;
    //     });
    // }


    viewAll(){
        console.log('viewAll @@@@ ');
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: this.pageName
            },
            state: {
                // component name
                c__lwcComponentName : this.viewAllLwcComponentName,
                // Object ApiName                
                c__objectApiName : this.relatedObjectApiName,
                c__objectLabel : this.relatedTitle,
                // Object Label
                c__parentObjectLabel : this.parentObjectLabel,
                c__parentObject : this.parentObjectApiName,
                // Parent Id
                c__parentRecordId: this.recordId,
                // Parent Name --> 인식불가 
                c__parentRecordName: this.parentRecordName,
                c__columns: JSON.stringify(this.columns)
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

    @api
    toggleSpinner(toggle){
        this.showSpinner = toggle;
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

// 공통 함수 

// 타입이 url인 columns만 반환함
const setUrlTypeColumns = (columns) => {
    let urlSet = new Set(); // type이 url인 columns set
    columns.forEach(item => {
        if(item['type'] == 'url') urlSet.add(item.fieldName);
    });
    return urlSet;
}

// 타입이 url인 columns의 값을 주소 형태로 변환함
const setUrlColumns = (data, urlSet) => {
    data.forEach(item => {
        
        for(let column of urlSet){
            if(column.includes('__r', column.length-3)){
                item[column + '_Name'] = item[column]?.Name;
                item[column] = `${window.location.origin}/${window.location.pathname.split('/')[1]}/${item[column]?.Id}`;
            } else if(column.includes('__r') || column.toLowerCase() != 'id'){
                let keyField = column.split('.')[0];
                item[keyField + '.Name'] = item[keyField]?.Name; // 보일 필드 값                
                item[column] = `${window.location.origin}/${window.location.pathname.split('/')[1]}/${item[keyField]?.Id}`; // 이동 링크 값
            } else {
                item['originId'] = item['Id']; 
                item[column] = `${window.location.origin}/${window.location.pathname.split('/')[1]}/${item[column]}`;
            }
        };
    });
}

export { setUrlTypeColumns, setUrlColumns}