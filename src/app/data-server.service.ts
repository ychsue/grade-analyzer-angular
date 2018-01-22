import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { GlobalSettings } from './global-settings';
import { forEach } from '@angular/router/src/utils/collection';

@Injectable()
export class DataServerService {
  
  worksheetNames:string[]=[];
  
  /**
  * Get Worksheets' name
  * @returns OfficeExtension.IPromise<void>
  */
  getWorksheetNames(): OfficeExtension.IPromise<void>{
    return Excel.run(
      ctx=>{
        let worksheets = ctx.workbook.worksheets;
        worksheets.load('items');
        return ctx.sync()
        .then(
          ()=>{this.worksheetNames = ctx.workbook.worksheets.items.map(ws => ws.name);}
        )
        .then(ctx.sync);
      }
    ).catch(
      err=>{
        this.messageService.add("getWorksheetNames Error: "+err);
        if(err instanceof OfficeExtension.Error)
        this.messageService.add("Debuf Info: "+err.debugInfo);
      }
    );
  }

  //#region   For Settings
  globalSettings: GlobalSettings = new GlobalSettings();
  /**
   * Check whether settings is set
   * @returns boolean
   */
  isSet():boolean{
    let oSettings = Office.context.document.settings;
    let keys = Object.keys(this.globalSettings);
    let result =oSettings.get(keys[0]);
    if(!result)
      this.messageService.add(`initializeSettingsAsync: ${keys[0]}: ${result}`);

    return result;
  }

  /**
   * Update Global settings from Office.context.document.settings;
   * @returns GlobalSettings
   */
  updateSettingsFromServer():GlobalSettings{
    if(this.isSet()){
      let oSettings = Office.context.document.settings;
      for (const key in this.globalSettings) {
        if (this.globalSettings.hasOwnProperty(key)) {
          this.globalSettings[key] = oSettings.get(key);
        }
      }
    }
    return this.globalSettings;
  }
  
  /**
   * Update this.globalSettings to Office.context.document.settings;
   * @returns void
   */
  updateSettingsToServer():void{
    let oSettings = Office.context.document.settings;
    for (const key in this.globalSettings) {
      if (this.globalSettings.hasOwnProperty(key)) {
        const element = this.globalSettings[key];
        if(element)
          oSettings.set(key,element);
      }
    }
  }
  //#endregion   For Settings

  constructor(private messageService:MessageService) { }
  
}