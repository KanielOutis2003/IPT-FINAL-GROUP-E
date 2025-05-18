import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DepartmentService } from '../../_services/department.service';
import { EmployeeService } from '../../_services/employee.service';
import { AlertService } from '../../_services/alert.service';

@Component({
  selector: 'app-employee-transfer',
  templateUrl: './transfer.component.html'
})
export class TransferComponent implements OnInit {
  @Input() employee: any;
  @Output() closed = new EventEmitter<boolean>();
  departments: any[] = [];
  departmentId: number | null = null;
  loading = false;
  errorMessage: string = '';

  constructor(
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    if (!this.employee) {
      this.errorMessage = 'No employee selected for transfer';
      return;
    }
    
    this.loading = true;
    this.departmentService.getAll().subscribe({
      next: (depts) => {
        // Filter out the current department
        this.departments = depts.filter(d => d.id !== Number(this.employee?.departmentId));
        this.loading = false;
        
        if (this.departments.length === 0) {
          this.errorMessage = 'No other departments available for transfer';
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load departments';
        this.loading = false;
        console.error('Error loading departments:', error);
      }
    });
  }
  
  getCurrentDepartmentName(): string {
    if (!this.employee || !this.employee.department) {
      return 'Unknown';
    }
    return this.employee.department.name;
  }

  transfer() {
    if (!this.employee || !this.departmentId) {
      this.errorMessage = 'Please select a department';
      return;
    }
    
    // Ensure both values are numbers
    const employeeId = Number(this.employee.id);
    const deptId = Number(this.departmentId);
    
    // Don't transfer if employee is already in this department
    if (deptId === Number(this.employee.departmentId)) {
      this.alertService.warn('Employee is already in this department');
      return;
    }
    
    console.log(`Transferring employee ${employeeId} to department ${deptId}`);
    
    this.loading = true;
    this.errorMessage = '';
    
    this.employeeService.transfer(employeeId, deptId).subscribe({
      next: (response) => {
        console.log('Transfer successful:', response);
        this.loading = false;
        this.alertService.success('Employee transferred successfully');
        this.closed.emit(true);
      },
      error: (error) => {
        console.error('Transfer error:', error);
        this.loading = false;
        this.errorMessage = error.error?.message || 'Transfer failed';
        this.alertService.error(this.errorMessage);
      }
    });
  }

  cancel() {
    this.closed.emit(false);
  }
} 