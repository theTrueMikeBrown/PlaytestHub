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

import { FeedbackListComponent } from './feedback-list/feedback-list.component';
import { GamesListComponent } from './games-list/games-list.component';
import { LeaveFeedbackComponent } from './leave-feedback/leave-feedback.component';
import { ApplyPointsComponent } from './apply-points/apply-points.component';
import { GameStatsComponent } from './game-stats/game-stats.component';
import { MessageStatsComponent } from './message-stats/message-stats.component';
import { FeedbackStatsComponent } from './feedback-stats/feedback-stats.component';
import { GameDetailComponent } from './game-detail/game-detail.component';
import { AddGameComponent } from './add-game/add-game.component';
import { UsersGamesComponent } from './users-games/users-games.component';
import { ViewMessagesComponent } from './view-messages/view-messages.component';
import { UsersProfileComponent } from './users-profile/users-profile.component';
import { GameEditComponent } from './game-edit/game-edit.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { EditUserComponent } from './edit-user/edit-user.component';

import { BusinessService } from './services/business.service';
import { DbService } from './services/db.service';
import { LoginInfoService } from './services/loginInfo.service';
import { FunnelPageComponent } from './funnel-page/funnel-page.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { ModalComponent } from './modal/modal.component';
import { AboutPageComponent } from './about-page/about-page.component';

const firebaseUiAuthConfig: FirebaseUIAuthConfig = {
    providers: [
        AuthProvider.Google,
        AuthProvider.Password
    ],
    method: AuthMethods.Redirect,
    tos: 'tos.html'
};

@NgModule({
    declarations: [
        AppComponent,
        GamesListComponent,
        FeedbackListComponent,
        GameStatsComponent,
        MessageStatsComponent,
        FeedbackStatsComponent,
        GameDetailComponent,
        AddGameComponent,
        UsersGamesComponent,
        UsersProfileComponent,
        GameEditComponent,
        LeaveFeedbackComponent,
        ApplyPointsComponent,
        ViewMessagesComponent,
        AdminPageComponent,
        EditUserComponent,
        FunnelPageComponent,
        SignInComponent,
        ModalComponent,
        AboutPageComponent
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
                path: 'funnel',
                component: FunnelPageComponent
            },
            {
                path: 'about',
                component: AboutPageComponent
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
                path: 'feedback/:id',
                component: LeaveFeedbackComponent
            },
            {
                path: 'feedbackList/:id',
                component: FeedbackListComponent
            },
            {
                path: 'applyPoints/:id',
                component: ApplyPointsComponent
            },
            {
                path: 'applyPoints',
                component: ApplyPointsComponent
            },
            {
                path: 'messages',
                component: ViewMessagesComponent
            },
            {
                path: 'headCheese',
                component: AdminPageComponent
            },
            {
                path: 'editUser',
                component: EditUserComponent
            },
            {
                path: 'signIn',
                component: SignInComponent
            }
        ])
    ],
    providers: [DbService, LoginInfoService, BusinessService],
    bootstrap: [AppComponent]
})
export class AppModule {
}