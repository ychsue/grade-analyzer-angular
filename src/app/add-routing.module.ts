import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { TestComponent } from './test/test.component';

const routes : Routes=[
  {path: 'welcome', component: WelcomeComponent},
  {path: 'test', component: TestComponent},
  {path: '', redirectTo: '/test',pathMatch: 'full'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,{useHash: true})
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AddRoutingModule { }
