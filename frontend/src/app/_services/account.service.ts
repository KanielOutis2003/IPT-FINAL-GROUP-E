import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map, finalize } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { Account } from "../_models/account";

const baseUrl = `${environment.apiUrl}/accounts`;

/**
 * Account service for managing user authentication and account operations
 * Handles login, registration, token management, and account CRUD operations
 */
@Injectable({ providedIn: "root" })
export class AccountService {
  private accountSubject: BehaviorSubject<Account | null>;
  public account: Observable<Account | null>;

  constructor(private router: Router, private http: HttpClient) {
    // Try to restore account from localStorage
    const storedAccount = localStorage.getItem('currentUser');
    const initialAccount = storedAccount ? JSON.parse(storedAccount) : null;
    this.accountSubject = new BehaviorSubject<Account | null>(initialAccount);
    this.account = this.accountSubject.asObservable();
  }

  /**
   * Get the current account value
   */
  public get accountValue(): Account | null {
    return this.accountSubject.value;
  }

  /**
   * Authenticate user with email and password
   * @param email User's email address
   * @param password User's password
   * @returns Observable of the authenticated account
   */
  login(email: string, password: string) {
    return this.http
      .post<any>(
        `${baseUrl}/authenticate`,
        { email, password },
        { withCredentials: true }
      )
      .pipe(
        map((account) => {
          // Store the account in localStorage
          localStorage.setItem('currentUser', JSON.stringify(account));
          this.accountSubject.next(account);
          this.startRefreshTokenTimer();
          return account;
        })
      );
  }

