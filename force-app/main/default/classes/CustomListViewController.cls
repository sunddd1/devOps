/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
 * @last modified on  : 2024-11-01
 * @last modified by  : sungnam.kimr_d@dkbmc.com
 * Modifications Log
 * Ver   Date         Author            Modification
 * 0.5   2024-06-21   woomg@dkbmc.com   Initial Version
 * 0.6   2024-08-21   seol.kim@dkbmc.com   Initial Version
**/
public with sharing class CustomListViewController {

	@AuraEnabled
	public static String getObjectList(){
		String result = '';
		try {
			list<Object> lobj = new list<Object>();
			map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
			for(Schema.SObjectType objType : gd.values()){
				Schema.DescribeSObjectResult dsr = objType.getDescribe();
				String name = dsr.getName();
				if(!dsr.isCustomSetting() && dsr.isCreateable() && dsr.isQueryable() 
					&& !name.endsWithIgnoreCase('History') && !name.endsWithIgnoreCase('Tag') 
					&& !name.endsWithIgnoreCase('Share') && !name.endsWithIgnoreCase('Feed')){

					map<String, String> obj = new map<String, String>();
					obj.put('label', dsr.getLabel());
					obj.put('value', dsr.getLocalName());

					lobj.add(obj);
				}
			}
			result = JSON.serialize(lobj);
		} catch (Exception e) {
			throw new AuraHandledException(e.getMessage());
		}

		return result;
	}

	@AuraEnabled
	public static String getFieldList(String objectName){
		String result = '';

		try{
			// list<Schema.SObjectField> listField = schema.getGlobalDescribe()
			// 											.get(objectName)
			// 											.getDescribe()
			// 											.fields
			// 											.getMap()
			// 											.values();
			SObjectType r = ((SObject)Type.forName('',objectName).newInstance()).getSObjectType();
			List<Schema.SObjectField> listField = r.getDescribe().fields.getMap().values();
			map<String, FieldInfo> fieldMap = new map<String, FieldInfo>();
												
			for(Schema.SObjectField f : listField){
				DescribeFieldResult dfr = f.getDescribe();
				Schema.DisplayType dp = dfr.getType();
				if(dp != Schema.DisplayType.base64 && 
					dp != Schema.DisplayType.DataCategoryGroupReference && 
					dp != Schema.DisplayType.EncryptedString &&
					dp != Schema.DisplayType.Location){
					
					FieldInfo fi = new FieldInfo();
					fi.label		= dfr.getLabel();
					fi.value		= dfr.getName();
					fi.formula		= '';
					fi.fieldType	= getFieldType(dp);
					fi.isSelected	= false;
					fi.isCalculated	= dfr.isCalculated();
					fi.isFilterable	= dfr.isFilterable();
					fi.isGroupable	= dfr.isGroupable();
					fi.isSortable	= dfr.isSortable();
					fi.isUpdateable	= dfr.isUpdateable();

					if(fi.fieldType == 'picklist'){
						list<Object> plist = new list<Object>();
						list<Schema.PicklistEntry> pickList = dfr.getPicklistValues();
						for(Schema.PicklistEntry pe : pickList){
							map<String, String> p = new map<String, String>();
							p.put('label', pe.getLabel());
							p.put('value', pe.getValue());

							plist.add(p);
						}
						fi.pickList = plist;
					}
					if(fi.isCalculated && fi.fieldType == 'string'){
						fi.formula = getFormulaValue(dfr.getCalculatedFormula());
						fi.isGroupable = fi.formula != '' ? true : false;
					}
					
					if(fi.fieldType == 'reference'){
						list<Schema.SObjectType> sobjType = dfr.getReferenceTo();
						fi.objectName = sobjType[0].getDescribe().getName();
					} else {
						fi.objectName = 'nobody';
					}

					fieldMap.put(fi.value, fi);
				}
			}
			if(!fieldMap.isEmpty()){
				result = JSON.serialize(fieldMap);
			}
		} catch(Exception e){
			throw new AuraHandledException(e.getMessage());
		}
		return result;
	}


	@AuraEnabled
	public static String doQuery(String query){
		String result = '';
		try {
			map<String, Object> queryMap = (map<String, Object>) JSON.deserializeUntyped(query);
			system.debug(queryMap);
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

	@TestVisible
	private static String getFormulaValue(String formulaValue){
		String result = '';
		try {
			Pattern p1 = Pattern.compile('^[a-zA-z](.[a-zA-Z0-9\\_\\.]*)$');
			Pattern p2 = Pattern.compile('TEXT\\([a-zA-z](.[a-zA-Z0-9\\_\\.]*)\\)$');
			Matcher m1 = p1.matcher(formulaValue);
			Matcher m2 = p2.matcher(formulaValue);

			result = m1.find() ? m1.group(0) : m2.find() ? m2.group(0) : '';
			result = result.replace('TEXT(', '').replace(')', '');
		} catch (Exception e) {
			throw new AuraHandledException(e.getMessage());
		}
		return result;
	}

	@TestVisible
	private static String getFieldType(Schema.DisplayType displayType){
		String fieldType = '';
		switch on displayType {
			when ADDRESS, COMBOBOX, ID, STRING, TEXTAREA {
				fieldType = 'string';
			}
			when MULTIPICKLIST, PICKLIST {
				fieldType = 'picklist';
			}
			when EMAIL {
				fieldType = 'email';
			}
			when PHONE {
				fieldType = 'phone';
			}
			when URL {
				fieldType = 'url';
			}
			when CURRENCY {
				fieldType = 'currency';
			}
			when DOUBLE, INTEGER, LONG {
				fieldType = 'number';
			}
			when PERCENT {
				fieldType = 'percent';
			}
			when DATETIME {
				fieldType = 'datetime';
			}
			when DATE, TIME {
				fieldType = 'date';
			}
			when BOOLEAN {
				fieldType = 'boolean';
			}
			when REFERENCE {
				fieldType = 'reference';
			}
			when else {
				fieldType = 'string';
			}
		}
		return fieldType;
	}

	@AuraEnabled
	public static String getInstansURL(){
		String nameSpace = [SELECT Id, NamespacePrefix FROM Organization LIMIT 1].NamespacePrefix;
		String url = System.URL.getOrgDomainURL().toExternalForm() + '/services/apexrest/';
		if(nameSpace != null) url += nameSpace  + '/';
		return url;
	}

    @AuraEnabled
    public static String getSessionInfo(){
        return getSessionId();
    }

	@TestVisible
	private static String getSessionId(){
		return Test.isRunningTest() ? 'session-id' : Page.GenerateSessionId4LWC.getContent().toString().replaceAll('\n','');
	}

	/** @checkOption가 is-Group 인 필터의 필드값 가져오기
	 *  @author seol.kim@dkbmc.com | 2024-08-22 
     *  @param field 필드이름
     *  @param objectName  오브젝트이름
     *  @param matchingFilter  true일때 본인 필드를 GROUP BY 
	 *  @param wherefield  부모필드
     *  @param objectName  부모값
     */
	@AuraEnabled
	public static List<SObject> getGroupByOption(String field
												, String objectName
												, Boolean matchingFilter
												, String wherefield
												, String selectData)
	{
		
		System.debug('field ->'+ field);
		System.debug('objectName -> '+ objectName);
		System.debug('matchingFilter ->'+ matchingFilter);
		System.debug('wherefield ->'+ wherefield);
		System.debug('selectData ->'+ selectData);
		try {
			String queryField;
			String query = '';
			
			Schema.DescribeSObjectResult describeSObject = Schema.getGlobalDescribe().get(objectName).getDescribe();
			Schema.DescribeFieldResult describeField = describeSObject.fields.getMap().get(field).getDescribe();
			
			if (describeField.getType() == Schema.DisplayType.REFERENCE && field.endsWith('__c')) {
				queryField = field.replace('__c', '__r') + '.Name';

				System.debug('queryField: ' + queryField);
			} else {
				queryField = field;
			}

			if (wherefield == null && selectData == null ) {
	
	
				if (!matchingFilter) {
					query += 'SELECT ' + queryField;
					query += ' FROM ' + objectName;
					query += ' GROUP BY ' + queryField;
				} else {
					query += 'SELECT ' + field;
					query += ' FROM ' + objectName;
				}
				
			} else if(matchingFilter == null){

				// 쿼리 생성
				query = 'SELECT ' + queryField + ' FROM ' + objectName;

				// where 조건 처리
				if ('none'.equals(selectData)) {
					selectData = null;
				}
				if (selectData == null) {
					query += ' WHERE ' + wherefield + ' = NULL';
				} else {
					query += ' WHERE ' + wherefield + ' = \'' + String.escapeSingleQuotes(selectData) + '\'';
				}

			}

			query += ' ORDER BY ' + queryField + ' ASC';
			query += ' LIMIT 1000';
				
			// 쿼리 실행
			System.debug('Final Query: ' + query);
			List<SObject> results = Database.query(query);
			System.debug('results:'+ results);

			if (results.isEmpty()) {
				System.debug('No records found.');
			} else {
				System.debug('Records found: ' + results.size());
			}
			
			// 중복 제거 로직 추가
			Set<String> uniqueValues = new Set<String>();
			List<SObject> uniqueResults = new List<SObject>();
			
			for (SObject record : results) {
				String value = (String) record.get(queryField);  // queryField 값 가져오기
				if (value != null && !uniqueValues.contains(value)) {
					uniqueValues.add(value);  // Set에 추가
					uniqueResults.add(record);  // 고유한 결과 리스트에 추가
				}
			}

			System.debug('Unique Records found: ' + uniqueResults.size());
			System.debug('uniqueResults: ' + uniqueResults);
			return uniqueResults;


			// return results;

		} catch (Exception e) {
			throw new AuraHandledException(e.getMessage());
		}
	}


	public class FieldInfo {
		@AuraEnabled
		public  String			label			{ get; set; }
		@AuraEnabled
		public  String			value			{ get; set; }
		@AuraEnabled
		public  String			formula			{ get; set; }
		@AuraEnabled
		public  String			fieldType   	{ get; set; }
		@AuraEnabled
		public  Boolean			isSelected  	{ get; set; }
		@AuraEnabled
		public	list<Object>	pickList		{ get; set; }
		@AuraEnabled
		public	String			objectName		{ get; set; }
		@AuraEnabled
		public  Boolean			isCalculated	{ get; set; }
		@AuraEnabled
		public  Boolean			isFilterable	{ get; set; }
		@AuraEnabled
		public  Boolean			isGroupable  	{ get; set; }
		@AuraEnabled
		public  Boolean			isSortable  	{ get; set; }
		@AuraEnabled
		public  Boolean			isUpdateable  	{ get; set; }
	}

	private static final String TOOLING_QUERY_TEMPLATE = '' +
		'<soapenv:Envelope\n' +
		'    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"\n' +
		'	xmlns:tns="urn:tooling.soap.sforce.com"\n' +
		'	xmlns:ens="urn:sobject.tooling.soap.sforce.com"\n' +
		'	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n' +
		'	<soapenv:Header>\n' +
		'		<tns:SessionHeader>\n' +
		'			<tns:sessionId>{0}</tns:sessionId>\n' +
		'		</tns:SessionHeader>\n' +
		'		<tns:CallOptions>\n' +
		'			<tns:client></tns:client>\n' +
		'		</tns:CallOptions>\n' +
		'		<tns:MetadataWarningsHeader>\n' +
		'			<tns:ignoreSaveWarnings>false</tns:ignoreSaveWarnings>\n' +
		'		</tns:MetadataWarningsHeader>\n' +
		'		<tns:AllOrNoneHeader>\n' +
		'			<tns:allOrNone>false</tns:allOrNone>\n' +
		'		</tns:AllOrNoneHeader>\n' +
		'	</soapenv:Header>\n' +
		'	<soapenv:Body>\n' +
		'		<tns:query>\n' +
		'			<tns:queryString>{1}</tns:queryString>\n' +
		'		</tns:query>\n' +
		'	</soapenv:Body>\n' +
		'</soapenv:Envelope>';

}