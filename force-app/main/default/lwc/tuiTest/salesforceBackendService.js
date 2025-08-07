//////////////////////////////////////////////
// Salesforce Backend Service
//////////////////////////////////////////////
const DEBUG = true;

function log(msg, variable){ if(DEBUG){ console.log(msg, variable === undefined ? '' : variable); } }

function referenceFields(fld) {
	let refField = '';
	const subjectObject = ['Case', 'Event', 'Task'];
	const noNameObject = ['ProcessInstance', 'ProcessInstanceWorkitem'];
	if(!noNameObject.includes(fld.objectName)){
		let nameField = subjectObject.includes(fld.objectName) ? 'Subject' : 'Name';
		if(fld.value.endsWith('Id')){
			refField = fld.value.substring(0, fld.value.length - 2) + '.' + nameField;
		} else {
			refField = fld.value.replace('__c', '__r.') + nameField;
		}	
	}
	return refField;
}

function getOperator(operator, fieldType) {
	let op = '';
	switch(operator){
		// case 'eq': op = ' = '; break;
		case 'eq': 
			if(fieldType === 'string'){
				op = ' LIKE '; 
			} else {
				op = ' = ';
			}
			break;
		case 'ne': op = ' != '; break;
		case 'lt': op = ' < '; break;
		case 'gt': op = ' > '; break;
		case 'le': op = ' <= '; break;
		case 'ge': op = ' >= '; break;
		case 'co': op = ' LIKE '; break;
		case 'nc': op = ' LIKE '; break; // NOT filedName LIKE (...)
		case 'sw': op = ' LIKE '; break;
		case 'ew': op = ' LIKE '; break;
		case 'in': op = ' IN '; break;
		case 'ni': op = ' IN '; break; // NOT fieldName IN (...)
		default: op = ' = '; break;
	}

	return op;
}

function getQuote(fld) {
	let quote = "";
	if(fld.fieldType === 'string' || fld.fieldType === 'email' || fld.fieldType === 'phone' 
		|| fld.fieldType === 'url' || fld.fieldType === 'picklist' || fld.fieldType === 'reference'){
		quote = "'";
	}
	return quote;
}

// 2024-07-15  
function getArrayDateFilterString(field, flt) {
	log('backendService getArrayDateFilterString !!!');

	let filterString = " " + flt.field + " ";

	if(flt.dateOption === 'is-Logical'){
		let logical = "";
		if(Array.isArray(flt.value)){
			logical = flt.value[0];
		} 

		// 'LAST_N_WEEKS:52' 형태의 문자열을 'LAST_N_WEEKS'로 변환, ':'가 없으면 그대로 사용
		let literalBase = logical.split(':')[0];
		this.log('getArrayDateFilterString literalBase ->', literalBase);

		const equalLiterals = [
			'YESTERDAY', 'TOMORROW', 'NEXT_WEEK', 'NEXT_MONTH', 'LAST_90_DAYS', 
			'LAST_N_DAYS', 'N_DAYS_AGO', 'LAST_N_WEEKS', 'N_WEEKS_AGO', 'LAST_N_MONTHS', 
			'N_MONTHS_AGO', 'THIS_QUARTER', 'LAST_QUARTER', 'LAST_N_QUARTERS', 'N_QUARTERS_AGO', 
			'THIS_YEAR', 'NEXT_N_YEARS', 'LAST_N_YEARS', 'N_YEARS_AGO', 'THIS_FISCAL_QUARTER', 
			'N_FISCAL_QUARTERS_AGO', 'THIS_FISCAL_YEAR', 'NEXT_N_FISCAL_YEARS', 'LAST_N_FISCAL_YEARS',
			'THIS_WEEK', 'THIS_MONTH', 'NEXT_QUARTER', 'NEXT_N_QUARTERS', 'NEXT_YEAR', 
			'NEXT_FISCAL_QUARTER', 'NEXT_FISCAL_YEAR','TODAY', 'LAST_WEEK', 'LAST_MONTH',
			'NEXT_90_DAYS', 'NEXT_N_DAYS', 'NEXT_N_WEEKS', 'NEXT_N_MONTHS', 'LAST_YEAR',
			'LAST_FISCAL_QUARTER', 'LAST_N_FISCAL_QUARTERS', 'LAST_FISCAL_YEAR'
		];

		if (equalLiterals.includes(literalBase)) {
			filterString += " = " + logical;
		} 

	} else {
		let start = "";
		let end = "";
		
		if(Array.isArray(flt.value)){
			start = new Date(flt.value[0]).toISOString();
			end = new Date(flt.value[1]).toISOString();
			if(field.fieldType === 'date'){
				start = start.substring(0, 10);
				end = end.substring(0, 10);
			}

		} 

		filterString += " >= " + start + " AND " + filterString + " <= " + end;

		log('backendService getArrayDateFilterString filterString ->', filterString);
	}

	return filterString;
}

