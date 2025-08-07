/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 03-12-2024
 * @last modified by  : 송남킴@dkbmc.com
**/
public with sharing class CustomRelatedDdong {
    
    @AuraEnabled
    public static List<Object> getLayoutInfo(List<String> skipSections) {
        
        List<Object> result = new List<Object>();

        List<String> layoutName = new List<String>{'DDong__c-DDong Layout'};

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
    
    @AuraEnabled
    public static Map<String, Object> getPagelayoytInfo(List<String> skipSection, String recordTypeName) {
        Map<String, Object> result = new Map<String, Object>();
        List<Object> pageInfo = new List<Object>();

        List<Metadata.Metadata> layouts = Metadata.Operations.retrieve(Metadata.MetadataType.Layout, new List<String> {'DDong__c-DDong Layout'});
    
        Metadata.Layout layoutMd = (Metadata.Layout)layouts.get(0);

        for (Metadata.LayoutSection section : layoutMd.layoutSections) {
            Map<String, Object> sectionInfo = new Map<String, Object>();

            if(skipSection.contains(section.label)){
                continue;
            }

            sectionInfo.put('sectionLabel', section.label);

            if(section.detailHeading && section.editHeading){
                sectionInfo.put('sectionVissible', true);
            }

            if(String.valueOf(section.style).contains('OneColumn')){
                sectionInfo.put('isOneColumns', true);
            }

            List<List<Object>> fieldInfos = new List<List<Object>>();
            for (Metadata.LayoutColumn column : section.layoutColumns) {
                if (column.layoutItems != null) {
                    List<Object> fieldInfo = new List<Object>();
                    for (Metadata.LayoutItem item : column.layoutItems) {
                        // System.debug(item.field);
                        // if(String.valueOf(item.behavior) == 'Readonly');
                        if(item.field == null){
                            fieldInfo.add(new Map<String, Object>{
                                'fieldName' => false
                            });
                        } else {
                            Boolean readOnly = String.valueOf(item.behavior) == 'Readonly';
                            fieldInfo.add(new Map<String, Object>{
                                'fieldName' => item.field
                                , 'fieldAccess' => String.valueOf(item.behavior)
                                , 'readOnly' => readOnly
                            });
                        }
                    }
                    fieldInfos.add(fieldInfo);
                }
                sectionInfo.put('fieldInfos', fieldInfos);
            }
            
            // System.debug(sectionInfo);
            pageInfo.add(sectionInfo);
        }
        System.debug(pageInfo);
        result.put('pageInfo', pageInfo);

        return result;
    }
    
    @AuraEnabled
    public static Map<String, Object> getRelatedRecords(Id recordId, Integer recordLimit, String sortBy, String sortDirection) {
        System.debug('recordId :::: ' + recordId); 
        System.debug('recordLimit :::: ' + recordLimit); 
        System.debug('sortBy :::: ' + sortBy); 
        
        String objName = 'DDong__c';
        // String objName = String.valueOf(recordId.getSObjectType());

        Map<String, Object> resultMap =new Map<String, Object>();
    
        String query = 'SELECT ';
        query += ' Id, Name, Account__c, Account__r.Id, Account__r.Name';
        query += ' FROM ' + objName;
        query += ' WHERE Account__c = :recordId ';
        
        query += ' ORDER BY ' + sortBy + ' ' + sortDirection;
        query += ' NULLS LAST ';
        if(sortBy != 'Name'){
            query += ' , Name asc ';
        }

        query += ' LIMIT ' + recordLimit + ' OFFSET 0';
    
        System.debug('query :::: ' + query); 
        
        List<sObject> recordList = System.Database.query(query);

        System.debug('recordList :::: ' + recordList); 

        String countQuery = ' SELECT COUNT(Id) total' ;
        countQuery += ' FROM ' + objName;
        countQuery += ' WHERE Account__c = :recordId ';

        System.debug('countQuery :::: ' + countQuery); 

        AggregateResult total =System.Database.query(countQuery);

        resultMap.put('recordList', recordList);
        resultMap.put('total', total.get('total'));
        return resultMap;
    }
    
    // @AuraEnabled
    // public static Map<String,Object> getRelatedRecords(String recordId){
    //     Map<String,Object> resultMap = new Map<String,Object>();
    //     String objName = recordId.getSObjectType();
    //     try {
    //         String sql = 'SELECT ';
    //                sql += ' Id, Name, Account__c, Account__r.Name';
    //                sql += ' FROM ' + objName;
    //                sql += ' WHERE Id =: recordId';
                   
    //         List<sObject> recordList = System.Database.query(sql);

    //         resultMap.put('STATUS', 'S');
    //         resultMap.put('records', recordList);

    //         return resultMap;
            
    //     } catch (Exception e) {
    //         throw new AuraHandledException(e.getMessage());
    //     }
    // }
}