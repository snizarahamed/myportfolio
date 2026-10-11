import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ShortcutComponent } from './home/shortcut.component';
import { WebsiteComponent } from './home/website.component';
import { ContactComponent } from './home/contact.component';
import { FormsModule } from '@angular/forms';
import { SkillsComponent } from './home/skills.component';
import { ProjectComponent } from './home/project.component';
import { HeroAvatarComponent } from './home/hero-avatar.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ShortcutComponent,
    WebsiteComponent,
    ContactComponent,
    SkillsComponent,
    ProjectComponent,
    HeroAvatarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
