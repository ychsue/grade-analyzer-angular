import { IYearSemTimes } from "./data-server.service";

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

    //For Sheet of Charts
    chartSheetName: string;
    iRowSpecial: number;
    iRowChart: number;
    stSpecial: string;
    nH: number;

    // For Publish
    isDebugMode:boolean;

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

        this.chartSheetName =(gSettings)?gSettings.chartSheetName:'學生列表';
        this.iRowSpecial =(gSettings)?gSettings.iRowSpecial: 8;
        this.iRowChart   =(gSettings)?gSettings.iRowChart: 9;
        this.nH          =(gSettings)?gSettings.nH:11;
        this.stSpecial   =(gSettings)?gSettings.stSpecial: '家長簽名及意見';

        this.isDebugMode =(gSettings)?gSettings.isDebugMode: false;
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

    getSortedMagicWords(pattern?: string, magicWords?: string[]):string[]{
        pattern =(pattern)?pattern: this.eachSheet;
        let objBuf: IYearSemTimes ={year:'', sem:'', times:''};
        if(!magicWords){
            magicWords= Object.keys(objBuf);
        }
        let orderedWords = this.sortMagicWords(pattern, magicWords);
        return orderedWords;
    }

    getRegExpPattern(pattern?:string, magicWords?:string[]):string{
        if(!magicWords) magicWords = this.getSortedMagicWords();
        if(!pattern) pattern = this.eachSheet;
        magicWords.forEach(key => {
            pattern = pattern.replace(`\$${key.toUpperCase()}\$`,`([0-9a-zA-Z]+)`);
        });
        return pattern;
    }

    parseYearSemTimes(sheetName:string,regExpPattern?:string ,sortedMagicWords?:string[]):IYearSemTimes{
        let result:IYearSemTimes;
        if(!sortedMagicWords) sortedMagicWords = this.getSortedMagicWords();
        if(!regExpPattern) regExpPattern = this.getRegExpPattern(this.eachSheet,sortedMagicWords);
        let reg = new RegExp(regExpPattern,'g');
        if(reg.test(sheetName)){
            result ={year:'',sem:'',times:''};
            reg.lastIndex = 0;
            let arr = reg.exec(sheetName);
            for (let i0 = 0; i0 < sortedMagicWords.length; i0++) {
                const key = sortedMagicWords[i0];
                result[key]=arr[i0+1];
            }
        }
        return result;
    }

    
    /**
     * @param  {string} mainString      It is constituted of MagicWords
     * @param  {string[]} magicWords    In the mainString, it is closed by '$', e.g year -> $YEAR$
     * @returns string[]                The magic words will be reordered by their indese.
     */
    sortMagicWords(mainString:string, magicWords: string[]):string[]{
        let result:string[] = [];
        let iPos:[number,string][]=new Array<[number,string]>(); // Has the information of the index of all Magic Words
        // * [2018-02-21 11:04] Get the used magicWords
        for (const iWord of magicWords) {
            let index =mainString.indexOf('\$'+iWord.toUpperCase()+'\$');
            if(index >=0) {
                iPos.push([index,iWord]);
            }
        }
        // * [2018-02-21 11:12] Begin to sort them
        result = iPos.sort((a,b)=>{
            return a[0]-b[0]; 
        }).map(x=>x[1]);

        return result;
    }
}
