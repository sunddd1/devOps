/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 01-17-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import communityPath from '@salesforce/community/basePath';
import sendMail from '@salesforce/apex/TestCloud.sendMail';

export default class TestLWC extends NavigationMixin(LightningElement){
    connectedCallback(){
        console.log('동동동동도ㅑㅇ동동동');
        console.log('communityPath @@ ', communityPath);
    }

    handleClick(event){
        try {
            console.log('handleClick @@@ ', event);
            this.sendMail();
            // // console.log(window);
            // // console.log(window.location);
            // console.log(window.location.pathname);
            // console.log(window.location.pathname.split('/')[0]);
            // console.log(window.location.pathname.split('/')[1]);
            // // console.log(window.location.origin);
            
            // this.navigateToObjectHome();
        } catch (error) {
            console.log('error @@@@ ', error);
            
        }
    }

    navigateToObjectHome() {
        // Navigate to the Account home page
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Account',
                actionName: 'home',
            },
        });
    }

    async sendMail(){
        try {
            const result = await sendMail();
            console.log('result ### ', result);
        } catch (error){
            console.log('error ### ', error);
        }
    }

}