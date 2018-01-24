import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {
  @Input()
  title: string = "Hello";
  @Input()
  message:string = "This is a test. This is a test.This is a test.";
  
  constructor() { }

  ngOnInit() {
  }

}
