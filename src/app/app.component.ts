/// <reference path="../../node_modules/@types/office-js/index.d.ts" />

import { Component } from '@angular/core';

//declare const Excel: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
onSetColor(){
  Excel.run(async (ctx)=>{
    const range = ctx.workbook.getSelectedRange();
    range.format.fill.color = 'green';
    await ctx.sync();
  });
}
}
