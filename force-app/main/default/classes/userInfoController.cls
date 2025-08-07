/**
 * @description       : 
 * @author            : sungnam.kimr_d@dkbmc.com
 * @group             : 
 * @last modified on  : 2024-10-23
 * @last modified by  : sungnam.kimr_d@dkbmc.com
 * Modifications Log
 * Ver   Date         Author                     Modification
 * 1.0   2024-10-23   sungnam.kimr_d@dkbmc.com   Initial Version
**/
public with sharing class userInfoController {
    @AuraEnabled
    public static String getSessionInfo(){
        return getSessionId();
    }
    
	@TestVisible
	private static String getSessionId(){
		return Test.isRunningTest() ? 'session-id' : Page.GenerateSessionId4LWC.getContent().toString().replaceAll('\n','');
	}
}