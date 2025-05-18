import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountService } from '../_services';
import { EmployeeService } from '../_services/employee.service';
import { RequestService } from '../_services/request.service';
import { DepartmentService } from '../_services/department.service';
import { WorkflowService } from '../_services/workflow.service';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit {
    account: any;
    employeeInfo: any = null;
    requests: any[] = [];
    loading = false;

    // Dashboard stats
    employeeCount: number = 0;
    departmentCount: number = 0;
    pendingRequests: any[] = [];
    activeWorkflows: any[] = [];
    
    constructor(
        public accountService: AccountService,
        private employeeService: EmployeeService,
        private requestService: RequestService,
        private departmentService: DepartmentService,
        private workflowService: WorkflowService,
        private router: Router
    ) {
        this.account = this.accountService.accountValue;
    }
    
    ngOnInit() {
        // Now handle the case where the user is not logged in
        // Instead of redirecting, we'll show the guest dashboard
        if (!this.account) {
            console.log('Not logged in, displaying guest dashboard');
            this.loading = false;
            return;
        }

        this.loading = true;

        // Load appropriate data based on user role
        if (this.account?.role === 'Admin') {
            this.loadAdminDashboard();
        } else {
            this.loadUserDashboard();
        }
    }

    // Navigate to login page
    goToLogin() {
        this.router.navigate(['/account/login']);
    }
    
    // Navigate to register page
    goToRegister() {
        this.router.navigate(['/account/register']);
    }

    private loadAdminDashboard() {
        forkJoin({
            employees: this.employeeService.getAll().pipe(catchError(() => of([]))),
            departments: this.departmentService.getAll().pipe(catchError(() => of([]))),
            requests: this.requestService.getAll().pipe(catchError(() => of([]))),
            workflows: this.workflowService.getAll().pipe(catchError(() => of([])))
        }).subscribe(results => {
            this.employeeCount = results.employees.length;
            this.departmentCount = results.departments.length;
            this.pendingRequests = results.requests.filter(r => r.status === 'Pending');
            this.activeWorkflows = results.workflows.filter(w => w.status === 'Active');
            this.loading = false;
        });
    }

    private loadUserDashboard() {
        // Find employee record for current user
        this.employeeService.getAll().pipe(
            catchError(() => of([]))
        ).subscribe(employees => {
            // Find the employee record that matches the current user's ID
            const userEmployee = employees.find(e => e.userId === this.account.id);
            
            if (userEmployee) {
                this.employeeInfo = userEmployee;
                
                // Get department details
                this.departmentService.getById(userEmployee.departmentId).pipe(
                    catchError(() => of(null))
                ).subscribe(department => {
                    if (department) {
                        this.employeeInfo.department = department;
                    }
                });
                
                // Get user's requests - use getByEmployeeId instead of getAll
                this.requestService.getByEmployeeId(userEmployee.id).pipe(
                    catchError(() => of([]))
                ).subscribe(requests => {
                    // Sort requests by date
                    this.requests = requests
                        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                    
                    this.loading = false;
                });
            } else {
                this.loading = false;
            }
        });
    }
}