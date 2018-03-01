import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {
  static modeStrings:{det:string,indet:string}={det:"determinate",indet:"indeterminate"};
  modeStrings = SpinnerComponent.modeStrings;
  @Input()
  title: string = "Hello";
  @Input()
  message:string = "This is a test. This is a test.This is a test.";
  @Input()
  mode:string = SpinnerComponent.modeStrings.indet; //The other one is determinate
  @Input()
  value:number = 0;

  constructor() { }

  ngOnInit() {
  }

}
