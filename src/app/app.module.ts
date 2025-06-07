import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faBars, faUser, faCog, faDatabase, faScroll, faPalette } from '@fortawesome/free-solid-svg-icons';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NodeRegistrationService } from './services/node-registration.service';
import { WidgetsModule } from './widgets/widgets.module';

@NgModule({
  declarations: [
    AppComponent
  ],  imports: [
    WidgetsModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FontAwesomeModule,
  ],
  providers: [NodeRegistrationService],
  bootstrap: [AppComponent]
})
export class AppModule {  constructor(library: FaIconLibrary) {
    library.addIcons(faBars, faUser, faCog, faDatabase, faScroll, faPalette);
  }
}
