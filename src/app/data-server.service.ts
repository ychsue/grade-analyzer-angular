import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { GlobalSettings } from './global-settings';
import { forEach } from '@angular/router/src/utils/collection';
import { resolve } from 'q';

@Injectable()
export class DataServerService {
  //#region   WorkSheetNames
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

  checkWorksheetExistance(stSheetName: string):OfficeExtension.IPromise<boolean>{
    return Excel.run(
      async ctx =>{
        let witem = ctx.workbook.worksheets.getItem(stSheetName);
        await ctx.sync(false); //You need to synchronize witem before you use it.

        let isExist = (witem=={})?false:true;    
        this.messageService.add("dataServerService.checkWorksheetExistance: "+isExist);
        this.messageService.add(`witem:${stSheetName}`+JSON.stringify(witem));
        return ctx.sync(isExist);
      }
    ).catch(
      err =>{
        this.messageService.add("checkWorksheetExistance Error: "+err);
        if(err instanceof OfficeExtension.Error)
        this.messageService.add("Debug Info: "+err.debugInfo);
        return false;
      }
    );
  }
  //#endregion   WorkSheetNames

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
    if(result===null){
      this.messageService.add(`initializeSettingsAsync: ${keys[0]}: ${result}`);
      result = false;
    }else{
      result = true;
    }
    return result;
  }

  getUsedTimes():number{
    let times =0;
    if(this.isSet()){
      times = this.updateSettingsFromServer().usedTimes;
    }else{
      times = 0;
    }
    return times;
  }

  setUsedTimes(num: number): Promise<any>{
    this.globalSettings.usedTimes = num;
    return this.updateSettingsToServer();
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
  updateSettingsToServer():Promise<any>{
    let oSettings = Office.context.document.settings;
    for (const key in this.globalSettings) {
      if (this.globalSettings.hasOwnProperty(key)) {
        const element = this.globalSettings[key];
        if(element!=null){
          oSettings.set(key,element);
          this.messageService.add("DataServerService.updateSettingsToServer:"+key+":"+element);
        }
      }
    }
    return new Promise(
      (res,rej)=>{return oSettings.saveAsync(res);}
    );
  }
  //#endregion   For Settings

  constructor(private messageService:MessageService) { }
  
}