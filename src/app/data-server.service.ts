import { Injectable, NgZone } from '@angular/core';
import { MessageService } from './message.service';
import { GlobalSettings } from './global-settings';
import { forEach } from '@angular/router/src/utils/collection';
import { resolve } from 'q';
import { ExcelHelperModule, ICellsBound } from './excel-helper/excel-helper.module';
import { ForEachStudent } from './gen-worksheet/for-each-student';
import { Igrade } from './gen-worksheet/gen-worksheet.component';
import { Subject } from "rxjs/Subject";
import { PageTextsService } from './page-texts.service';

@Injectable()
export class DataServerService {

  enumOfType = DataServerTypeEnum;

  // #region   typeOfDataServer
  private _typeOfServer: ITypeOfDataServer;
  public get typeOfDataServer(): ITypeOfDataServer {
    if(!!!this._typeOfServer){
      if (Office['context'] === undefined || Office.context['document'] === undefined){
        //* ************************************ TODO **********************************
        this._typeOfServer = {type:DataServerTypeEnum.notSupport};
      } else {
        let version =1.1;
        let versions = [1.9,1.8,1.7,1.6,1.5,1.4,1.3,1.2,1.1];
        while (versions.length > 0) {
          let nextVersion = versions.pop();
          if(Office.context.requirements.isSetSupported("ExcelApi",nextVersion)) {
            version = nextVersion;
          } else {
            break;
          }
        }
        this._typeOfServer = {type:DataServerTypeEnum.excel, version: version};
      }
    }
    return this._typeOfServer;
  }
  public set typeOfDataServer(v : ITypeOfDataServer) {
    this._typeOfServer = v;
  }
  // #endregion  typeOfDataServer

  // #region   isSupport
  private _isSupport: boolean =undefined;
  
  public get isSupport() : boolean {
    if(this._isSupport===undefined){
      let typeOfServer = this.typeOfDataServer;
      //* [2018-04-17 22:13] The Logic about whether it is supported
      // ******************************************** TODO *********************************************
      this._isSupport = typeOfServer.type===DataServerTypeEnum.excel && typeOfServer.version >=1.6; 
    }
    return this._isSupport;
  }
  
  public set isSupport(v : boolean) {
    this._isSupport = v;
  }
  // #endregion notSupport

