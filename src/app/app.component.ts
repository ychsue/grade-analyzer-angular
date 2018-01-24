/// <reference path="../../node_modules/@types/office-js/index.d.ts" />

import { Component } from '@angular/core';
import { MatDialog,MatDialogModule } from '@angular/material';

//declare const Excel: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title:string = "Welcome AppComponent";
  
  setOfSpinner = {
    isActivate: false,
    title: "Running",
    message: "Please wait. It might takes a little time."
  };

  constructor(public dialog:MatDialog){}

onSetColor(){
  Excel.run(async (ctx)=>{
    const range = ctx.workbook.getSelectedRange();
    range.format.fill.color = 'green';
    await ctx.sync();
  });
}
}
