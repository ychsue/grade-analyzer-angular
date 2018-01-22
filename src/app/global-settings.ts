export class GlobalSettings {
    usedTimes:number;
    templateWorksheetName: string;
    stID: string;
    stName: string;
    stAvg: string;
    stTotal: string;
    stScore: string;

    constructor (gSettings?: GlobalSettings){
        this.usedTimes =(gSettings)?gSettings.usedTimes: 0;
        this.templateWorksheetName =(gSettings)?gSettings.templateWorksheetName:  "template-input";
        this.stID =(gSettings)?gSettings.stID:  "座號";
        this.stName =(gSettings)?gSettings.stName:  "姓名";
        this.stAvg =(gSettings)?gSettings.stAvg:  "平均";
        this.stTotal =(gSettings)?gSettings.stTotal:  "總分";
        this.stScore =(gSettings)?gSettings.stScore:  "績效";
    }
}
