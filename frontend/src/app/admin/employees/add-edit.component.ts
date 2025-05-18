import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EmployeeService } from '../../_services/employee.service';
import { AlertService } from '../../_services/alert.service';
import { AccountService } from '../../_services/account.service';

@Component({ templateUrl: './add-edit.component.html' })
export class AddEditComponent implements OnInit {
    id?: number;
    form!: FormGroup;
    accounts: any[] = [];
    departments: any[] = [];
    loading = false;
    submitted = false;
    errorMessage: string = '';
    isEditMode = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private employeeService: EmployeeService,
        private alertService: AlertService,
        private accountService: AccountService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isEditMode = !!this.id;
        
        this.form = this.formBuilder.group({
            employeeId: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]],
            accountId: ['', Validators.required],
            position: ['', Validators.required],
            departmentId: ['', Validators.required],
            hireDate: ['', Validators.required],
            status: ['Active', Validators.required]
        });

        // Load reference data for dropdowns
        this.loadDepartments();
        this.loadAccounts();

        if (this.id) {
            // Load employee data
            this.employeeService.getById(this.id)
                .pipe(first())
                .subscribe({
                    next: employee => {
                        console.log('Loaded employee:', employee);
                        
                        // Format the hire date for the date input (YYYY-MM-DD)
                        let hireDate = employee.hireDate;
                        if (hireDate) {
                            // If date is in timestamp format, convert to YYYY-MM-DD
                            if (typeof hireDate === 'string' && hireDate.includes('T')) {
                                hireDate = hireDate.split('T')[0];
                            } else if (hireDate instanceof Date) {
                                hireDate = hireDate.toISOString().split('T')[0];
                            }
                        }
                        
                        // If we're in edit mode, ensure the account is in the dropdown list
                        if (employee.userId) {
                            this.accountService.getById(employee.userId)
                                .pipe(first())
                                .subscribe({
                                    next: account => {
                                        // Add this account to the list if it's not already there
                                        if (!this.accounts.some(a => a.id === account.id)) {
                                            this.accounts = [...this.accounts, account];
                                        }
                                        
                                        // Now patch the form values
                                        this.form.patchValue({
                                            employeeId: employee.employeeId,
                                            accountId: employee.userId,
                                            position: employee.position,
                                            departmentId: employee.departmentId?.toString(),
                                            hireDate: hireDate,
                                            status: employee.status
                                        });
                                        
                                        console.log('Form patched with account:', this.form.value);
                                    },
                                    error: error => {
                                        this.errorMessage = error;
                                        this.alertService.error('Error loading account details');
                                    }
                                });
                        } else {
                            // No account linked, just update the form
                            this.form.patchValue({
                                employeeId: employee.employeeId,
                                position: employee.position,
                                departmentId: employee.departmentId?.toString(),
                                hireDate: hireDate,
                                status: employee.status
                            });
                            
                            console.log('Form patched without account:', this.form.value);
                        }
                    },
                    error: error => {
                        this.errorMessage = error;
                        this.alertService.error('Error loading employee details');
                    }
                });
        }
    }

    loadDepartments() {
        this.employeeService.getDepartments().subscribe({
            next: departments => {
                this.departments = departments;
                console.log('Loaded departments:', departments);
            },
            error: error => {
                this.errorMessage = error;
                this.alertService.error('Error loading departments');
            }
        });
    }

    loadAccounts() {
        // Fetch all accounts for the Account dropdown
        this.accountService.getAll().subscribe({
            next: accounts => {
                // For new employees, show only active accounts
                // For editing, we'll add the current account specifically
                this.accounts = this.isEditMode 
                    ? accounts 
                    : accounts.filter(account => account.status === 'Active');
                console.log('Loaded accounts:', this.accounts);
            },
            error: error => {
                this.errorMessage = error;
                this.alertService.error('Error loading accounts');
            }
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.errorMessage = '';

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;

        // Map accountId to userId for backend compatibility
        const employee = {
            ...this.form.value,
            userId: this.form.value.accountId
        };

        console.log('Submitting employee data:', employee);

        if (this.id) {
            this.updateEmployee(employee);
        } else {
            this.createEmployee(employee);
        }
    }

    private createEmployee(employee: any) {
        this.employeeService.create(employee)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Employee created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.errorMessage = error.error?.message || 'An error occurred while creating the employee';
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private updateEmployee(employee: any) {
        this.employeeService.update(this.id!, employee)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.errorMessage = error.error?.message || 'An error occurred while updating the employee';
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
} 