import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router/src/config';
import { CachingInterceptor, HttpCache, LocalHttpCache, LocalOngoingHttpCache, OnGoingHttpCache } from '@helgoland/caching';
import { ApiInterface, GetDataApiInterface, Settings, SettingsService } from '@helgoland/core';
import { JsonFavoriteExporterService } from '@helgoland/favorite';
import {
  NgbAccordionModule,
  NgbDatepickerModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbTabsetModule,
  NgbTimepickerModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ComponentsModule } from '../../app/components/components.module';
import { ProfilesModule } from '../../app/profiles/profiles.module';
import { TimeseriesRouter } from '../../app/timeseries/services/timeseries-router.service';
import { TimeseriesModule } from '../../app/timeseries/timeseries.module';
import { TrajectoriesModule } from '../../app/trajectories/trajectories.module';
import { settings } from '../environments/environment';
import { AppComponent } from './app.component';
import { CustomTimeseriesRouter } from './router.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const baseRoutes: Routes = [
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'timeseries'
  }
];

@Injectable()
export class ExtendedSettingsService extends SettingsService<Settings> {

  constructor() {
    super();
    this.setSettings(settings);
  }

}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ComponentsModule,
    TimeseriesModule,
    TrajectoriesModule,
    ProfilesModule,
    HttpClientModule,
    NgbTabsetModule.forRoot(),
    NgbAccordionModule.forRoot(),
    NgbModalModule.forRoot(),
    NgbDropdownModule.forRoot(),
    NgbDatepickerModule.forRoot(),
    NgbTimepickerModule.forRoot(),
    RouterModule.forRoot(
      baseRoutes
    )
  ],
  providers: [
    JsonFavoriteExporterService,
    {
      provide: SettingsService,
      useClass: ExtendedSettingsService
    },
    {
      provide: HttpCache,
      useClass: LocalHttpCache
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CachingInterceptor,
      multi: true
    },
    {
      provide: ApiInterface,
      useClass: GetDataApiInterface
    },
    {
      provide: OnGoingHttpCache,
      useClass: LocalOngoingHttpCache
    },
    {
      provide: TimeseriesRouter,
      useClass: CustomTimeseriesRouter
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
