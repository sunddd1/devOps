import sf_slickGrid_bundle from '@salesforce/resourceUrl/Sf_SlickGrid';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

// declare variables for all types, this will allow us to use `Formatters.bold` instead of `Slicker.Formatters.bold`
// all Wikis are written without the `Slicker` namespace, so doing this approach is better
export const Aggregators = {};
export const BindingService = {};
export const Editors = {};
export const Enums = {};
export const Filters = {};
export const Formatters = {};
export const GroupTotalFormatters = {};
export const SortComparers = {};
export const Utilities = {};
export const GridBundle = {};

/** Load all necessary SlickGrid resources (css/scripts) */
export async function loadResources(component) {
    await loadStyle(component, `${sf_slickGrid_bundle}/styles/css/slickgrid-theme-salesforce.css`);
    await loadScript(component, `${sf_slickGrid_bundle}/slickgrid-vanilla-bundle.js`);
    Aggregators = Slicker.Aggregators;
    BindingService = Slicker.BindingService;
    Editors = Slicker.Editors;
    Enums = Slicker.Enums;
    Filters = Slicker.Filters;
    Formatters = Slicker.Formatters;
    GroupTotalFormatters = Slicker.GroupTotalFormatters;
    SortComparers = Slicker.SortComparers;
    Utilities = Slicker.Utilities;
    GridBundle = Slicker.GridBundle;
}