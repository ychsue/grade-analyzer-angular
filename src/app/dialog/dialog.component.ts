import { Component, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from "@angular/material";

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  title:string = "TITLE";
  message: string = "MESSAGE";
  constructor(public dialogRef: MatDialogRef<DialogComponent>) { }

  ngOnInit() {
  }

}
