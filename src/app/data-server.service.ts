import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { GlobalSettings } from './global-settings';
import { forEach } from '@angular/router/src/utils/collection';
import { resolve } from 'q';
import { ExcelHelperModule, ICellsBound } from './excel-helper/excel-helper.module';

@Injectable()
export class DataServerService {
  async clearASheet(ctx: Excel.RequestContext,sheet: Excel.Worksheet): Promise<void> {
    let buf = sheet.getUsedRangeOrNullObject(false);
    await ctx.sync();
    if(buf){
      buf.load('name, address');
      await ctx.sync();
      this.messageService.add(`data.clearASheet: ${sheet.name}.address=${buf.address}`)
      if(buf.address){
        buf.clear();
        await ctx.sync();
      }
    }
  }
  async openASheet(ctx: Excel.RequestContext,sheetName: string): Promise<Excel.Worksheet> {
    let result:Excel.Worksheet = ctx.workbook.worksheets.getItemOrNullObject(sheetName);
    //* [2018-02-23 12:07] Check whether the worksheet does exist and get it.
    await ctx.sync();
    let isSheetExist = false;
    if(result){
      result.load('name');
      await ctx.sync();
      if(result.name) isSheetExist =true;
    }
    this.messageService.add(`private data.openASheet: name=${sheetName} isSheetExist=${isSheetExist}`);
    if(isSheetExist===false){
      result = ctx.workbook.worksheets.add(sheetName);
      await ctx.sync();
    }

    return result;
  }
  private fillFormulasCAvgEtc(worksheet: Excel.Worksheet, cInfos: ImainCellsInfo, course: ICourseCellInfo): any {
    const address = ExcelHelperModule.cellsToAddress(
      [cInfos.courseBound.from[0],course.rc[1]],
      [cInfos.courseBound.to[0],course.rc[1]]
    );
    if(cInfos.cAvg){
      worksheet.getCell(cInfos.cAvg[0],course.rc[1]).formulas=[[`=AVERAGE(${address})`]];
    }
    if(cInfos.cHighest){
      worksheet.getCell(cInfos.cHighest[0],course.rc[1]).formulas=[[`=MAX(${address})`]];
    }
    if(cInfos.cLowest){
      worksheet.getCell(cInfos.cLowest[0],course.rc[1]).formulas=[[`=MIN(${address})`]];
    }
  }

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
        let witem = ctx.workbook.worksheets.getItemOrNullObject(stSheetName);
        await ctx.sync(false); //You need to synchronize witem before you use it.
        let isExist = false;
        if(witem){
          witem.load('name');
          await ctx.sync();
          isExist = (witem.name!==undefined);
        }
        this.messageService.add("dataServerService.checkWorksheetExistance: "+ isExist);
        this.messageService.add(`witem:${stSheetName}` + JSON.stringify(witem)+ '  '+witem.name);
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
              [4,'name4','','','','','','','']
            ]);
            // * [2018-02-01 15:51] Add the bottom lines
            let bufLastCell = table.getRange().getLastCell();
            bufLastCell.load('address');
            await ctx.sync();
            let nRow = ExcelHelperModule.addressToCells( bufLastCell.address).from[0];
            sheet.getCell(nRow+2,0).values =  [[gSettings.stCAvg]];
            sheet.getCell(nRow+3,0).values =  [[gSettings.stCHighest]];
            sheet.getCell(nRow+4,0).values =  [[gSettings.stCLowest]];
            sheet.getRange(ExcelHelperModule.cellsToAddress([nRow+1,0],[nRow+1,1])).values =[['5','name5']];
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
    /**
    * In fact, it is available in beta version; however, I'm not sure whether the beta one can pass the certification of Microsoft Office. Once it is available in the stable version, I'll change this method to it.
    * @param  {string} sName   : Source Worksheet name
    * @param  {string} dName?  : Destinating Worksheet name. If it is null, its name will be ${sName}_copy
    * @returns Promise<boolean>
    */
    async duplicateASheet(sName: string, dName?: string, yearSemTimes?: IYearSemTimes): Promise<boolean>{
      let run = await Excel.run(
        async ctx =>{
          // * [2018-02-07 19:18] Check whether the worksheet 'sName' does exist.
          const isSourceExist = await this.checkWorksheetExistance(sName);
          if(isSourceExist===false) return false;
          // * [2018-02-07 19:20] add the destinate worksheet
          dName = (dName)?dName:(sName+'_copy');
          let dWorksheet = ctx.workbook.worksheets.add(dName);
          dWorksheet.activate();
          // * [2018-02-07 19:24] copy data to the destinate worksheet
          const sWorksheet = ctx.workbook.worksheets.getItem(sName);
          var range = sWorksheet.getUsedRange();
          range.load('address, formulas');
          await ctx.sync();
          this.messageService.add("DEBUG range.address:"+range.address);
          var newAddress = range.address.substring(range.address.indexOf('!')+1);
          var dRange = dWorksheet.getRange(newAddress);
          dRange.formulas = range.formulas;
          await ctx.sync();
          // * [2018-02-08 18:04] copy table selection
          sWorksheet.tables.load('items');
          await ctx.sync();
          for (const item of sWorksheet.tables.items) {
            let oRange = item.getRange();
            oRange.load('address');
            await ctx.sync();
            this.messageService.add("DEBUG address:"+oRange.address);
            dWorksheet.tables.add(
              oRange.address.substring(oRange.address.indexOf('!')+1)
              , true
            );
          }
          // * [2018-02-08 18:29] copy merge
          dRange.getRow(0).merge(true);
          let titleCell = dRange.getCell(0,0);
          titleCell.format.horizontalAlignment = 'Center';
          titleCell.load('text');
          await ctx.sync();
          if(yearSemTimes){
            titleCell.values=[[(titleCell.text[0][0])
            .replace(/\$YEAR\$/g,yearSemTimes.year)
            .replace(/\$SEM\$/g,yearSemTimes.sem)
            .replace(/\$TIMES\$/g,yearSemTimes.times)
          ]];
          }
          await ctx.sync();
          // * [2018-02-11 15:46] Get startRow, endRow, startColumn, endColumn, Total, Avg, Grade, CAvg, CHighest and CLowest, respectively.
          let cInfos = await this.getMainCellsInfo(ctx, dWorksheet);
          this.messageService.add('cInfos: '+JSON.stringify(cInfos));
          let icForScore =(cInfos.total)?cInfos.total[1]:((cInfos.avg)?cInfos.avg[1]:-1);
          let addressForScore = ExcelHelperModule.cellsToAddress([cInfos.courseBound.from[0],icForScore],[cInfos.courseBound.to[0],icForScore],[true,false]);
          this.messageService.add("addressForScore:"+addressForScore);
          // * [2018-02-13 16:28] Write formulas for Total & Avg & score
          for(let ir0 = cInfos.courseBound.from[0]; ir0 <= cInfos.courseBound.to[0]; ir0++){
            let bufAddress = ExcelHelperModule.cellsToAddress([ir0,cInfos.courseBound.from[1]], [ir0,cInfos.courseBound.to[1]]);
            if(cInfos.total){
              dWorksheet.getCell(ir0,cInfos.total[1]).formulas=[[`=SUM(${bufAddress})`]];
            }
            if(cInfos.avg){
              dWorksheet.getCell(ir0,cInfos.avg[1]).formulas=[[`=AVERAGE(${bufAddress})`]];
            }
            if(cInfos.score && icForScore!==-1){
              dWorksheet.getCell(ir0,cInfos.score[1]).formulas=[[`=RANK.EQ(
                ${ExcelHelperModule.cellsToAddress([ir0,icForScore])},
                ${addressForScore}
              )`]];
            }
          }
          // * [2018-02-14 15:39] Write formulas for each courses
          for (const item of cInfos.courses) {
            this.fillFormulasCAvgEtc(dWorksheet,cInfos,item);
          }
          if(cInfos.total) this.fillFormulasCAvgEtc(dWorksheet,cInfos,{rc: cInfos.total});
          if(cInfos.avg) this.fillFormulasCAvgEtc(dWorksheet,cInfos,{rc: cInfos.avg});

          return await ctx.sync(true);
        }
      ).catch( async err => {
        this.messageService.add(`DataServerService.duplicateASheet: Error`+err);
        if(err instanceof OfficeExtension.Error)
          this.messageService.add('Debug Info: '+err.debugInfo);
        return false;
      });
      return run;
    }
    
    async getMainCellsInfo(ctx: Excel.RequestContext, worksheet: Excel.Worksheet): Promise<ImainCellsInfo>{
      worksheet.load('name');
      await ctx.sync();
      let result :ImainCellsInfo ={thisSheetName:worksheet.name, id:[-1,-1], courses:[]};
      // * [2018-02-12 11:57] GetUsedRange
      let range = worksheet.getUsedRange();
      range.load(['address','text']);
      await ctx.sync();
      const bound = ExcelHelperModule.addressToCells(range.address); // The start and end of UsedRange
      result.bound = bound;
      result.courseBound = {from:[bound.from[0],bound.from[1]], to: [bound.to[0],bound.to[1]]};
      // * [2018-02-12 12:32] Scan this range to get id, name, avg, total, score
      let isFound: boolean = false;
      for (let ir0 = bound.from[0]; ir0 <= bound.to[0]; ir0++) {
        if(isFound) break;
        for (let ic0 = bound.from[1]; ic0 <= bound.to[1]; ic0++) {
          let value = (range.text[ir0-bound.from[0]][ic0-bound.from[1]]).trim();
          if(value === this.globalSettings.stID){
            result.id = [ir0, ic0];
            if(result.courseBound.from[0]<(ir0+1)) result.courseBound.from[0] = ir0+1;
            if(result.courseBound.from[1]<(ic0+1)) result.courseBound.from[1] = ic0+1;
            isFound = true;
          } else if(value === this.globalSettings.stName){
            result.name = [ir0, ic0];
            if(result.courseBound.from[0]<(ir0+1)) result.courseBound.from[0] = ir0+1;
            if(result.courseBound.from[1]<(ic0+1)) result.courseBound.from[1] = ic0+1;
            isFound = true;
          } else if(value === this.globalSettings.stTotal){
            result.total = [ir0, ic0];
            if(result.courseBound.to[1]>(ic0-1)) result.courseBound.to[1] = ic0-1;
            isFound = true;
          } else if(value === this.globalSettings.stAvg){
            result.avg = [ir0, ic0];
            if(result.courseBound.to[1]>(ic0-1)) result.courseBound.to[1] = ic0-1;
            isFound = true;
          } else if(value === this.globalSettings.stScore){
            result.score = [ir0, ic0];
            if(result.courseBound.to[1]>(ic0-1)) result.courseBound.to[1] = ic0-1;
            isFound = true;
          } else if (isFound){
            result.courses.push({name: value, rc:[ir0, ic0]});
          } else {
            isFound = false;
          }
        }
      }
      // * [2018-02-12 15:53] Get cAvg, cHighest, cLowest
      isFound =false;
      for( let ic0 = bound.from[1]; ic0<=bound.to[1];ic0++){
        if(isFound) break;
        for(let ir0 = bound.from[0];ir0<=bound.to[0];ir0++){
          let value = range.text[ir0-bound.from[0]][ic0-bound.from[1]].trim();
          if(value === this.globalSettings.stCAvg){
            isFound = true;
            if(result.courseBound.to[0]>(ir0-1)) result.courseBound.to[0] = ir0-1;
            result.cAvg = [ir0, ic0];
          } else if (value === this.globalSettings.stCHighest){
            isFound = true;
            if(result.courseBound.to[0]>(ir0-1)) result.courseBound.to[0] = ir0-1;
            result.cHighest = [ir0,ic0];
          } else if (value === this.globalSettings.stCLowest){
            isFound = true;
            if(result.courseBound.to[0]>(ir0-1)) result.courseBound.to[0] = ir0-1;
            result.cLowest = [ir0,ic0];
          }
        }
      }

      return result;
    }

    async getGradesheets(pattern?: string):Promise<ImainCellsInfo[]>{
      return await Excel.run( async ctx =>{
        let gradesheets:ImainCellsInfo[]=[];
        // * Get all the items of Worksheets
        ctx.workbook.worksheets.load('items');
        await ctx.sync();
        let stRegexp:string;
        let sortedWords: string[];
        for (const worksheet of ctx.workbook.worksheets.items) {
          worksheet.load('name');
          await ctx.sync();
          if(!sortedWords) sortedWords = this.globalSettings.getSortedMagicWords();
          if(!stRegexp) stRegexp = this.globalSettings.getRegExpPattern();
          this.messageService.add(`DataServer.getGradesheets: ${worksheet.name}`);
          let yst = this.globalSettings.parseYearSemTimes(worksheet.name,stRegexp,sortedWords);
          if(yst){
            this.messageService.add(`DataServer.getGradesheets: ${JSON.stringify(yst)}`);
            let info = await this.getMainCellsInfo(ctx, worksheet);
            this.messageService.add(`DataServer.getGradesheets.info: ${JSON.stringify(info)}`);
            info.YearSemTimes = yst;
            gradesheets.push(info);          
          }
        }
        return gradesheets;
      }).catch( async err =>{
        this.messageService.add('getWorksheets Error: '+err);
        if (err instanceof OfficeExtension.Error)
          this.messageService.add('Debug Info:' + err.debugInfo);
        return [];
      });
    }

    async outputListsIntoWorksheet(sheetName:string,infos:ImainCellsInfo[],process?:(number,string)=>void):Promise<boolean>{
      return await Excel.run(async ctx =>{
        if(process)process(0,"開始");
        // * [2018-02-23 12:03] Open the worksheet which name is ${sheetName}
        let outputSheet = await this.openASheet(ctx, sheetName);
        // * [2018-02-23 12:32] Clear this worksheet
        await this.clearASheet(ctx, outputSheet);
        // ******************************************** TODO *******************************************
        return true;
      }).catch(async err=>{
        this.messageService.add(`data.outputListsIntoWorksheet Error: ${err}`);
        if(err instanceof OfficeExtension.Error)
          this.messageService.add(`Debug Info: ${err.debugInfo}`);
        return false;
      });
    }

    constructor(private messageService: MessageService) { }
    
  }

  export interface ImainCellsInfo{
    thisSheetName: string;
    YearSemTimes?: IYearSemTimes;
    bound?: ICellsBound;
    courseBound?: ICellsBound;
    id: [number, number];
    name?: [number, number];
    avg?: [number, number];
    total?: [number, number];
    score?: [number, number];
    cAvg?: [number, number];
    cHighest?: [number,number];
    cLowest?: [number,number];
    courses: Array<ICourseCellInfo>;
  }

  export interface ICourseCellInfo{
    name?: string,
    rc: [number, number]
  }

  export interface IYearSemTimes{
    year: string;
    sem: string;
    times: string;
  }