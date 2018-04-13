import { Component, OnInit, NgZone } from '@angular/core';
import { DataServerService } from '../data-server.service';
import { GlobalSettings } from '../global-settings';
import { MessageService } from '../message.service';
import { AppComponent } from '../app.component';
import { dialogData, DialogComponent } from '../dialog/dialog.component';
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { SpinnerComponent } from '../spinner/spinner.component';
import { PageTextsService } from '../page-texts.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  isTempSheetExist = false;
  
  //#region   properties:
  gSettings: GlobalSettings = this.dataServerService.globalSettings;
  iniSettings: GlobalSettings;
  //#endregion properties
  tmpStSubect = new Subject<string>();
  
  constructor(
    private dataServerService: DataServerService,
    private messageService: MessageService,
    public app: AppComponent,
    private ptsService: PageTextsService,
    private zone:NgZone
  ) { }
  
  refreshSettings() {
    let stRenewing =(this.app.pts)?this.app.pts.SettingsPage.renewing:"";
    let stDone =(this.app.pts)?this.app.pts.SettingsPage.done:"";

    this.app.setOfSpinner = {
      isActivate: true, title: stRenewing||'更新中', message: ''
    };
    // * [2018-01-29 11:33] Update it
    this.dataServerService.updateSettingsToServer()
    .then(
      () => {
        this.app.setOfSpinner = {isActivate: false, title: stDone||'完成', message: ''};
        this.iniSettings = new GlobalSettings(this.gSettings);
    }
  );
}

showDialog0() {
  let st1stTime =(this.app.pts)?this.app.pts.SettingsPage.firstTime:'';
  let st1stTimeMsg =(this.app.pts)?this.app.pts.SettingsPage.firstTimeMsg:'';
  let stUnderstand =(this.app.pts)?this.app.pts.SettingsPage.understand:'';
  
  const data: dialogData = {
    title: st1stTime||'第一次使用',
    message: (st1stTimeMsg||`由於Settings尚未有任何資料，我已自動幫你產生了一份。<br/>
    如不滿意，請依自己的需要修改，完畢後，請按最下面的更新鈕🔃即可更新。`),
    buttons: [
      {
        text: stUnderstand||'了解了',
        action: (ref) => ref.close()
      }
    ]
  };
  this.app.dialog.open(DialogComponent, {data: data});
  if(this.gSettings.isDebugMode) this.messageService.add('SettingsComponent.ngOnInit.saveAsync: app.dialog=' + this.app.dialog);
}

showDialog1() {
  let stUnderstand =(this.app.pts)?this.app.pts.SettingsPage.understand:'';
  let stNeedTmpTitle =(this.app.pts)?this.app.pts.SettingsPage.needTmpTitle:'';
  let stNeedTmpMsg =(this.app.pts)?this.app.pts.SettingsPage.needTmpMsg:'';

  const data: dialogData = {
    title: stNeedTmpTitle||'請先產生樣板表單',
    message: (stNeedTmpMsg||`所有的成績輸入都以樣板表單為主。請先按按鈕
    <br/>{0}<br/>
    以自動產生一份表單給你。`).replace('{0}',(this.app.pts)?this.app.pts.SettingsPage.genTmp:"➕產生"),
    buttons: [
      {
        text: stUnderstand||'了解了',
        action: (ref) => ref.close()
      }
    ]
  };
  this.app.dialog.open(DialogComponent, {data: data});
  if(this.gSettings.isDebugMode) this.messageService.add('SettingsComponent.ngOnInit.saveAsync: app.dialog=' + this.app.dialog);
}

