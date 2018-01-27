import { Component, OnInit } from '@angular/core';
import { DataServerService } from '../data-server.service';
import { GlobalSettings } from '../global-settings';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  //#region   properties: 
  gSettings: GlobalSettings = this.dataServerService.globalSettings;
  tempSettings: GlobalSettings = new GlobalSettings(this.gSettings);
  //#endregion properties


  constructor(
    private dataServerService:DataServerService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    let isSet = this.dataServerService.isSet();
    if(isSet===false){
      this.dataServerService.updateSettingsToServer()
      .then(()=>{
        //* TODO: Once the settings is updated, I can do something here.
        this.messageService.add("SettingsComponent.ngOnInit.saveAsync: isSet="+this.dataServerService.isSet());
      });
    }
  }

}
