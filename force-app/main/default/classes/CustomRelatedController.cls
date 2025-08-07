/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 2024-01-11
 * @last modified by  : donghui.kim@dkbmc.com
**/
public with sharing class CustomRelatedController {

    @AuraEnabled
    public static Map<String, Object> getRelatedInfo(String recordId){
        Map<String, Object> result = new Map<String, Object>();

        // 부모 Object 정보
        String objectApiName = Id.valueOf(recordId).getSObjectType().getDescribe().getName();
        String objectLabel = Schema.getGlobalDescribe().get(objectApiName).getDescribe().getLabel();
        sObject parentRecord = System.Database.query(
            ' SELECT ' + Utils.getAllFieldString(objectApiName, null, true) +
            ' FROM ' + objectApiName +
            ' WHERE Id = :recordId' +
            ' LIMIT 1'
        );

        result.put('parentRecord', parentRecord);
        result.put('parentObjectLabel', objectLabel);        
        result.put('parentObjectApiName', objectApiName);

        return result;
    }

    @AuraEnabled
    public static Map<String, Object> hasObejctAccess(String ObjectApiName, String recordId){
        Map<String, Object> result = new Map<String, Object>();

        // String userId = UserInfo.getUserId();

        // List<UserRecordAccess> accessList = [SELECT RecordId, HasReadAccess, HasEditAccess, HasDeleteAccess 
        //                                         FROM UserRecordAccess
        //                                             WHERE UserId = :userId
        //                                                 AND RecordId = :recordId];



        Schema.DescribeSObjectResult describe = Schema.getGlobalDescribe().get(ObjectApiName).getDescribe();

        System.debug('isCreateable' + describe.isCreateable());
        System.debug('isAccessible' + describe.isAccessible());
        // System.debug('isUpdateable' + describe.isUpdateable());
        // System.debug('isDeletable' + describe.isDeletable());

        result.put('isCreateable', describe.isCreateable());
        result.put('isAccessible', describe.isAccessible());
        result.put('isUpdateable', describe.isUpdateable());
        result.put('isDeletable', describe.isDeletable());
        
        // System.debug('isUpdateable' + accessList[0].HasEditAccess);
        // System.debug('isDeletable' + accessList[0].HasDeleteAccess);

        // result.put('isCreateable', describe.isCreateable());
        // result.put('isAccessible', accessList[0].isAccessible());
        // result.put('isUpdateable', accessList[0].HasEditAccess);
        // result.put('isDeletable', accessList[0].HasDeleteAccess);

        return result;
    }
}