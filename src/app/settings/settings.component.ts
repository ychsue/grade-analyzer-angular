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
  btGenTmpText = '➕產生樣板表單？';

  //#region   properties:
  gSettings: GlobalSettings = this.dataServerService.globalSettings;
  iniSettings: GlobalSettings;
  //#endregion properties
  tmpStSubect = new Subject<string>();

  constructor(
    private dataServerService: DataServerService,
    private messageService: MessageService,
    private appComponent: AppComponent
  ) { }

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
      message: `由於Settings尚未有任何資料，我已自動幫你產生了一份。<br/>
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

  showDialog1() {
    const data: dialogData = {
      title: '請先產生樣板表單',
      message: `所有的成績輸入都以樣板表單為主。請先按按鈕
      <br/>'${this.btGenTmpText}'<br/>
      以自動產生一份表單給你。`,
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

  async showDialogModify(message: string, isTempExist:boolean, isUnChanged:boolean) {
    let asyncResult :Subject<boolean> = new Subject<boolean>();
    const data: dialogData = {
      title: '注意',
      message: message,
      buttons: [
        {
          text: '變更', 
          action: async (ref) => {
            if(isTempExist===false){
              await this.genTempIn();
            }
            if(isUnChanged===false){
              this.refreshSettings();
            }
            ref.close(); asyncResult.next(true); asyncResult.complete();
          }
        },{
          text: '不變更',
          action: (ref) => {ref.close(); asyncResult.next(true); asyncResult.complete();}
        },{
          text: '再修改',
          action: (ref) => {ref.close(); asyncResult.next(false); asyncResult.complete();}
        }
      ]
    };
    this.appComponent.dialog.open(DialogComponent, {data: data});
    this.messageService.add('SettingsComponent.showDialogModify');
    return await asyncResult.toPromise();
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

  async genTempIn(): Promise<void> {
    this.appComponent.setOfSpinner = {isActivate: true, title: '創建樣板中', message: '請稍候'};
    await this.dataServerService.createTempInSheet(this.gSettings);
        this.messageService.add(`settingsComponent.genTempIn:after createTempInSheet`);
        this.appComponent.setOfSpinner = {isActivate: false, title: '進行中', message: '請稍候'};
      
    

    this.isTempSheetExist = true;

    setTimeout( 
      () => { 
      if(this.appComponent.setOfSpinner.isActivate===true){
        this.appComponent.setOfSpinner = {isActivate: false, title: '進行中', message: '請稍候'};
      }}
    ,10000);

  }


  async ngOnInit() {
    this.iniSettings = new GlobalSettings(this.gSettings); //It is used to check whether it is changed.
    const isSet = this.dataServerService.isSet();
    if (isSet === false) {
      await this.dataServerService.updateSettingsToServer();
      setTimeout(()=>this.showDialog0(),500); // You cannot show it immediately because it is not initialized during this ngOnInit.
      this.messageService.add('SettingsComponent.ngOnInit.saveAsync: isSet=' + this.dataServerService.isSet());
    }

    // * [2018-01-30 14:38] initialize the RxJS.Subject for template worksheet's name
    this.initializeTmpStSubject().subscribe(
      isHere => {
        this.isTempSheetExist = isHere;
        this.messageService.add('template input does exist: ' + isHere);
      });
    // * [2018-01-29 17:56] Check whether the template worksheet does exist.
    const iB =await this.dataServerService.checkWorksheetExistance(this.gSettings.templateWorksheetName);
    this.isTempSheetExist = iB;
    if(isSet===true && iB===false){
      setTimeout(()=>this.showDialog1(),500);
    }
  }

  async canDeactivate() {
    let message :string ='';
    const isTempExist = await this.dataServerService.checkWorksheetExistance(this.gSettings.templateWorksheetName);
    if(isTempExist===false) message+= `工作表${this.gSettings.templateWorksheetName}不存在。<br/>`;
    const isUnChanged = this.gSettings.isTheSame(this.iniSettings);
    if(isUnChanged===false) message+= '設定已經改變。<br/>';
    if(isUnChanged && isTempExist) {
      return true;
    }
    else{
      message+='要變更嗎？';
      return await this.showDialogModify(message,isTempExist,isUnChanged);
    }
  }
}
