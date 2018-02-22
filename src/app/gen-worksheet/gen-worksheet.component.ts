import { Component, OnInit } from '@angular/core';
import { trigger, transition, animate, style, state } from "@angular/animations";
import { MessageService } from '../message.service';
import { DataServerService, ImainCellsInfo } from '../data-server.service';
import { GlobalSettings } from '../global-settings';
import { AppComponent } from '../app.component';
import { DialogComponent, dialogData } from '../dialog/dialog.component';

@Component({
  selector: 'app-gen-worksheet',
  animations: [
    trigger('fadeInOut', [
      state('*', style({'overflow-y': 'hidden'})),
      state('void',style({'overflow-y': 'hidden'})),
      transition('* => void',[
        style({height: '*'}),
        animate(250, style({height: 0}))
      ]),
      transition('void => *',[
        style({height: 0}),
        animate(250,style({height: '*'}))
      ])
    ])
  ],
  templateUrl: './gen-worksheet.component.html',
  styleUrls: ['./gen-worksheet.component.css']
})
export class GenWorksheetComponent implements OnInit {

  backToGenGradeSheet(): void {
    this.currentGen = typeOfGen.newWorksheet;
    const data: dialogData={
      title: `沒有任何成績表單`,
      message: `請至少先產生並且輸入一份成績表單才能繼續你想進行的動作。`,
      buttons: [{action: ref=>ref.close(), text: '了解了'}]
    };
    this.appComponent.dialog.open(DialogComponent,{
      data: data
    });
  }
  //#region for typeOfGen
  // As mentioned in https://www.gurustop.net/blog/2016/05/24/how-to-use-typescript-enum-with-angular2/
  // this line is used for template html
  public typeOfGen = typeOfGen; 
  public _currentGen:typeOfGen;
  public set currentGen(v : typeOfGen) {
    this._currentGen = v;
    if(v==typeOfGen.newCharts){
      this.updateAllGradeSheetsInfo().then(v=>{this.gradesInfo=v});
    }
  }
  public get currentGen() : typeOfGen {
    return this._currentGen;
  }
  //#endregion for typeOfGen  

  gsettings:GlobalSettings = this.dataServerService.globalSettings;
  newSheetName:string;
  gradesInfo: ImainCellsInfo[];

  //#region 1. Generate New Grade Sheet
  updateNewSheetName(){
    this.newSheetName = this.dataServerService.globalSettings.eachSheet
    .replace('\$YEAR\$',this.dataServerService.globalSettings.new_year)
    .replace('\$SEM\$',this.dataServerService.globalSettings.new_sem)
    .replace('\$TIMES\$',this.dataServerService.globalSettings.new_times);
  }

  async genNewSheet(): Promise<void> {
    this.appComponent.setOfSpinner = {isActivate: true, title: '創建新表單中', message: '請稍候'};
    let isSuccess = await this.dataServerService.duplicateASheet(this.gsettings.templateWorksheetName,this.newSheetName,
      {year:this.gsettings.new_year, sem:this.gsettings.new_sem, times:this.gsettings.new_times});
        if(isSuccess===false){
          const data: dialogData ={
            title: '產生新表單失敗',
            message: `很可能因為表單 <em>${this.newSheetName}</em> 已經存在，導致你不能再造出該表單來。`,
            buttons: [{text: '了解了', action: (ref)=> ref.close()}] 
          };
          this.appComponent.dialog.open(DialogComponent,
            {data:data});
        } else {
          this.dataServerService.updateSettingsToServer();
        }
        this.appComponent.setOfSpinner = {isActivate: false, title: '進行中', message: '請稍候'};

  }
  //#endregion 1. Generate New Grade Sheet
  
  //#region 2. Generate New Chart Sheet
  public thisTimeGrade: ImainCellsInfo;
  public previousTimeGrade: ImainCellsInfo;
  async updateAllGradeSheetsInfo():Promise<ImainCellsInfo[]>{
    let infos = await this.dataServerService.getGradesheets();
    infos = infos.sort((a,b)=>{
      let cmp :number = a.YearSemTimes.year.localeCompare(b.YearSemTimes.year);
      if(cmp !== 0){
        return -cmp; //Minus for L->S
      } else{
        cmp = a.YearSemTimes.sem.localeCompare(b.YearSemTimes.sem);
        if(cmp!==0){
          return -cmp; //Minus for L->S
        } else{
          cmp = a.YearSemTimes.times.localeCompare(b.YearSemTimes.times);
          return -cmp; //Minus for L->S
        }
      }
    });
    if(infos.length>0){ 
      this.thisTimeGrade = infos[0];
      this.previousTimeGrade = (infos.length>1)?infos[1]:infos[0];
    } else{
      this.backToGenGradeSheet();
    }
    return infos;
  }
  //#endregion 2. Generate New Chart Sheet
  constructor(private messageService:MessageService, private dataServerService: DataServerService, private appComponent: AppComponent) { }

  ngOnInit() {
    this.updateNewSheetName();
  }

}

enum typeOfGen{
  newWorksheet,
  newCharts
}