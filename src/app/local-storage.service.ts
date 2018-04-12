import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {
  storage:Storage = localStorage;
  
  //* [2018-04-12 10:24] The defined keys
  keys = {
    "isoCode":"isoCode",
    "pageTexts":"pageTexts"
  };

  public get langCode() : string {
    return (!!this.storage)?this.storage.getItem(this.keys.isoCode):"";
  }
  public set langCode(v : string) {
    if (!!this.storage) {this.storage.setItem(this.keys.isoCode,v);}
  }
    
  public get pageTexts() : string {
    return (!!this.storage)?this.storage.getItem(this.keys.pageTexts):"";
  }
  public set pageTexts(v : string) {
    if (!!this.storage) {this.storage.setItem(this.keys.pageTexts,v);}
  }
  
  constructor() { }
  
}
