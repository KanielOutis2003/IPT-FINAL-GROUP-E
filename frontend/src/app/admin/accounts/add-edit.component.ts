import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from '../../_services/account.service';
import { AlertService } from '../../_services/alert.service';
import { MustMatch } from '../../_helpers/must-match.validator';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form!: UntypedFormGroup;
    id: string;
    isAddMode: boolean;
    loading = false;
    submitted = false;
    errorMessage: string = '';
    titles = ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr'];

    constructor(
        private formBuilder: UntypedFormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;
    
        this.form = this.formBuilder.group({
            title: ['', Validators.required],
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            role: ['', Validators.required],
            status: ['Active', Validators.required],
            password: ['', [Validators.minLength(6), this.isAddMode ? Validators.required : Validators.nullValidator]],
            confirmPassword: ['']
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });
    
        if (!this.isAddMode) {
            this.accountService.getById(this.id)
                .pipe(first())
                .subscribe({
                    next: x => {
                        if (!x.status) x.status = 'Active';
                        if (!x.title || !this.titles.includes(x.title)) {
                            x.title = 'Mr';
                        }
                        console.log('Account data loaded:', x);
                        this.form.patchValue(x);
                    },
                    error: error => {
                        this.errorMessage = error.error?.message || 'Error loading account';
                        this.alertService.error(error);
                    }
                });
        }
    }
    
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.errorMessage = '';
        this.alertService.clear();
    
        if (this.form.invalid) {
            return;
        }
    
        this.loading = true;
        if (this.isAddMode) {
            this.createAccount();
        } else {
            this.updateAccount();
        }
    }
    
    private createAccount() {
        this.accountService.create(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Account created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.errorMessage = error.error?.message || 'An error occurred while creating the account';
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
    
    private updateAccount() {
        this.accountService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.errorMessage = error.error?.message || 'An error occurred while updating the account';
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}