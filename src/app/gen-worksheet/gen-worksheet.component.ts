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

  updateGrades(): void {
    // * [2018-02-22 15:49] Initialize
    this.grades =[];
    // * [2018-02-22 15:52] Get its values
    let t = this.thisTimeGrade;
    let p = this.previousTimeGrade;
    let gs = this.dataServerService.globalSettings;
    // ** [2018-02-22 16:07] Get total, avg and score
    if(t.total && t.total[0]>=0){
      this.grades.push({name:gs.stTotal,thisRC:t.total,prevRC:(p&&p.total)?p.total:null});
    }
    if(t.avg && t.avg[0]>=0){
      this.grades.push({name:gs.stAvg,thisRC:t.avg,prevRC:(p&&p.avg)?p.avg:null});
    }
    if(t.score && t.score[0]>=0){
      this.grades.push({name:gs.stScore,thisRC:t.score,prevRC:(p&&p.score)?p.score:null});
    }
    // ** [2018-02-22 16:08] Get all courses
    for (const c of t.courses) {
      let pCourse = (p.courses)?p.courses.find(x=> c.name ==x.name):null;
      this.grades.push({name:c.name,thisRC:c.rc,prevRC:pCourse.rc});
    }

    if(this.grades.length>0)
      this.chosenGrade = this.grades[0];
  }

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
      this.updateAllGradeSheetsInfo().then(v=>{
        this.gradesInfo=v;
        this.updateGrades();
      });
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
  //#region 2.1 Define thisTimeGrade and PreviousTimeGrade
  public thisTimeGrade: ImainCellsInfo;  
  // public set thisTimeGrade(v : ImainCellsInfo) {
  //   this._thisTimeGrade = v;
  //   this.updateGrades();
  // }
  // public get thisTimeGrade() : ImainCellsInfo {
  //   return this._thisTimeGrade;
  // }

  public previousTimeGrade: ImainCellsInfo;
  // public set previousTimeGrade(v : ImainCellsInfo) {
  //   this._previousTimeGrade = v;
  //   this.updateGrades();
  // }
  // public get previousTimeGrade() : ImainCellsInfo {
  //   return this._previousTimeGrade;
  // }
  //#endregion 2.1 Define thisTimeGrade and PreviousTimeGrade

  public chosenGrade:Igrade;
  public grades:Igrade[];
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

  async genChartSheet():Promise<void>{
    // * [2018-02-22 19:20] Saving the name of the sheet for charts
    await this.dataServerService.updateSettingsToServer();
    // * [2018-02-22 19:21] Open the chart
    this.appComponent.setOfSpinner ={title:"創建圖表中",message:'創建中',isActivate:true,mode:"indeterminate",value:30};
    await this.dataServerService.outputListsIntoWorksheet(this.gsettings.chartSheetName,this.chosenGrade,this.gradesInfo,this.thisTimeGrade,this.previousTimeGrade,
    async (percent,stInfo)=>{
      this.appComponent.setOfSpinner ={title:"創建圖表中",message:stInfo,isActivate:true,mode:"determinate",value:percent};
    });    
    this.appComponent.setOfSpinner ={title:"完成創建圖表",message:"DONE",isActivate:false,mode:"indeterminate",value:0};    
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

export interface Igrade{
  name:string,
  thisRC:[number,number],
  prevRC?:[number,number]
}