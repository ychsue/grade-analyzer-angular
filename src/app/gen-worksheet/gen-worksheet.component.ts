import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message.service';
import { DataServerService } from '../data-server.service';
import { GlobalSettings } from '../global-settings';
import { AppComponent } from '../app.component';
import { DialogComponent, dialogData } from '../dialog/dialog.component';

@Component({
  selector: 'app-gen-worksheet',
  templateUrl: './gen-worksheet.component.html',
  styleUrls: ['./gen-worksheet.component.css']
})
export class GenWorksheetComponent implements OnInit {

  // As mentioned in https://www.gurustop.net/blog/2016/05/24/how-to-use-typescript-enum-with-angular2/
  // this line is used for template html
  public typeOfGen = typeOfGen; 
  public currentGen:typeOfGen;

  gsettings:GlobalSettings = this.dataServerService.globalSettings;
  newSheetName:string;

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

  
  constructor(private messageService:MessageService, private dataServerService: DataServerService, private appComponent: AppComponent) { }

  ngOnInit() {
    this.updateNewSheetName();
  }

}

enum typeOfGen{
  newWorksheet,
  newCharts
}