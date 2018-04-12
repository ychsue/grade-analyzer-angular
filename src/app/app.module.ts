import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule, MatDialogModule, MatButtonModule, MatInputModule, MatMenuModule, MatIconModule, MatToolbarModule, MatSelectModule } from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { TestComponent } from './test/test.component';
import { MessageService } from './message.service';
import { DataServerService } from './data-server.service';
import { SettingsComponent } from './settings/settings.component';
import { DialogComponent } from './dialog/dialog.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { FormsModule } from '@angular/forms';
import { ExcelHelperModule } from './excel-helper/excel-helper.module';
import { GenWorksheetComponent } from './gen-worksheet/gen-worksheet.component';
import { PageTextsService } from './page-texts.service';
import { HttpClientModule } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';


@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    TestComponent,
    SettingsComponent,
    DialogComponent,
    SpinnerComponent,
    GenWorksheetComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    BrowserAnimationsModule,
    ExcelHelperModule,
    HttpClientModule
  ],
  entryComponents:[AppComponent,DialogComponent],
  providers: [MessageService, DataServerService, PageTextsService, LocalStorageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
