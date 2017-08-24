import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AuthMethods, AuthProvider, FirebaseUIAuthConfig, FirebaseUIModule, AuthProviderWithCustomConfig } from 'firebaseui-angular';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../environments/environment';
import { AngularFireAuthModule } from 'angularfire2/auth';

const firebaseUiAuthConfig: FirebaseUIAuthConfig = {
    providers: [
        AuthProvider.Google,
        AuthProvider.Password
    ],
    method: AuthMethods.Popup,
    tos: 'tos.html'
};

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        FirebaseUIModule.forRoot(firebaseUiAuthConfig)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}