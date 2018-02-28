import { PageInfo } from "../page-info";
import { ImainCellsInfo } from "../data-server.service";

export class ForEachStudent {
    //n: number, H: height
    nHHead:number=2;
    nHIDetc:number=1;
    nHCompare: number=2; //This time & next time
    nHStatic: number=3;
    nHSpecial: number=1;
    nHSeparate: number=1;
    nWidth:number=9;
    nHChart: number = 1;

    nStudentPerPage: number =2;

    pageInfo: PageInfo;

    public get nTableRows() : number {
        return this.nHHead+this.nHIDetc+this.nHCompare+this.nHStatic+this.nHSpecial+this.nHSeparate;
    }

    public get nTotalRows() : number {
        return this.nTableRows+this.nHChart;
    }
    
// #region Public Methods
    public suggestedChartHeight(args:{
        eachCellWH?:[number,number],
        tableWH?:[number,number],
        separateH?:number,
        specialH?:number
    }):number{
        let result:number =0;
        let isTableWHSet =true;
        if(!args.eachCellWH){
            args.eachCellWH = [48,16.2]; // TODO
        }
        if(!args.tableWH){
            isTableWHSet = false;
            args.tableWH=[
                args.eachCellWH[0]*this.nWidth,
                args.eachCellWH[1]*this.nTableRows
            ];
        }
        if(!args.separateH){
            args.separateH=args.eachCellWH[1];
        }
        if(isTableWHSet===false && args && args.specialH){
            args.tableWH[1] = args.tableWH[1] -args.eachCellWH[1]+args.specialH;
        }

        // Get PageInfo
        if(!this.pageInfo) this.pageInfo = new PageInfo();
        // Get TotalHeight
        let WH = this.pageInfo.getWH();
        if(WH[0]<args.tableWH[0]) WH[1] = WH[1]/WH[0]*args.tableWH[1];
        // Get the chart's height
        let Hseparate = args.eachCellWH[1]; // TODO
        let Hhead = args.eachCellWH[1]; // TODO
        result = (WH[1]-Hhead/2.0)/this.nStudentPerPage-args.tableWH[1]-Hseparate;

        return result;
    }
// #endregion Public Methods

    public constructor (info?: ImainCellsInfo,nStudentPerPage:number=2,nspecial:number=1,nseparate:number=1){
        this.nHHead = info.id[0];
        this.nHIDetc = 1; // TODO
        this.nHCompare =2; // May not change it since it is just for previous and this one
        this.nHStatic =0+((info.cAvg)?1:0)+((info.cHighest)?1:0)+((info.cLowest)?1:0);
        this.nHSpecial=nspecial;
        this.nHSeparate = nseparate;

        this.nWidth =0+((info.id)?1:0)+((info.name)?1:0)+((info.avg)?1:0)+((info.score)?1:0)+((info.total)?1:0)+info.courses.length;
        return this;
    }
}
