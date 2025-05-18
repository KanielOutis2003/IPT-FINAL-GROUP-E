import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize, mergeMap } from 'rxjs/operators';

import { AlertService } from '../_services/alert.service';
import { Role } from '../_models/role';
import { environment } from '../../environments/environment';

const accountsKey = 'angular-18-signup-verification-boilerplate-accounts';
let accounts = localStorage.getItem(accountsKey) ? JSON.parse(localStorage.getItem(accountsKey)!) : [];

// Remove delay for instant response
const FAKE_DELAY = 0;

// Always ensure demo users are present
const demoUsers = [
  {
    id: 1,
    title: 'Mr',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'admin',
    role: Role.Admin,
    status: 'Active',
    isVerified: true,
    refreshTokens: []
  },
  {
    id: 2,
    title: 'Ms',
    firstName: 'Normal',
    lastName: 'User',
    email: 'user@example.com',
    password: 'user',
    role: Role.User,
    status: 'Active',
    isVerified: true,
    refreshTokens: []
  },
  {
    id: 3,
    title: 'Dr',
    firstName: 'Inactive',
    lastName: 'Person',
    email: 'inactive@example.com',
    password: 'inactive',
    role: Role.User,
    status: 'Inactive',
    isVerified: true,
    refreshTokens: []
  }
];
accounts = demoUsers;
localStorage.setItem(accountsKey, JSON.stringify(accounts));

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  constructor(private alertService: AlertService) {}

  // Demo data for employees, departments, requests, and workflows
  private employees = [
    { 
      id: 1, 
      employeeId: 'EMP001', 
      firstName: 'Admin', 
      lastName: 'User', 
      position: 'Manager', 
      departmentId: 1, 
      department: { id: 1, name: 'Engineering', description: 'Software development team' },
      hireDate: '2023-01-01', 
      status: 'Active',
      user: { id: 1, firstName: 'Admin', lastName: 'User', email: 'admin@example.com' }
    },
    { 
      id: 2, 
      employeeId: 'EMP002', 
      firstName: 'Normal', 
      lastName: 'User', 
      position: 'Developer', 
      departmentId: 1, 
      department: { id: 1, name: 'Engineering', description: 'Software development team' },
      hireDate: '2023-02-01', 
      status: 'Active',
      user: { id: 2, firstName: 'Normal', lastName: 'User', email: 'user@example.com' }
    }
  ];
  
  private departments = [
    { id: 1, name: 'Engineering', description: 'Software development team', employeeCount: 2 },
    { id: 2, name: 'Marketing', description: 'Marketing and sales team', employeeCount: 0 }
  ];
  
  private requests = [
    { 
      id: 1, 
      employeeId: 2, 
      type: 'Equipment', 
      details: { item: 'Laptop', reason: 'Upgrade' }, 
      status: 'Pending',
      employee: { 
        id: 2, 
        employeeId: 'EMP002', 
        firstName: 'Normal', 
        lastName: 'User',
        position: 'Developer'
      },
      requestItems: [
        { name: 'Laptop', quantity: 1 }, 
        { name: 'Monitor', quantity: 2 }
      ]
    }
  ];
  
  private workflows = [
    { 
      id: 1, 
      employeeId: 1, 
      type: 'Onboarding', 
      details: { description: 'Setup workstation' }, 
      status: 'Pending',
      employee: { 
        id: 1, 
        employeeId: 'EMP001', 
        firstName: 'Admin', 
        lastName: 'User',
        position: 'Manager'
      }
    },
    { 
      id: 2, 
      employeeId: 1, 
      type: 'Training', 
      details: { description: 'Complete security training' }, 
      status: 'Completed',
      employee: { 
        id: 1, 
        employeeId: 'EMP001', 
        firstName: 'Admin', 
        lastName: 'User',
        position: 'Manager'
      }
    },
    { 
      id: 3, 
      employeeId: 2, 
      type: 'Performance Review', 
      details: { description: 'Quarterly performance review' }, 
      status: 'Pending',
      employee: { 
        id: 2, 
        employeeId: 'EMP002', 
        firstName: 'Normal', 
        lastName: 'User',
        position: 'Developer'
      }
    },
    { 
      id: 4, 
      employeeId: 2, 
      type: 'Onboarding', 
      details: { description: 'Complete HR paperwork' }, 
      status: 'Completed',
      employee: { 
        id: 2, 
        employeeId: 'EMP002', 
        firstName: 'Normal', 
        lastName: 'User',
        position: 'Developer'
      }
    }
  ];

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    // Create references to this instance for use in the functions
    const self = this;

    // Wrap in delayed observable to simulate server api call
    return of(null)
      .pipe(mergeMap(handleRoute))
      .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown
      .pipe(delay(FAKE_DELAY))
      .pipe(dematerialize());
      
    function handleRoute() {
      try {
        switch (true) {
          case url.endsWith('/accounts/authenticate') && method === 'POST':
            return authenticate();
          case url.endsWith('/accounts/refresh-token') && method === 'POST':
            return refreshToken();
          case url.endsWith('/accounts/revoke-token') && method === 'POST':
            return revokeToken();
          case url.endsWith('/accounts/register') && method === 'POST':
            return register();
          case url.endsWith('/accounts/verify-email') && method === 'POST':
            return verifyEmail();
          case url.endsWith('/accounts/forgot-password') && method === 'POST':
            return forgotPassword();
          case url.endsWith('/accounts/validate-reset-token') && method === 'POST':
            return validateResetToken();
          case url.endsWith('/accounts/reset-password') && method === 'POST':
            return resetPassword();
          case url.endsWith('/accounts') && method === 'GET':
            return getAccounts();
          case url.match(/\/accounts\/\d+$/) && method === 'GET':
            return getAccountById();
          case url.endsWith('/accounts') && method === 'POST':
            return createAccount();
          case url.match(/\/accounts\/\d+$/) && method === 'PUT':
            return updateAccount();
          case url.match(/\/accounts\/\d+$/) && method === 'DELETE':
            return deleteAccount();
            
          case url.endsWith('/employees') && method === 'GET':
            return getEmployees();
          case url.match(/\/employees\/\d+$/) && method === 'GET':
            return getEmployeeById();
          case url.endsWith('/employees') && method === 'POST':
            return createEmployee();
          case url.match(/\/employees\/\d+$/) && method === 'PUT':
            return updateEmployee();
          case url.match(/\/employees\/\d+$/) && method === 'DELETE':
            return deleteEmployee();
            
          case url.endsWith('/departments') && method === 'GET':
            return getDepartments();
          case url.match(/\/departments\/\d+$/) && method === 'GET':
            return getDepartmentById();
          case url.endsWith('/departments') && method === 'POST':
            return createDepartment();
          case url.match(/\/departments\/\d+$/) && method === 'PUT':
            return updateDepartment();
          case url.match(/\/departments\/\d+$/) && method === 'DELETE':
            return deleteDepartment();
            
          case url.endsWith('/requests') && method === 'GET':
            return getRequests();
          case url.match(/\/requests\/\d+$/) && method === 'GET':
            return getRequestById();
          case url.endsWith('/requests') && method === 'POST':
            return createRequest();
          case url.match(/\/requests\/\d+$/) && method === 'PUT':
            return updateRequest();
          case url.match(/\/requests\/\d+$/) && method === 'DELETE':
            return deleteRequest();
            
          case url.endsWith('/workflows') && method === 'GET':
            return getWorkflows();
          case url.match(/\/workflows\/employee\/\d+$/) && method === 'GET':
            return getWorkflowsByEmployeeId();
          case url.match(/\/workflows\/\d+$/) && method === 'GET':
            return getWorkflowById();
          case url.endsWith('/workflows') && method === 'POST':
            return createWorkflow();
          case url.match(/\/workflows\/\d+$/) && method === 'PUT':
            return updateWorkflow();
          case url.match(/\/workflows\/\d+$/) && method === 'DELETE':
            return deleteWorkflow();
          case url.match(/\/workflows\/\d+\/status$/) && method === 'PUT':
            return updateWorkflowStatus();
            
          case url.match(/\/employees\/\d+\/transfer$/) && method === 'POST':
            return transferEmployee();
            
          default:
            return next.handle(request);
        }
      } catch (err) {
        return error('An unexpected error occurred');
      }
    }

    function authenticate() {
      const { email, password } = body;
      const account = accounts.find(
        (x) => x.email === email && x.password === password
      );

      if (!account) return error("Email or password is incorrect");

      // If account is not verified, return error
      if (!account.isVerified) {
        return error("Please verify your email before logging in");
      }

      // If account is inactive, return error
      if (account.status === 'Inactive') {
        return error("Your account is inactive. Please contact an administrator.");
      }

      // Create a valid token
      account.refreshTokens = [];
      const refreshToken = generateRefreshToken();
      account.refreshTokens.push(refreshToken);
      
      const jwtToken = generateJwtToken(account);
      
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

      // Set fake refresh token cookie
      const cookieExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `fakeRefreshToken=${refreshToken}; expires=${cookieExpiry}; path=/`;

      return ok({
        ...basicDetails(account),
        jwtToken
      });
    }

    function refreshToken() {
      const refreshToken = getRefreshToken();

      if (!refreshToken) return unauthorized();

      const tokenData = JSON.parse(atob(refreshToken.split('.')[1]));
      if (Date.now() > tokenData.exp * 1000) return unauthorized();

      const account = accounts.find(x => x.refreshTokens.includes(refreshToken));

      if (!account) return unauthorized();

      // replace old refresh token with a new one and save
      account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
      account.refreshTokens.push(generateRefreshToken());
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

      return ok({
        ...basicDetails(account),
        jwtToken: generateJwtToken(account)
      });
    }

    function revokeToken() {
      if (!isAuthenticated()) return unauthorized();

      const refreshToken = getRefreshToken();
      const account = accounts.find(x => x.refreshTokens.includes(refreshToken));

      // revoke token and save
      account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

      // Clear all session data from localStorage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('refreshToken');

      return ok();
    }

    function verifyEmail() {
      const { token } = body;
      const account = accounts.find(x => x.verificationToken && x.verificationToken === token);

      if (!account) return error('Verification failed');

      account.isVerified = true;
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

      return ok();
    }

    function validateResetToken() {
      const { token } = body;
      const account = accounts.find(x =>
        x.resetToken && x.resetToken === token &&
        new Date() < new Date(x.resetTokenExpires)
      );

      if (!account) return error('Invalid token');

      return ok();
    }

    function resetPassword() {
      const { token, password } = body;
      const account = accounts.find(x =>
        !!x.resetToken && x.resetToken === token &&
        new Date() < new Date(x.resetTokenExpires)
      );

      if (!account) return error('Invalid token');

      account.password = password;
      account.isVerified = true;
      delete account.resetToken;
      delete account.resetTokenExpires;
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

      return ok();
    }

    function getAccounts() {
      if (!isAuthenticated()) return unauthorized();
      // Add status to all accounts and ensure it's set to Active for demo users
      return ok(accounts.map(x => {
        const acc = basicDetails(x);
        acc.status = x.status || 'Active';
        return acc;
      }));
    }

    function getAccountById() {
      if (!isAuthenticated()) return unauthorized();

      let account = accounts.find(x => x.id === idFromUrl());

      if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
        return unauthorized();
      }

      // Add status to the account details
      const accountDetails = basicDetails(account);
      accountDetails.status = account.status || 'Active';
      return ok(accountDetails);
    }

    function createAccount() {
      if (!isAuthorized(Role.Admin)) return unauthorized();

      const account = body;
      if (accounts.find(x => x.email === account.email)) {
        return error(`Email ${account.email} is already registered`);
      }

      account.id = newAccountId();
      account.dateCreated = new Date().toISOString();
      account.isVerified = true;
      account.status = account.status || 'Active'; // Default to Active if not specified
      account.refreshTokens = [];
      delete account.confirmPassword;
      accounts.push(account);
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

      return ok();
    }

    function updateAccount() {
      if (!isAuthenticated()) return unauthorized();

      let params = body;
      let account = accounts.find(x => x.id === idFromUrl());

      if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
        return unauthorized();
      }

      if (!params.password) {
        delete params.password;
      }

      delete params.confirmPassword;

      Object.assign(account, params);
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

      return ok(basicDetails(account));
    }

    function deleteAccount() {
      if (!isAuthenticated()) return unauthorized();

      let account = accounts.find(x => x.id === idFromUrl());

      if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
        return unauthorized();
      }

      accounts = accounts.filter(x => x.id !== idFromUrl());
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

      return ok();
    }

    // Employee functions
    function getEmployees() {
      if (!isAuthenticated()) return unauthorized();
      // Ensure each employee has department and user data
      return ok(self.employees.map(employee => {
        // If department isn't already set, find it
        if (!employee.department && employee.departmentId) {
          const dept = self.departments.find(d => d.id === employee.departmentId);
          if (dept) {
            employee.department = {
              id: dept.id,
              name: dept.name,
              description: dept.description
            };
          }
        }
        return employee;
      }));
    }

    function getEmployeeById() {
      if (!isAuthenticated()) return unauthorized();
      const employee = self.employees.find(x => x.id === idFromUrl());
      if (employee && employee.departmentId && !employee.department) {
        const dept = self.departments.find(d => d.id === employee.departmentId);
        if (dept) {
          employee.department = {
            id: dept.id,
            name: dept.name,
            description: dept.description
          };
        }
      }
      return ok(employee);
    }

    function createEmployee() {
      if (!isAuthenticated() || !isAuthorized(Role.Admin)) return unauthorized();
      const employee = body;
      employee.id = self.employees.length ? Math.max(...self.employees.map(x => x.id)) + 1 : 1;
      
      // Link with account if userId/accountId is provided
      if (employee.userId || employee.accountId) {
        const accountId = Number(employee.userId || employee.accountId);
        const account = accounts.find(a => a.id === accountId);
        
        if (account) {
          // Set user data from account
          employee.user = {
            id: account.id,
            firstName: account.firstName,
            lastName: account.lastName,
            email: account.email
          };
        }
      }
      
      // Add department information
      if (employee.departmentId) {
        const deptId = Number(employee.departmentId);
        const department = self.departments.find(d => d.id === deptId);
        
        if (department) {
          employee.department = {
            id: department.id,
            name: department.name,
            description: department.description
          };
          
          // Increment department employee count
          const deptIndex = self.departments.findIndex(d => d.id === deptId);
          if (deptIndex !== -1) {
            self.departments[deptIndex].employeeCount++;
          }
        }
      }
      
      console.log('Created employee:', employee);
      self.employees.push(employee);
      return ok(employee);
    }

    function updateEmployee() {
      if (!isAuthenticated() || !isAuthorized(Role.Admin)) return unauthorized();
      const employeeIndex = self.employees.findIndex(x => x.id === idFromUrl());
      if (employeeIndex === -1) return error('Employee not found');
      
      const updatedEmployee = body;
      const currentEmployee = self.employees[employeeIndex];
      
      // Check if department is changing
      if (updatedEmployee.departmentId && Number(updatedEmployee.departmentId) !== Number(currentEmployee.departmentId)) {
        const oldDeptId = Number(currentEmployee.departmentId);
        const newDeptId = Number(updatedEmployee.departmentId);
        
        // Decrement old department count
        const oldDeptIndex = self.departments.findIndex(d => d.id === oldDeptId);
        if (oldDeptIndex !== -1) {
          self.departments[oldDeptIndex].employeeCount = Math.max(0, self.departments[oldDeptIndex].employeeCount - 1);
        }
        
        // Increment new department count
        const newDeptIndex = self.departments.findIndex(d => d.id === newDeptId);
        if (newDeptIndex !== -1) {
          self.departments[newDeptIndex].employeeCount++;
          
          // Update department reference
          updatedEmployee.department = {
            id: self.departments[newDeptIndex].id,
            name: self.departments[newDeptIndex].name,
            description: self.departments[newDeptIndex].description
          };
        }
      } else if (!updatedEmployee.department && currentEmployee.department) {
        // Keep the current department reference if not provided in update
        updatedEmployee.department = currentEmployee.department;
      }
      
      // Preserve user info if not provided
      if (!updatedEmployee.user && currentEmployee.user) {
        updatedEmployee.user = currentEmployee.user;
      }
      
      // Update the employee
      Object.assign(self.employees[employeeIndex], updatedEmployee);
      return ok(self.employees[employeeIndex]);
    }

    function deleteEmployee() {
      if (!isAuthenticated() || !isAuthorized(Role.Admin)) return unauthorized();
      self.employees = self.employees.filter(x => x.id !== idFromUrl());
      return ok();
    }

    // Department functions
    function getDepartments() {
      if (!isAuthenticated()) return unauthorized();
      return ok(self.departments);
    }

    function getDepartmentById() {
      if (!isAuthenticated()) return unauthorized();
      const department = self.departments.find(x => x.id === idFromUrl());
      return ok(department);
    }

    function createDepartment() {
      if (!isAuthenticated() || !isAuthorized(Role.Admin)) return unauthorized();
      const department = body;
      department.id = self.departments.length ? Math.max(...self.departments.map(x => x.id)) + 1 : 1;
      department.employeeCount = 0;
      self.departments.push(department);
      return ok(department);
    }

    function updateDepartment() {
      if (!isAuthenticated() || !isAuthorized(Role.Admin)) return unauthorized();
      const departmentIndex = self.departments.findIndex(x => x.id === idFromUrl());
      if (departmentIndex === -1) return error('Department not found');
      const employeeCount = self.departments[departmentIndex].employeeCount;
      Object.assign(self.departments[departmentIndex], body);
      self.departments[departmentIndex].employeeCount = employeeCount;
      return ok(self.departments[departmentIndex]);
    }

    function deleteDepartment() {
      if (!isAuthenticated() || !isAuthorized(Role.Admin)) return unauthorized();
      self.departments = self.departments.filter(x => x.id !== idFromUrl());
      return ok();
    }

    // Request functions
    function getRequests() {
      if (!isAuthenticated()) return unauthorized();
      
      const requestsWithItems = self.requests.map(request => {
        // Create a new object to avoid modifying the original
        const formattedRequest = { ...request } as any;
        
        // Ensure employee data is attached
        if (formattedRequest.employeeId && !formattedRequest.employee) {
          const employee = self.employees.find(e => e.id === formattedRequest.employeeId);
          if (employee) {
            formattedRequest.employee = {
              id: employee.id,
              employeeId: employee.employeeId,
              firstName: employee.firstName,
              lastName: employee.lastName,
              position: employee.position
            };
          }
        }
        
        // Ensure items exist in all expected formats
        const defaultItems = [{ name: 'Default Item', quantity: 1 }];
        
        // Set items in all formats for maximum compatibility
        formattedRequest.requestItems = formattedRequest.requestItems || formattedRequest.items || formattedRequest.RequestItems || defaultItems;
        formattedRequest.items = formattedRequest.items || formattedRequest.requestItems || formattedRequest.RequestItems || defaultItems;
        formattedRequest.RequestItems = formattedRequest.RequestItems || formattedRequest.requestItems || formattedRequest.items || defaultItems;
        
        return formattedRequest;
      });
      
      return ok(requestsWithItems);
    }

    function getRequestById() {
      if (!isAuthenticated()) return unauthorized();
      const request = self.requests.find(x => x.id === idFromUrl());
      if (!request) return error('Request not found');
      
      // Add employee data if not present
      if (request.employeeId) {
        if (!request.employee) {
          const employee = self.employees.find(e => e.id === request.employeeId);
          if (employee) {
            request.employee = {
              id: employee.id,
              employeeId: employee.employeeId,
              firstName: employee.user?.firstName || employee.firstName,
              lastName: employee.user?.lastName || employee.lastName,
              position: employee.position
            };
          }
        }
      }
      
      // Convert requestItems to items for frontend compatibility
      if (request.requestItems && !request.hasOwnProperty('items')) {
        (request as any).items = request.requestItems.map((item: any) => ({
          name: item.name,
          quantity: item.quantity || 1
        }));
      }
      
      // Only add default items if there are no items defined at all
      if (!request.requestItems && !request.hasOwnProperty('items')) {
        (request as any).items = [
          { name: 'Default Item', quantity: 1 }
        ];
      }
      
      return ok(request);
    }

    function createRequest() {
      if (!isAuthenticated()) return unauthorized();
      const request = body;
      
      console.log('Creating request with data:', request);
      
      // Standardize type and status casing
      if (request.type) {
        // Capitalize first letter of type
        request.type = request.type.charAt(0).toUpperCase() + request.type.slice(1).toLowerCase();
      }
      
      if (request.status) {
        // Capitalize first letter of status
        request.status = request.status.charAt(0).toUpperCase() + request.status.slice(1).toLowerCase();
      } else {
        request.status = 'Pending'; // Default status with correct casing
      }
      
      // Process items - ensure they're valid and preserve casing
      if (request.items && request.items.length > 0) {
        // Keep original item names but filter out empty ones
        const validItems = request.items.filter((item: any) => item && item.name && item.name.trim() !== '');
        
        if (validItems.length > 0) {
          (request as any).items = validItems;
          // Also set as requestItems for consistency
          request.requestItems = validItems.map((item: any) => ({
            name: item.name,
            quantity: item.quantity || 1
          }));
        } else {
          // If no valid items, use a default
          const defaultItem = { name: 'Default Item', quantity: 1 };
          (request as any).items = [defaultItem];
          request.requestItems = [defaultItem];
        }
      } else {
        // No items provided, use default
        const defaultItem = { name: 'Default Item', quantity: 1 };
        (request as any).items = [defaultItem];
        request.requestItems = [defaultItem];
      }
      
      request.id = self.requests.length ? Math.max(...self.requests.map(x => x.id)) + 1 : 1;
      
      // Find employee details and attach to request
      if (request.employeeId) {
        const employeeId = Number(request.employeeId);
        const employee = self.employees.find(e => e.id === employeeId);
        if (employee) {
          request.employee = {
            id: employee.id,
            employeeId: employee.employeeId,
            firstName: employee.user?.firstName || employee.firstName,
            lastName: employee.user?.lastName || employee.lastName,
            position: employee.position
          };
        }
      }
      
      self.requests.push(request);
      return ok(request);
    }

    function updateRequest() {
      if (!isAuthenticated()) return unauthorized();
      
      const requestId = idFromUrl();
      console.log(`Updating request with ID: ${requestId}`, body);
      
      const requestIndex = self.requests.findIndex(x => x.id === requestId);
      if (requestIndex === -1) {
        console.error(`Request not found with ID: ${requestId}`);
        return error('Request not found');
      }

      // Get the current user's account
      const account = currentAccount();
      const existingRequest = self.requests[requestIndex];

      // Only allow admin users or the request's own employee to update it
      const currentUserIsAdmin = isAuthorized(Role.Admin);
      let userIsRequestOwner = false;
      
      // Check if current user is the owner of this request
      if (account && !currentUserIsAdmin) {
        // Find employee record for current user
        const userEmployee = self.employees.find(e => e.user && e.user.id === account.id);
        if (userEmployee && existingRequest.employeeId === userEmployee.id) {
          userIsRequestOwner = true;
          
          // Non-admin users can only update items, not status
          // Preserve the existing status
          body.status = existingRequest.status;
        }
      }
      
      // Only proceed if user is admin or request owner
      if (!currentUserIsAdmin && !userIsRequestOwner) {
        return unauthorized();
      }
      
      // Process items - ensure they're valid and preserve casing
      if (body.items && body.items.length > 0) {
        // Keep original item names but filter out empty ones
        const validItems = body.items.filter((item: any) => item && item.name && item.name.trim() !== '');
        
        if (validItems.length > 0) {
          (body as any).items = validItems;
          // Also set as requestItems for consistency
          body.requestItems = validItems.map((item: any) => ({
            name: item.name,
            quantity: item.quantity || 1
          }));
        }
      }
      
      // Standardize type and status casing
      if (body.type) {
        // Capitalize first letter of type
        body.type = body.type.charAt(0).toUpperCase() + body.type.slice(1).toLowerCase();
      }
      
      if (body.status) {
        // Capitalize first letter of status
        body.status = body.status.charAt(0).toUpperCase() + body.status.slice(1).toLowerCase();
      }
      
      // Merge the changes into the existing request
      const updatedRequest = { ...self.requests[requestIndex], ...body };
      self.requests[requestIndex] = updatedRequest;
      
      console.log('Request updated successfully:', updatedRequest);
      
      return ok(updatedRequest);
    }

    function deleteRequest() {
      if (!isAuthenticated() || !isAuthorized(Role.Admin)) return unauthorized();
      self.requests = self.requests.filter(x => x.id !== idFromUrl());
      return ok();
    }

    // Workflow functions
    function getWorkflows() {
      if (!isAuthenticated()) return unauthorized();
      // Add employee information to each workflow
      const workflowsWithEmployeeInfo = self.workflows.map(workflow => {
        const employee = self.employees.find(e => e.id === workflow.employeeId);
        return {
          ...workflow,
          employee: employee || { 
            id: workflow.employeeId,
            employeeId: `EMP${workflow.employeeId}`,
            firstName: 'Unknown',
            lastName: 'Employee',
            position: 'Unknown'
          }
        };
      });
      return ok(workflowsWithEmployeeInfo);
    }

    function getWorkflowsByEmployeeId() {
      if (!isAuthenticated()) return unauthorized();
      const employeeId = idFromUrl();
      const workflows = self.workflows.filter(w => w.employeeId === employeeId);
      
      // Add employee information to each workflow
      const workflowsWithEmployeeInfo = workflows.map(workflow => {
        const employee = self.employees.find(e => e.id === workflow.employeeId);
        return {
          ...workflow,
          employee: employee || { 
            id: workflow.employeeId,
            employeeId: `EMP${workflow.employeeId}`,
            firstName: 'Unknown',
            lastName: 'Employee',
            position: 'Unknown'
          }
        };
      });
      
      return ok(workflowsWithEmployeeInfo);
    }

    function getWorkflowById() {
      if (!isAuthenticated()) return unauthorized();
      const workflow = self.workflows.find(x => x.id === idFromUrl());
      
      // Add employee information
      if (workflow) {
        const employee = self.employees.find(e => e.id === workflow.employeeId);
        workflow.employee = employee || { 
          id: workflow.employeeId,
          employeeId: `EMP${workflow.employeeId}`,
          firstName: 'Unknown',
          lastName: 'Employee',
          position: 'Unknown'
        };
      }
      
      return ok(workflow);
    }

    function createWorkflow() {
      if (!isAuthenticated() || !isAuthorized(Role.Admin)) return unauthorized();
      const workflow = body;
      workflow.id = self.workflows.length ? Math.max(...self.workflows.map(x => x.id)) + 1 : 1;
      self.workflows.push(workflow);
      return ok(workflow);
    }

    function updateWorkflow() {
      if (!isAuthenticated() || !isAuthorized(Role.Admin)) return unauthorized();
      const workflowIndex = self.workflows.findIndex(x => x.id === idFromUrl());
      if (workflowIndex === -1) return error('Workflow not found');
      Object.assign(self.workflows[workflowIndex], body);
      return ok(self.workflows[workflowIndex]);
    }

    function deleteWorkflow() {
      if (!isAuthenticated() || !isAuthorized(Role.Admin)) return unauthorized();
      self.workflows = self.workflows.filter(x => x.id !== idFromUrl());
      return ok();
    }

    function updateWorkflowStatus() {
      if (!isAuthenticated() || !isAuthorized(Role.Admin)) return unauthorized();
      const workflowId = idFromUrl();
      const workflow = self.workflows.find(w => w.id === workflowId);
      if (!workflow) return error('Workflow not found');
      Object.assign(workflow, body);
      return ok(workflow);
    }

    // Add this function to handle employee transfers
    function transferEmployee() {
      if (!isAuthenticated()) return unauthorized();
      
      const id = idFromUrl();
      const { departmentId } = body;
      
      console.log('Transfer employee request:', { id, departmentId, body, url });
      
      // Ensure IDs are numbers
      const employeeId = Number(id);
      const deptId = Number(departmentId);
      
      console.log('Parsed IDs:', { employeeId, deptId });
      
      // Find the employee - use findIndex to get the position
      const employeeIndex = self.employees.findIndex(e => Number(e.id) === employeeId);
      
      if (employeeIndex === -1) {
        console.error(`Employee not found with ID: ${employeeId}. Available employees:`, self.employees.map(e => ({ id: e.id, name: e.firstName + ' ' + e.lastName })));
        return error('Employee not found');
      }
      
      // Find the department
      const department = self.departments.find(d => Number(d.id) === deptId);
      if (!department) {
        console.error(`Department not found with ID: ${deptId}. Available departments:`, self.departments.map(d => ({ id: d.id, name: d.name })));
        return error('Department not found');
      }
      
      // Update old department employee count
      const oldDepartmentId = Number(self.employees[employeeIndex].departmentId);
      if (oldDepartmentId !== deptId) {
        const oldDepartmentIndex = self.departments.findIndex(d => Number(d.id) === oldDepartmentId);
        if (oldDepartmentIndex !== -1) {
          self.departments[oldDepartmentIndex].employeeCount--;
        }
        
        // Update new department employee count
        const newDepartmentIndex = self.departments.findIndex(d => Number(d.id) === deptId);
        if (newDepartmentIndex !== -1) {
          self.departments[newDepartmentIndex].employeeCount++;
        }
      }
      
      // Update employee department
      self.employees[employeeIndex].departmentId = deptId;
      self.employees[employeeIndex].department = {
        id: department.id,
        name: department.name,
        description: department.description
      };
      
      // Create a workflow entry for this transfer
      self.workflows.push({
        id: self.workflows.length ? Math.max(...self.workflows.map(w => w.id)) + 1 : 1,
        employeeId: employeeId,
        type: 'Transfer',
        details: { 
          description: `Transferred from department ${oldDepartmentId} to department ${deptId}`
        },
        status: 'Completed',
        employee: {
          id: self.employees[employeeIndex].id,
          employeeId: self.employees[employeeIndex].employeeId,
          firstName: self.employees[employeeIndex].firstName,
          lastName: self.employees[employeeIndex].lastName,
          position: self.employees[employeeIndex].position
        }
      });
      
      console.log('Transfer successful:', {
        employee: self.employees[employeeIndex],
        department: department
      });
      
      return ok({
        success: true,
        message: 'Employee transferred successfully'
      });
    }

    // helper functions

    function ok(body?) {
      return of(new HttpResponse({ status: 200, body }));
    }

    function error(message?) {
      return throwError({ error: { message } });
    }

    function unauthorized() {
      return throwError({ status: 401, error: { message: 'Unauthorized' } });
    }

    function basicDetails(account) {
      const { id, title, firstName, lastName, email, role, dateCreated, isVerified } = account;
      return { id, title, firstName, lastName, email, role, dateCreated, isVerified, status: account.status || 'Active' };
    }

    function isAuthenticated() {
      const account = currentAccount();
      return !!account;
    }

    function isAuthorized(role) {
      const account = currentAccount();
      if (!account) return false;
      return account.role === role;
    }

    function idFromUrl() {
      const urlParts = url.split('/');
      
      // Special case for URLs like /employees/1/transfer
      if (urlParts.length >= 4 && urlParts[urlParts.length - 1] === 'transfer') {
        return parseInt(urlParts[urlParts.length - 2]);
      }
      
      // Special case for URLs like /workflows/employee/1
      if (urlParts.length >= 4 && urlParts[urlParts.length - 2] === 'employee') {
        return parseInt(urlParts[urlParts.length - 1]);
      }
      
      // Special case for URLs like /workflows/1/status
      if (urlParts.length >= 4 && urlParts[urlParts.length - 1] === 'status') {
        return parseInt(urlParts[urlParts.length - 2]);
      }
      
      // Default case for regular URLs like /employees/1
      return parseInt(urlParts[urlParts.length - 1]);
    }

    function newAccountId() {
      return accounts.length ? Math.max(...accounts.map(x => x.id)) + 1 : 1;
    }

    function currentAccount() {
      try {
        const authHeader = headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return null;

        const token = authHeader.split(' ')[1];
        
        // For fake backend, just assume the token is valid if it exists
        if (environment.useFakeBackend) {
          // Try to find the account by parsing the token
          try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const account = accounts.find(x => x.id === tokenData.id);
            return account || accounts[0]; // Default to first account if not found
          } catch {
            // If parsing fails, just return the first account
            return accounts[0];
          }
        }
        
        // For real backend, validate properly
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        if (Date.now() > tokenData.exp * 1000) return null;

        const account = accounts.find(x => x.id === tokenData.id);
        return account || null;
      } catch {
        // In case of any error, treat as unauthorized
        return null;
      }
    }

    function generateJwtToken(account) {
      const tokenPayload = {
        exp: Math.round(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).getTime() / 1000), // 1 year expiry
        iat: Math.round(Date.now() / 1000),
        id: account.id,
        role: account.role
      };
      return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
    }

    function generateRefreshToken() {
      const tokenPayload = {
        exp: Math.round(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime() / 1000),
        iat: Math.round(Date.now() / 1000)
      };
      return `fake-refresh-token.${btoa(JSON.stringify(tokenPayload))}`;
    }

    function getRefreshToken() {
      return (document.cookie.split(';').find(x => x.includes('fakeRefreshToken')) || '=').split('=')[1];
    }

    function register() {
      const account = body;

      if (accounts.find(x => x.email === account.email)) {
        setTimeout(() => {
          self.alertService.info(
            `<h4>Email Already Registered</h4>
            <p>Your email ${account.email} is already registered.</p>
            <p>If you don't know your password please visit the <a href="${location.origin}/account/forgot-password">forgot password</a> page.</p>
            <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>`,
            { autoClose: false }
          );
        }, 1000);

        return ok();
      }

      account.id = newAccountId();
      account.role = account.id === 1 ? Role.Admin : Role.User;
      account.dateCreated = new Date().toISOString();
      account.verificationToken = new Date().getTime().toString();
      account.isVerified = false;
      account.refreshTokens = [];
      delete account.confirmPassword;
      accounts.push(account);
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

      setTimeout(() => {
        const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
        self.alertService.info(`
          <h4>Verification Email</h4>
          <p>Thanks for registering!</p>
          <p>Please click the below link to verify your email address:</p>
          <a href="${verifyUrl}">${verifyUrl}</a>
          <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
        `, { autoclose: false });
      }, 1000);

      return ok();
    }

    function forgotPassword() {
      const { email } = body;
      const account = accounts.find(x => x.email === email);

      if (!account) return ok();

      account.resetToken = new Date().getTime().toString();
      account.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

      const resetUrl = `${location.origin}/account/reset-password?token=${account.resetToken}`;
      setTimeout(() => {
        self.alertService.info(`
          <div>
            <h4>Reset Password Email</h4>
            <p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</p>
          </div>
        `, 10000);
      });

      return ok();
    }
  }
}

