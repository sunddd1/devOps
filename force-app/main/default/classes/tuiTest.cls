/**
 * @description       : 
 * @author            : sungnam.kimr_d@dkbmc.com
 * @group             : 
 * @last modified on  : 2024-10-30
 * @last modified by  : sungnam.kimr_d@dkbmc.com
 * Modifications Log
 * Ver   Date         Author                     Modification
 * 1.0   2024-10-15   sungnam.kimr_d@dkbmc.com   Initial Version
**/
@RestResource(urlMapping='/tuigird/*')
global with sharing class tuiTest {
    

    @HttpPost
    global static void center() {
        RestRequest request = RestContext.request;
        RestResponse response = RestContext.response;

        System.debug('requestURI ## ' + request.requestURI.substring(request.requestURI.lastIndexOf('/')+1));
        
        RestContext.response.responseBody = Blob.valueOf(JSON.serialize(readData(request)));
        System.debug('res = ' + RestContext.response.responseBody.toString());
    }

    // @HttpGet
    global static Map<String, Object> readData(RestRequest request) {

        // RestRequest request = RestContext.request;
        System.debug('request ## ' + request);
        System.debug('request ## ' + request.params.get('queryMap'));
        
        Map<String, Object> params = (Map<String, Object>)JSON.deserializeUntyped(request.requestbody.tostring());

        System.debug('request.params ## ' + params);
        System.debug('request.params ## ' + params.keySet());
        System.debug('request.query ## ' + params.get('queryMap'));
        System.debug('request.sortAscending ## ' + params.get('sortAscending'));
        System.debug('request.sortColumn ## ' + params.get('sortColumn'));

        // System.debug('request.params ## ' + ((Map<String, Object>)params.get('queryMap')).get('pageNum'));

        Integer pageSize = Integer.valueOf(params.get('perPage'));
        Integer pageNumber = Integer.valueOf(params.get('page'));

        // String que = '{"select":"SELECT Id, Name, CreatedDate","object":"Account","where":"","orderBy":"","pageSize":50,"pageNum":1}';

        String query = JSON.serialize(params.get('queryMap'));
        
        Map<String, Object> queryResult = (Map<String, Object>) JSON.deserializeUntyped(doQuery(query));

        List<Object> newList = (List<Object>) JSON.deserializeUntyped((String)queryResult.get('records'));
        Integer totalCount = Integer.valueOf(queryResult.get('totalCount'));

        Map<String, Object> paginationMap = new Map<String, Object>();
        // paginationMap.put('page', 2);
        paginationMap.put('page', pageNumber);
        paginationMap.put('totalCount', totalCount);

        Map<String, Object> resultMap = new Map<String, Object>();
        resultMap.put('contents', newList);
        resultMap.put('pagination', paginationMap);

        Map<String, Object> dataSourceMap = new Map<String, Object>();
        dataSourceMap.put('result', true);
        dataSourceMap.put('data', resultMap);

        // System.debug(dataSourceMap);
        return dataSourceMap;

        /*
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://koreanjson.com/users');
        request.setMethod('GET');
        //request.setHeader('Authorization', 'Bearer 00D5g00000LPT4n!AR4AQMcD2CqTEj7pl4D7DVn_PYM8UDVdGLuPSRUOzEz8HjBud3CbmzI1mBgyONKug2RSgmAGkMKRXtbK3IgtdcB1Pwr.jgNt');
        HttpResponse response = http.send(request);
        // If the request is successful, parse the JSON response.
        
            System.debug('response ' + response);
        if(response.getStatusCode() == 200) {
            // Deserialize the JSON string into collections of primitive data types.
        
            System.debug('response ' + response.getBody());
            // Cast the values in the 'animals' key as a list
        
        
        }*/
    }

    // @HttpPost
    global static List<Account> createData() {
        List<Account> accList = new List<Account>();
        try {
            RestRequest request = RestContext.request;
            System.debug('request ## ' + request);
            
            Map<String, Object> params = (Map<String, Object>)JSON.deserializeUntyped(request.requestbody.tostring());

            System.debug('params ### ' + params);
            System.debug('params2 ### ' + request.params);
            System.debug(params.get('createdRows'));
            List<Object> createRows = (List<Object>) params.get('createdRows');

            for(Object row : createRows){
                Map<String, Object> rowMap = (Map<String, Object>) row;
                System.debug('rowMap == ' + rowMap);
                accList.add(new Account(
                    Name = String.valueOf(rowMap.get('Name'))
                ));
            }
    
            insert accList;
        }
        catch (Exception ex) {
            System.debug('ex' + ex);
        }

        return accList;
    }

    // @HttpDelete
    global static void deleteData() {
        // RestRequest request = RestContext.request;
        // String caseId = request.requestURI.substring(
        //     request.requestURI.lastIndexOf('/')+1);
        // Case thisCase = [SELECT Id FROM Case WHERE Id = :caseId];
        // delete thisCase;
        
        RestRequest request = RestContext.request;
        System.debug('request.params ## ' + request.params);
        
        Map<String, Object> params = request.params;

        System.debug('keySet ## ' + params.keySet());
        // System.debug('get ## ' + params.get('deletedRows[0][Id]'));
    }

    // @HttpPut
    global static ID upsertCase(String subject, String status,
        String origin, String priority, String id) {
        Case thisCase = new Case(
                Id=id,
                Subject=subject,
                Status=status,
                Origin=origin,
                Priority=priority);
        // Match case by Id, if present.
        // Otherwise, create new case.
        // upsert thisCase;
        // Return the case ID.
        return thisCase.Id;
    }
    // @HttpPatch
    global static ID updateCaseFields() {
        RestRequest request = RestContext.request;
        String caseId = request.requestURI.substring(
            request.requestURI.lastIndexOf('/')+1);
        Case thisCase = [SELECT Id FROM Case WHERE Id = :caseId];
        // Deserialize the JSON string into name-value pairs
        Map<String, Object> params = (Map<String, Object>)JSON.deserializeUntyped(request.requestbody.tostring());
        // Iterate through each parameter field and value
        for(String fieldName : params.keySet()) {
            // Set the field and value on the Case sObject
            thisCase.put(fieldName, params.get(fieldName));
        }
        // update thisCase;
        return thisCase.Id;
    }

    /*
 {
    "select":"SELECT Id, RecordTypeId, RecordType.Name, PRNumber__c, Name, toLabel(PurchaseType__c), toLabel(PurchasePurpose__c), RequestedBy__c, RequestedBy__r.Name, RequestedDate__c
            , toLabel(Status__c), toLabel(ApprovalStatus__c), DeliveryRequestDate__c, toLabel(Currency__c), LastModifiedDate, DeliveryRequestLocation__c"
    ,"object":"PurchaseRequest__c"
    ,"where":""
    ,"orderBy":""
    ,"pageSize":50
    ,"pageNum":1
 }
     {"select":"SELECT Id, Name, CreatedDate","object":"Account","where":"","orderBy":"","pageSize":50,"pageNum":1}
    */
    //SELECT Id, Name, CreatedDate FROM Account ORDER BY CreatedDate DESC
	// public static String doQuery(String query){
	public static String doQuery(String query){ //String query
		String result = '';
        system.debug('doQuery ### ' + query);

		try {
			Map<String, Object> queryMap = (Map<String, Object>) JSON.deserializeUntyped(query);
            system.debug('queryMap ### ' + queryMap);
			String  selectString = (String) queryMap.get('select');
			String  objectName   = (String) queryMap.get('object');
			String  whereString  = (String) queryMap.get('where');
			String  orderString  = (String) queryMap.get('orderBy');
			Integer pageSize     = (Integer) queryMap.get('pageSize');
			Integer pageNumber   = (Integer) queryMap.get('pageNum');

			// get total count of records
			String countTemplate = 'SELECT COUNT() FROM {0} {1}';
			String countQuery = String.format(countTemplate, new list<String>{objectName, whereString});
			Integer totalCount = Database.countQuery(countQuery);

            system.debug('totalCount ### ' + totalCount);
			// get records
			String records = '';
			if(totalCount > 0){
				PageReference queryPage = Page.CustomQuery;
				if(hasRecordType(objectName) && !selectString.contains('RecordTypeId')){
					selectString += ', RecordTypeId ';
				}

				queryPage.getParameters().put('objectName', objectName);
				queryPage.getParameters().put('selectString', selectString);
				queryPage.getParameters().put('whereString', whereString);
				queryPage.getParameters().put('orderString', orderString);
				queryPage.getParameters().put('pageSize', String.valueOf(pageSize));
				queryPage.getParameters().put('pageNumber', String.valueOf(pageNumber));

				records = queryPage.getContent().toString();
			} else {
				records = JSON.serialize(new list<sObject>());
			}

			// wrap records
			map<String, Object> resultMap = new map<String, Object>();
			resultMap.put('records', records);
			resultMap.put('totalCount', totalCount);
			result = JSON.serialize(resultMap);
		} catch (Exception e) {
			throw new AuraHandledException(e.getMessage());
		}
		return result;
	}

	@TestVisible
	private static Boolean hasRecordType(String objectName){
		Boolean result = false;
		try {
			Schema.DescribeSObjectResult dr = Schema.getGlobalDescribe().get(objectName).getDescribe();
			if(dr.getRecordTypeInfos().size() > 1){
				result = true;
			}
		} catch (Exception e) {
			throw new AuraHandledException(e.getMessage());
		}
		return result;
	}
}