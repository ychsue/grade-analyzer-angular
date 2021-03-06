import { Component, OnInit, NgZone } from '@angular/core';
import { MessageService } from '../message.service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { DataServerService, ImainCellsInfo } from '../data-server.service';
import { AppComponent } from '../app.component';
import { DialogComponent, dialogData } from '../dialog/dialog.component';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { PageInfo } from '../page-info';
import { ForEachStudent } from '../gen-worksheet/for-each-student';
import { PageTextsService } from '../page-texts.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  /**
  * You can use it to create a table for tutorial
  * Gotten from https://docs.microsoft.com/en-us/office/dev/add-ins/tutorials/excel-tutorial-create-table
  * @returns void
  */
  createTable():void{
    Excel.run( (ctx)=>{
      const currentWorksheet = ctx.workbook.worksheets.getActiveWorksheet();
      const expensesTable = currentWorksheet.tables.add("A1:D1",true);
      //* [2018-01-18 09:20] Add in data
      expensesTable.name = "ExpensesTable";
      expensesTable.getHeaderRowRange().values=[["Date","Merchant","Category","Amount"]];
      expensesTable.rows.add(null,[
        ["1/1/2017","The phone Company", "Communications",120],
        ["1/2/2017", "Northwind Electric Cars", "Transportation", "142.33"],
        ["1/5/2017", "Best For You Organics Company", "Groceries", "27.9"],
        ["1/10/2017", "Coho Vineyard", "Restaurant", "33"],
        ["1/11/2017", "Bellows College", "Education", "350.1"],
        ["1/15/2017", "Trey Research", "Other", "135"],
        ["1/15/2017", "Best For You Organics Company", "Groceries", "97.88"]
      ]);
      //* [2018-01-18 09:21] Format them
      expensesTable.getRange().format.autofitColumns();
      expensesTable.getRange().format.autofitRows();
      expensesTable.columns.getItemAt(3).getRange().numberFormat=[['€#,##0.00']];
      return ctx.sync();
    }
  ).catch(err=>{
    this.messageService.add("createTable Error: "+err);
    if(err instanceof OfficeExtension.Error){
      this.messageService.add(
        "Debug info: "+JSON.stringify(err.debugInfo)
      );
    }
  });
}


/**
* Used to filter the exist table, Gotten from 
* https://docs.microsoft.com/en-us/office/dev/add-ins/tutorials/excel-tutorial-filter-and-sort-table 
* @returns void
*/
filterTable():void{
  Excel.run( ctx =>{
    const currentWorksheet = ctx.workbook.worksheets.getActiveWorksheet();
    const expensesTable = currentWorksheet.tables.getItem("ExpensesTable");
    const categoryFilter = expensesTable.columns.getItem('Category').filter;
    categoryFilter.applyValuesFilter(["Education","Groceries"]);
    return ctx.sync();
  }
).catch( err =>{
  this.messageService.add("filterTable Error: "+err);
  if(err instanceof OfficeExtension.Error)
  this.messageService.add(
    "Debug info: "+JSON.stringify(err.debugInfo)
  )
})
}
/**
* Used to sort the exist table, Gotten from
* https://docs.microsoft.com/en-us/office/dev/add-ins/tutorials/excel-tutorial-filter-and-sort-table
* @returns void
*/
sortTable():void{
  Excel.run( 
    ctx =>{
      const currentWorksheet = ctx.workbook.worksheets.getActiveWorksheet();
      const expensesTable = currentWorksheet.tables.getItem("ExpensesTable");
      const sortFields :Excel.SortField[] =[
        {key: 1, ascending: false}
      ];
      expensesTable.sort.apply(sortFields);
      return ctx.sync();
    }  
  ).catch(
    err =>{
      this.messageService.add("sortTable Error: "+err);
      if(err instanceof OfficeExtension.Error)
      this.messageService.add("Debug info: "+JSON.stringify(err.debugInfo));
    }
  ); 
}
/**
* Create a chart. Gotten from 
* https://docs.microsoft.com/en-us/office/dev/add-ins/tutorials/excel-tutorial-create-chart
* @returns void
*/
createChart():void{
  Excel.run(
    ctx  => {
      const currentWorksheet = ctx.workbook.worksheets.getActiveWorksheet();
      const expensesTable = currentWorksheet.tables.getItem("ExpensesTable");
      const dataRange =expensesTable.getDataBodyRange();
      //* [2018-01-18 11:24] Add a chart
      let chart = currentWorksheet.charts.add(Excel.ChartType._3DColumnClustered,dataRange,Excel.ChartSeriesBy.auto);
      //* [2018-01-18 11:27] Plot
      chart.setPosition("A15","F30");
      chart.title.text="Expenses";
      chart.legend.position = "right";
      chart.legend.format.fill.setSolidColor("white");
      chart.dataLabels.format.font.size = 15;
      chart.dataLabels.format.font.color = "black";
      chart.series.getItemAt(0).name = 'Value in €';
      return ctx.sync();
    }
  ).catch(
    err =>{
      this.messageService.add("createChart Error: "+err);
      if(err instanceof OfficeExtension.Error)
      this.messageService.add("Debug Info: "+JSON.stringify(err.debugInfo));
    }
  )
}
/**
* Freeze the header. Gotten from
* https://docs.microsoft.com/en-us/office/dev/add-ins/tutorials/excel-tutorial-freeze-header
* @returns void
*/
freezeHeader():void{
  Excel.run(
    ctx=>{
      const currentWorksheet = ctx.workbook.worksheets.getActiveWorksheet();
      let buf:any = currentWorksheet;
      let a12 = buf.getCell(12,1);
      a12.values=[["12"]];
      buf.freezePanes.freezeRows(1);
      return ctx.sync();
    }
  ).catch(
    err =>{
      this.messageService.add("freezeHeader Error: "+err);
      if(err instanceof OfficeExtension.Error)
      this.messageService.add("Debug Info: "+err.debugInfo);
    }
  );
}

