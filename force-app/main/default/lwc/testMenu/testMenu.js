/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 03-07-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement, track, wire } from 'lwc';


import getMenu from '@salesforce/apex/SomeService.getMenu2';

export default class TestMenu extends LightningElement {

    @track items;

    connectedCallback(){
        console.log('connected @### ');
        this.getMenu();
    }

    getMenu(){
        getMenu()
        .then(result => {
            console.log('result === ', result);
            this.items = result.MenuInfo;
            this.passName(this.items[0].name);
        })
        .catch(error => {
            console.log('error === ', error);
        });
    }
    
    // @wire(getMenu)
    // getMenu({ error, data }) {
    //     if (data) {
    //         console.log('data ## ', data);
    //         this.items = data.MenuInfo;
    //         this.startName = this.items[0].name;
    //         // this.tree(data.MenuInfo);
    //         // let startName = this.items[0].name;
    //         // let customEvent = new CustomEvent('passdata', {
    //         //     detail: startName,
    //         //     bubbles: false,
    //         //     composed: false
    //         // });
    //         // this.dispatchEvent(customEvent);
            
    //     } else if (error) {
    //         console.log('error ## ', error);

    //     }
    // }
    
    // selectedItemValue;

    handleOnselect(event) {
        try {
            let selectedItemValue = event.detail.name;
            this.passName(selectedItemValue);
        } catch (error) {
            console.log('error pass @@@@', error);
        }
    }

    passName(selectedItemValue){
        console.log('selectedItemValue ## ', selectedItemValue);
        let customEvent = new CustomEvent('passdata', {
            detail: selectedItemValue,
            bubbles: false,
            composed: false
        });
        this.dispatchEvent(customEvent);
    }
    
    tree(datas){
        /* {
                1={
                    1=(TEST1)
                        , 2=(TEST#, TEST5)
                            , 3=(TEST4)
                }
                , 2={
                    1=(TEST2)
                }
            }
        */

        let menuObj = [];

        let order = Object.keys(datas);

        order.forEach( number => {
            let menuList = {};

            let menuInfo = datas[number];
            // console.log('number/menuInfo ############## ', number + ' / ' , menuInfo);
            let level = Object.keys(menuInfo);

            level.forEach( depth => {
                // console.log('depth ## ', depth);
                let tabs = menuInfo[depth];
                // console.log('tabs ################## ', tabs);
                tabs.forEach( tabName => {
                    // console.log('tabName ################## ', tabName);
                    let tabInfo = {
                        label : tabName
                        , items : []
                        // , level : depth
                        // , order : number
                    };

                    console.log('tabName ## ', tabName);
                    if(menuList['items'] == null){
                        menuList['items'] = tabInfo;
                    } else {
                        console.log('menuList itemsitems ## ', menuList['items']['items']);
                        menuList['items']['items'] = {...tabInfo};
                        // menuList[depth-1]['item'];
                        // console.log('menuList[depth-1] ################## ', menuList[depth-2]['items']);
                    }
                    console.log('menuList ## ', menuList);
                });
            });
            menuObj.push(menuList);
        });
        console.log('menuObj ################## ', menuObj);

        /* 
            {
                label: 'Western Sales Director',
                items: [
                    {
                        label: 'Western Sales Manager',
                        items: [
                            {
                                label: 'CA Sales Rep',
                                items: [],
                            },
                            {
                                label: 'OR Sales Rep',
                                items: [],
                            },
                        ],
                    },
                ],
            },
            {
                label: 'Eastern Sales Director',
                items: [
                    {
                        label: 'Easter Sales Manager',
                        items: [
                            {
                                label: 'NY Sales Rep',
                                items: [],
                            },
                            {
                                label: 'MA Sales Rep',
                                items: [],
                            },
                        ],
                    },
                ],
            },
        */
        
        this.items = [
            {
                label: 'Western Sales Director',
                name: '1',
                expanded: true,
                items: [
                    {
                        label: 'Western Sales Manager',
                        name: '2',
                        expanded: true,
                        items: [
                            {
                                label: 'CA Sales Rep',
                                name: '3',
                                expanded: true,
                                items: [],
                            },
                            {
                                label: 'OR Sales Rep',
                                name: '4',
                                expanded: true,
                                items: [],
                            },
                        ],
                    },
                ],
            },
            {
                label: 'Eastern Sales Director',
                name: '5',
                expanded: false,
                items: [
                    {
                        label: 'Easter Sales Manager',
                        name: '6',
                        expanded: true,
                        items: [
                            {
                                label: 'NY Sales Rep',
                                name: '7',
                                expanded: true,
                                items: [],
                            },
                            {
                                label: 'MA Sales Rep',
                                name: '8',
                                expanded: true,
                                items: [],
                            },
                        ],
                    },
                ],
            },
        ];
    }
}