/// <reference path="../../node_modules/@types/office-js/index.d.ts" />

import { Component, NgZone } from '@angular/core';
import { MatDialog,MatDialogModule } from '@angular/material';
import { DataServerService } from './data-server.service';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { MessageService } from './message.service';
import { GlobalSettings } from './global-settings';
import { PageTextsService } from './page-texts.service';
import { LocalStorageService } from './local-storage.service';

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
    //* [2018-04-09 14:08] Initialize the pageTexts
    let self = this;
    // this.pts = this.ptsService.pts; //Might be null.
    this.ptsService.updateStart.subscribe(()=>{
      this.zone.run(()=>{
        self.setOfSpinner={isActivate:true,title:"Updating Texts",message:"Updating Texts"};
      });
    });
    this.ptsService.updateEnd.subscribe((pts)=>{
      // self.pts = pts; //Link to this.ptsService.pts (check this observable "updateEnd")
      this.zone.run(()=>{
        self.setOfSpinner={isActivate:false,title:"Updating Texts",message:"Updating Texts"};
      });
    });
    
    if(this.dataServerService.globalSettings.isDebugMode) {
      this.messageService.add(`Before app.component:updateLang`);
    }
    
    this.updateLang();    
  }
  gSettings: GlobalSettings;
  // pts:IPageTexts;
  
  setOfSpinner:{isActivate:boolean, title:string, message:string, mode?:string,value?:number} = {
    isActivate: false,
    title: "Running",
    message: "Please wait. It might takes a little time.",
    mode: "indeterminate",
    value: 30
  };
  
  updateLang(isoCode?:string){    
    if(this.dataServerService.globalSettings.isDebugMode) {
      this.messageService.add(`In app.component:updateLang: isoCode=${isoCode}, navigator=${navigator.language}`);
    }

    if(!!!isoCode) {
      isoCode = (!!this.lsService.langCode)?this.lsService.langCode:navigator.language;
    }

    if(!!this.lsService.langCode && (isoCode===this.lsService.langCode)) {
      if(!!this.ptsService.pts) {
        return;
      } else if(!!this.lsService.pageTexts){
        this.ptsService.pts = JSON.parse(this.lsService.pageTexts);
        // this.pts = this.ptsService.pts;
        if(this.dataServerService.globalSettings.isDebugMode) {
          this.messageService.add(`In app.component:updateLang after refine: isoCode=${isoCode}, pts=${this.ptsService.pts}`);
        }    
        return;
      }
    }

    this.ptsService.updatePageTexts(isoCode).subscribe(obj=>{
      this.lsService.langCode = isoCode;
      this.lsService.pageTexts = JSON.stringify(obj);
    });
  }
  
  constructor(public dialog:MatDialog, 
    private dataServerService: DataServerService,
    private messageService: MessageService,
    public ptsService: PageTextsService,
    private lsService: LocalStorageService,
    private zone:NgZone
  ){
  }
  
}
