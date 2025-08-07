import { LightningElement } from 'lwc';
export default class TestInterface extends LightningElement {

    connectedCallback() {
        console.log('인터인터');
        // this.handleFetch();
        this.handleFetch1();

    }

    async testinter(){
        const res = await fetch("http://192.168.219.106:3003/test1")
        .then( result => {
            console.log('result ## ', result);
        })
        .catch(error => {
            console.log('error ### ', error);
        });
    }

    async handleFetch() {
        let endPoint = "http://192.168.219.106:3003/test1";
        const response = await fetch(endPoint);
        const repos = await response.json();
        // this.repos = repos;
        console.log('repos ## ', repos);
    }

    handleFetch1() {
        let endPoint = "http://192.168.219.106:3003/test1";
        fetch(endPoint, {
        method: "GET"
        })
        .then((response) => response.json()) 
        /* response.json() gives us back a promise
        we need to process the promise in .then()*/
        .then((repos) => {
            console.log('repos ## ', repos);
        });
        
    }
}