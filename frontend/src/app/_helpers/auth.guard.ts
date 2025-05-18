import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';

import { AccountService } from '../_services';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        // Define all account routes that should bypass authentication
        const accountRoutes = [
            '/account/login',
            '/account/register',
            '/account/verify-email',
            '/account/reset-password',
            '/account/forgot-password'
        ];
        
        // Special handling for the root route - allow guest access
        if (state.url === '/') {
            return true;
        }
        
        // Check if current URL is an account route
        const isCurrentRouteAccountRoute = accountRoutes.some(route => state.url === route);

        // If on an account route, clear any stored account data
        if (isCurrentRouteAccountRoute) {
            localStorage.removeItem('currentUser');
            return true;
        }

        // Standard flow for non-account routes
        const account = this.accountService.accountValue;
        
        // If not logged in, redirect to login page
        if (!account) {
            // Store the attempted URL for redirecting after login
            const returnUrl = state.url;
            localStorage.setItem('returnUrl', returnUrl);
            
            // Clear any stored account data
            localStorage.removeItem('currentUser');
            
            // Navigate to login with replaceUrl to prevent back navigation
            this.router.navigate(['/account/login'], { 
                replaceUrl: true,
                queryParams: { returnUrl }
            });
            return false;
        }
        
        // Check role access
        if (route.data?.roles && !route.data.roles.includes(account.role)) {
            // If user doesn't have required role, redirect to home
            this.router.navigate(['/'], { replaceUrl: true });
            return false;
        }
        
        return true;
    }

    private checkRoleAccess(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const account = this.accountService.accountValue;
        if (!account) return false;
        
        // Check if route has required roles
        if (route.data?.roles && !route.data.roles.includes(account.role)) {
            console.log(`Access denied: User role ${account.role} not allowed for route ${state.url}`);
            this.router.navigate(['/']);
            return false;
        }
        
        return true;
    }

    private autoLoginWithFakeBackend(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.accountService.login('admin@example.com', 'admin').pipe(
            map(() => {
                console.log('Auto-login successful with fake backend');
                return this.checkRoleAccess(route, state);
            }),
            catchError(error => {
                console.error('Auto-login failed:', error);
                this.router.navigate(['/account/login']);
                return of(false);
            }),
            take(1) // Complete after first emission
        );
    }
}