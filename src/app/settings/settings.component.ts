import { Component, OnInit } from '@angular/core';
import { DataServerService } from '../data-server.service';
import { GlobalSettings } from '../global-settings';

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


  constructor(private dataServerService:DataServerService) { }

  ngOnInit() {
  }

}
