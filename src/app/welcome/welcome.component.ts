import { Component, OnInit } from '@angular/core';
import { DataServerService } from '../data-server.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  constructor(
    private dataServerService: DataServerService,
    private actRoute: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    let isSet = this.dataServerService.isSet();
    if(isSet === false){
      this.messageService.add("WelcomeComponent.ngOnInit: "+isSet);
      this.router.navigate(['/settings']);
    }
  }

}