function getDateFilterString(field, flt) {
	log('backendService getDateFilterString !!!')
	
	let quote = getQuote(field);
	let value = "";
	if(Array.isArray(flt.value)){
		value = flt.value[0];
	} else {
		value = flt.value;
	}
	value = quote + value + quote;

	let filterString = " " + flt.field + " ";
	filterString += getOperator(flt.operator, field.fieldType) + value;
	log('backendService getDateFilterString filterString ->', filterString);
	return filterString;
}

// reference type (lookup)
function getReferenceFilterString(field, flt) {
	log('backendService getReferenceFilterString !!!')

	let quote = getQuote(field);
	let value = "";
	if(Array.isArray(flt.value)){
		value = flt.value[0];
	} else {
		value = flt.value;
	}

	//////////////// RecordTypeId Error!!!!!!!!!!!!!!!!!!!!!!!!
	let filterString = " " + referenceFields(flt.field) + " ";
	filterString += " = " + quote + value + quote;
	
	log('backendService getReferenceFilterString filterString ->', filterString);
	return filterString;
}

function getArrayFilterString(field, flt) {
	log('backendService getArrayFilterString !!!');
	let quote = getQuote(field);
	let values = "";
	[...flt.value].forEach((val) => {
		values += quote + val + quote + ",";
	});
	values = "(" + values.substring(0, values.length - 1) + ")";

	let filterString = " " + flt.field + " ";
	if(flt.operator === 'ne' || flt.operator === 'nc'){
		filterString = " NOT" + filterString;
	}
	filterString += "IN " + values;

	log('backendService getArrayFilterString filterString ->', filterString);

	return filterString;
}

function getFilterString(fld, flt) {
	log('backendService getFilterString !!!');

	let quote = getQuote(fld);
	let value = "";
	if(Array.isArray(flt.value)){
		value = flt.value[0];
	} else {
		value = flt.value;
	}
	if(value !== 'none'){
		if(fld.fieldType === 'string' || fld.fieldType === 'email' || fld.fieldType === 'phone' || fld.fieldType === 'url'){
			switch(flt.operator){
				case 'co':
				case 'nc':
					value = '%' + value + '%';
					break;
				case 'sw':
					value = value + '%';
					break;
				case 'ew':
					value = '%' + value ;
					break;
				case 'eq':
					value = '%' + value + '%';
					break;
				default:
					break;
			}
		} 

		value = quote + value + quote;
	} else {
		value = "null";
	}
	let filterString = " " + flt.field + " ";
	if(flt.operator === 'nc'){
		filterString = " NOT" + filterString;
	}

	filterString += getOperator(flt.operator, fld.fieldType) + value;
	log('backendService getFilterString filterString ->', filterString);
	return filterString;
}

function buildSelect(fieldMap, columns){
	let select = 'SELECT Id, ';
	log('backendService buildSelect columns ', JSON.stringify(columns));


	if(fieldMap.RecordTypeId && ![...columns].find(column => column.name === 'RecordTypeId')){
		select += 'RecordTypeId, RecordType.Name, ';
	}
	[...columns].forEach((column) => {
		if(column.name !== 'index'){
			let fld = fieldMap[column.name];
			if(fld !== undefined){
				if(fld.fieldType !== 'reference'){
					if(fld.fieldType === 'picklist'){
						select += 'toLabel(' + fld.value + ')';
					} else if(fld.fieldType === 'date' || fld.fieldType === 'datetime'){
						// select += 'FORMAT(' + fld.value + ')';
						select += fld.value;
					} else {
						select += fld.value;
					}
				} else {
					let relatedField = referenceFields(fld);
					log('backendService buildSelect relatedField ', relatedField);
					select += fld.value;
					select += relatedField !== '' ? ', ' + relatedField : '';
				}
				if(fld.value !== columns[columns.length - 1].name){
					select += ', ';
				}	
			}
		}
	});

	return select;
}


