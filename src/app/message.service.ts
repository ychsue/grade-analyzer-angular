import { Injectable } from '@angular/core';

@Injectable()
export class MessageService {
  messages:string[] =[];

  add(message: string):void{
    this.messages.push(`[${Date()}] ${message}`);
  }
  clear():void{
    this.messages=[];
  }
  constructor() { }

}
