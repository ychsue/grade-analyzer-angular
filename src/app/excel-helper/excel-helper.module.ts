import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class ExcelHelperModule { 
  static cellsToAddress(from: [number, number], to: [number, number]):string{
    return this.colToA(from[1])+(from[0]+1)+':'+this.colToA(to[1])+(to[0]+1);
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
}
