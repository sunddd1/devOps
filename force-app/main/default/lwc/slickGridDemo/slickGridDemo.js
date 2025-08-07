/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 02-22-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
import { Editors, Filters, Formatters, GridBundle, loadResources } from 'c/slickGridHelper';

export default class SlickGridDemo extends LightningElement {
  isResourceLoaded = false;

  async connectedCallback() {
    if (this.isResourceLoaded) {
      return; // load only once
    }
    await loadResources(this);
    this.initializeGrid();
    this.isResourceLoaded = true;
  }
}