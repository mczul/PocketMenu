import { Component } from '@angular/core';

@Component({
  selector: 'pm-root',
  template: `
    <div class="container">
      <h1>Pocket Menu</h1>
      <div>
        <router-outlet></router-outlet>
      </div>
      <footer>
        <pm-backend-health></pm-backend-health>
      </footer>
    </div>
  `,
  styles: []
})
export class AppComponent {
}
