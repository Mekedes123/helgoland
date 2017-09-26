import { Component, OnInit } from '@angular/core';

import { TrajectoriesConditionalRouter } from './../services/trajectories-router.service';

@Component({
  selector: 'n52-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class TrajectoriesNavigationComponent implements OnInit {

  constructor(
    private router: TrajectoriesConditionalRouter
  ) { }

  ngOnInit() { }
}