  /**
   * Logout current user and revoke refresh token
   */
  logout() {
    this.stopRefreshTokenTimer();
    
    // Revoke server-side token before clearing local storage
    // Get current account value before clearing
    const account = this.accountValue;
    
    // If using fake backend, return immediately
    if (environment.useFakeBackend) {
      // Clear all session data
      this.clearStorageAndSession();
      this.accountSubject.next(null);
      return of(null);
    }
    
    // If we have no account, just clear and return
    if (!account) {
      this.clearStorageAndSession();
      this.accountSubject.next(null);
      
      // Navigate to login page and replace history
      this.router.navigate(['/account/login'], { 
        replaceUrl: true,
        queryParams: { returnUrl: '/' }
      });
      
      return of(null);
    }
    
    // Get the refresh token from cookies
    let refreshToken: string | null = null;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('refreshToken=')) {
        refreshToken = cookie.substring('refreshToken='.length, cookie.length);
        break;
      }
    }
    
    // Check if refresh token was found
    if (!refreshToken) {
      console.warn('No refresh token found in cookies during logout');
      // If no token found, just clear and redirect
      this.clearStorageAndSession();
      this.accountSubject.next(null);
      this.router.navigate(['/account/login'], { 
        replaceUrl: true,
        queryParams: { returnUrl: '/' }
      });
      return of(null);
    }
    
    // Revoke server-side token - must be done before clearing storage
    return this.http
      .post<any>(
        `${baseUrl}/revoke-token`, 
        { token: refreshToken }, // Send the token in the body
        { 
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${account.jwtToken}`
          }
        }
      )
      .pipe(
        finalize(() => {
          // Clear storage regardless of whether token revocation succeeded
          this.clearStorageAndSession();
          this.accountSubject.next(null);
          
          // Navigate to login page and replace history
          this.router.navigate(['/account/login'], { 
            replaceUrl: true,
            queryParams: { returnUrl: '/' }
          });
        })
      );
  }
  
  /**
   * Helper method to clear storage and cookies
   */
  private clearStorageAndSession() {
    // Clear all session data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
  }

  /**
   * Refresh the JWT token using the refresh token
   * @returns Observable of the refreshed account
   */
  refreshToken() {
    // Skip token refresh for account routes
    if (this.isAccountRoute()) {
      console.log('AccountService: Skipping token refresh for account route');
      return of(null);
    }
    
    return this.http
      .post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        map((account) => {
          // Store the account in localStorage
          localStorage.setItem('currentUser', JSON.stringify(account));
          this.accountSubject.next(account);
          this.startRefreshTokenTimer();
          return account;
        })
      );
  }

  /**
   * Register a new user account
   * @param account The account details to register
   * @returns Observable of the registration response
   */
  register(account: Account) {
    return this.http.post(`${baseUrl}/register`, account);
  }

  /**
   * Verify user's email address using verification token
   * @param token The verification token
   * @returns Observable of the verification response
   */
  verifyEmail(token: string) {
    console.log('Sending verification request with token:', token);
    return this.http.post(`${baseUrl}/verify-email`, { token });
  }

  /**
   * Request password reset for an email address
   * @param email The email address to reset password for
   * @returns Observable of the reset request response
   */
  forgotPassword(email: string) {
    return this.http.post(`${baseUrl}/forgot-password`, { email });
  }

  /**
   * Validate a password reset token
   * @param token The reset token to validate
   * @returns Observable of the validation response
   */
  validateResetToken(token: string) {
    return this.http.post(`${baseUrl}/validate-reset-token`, { token });
  }

  /**
   * Reset user's password using reset token
   * @param token The reset token
   * @param password The new password
   * @param confirmPassword Password confirmation
   * @returns Observable of the reset response
   */
  resetPassword(token: string, password: string, confirmPassword: string) {
    return this.http.post(`${baseUrl}/reset-password`, {
      token,
      password,
      confirmPassword,
    });
  }

  /**
   * Get all user accounts (admin only)
   * @returns Observable of account array
   */
  getAll() {
    return this.http.get<Account[]>(baseUrl);
  }

  /**
   * Get account by id
   * @param id The account id
   * @returns Observable of the account
   */
  getById(id: string) {
    return this.http.get<Account>(`${baseUrl}/${id}`);
  }

  /**
   * Update account details
   * @param id The account id to update
   * @param params The account parameters to update
   * @returns Observable of the updated account
   */
  update(id, params) {
    return this.http.put(`${baseUrl}/${id}`, params).pipe(
      map((account: any) => {
        // Update current account if it was modified
        if (account.id === this.accountValue?.id) {
          account = { ...this.accountValue, ...account };
          this.accountSubject.next(account);
        }
        return account;
      })
    );
  }

  /**
   * Delete an account
   * @param id The account id to delete
   * @returns Observable of the delete response
   */
  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`).pipe(
      finalize(() => {
        // Auto logout if the logged in account was deleted
        if (id === this.accountValue?.id) {
          this.logout();
        }
      })
    );
  }

  /**
   * Create a new account
   * @param account The account details to create
   * @returns Observable of the created account
   */
  create(account: Account) {
    return this.http.post(`${baseUrl}`, account);
  }

  private refreshTokenTimeout;

  /**
   * Start the refresh token timer
   * Automatically refreshes the JWT token before it expires
   */
  private startRefreshTokenTimer() {
    if (!this.accountValue?.jwtToken) return;
    
    try {
      // Parse the JWT token to get expiration time
      const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split(".")[1]));
      const expires = new Date(jwtToken.exp * 1000);
      const now = new Date();
      
      // Calculate time to token expiration
      const timeout = expires.getTime() - now.getTime() - (60 * 1000); // Refresh 1 minute before expiry
      
      // Log token expiration time for debugging
      console.log(`JWT token expires: ${expires.toLocaleString()}, Current time: ${now.toLocaleString()}`);
      console.log(`Setting refresh timer for ${Math.floor(timeout / 1000)} seconds from now`);
      
      // Set minimum timeout to avoid immediate refresh
      const refreshTimeout = Math.max(1000, timeout);
      
      // Clear any existing timeout
      this.stopRefreshTokenTimer();
      
      // Set the refresh timer
      this.refreshTokenTimeout = setTimeout(() => {
        console.log('Token refresh timer triggered');
        this.refreshToken().subscribe({
          error: error => {
            console.error('Failed to refresh token:', error);
            // Don't logout on refresh failure - ErrorInterceptor will handle this
          }
        });
      }, refreshTimeout);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
    }
  }

  /**
   * Stop the refresh token timer
   */
  private stopRefreshTokenTimer() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = null;
    }
  }

  // Add a method to check if the current URL is an account route
  private isAccountRoute(): boolean {
    // Use window.location.href to get the full URL
    const currentUrl = window.location.href;
    return currentUrl.includes('/account/');
  }
}