/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 01-11-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
({
    init : function(component) {
        let urlParams = {};
        let search = location.search.substring(1);
        if (search) {
            urlParams = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', (key, value) => {
                return key === "" ? value : decodeURIComponent(value)
            });
        }
        // return params;
        // Object.keys(params).forEach(param => {
        //     console.log(params[param]);
        //     console.log(param);
        // });

        let componentName = 'c:' + urlParams.c__lwcComponentName; // c: 를 제외한 file name
        let param = {
            objectApiName : urlParams.c__objectApiName
            , objectLabel : urlParams.c__objectLabel
            , parentObjectLabel : urlParams.c__parentObjectLabel
            , parentObject : urlParams.c__parentObject
            , parentRecordId : urlParams.c__parentRecordId
            , parentRecordName : urlParams.c__parentRecordName
            , columns : JSON.parse(urlParams.c__columns)
        };
        console.log('param>', param);
        console.log('param>', componentName);
        $A.createComponent(
            componentName, param,
            function(lwcCmp, status, errorMessage) {
                if (status === "SUCCESS") {
                    let body = component.get("v.body");
                    body.push(lwcCmp);
                    component.set("v.body", body);
                }
                else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.");
                }
                else if (status === "ERROR") {
                    console.error("Error: " + errorMessage);
                }
            }
          );
    }
})