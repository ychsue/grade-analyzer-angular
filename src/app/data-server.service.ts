import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { GlobalSettings } from './global-settings';
import { forEach } from '@angular/router/src/utils/collection';
import { resolve } from 'q';
import { ExcelHelperModule } from './excel-helper/excel-helper.module';

@Injectable()
export class DataServerService {
  //#region   WorkSheetNames
  worksheetNames: string[]= [];
  
  /**
  * Get Worksheets' name
  * @returns OfficeExtension.IPromise<void>
  */
  getWorksheetNames(): OfficeExtension.IPromise<void>{
    return Excel.run(
      ctx => {
        const worksheets = ctx.workbook.worksheets;
        worksheets.load('items');
        return ctx.sync()
        .then(
          () => {this.worksheetNames = ctx.workbook.worksheets.items.map(ws => ws.name);}
        )
        .then(ctx.sync);
      }
    ).catch(
      err => {
        this.messageService.add('getWorksheetNames Error: ' + err);
        if (err instanceof OfficeExtension.Error) {
          this.messageService.add('Debuf Info: ' + err.debugInfo);
        }
      }
    );
  }
  
  checkWorksheetExistance(stSheetName: string):OfficeExtension.IPromise<boolean>{
    return Excel.run(
      async ctx =>{
        let witem = ctx.workbook.worksheets.getItem(stSheetName);
        await ctx.sync(false); //You need to synchronize witem before you use it.
        
        let isExist = (witem=={})?false:true;    
        this.messageService.add("dataServerService.checkWorksheetExistance: "+ isExist);
        this.messageService.add(`witem:${stSheetName}` + JSON.stringify(witem));
        return await ctx.sync(isExist);
      }
    ).catch(
      err => {
        this.messageService.add("checkWorksheetExistance Error: " + err);
        if(err instanceof OfficeExtension.Error)
        this.messageService.add("Debug Info: " + err.debugInfo);
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
    if(result === null){
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
        if(element != null){
          oSettings.set(key,element);
          this.messageService.add("DataServerService.updateSettingsToServer:"+key+":" + element);
        }
      }
    }
    return new Promise(
      (res,rej) => {return oSettings.saveAsync(res); }
    );
  }
  //#endregion   For Settings
  
  //#region   For Template input Worksheet
  createTempInSheet(gSettings: GlobalSettings, callback?: Function) : OfficeExtension.IPromise<boolean>{
    return Excel.run(
      async ctx => {
        const isSet = await this.checkWorksheetExistance(gSettings.templateWorksheetName).then((iB)=>iB);
        if(isSet === false){
          const sheet = ctx.workbook.worksheets.add(gSettings.templateWorksheetName);
          sheet.activate();
          // * [2018-01-31 18:17] Title
          sheet.getRange('A1:I1').merge(true);
          sheet.getCell(0,0).format.horizontalAlignment='Center';
          sheet.getCell(0,0).values=[[gSettings.stTitle]];
          // * [2018-01-31 18:17] Courses
          const table = sheet.tables.add(
            ExcelHelperModule.cellsToAddress([2,0],[2,8]),
            true
          );
          table.name = 'grades';
          table.getHeaderRowRange()
          .values =[[gSettings.stID,
            gSettings.stName,
            '英語',
            '國文',
            '數學',
            '自然',
            gSettings.stAvg,
            gSettings.stTotal,
            gSettings.stScore]];
            // * [2018-02-01 15:19] Each student
            table.rows.add(null /*add at the end*/,
              [[1,'name1','','','','','','',''],
              [2,'name2','','','','','','',''],
              [3,'name3','','','','','','',''],
              [4,'name4','','','','','','',''],
              [5,'name5','','','','','','',''],
            ]);
            // * [2018-02-01 15:51] Add the bottom lines
            table.rows.add(null,
              [[gSettings.stCAvg   ,'','','','','','','',''],
              [gSettings.stCHighest,'','','','','','','',''],
              [gSettings.stCLowest ,'','','','','','','','']]
            );
          }
          await ctx.sync();
          if(callback){
            callback();
            await ctx.sync();
          }
          return true;
        }
      ).catch(
        err => {
          this.messageService.add('createTempInSheet error: '+err);
          if(err instanceof OfficeExtension.Error)
          this.messageService.add('Debug Info: '+err.debugInfo);
          return false;
        }
      );
      
    }
    //#endregion   For Template input Worksheet
    
    constructor(private messageService: MessageService) { }
    
  }