import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AccountService } from './_services';
import { Account, Role } from './_models';

@Component({ 
    selector: 'app-root', 
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.less']
})
export class AppComponent implements OnInit {
    title = 'user-management-system';
    Role = Role;
    account: Account | null = null;
    showModal = false;

    constructor(
        private accountService: AccountService,
        private router: Router
    ) {
        this.accountService.account.subscribe(x => {
            this.account = x;
            
            // Remove auto-redirect to login - allow guest access to the root route
        });
        
        // Auto-login as admin if using fake backend and not already logged in
        if (environment.useFakeBackend && !this.account) {
            this.autoLoginWithFakeBackend();
        }
    }
    
    ngOnInit() {
        // Listen to route changes to properly set/remove account route flags
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            // Check if we're on an account route
            const accountRoutes = [
                '/account/',
                '/register',
                '/verify-email',
                '/reset-password',
                '/forgot-password'
            ];
            
            const isAccountRoute = accountRoutes.some(route => event.url.includes(route));
            
            if (isAccountRoute) {
                localStorage.setItem('isAccountRoute', 'true');
                localStorage.setItem('lastAccountRoute', event.url);
                console.log('Navigation event: Set account route flag for:', event.url);
            } else {
                // Only clear the flag when navigating away from account routes
                localStorage.removeItem('isAccountRoute');
                localStorage.removeItem('accountRouteReload');
                localStorage.removeItem('accountRouteParams');
                console.log('Navigation event: Cleared account route flags');
            }
        });
        
        // Check and handle URL hash recovery for account routes
        const urlHash = window.location.hash;
        if (urlHash && urlHash.includes('/account/')) {
            // Extract the path from the hash
            const hashPath = urlHash.substring(1);
            console.log('Detected account route in hash, navigating to:', hashPath);
            this.router.navigateByUrl(hashPath);
        }
    }
    
    private autoLoginWithFakeBackend() {
        // Only login if not already logged in and using fake backend
        if (!this.account && !localStorage.getItem('currentUser') && environment.useFakeBackend) {
            this.accountService.login('admin@example.com', 'admin').subscribe({
                next: () => {
                    // Navigate to home/admin dashboard after login
                    this.router.navigate(['/']);
                }
            });
        }
    }

    logout() {
        // Clear all account route flags
        localStorage.removeItem('isAccountRoute');
        localStorage.removeItem('accountRouteReload');
        localStorage.removeItem('lastAccountRoute');
        localStorage.removeItem('accountRouteParams');
        
        // Call the account service logout method
        this.accountService.logout().subscribe({
            next: () => {
                // Navigate to login page after logout
                this.router.navigate(['/account/login']);
            }
        });
    }

    showDetails() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }
}