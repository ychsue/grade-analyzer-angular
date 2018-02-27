export class PageInfo {
    unit: pageUnit = pageUnit.inch;
    width: number = 8.27;
    height: number = 11.69;
    up: number = 0.75;
    down: number =0.75;
    left: number = 0.7;
    right: number =0.7;
    
    // #region PageStyle
    private _pageStyle:pageStyle=pageStyle.A4;
    public set pageStyle(v : pageStyle) {
        this._pageStyle = v;
        this.unit=pageUnit.inch;
        switch (v) {
            case pageStyle.A4:
            this.width=8.27;
            this.height=11.69;
            break;
            case pageStyle.Letter:
            this.width=8.5;
            this.height=11;
            break;
            default:
            break;
        }
    }
    public get pageStyle() : pageStyle {
        return this._pageStyle;
    }
    // #endregion PageStyle
    
    unitTrans= {
        inch2Point:468/6.87,
        one:1
    };
    
    // Methods
    getWH(outputUnit?:pageUnit):[number,number]{
        let wh:[number,number]=[this.width,this.height];
        if(!outputUnit) outputUnit = pageUnit.point;
        switch (outputUnit) {
            case pageUnit.inch:
                if(this.unit==pageUnit.inch) return wh;
                if(this.unit==pageUnit.point){ 
                    return [wh[0]/this.unitTrans.inch2Point,wh[1]/this.unitTrans.inch2Point];
                }
                break;
            case pageUnit.point:
                if(this.unit==pageUnit.inch) {
                    return [wh[0]*this.unitTrans.inch2Point,wh[1]*this.unitTrans.inch2Point];
                }
                if(this.unit==pageUnit.point) return wh;
                break;
            
            default:
            break;
        }
        return wh;
    }
}

export enum pageUnit{
    point,
    inch,
    cm
}

export enum pageStyle{
    A4,
    Letter
}