/**
 * get date format : new Date('2024-06-11').toISOString({timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone})
 * @returns 
 */
function buildWhere4External(fieldMap, externalFilter) {
	let where = '';
	[...externalFilter].forEach((flt) => {
		// 2024-07-15 김설
		let field = fieldMap[flt.field];
		log('backendService buildWhere4External field ->', field);
		
		if(field !== undefined){
			switch(field.fieldType){
				case 'date':
				case 'datetime':
					log('backendService buildWhere4External date !!!');
					if(flt.value !== '' && (Array.isArray(flt.value) && flt.value.length > 0)){
						if(Array.isArray(flt.value) && flt.value.length > 1){
							where += getArrayDateFilterString(field, flt); 
						} 

						if (flt !== externalFilter[externalFilter.length - 1]) {
							where += ' AND ';
						}
						
					} else if(flt.value !== '' && flt.value != null && flt.value !== undefined){
						where += getDateFilterString(field, flt);

						if (flt !== externalFilter[externalFilter.length - 1]) {
							where += ' AND ';
						}
					}
					break;

				case 'reference':
					log('backendService buildWhere4External reference !!!');
					if(flt.value !== '' && (Array.isArray(flt.value) && flt.value.length > 0)){
						where += getReferenceFilterString(field, flt);
						log('backendService buildWhere4External getReferenceFilterString');

						if(flt !== externalFilter[externalFilter.length - 1]){
							where += ' AND ';
						}
					} else if(typeof flt.value === 'string'){
						log('backendService buildWhere4External getReferenceFilterString 22');
						where += getReferenceFilterString(field, flt);

						if(flt !== externalFilter[externalFilter.length - 1]){
							where += ' AND ';
						}
					}
					break;

				default:
					log('backendService buildWhere4External default !!!');
					if(flt.value !== '' && (Array.isArray(flt.value) && flt.value.length > 0)  && flt.value[0] !== 'all'){
						// let field = this.fieldMap[flt.field];
						if(Array.isArray(flt.value) && flt.value.length > 1){
							where += getArrayFilterString(field, flt);
						} else {
							where += getFilterString(field, flt);
						}
			
						if(flt !== externalFilter[externalFilter.length - 1]){
							where += ' AND ';
						}
					} else if(typeof flt.value === 'string' || typeof flt.value === 'number' || typeof flt.value === 'boolean'){
						where += getFilterString(field, flt);

						if(flt !== externalFilter[externalFilter.length - 1]){
							where += ' AND ';
						}
					}
					break;
			}	
		}
	});

	if(where.endsWith('AND ')){
		where = where.substring(0, where.length - 4);
	}
	return where;
}

function buildWhere4Internal(fieldMap, internalFilter) {
	let where = '';
	let keys = Object.keys(internalFilter);
	if(keys.length > 0){
		keys.forEach((key) => {
			let filter = internalFilter[key];
			let field = fieldMap[key];
			if(Array.isArray(filter.value) && filter.value.length > 1){
				where += this.getArrayFilterString(field, filter);
			} else {
				switch(filter.operator){
					case 'in':
						filter.operator = 'eq';
						break;
					case 'ni':
						filter.operator = 'ne';
						break;
					default:
						break;
				}
				where += getFilterString(field, filter);
			}

			if(filter !== internalFilter[keys[keys.length - 1]]){
				where += ' AND ';
			}
		});
	}

	if(where.endsWith('AND ')){
		where = where.substring(0, where.length - 4);
	}

	return where;
}

function buildSorter(fieldMap, sortInfo){
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

function buildQuery(objectName, fieldMap, columns, externalFilter, internalFilter, sortInfo, pageInfo){
	let select = buildSelect(fieldMap, columns);
		
	let where = '';
	let external = buildWhere4External(fieldMap, externalFilter);
	let internal = buildWhere4Internal(fieldMap, internalFilter);
	if(external === '' && internal === ''){
		where = '';
	} else if(external !== '' && internal !== ''){
		where = 'WHERE ' + external + ' AND ' + internal;
	} else if(external !== '' && internal === ''){
		where = 'WHERE ' + external;
	} else if(external === '' && internal !== ''){
		where = 'WHERE ' + internal;
	}
	
	let orderBy = buildSorter(fieldMap, sortInfo);

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

export { buildQuery }