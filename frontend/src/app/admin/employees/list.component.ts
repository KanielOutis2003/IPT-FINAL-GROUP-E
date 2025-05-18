import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../_services/employee.service';
import { AccountService } from '../../_services/account.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../../_services/alert.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  employees: any[] = [];
  loading = false;
  errorMessage: string = '';
  showTransferModal = false;
  employeeToTransfer: any = null;

  constructor(
    private employeeService: EmployeeService,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadEmployees();
    
    // Check if we're on a transfer route
    this.route.params.subscribe(params => {
      if (params['id']) {
        const employeeId = +params['id'];
        // If we're on the transfer route, show the transfer modal
        if (this.router.url.includes('/transfer/')) {
          this.employeeService.getById(employeeId).subscribe({
            next: (employee) => {
              this.employeeToTransfer = employee;
              this.showTransferModal = true;
            },
            error: (error) => {
              this.alertService.error('Error loading employee');
              this.router.navigate(['/employees']);
            }
          });
        }
      }
    });
  }

  loadEmployees() {
    this.loading = true;
    this.errorMessage = '';
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees = data;
        console.log('Loaded employees with departments:', this.employees);
        
        // Check if departments are loaded correctly
        this.employees.forEach(employee => {
          // If department is not properly attached, try to load it
          if (!employee.department && employee.departmentId) {
            this.employeeService.getDepartments().subscribe(departments => {
              const department = departments.find(d => d.id === employee.departmentId);
              if (department) {
                employee.department = department;
              }
            });
          }
        });
        
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error loading employees';
        this.alertService.error(error);
        this.loading = false;
      }
    });
  }

  account() {
    return this.accountService.accountValue;
  }

  viewRequests(employeeId: number) {
    this.router.navigate(['/requests'], { queryParams: { employeeId } });
  }

  viewWorkflows(employeeId: number) {
    this.router.navigate(['/workflows'], { queryParams: { employeeId } });
  }

  transfer(employeeId: number) {
    // Navigate to transfer route which will trigger the modal
    this.router.navigate(['/employees/transfer', employeeId]);
  }

  onTransferClosed(success: boolean) {
    this.showTransferModal = false;
    this.employeeToTransfer = null;
    
    // Navigate back to the list
    this.router.navigate(['/employees']);
    
    // If transfer was successful, reload employees and show message
    if (success) {
      this.loadEmployees();
      this.alertService.success('Employee transferred successfully');
    }
  }

  edit(employeeId: number) {
    this.router.navigate(['/employees/edit', employeeId]);
  }

  delete(employeeId: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.delete(employeeId).subscribe({
        next: () => {
          this.employees = this.employees.filter(e => e.id !== employeeId);
          this.alertService.success('Employee deleted successfully');
        },
        error: (error) => {
          this.alertService.error(error);
        }
      });
    }
  }

  add() {
    this.router.navigate(['/employees/add']);
  }
} 