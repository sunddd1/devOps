/**
 * @description       : 
 * @author            : 
 * @group             : 
 * @last modified on  : 07-21-2025
 * @last modified by  : 
 * Modifications Log
 * Ver   Date         Author   Modification
 * 1.0   07-21-2025      Initial Version
**/
public with sharing class testSiteController {

    @AuraEnabled
    public static string getSiteURL(){
        String url = URL.getOrgDomainURL().toExternalForm() + '/secur/frontdoor.jsp?sid=';
        try {
            // https://dkbmc-1a-dev-ed.develop.my.salesforce.com/secur/frontdoor.jsp?sid=00D5g00000LPT4nEAH!AR4AQLubH_uEYSjj4HAwMBV2RdzuxitdGvkblh1uVg1f4kGtE_T40D8hvRDgXAeanmqLMIpVky4xI3K3I8.MTyLIxfUdY_0A
        //    https://dkbmc-1a-dev-ed.develop.file.force.com//secur/frontdoor.jsp?sid=00D5g00000LPT4nEAH!AR4AQLubH_uEYSjj4HAwMBV2RdzuxitdGvkblh1uVg1f4kGtE_T40D8hvRDgXAeanmqLMIpVky4xI3K3I8.MTyLIxfUdY_0A
         String sid1 = Userinfo.getSessionId().substring(15); 
         System.debug(sid1);
         String sid2 = Userinfo.getOrganizationId(); 
         System.debug(sid2 + sid1);

         String paramValue = sid2 + sid1;
        url += paramValue;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return url;
    }
}