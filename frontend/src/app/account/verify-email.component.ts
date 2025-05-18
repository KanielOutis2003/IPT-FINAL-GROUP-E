import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '../_services';

enum EmailStatus {
  Verifying,
  Failed
}

@Component({ templateUrl: 'verify-email.component.html' })
export class VerifyEmailComponent implements OnInit {
  EmailStatus = EmailStatus;
  emailStatus = EmailStatus.Verifying;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    // Get token from query params
    const token = this.route.snapshot.queryParams['token'];
    
    console.log('VerifyEmailComponent: Verification token received:', token);
    console.log('VerifyEmailComponent: Current route:', this.router.url);
    
    // If no token provided, show error
    if (!token) {
      console.error('VerifyEmailComponent: No token provided for verification');
      this.emailStatus = EmailStatus.Failed;
      return;
    }

    // Verify email with the token
    this.accountService.verifyEmail(token)
      .pipe(first())
      .subscribe({
        next: (response) => {
          console.log('VerifyEmailComponent: Verification successful:', response);
          this.alertService.success('Verification successful, you can now login', { keepAfterRouteChange: true });
          setTimeout(() => {
            // Delay redirect slightly to ensure user sees the success message
            console.log('VerifyEmailComponent: Redirecting to login page after successful verification');
            // Use absolute path navigation to avoid any route issues
            this.router.navigate(['/account/login'], { replaceUrl: true });
          }, 1500);
        },
        error: (error) => {
          console.error('VerifyEmailComponent: Verification failed:', error);
          this.emailStatus = EmailStatus.Failed;
        }
      });
  }
}