import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
    private apiUrl = `${environment.apiUrl}/workflows`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<any[]> {
        console.log('WorkflowService: Getting all workflows from:', this.apiUrl);
        return this.http.get<any[]>(this.apiUrl).pipe(
            tap(workflows => console.log('WorkflowService: Workflows loaded:', workflows)),
            catchError(error => {
                console.error('WorkflowService: Error fetching all workflows:', error);
                return this.handleError(error);
            })
        );
    }

    getById(id: number): Observable<any> {
        console.log(`WorkflowService: Getting workflow with ID: ${id}`);
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            tap(workflow => console.log('WorkflowService: Workflow loaded:', workflow)),
            catchError(error => {
                console.error(`WorkflowService: Error fetching workflow ${id}:`, error);
                return this.handleError(error);
            })
        );
    }

    create(workflow: any): Observable<any> {
        console.log('WorkflowService: Creating workflow:', workflow);
        return this.http.post<any>(this.apiUrl, workflow).pipe(
            tap(result => console.log('WorkflowService: Workflow created:', result)),
            catchError(error => {
                console.error('WorkflowService: Error creating workflow:', error);
                return this.handleError(error);
            })
        );
    }

    update(id: number, workflow: any): Observable<any> {
        console.log(`WorkflowService: Updating workflow ${id}:`, workflow);
        return this.http.put<any>(`${this.apiUrl}/${id}`, workflow).pipe(
            tap(result => console.log('WorkflowService: Workflow updated:', result)),
            catchError(error => {
                console.error(`WorkflowService: Error updating workflow ${id}:`, error);
                return this.handleError(error);
            })
        );
    }

    delete(id: number): Observable<any> {
        console.log(`WorkflowService: Deleting workflow ${id}`);
        return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
            tap(result => console.log('WorkflowService: Workflow deleted:', result)),
            catchError(error => {
                console.error(`WorkflowService: Error deleting workflow ${id}:`, error);
                return this.handleError(error);
            })
        );
    }

    getDepartments(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/departments`).pipe(
            catchError(this.handleError)
        );
    }

    getByEmployeeId(employeeId: number): Observable<any[]> {
        console.log(`WorkflowService: Getting workflows for employee ${employeeId}`);
        return this.http.get<any[]>(`${this.apiUrl}/employee/${employeeId}`).pipe(
            tap(workflows => console.log(`WorkflowService: Workflows for employee ${employeeId}:`, workflows)),
            catchError(error => {
                console.error(`WorkflowService: Error fetching workflows for employee ${employeeId}:`, error);
                return this.handleError(error);
            })
        );
    }

    updateStatus(id: number, status: string): Observable<any> {
        console.log(`WorkflowService: Updating status of workflow ${id} to ${status}`);
        return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status }).pipe(
            tap(result => console.log('WorkflowService: Status updated:', result)),
            catchError(error => {
                console.error(`WorkflowService: Error updating status for workflow ${id}:`, error);
                return this.handleError(error);
            })
        );
    }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = '';
        
        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            // Server-side error
            errorMessage = `Server Error: ${error.status} - ${error.error?.message || error.statusText}`;
        }
        
        console.error('WorkflowService: Detailed error:', errorMessage, error);
        return throwError(errorMessage);
    }
} 