/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 03-07-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class SomeService {

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getSomeData(String ObjectApiName) {
        Map<String, Object> result = new Map<String, Object>();

        if(String.isEmpty(ObjectApiName)){
            return result;
        }

        String soql = ' SELECT Id, Name ';
        soql += ' FROM ' + ObjectApiName;
        // soql += '';


        List<sObject> resultList = Database.query(soql);
        result.put('recordList', resultList);
        System.debug('resultList ### ' + resultList);
        return result;
    }

    // @AuraEnabled(cacheable=true)
    // public static Map<String, Object> getMenu() {
    //     Map<String, Object> result = new Map<String, Object>();
    //     List<CustomMenu__c> menuList = [SELECT Id, Name, Order__c, Level__c , TabName__c, IsActive__c FROM CustomMenu__c ORDER BY Order__c, Level__c ASC];
    //     Map<String, Object> orderMap = new Map<String, Object>();
        
    //     List<Object> test = new List<Object>();

    //     for(CustomMenu__c menu : menuList){
    //         Map<String, List<Object>> levelMap = new Map<String, List<Object>>();

    //         if(orderMap.get('items') == null){

    //             levelMap.put(String.valueOf(menu.Level__c), new List<Object>{menu.TabName__c});
    //         } else {
    //             levelMap = (Map<String, List<Object>>) orderMap.get('items');
    //             if(levelMap.get(String.valueOf(menu.Level__c)) == null){
    //                 levelMap.put(String.valueOf(menu.Level__c), new List<Object>{menu.TabName__c});
    //             } else {
    //                 List<Object> nameList = levelMap.get(String.valueOf(menu.Level__c));
    //                 nameList.add(menu.TabName__c);
    //                 levelMap.put(String.valueOf(menu.Level__c), nameList);
    //             }
    //         }
            
    //         orderMap.put('order', String.valueOf(menu.Order__c));
    //         orderMap.put('items', levelMap);
    //     }
    //     System.debug(orderMap);
    //     /*
    //     {
    //         1={1=(TEST1) 
    //             , item={
    //                 2=(TEST#, TEST5)
    //                 , item={
    //                 3=(TEST4)}
    //             }
    //         , 2={1=(TEST2)}
    //     }
    //     */
    //     result.put('tabInfo', orderMap);
    //     return result;
    // }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getMenu() {
        Map<String, Object> result = new Map<String, Object>();
        List<CustomMenu__c> menuList = [SELECT Id, Name, Order__c, Level__c , TabName__c, IsActive__c FROM CustomMenu__c ORDER BY Order__c, Level__c ASC];
        Map<String, Map<String, List<Object>>> orderMap = new Map<String, Map<String, List<Object>>>();
        
        for(CustomMenu__c menu : menuList){
            Map<String, List<Object>> levelMap = new Map<String, List<Object>>();

            if(orderMap.get(String.valueOf(menu.Order__c)) == null){

                levelMap.put(String.valueOf(menu.Level__c), new List<Object>{menu.TabName__c});
            } else {
                levelMap = orderMap.get(String.valueOf(menu.Order__c));
                if(levelMap.get(String.valueOf(menu.Level__c)) == null){
                    levelMap.put(String.valueOf(menu.Level__c), new List<Object>{menu.TabName__c});
                } else {
                    List<Object> nameList = levelMap.get(String.valueOf(menu.Level__c));
                    nameList.add(menu.TabName__c);
                    levelMap.put(String.valueOf(menu.Level__c), nameList);
                }
            }
            
            orderMap.put(String.valueOf(menu.Order__c), levelMap);
        }
        System.debug(orderMap);
        // {1={1=(TEST1), 2=(TEST#, TEST5), 3=(TEST4)}
        // , 2={1=(TEST2)}}
        result.put('tabInfo', orderMap);
        return result;
    }

    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getMenu2() {
        Map<String, Object> result = new Map<String, Object>();
        List<CustomMenu__c> menuList = [
            SELECT Id, Name, TabName__c, ParentMenu__c, ParentName__c, Order__c, SubOrder__c, Level__c, IsActive__c 
            FROM CustomMenu__c 
            ORDER BY Order__c, Level__c, SubOrder__c ASC
        ];
        ///조건문 추가.

        List<Map<String, Object>> parentList = new List<Map<String, Object>>();
        // Map<String, List<Map<String, Object>>> parentMap = new Map<String, List<Map<String, Object>>>();
        Map<String, List<Map<String, Object>>> childMap = new Map<String, List<Map<String, Object>>>();

        for(CustomMenu__c cm : menuList){
            // Map<String, Object> cmObj = (Map<String, Object>) JSON.deserializeUntyped(JSON.serialize(cm));
            // newCMMap.add(cmObj);

            Map<String, Object> treeInfo = treeFORM(cm);
            System.debug('treeinfo === ' + treeInfo);
            // child Menu
            if(cm.ParentMenu__c != null){
                if(childMap.get(cm.ParentMenu__c) == null){
                    childMap.put(cm.ParentMenu__c, new List<Map<String, Object>>{treeInfo});
                } else {
                    List<Map<String, Object>> childList = childMap.get(cm.ParentMenu__c);
                    childList.add(treeInfo);
                    childMap.put(cm.ParentMenu__c, childList);
                }
            } else {
                // parentMap.put(cm.Id, new List<Map<String, Object>>{treeInfo});
                parentList.add(treeInfo);
            }
        }

        System.debug('parentMap === ' + parentList);
        
        Map<String, List<Map<String, Object>>> newMap = new Map<String, List<Map<String, Object>>>();

        for(String parentId : childMap.keySet()){
            List<Map<String, Object>> childList = childMap.get(parentId);
            if(childList != null){
                for(Map<String, Object> child : childList){
                    String menuId = String.valueOf(child.get('Id'));
                    List<Map<String,Object>> selected = childMap.get(menuId);
                    if(child != null){
                        child.put('items', selected);
                    }
                }
            }
        }

        /*

        ({Id=a015g000012qB26AAE, Level=1, expanded=true, label=TEST1, name=TEST1, order=1}
        , {Id=a015g000012qB2GAAU, Level=1, expanded=true, label=TEST2, name=TEST2, order=2})

        */
        // List<Map<String, Object>> parentList
        for(Map<String, Object> topMenu : parentList){
            String parentId = String.valueOf(topMenu.get('Id'));
            List<Map<String, Object>> childList = childMap.get(parentId);
            if(childList != null){
                topMenu.put('items', childList);
            }
        }

        /// 확인용
        System.debug('parentList === ' + parentList);
        // System.debug('childMap === ' + childMap.keySet());
        // System.debug('childMap === ' + childMap);
        // for(String cmK : childMap.keySet()){
            
        //     System.debug('cmKList === ' + childMap.get(cmK));
        //     // System.debug('size === ' + childMap.get(cmK).size());
        // }
        
        result.put('MenuInfo', parentList);

        return result;
    }

    private static Map<String, Object> treeFORM(CustomMenu__c cm) {
        // tree FORM 
        Map<String, Object> treeMap = new Map<String, Object>{
            'label' => cm.Name
            , 'name' => cm.TabName__c
            , 'expanded' => true
            , 'Id' => cm.Id
            , 'order' => cm.Order__c
            , 'Level' => cm.Level__c
        };

        // List<Map<String, Object>> childList = new List<Map<String, Object>>();
        // treeMap.put('items', childList);
        return treeMap;
    }
}