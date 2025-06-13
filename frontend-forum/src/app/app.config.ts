import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {ToastrModule} from 'ngx-toastr';
import {authInterceptor} from './interceptors/auth.interceptor';
import {provideMarkdown} from 'ngx-markdown';
import {errorInterceptor} from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(ToastrModule.forRoot()),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideMarkdown(),
  ]
};
