import { Component, OnInit } from '@angular/core';
import { DataServerService } from '../data-server.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../message.service';
import { GlobalSettings } from '../global-settings';
import { AppComponent } from '../app.component';
import { PageTextsService } from '../page-texts.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  gSettings:GlobalSettings;

  constructor(
    private dataServerService: DataServerService,
    // private actRoute: ActivatedRoute,
    // private router: Router,
    private messageService: MessageService,
    private app: AppComponent,
    public ptsService: PageTextsService
  ) { }

  isSet: boolean = false;
  isExist: boolean = false;

  async ngOnInit() {
    //* [2018-04-09 14:06] Check whether to force the user to setup needed settings
    this.gSettings = this.dataServerService.globalSettings;
    this.isSet = this.dataServerService.isSet();
    this.isExist = (this.isSet)?await this.dataServerService.checkWorksheetExistance(this.dataServerService.globalSettings.templateWorksheetName) : false;
    if(this.isSet === false || this.isExist === false){
      if(this.gSettings.isDebugMode) this.messageService.add("WelcomeComponent.ngOnInit: "+this.isSet);
      // this.router.navigate(['/settings']);
    }
  }

}