getWorksheetNames(){
  this.dataServerService.getWorksheetNames().then( ()=>
  this.dataServerService.worksheetNames.forEach(wsName => this.messageService.add("Worksheet Name: "+wsName))
);
}

isSet(){
  this.dataServerService.isSet();
}

showWindowConfirm(message?: string){
  window.confirm(message || 'Is it OK?');
}

changeAppTitle(){
  this.ptsService.pts.appPage.title = Date();
}

showSpinner(){
  let setOfSpinner = this.app.setOfSpinner;
  setOfSpinner.isActivate = true;
  setOfSpinner.title = "測試";
  setOfSpinner.message = Date();
  setTimeout(()=>setOfSpinner.isActivate=false,3000);
}

showDialog(){
  let data: dialogData={
    title: "Dialog",
    message: "Dialog message",
    buttons:[
      {
        text: "OK",
        action: (ref) =>{
          ref.close(true);
          this.messageService.add(JSON.stringify(data));
        }
      },
      {
        text: "Close",
        action: (ref) =>{
          ref.close(false);
          this.messageService.add(JSON.stringify(data));
        }
      }

    ]
  };
  let dialogRef = this.app.dialog.open(
    DialogComponent,
    {
      data: data
    }
  );
  dialogRef.afterClosed().subscribe(result =>{
    this.messageService.add('The dialog was closed'+result);
  });
}

setAndGetSettings(){
  Office.context.document.settings.set("abc",3);
  let val = Office.context.document.settings.get("abc");
  this.messageService.add("test.setAndGetSettings: "+val);
}

checkExistanceOfTempSheet(){
  this.messageService.add("Check Existance: ");
  this.dataServerService.checkWorksheetExistance(
    this.dataServerService.globalSettings.templateWorksheetName
  ).then(
    (isExist)=>{
      this.messageService.add("Existance: "+isExist);
    }
  ).catch(
    (err)=> this.messageService.add("Error Existance: "+err)
  );
}

genTempIn(): void {
  this.app.setOfSpinner = {isActivate: true, title: '創建樣板中', message: '請稍候'};
  this.dataServerService.createTempInSheet(this.dataServerService.globalSettings).then(
   (iB) => {
      this.messageService.add(`settingsComponent.genTempIn:after createTempInSheet`);
      this.app.setOfSpinner = {isActivate: false, title: '進行中', message: '請稍候'};
      return iB;
    }
  );
  
  setTimeout(() => {
    if(this.app.setOfSpinner.isActivate===true)
      this.app.setOfSpinner = {isActivate: false, title: '進行中', message: '請稍候'};  
  }, 10000);

}

async duplicateASheet():Promise<void>{
  await this.dataServerService.duplicateASheet(this.dataServerService.globalSettings.templateWorksheetName, 'Happy',{year:'2017',sem:'2',times:'1st'});
  this.messageService.add("testComponent.duplcateASheet: "+this.dataServerService.globalSettings.templateWorksheetName);
}

checkGradeSheetName(stName:string): void{
  this.messageService.add(`Before: Year_Sem_Times`);  
  // let yst = await this.dataServerService.globalSettings.getSortedMagicWords(); //PASS
  // let yst = await this.dataServerService.globalSettings.getRegExpPattern(); //PASS
  let yst = this.dataServerService.globalSettings.parseYearSemTimes(stName); //PASS
  this.messageService.add(`Year_Sem_Times= ${JSON.stringify(yst)}`);
}

async getGradeSheets():Promise<void>{
  let dt = Date.now();
  let infos = await this.dataServerService.getGradesheets();
  this.messageService.add(`test.getGradeSheets: `+JSON.stringify(infos));
  this.messageService.add(`test.getGradeSheets: delta t=+${(Date.now()-dt)/1000}`);
}

async openASheet(stName:string):Promise<Excel.Worksheet>{
  return await Excel.run(async ctx=>{
    return await this.dataServerService.openASheet(ctx,stName);
  });
}

async clearAsheet(stName:string):Promise<any>{
  return await Excel.run(async ctx =>{
    let sheet = await this.dataServerService.openASheet(ctx,stName);
    let cell = sheet.getCell(1,0);
    cell.load('format');
    await ctx.sync();
    this.messageService.add(`cell's height=${cell.format.rowHeight}, width=${cell.format.columnWidth}`);
    return await this.dataServerService.clearASheet(ctx,sheet);
  });
}

testPageInfo(){
  let info:ImainCellsInfo={"thisSheetName":"106_2_1","id":[2,0],"courses":[{"name":"英語","rc":[2,2]},{"name":"國文","rc":[2,3]},{"name":"數學","rc":[2,4]},{"name":"自然","rc":[2,5]}],"bound":{"from":[0,0],"to":[10,8]},"courseBound":{"from":[3,2],"to":[7,5]},"name":[2,1],"avg":[2,6],"total":[2,7],"score":[2,8],"cAvg":[8,0],"cHighest":[9,0],"cLowest":[10,0],"IdArray":["1","2","3","4","5"]};
  let eachInfo = new ForEachStudent(info);
  this.messageService.add(JSON.stringify(eachInfo));
  this.messageService.add('Height='+eachInfo.suggestedChartHeight({}));
}

updatePageTexts(isoCode:string){
  console.log(isoCode);
  this.app.ptsService.updatePageTexts(isoCode);
}

constructor(public messageService: MessageService, private dataServerService:DataServerService,
  public app:AppComponent, public ptsService: PageTextsService) { }
  
  ngOnInit() {
    this.messageService.add("TestComponent.ngOnInit");
  }
  
}
