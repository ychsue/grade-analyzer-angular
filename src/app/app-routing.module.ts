import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { TestComponent } from './test/test.component';
import { SettingsComponent } from './settings/settings.component';
import { CanDeactivateGuardService } from './can-deactivate-guard.service';

const routes : Routes=[
  {path: 'welcome', component: WelcomeComponent},
  {path: 'test', component: TestComponent},
  {path: 'settings', 
    component: SettingsComponent, 
    canDeactivate:[CanDeactivateGuardService]},
  {path: '', redirectTo: '/welcome',pathMatch: 'full'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,{useHash: true})
  ],
  exports: [
    RouterModule
  ],
  providers: [
    CanDeactivateGuardService
  ],
  declarations: []
})
export class AppRoutingModule { }
