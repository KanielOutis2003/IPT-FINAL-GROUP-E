import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { AccountService } from '../_services';

@Component({ selector: 'app-login', templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
  form!: UntypedFormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl: string = '/';

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) { }

  ngOnInit() {
    // Clear any redirect flags that might be set
    if (localStorage.getItem('redirectToLogin') !== 'true') {
      // Only clear flags if we're directly accessing the login page
      localStorage.removeItem('isAccountRoute');
      localStorage.removeItem('accountRouteReload');
      localStorage.removeItem('lastAccountRoute');
    } else {
      // Clear the redirect flag after use
      localStorage.removeItem('redirectToLogin');
    }
    
    // Always set the account route flag for the login page
    localStorage.setItem('isAccountRoute', 'true');
    
    // Initialize the form regardless of backend type
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // If already logged in, redirect to home
    if (this.accountService.accountValue) {
      this.router.navigate(['/']);
    }
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.accountService.login(this.f['email'].value, this.f['password'].value)
      .pipe(first())
      .subscribe({
        next: () => {
          // Clear account route flags on successful login
          localStorage.removeItem('isAccountRoute');
          localStorage.removeItem('accountRouteReload');
          localStorage.removeItem('lastAccountRoute');
          
          // Navigate to the return url
          this.router.navigateByUrl(this.returnUrl);
        },
        error: error => {
          this.error = error;
          this.loading = false;
        }
      });
  }
}