export class GlobalSettings {
    usedTimes:number;
    templateWorksheetName: string;
    stID: string;
    stName: string;
    stAvg: string;
    stTotal: string;
    stScore: string;
    stTitle: string;
    stCAvg: string;
    stCHighest: string;
    stCLowest: string;
    eachSheet: string;

    //For newest worksheet name
    new_year: string;
    new_sem: string;
    new_times: string;

    constructor (gSettings?: GlobalSettings){
        this.usedTimes =(gSettings)?gSettings.usedTimes: 0;
        this.templateWorksheetName =(gSettings)?gSettings.templateWorksheetName:  "temp_in";
        this.stID =(gSettings)?gSettings.stID:  "座號";
        this.stName =(gSettings)?gSettings.stName:  "姓名";
        this.stAvg =(gSettings)?gSettings.stAvg:  "平均";
        this.stTotal =(gSettings)?gSettings.stTotal:  "總分";
        this.stScore =(gSettings)?gSettings.stScore:  "績效";
        this.stTitle =(gSettings)?gSettings.stTitle:  "$YEAR$學年度 學期$SEM$ 第$TIMES$次考試";
        this.stCAvg =(gSettings)?gSettings.stCAvg:  "各科平均";
        this.stCHighest =(gSettings)?gSettings.stCHighest:  "最高分";
        this.stCLowest =(gSettings)?gSettings.stCLowest:  "最低分";
        this.eachSheet =(gSettings)?gSettings.eachSheet:  "\$YEAR\$_\$SEM\$_\$TIMES\$";

        this.new_year = (gSettings)?gSettings.new_year:'106';
        this.new_sem = (gSettings)?gSettings.new_sem:'2';
        this.new_times =(gSettings)?gSettings.new_times:'1';
    }

    isTheSame(compared: GlobalSettings): boolean{
        let iB = true;
        for (const key in compared) {
            if (compared.hasOwnProperty(key)) {
                const val = compared[key];
                if(this[key]!==val){
                    iB = false;
                    break;
                }
            }
        }
        return iB;
    }
}
