import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services';
import { Account } from '../_models';

interface UserWithEditing extends Account {
    isEditing: boolean;
}

@Component({
    templateUrl: 'users.component.html',
    styleUrls: ['users.component.less']
})
export class UsersComponent implements OnInit {
    users: UserWithEditing[] = [];
    loading = false;
    private originalUser: UserWithEditing | null = null;

    constructor(private accountService: AccountService) { }

    ngOnInit() {
        this.loading = true;
        this.accountService.getAll()
            .subscribe(users => {
                this.users = users.map(user => ({ ...user, isEditing: false }));
                this.loading = false;
            });
    }

    startEdit(user: UserWithEditing) {
        // Store original values
        this.originalUser = { ...user };
        user.isEditing = true;
    }

    saveEdit(user: UserWithEditing) {
        this.loading = true;
        // Only update the allowed fields
        const updateData = {
            title: user.title,
            firstName: user.firstName,
            lastName: user.lastName
        };

        this.accountService.update(user.id, updateData)
            .subscribe({
                next: () => {
                    user.isEditing = false;
                    this.originalUser = null;
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Update failed:', error);
                    // Revert changes on error
                    if (this.originalUser) {
                        Object.assign(user, this.originalUser);
                    }
                    user.isEditing = false;
                    this.originalUser = null;
                    this.loading = false;
                }
            });
    }

    cancelEdit(user: UserWithEditing) {
        // Revert to original values
        if (this.originalUser) {
            Object.assign(user, this.originalUser);
        }
        user.isEditing = false;
        this.originalUser = null;
    }
} 