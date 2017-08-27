import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthMethods, AuthProvider, FirebaseUIAuthConfig, FirebaseUIModule, AuthProviderWithCustomConfig } from 'firebaseui-angular';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../environments/environment';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { GamesListComponent } from './games-list.component';
import { GameStatsComponent } from './game-stats.component';
import { GameDetailComponent } from './game-detail.component';
import { GameService } from './game.service';

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
        AppComponent,
        GamesListComponent,
        GameStatsComponent,
        GameDetailComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        FirebaseUIModule.forRoot(firebaseUiAuthConfig),
        RouterModule.forRoot([
            {
                path: 'games',
                component: GamesListComponent
            },
            {
                path: '',
                redirectTo: '/games',
                pathMatch: 'full'
            },
            {
                path: 'detail/:id',
                component: GameDetailComponent
            },
        ])
    ],
    providers: [GameService],
    bootstrap: [AppComponent]
})
export class AppModule {
}