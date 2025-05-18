import { Component, OnInit, Input } from '@angular/core';
import { WorkflowService } from '../../_services/workflow.service';
import { AccountService } from '../../_services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../_services/alert.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-workflow-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  @Input() employeeId?: number;
  workflows: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private workflowService: WorkflowService,
    private accountService: AccountService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loading = true;
    
    // Check if employeeId is passed as an input or in the query params
    if (!this.employeeId) {
      this.employeeId = Number(this.route.snapshot.queryParams['employeeId']);
    }
    
    console.log('Workflow list component initialized with employeeId:', this.employeeId);
    
    if (this.employeeId) {
      this.loadEmployeeWorkflows();
    } else {
      this.loadAllWorkflows();
    }
  }
  
  loadEmployeeWorkflows() {
    console.log('Loading workflows for employee:', this.employeeId);
    this.workflowService.getByEmployeeId(this.employeeId!).subscribe({
      next: data => {
        console.log('Employee workflows loaded:', data);
        this.workflows = data;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading employee workflows:', error);
        this.errorMessage = typeof error === 'string' ? error : 'Failed to load workflows';
        this.alertService.error(this.errorMessage);
        this.loading = false;
      }
    });
  }
  
  loadAllWorkflows() {
    console.log('Loading all workflows');
    this.workflowService.getAll().subscribe({
      next: data => {
        console.log('All workflows loaded:', data);
        this.workflows = data;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading all workflows:', error);
        this.errorMessage = typeof error === 'string' ? error : 'Failed to load workflows';
        this.alertService.error(this.errorMessage);
        this.loading = false;
      }
    });
  }

  account() {
    return this.accountService.accountValue;
  }

  updateStatus(workflow: any) {
    console.log('Updating workflow status:', workflow.id, workflow.status);
    this.workflowService.updateStatus(workflow.id, workflow.status)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Workflow status updated');
        },
        error: error => {
          console.error('Error updating workflow status:', error);
          this.alertService.error(typeof error === 'string' ? error : 'Failed to update status');
          // Revert the status change in the UI
          if (this.employeeId) {
            this.loadEmployeeWorkflows();
          } else {
            this.loadAllWorkflows();
          }
        }
      });
  }
  
  addWorkflow() {
    if (this.employeeId) {
      this.router.navigate(['/workflows/add'], { queryParams: { employeeId: this.employeeId } });
    } else {
      this.router.navigate(['/workflows/add']);
    }
  }
  
  deleteWorkflow(id: number) {
    if (confirm('Are you sure you want to delete this workflow?')) {
      console.log('Deleting workflow:', id);
      this.workflowService.delete(id)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('Workflow deleted');
            this.workflows = this.workflows.filter(w => w.id !== id);
          },
          error: error => {
            console.error('Error deleting workflow:', error);
            this.alertService.error(typeof error === 'string' ? error : 'Failed to delete workflow');
          }
        });
    }
  }
} 