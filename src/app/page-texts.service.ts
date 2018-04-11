import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { defaultPTS } from "../defaultPTS";

@Injectable()
export class PageTextsService {
  pts: IPageTexts;
  langCode: string;
  updateStart: Subject<any> = new Subject<any>();
  updateEnd: Subject<IPageTexts> = new Subject<IPageTexts>();
  langList: eachLang[] = [
    {name:"中文", isoCode:"zh-tw"},
    {name:"English", isoCode:"en"}
  ];
  
  constructor(private http:HttpClient) { }

  updatePageTexts(isoCode:string):Observable<Object>|void {
    if(isoCode.indexOf("zh")>=0){
      isoCode="zh-tw";
    } else {
      isoCode = "en";
    }
  //* [2018-04-09 14:40] For the 1st time use
    if(isoCode==="zh-tw"){
      this.pts = defaultPTS;
    }
    //* [2018-04-09 14:41] Update the pageTexts
    if(isoCode === this.langCode && this.pts) {
      return;
    }
    let self = this;
    self.updateStart.next();
    let httpGet = this.http.get(`assets/i18n/${isoCode}/pageTexts.json`);
    httpGet.subscribe(obj =>{
      self.langCode = isoCode;
      self.pts = obj as IPageTexts;
      self.updateEnd.next(self.pts);
    });

    return httpGet;
  }
}

export interface eachLang {
  name: string;
  isoCode: string;
}