export let fakeBackendProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};

// =============================
// ALT FAKE BACKEND PROVIDER (Angular)
// To use this version, change the import in app.module.ts to:
// import { FakeBackendInterceptor } from './_helpers/fake-backend';
// and ensure the correct export is used below.
// =============================

@Injectable()
export class AltFakeBackendInterceptor implements HttpInterceptor {
    private users = [
        { id: 1, email: 'admin@example.com', password: 'admin', role: 'Admin', employeeId: 1 },
        { id: 2, email: 'user@example.com', password: 'user', role: 'User', employeeId: 2 }
    ];
    private employees = [
        { id: 1, employeeId: 'EMP001', userId: 1, position: 'Developer', departmentId: 1, hireDate: '2025-01-01', status: 'Active' },
        { id: 2, employeeId: 'EMP002', userId: 2, position: 'Designer', departmentId: 2, hireDate: '2025-02-01', status: 'Active' }
    ];
    private departments = [
        { id: 1, name: 'Engineering', description: 'Software development team', employeeCount: 1 },
        { id: 2, name: 'Marketing', description: 'Marketing team', employeeCount: 1 }
    ];
    private workflows = [
        { id: 1, employeeId: 1, type: 'Onboarding', details: { description: 'Setup workstation' }, status: 'Pending' }
    ];
    private requests = [
        { id: 1, employeeId: 2, type: 'Equipment', requestItems: [{ name: 'Laptop', quantity: 1 }], status: 'Pending' }
    ];

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;
        return of(null)
            .pipe(mergeMap(() => this.handleRoute(url, method, headers, body, next, request)))
            .pipe(materialize())
            .pipe(delay(500))
            .pipe(dematerialize());
    }

    private handleRoute(url: string, method: string, headers: any, body: any, next: HttpHandler, request: HttpRequest<any>): Observable<any> {
        // Accounts Routes
        if (url.endsWith('/accounts/authenticate') && method === 'POST') {
            const { email, password } = body;
            const user = this.users.find(u => u.email === email && u.password === password);
            if (!user) return throwError(() => new Error('Invalid credentials'));
            return of(new HttpResponse({ status: 200, body: { ...user, token: 'fake-jwt-token' } }));
        }
        if (url.endsWith('/accounts') && method === 'GET') {
            return this.authorize(headers, 'Admin', () => of(new HttpResponse({ status: 200, body: this.users })));
        }
        // Employees Routes
        if (url.endsWith('/employees') && method === 'GET') {
            return this.authorize(headers, null, () => of(new HttpResponse({ status: 200, body: this.employees })));
        }
        if (url.endsWith('/employees') && method === 'POST') {
            return this.authorize(headers, 'Admin', () => {
                const employee = { id: this.employees.length + 1, ...body };
                this.employees.push(employee);
                return of(new HttpResponse({ status: 201, body: employee }));
            });
        }
        if (url.match(/\/employees\/\d+$/) && method === 'GET') {
            const id = parseInt(url.split('/').pop()!);
            const employee = this.employees.find(e => e.id === id);
            return this.authorize(headers, null, () => employee ? of(new HttpResponse({ status: 200, body: employee })) : throwError(() => new Error('Employee not found')));
        }
        if (url.match(/\/employees\/\d+$/) && method === 'PUT') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                const employeeIndex = this.employees.findIndex(e => e.id === id);
                if (employeeIndex === -1) return throwError(() => new Error('Employee not found'));
                this.employees[employeeIndex] = { id, ...body };
                return of(new HttpResponse({ status: 200, body: this.employees[employeeIndex] }));
            });
        }
        if (url.match(/\/employees\/\d+$/) && method === 'DELETE') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                this.employees = this.employees.filter(e => e.id !== id);
                return of(new HttpResponse({ status: 200, body: { message: 'Employee deleted' } }));
            });
        }
        if (url.match(/\/employees\/\d+\/transfer$/) && method === 'POST') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/')[2]);
                const employee = this.employees.find(e => e.id === id);
                if (!employee) return throwError(() => new Error('Employee not found'));
                employee.departmentId = body.departmentId;
                this.workflows.push({ id: this.workflows.length + 1, employeeId: id, type: 'Transfer', details: body, status: 'Pending' });
                return of(new HttpResponse({ status: 200, body: { message: 'Employee transferred' } }));
            });
        }
        // Departments Routes
        if (url.endsWith('/departments') && method === 'GET') {
            return this.authorize(headers, null, () => of(new HttpResponse({ status: 200, body: this.departments })));
        }
        if (url.endsWith('/departments') && method === 'POST') {
            return this.authorize(headers, 'Admin', () => {
                const department = { id: this.departments.length + 1, ...body, employeeCount: 0 };
                this.departments.push(department);
                return of(new HttpResponse({ status: 201, body: department }));
            });
        }
        if (url.match(/\/departments\/\d+$/) && method === 'PUT') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                const deptIndex = this.departments.findIndex(d => d.id === id);
                if (deptIndex === -1) return throwError(() => new Error('Department not found'));
                this.departments[deptIndex] = { id, ...body, employeeCount: this.departments[deptIndex].employeeCount };
                return of(new HttpResponse({ status: 200, body: this.departments[deptIndex] }));
            });
        }
        if (url.match(/\/departments\/\d+$/) && method === 'DELETE') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                this.departments = this.departments.filter(d => d.id !== id);
                return of(new HttpResponse({ status: 200, body: { message: 'Department deleted' } }));
            });
        }
        // Workflows Routes
        if (url.match(/\/workflows\/employee\/\d+$/) && method === 'GET') {
            return this.authorize(headers, null, () => {
                const employeeId = parseInt(url.split('/').pop()!);
                const workflows = this.workflows.filter(w => w.employeeId === employeeId);
                return of(new HttpResponse({ status: 200, body: workflows }));
            });
        }
        if (url.endsWith('/workflows') && method === 'POST') {
            return this.authorize(headers, 'Admin', () => {
                const workflow = { id: this.workflows.length + 1, ...body };
                this.workflows.push(workflow);
                return of(new HttpResponse({ status: 201, body: workflow }));
            });
        }
        // Requests Routes
        if (url.endsWith('/requests') && method === 'GET') {
            return this.authorize(headers, 'Admin', () => of(new HttpResponse({ status: 200, body: this.requests })));
        }
        if (url.endsWith('/requests') && method === 'POST') {
            return this.authorize(headers, 'Admin', () => {
                const request = { id: this.requests.length + 1, employeeId: this.getUser(headers)?.employeeId, ...body };
                this.requests.push(request);
                return of(new HttpResponse({ status: 201, body: request }));
            });
        }
        if (url.match(/\/requests\/\d+$/) && method === 'PUT') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                const reqIndex = this.requests.findIndex(r => r.id === id);
                if (reqIndex === -1) return throwError(() => new Error('Request not found'));
                this.requests[reqIndex] = { id, ...body };
                return of(new HttpResponse({ status: 200, body: this.requests[reqIndex] }));
            });
        }
        if (url.match(/\/requests\/\d+$/) && method === 'DELETE') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                this.requests = this.requests.filter(r => r.id !== id);
                return of(new HttpResponse({ status: 200, body: { message: 'Request deleted' } }));
            });
        }
        return next.handle(request);
    }

    private authorize(headers: any, requiredRole: string | null, success: () => Observable<HttpEvent<any>>): Observable<HttpEvent<any>> {
        const user = this.getUser(headers);
        if (!user) return throwError(() => new Error('Unauthorized'));
        if (requiredRole && user.role !== requiredRole) return throwError(() => new Error('Forbidden'));
        return success();
    }

    private getUser(headers: any) {
        const authHeader = headers.get('Authorization');
        if (!authHeader || authHeader !== 'Bearer fake-jwt-token') return null;
        return this.users[0]; // Always return the first user for demo purposes
    }
}

export const altFakeBackendProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: AltFakeBackendInterceptor,
    multi: true
};
// =============================
// END ALT FAKE BACKEND PROVIDER
// =============================