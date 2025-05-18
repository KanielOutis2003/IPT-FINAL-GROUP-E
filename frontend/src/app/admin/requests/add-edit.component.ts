import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { RequestService } from '../../_services/request.service';
import { AlertService } from '../../_services/alert.service';
import { AccountService } from '../../_services';

@Component({ templateUrl: './add-edit.component.html' })
export class AddEditComponent implements OnInit {
    id?: number;
    request: any = { 
        items: [{ name: '', quantity: 1 }],
        type: 'Equipment' // Set default type with proper casing
    };
    employees: any[] = [];
    workflows: any[] = [];
    loading = false;
    submitted = false;
    errorMessage: string = '';
    isAdmin = false;
    
    // Request type options with proper casing
    requestTypes = [
        { value: 'Equipment', label: 'Equipment Request' },
        { value: 'Expense', label: 'Expense Request' },
        { value: 'Leave', label: 'Leave Request' },
        { value: 'Transfer', label: 'Transfer Request' }
    ];
    
    // Status options
    statusOptions = [
        { value: 'Pending', label: 'Pending' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService,
        private alertService: AlertService,
        private accountService: AccountService
    ) {
        // Check if user is admin
        this.isAdmin = this.accountService.accountValue?.role === 'Admin';
    }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        // Load employees and workflows for dropdowns
        this.requestService.getEmployees().subscribe({
            next: (employees) => {
                this.employees = employees;
                console.log('Loaded employees:', employees);
            },
            error: (error) => {
                console.error('Error loading employees:', error);
                this.alertService.error('Failed to load employees');
            }
        });
        
        this.requestService.getWorkflows().subscribe({
            next: (workflows) => this.workflows = workflows,
            error: (error) => {
                console.error('Error loading workflows:', error);
                this.alertService.error('Failed to load workflows');
            }
        });

        if (this.id) {
            this.requestService.getById(this.id)
                .pipe(first())
                .subscribe({
                    next: (request) => {
                        console.log('Loaded request:', request);
                        this.request = request;
                        
                        // Ensure type has proper casing
                        if (this.request.type) {
                            this.request.type = this.capitalizeFirstLetter(this.request.type);
                        }
                        
                        // Ensure status has proper casing
                        if (this.request.status) {
                            this.request.status = this.capitalizeFirstLetter(this.request.status);
                        }
                        
                        // Ensure items array exists and handle different property names
                        if (!this.request.items) {
                            // Handle RequestItems from real backend
                            if (this.request.RequestItems && this.request.RequestItems.length > 0) {
                                this.request.items = this.request.RequestItems.map((item: any) => ({
                                    name: item.name,
                                    quantity: item.quantity
                                }));
                            }
                            // Handle requestItems from fake backend
                            else if (this.request.requestItems && this.request.requestItems.length > 0) {
                                this.request.items = this.request.requestItems.map((item: any) => ({
                                    name: item.name,
                                    quantity: item.quantity
                                }));
                            } else {
                                this.request.items = [{ name: '', quantity: 1 }];
                            }
                        }
                    },
                    error: (error) => {
                        console.error('Error loading request:', error);
                        this.alertService.error('Failed to load request details');
                    }
                });
        }

        // Ensure items array is always initialized
        if (!this.request.items || this.request.items.length === 0) {
            this.request.items = [{ name: '', quantity: 1 }];
        }
    }
    
    // Helper function to capitalize first letter
    capitalizeFirstLetter(str: string): string {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    onSubmit() {
        this.submitted = true;
        this.loading = true;
        
        // Validate items - ensure no empty names
        const validItems = this.request.items.filter((item: any) => item.name && item.name.trim() !== '');
        if (validItems.length === 0) {
            this.errorMessage = 'At least one item with a name is required';
            this.alertService.error(this.errorMessage);
            this.loading = false;
            return;
        }
        
        // Only use valid items
        this.request.items = validItems;

        // Always set status to 'Pending' (with capital P) when creating a new request
        if (!this.id) {
            this.request.status = 'Pending';
            delete this.request.workflowId;
            delete this.request.description;
            
            // Ensure employeeId is a number
            if (this.request.employeeId && typeof this.request.employeeId === 'string') {
                this.request.employeeId = parseInt(this.request.employeeId, 10);
            }
        }
        
        // Ensure type has proper casing
        if (this.request.type) {
            this.request.type = this.capitalizeFirstLetter(this.request.type);
        }
        
        // Ensure status has proper casing
        if (this.request.status) {
            this.request.status = this.capitalizeFirstLetter(this.request.status);
        }

        if (this.id) {
            this.updateRequest();
        } else {
            this.createRequest();
        }
    }

    private createRequest() {
        console.log('Creating request with data:', this.request);
        
        this.requestService.create(this.request)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Request created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.errorMessage = error.error?.message || 'An error occurred while creating the request';
                    this.alertService.error(this.errorMessage);
                    this.loading = false;
                }
            });
    }

    private updateRequest() {
        this.requestService.update(this.id!, this.request)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.errorMessage = error.error?.message || 'An error occurred while updating the request';
                    this.alertService.error(this.errorMessage);
                    this.loading = false;
                }
            });
    }

    addItem() {
        if (!this.request.items) this.request.items = [];
        this.request.items.push({ name: '', quantity: 1 });
    }

    removeItem(index: number) {
        this.request.items.splice(index, 1);
        // Ensure there's always at least one item
        if (this.request.items.length === 0) {
            this.request.items.push({ name: '', quantity: 1 });
        }
    }
} 