import { Component, OnInit } from '@angular/core';
import { DataServerService } from '../data-server.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../message.service';
import { GlobalSettings } from '../global-settings';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  gSettings:GlobalSettings;

  constructor(
    private dataServerService: DataServerService,
    private actRoute: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) { }

  async ngOnInit() {
    this.gSettings = this.dataServerService.globalSettings;
    const isSet = this.dataServerService.isSet();
    const isExist = (isSet)?await this.dataServerService.checkWorksheetExistance(this.dataServerService.globalSettings.templateWorksheetName) : false;
    if(isSet === false || isExist === false){
      if(this.gSettings.isDebugMode) this.messageService.add("WelcomeComponent.ngOnInit: "+isSet);
      this.router.navigate(['/settings']);
    }
  }

}
