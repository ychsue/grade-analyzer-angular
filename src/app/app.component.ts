/// <reference path="../../node_modules/@types/office-js/index.d.ts" />

import { Component, NgZone } from '@angular/core';
import { MatDialog,MatDialogModule } from '@angular/material';
import { DataServerService } from './data-server.service';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { MessageService } from './message.service';
import { GlobalSettings } from './global-settings';
import { PageTextsService } from './page-texts.service';

//declare const Excel: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  ngOnInit(): void {
    this.gSettings = this.dataServerService.globalSettings;
    if(this.dataServerService.isSet()){
      let times = this.dataServerService.getUsedTimes()+1;
      this.dataServerService.setUsedTimes(times)
        .then(()=>{
          if(this.gSettings.isDebugMode) this.messageService.add("AppComponent.ngOnInit: usedTimes="+times);
        });
    }
  }
  title:string = "班級成績管理小幫手";
  gSettings: GlobalSettings;
  pts:IPageTexts;

  setOfSpinner:{isActivate:boolean, title:string, message:string, mode?:string,value?:number} = {
    isActivate: false,
    title: "Running",
    message: "Please wait. It might takes a little time.",
    mode: "indeterminate",
    value: 30
  };

  updateLang(isoCode:string){
    this.ptsService.updatePageTexts(isoCode);
  }

  constructor(public dialog:MatDialog, 
    private dataServerService: DataServerService,
    private messageService: MessageService,
    public ptsService: PageTextsService,
    private zone:NgZone
  ){
        //* [2018-04-09 14:08] Initialize the pageTexts
        let self = this;
        this.pts = this.ptsService.pts;
        this.ptsService.updateStart.subscribe(()=>{
          zone.run(()=>{
            self.setOfSpinner={isActivate:true,title:"Updating Texts",message:"Updating Texts"};
          });
        });
        this.ptsService.updateEnd.subscribe((pts)=>{
          self.pts = pts;
          zone.run(()=>{
            self.setOfSpinner={isActivate:false,title:"Updating Texts",message:"Updating Texts"};
          });
        });
        this.ptsService.updatePageTexts(navigator.language);
  }

}
