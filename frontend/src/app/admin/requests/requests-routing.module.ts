import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../_helpers';
import { Role } from '../../_models';

import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';

const routes: Routes = [
    { 
        path: '', 
        component: ListComponent,
        canActivate: [AuthGuard]
    },
    { 
        path: 'add', 
        component: AddEditComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin] }  // Only admin can add requests
    },
    { 
        path: 'edit/:id', 
        component: AddEditComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin] }  // Only admin can edit requests
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RequestsRoutingModule { } 