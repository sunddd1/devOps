/**
 * @description       : 
 * @author            : 
 * @group             : 
 * @last modified on  : 07-28-2025
 * @last modified by  : 
 * Modifications Log
 * Ver   Date         Author   Modification
 * 1.0   07-03-2025      Initial Version
**/
import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getSiteURL from '@salesforce/apex/testSiteController.getSiteURL'

export default class TestButton extends NavigationMixin(LightningElement) {

    isChange = false;
    
    
    get link(){
        if(this.isChange){
            return 'https://dkbmc-1a-dev-ed--c.develop.vf.force.com/apex/testPage';
        }else{
            return 'https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=3MVG9fe4g9fhX0E7SvUq5BnZR5abM6Sz0kBWmO2mvAjNo5oDvqeJy5u_oKOQYyPObCHi0Q_wUpyPdFIm1CBot&redirect_uri=https://dkbmc-1a-dev-ed--c.develop.vf.force.com/apex/testPage';
        }
    }



    connectedCallback(){
        console.log('test');
    }

    handlePrevious(e){
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: 'https://dkbmc-1a-dev-ed--c.develop.vf.force.com/apex/testPage'
                // url: 'https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=3MVG9fe4g9fhX0E7SvUq5BnZR5abM6Sz0kBWmO2mvAjNo5oDvqeJy5u_oKOQYyPObCHi0Q_wUpyPdFIm1CBot&redirect_uri=https://dkbmc-1a-dev-ed--c.develop.vf.force.com/apex/testPage'
            }
        })
    }

    async getURL(){
        try {
            const result = await getSiteURL();
            console.log('result ### ', result);
                window.location = 'microsoft-edge:' + result;
                setTimeout(function () {
                    window.open('', '_self').close()
                }, 1)
        } catch (error) {
            console.log('error ### ', error);
        }
    }

    changeLink(){
        this.isChange = !this.isChange;
    }
}