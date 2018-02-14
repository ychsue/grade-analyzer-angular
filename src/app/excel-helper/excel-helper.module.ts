import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class ExcelHelperModule { 
  static cellsToAddress(from: [number, number], to?: [number, number], isFix:[boolean,boolean]=[false,false]):string{
    let result = ((isFix[1])?`$`:'')+ this.colToA(from[1])+
                 ((isFix[0])?`$`:'')+ (from[0]+1);
    if(to)
      result += ':' + ((isFix[1])?`$`:'')+ this.colToA(to[1])+
                      ((isFix[0])?`$`:'')+ (to[0]+1);
    return result;
  }
  
  static colToA(col:number):string{
    if(col<0){
      return "";
    } else {
      let re = col % 26;
      let q = (col-re)/26;
      let st = String.fromCharCode(65+re); //A, B, ....
      return ((q==0)?'':this.colToA(q-1))+st;
    }
  }

  
  /**
   * @param  {string} st
   * @returns number     : if its value is -1, it means that it is not in A1 formula.
   */
  static aToCol(st: string):number{
    let result:number =0;
    for (let i0 = 0; i0 < st.length; i0++) {
      let num = st.charCodeAt(i0)-64;
      if(num >=1 && num <=26){
        result = result*26 + num;
      } else
        return -1;
    }
    result -= 1; //Because it is count from 0.
    return result;
  }

  /**
   * @param  {string} address : e.g. "A1:B2"
   * @returns {from:[number,number], to?:[number,number]}
   */
  static addressToCells(address:string){
      var result:ICellsBound =null;
      // * [2018-02-10 16:41] Separate the string by ":"
      var buf = address.match(/[A-Z]+[0-9]+/g);
      if(buf && buf.length <=2){
        if(buf.length == 1){
          result = {
            from: [
              Number.parseInt( buf[0].match(/[0-9]+/g)[0])-1,
              this.aToCol(buf[0].match(/[A-Z]+/g)[0])
            ]
          };
        }else if(buf.length==2){
          let fResult = this.addressToCells(buf[0]);
          let tResult = this.addressToCells(buf[1]);
          result = {
            from: fResult.from,
            to: tResult.from
          };
        }
      }
      return result;
  }
}

export interface ICellsBound {
  from:[number,number], 
  to?:[number,number]
}