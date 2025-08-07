/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
 * @last modified on  : 2024-10-28
 * @last modified by  : sungnam.kimr_d@dkbmc.com
 * Modifications Log
 * Ver   Date         Author            Modification
 * 1.0   2024-07-01   woomg@dkbmc.com   Initial Version
**/
public with sharing class CustomQueryController {
	public	String records	{ get; set; }

	public CustomQueryController() {
		try {
			records = '';
			map<String, Object> mapRecord = new map<String, Object>();

			map<String, Object> params = ApexPages.currentPage().getParameters();
			String  selectString = (String) params.get('selectString');
			String  objectName   = (String) params.get('objectName');
			String  whereString  = (String) params.get('whereString');
			String  orderString  = (String) params.get('orderString');
			Integer pageSize     = Integer.valueOf(params.get('pageSize'));
			Integer pageNumber   = Integer.valueOf(params.get('pageNumber'));

			String queryTemplate = '{0} FROM {1} {2} {3} LIMIT 10000';
			String query = String.format(queryTemplate, new list<String>{selectString, objectName, whereString, orderString});
			System.debug('queryTemplate ### ' + queryTemplate);
			list<sObject> objList = Database.query(query);

			ApexPages.StandardSetController con = new ApexPages.StandardSetController(objList);
			con.setPageSize(pageSize);
			con.setPageNumber(pageNumber);
			records = JSON.serialize(con.getRecords());
		} catch(Exception e) {
			throw new CustomQueryControllerException(e.getMessage());
		}
	}               

	public class CustomQueryControllerException extends Exception{ }
}