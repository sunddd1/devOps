/**
 * @description       : 
 * @author            : sungnam.kimr_d@dkbmc.com
 * @group             : 
 * @last modified on  : 2024-11-15
 * @last modified by  : sungnam.kimr_d@dkbmc.com
 * Modifications Log
 * Ver   Date         Author                     Modification
 * 1.0   2024-10-14   sungnam.kimr_d@dkbmc.com   Initial Version
**/
import { LightningElement, track } from 'lwc';

import getInstansURL from '@salesforce/apex/CustomListViewController.getInstansURL';
import getSessionInfo from '@salesforce/apex/CustomListViewController.getSessionInfo';
import getFieldList from "@salesforce/apex/CustomListViewController.getFieldList";
import { loadHelper } from 'c/tuiHelper';
import { buildQuery } from "./salesforceBackendService";
import { data } from './data';

export default class tuiTest extends LightningElement {
	
	data = data;
	grid;
	fieldMap;
	// header = {
	//   height: 160,
	//   complexColumns: [
	// 	{
	// 		header : 'Test'
	// 		, name : 'test header'
	// 		, childNames : ['deliveryType']
	// 	}
	//   ]
	// };
	columnsDataJS = [
		{
			header: 'deliveryType',
          sortingType: 'asc',
          sortable: true ,
			name: 'deliveryType'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  },
        //   sortingType: 'asc',
          sortable: true ,
		},
		{
			header: 'orderName',
			name: 'orderName'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  },
          sortable: true ,
		}
	];

	columns = [
        {
          header: 'Name',
          name: 'Name'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  }
		  ,  editor: 'text' ,
          sortingType: 'asc',
          sortable: true ,
		  filter: { type: 'text', showApplyBtn: true, showClearBtn: true }

        },
        {
          header: 'CreatedDate',
          name: 'CreatedDate'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  },
          sortable: true,
		  filter: { type: 'date', showApplyBtn: true, showClearBtn: true }
        },
        {
          header: 'Owner.Name',
          name: 'OwnerId'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'reference'
			  }
		  },
          sortable: true,
		  filter: { type: 'text', showApplyBtn: true, showClearBtn: true }
        },
	];
	

	columns2 = [
        {
          header: 'id',
          name: 'id'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  }
		  ,  editor: 'text'
        },
        {
          header: 'name',
          name: 'name'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  }
        },
        {
          header: 'phone',
          name: 'phone'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  }
        },
        {
          header: 'province',
          name: 'province'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  }
        },
        {
          header: 'city',
          name: 'city'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  }
        },
        {
          header: 'street',
          name: 'street'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  }
        },
        {
          header: 'username',
          name: 'username'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  }
        },
        {
          header: 'website',
          name: 'website'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  }
        },
        {
          header: 'zipcode',
          name: 'zipcode'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  }
        },
        {
          header: 'district',
          name: 'district'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  }
        },
        {
          header: 'email',
          name: 'email'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  }
        },
        {
          header: 'createdAt',
          name: 'createdAt'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  }
        },
        {
          header: 'updatedAt',
          name: 'updatedAt'
		  , renderer : {
			  type: CustomStringRenderer,
			  options : {
				  fieldType : 'string'
			  }
		  }
        }
      ];
	userSession;

	async connectedCallback(){
		await loadHelper(this);
		setTimeout(async () => {
			this.init();
			// this.test();
			// this.test2();
		}, 2000);
		try {
		} catch (error) {
			console.log(error.message);
		}
	}

	dataSource2 = { 
		api: {
		  readData: { 
			url: 'https://koreanjson.com/users', 
			// method: 'GET',
			method: "post",
		  },
		  
		  createData: {
			url: 'https://koreanjson.com/users',
			method: "post",
			initParams: { param: 'createData' } 
		  },
		  updateData: {
			url: 'https://koreanjson.com/users',
			method: "post",
			initParams: { param: 'updateData' }
		  },
		  deleteData: {
			url: 'https://koreanjson.com/users',
			// method: "delete",
			method: "post",
			initParams: { param: 'deleteData' } 
		  },
		},
		headers: 
		{
			// 'Authorization' : 'Bearer 00D5g00000LPT4n!AR4AQCxvjbplNKDrQ7S371rY92EXrYAkmN4IhUO98xNYlHFyDPUQf0hrgq1nCc.fAc1iV9N26cM0ChO2neXzlhYDo8tsnCe5'
		// 	, 
			// 'Access-Control-Allow-Origin' : '*'
			// , 'Access-Control-Allow-Credentials' : true
			// , 'Access-Control-Allow-Headers' : '*'
			// , 'AllowCredentials' : true
		}
		// , initialRequest : true
		// , contentType: 'application/json; charset=utf-8'
	};
	// https://hackathon-dkbmc-jeon-26ba76e4c19d.herokuapp.com/?target1=cookies&target2=seogbong
	dataSource = {
		api: {
		  readData: {
			// url: `${window.location.origin}/services/apexrest/tuigird/readData`,
			// url: 'https://dkbmc-1a-dev-ed.develop.my.salesforce.com/services/apexrest/tuigird/readData',
			url: '',
			method: 'post',
			initParams: { requestType: 'readData'
				// , sortColumn: 'Name',  sortAscending : false
			}
		  },
		  createData: {
			url: '',
			method: "post",
			initParams: { requestType: 'createData' } 
		  },
		  updateData: {
			url: '',
			method: "post",
			initParams: { requestType: 'updateData' } 
		  },
		  deleteData: {
			url: '',
			method: "post",
			initParams: { requestType: 'deleteData' } 
		  },
		},
		headers: 
		{
			// 'Authorization' : 'Bearer ' + this.userSession
			// 'Authorization' : 'Bearer 00D5g00000LPT4n!AR4AQNnf8n_1bvrWd.mjwYZOzfL_WHWczucnHDOonrWukaPyAJ6eDyytd7lLqLWgLv.ZYdaSH5T5Y7pBcEn1O789CJtcTsg7'
			// , 
			// 'Access-Control-Allow-Origin' : '*'
			// , 'Access-Control-Allow-Headers' : 'Accept'
			// , 'Access-Control-Allow' : '*'
			// , 'Access-control-allow-credentials' : true
			// // 'http-equiv' : 'Content-Security-Policy'
			// // , 'content' : "connect-src 'self';"
			// , 'Access-Control-Max-Age': 1
		}
		// , contentType: 'application/x-www-form-urlencoded'
		, contentType: 'application/json; charset=utf-8'
		// , withCredentials : true
	};

	// cspMetaTag.setAttribute('http-equiv', 'Content-Security-Policy');
	// cspMetaTag.setAttribute('content', "connect-src 'self';");

	header = {
		'mode': 'no-cors'
		, 'accept' : '*/*'
		, 'authorization' : 'Bearer 00D5g00000LPT4n!AR4AQMcD2CqTEj7pl4D7DVn_PYM8UDVdGLuPSRUOzEz8HjBud3CbmzI1mBgyONKug2RSgmAGkMKRXtbK3IgtdcB1Pwr.jgNt'
		, 'access-Control-Allow-Origin' : '*'
		, 'access-Control-Allow-Credentials' : true
		, 'access-Control-Allow-Headers' : '*'
	};

	test(){
		var xhr = new XMLHttpRequest();
		// xhr.withCredentials = true;

		xhr.addEventListener("readystatechange", function() {
		if(this.readyState === 4) {
			console.log(this.responseText);
		}
		});

		xhr.open("GET", "https://dkbmc-1a-dev-ed.develop.my.salesforce.comhttps://dkbmc-1a-dev-ed.develop.my.salesforce.com/services/apexrest/tuiTest?perPage=&a1=null&page=1", false);
		xhr.setRequestHeader("Authorization", "Bearer 00D5g00000LPT4n!AR4AQMcD2CqTEj7pl4D7DVn_PYM8UDVdGLuPSRUOzEz8HjBud3CbmzI1mBgyONKug2RSgmAGkMKRXtbK3IgtdcB1Pwr.jgNt");
		// WARNING: Cookies will be stripped away by the browser before sending the request.
		// xhr.setRequestHeader("Cookie", "BrowserId=ekk7WYtXEe-Umu14cvgl2w; CookieConsentPolicy=0:1; LSKey-c$CookieConsentPolicy=0:1");
		// xhr.setRequestHeader("withCredentials", true);
		xhr.setRequestHeader("mode", "no-cors");
		xhr.setRequestHeader("access-Control-Allow-Origin", '*');
		xhr.setRequestHeader("access-Control-Allow-Credentials", true);
		xhr.setRequestHeader("access-Control-Allow-Headers", '*');

		xhr.send();
	}

	async test2(){
		let url = 'https://koreanjson.com/users';
		// let url = 'https://hackathon-dkbmc-jeon-26ba76e4c19d.herokuapp.com/?target1=cookies&target2=seogbong';
        let method = 'POST';

        let requestOption = {
            method: method,
            // body: data,
			// mode: "cors",
            headers: {
				'mode': 'cors',
				// , 'accept' : '*/*'
				// , 'Content-Type': 'application/json'
				// , 'Authorization' : 'Bearer 00D5g00000LPT4n!AR4AQMcD2CqTEj7pl4D7DVn_PYM8UDVdGLuPSRUOzEz8HjBud3CbmzI1mBgyONKug2RSgmAGkMKRXtbK3IgtdcB1Pwr.jgNt'
				'Access-Control-Allow-Origin' : '*'
            }
        };

        let responseData = await fetch(url, requestOption)
        .then(response => {

            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => {
			console.log('error ## ', error);
        });
		console.log(responseData);
	}
// Bearer 00D5g00000LPT4n!AR4AQE6zZLcSOxf9qO5O1AO6wolIwInForp5TMNJfiRyzQPk.MHwVb._U_MCbgAhakMUM_xTmpC1RVACTHNF3QOT5q15WhnE
// Bearer 00D5g00000LPT4n!AR4AQMcD2CqTEj7pl4D7DVn_PYM8UDVdGLuPSRUOzEz8HjBud3CbmzI1mBgyONKug2RSgmAGkMKRXtbK3IgtdcB1Pwr.jgNt

	init2(){
		const grid = new tui.Grid({
			el: this.refs.tui,
			data : { 
				api: {
				readData: { 
					url: 'https://koreanjson.com/users', 
					method: 'GET',
				}
				},
			},
			scrollX: false,
			scrollY: false,
			columns: [
			{
				header: 'ID',
				name: 'id'
			},
			{
				header: '이름',
				name: 'name'
			},
			{
				header: '유저',
				name: 'username'
			},
			{
				header: '이메일',
				name: 'email'
			},
			{
				header: '전화번호',
				name: 'phone'
			}
			]
		});
	
	
		grid.on('response', function (ev) {
		let response = ev.xhr.responseText;
		let data = JSON.parse(response);
		grid.resetData(data);
		});
		

		console.log('grid initialization end ');
	}

	sortInfo = [];
	query;
	bq(){
		let internalFilter = [];
		// item.columnId + ' ' + item.direction;
		// let sortInfo = [];
		let pageInfo = { pageNumber: this.page, pageSize: this.perPage };
		let filters = [];
		let query = buildQuery('Ddong__c', this.fieldMap, this.columns, filters, internalFilter, this.sortInfo, pageInfo);
		
		console.log('bq query ### ', query);
		return query;
	}
	
	crud = ['readData', 'createData', 'updateData', 'deleteData'];
	async buildDataSource(){
		let instansURL = await getInstansURL();
		let apiInfo = {};
		this.crud.map(type => {
			apiInfo[type] = {
				url: `${instansURL}tuigird/${type}`,
				method: "post",
				initParams: { requestType: type } 
			};
		});
		return apiInfo;
	}

	async init(){
		try {

			let objectName = 'Ddong__c';
			const fieldString = await getFieldList({ objectName: objectName });
			this.fieldMap = JSON.parse(fieldString);
			// const instansURL = await getInstansURL();
			// console.log('url ### ', instansURL);
			// console.log('dataSource 11 ### ', JSON.stringify(this.dataSource));
			this.dataSource.api = await this.buildDataSource();
			// Object.keys(this.dataSource.api).forEach(info => {
			// 	this.dataSource.api[info].url = `${instansURL}tuigrid/${info}`; 
			// });

			// let columns = columnBuilder(fields, this.fieldMap);
			// console.log('fieldMap ### ', JSON.stringify(this.fieldMap));
			// this.bq();
			this.queryMap = JSON.parse(this.bq());
	

			this.dataSource.headers.Authorization = 'Bearer ' + await getSessionInfo();
			this.dataSource.api.readData.initParams['queryMap'] = this.queryMap;

			// console.log('query ### ', query);
			console.log('queryMap ### ', JSON.stringify(this.queryMap));
	
			this.dataSource.api.readData.initParams['queryMap'] = this.queryMap;
			this.dataSource.api.readData.initParams['queryMap'] = this.queryMap;

			console.log('dataSource ### ', JSON.stringify(this.dataSource));
			////////////////////////////////////////////////

			const container = this.refs.tui;
			let userGrid = document.createElement('div');
			userGrid.className = 'user-grid';
			container.appendChild(userGrid);
	
			console.log('grid initialization start ');
			this.grid = await new tui.Grid({
				el: userGrid,
				columns: this.columns,
				data: this.dataSource,
				rowHeaders: ['rowNum', 'checkbox'],
                pageOptions: {
                    useClient: false,
                    perPage: this.perPage, // 5
                },
				usageStatistics: false,
				useClientSort: false,

				// showDummyRows: true
			});
			tui.Grid.applyTheme('striped');

			this.grid.on('beforeChange', ev => {
				console.log('before change:', ev);
			});
			this.grid.on('afterChange', ev => {
				console.log('after change:', ev);
			})

			// this.grid.on('beforeRequest', (ev) => {
			// 	console.log('beforeRequest ## ', ev);
			// 	console.log('beforeRequest xhr ## ', JSON.stringify(ev.xhr));
				
			// });      
			// this.grid.on('beforePageMove', (ev) => {
			// 	this.page = ev.page;
			// 	console.log('변경된 페이지 번호 ### ', this.page);
			// 	this.queryMap.pageNum = this.page;
			   
			// 	ev.instance.setRequestParams({ queryMap : this.queryMap});
			// 	console.log(' --- setRequestParams 다음 --- ');
		 
			// 	console.log('queryMap ==> ', JSON.stringify(this.dataSource));
		 
			// });

			this.grid.on('beforePageMove', async (ev) => {
				console.log('beforePageMove ## ', ev);
				
				this.page = ev.page;
				console.log('page 111### ', this.page);
				
				// this.bq();
				// this.queryMap = {...JSON.parse(this.query)};
				this.queryMap.pageNum = this.page;
				// this.dataSource.api.readData.initParams['queryMap'] = this.queryMap;
				// console.log('this.queryMap ### ', JSON.stringify(this.queryMap));
				// console.log('queryMap ==> ', JSON.stringify(this.dataSource));
				// ev.instance.setRequestParams({queryMap : this.queryMap});
				// ev.instance.setRequestParams({queryMap1 : this.queryMap});

				// let a = await this.bq();
				// ev.instance.setRequestParams({queryMap : JSON.parse(this.query)});

			});

			this.grid.on('beforeSort', (ev) => {
				console.log('beforeSort ## ', ev);
				console.log('beforeSort ## ', JSON.stringify(ev.sortState));
				console.log('beforeSort ascending ## ', ev.ascending);
				console.log('beforeSort multiple ## ', ev.multiple);
				
				try {
					// this.queryMap.orderBy = 'ORDER BY ' + ev.columnName + ' ' + (ev.ascending ? 'asc' : 'desc');
					this.page = 1;
					// this.queryMap.pageNum = 1;
	
					this.orderBy[ev.columnName] = ev.ascending;
					console.log('this.orderBy #### ', JSON.stringify(this.orderBy));
					// this.queryMap.orderBy = '';
					this.sortInfo = Object.keys(this.orderBy).map( columnId => {
						return {
							columnId : columnId,
							direction : this.orderBy[columnId] ? 'asc' : 'desc'
						}
					});
					console.log('sortInfo ### ', JSON.stringify(this.sortInfo));

					this.queryMap = JSON.parse(this.bq());
					
					ev.instance.setRequestParams({queryMap : this.queryMap});
				} catch (error) {
					console.log(error.message);
				}
				
			});
			this.grid.on('afterSort', (ev) => {
				console.log('afterSort sortState ### ', JSON.stringify(ev.instance.getSortState()));
				
			});
			this.grid.on('beforeUnsort', (ev) => {
				console.log('beforeUnsort ## ', ev);
				console.log('beforeUnsort ## ', JSON.stringify(ev.sortState));
				console.log('beforeUnsort ## ', ev.columnName);
				console.log('beforeUnsort multiple ## ', ev.multiple);
				this.orderBy = {};
				this.sortInfo = [];
				this.queryMap = JSON.parse(this.bq());
					
				ev.instance.setRequestParams({queryMap : this.queryMap});
			});

			this.grid.on('onGridMounted', (grid) => {
				
			
				
			});
			
			this.grid.on('beforeRequest', (ev) => {
				console.log('beforeRequest ## ', ev);
				// console.log('beforeRequest xhr ## ', JSON.stringify(ev.xhr));
				
			});
			this.grid.on('response', (ev) => {
				console.log('response start ## ', ev);

				console.log('response End ');
			
			});
			
			this.grid.on('successResponse', (ev) => {
				console.log('successResponse start ### ', ev);
				
				console.log('successResponse end ### ');
			});
			
			
			this.grid.on('beforeFilter', (ev) => {
				console.log('beforeFilter ## ', ev);
				console.log('beforeFilter filterState ## ', ev.filterState);
				console.log('beforeFilter columnName ## ', ev.columnName);
				console.log('beforeFilter type ## ', ev.type);
				console.log('beforeFilter operator ## ', ev.operator);
				console.log('beforeFilter conditionFn ## ', ev.conditionFn);
				console.log('beforeFilter columnFilterState ## ', ev.columnFilterState);
				console.log('beforeFilter conditionFn ## ', JSON.stringify(ev.conditionFn));
				console.log('beforeFilter columnFilterState ## ', JSON.stringify(ev.columnFilterState));
			});

			this.grid.on('beforeUnfilter', (ev) => {
				console.log('beforeUnfilter ## ', ev);
				console.log('beforeUnfilter filterState ## ', ev.filterState);
				console.log('beforeUnfilter columnName ## ', ev.columnName);
			});
			
			this.grid.on('afterFilter', (ev) => {
				console.log('afterFilter ## ', ev);
				console.log('afterFilter filterState ## ', ev.filterState);
				console.log('afterFilter columnName ## ', ev.columnName);
			});

			// this.grid.on('click', (ev) => {
			// 	console.log('click ## ', ev);
			// 	console.log('click targetType ## ', ev.targetType);
			// 	console.log('click rowKey ## ', ev.rowKey);
			// 	console.log('click columnName ## ', ev.columnName);
			// 	console.log('click ## ', ev.instance.el.classList);
			// 	console.log('click ## ', ev.instance.gridEl.classList);
			// 	// console.log('click ## ', JSON.stringify(ev.gridEl.classList));
			// 	// console.log('click ## ', JSON.stringify(ev.el.classList));
			// 	// console.log('click ## ', JSON.stringify(ev.gridEl.classList));
			// });

			/*
			
			this.grid.on('check', (ev) => {
				console.log('check ## ', ev);
				console.log('rowKey ## ', ev.rowKey);
				console.log('rowKeys ## ', ev.rowKeys);
				this.selectedRows.push(ev.rowKey);
				console.log('selectedRows ### ', JSON.stringify(this.selectedRows));
			});

			this.grid.on('checkAll', (ev) => {
				console.log('checkAll ## ', ev);
				console.log('selectedRows ### ', JSON.stringify(this.selectedRows));
			});

			this.grid.on('uncheck', (ev) => {
				console.log('uncheck ## ', ev);
				console.log('rowKey ## ', ev?.rowKey);
				console.log('rowKeys ## ', ev?.rowKeys);
				this.selectedRows.splice(this.selectedRows.indexOf(ev?.rowKey), 1)
				console.log('selectedRows ### ', JSON.stringify(this.selectedRows));
			});

			this.grid.on('uncheckAll', (ev) => {
				console.log('uncheckAll ## ', ev);
				console.log('selectedRows ### ', JSON.stringify(this.selectedRows));
			});
			*/

			// this.bq();
			// this.queryMap = JSON.parse(this.query);
			// console.log('this.queryMap ### ', JSON.stringify(this.queryMap));
			// console.log('queryMap ==> ', JSON.stringify(this.dataSource));
			// this.grid.setRequestParams({queryMap : this.queryMap});
			// setTimeout(() => {
			// 	this.grid.readData(1, this.dataSource, true);
				
			// }, 2000);
			// this.grid.reloadData();
			// this.grid.getSortState();
			console.log('grid initialization end ');
		} catch (error) {
			console.log('error init ## ', error.stack);
		}
	}

	orderBy = [];
	page = 1;
	perPage = 5;

	queryMap = {};


	// '{"select":"SELECT Id, Name, CreatedDate","object":"Account","where":"","orderBy":"ORDER BY CreatedDate DESC","pageSize":5,"pageNum":3}';

	selectedRows = [];
	apiAction(event){
		let actionName = event.currentTarget.dataset.actionName;
		console.log('actionName ## ', actionName);
		try {
			if(actionName == 'createData'){
				console.log('grid ### ', this.grid);
				
				this.grid.request('createData');
				// this.grid.clearModifiedData();
			} else if(actionName == 'updateData'){
				this.grid.request('updateData');
				// this.grid.clearModifiedData();
			} else if(actionName == 'appendRow'){
				console.log(this.grid);
				this.grid.prependRow({}, {
					// at : 0 ,
					focus : true
				});

				// // this.grid.setPaginationTotalCount(100);
				// // this.grid.setRow(4, {Name : 'setRow로 추가된 6번 row'});
				// // this.grid.setRows( [{Name : ' test'}]);
				// console.log(this.grid.getData(), JSON.stringify(this.grid.getData()));
				// console.log(this.grid.getPaginationTotalCount());
				// // this.grid.setPaginationTotalCount(this.grid.getRowCount());
				// // this.grid.resetData(this.grid.getData());
				// console.log('getAllModifiedData ### ', this.grid.dataManager.getAllModifiedData(), JSON.stringify(this.grid.dataManager.getAllModifiedData()));
			}  else if(actionName == 'removeRow'){
				// this.grid.setPaginationTotalCount(this.grid.getRowCount()+1);
				this.grid.removeRows(this.selectedRows);
				// this.grid.setPaginationTotalCount(this.grid.getRowCount());
				// this.grid.resetData(this.grid.getData());
			} else if(actionName == 'deleteData'){
				this.grid.request('deleteData');
				// this.grid.clearModifiedData();
			} 
		} catch (error) {
			console.log('error ## ', error.message);
		}
	}
	
	buildQuery(objectName, fieldMap, columns, externalFilter, internalFilter, sortInfo, pageInfo){
		let select = buildSelect(fieldMap, columns);
			
		let where = '';
		// let external = buildWhere4External(fieldMap, externalFilter);
		// let internal = buildWhere4Internal(fieldMap, internalFilter);
		// if(external === '' && internal === ''){
		// 	where = '';
		// } else if(external !== '' && internal !== ''){
		// 	where = 'WHERE ' + external + ' AND ' + internal;
		// } else if(external !== '' && internal === ''){
		// 	where = 'WHERE ' + external;
		// } else if(external === '' && internal !== ''){
		// 	where = 'WHERE ' + internal;
		// }
		
		let orderBy = this.buildSorter(fieldMap, sortInfo);

		let query = {
			select : select,
			object : objectName,
			where  : where,
			orderBy: orderBy,
			pageSize : pageInfo.pageSize,
			pageNum  : pageInfo.pageNumber
		}
		
		log('backendService commonGridInternal build Query -> ', JSON.stringify(query));
		return JSON.stringify(query);
		// return 'xxxxxxxxxxxxxxx';
	}

	buildSorter(sortInfo){
		let sorter = '';
		[...sortInfo].forEach((item) => {
			sorter += item.columnId + ' ' + item.direction;
			if(item !== sortInfo[sortInfo.length - 1]){
				sorter += ',';
			}
		});
		if(sorter !== ''){
			sorter = 'ORDER BY ' + sorter;
		}
		return sorter;
	}

}

class CustomStringRenderer {
	constructor(props) {
		this.el = document.createElement('div');

		this.render(props);
	}

    getElement() {
        return this.el;
    }

	render(props){
		this.el.innerText = props.value;
	}
}