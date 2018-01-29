import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message.service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { DataServerService } from '../data-server.service';
import { AppComponent } from '../app.component';
import { DialogComponent, dialogData } from '../dialog/dialog.component';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

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

showWindowConfirm(message: string){
  window.confirm(message || 'Is it OK?');
}

changeAppTitle(){
  this.appComponent.title = Date();
}

showSpinner(){
  let setOfSpinner = this.appComponent.setOfSpinner;
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
  let dialogRef = this.appComponent.dialog.open(
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

constructor(public messageService: MessageService, private dataServerService:DataServerService,
  private appComponent:AppComponent) { }
  
  ngOnInit() {
    this.messageService.add("TestComponent.ngOnInit");
  }
  
}
