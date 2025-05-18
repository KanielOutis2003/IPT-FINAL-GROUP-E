import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { WorkflowService } from '../../_services/workflow.service';
import { AlertService } from '../../_services/alert.service';
import { EmployeeService } from '../../_services/employee.service';

@Component({ templateUrl: './add-edit.component.html' })
export class AddEditComponent implements OnInit {
    id?: number;
    employeeId?: number;
    workflow: any = {
        details: { description: '' },
        status: 'Pending'
    };
    employees: any[] = [];
    loading = false;
    submitted = false;
    errorMessage: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private workflowService: WorkflowService,
        private employeeService: EmployeeService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.employeeId = Number(this.route.snapshot.queryParams['employeeId']);
        
        // If employeeId is provided, set it in the workflow
        if (this.employeeId) {
            this.workflow.employeeId = this.employeeId;
        }
        
        // Load employees for dropdown
        this.loadEmployees();
        
        if (this.id) {
            this.loading = true;
            this.workflowService.getById(this.id)
                .pipe(first())
                .subscribe({
                    next: x => {
                        this.workflow = x;
                        // Ensure details object exists
                        if (!this.workflow.details) {
                            this.workflow.details = { description: '' };
                        }
                        
                        // Convert task to description if needed
                        if (this.workflow.details.task && !this.workflow.details.description) {
                            this.workflow.details.description = this.workflow.details.task;
                        }
                        
                        this.loading = false;
                    },
                    error: error => {
                        this.errorMessage = error.message || 'Failed to load workflow';
                        this.alertService.error(this.errorMessage);
                        this.loading = false;
                    }
                });
        }
    }
    
    loadEmployees() {
        this.employeeService.getAll()
            .pipe(first())
            .subscribe({
                next: employees => {
                    this.employees = employees;
                },
                error: error => {
                    this.errorMessage = error.message || 'Failed to load employees';
                    this.alertService.error(this.errorMessage);
                }
            });
    }

    onSubmit() {
        this.submitted = true;
        this.loading = true;
        this.errorMessage = '';
        
        // Validate required fields
        if (!this.workflow.type || (!this.employeeId && !this.workflow.employeeId) || 
            !this.workflow.details?.description || !this.workflow.status) {
            this.errorMessage = 'Please fill in all required fields';
            this.loading = false;
            return;
        }

        if (this.id) {
            this.updateWorkflow();
        } else {
            this.createWorkflow();
        }
    }

    private createWorkflow() {
        // Ensure employee data is attached
        if (this.employeeId && !this.workflow.employeeId) {
            this.workflow.employeeId = this.employeeId;
        }
        
        this.workflowService.create(this.workflow)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Workflow created successfully', { keepAfterRouteChange: true });
                    this.navigateBack();
                },
                error: error => {
                    this.errorMessage = error.message || 'An error occurred while creating the workflow';
                    this.alertService.error(this.errorMessage);
                    this.loading = false;
                }
            });
    }

    private updateWorkflow() {
        this.workflowService.update(this.id!, this.workflow)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.navigateBack();
                },
                error: error => {
                    this.errorMessage = error.message || 'An error occurred while updating the workflow';
                    this.alertService.error(this.errorMessage);
                    this.loading = false;
                }
            });
    }
    
    public navigateBack() {
        if (this.employeeId) {
            this.router.navigate(['/workflows'], { queryParams: { employeeId: this.employeeId } });
        } else {
            this.router.navigate(['/workflows']);
        }
    }
} 