  async copyFormat(nWidth:number,nHeight:number,ithStudent:number,sheet:Excel.Worksheet,ctx: Excel.RequestContext,operator?:Subject<[number,string]>): Promise<void> {
    for (let iW = 0; iW < nWidth;  iW++) {
      for (let iH = 0; iH < nHeight; iH++) {
        let sCell = sheet.getCell(iH,iW);
        let dCell = sheet.getCell(iH+ithStudent*nHeight,iW);
        sCell.load('format/*,format/fill,format/font,format/borders');
        await ctx.sync();
        dCell.format.set(sCell.format);
        for (const item of sCell.format.borders.items) {
          dCell.format.borders.getItem(item.sideIndex).style = item.style;
        }
        await ctx.sync();
      }  
      this.zone.run(()=>{
        operator.next([(iW+1)*100/nWidth,
          ((this.ptsService.pts)?this.ptsService.pts.dataServerService.applyOnStudentCol:`完成第{0}學生的第{1}行的套用`).replace('{0}',(ithStudent+1).toString()).replace('{1}',(iW+1).toString())]);
      });
    }
  }
  async clearASheet(ctx: Excel.RequestContext,sheet: Excel.Worksheet,clearOption?:string,isClearTable:boolean=true): Promise<void> {
    let buf = sheet.getUsedRangeOrNullObject(false);
    if(!clearOption) clearOption = Excel.ClearApplyTo.all;
    await ctx.sync();
    if(buf){
      if(this.globalSettings.isDebugMode) this.messageService.add(`data.clearASheet: ${JSON.stringify(buf)}`);
      sheet.load('name');
      buf.load('address');
      sheet.charts.load('items');
      await ctx.sync();
      if(buf.address){
        if(this.globalSettings.isDebugMode) this.messageService.add(`data.clearASheet: ${sheet.name}.address=${buf.address}`);
        if(buf.address){
          buf.clear(clearOption);
          if(isClearTable) sheet.charts.items.map(x=>x.delete());
          await ctx.sync();
        }
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
    if(this.globalSettings.isDebugMode) this.messageService.add(`private data.openASheet: name=${sheetName} isSheetExist=${isSheetExist}`);
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
        if(this.globalSettings.isDebugMode) this.messageService.add('getWorksheetNames Error: ' + err);
        if (err instanceof OfficeExtension.Error) {
          if(this.globalSettings.isDebugMode) this.messageService.add('Debuf Info: ' + err.debugInfo);
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
        if(this.globalSettings.isDebugMode) this.messageService.add("dataServerService.checkWorksheetExistance: "+ isExist);
        if(this.globalSettings.isDebugMode) this.messageService.add(`witem:${stSheetName}` + JSON.stringify(witem)+ '  '+witem.name);
        return await ctx.sync(isExist);
      }
    ).catch(
      err => {
        if(this.globalSettings.isDebugMode) this.messageService.add("checkWorksheetExistance Error: " + err);
        if(err instanceof OfficeExtension.Error)
        if(this.globalSettings.isDebugMode) this.messageService.add("Debug Info: " + err.debugInfo);
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
      if(this.globalSettings.isDebugMode) this.messageService.add(`initializeSettingsAsync: ${keys[0]}: ${result}`);
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
          if(this.globalSettings.isDebugMode) this.messageService.add("DataServerService.updateSettingsToServer:"+key+":" + element);
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
            (this.ptsService.pts)?this.ptsService.pts.dataServerService.english:'英語',
            (this.ptsService.pts)?this.ptsService.pts.dataServerService.chinese:'國文',
            (this.ptsService.pts)?this.ptsService.pts.dataServerService.math:'數學',
            (this.ptsService.pts)?this.ptsService.pts.dataServerService.science:'自然',
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
          if(this.globalSettings.isDebugMode) this.messageService.add('createTempInSheet error: '+err);
          if(err instanceof OfficeExtension.Error)
          if(this.globalSettings.isDebugMode) this.messageService.add('Debug Info: '+err.debugInfo);
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
    async duplicateASheet(sName: string, dName?: string, yearSemTimes?: IYearSemTimes): Promise<string>{
      let run = await Excel.run(
        async ctx =>{
          // * [2018-02-07 19:18] Check whether the worksheet 'sName' does exist.
          const isSourceExist = await this.checkWorksheetExistance(sName);
          if(isSourceExist===false) return ((this.ptsService.pts)?this.ptsService.pts.dataServerService.noTmpSheet:`表單{0}不存在，請到<b>設定</b>先創造它出來吧。`).replace('{0}',sName);
          // * [2018-02-07 19:20] add the destinate worksheet
          dName = (dName)?dName:(sName+'_copy');
          let dWorksheet = ctx.workbook.worksheets.add(dName);
          dWorksheet.activate();
          // * [2018-02-07 19:24] copy data to the destinate worksheet
          const sWorksheet = ctx.workbook.worksheets.getItem(sName);
          var range = sWorksheet.getUsedRange();
          range.load('address, formulas');
          await ctx.sync();
          if(this.globalSettings.isDebugMode) this.messageService.add("DEBUG range.address:"+range.address);
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
            if(this.globalSettings.isDebugMode) this.messageService.add("DEBUG address:"+oRange.address);
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
        if(this.globalSettings.isDebugMode) this.messageService.add('cInfos: '+JSON.stringify(cInfos));
        let icForScore =(cInfos.total)?cInfos.total[1]:((cInfos.avg)?cInfos.avg[1]:-1);
        let addressForScore = ExcelHelperModule.cellsToAddress([cInfos.courseBound.from[0],icForScore],[cInfos.courseBound.to[0],icForScore],[true,false]);
        if(this.globalSettings.isDebugMode) this.messageService.add("addressForScore:"+addressForScore);
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
        await ctx.sync();
        return '';
      }
    ).catch( async err => {
      if(this.globalSettings.isDebugMode) this.messageService.add(`DataServerService.duplicateASheet: Error`+err);
      if(err instanceof OfficeExtension.Error)
      if(this.globalSettings.isDebugMode) this.messageService.add('Debug Info: '+err.debugInfo);
      return JSON.stringify(err);
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
    // * [2018-02-26 11:24] Output IDs' string Array
    if(result.id){
      let buf =worksheet.getRange(ExcelHelperModule.cellsToAddress([result.courseBound.from[0],result.id[1]],[result.courseBound.to[0],result.id[1]]));
      buf.load('text');
      await ctx.sync();
      result.IdArray = buf.text.map(x=>x[0]);
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
        if(this.globalSettings.isDebugMode) this.messageService.add(`DataServer.getGradesheets: ${worksheet.name}`);
        let yst = this.globalSettings.parseYearSemTimes(worksheet.name,stRegexp,sortedWords);
        if(yst){
          if(this.globalSettings.isDebugMode) this.messageService.add(`DataServer.getGradesheets: ${JSON.stringify(yst)}`);
          let info = await this.getMainCellsInfo(ctx, worksheet);
          if(this.globalSettings.isDebugMode) this.messageService.add(`DataServer.getGradesheets.info: ${JSON.stringify(info)}`);
          info.YearSemTimes = yst;
          gradesheets.push(info);          
        }
      }
      return gradesheets;
    }).catch( async err =>{
      if(this.globalSettings.isDebugMode) this.messageService.add('getWorksheets Error: '+err);
      if (err instanceof OfficeExtension.Error)
      if(this.globalSettings.isDebugMode) this.messageService.add('Debug Info:' + err.debugInfo);
      return [];
    });
  }
  
  async outputListsIntoWorksheet(sheetName:string,grade:Igrade,infos:ImainCellsInfo[],tInfo:ImainCellsInfo,pInfo:ImainCellsInfo, process?:Subject<[number,string]>):Promise<boolean>{
    return await Excel.run(async ctx =>{
      if(process) await process.next([0,
        (this.ptsService.pts)?this.ptsService.pts.dataServerService.start:"開始"]);
      // * [2018-02-23 12:03] Open the worksheet which name is ${sheetName}
      let outputSheet = await this.openASheet(ctx, sheetName);
      const tableSheetNameForChart = `${sheetName}_${grade.name}`;
      let tableSheetForChart = await this.openASheet(ctx,tableSheetNameForChart);
      outputSheet.activate();await ctx.sync();
      let thisSheet = await this.openASheet(ctx,tInfo.thisSheetName);
      // * [2018-02-23 12:32] Clear this worksheet
      await this.clearASheet(ctx, outputSheet,Excel.ClearApplyTo.contents);
      await this.clearASheet(ctx,tableSheetForChart);
      let tInfos = infos.slice();
      tInfos = tInfos.reverse();
      // * [2018-02-26 11:13] Get all ids
      let allSheets:{info:ImainCellsInfo,ids:string[]}[]=[];
      // * [2018-02-26 11:41] Initialize for-each-student
      let eachInfo = new ForEachStudent(tInfo,2,1,1);
      // * [2018-02-28 17:39] Update globalSettings
      this.globalSettings.iRowChart=eachInfo.nTableRows-1;
      this.globalSettings.iRowSpecial=eachInfo.nTableRows-2;
      this.globalSettings.nH=eachInfo.nTotalRows;
      this.updateSettingsToServer();
      // * [2018-02-27 11:47] Output table head into tableSheetForChart
      let titles:string[] = [(this.ptsService.pts)?this.ptsService.pts.dataServerService.timesID:`成績表單➡\nID⬇`];
      tInfos.reduce((pre,cur)=>{pre.push(cur.thisSheetName); return pre;},titles);
      tableSheetForChart.getRange(ExcelHelperModule.cellsToAddress([0,0],[0,tInfos.length])).values=[titles];
      // * [2018-02-27 12:12] Get all columns for the grade you want.
      let cCols:number[]=[];
      for (const info of tInfos) {
        if(grade.name==this.globalSettings.stAvg){
          if(info.avg) cCols.push(info.avg[1]);
          else cCols.push(NaN);
        } else if(grade.name==this.globalSettings.stTotal){
          if(info.total) cCols.push(info.total[1]);
          else cCols.push(NaN);
        } else if(grade.name==this.globalSettings.stScore){
          if(info.score) cCols.push(info.score[1]);
          else cCols.push(NaN);
        } else {
          let cI =info.courses.find(x=>grade.name==x.name);
          if(cI) cCols.push(cI.rc[1]);
          else cCols.push(NaN);
        }
        continue;
      }
      // * [2018-02-26 12:47] Scan all students' id in tInfo 'this-info'
      if(!tInfo.IdArray) return false;
      let headArray:string[][];
      let ithStudent =0;
      for (const id of tInfo.IdArray) {
        // ** [2018-02-27 12:02] For tableSheetForChart
        let eachStudentBuf:string[]=[id];
        for (let i0:number =0;i0<tInfos.length;i0++) {
          const info = tInfos[i0];
          let IdRow = info.IdArray.indexOf(id);
          let formular ='a';
          if(IdRow>=0){
            IdRow += info.id[0]+1;
            formular = `=${info.thisSheetName}!${ExcelHelperModule.cellsToAddress([IdRow,cCols[i0]])}`;
          }
          eachStudentBuf.push(formular);
        }
        tableSheetForChart.getRange(ExcelHelperModule.cellsToAddress([ithStudent+1,0],[ithStudent+1,tInfos.length])).formulas=[eachStudentBuf];
        // ** [2018-02-26 12:59] Write in the head
        let startRow = ithStudent*eachInfo.nTotalRows;
        if(!headArray) {
          let buf = thisSheet.getRange(ExcelHelperModule.cellsToAddress([0,0],[eachInfo.nHHead-1,tInfo.bound.to[1]]));
          buf.load('text');
          await ctx.sync();
          headArray = buf.text;
        }
        outputSheet.getRange(ExcelHelperModule.cellsToAddress([startRow,0],[startRow+eachInfo.nHHead-1,tInfo.bound.to[1]])).values = headArray;
        await ctx.sync();
        // ** [2018-02-26 14:15] Write in ID, Name, etc....
        let topTableRow = startRow+eachInfo.nHHead;
        let currentRow = topTableRow; //Initialize it
        let currentColumn =0;
        currentRow +=2;
        let bufRange = outputSheet.getRange(ExcelHelperModule.cellsToAddress([currentRow,0],[currentRow+4,0]));
        bufRange.values =[
          [this.globalSettings.stCAvg],
          [this.globalSettings.stCHighest],
          [this.globalSettings.stCLowest],
          [((this.ptsService.pts)?this.ptsService.pts.dataServerService.compare:`比較：{0}`).replace('{0}',pInfo.thisSheetName)],
          [this.globalSettings.stSpecial]
        ];
        currentRow = topTableRow; //Initialize it
        if(tInfo.id){
          outputSheet.getCell(currentRow++,currentColumn).values=[[this.globalSettings.stID]];
          outputSheet.getCell(currentRow,currentColumn).values=[[id]];
          currentRow = topTableRow; //Initialize it
          currentColumn++;
        }
        const tIdRow = tInfo.IdArray.indexOf(id)+tInfo.courseBound.from[0];
        const pIdRow = pInfo.IdArray.indexOf(id)+pInfo.courseBound.from[0];
        if(tInfo.name){
          outputSheet.getCell(currentRow++,currentColumn).values=[[this.globalSettings.stName]];
          outputSheet.getCell(currentRow,currentColumn).formulas=[[`=${tInfo.thisSheetName}!${ExcelHelperModule.cellsToAddress([tIdRow,tInfo.name[1]])}`]];
          currentRow = topTableRow; //Initialize it
          currentColumn++;
        }
        
        let inputAColumn = async (name:string,tCol:number,pCol?:number,isHide:boolean=false,isLessThan:boolean=true) =>{
          outputSheet.getCell(currentRow++,currentColumn).values=[[name]];
          outputSheet.getCell(currentRow++,currentColumn).formulas=[[`=${tInfo.thisSheetName}!${ExcelHelperModule.cellsToAddress([tIdRow,tCol])}`]];
          // *** [2018-02-26 15:27]CAvg, CHighest, CLowest & previous
          if(isHide===false){
            outputSheet.getCell(currentRow++,currentColumn).formulas=[[`=${tInfo.thisSheetName}!${ExcelHelperModule.cellsToAddress([tInfo.cAvg[0],tCol])}`]];                        
            outputSheet.getCell(currentRow++,currentColumn).formulas=[[`=${tInfo.thisSheetName}!${ExcelHelperModule.cellsToAddress([tInfo.cHighest[0],tCol])}`]];                        
            outputSheet.getCell(currentRow++,currentColumn).formulas=[[`=${tInfo.thisSheetName}!${ExcelHelperModule.cellsToAddress([tInfo.cLowest[0],tCol])}`]];
          } else{
            currentRow+=3;
          }
          if(pCol>=0){
            outputSheet.getCell(currentRow++,currentColumn).formulas=[[`=${pInfo.thisSheetName}!${ExcelHelperModule.cellsToAddress([pIdRow,pCol])}`]];
            let cell =outputSheet.getCell(topTableRow+1,currentColumn);
            // cell.values=[["aaa"]];
            let cFormat = cell.conditionalFormats.add(Excel.ConditionalFormatType.cellValue);
            cFormat.cellValue.format.fill.color =`#aaaaaa`;
            let operator:string =(isLessThan)?Excel.ConditionalCellValueOperator.lessThan:Excel.ConditionalCellValueOperator.greaterThan;
            cFormat.cellValue.set ({
              rule: {formula1:`=${ExcelHelperModule.cellsToAddress([currentRow-1,currentColumn])}`,
                operator: operator}
            });
            await ctx.sync();
          }
          currentColumn++;            
        }
        // ** [2018-02-26 15:17] For all courses
        for (const course of tInfo.courses) {
          currentRow = topTableRow; //Initialize it
          let pCol = pInfo.courses.findIndex(x=>x.name===course.name); //Next line will get its true value
          if(pCol>=0) pCol = pInfo.courses[pCol].rc[1];
          await inputAColumn(course.name,course.rc[1],pCol);
        }
        // #region ** [2018-02-26 15:34] For Avg, Score and Total
        if(tInfo.avg){
          currentRow = topTableRow; //Initialize it
          let pCol = (pInfo.avg)?pInfo.avg[1]:NaN;
          await inputAColumn(this.globalSettings.stAvg,tInfo.avg[1],pCol);
        }
        if(tInfo.total){
          currentRow = topTableRow; //Initialize it
          let pCol = (pInfo.total)?pInfo.total[1]:NaN;
          await inputAColumn(this.globalSettings.stTotal,tInfo.total[1],pCol);
        }
        if(tInfo.score){
          currentRow = topTableRow; //Initialize it
          let pCol = (pInfo.score)?pInfo.score[1]:NaN;
          await inputAColumn(this.globalSettings.stScore,tInfo.score[1],pCol,true,false);
        }
        // #endregion ** [2018-02-26 15:34] For Avg, Score and Total

        // ** [2018-02-26 16:28] Draw a chart
        let specialH:number =50;
        outputSheet.getRange(`${currentRow+1}:${currentRow+1}`).format.rowHeight = specialH;
        outputSheet.getRange(`${currentRow+2}:${currentRow+2}`).format.rowHeight = eachInfo.suggestedChartHeight({specialH:specialH});
        let chart = outputSheet.charts.add(Excel.ChartType.lineMarkers,tableSheetForChart.getRange(
          // `${ExcelHelperModule.cellsToAddress([0,1],[0,tInfos.length])},${ExcelHelperModule.cellsToAddress([ithStudent+1,1],[ithStudent+1,tInfos.length])}`
          `${ExcelHelperModule.cellsToAddress([ithStudent+1,1],[ithStudent+1,tInfos.length])}`
        ),Excel.ChartSeriesBy.rows);
        chart.legend.visible=false;
        chart.setPosition(outputSheet.getCell(currentRow+1,0),outputSheet.getCell(currentRow+1,eachInfo.nWidth-1));
        chart.title.text=grade.name;
        await ctx.sync();

        // * [2018-03-01 12:13] Draw borders
        bufRange = outputSheet.getRange(ExcelHelperModule.cellsToAddress([topTableRow,0],[topTableRow+eachInfo.nTableRows-eachInfo.nHSeparate-eachInfo.nHHead-1,eachInfo.nWidth-1]));
        bufRange.format.borders.getItem(Excel.BorderIndex.edgeLeft).style = Excel.BorderLineStyle.continuous;
        bufRange.format.borders.getItem(Excel.BorderIndex.edgeRight).style = Excel.BorderLineStyle.continuous;
        bufRange.format.borders.getItem(Excel.BorderIndex.edgeBottom).style = Excel.BorderLineStyle.continuous;
        bufRange.format.borders.getItem(Excel.BorderIndex.edgeTop).style = Excel.BorderLineStyle.continuous;        
        bufRange.format.borders.getItem(Excel.BorderIndex.insideHorizontal).style = Excel.BorderLineStyle.continuous;
        bufRange.format.borders.getItem(Excel.BorderIndex.insideVertical).style = Excel.BorderLineStyle.continuous;
        // * [2018-03-01 12:35] Color the title
        bufRange = outputSheet.getRange(ExcelHelperModule.cellsToAddress([topTableRow,0],[topTableRow,eachInfo.nWidth-1]));
        bufRange.format.font.bold=true;
        bufRange.format.fill.color='#ffff00';
        // * [2018-03-01 12:36] Borders for Special one
        let iSpec = this.globalSettings.iRowSpecial+ithStudent*this.globalSettings.nH;
        bufRange = outputSheet.getRange(ExcelHelperModule.cellsToAddress([iSpec,2],[iSpec,eachInfo.nWidth-1]));
        bufRange.format.borders.getItem(Excel.BorderIndex.insideVertical).style = Excel.BorderLineStyle.none;

        if(process) this.zone.run(()=>{ process.next([(ithStudent+1)*100/tInfo.IdArray.length,
          ((this.ptsService.pts)?this.ptsService.pts.dataServerService.output2IDDone:`輸出ID={0} 完成`).replace('{0}',id)]);});

        ithStudent++;
      }

      // * [2018-02-27 15:08] Try to format tableSheetForChart
      for (let i0:number=0;i0<tInfos.length;i0++) {
        let range = tableSheetForChart.getRange(ExcelHelperModule.cellsToAddress([1,i0+1],[ithStudent+1,i0+1]));
        let cFormat= range.conditionalFormats.add(Excel.ConditionalFormatType.colorScale);
        cFormat.load("colorScale, colorScale.criteria");
        await ctx.sync();
        let criteria = cFormat.colorScale.criteria;
        cFormat.colorScale.set({criteria: {
          maximum:{type:"HighestValue", color:"#FFFF00"}
          ,minimum: {type: "LowestValue", color: "#FF0000"}
          // ,midpoint: {type: "Percentile", color: "#888800"}
        }});
        await ctx.sync();
        // criteria.maximum.color="#00FF00";
        // criteria.minimum.color="#FF0000";
        if(this.globalSettings.isDebugMode) {this.messageService.add(`maximum=${criteria.maximum.color}&minimum=${criteria.minimum.color}`); }
      }

      return true;
    }).catch(async err=>{
      if(this.globalSettings.isDebugMode) this.messageService.add(`data.outputListsIntoWorksheet Error: ${err}`);
      if(err instanceof OfficeExtension.Error)
      if(this.globalSettings.isDebugMode) this.messageService.add(`Debug Info: ${err.debugInfo}`);
      return false;
    });
  }
 
  async apply1stFormatToAll(sheetName:string,studentNum:number,operator:Subject<[number, string]>):Promise<string>{
    return await Excel.run(async ctx=>{
      let sheet = ctx.workbook.worksheets.getItemOrNullObject(sheetName);
      if(sheet){
        sheet.load('name');
        await ctx.sync();
        if(!sheet.name) return ((this.ptsService.pts)?this.ptsService.pts.dataServerService.noSheet:`{0} 不存在，請先產生它`).replace('{0}',sheetName);
      }
      let bufRange = sheet.getUsedRange();
      bufRange.load('rowCount, columnCount');
      await ctx.sync();
      let nW = bufRange.columnCount;

      let nH=Math.ceil(bufRange.rowCount/studentNum);;
      for (let i0 =1; i0 < studentNum; i0++) { 
          await this.copyFormat(nW,nH,i0,sheet,ctx,operator);
          this.zone.run(
          ()=>{operator.next([(i0+1)*100/studentNum,
            ((this.ptsService.pts)?this.ptsService.pts.dataServerService.completeIthStu:`完成第{0}位成績`).replace('{0}',(i0+1).toString())]);});
      }
      return "";
    }).catch(async err =>{
      if(this.globalSettings.isDebugMode) this.messageService.add(`data.apply1stFormatToAll Error: ${err}`);
      if(err instanceof OfficeExtension.Error)
      if(this.globalSettings.isDebugMode) this.messageService.add(`Debug Info: ${err.debugInfo}`);
      return err.debugInfo;
    });
  }

  async inputValuesIntoARange(sheetName:string,address:{from:[number,number],to?:[number,number]},value:string[][],isFormula:boolean=false){
    return await Excel.run(async ctx =>{
      let sheet = await this.openASheet(ctx,sheetName);
      let range = sheet.getRange(ExcelHelperModule.cellsToAddress(address.from,address.to));
      if(isFormula) range.formulas =value;
      else range.values = value;
      await ctx.sync();
    }).catch(async err=>{
      if(this.globalSettings.isDebugMode) this.messageService.add(`data.inputValuesIntoARange Error: ${err}`);
      if(err instanceof OfficeExtension.Error){
        if(this.globalSettings.isDebugMode) this.messageService.add(`Debug Info: ${err.debugInfo}`);
      }
    });
  }

  async apply1stRowHeight2Whole(sheetName:string,nRows:number,operator?:Subject<[number,string]>):Promise<void>{
    return await Excel.run(async ctx=>{
      let sheet = await this.openASheet(ctx, sheetName);
      // * [2018-03-01 10:49] Get number of all Rows
      let range = sheet.getUsedRange();
      range.load('rowCount');
      await ctx.sync();
      let nTotal = range.rowCount;
      // * [2018-03-01 10:50] Scan for all rows
      for (let iRow = 0; iRow < nRows; iRow++) {
        this.zone.run(()=>{
          if(operator) operator.next([100*(iRow+1)/nRows,
            ((this.ptsService.pts)?this.ptsService.pts.dataServerService.applyingOnRow:`套用第{0}行中`).replace('{0}',(iRow+1).toString())]);
        });
        let oRow = sheet.getCell(iRow,iRow);
        oRow.load(`format/rowHeight`);
        await ctx.sync();
        let height = oRow.format.rowHeight;
        for (let iStu=0; iStu<nTotal/nRows;iStu++){
          let newRow = sheet.getCell(iStu*nRows+iRow,0);
          newRow.format.rowHeight = height;
        }
        await ctx.sync();
      }
    }).catch(async err =>{
      if(this.globalSettings.isDebugMode) this.messageService.add(`data.apply1stRowHeight2Whole Error: ${err}`);
      if(err instanceof OfficeExtension.Error){
        if(this.globalSettings.isDebugMode) this.messageService.add(`Debug Info: ${err.debugInfo}`);
      }
    });
  }

  constructor(private messageService: MessageService, private zone:NgZone, private ptsService:PageTextsService) { }
  
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
  IdArray?: string[];
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

export interface ITypeOfDataServer{
  type: DataServerTypeEnum, 
  version?: number
}

export enum DataServerTypeEnum{
  notSupport,
  excel
}