async showDialogModify(message: string, isTempExist:boolean, isUnChanged:boolean) {
  let stNote =(this.app.pts)?this.app.pts.SettingsPage.note:'';
  let stChange =(this.app.pts)?this.app.pts.SettingsPage.change:'';
  let stUnchange =(this.app.pts)?this.app.pts.SettingsPage.unchange:'';
  let stKeepEdit =(this.app.pts)?this.app.pts.SettingsPage.keepEdit:'';


  let asyncResult :Subject<boolean> = new Subject<boolean>();
  const data: dialogData = {
    title: stNote||'注意',
    message: message,
    buttons: [
      {
        text: stChange||'變更', 
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
        text: stUnchange||'不變更',
        action: (ref) => {ref.close(); asyncResult.next(true); asyncResult.complete();}
      },{
        text: stKeepEdit||'再修改',
        action: (ref) => {ref.close(); asyncResult.next(false); asyncResult.complete();}
      }
    ]
  };
  this.app.dialog.open(DialogComponent, {data: data});
  if(this.gSettings.isDebugMode) this.messageService.add('SettingsComponent.showDialogModify');
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
  if(this.gSettings.isDebugMode) this.messageService.add('onTmpNameChanged: ' + term);
}
//#endregion  For automatically checking the existance of TempIn file

onChartNameChanged(term: string) {
  this.gSettings.chartSheetName = term;
}

async genTempIn(): Promise<void> {
  let stCreatingSample =(this.app.pts)?this.app.pts.SettingsPage.creatingSample:'';
  let stWaiting =(this.app.pts)?this.app.pts.SettingsPage.waiting:'';
  let stRunning =(this.app.pts)?this.app.pts.SettingsPage.running:'';

  this.zone.run(()=>{
    this.app.setOfSpinner = {isActivate: true ,title: stCreatingSample||'創建樣板中', message: stWaiting||'請稍候',value:30};
  });
  await this.dataServerService.createTempInSheet(this.gSettings);
  if(this.gSettings.isDebugMode) this.messageService.add(`settingsComponent.genTempIn:after createTempInSheet`);
  this.zone.run(()=>{
    this.app.setOfSpinner = {isActivate: false, title: stRunning||'進行中', message: stWaiting||'請稍候'};
  });
  
  
  
  this.isTempSheetExist = true;
  
  setTimeout( 
    () => { 
      if(this.app.setOfSpinner.isActivate===true){
        this.app.setOfSpinner = {isActivate: false, title: stRunning||'進行中', message: stWaiting||'請稍候'};
      }}
      ,10000);
      
    }
    
    
    async ngOnInit() {
      const isSet = this.dataServerService.isSet();
      if (isSet === false) {
          this.ptsService.turnGStoDefaultValue(this.gSettings);
          if(this.gSettings.isDebugMode) {          
            this.messageService.add(`SettingsComponent.ngOnInit.saveAsync: gSettings.stID= ${this.gSettings.stID} and pts.stID= ${this.ptsService.pts}`);
          } 
        await this.dataServerService.updateSettingsToServer();
        setTimeout(()=>this.showDialog0(),500); // You cannot show it immediately because it is not initialized during this ngOnInit.
        if(this.gSettings.isDebugMode) this.messageService.add(`SettingsComponent.ngOnInit.saveAsync: isSet= ${this.dataServerService.isSet()} and gSettings.stID= ${this.gSettings.stID}`);
      }
      
      this.iniSettings = new GlobalSettings(this.gSettings); //It is used to check whether it is changed.

      // * [2018-01-30 14:38] initialize the RxJS.Subject for template worksheet's name
      this.initializeTmpStSubject().subscribe(
        isHere => {
          this.isTempSheetExist = isHere;
          if(this.gSettings.isDebugMode) this.messageService.add('template input does exist: ' + isHere);
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
        let stNotExisting =(this.app.pts)?this.app.pts.SettingsPage.notExisting:'';
        let stSettingChanged =(this.app.pts)?this.app.pts.SettingsPage.settingChanged:'';
        let stWannaChange =(this.app.pts)?this.app.pts.SettingsPage.wannaChange:'';

        const isTempExist = await this.dataServerService.checkWorksheetExistance(this.gSettings.templateWorksheetName);
        if(isTempExist===false) message+= (stNotExisting||`工作表${this.gSettings.templateWorksheetName}不存在。<br/>`).replace('{0}',this.gSettings.templateWorksheetName);
        const isUnChanged = this.gSettings.isTheSame(this.iniSettings);
        if(isUnChanged===false) message+= stSettingChanged||'設定已經改變。<br/>';
        if(isUnChanged && isTempExist) {
          return true;
        }
        else{
          message+= stWannaChange||'要變更嗎？';
          return await this.showDialogModify(message,isTempExist,isUnChanged);
        }
      }
    }
    