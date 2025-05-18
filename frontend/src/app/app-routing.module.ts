import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { UsersComponent } from './users/users.component';
import { AuthGuard } from './_helpers';
import { Role } from './_models';
import { OverviewComponent } from './admin/overview.component';
import { LayoutComponent as AdminLayoutComponent } from './admin/layout.component';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const accountsModule = () => import('./admin/accounts/accounts.module').then(x => x.AccountsModule);
const employeesModule = () => import('./admin/employees/employees.module').then(x => x.EmployeesModule);
const departmentsModule = () => import('./admin/departments/departments.module').then(x => x.DepartmentsModule);
const requestsModule = () => import('./admin/requests/requests.module').then(x => x.RequestsModule);
const workflowsModule = () => import('./admin/workflows/workflows.module').then(x => x.WorkflowsModule);
const profileModule = () => import('./profile/profile.module').then(x => x.ProfileModule);

const routes: Routes = [
    // Default route - accessible to everyone including guests
    { 
        path: '', 
        component: HomeComponent
    },
    
    // Admin dashboard 
    { 
        path: 'admin', 
        component: AdminLayoutComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin] },
        children: [
            { path: '', component: OverviewComponent }
        ]
    },
    
    // Admin sections with proper authorization
    { path: 'accounts', loadChildren: accountsModule, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
    { path: 'employees', loadChildren: employeesModule, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
    { path: 'departments', loadChildren: departmentsModule, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
    
    // Requests - accessible by all users, but with different views based on role
    { path: 'requests', loadChildren: requestsModule, canActivate: [AuthGuard] },
    
    // Workflows - admin only
    { path: 'workflows', loadChildren: workflowsModule, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
    
    // User sections
    { path: 'users', component: UsersComponent, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
    { path: 'account', loadChildren: accountModule },
    { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard] },
    
    // Wildcard route - redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }