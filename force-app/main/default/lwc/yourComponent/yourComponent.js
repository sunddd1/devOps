/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 03-07-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { LightningElement, api, track, wire } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Static Resources (Slickgrid, and Icon Font)
import sf_slickGrid_bundle from '@salesforce/resourceUrl/Sf_SlickGrid'; // the zip described at step 1.1 
import { Editors, Filters, Formatters, GridBundle, loadResources } from 'c/slickGridHelper';
// import sf_slickGrid_bundleJS from '@salesforce/resourceUrl/Sf_SlickGridJS'; // the zip described at step 1.1
// import sf_slickGrid_bundleCSS from '@salesforce/resourceUrl/Sf_SlickGridCSS'; // the zip described at step 1.1


import getSomeData from '@salesforce/apex/SomeService.getSomeData';

export default class YourComponent extends LightningElement {
	slickGridInitialized = false;
	@track sgb;
	// isLoaded = false;
	@track dataset = []; // load your data through an Apex Controller with @wire

	@api recordId;
	@api objectName;
	@api isLoaded = false;

	//   @wire(getSomeData, {ObjectApiName : 'Account'})
	//   wiredGetSomeData({ error, data }) {
	//     if (data) {
	//         this.dataset = data.recordList || [];
	//         console.log('data ## ', this.dataset);

	//         if (window.Slicker && window.Slicker.Utilities && this.sgb) {
	//             this.sgb.dataset = this.dataset;
	//         }
	//     } else if (error) {
	//         console.log('error ## ', error);

	//     }
	//     this.isLoaded = true; // stop the spinner
	//   }

	@api
	resetData(objectName){
		console.log('ObjectName === ', objectName);
		this.objectName = objectName;
		this.getSomeData();
	}

	getSomeData() {
		getSomeData({
			ObjectApiName: this.objectName
		})
		.then(result => {
			this.dataset = [];
			console.log('result == ', result);

			this.dataset = result.recordList || [];
			// console.log('data ## ', this.dataset);

			if (window.Slicker && window.Slicker.Utilities && this.sgb) {
				this.sgb.dataset = this.dataset;
			}
			this.sgb.setData(this.dataset);
			this.sgb.render();

			// this.initializeGrid();
			this.isLoaded = true;
		})
		.catch(error => {
			console.log('error == ', error);
			this.isLoaded = true;
		});
	}

	// hasrenderd = false;
	// renderedCallback() {
	// 	if(this.objectName != undefined && !this.hasrenderd){
	// 		console.log('renderedCallback ObjectName === ', this.objectName);
	// 		console.log('renderedCallback isLoaded === ', this.isLoaded);
	// 		this.hasrenderd = true;
	// 		this.getSomeData();
	// 	}
	// }

	async connectedCallback() {
		console.log('connectedCallback ObjectName === ', this.objectName);
		console.log('connectedCallback isLoaded === ', this.isLoaded);

		if (this.slickGridInitialized) {
			return;
		}

		try {
			this.slickGridInitialized = true;
			
			await loadResources(this);

			this.initializeGrid();

		} catch (error) {
			console.log('error ### ', error);
			this.dispatchEvent(new ShowToastEvent({ title: 'Error loading SlickGrid', message: error && error.message || '', variant: 'error', }));
		}


	}

	initializeGrid() {
		console.log('initializeGrid == ');
		try {
			this.columnDefinitions = [
				{ id: 'Id', name: 'Id', field: 'Id' },
				{ id: 'Name', name: 'Name', field: 'Name' },
				// ...
			];

			this.gridOptions = {
				useSalesforceDefaultGridOptions: true,  // enable this flag to use regular grid options used for SF project

				autoResize: {
					container: '.grid-container',
					minHeight: 250,
					rightPadding: 50,
					bottomPadding: 75,
					gridWidth: 800,
				},
			};

			// find your HTML slickGrid container & pass it to the Slicker.GridBundle instantiation
			const gridContainerElement = this.template.querySelector(`.user-grid`);
			this.sgb = new Slicker.GridBundle(gridContainerElement, this.columnDefinitions, this.gridOptions, this.dataset);
			console.log('sgb ### ', this.sgb);
			console.log('dataset ### ', this.dataset);
			this.isLoaded = true;
		} catch (error) {
			console.log('error ### ', error);
		}
	}
}