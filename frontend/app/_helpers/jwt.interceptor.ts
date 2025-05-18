import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { AccountService } from '../_services';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private accountService: AccountService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the current account
    const account = this.accountService.accountValue;
    const isLoggedIn = account && account.jwtToken;
    const isApiUrl = request.url.startsWith(environment.apiUrl);
    
    // Skip authentication endpoints - they handle auth separately
    const isAuthEndpoint = 
      request.url.includes('/authenticate') || 
      request.url.includes('/refresh-token') ||
      request.url.includes('/revoke-token');
    
    // Log all API requests for debugging
    console.log(`JWT Interceptor: Request to ${request.method} ${request.url}`);
    console.log(`JWT Interceptor: Is logged in: ${isLoggedIn}, Is API URL: ${isApiUrl}, Is Auth Endpoint: ${isAuthEndpoint}`);
    
    // For API URLs, always include credentials
    if (isApiUrl) {
      // Start with including credentials for all API requests
      const requestOptions: { 
        withCredentials: boolean; 
        setHeaders?: { [name: string]: string } 
      } = {
        withCredentials: true
      };
      
      // If logged in and not an auth endpoint, also add the Authorization header
      if (isLoggedIn && !isAuthEndpoint) {
        const token = account.jwtToken;
        
        // Verify token exists and is not undefined
        if (!token || token === 'undefined') {
          console.error('JWT Interceptor: Invalid token. Forcing logout and re-login');
          this.accountService.logout();
          return next.handle(request);
        }
        
        // Log auth token being added for troubleshooting
        console.log(`JWT Interceptor: Adding auth token to request: ${request.url}`);
        
        try {
          // Parse the JWT token to check expiration
          const jwtToken = JSON.parse(atob(token.split(".")[1]));
          const expires = new Date(jwtToken.exp * 1000);
          const now = new Date();
          
          // Check if token is expired
          if (expires < now) {
            console.error(`JWT Interceptor: Token expired at ${expires.toLocaleString()}, current time is ${now.toLocaleString()}`);
          } else {
            console.log(`JWT Interceptor: Token valid until ${expires.toLocaleString()}`);
          }
        } catch (e) {
          console.error('JWT Interceptor: Error parsing JWT token:', e);
        }
        
        // Add Authorization header
        requestOptions.setHeaders = { 
          Authorization: `Bearer ${token}` 
        };
      }
      
      // Clone the request with the appropriate options
      request = request.clone(requestOptions);
    }

    // Log response for API calls
    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event.type === 0) { // HttpEventType.Sent = 0
            console.log(`JWT Interceptor: Request sent to ${request.url}`);
          }
        },
        error: (error) => {
          console.error(`JWT Interceptor: Error in request to ${request.url}:`, error);
        }
      })
    );
  }
}