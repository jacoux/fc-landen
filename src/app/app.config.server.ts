import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideMarkdown } from 'ngx-markdown';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideMarkdown(),
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
