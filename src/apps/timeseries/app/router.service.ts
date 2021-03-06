import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { TimeseriesRouter } from '../../../common/timeseries/services/timeseries-router.service';

@Injectable()
export class CustomTimeseriesRouter extends TimeseriesRouter {

    constructor(
        private router: Router
    ) {
        super();
    }

    public navigateToDiagram() {
        this.router.navigate(['diagram']);
    }

    public navigateToMapSelection() {
        this.router.navigate(['map-selection']);
    }
}
