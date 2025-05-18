import { AccountService } from '../_services';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export function appInitializer(accountService: AccountService) {
    return () => new Promise<void>(resolve => {
        // Check for account routes and flags
        const currentUrl = window.location.href;
        const accountRoutes = [
            '/account/',
            '/register',
            '/verify-email',
            '/reset-password',
            '/forgot-password'
        ];
        
        // Check if current URL is an account route
        const isAccountRoute = accountRoutes.some(route => currentUrl.includes(route));
        
        // Check for account route flags
        const hasAccountRouteFlag = localStorage.getItem('isAccountRoute') === 'true';
        const hasReloadFlag = localStorage.getItem('accountRouteReload') !== null;
        
        // Skip auth checks for account routes
        if (isAccountRoute || hasAccountRouteFlag || hasReloadFlag) {
            console.log('App initializer: Detected account route or flag, skipping auth checks:', currentUrl);
            
            // Set/update the account route flag
            localStorage.setItem('isAccountRoute', 'true');
            
            // Clean up reload flag (used for one-time reload detection)
            if (hasReloadFlag) {
                const reloadTime = parseInt(localStorage.getItem('accountRouteReload') || '0', 10);
                const currentTime = Date.now();
                
                // Keep reload flag only for a short time (10 seconds)
                if (currentTime - reloadTime > 10000) {
                    localStorage.removeItem('accountRouteReload');
                }
            }
            
            resolve();
            return;
        }
        
        // For fake backend, always perform a fresh login regardless of stored token
        // This ensures we have a valid token every time
        if (environment.useFakeBackend) {
            console.log('Using fake backend - auto-login with admin credentials');
            // Remove any potentially invalid tokens first
            localStorage.removeItem('currentUser');
            // Then login with admin credentials
            accountService.login('admin@example.com', 'admin').subscribe({
                next: () => {
                    console.log('Fake backend auto-login successful');
                    resolve();
                },
                error: () => {
                    console.error('Fake backend auto-login failed');
                    resolve();
                }
            });
            return;
        }
        
        // For real backend, try to use refresh token if available
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            try {
                accountService.refreshToken().subscribe({
                    next: () => {
                        console.log('Token refreshed successfully');
                        resolve();
                    },
                    error: () => {
                        // Remove invalid token
                        localStorage.removeItem('currentUser');
                        resolve();
                    }
                });
            } catch {
                // If there's any issue with the stored user, remove it
                localStorage.removeItem('currentUser');
                resolve();
            }
        } else {
            // No stored user, resolve immediately
            resolve();
        }
    });
}