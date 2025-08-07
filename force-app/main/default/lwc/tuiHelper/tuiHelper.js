import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import tuigrid from '@salesforce/resourceUrl/tuigrid';

export const tui = {};

export function loadHelper(component) {
	try {
		Promise.all([
			loadStyle(component, `${tuigrid}/addons/checkboxCss.css`),
			loadStyle(component, `${tuigrid}/addons/tui-pagination/dist/tui-pagination.css`),
			loadStyle(component, `${tuigrid}/addons/tui-date-picker/dist/tui-date-picker.css`),
			loadStyle(component, `${tuigrid}/addons/tui-time-picker/dist/tui-time-picker.css`),
			loadScript(component, `${tuigrid}/addons/tui-pagination/dist/tui-pagination.js`),
			loadScript(component, `${tuigrid}/addons/tui-time-picker/dist/tui-time-picker.js`),
			loadScript(component, `${tuigrid}/addons/tui-date-picker/dist/tui-date-picker.js`),
			loadScript(component, `${tuigrid}/package/dist/tui-grid.js`),
			loadStyle(component, `${tuigrid}/package/dist/tui-grid.css`)
		
		]).then(() => {
		// 	loadScript(component, `${tuigrid}/package/dist/tui-grid.js`);
		// 	loadStyle(component, `${tuigrid}/package/dist/tui-grid.css`);
		// }).then(() => {
			tui = window.tui;
		});
	} catch(e){
		console.error('tuiHelper: Error loading helper -> ', e);
	}
}