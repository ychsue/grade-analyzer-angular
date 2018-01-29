import { Component, OnInit } from '@angular/core';
import { DataServerService } from '../data-server.service';
import { GlobalSettings } from '../global-settings';
import { MessageService } from '../message.service';
import { AppComponent } from '../app.component';
import { dialogData, DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  isTempSheetExist = false;

  //#region   properties: 
  gSettings: GlobalSettings = this.dataServerService.globalSettings;
  //#endregion properties


  constructor(
    private dataServerService:DataServerService,
    private messageService: MessageService,
    private appComponent: AppComponent
  ) { }

  refreshSettings(){
    this.appComponent.setOfSpinner = {
      isActivate: true, title:"更新中",message:""
    };
    //* [2018-01-29 11:33] Update it
    this.dataServerService.updateSettingsToServer()
    .then(
      () => this.appComponent.setOfSpinner = {
        isActivate: false, title:"完成",message:""
      }  
    )
  }

  showDialog0(){
    let data: dialogData ={
      title: "第一次使用",
      message: `由於Settings尚未有任何資料，我已自動幫你產生了一份。\n
      如不滿意，請依自己的需要修改，完畢後，請按最下面的更新鈕🔃即可更新。`,
      buttons: [
        {
          text:"了解了",
          action: (ref)=>ref.close()
      }
      ]
    };
    this.appComponent.dialog.open(DialogComponent,{data:data});
    this.messageService.add("SettingsComponent.ngOnInit.saveAsync: appComponent.dialog="+this.appComponent.dialog);
  }

  ngOnInit() {
    let isSet = this.dataServerService.isSet();
    if(isSet===false){
      this.dataServerService.updateSettingsToServer()
      .then(()=>{
        setTimeout(()=> {this.showDialog0()},500);
      });
      this.messageService.add("SettingsComponent.ngOnInit.saveAsync: isSet="+this.dataServerService.isSet());
    }

    //* [2018-01-29 17:56] Check whether the template worksheet does exist.
    //* TODO::
    this.dataServerService.checkWorksheetExistance(this.gSettings.templateWorksheetName).then(iB => this.isTempSheetExist = iB);
  }

}
