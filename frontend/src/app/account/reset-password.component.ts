import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '../_services';
import { MustMatch } from '../_helpers';

enum TokenStatus {
  Validating,
  Valid,
  Invalid
}

@Component({ templateUrl: 'reset-password.component.html' })
export class ResetPasswordComponent implements OnInit {
  TokenStatus = TokenStatus;
  tokenStatus = TokenStatus.Validating;
  token: string = '';
  form: UntypedFormGroup;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });

    // Get token from query params - don't navigate away immediately
    const token = this.route.snapshot.queryParams['token'];

    // Only remove token from URL after validating to prevent reloading
    this.accountService.validateResetToken(token)
      .pipe(first())
      .subscribe({
        next: () => {
          this.token = token;
          this.tokenStatus = TokenStatus.Valid;
          console.log('ResetPasswordComponent: Token validated successfully');
          // Only now remove the token from URL to prevent reload issues
          this.router.navigate([], { 
            relativeTo: this.route, 
            queryParams: {}, 
            replaceUrl: true 
          });
        },
        error: (error) => {
          console.error('ResetPasswordComponent: Token validation failed:', error);
          this.tokenStatus = TokenStatus.Invalid;
          this.router.navigate([], { 
            relativeTo: this.route, 
            queryParams: {}, 
            replaceUrl: true 
          });
        }
      });
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.accountService.resetPassword(this.token, this.f['password'].value, this.f['confirmPassword'].value)
      .pipe(first())
      .subscribe({
        next: () => {
          console.log('ResetPasswordComponent: Password reset successful');
          this.alertService.success('Password reset successful, you can now login', { keepAfterRouteChange: true });
          this.router.navigate(['/account/login'], { replaceUrl: true });
        },
        error: error => {
          console.error('ResetPasswordComponent: Password reset failed:', error);
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }
}