/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 02-21-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
({
    selectUpdateCaseAction : function( cmp, event, helper) {
        console.log('test Action');
        var actionAPI = cmp.find("quickActionAPI");
        var args = {actionName: "Account.hidong"};
        
        actionAPI.getCustomAction(args).then(function(customAction) {
            console.log('test customAction ### ', customAction);
            if (customAction) {
                    customAction.subscribe(function(data){
                        console.log('test customAction data ### ', data);
                        //Handle quick action message
                    });
                    customAction.publish({message: "Hello Custom Action", param1: "This is a parameter"});
                }
            }).catch(function(error) {
                console.log('test error ### ', error);
                //We can't find that custom action.
        });

        // actionAPI.getCustomAction(args).then(function(result){
        //     //Action selected; show data and set field values
        // console.log('test result ### ', result);
        // }).catch(function(e){
        //     if(e.errors){
        //         console.log('test errors ### ', e);
        //         //If the specified action isn't found on the page, show an error message in the my component
        //     }
        // });
    },

    updateCaseStatusAction : function( cmp, event, helper ) {
        var actionAPI = cmp.find("quickActionAPI");
        var fields = {Status: {value: "Closed"}, Subject: {value: "Sets by lightning:quickActionAPI component"}, accountName: {Id: accountId}};
        var args = {actionName: "Case.UpdateCase", entityName: "Case", targetFields: fields};
        actionAPI.setActionFieldValues(args).then(function(){
            actionAPI.invokeAction(args);
        }).catch(function(e){
            console.error(e.errors);
        });
    }
})