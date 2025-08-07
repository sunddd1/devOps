/**
 * @description       : 
 * @author            : 
 * @group             : 
 * @last modified on  : 07-01-2025
 * @last modified by  : 
 * Modifications Log
 * Ver   Date         Author   Modification
 * 1.0   07-01-2025      Initial Version
**/
({
    handleToastMsg : function(component, event, helper) {
        var value = 'First Message \n';
        value += 'Second Message';
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            mode: 'sticky',
            message: value,
            title: "Success!",
            type: "success"
        });
        toastEvent.fire();
    }
})