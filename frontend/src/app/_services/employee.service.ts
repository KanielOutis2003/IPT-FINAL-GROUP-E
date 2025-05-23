import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

const baseUrl = `${environment.apiUrl}/employees`;

@Injectable({ providedIn: 'root' })
export class EmployeeService {
    constructor(private http: HttpClient) { }

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(baseUrl);
    }

    getById(id: number): Observable<any> {
        return this.http.get<any>(`${baseUrl}/${id}`);
    }

    create(params: any): Observable<any> {
        return this.http.post(baseUrl, params);
    }

    update(id: number, params: any): Observable<any> {
        return this.http.put(`${baseUrl}/${id}`, params);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${baseUrl}/${id}`);
    }

    transfer(id: number, departmentId: number): Observable<any> {
        return this.http.post(`${baseUrl}/${id}/transfer`, { departmentId });
    }

    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/users`);
    }

    getDepartments(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/departments`);
    }
} 