import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import {
  BlacklistedService,
  ColorService,
  DatasetApi,
  DatasetApiInterface,
  Feature,
  IDataset,
  Offering,
  ParameterFilter,
  Phenomenon,
  Platform,
  PlatformTypes,
  Procedure,
  ProfileDataEntry,
  Service,
  Settings,
  SettingsService,
  TimedDatasetOptions,
  Timespan,
  ValueTypes,
} from '@helgoland/core';
import { TrajectoryResult } from '@helgoland/map';
import { NgbAccordion, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ProfilesCombiService } from './../combi-view/combi-view.service';
import { ProfilesService } from './../services/profiles.service';
import { ProfilesSelectionPermalink } from './selection-permalink.service';
import { ProfilesSelectionCache } from './selection.service';

@Component({
  selector: 'n52-profiles-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfilesSelectionComponent implements OnInit {

  public datasetApis: Array<DatasetApi>;
  public providerBlacklist: Array<BlacklistedService>;

  public providerFilter: ParameterFilter;
  public offeringFilter: ParameterFilter;
  public phenomenonFilter: ParameterFilter;
  public procedureFilter: ParameterFilter;
  public stationaryPlatformFilter: ParameterFilter;
  public mobilePlatformFilter: ParameterFilter;
  public trajectoryFilter: ParameterFilter;

  public selectedProvider: Service;
  public selectedOffering: Offering;
  public selectedPhenomenon: Phenomenon;
  public selectedProcedure: Procedure;
  public selectedFeature: Feature;

  public stationaryPlatform: Platform;
  public stationaryPlatformLoading: boolean;
  public stationaryPlatformDataset: IDataset;
  public stationaryTimestamps: Array<number>;

  public loadingTrajectories: boolean;
  public loadingPlatforms: boolean;
  public loadingMobilePlatforms: boolean;
  public noPlatformResults: boolean;
  public itemsLength = 0;

  public mobileTimestamps: Array<number>;
  public selectedMobileTimespan: Timespan;

  public mobilePreviewDataset: IDataset;
  public mobilePreviewTimestamp: number;
  public mobilePreviewOptions: Map<string, Array<TimedDatasetOptions>>;

  @ViewChild('modalStationaryPlatform', { static: true })
  public modalStationaryPlatform: TemplateRef<any>;

  @ViewChild('modalMobilePreview', { static: true })
  public modalMobilePreview: TemplateRef<any>;

  @ViewChild('profileSelection', { static: true })
  public accordion: NgbAccordion;

  constructor(
    private settingsSrvc: SettingsService<Settings>,
    private cache: ProfilesSelectionCache,
    private modalService: NgbModal,
    private api: DatasetApiInterface,
    private router: Router,
    private profilesSrvc: ProfilesService,
    private combiSrvc: ProfilesCombiService,
    private color: ColorService,
    public selectionPermalink: ProfilesSelectionPermalink
  ) { }

  ngOnInit() {
    this.selectionPermalink.validatePeramlink().subscribe((selection) => {
      if (selection.selectedProvider) { this.providerSelected(selection.selectedProvider, false); }
      if (selection.selectedOffering) { this.offeringSelected(selection.selectedOffering, false); }
      if (selection.selectedPhenomenon) { this.phenomenonSelected(selection.selectedPhenomenon, false); }
      if (selection.selectedProcedure) { this.procedureSelected(selection.selectedProcedure, false); }
      if (selection.selectedFeature) { this.featureSelected(selection.selectedFeature); }
    });
    this.datasetApis = this.settingsSrvc.getSettings().datasetApis;
    this.providerBlacklist = this.settingsSrvc.getSettings().providerBlackList;
    this.providerFilter = this.createFilter();
  }

  private createFilter(): ParameterFilter {
    const filter: ParameterFilter = {
      valueTypes: ValueTypes.quantityProfile
    };
    if (this.selectedProvider) { filter.service = this.selectedProvider.id; }
    if (this.selectedOffering) { filter.offering = this.selectedOffering.id; }
    if (this.selectedPhenomenon) { filter.phenomenon = this.selectedPhenomenon.id; }
    if (this.selectedProcedure) {
      filter.procedure = this.selectedProcedure.id;
      filter.expanded = true;
    }
    if (this.selectedFeature) { filter.feature = this.selectedFeature.id; }
    return filter;
  }

  private setSelectedProvider(provider: Service) {
    this.selectedProvider = this.cache.selectedProvider = provider;
  }

  private setSelectedOffering(offering: Offering) {
    this.selectedOffering = this.cache.selectedOffering = offering;
  }

  private setSelectedPhenomenon(phenomenon: Phenomenon) {
    this.selectedPhenomenon = this.cache.selectedPhenomenon = phenomenon;
  }

  private setSelectedProcedure(procedure: Procedure) {
    this.selectedProcedure = this.cache.selectedProcedure = procedure;
  }

  private setSelectedFeature(feature: Feature) {
    this.selectedFeature = this.cache.selectedFeature = feature;
  }

  private providerSelected(provider: Service, clearPrevious: boolean) {
    this.openPanelById('selectOffering');
    if (clearPrevious) {
      this.setSelectedOffering(null);
      this.setSelectedPhenomenon(null);
      this.setSelectedProcedure(null);
      this.setSelectedFeature(null);
    }
    this.setSelectedProvider(provider);
    this.offeringFilter = this.createFilter();
  }

  private offeringSelected(offering: Offering, clearPrevious: boolean) {
    this.openPanelById('selectPhenomenon');
    if (clearPrevious) {
      this.setSelectedPhenomenon(null);
      this.setSelectedProcedure(null);
      this.setSelectedFeature(null);
    }
    this.setSelectedOffering(offering);
    this.phenomenonFilter = this.createFilter();
  }

  private phenomenonSelected(phenomenon: Phenomenon, clearPrevious: boolean) {
    this.openPanelById('selectProcedure');
    if (clearPrevious) {
      this.setSelectedProcedure(null);
      this.setSelectedFeature(null);
    }
    this.setSelectedPhenomenon(phenomenon);
    this.procedureFilter = this.createFilter();
  }

  private procedureSelected(procedure: Procedure, clearPrevious: boolean) {
    this.openPanelById('selectPlatform');
    if (clearPrevious) {
      this.setSelectedFeature(null);
    }
    this.setSelectedProcedure(procedure);
    this.stationaryPlatformFilter = this.createFilter();
    this.mobilePlatformFilter = this.createFilter();
    this.stationaryPlatformFilter.platformTypes = PlatformTypes.stationary;
    this.mobilePlatformFilter.platformTypes = PlatformTypes.mobile;
  }

  private featureSelected(feature: Feature) {
    this.openPanelById('selectProfile');
    this.setSelectedFeature(feature);
    this.trajectoryFilter = this.createFilter();
  }

  private openPanelById(id: string) {
    this.accordion.panels.find(entry => entry.id === id).disabled = false;
    this.accordion.expand(id);
  }

  public onStationaryPlatformSelected(platform: Platform) {
    this.modalService.open(this.modalStationaryPlatform);
    this.stationaryPlatform = platform;
    this.stationaryPlatformLoading = true;
    platform.datasets.forEach(dataset => {
      this.stationaryPlatformDataset = dataset;
      this.api.getDataset(dataset.id, this.selectedProvider.apiUrl).subscribe(res => {
        this.stationaryPlatformDataset = res;
        const timespan = new Timespan(res.firstValue.timestamp, res.lastValue.timestamp);
        this.api.getData<ProfileDataEntry>(res.id, res.url, timespan).subscribe(data => {
          this.stationaryTimestamps = [];
          data.values.forEach(entry => {
            this.stationaryTimestamps.push(entry.timestamp);
          });
          this.stationaryPlatformLoading = false;
        });
      });
    });
  }

  public onTimeselected(timestamp: number) {
    this.addProfileToChart(this.stationaryPlatformDataset, timestamp);
  }

  public onMobileSelected(selection: TrajectoryResult) {
    this.mobilePreviewDataset = selection.dataset;
    this.mobilePreviewTimestamp = selection.data.timestamp;
    this.mobilePreviewOptions = new Map();
    const options = new TimedDatasetOptions(selection.dataset.internalId, this.color.getColor(), selection.data.timestamp);
    this.mobilePreviewOptions.set(selection.dataset.internalId, [options]);
    this.modalService.open(this.modalMobilePreview, { size: 'lg' });
  }

  public addToChart() {
    this.addProfileToChart(this.mobilePreviewDataset, this.mobilePreviewTimestamp);
  }

  public addToCombiView() {
    const options = new TimedDatasetOptions(this.mobilePreviewDataset.internalId, this.color.getColor(), this.mobilePreviewTimestamp);
    this.combiSrvc.addDataset(this.mobilePreviewDataset.internalId, [options]);
    this.router.navigate(['profiles/combi']);
  }

  private addProfileToChart(dataset: IDataset, timestamp: number) {
    const options = new TimedDatasetOptions(dataset.internalId, this.color.getColor(), timestamp);
    this.profilesSrvc.addDataset(dataset.internalId, [options]);
    this.router.navigate(['profiles/diagram']);
  }

  public timelistDetermined(timelist: Array<number>) {
    this.mobileTimestamps = timelist;
  }

  public onTimespanSelected(timespan: Timespan) {
    this.selectedMobileTimespan = timespan;
  }

  public trajectoriesLoaded(loading: boolean) {
    this.loadingTrajectories = loading;
  }

}
