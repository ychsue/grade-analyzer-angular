import { Component, OnInit, NgZone } from '@angular/core';
import { trigger, transition, animate, style, state } from "@angular/animations";
import { MessageService } from '../message.service';
import { DataServerService, ImainCellsInfo } from '../data-server.service';
import { GlobalSettings } from '../global-settings';
import { AppComponent } from '../app.component';
import { DialogComponent, dialogData } from '../dialog/dialog.component';
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SpinnerComponent } from '../spinner/spinner.component';
import { PageTextsService } from '../page-texts.service';

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
      title: (this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.noGradeTitle:`沒有任何成績表單`,
      message: (this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.noGradeMsg:`請至少先產生並且輸入一份成績表單才能繼續你想進行的動作。`,
      buttons: [{action: ref=>ref.close(), text: (this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.gotIt:'了解了'}]
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
    this.zone.run(()=>{
      this.appComponent.setOfSpinner = {isActivate: true, title: (this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.createNewSheet:'創建新表單中', 
      message: (this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.waiting:'請稍候',value:30};
    });
    let msg = await this.dataServerService.duplicateASheet(this.gsettings.templateWorksheetName,this.newSheetName,
      {year:this.gsettings.new_year, sem:this.gsettings.new_sem, times:this.gsettings.new_times});
      
    if(msg && msg!=''){
        const data: dialogData ={
          title: (this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.failGenSheetTitle:'產生新表單失敗',
          message: ((this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.faliGenSheetMsg:`很可能因為表單 <em>{0}</em> 已經存在，導致你不能再造出該表單來。<br/>
          error: {1}`).replace('{0}',this.newSheetName).replace('{1}',msg),
          buttons: [{text: (this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.gotIt:'了解了', action: (ref)=> ref.close()}] 
        };
        this.appComponent.dialog.open(DialogComponent,{data:data});
    } else {
        this.dataServerService.updateSettingsToServer();
    }
    this.zone.run(()=>{
      this.appComponent.setOfSpinner = {isActivate: false, title: (this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.running:'進行中', 
      message: (this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.waiting:'請稍候'};
    });        
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
        let operator = new Subject<[number, string]>();
        operator.subscribe(value=>{
          this.appComponent.setOfSpinner ={title:(this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.creatingNewChart:"創建圖表中",
          message:value[1],isActivate:true,mode:"determinate",value:value[0]};
        });
        // * [2018-02-22 19:20] Saving the name of the sheet for charts
        await this.dataServerService.updateSettingsToServer();
        // * [2018-02-22 19:21] Open the chart
        this.appComponent.setOfSpinner ={title:(this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.creatingNewChart:"創建圖表中",
        message:(this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.inCreating:'創建中',
        isActivate:true,mode:"indeterminate",value:30};
        await this.dataServerService.outputListsIntoWorksheet(this.gsettings.chartSheetName,this.chosenGrade,this.gradesInfo,this.thisTimeGrade,this.previousTimeGrade,operator);    
        operator.complete();
        this.appComponent.setOfSpinner ={title:(this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.doneNewChart:"完成創建圖表",
        message:"DONE",isActivate:false,mode:"indeterminate",value:0};    
      }
      //#endregion 2. Generate New Chart Sheet
      
      _tmpStSpecialSubject:Subject<string> = new Subject<string>();
      async updateStSpecial(stSpecial:string){
        this._tmpStSpecialSubject.next(stSpecial.trim());
      }
      
      async applyFormat():Promise<void>{
        let operator = new Subject<[number, string]>();
        operator.subscribe(value=>{
          this.appComponent.setOfSpinner ={title:(this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.applyingFormat:"套用格式中",
          message:value[1],isActivate:true,mode:"determinate",value:value[0]};      
        });
        this.appComponent.setOfSpinner ={title:(this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.applyingFormat:"套用格式中",
        message:(this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.applying:'套用中',isActivate:true,mode:"indeterminate",value:30};
        let msg = await this.dataServerService.apply1stFormatToAll(this.gsettings.chartSheetName,this.gradesInfo[0].IdArray.length,
          operator);
          this.appComponent.setOfSpinner ={title:(this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.done:"完成",
          message:'Done',isActivate:false,mode:"indeterminate",value:0};
          operator.complete();
          if(msg){
            this.showDialogChartSheetDoesNotExist(msg);
          }
        }
        
        async applyRowHeight():Promise<void>{
          let operator = new Subject<[number,string]>();
          operator.subscribe(x=>{
            this.appComponent.setOfSpinner = {title:(this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.applyingHeight:`套用列高中`,message:x[1],isActivate:true,mode:SpinnerComponent.modeStrings.det,value:x[0]};
          });
          await this.dataServerService.apply1stRowHeight2Whole(this.gsettings.chartSheetName,this.gsettings.nH,operator);
          operator.complete();
          this.appComponent.setOfSpinner = {title:(this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.done:`Done`,
          message:'Done',isActivate:false,mode:SpinnerComponent.modeStrings.indet,value:30};
        }
        
        showDialogChartSheetDoesNotExist(msg:string){
          let data:dialogData ={
            title: ((this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.mayNotExistSheet:`表單 <b>{0}</b> <br/>可能不存在`).replace('{0}',this.gsettings.chartSheetName),
            message: `${msg}`,
            buttons: [{action: ref=>{ref.close();}, text:(this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.gotIt:"了解了"}]
          };
          this.appComponent.dialog.open(DialogComponent,{data: data});
        }
        
        async updateSpecialWords(){
          let isExist = await this.dataServerService.checkWorksheetExistance(this.gsettings.chartSheetName);
          if (isExist===false){
            this.showDialogChartSheetDoesNotExist(((this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.notExistSheet:`{0} 表單不存在`).replace('{0}',this.gsettings.chartSheetName));
            return;
          }
          // * [2018-02-28 18:39] Get student numbers
          let nStudents = this.thisTimeGrade.IdArray.length;
          for (let i0 = 0; i0 < nStudents; i0++) {
            this.zone.run(()=>{
              this.appComponent.setOfSpinner = {title:((this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.applying2Student:`套用至第{0}學生`).replace('{0}',(i0+1).toString()),
              message:(this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.applying:`套用中`,isActivate:true};
            });
            await this.dataServerService.inputValuesIntoARange(this.gsettings.chartSheetName,{
              from:[this.gsettings.iRowSpecial+i0*this.gsettings.nH,0] // TODO
            },
            [[this.gsettings.stSpecial]]);  // TODO
          }
          this.zone.run(()=>{
            this.appComponent.setOfSpinner = {title:(this.ptsService.pts)?this.ptsService.pts.GenWorksheetPage.done:`Done`,
            message:`Finish`,isActivate:false};
          });
        }
        
        constructor(
          private messageService:MessageService, 
          private dataServerService: DataServerService,
          private appComponent: AppComponent, 
          public ptsService: PageTextsService,
          private zone: NgZone) { }
        
        ngOnInit() {
          this.updateNewSheetName();
          this._tmpStSpecialSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
          ).subscribe(async st=>{
            this.gsettings.stSpecial=st;
            await this.dataServerService.updateSettingsToServer();
          });
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