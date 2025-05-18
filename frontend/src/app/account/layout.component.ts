import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '../_services';

@Component({ selector: 'app-layout', templateUrl: './layout.component.html' })
export class LayoutComponent {
  constructor(
    private router: Router,
    private accountService: AccountService
  ) {
    // The LayoutComponent is no longer used in routing
    console.log('LayoutComponent initialized but not used in routing');
  }
}