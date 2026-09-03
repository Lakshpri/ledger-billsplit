import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { AuthService } from '../../../core/services/auth.service';
import { Group } from '../../../core/models/models';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container">
      <div class="page-head">
        <div>
          <h1>Hey {{ firstName() }} 👋</h1>
          <p class="page-head__sub">Here are all the notebooks you're keeping.</p>
        </div>
        <a routerLink="/groups/new" class="btn btn--primary">+ New group</a>
      </div>

      @if (loading()) {
        <p class="muted">Fetching your groups…</p>
      } @else if (groups().length === 0) {
        <div class="empty torn-card">
          <span class="empty__emoji">🗒️</span>
          <h3>No groups yet</h3>
          <p>Start one for a trip, a flat share, or a weekly dinner club — whatever you're splitting.</p>
          <a routerLink="/groups/new" class="btn btn--primary">Create your first group</a>
        </div>
      } @else {
        <div class="grid">
          @for (g of groups(); track g.id) {
            <a class="group-tile torn-card" [routerLink]="['/groups', g.id]">
              <span class="group-tile__icon">{{ g.icon }}</span>
              <h3>{{ g.name }}</h3>
              @if (g.description) {
                <p class="group-tile__desc">{{ g.description }}</p>
              }
              <div class="group-tile__footer">
                <span class="chip">{{ g.members.length }} member{{ g.members.length === 1 ? '' : 's' }}</span>
                <span class="chip">{{ g.baseCurrency }}</span>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .page-head__sub { color: var(--pencil); margin-top: -0.4rem; }
    .muted { color: var(--pencil); font-family: 'Patrick Hand', cursive; font-size: 1.1rem; }

    .empty {
      text-align: center;
      padding: 3rem 2rem;
      max-width: 460px;
      margin: 2rem auto;
    }
    .empty__emoji { font-size: 3rem; display: block; margin-bottom: 0.5rem; }
    .empty p { color: var(--pencil); margin-bottom: 1.5rem; }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 1.25rem;
    }
    .group-tile {
      text-decoration: none;
      color: var(--ink);
      display: block;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      border-top: 5px solid var(--sticky-sky);
    }
    .group-tile:nth-child(3n+2) { border-top-color: var(--sticky-mint); }
    .group-tile:nth-child(3n+3) { border-top-color: var(--sticky-pink); }
    .group-tile:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lift);
    }
    .group-tile__icon { font-size: 2rem; }
    .group-tile__desc {
      color: var(--pencil);
      font-size: 0.92rem;
      margin: 0.3rem 0 0.8rem;
    }
    .group-tile__footer {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  `]
})
export class GroupListComponent implements OnInit {
  groups = signal<Group[]>([]);
  loading = signal(true);

  constructor(private groupService: GroupService, private auth: AuthService) {}

  ngOnInit(): void {
    this.groupService.list().subscribe({
      next: (groups) => { this.groups.set(groups); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  firstName(): string {
    return (this.auth.currentUser()?.name ?? '').split(' ')[0];
  }
}
