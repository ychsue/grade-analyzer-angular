import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message.service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  constructor(public messageService: MessageService) { }

  ngOnInit() {
    this.messageService.add("TestComponent.ngOnInit");
  }

}
