import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  title:string = this.data.title;
  message: string = this.data.message;
  constructor(public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:dialogData) { }

  ngOnInit() {
  }

}

export interface dialogData{
  title: string;
  message: string;
  buttons: dialogButtons[];
}

export interface dialogButtons{
  text: string;
  action: (ref?:MatDialogRef<any,any>, data?:dialogData)=>void;
}