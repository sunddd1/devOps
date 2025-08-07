public without sharing class TestCloud {


    @AuraEnabled
    public static Map<String, Object> sendMail(){
        Map<String, Object> result = new Map<String, Object>();
        DDong__c ddong = [
            SELECT Id, CreatedBy.Name, OwnerId, Name, CreatedDate FROM DDong__c LIMIT 1
        ];

        EmailTemplate et = [
            SELECT Id, Name, DeveloperName ,
            HtmlValue, Subject
            FROM EmailTemplate 
            WHERE DeveloperName = 'test'
            LIMIT 1
        ];

        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

        mail.setTargetObjectId(ddong.OwnerId); 
        mail.setTemplateId(et.Id);
        mail.setWhatId(ddong.Id); 
        // String body = et.HtmlValue.replace('{!DDong__c.Name}', ddong.Name );
        // body = body.replace('{!DDong__c.CreatedDate}', String.valueOf(ddong.CreatedDate) );
        // mail.setHtmlBody(body);
        // mail.setSubject(et.Subject);
        // mail.toAddresses(new String[] { ddong.OwnerId });
        mail.setSaveAsActivity(false);
        Messaging.SendEmailResult[] results = Messaging.sendEmail(new Messaging.singleemailMessage[] {mail});
        if (results[0].success) {
            System.debug('The email was sent successfully.');
        } else {
            System.debug('The email failed to send: '
                + results[0].errors[0].message);
            // result.put('message', results[0].errors[0].message);
        }
            // result.put('result', results[0]);

        return result;
    }

    
    public static DDong__Share setShare(){
        Map<String, Object> result = new Map<String, Object>();
        DDong__c ddong = [
            SELECT Id, CreatedBy.Name, OwnerId, Name, format(CreatedDate) FROM DDong__c LIMIT 1
        ];

        User sugar = [
            SELECT Id, name, UserRole.Name, UserRoleId FROM User WHERE name = '설탕맨' LIMIT 1
        ];
// SELECT Id, ParentId, UserOrGroupId, AccessLevel, RowCause, LastModifiedDate, LastModifiedById, IsDeleted FROM DDong__Share 
// WHERE ParentId = 'a00J1000001kWeNIAU'

        Group gg = [
            SELECT 
                Id
                FROM Group 
                WHERE Type = 'RoleAndSubordinates'
                AND RelatedId = :sugar.UserRoleId
                LIMIT 1
        ];
        DDong__Share ds = new DDong__Share(
            ParentId = ddong.Id
            , AccessLevel = 'Edit'
            , UserOrGroupId = gg.Id
            , RowCause = 'Manual'
        );

        insert ds;

        return ds;
    }
}