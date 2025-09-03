import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideMarkdown } from 'ngx-markdown';
import { appConfig } from './app.config';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {environment} from '../environments/environment';
import {getAuth, provideAuth} from '@angular/fire/auth';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideMarkdown(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth())
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
