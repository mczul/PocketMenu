import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, timer } from 'rxjs';
import { takeWhile, takeUntil } from 'rxjs/operators';

export interface BackendMetaData {
  version: string | null;
  started: Date | null;
}

export interface BackendState extends BackendMetaData {
  available: boolean;
  probe: Date;
}

@Component({
  selector: 'pm-backend-health',
  template: `
    <div class="row" *ngIf="backendState !== null; else stateUnknown">
      <div class="col-6">
        <dl>
          <dt>Status</dt>
          <dd>{{ backendState?.available ? 'UP' : 'DOWN'}}</dd>
        </dl>
      </div>
      <div class="col-6"></div>
    </div>
    <ng-template #stateUnknown>
      <h4>Backend state pending</h4>
    </ng-template>

  `,
  styles: [
  ]
})
export class BackendHealthComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject<void>();
  backendState: BackendState | null = null;

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    timer(0, 5000).pipe(
      takeUntil(this.unsubscribe),
    ).subscribe(() => {
      this.httpClient.get<BackendMetaData>('/api/v1/meta')
        .pipe(
          takeUntil(this.unsubscribe),
        )
        .subscribe(
          (data) => {
            if(this.backendState === null) {
              this.backendState = {
                version: data.version,
                started: data.started,
                available: true,
                probe: new Date(),
              };
            } else {
              this.backendState.version = data.version;
              this.backendState.started = data.started;
              this.backendState.available = true;
              this.backendState.probe = new Date();
            }
          },
          (error) => {
            if (this.backendState === null) {
              this.backendState = {
                version: null,
                started: null,
                available: false,
                probe: new Date(),
              };
            } else {
              this.backendState.version = null;
              this.backendState.started = null;
              this.backendState.available = false;
              this.backendState.probe = new Date();
            }
          }
        );
    });
  }
  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
