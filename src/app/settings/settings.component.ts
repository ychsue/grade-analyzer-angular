import { Component, OnInit } from '@angular/core';
import { DataServerService } from '../data-server.service';
import { GlobalSettings } from '../global-settings';
import { MessageService } from '../message.service';
import { AppComponent } from '../app.component';
import { dialogData, DialogComponent } from '../dialog/dialog.component';
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

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
  tmpStSubect = new Subject<string>();

  constructor(
    private dataServerService: DataServerService,
    private messageService: MessageService,
    private appComponent: AppComponent
  ) {

   }

  refreshSettings() {

    this.appComponent.setOfSpinner = {
      isActivate: true, title: '更新中', message: ''
    };
    // * [2018-01-29 11:33] Update it
    this.dataServerService.updateSettingsToServer()
    .then(
      () => this.appComponent.setOfSpinner = {
        isActivate: false, title: '完成', message: ''
      }
    );
  }

  showDialog0() {
    const data: dialogData = {
      title: '第一次使用',
      message: `由於Settings尚未有任何資料，我已自動幫你產生了一份。\n
      如不滿意，請依自己的需要修改，完畢後，請按最下面的更新鈕🔃即可更新。`,
      buttons: [
        {
          text: '了解了',
          action: (ref) => ref.close()
      }
      ]
    };
    this.appComponent.dialog.open(DialogComponent, {data: data});
    this.messageService.add('SettingsComponent.ngOnInit.saveAsync: appComponent.dialog=' + this.appComponent.dialog);
  }

  //#region  For automatically checking the existance of TempIn file
  initializeTmpStSubject(): Observable<boolean> {
    return this.tmpStSubect.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(async (term: string) => {
        this.gSettings.templateWorksheetName = term;
        return await this.dataServerService.checkWorksheetExistance(term);
      })
    );
  }
  onTempNameChanged(term: string) {
    this.tmpStSubect.next(term);
    this.messageService.add('onTmpNameChanged: ' + term);
  }
  //#endregion  For automatically checking the existance of TempIn file

  genTempIn(): void {
    this.appComponent.setOfSpinner = {isActivate: true, title: '創建樣板中', message: '請稍候'};
    this.dataServerService.createTempInSheet(this.gSettings).then(
     (iB) => {
        this.messageService.add(`settingsComponent.genTempIn:after createTempInSheet`);
        this.appComponent.setOfSpinner = {isActivate: false, title: '進行中', message: '請稍候'};
        return iB;
      }
    );
    
    setTimeout( 
      () => { 
      if(this.appComponent.setOfSpinner.isActivate===true){
        this.appComponent.setOfSpinner = {isActivate: false, title: '進行中', message: '請稍候'};
      }}
    ,10000);

  }


  ngOnInit() {
    const isSet = this.dataServerService.isSet();
    if (isSet === false) {
      this.dataServerService.updateSettingsToServer()
      .then(() => {
        setTimeout(() => {this.showDialog0(); }, 500);
      });
      this.messageService.add('SettingsComponent.ngOnInit.saveAsync: isSet=' + this.dataServerService.isSet());
    }

    // * [2018-01-30 14:38] initialize the RxJS.Subject for template worksheet's name
    this.initializeTmpStSubject().subscribe(
      isHere => {
        this.isTempSheetExist = isHere;
        this.messageService.add('template input does exist: ' + isHere);
      });
    // * [2018-01-29 17:56] Check whether the template worksheet does exist.
    // * TODO::
    this.dataServerService.checkWorksheetExistance(this.gSettings.templateWorksheetName).then(iB => this.isTempSheetExist = iB);
  }

}
