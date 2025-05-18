import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RequestService {
    private apiUrl = `${environment.apiUrl}/requests`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    getById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    getByEmployeeId(employeeId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/employee/${employeeId}`);
    }

    getMyRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/my-requests`);
    }

    create(request: any): Observable<any> {
        // Transform items to RequestItems format for Sequelize
        const transformedRequest = {
            ...request,
            RequestItems: request.items || []
        };
        delete transformedRequest.items;
        return this.http.post<any>(this.apiUrl, transformedRequest);
    }

    update(id: number, request: any): Observable<any> {
        // Transform items to RequestItems format for Sequelize
        const transformedRequest = {
            ...request,
            RequestItems: request.items || []
        };
        delete transformedRequest.items;
        return this.http.put<any>(`${this.apiUrl}/${id}`, transformedRequest);
    }

    delete(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    getEmployees(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/employees`);
    }

    getWorkflows(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/workflows`);
    }
} 