import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { AddRoutingModule } from './add-routing.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { TestComponent } from './test/test.component';
import { MessageService } from './message.service';


@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    TestComponent
  ],
  imports: [
    BrowserModule,
    AddRoutingModule
  ],
  providers: [MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
