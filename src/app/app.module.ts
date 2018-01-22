import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { TestComponent } from './test/test.component';
import { MessageService } from './message.service';
import { DataServerService } from './data-server.service';
import { SettingsComponent } from './settings/settings.component';


@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    TestComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [MessageService, DataServerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
