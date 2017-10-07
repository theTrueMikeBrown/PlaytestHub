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
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { GamesListComponent } from './games-list.component';
import { LeaveFeedbackComponent } from './leave-feedback.component';
import { GameStatsComponent } from './game-stats.component';
import { GameDetailComponent } from './game-detail.component';
import { AddGameComponent } from './add-game.component';
import { UsersGamesComponent } from './users-games.component';
import { UsersProfileComponent } from './users-profile.component';
import { GameEditComponent } from './game-edit.component';
import { DbService } from './db.service';
import { LoginInfoService } from './loginInfo.service';

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
        GameDetailComponent,
        AddGameComponent,
        UsersGamesComponent,
        UsersProfileComponent,
        GameEditComponent,
        LeaveFeedbackComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireDatabaseModule,
        AngularFirestoreModule,
        AngularFireAuthModule,
        HttpModule,
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
            {
                path: 'addgame',
                component: AddGameComponent
            },
            {
                path: 'user/:id/games',
                component: UsersGamesComponent
            },
            {
                path: 'user/:id/profile',
                component: UsersProfileComponent
            },
            {
                path: 'games/:id/edit',
                component: GameEditComponent
            },
            {
                path: 'leaveFeedback',
                component: LeaveFeedbackComponent
            },
        ])
    ],
    providers: [DbService, LoginInfoService],
    bootstrap: [AppComponent]
})
export class AppModule {
}