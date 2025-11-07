import { Component, inject, input, output, effect, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PlayersService, ToastService } from '../../../core/services';
import { FifaPlayer, PlayerFormData } from '../../../core/models';

@Component({
  selector: 'app-player-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isEditMode() ? 'Edit Player' : 'Create New Player' }}</h2>
          <button class="close-btn" (click)="close.emit()">✕</button>
        </div>

        <form [formGroup]="playerForm" (ngSubmit)="onSubmit()">
          <div class="form-content">
            <!-- Basic Information -->
            <section class="form-section">
              <h3>Basic Information</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="long_name">Full Name *</label>
                  <input
                    id="long_name"
                    type="text"
                    formControlName="long_name"
                    placeholder="Emma Van Dick">
                  @if (playerForm.get('long_name')?.invalid && playerForm.get('long_name')?.touched) {
                    <span class="error">Required field</span>
                  }
                </div>
                <div class="form-group">
                  <label for="short_name">Short Name *</label>
                  <input
                    id="short_name"
                    type="text"
                    formControlName="short_name"
                    placeholder="E. Van Dick">
                  @if (playerForm.get('short_name')?.invalid && playerForm.get('short_name')?.touched) {
                    <span class="error">Required field</span>
                  }
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="player_positions">Positions *</label>
                  <select id="player_positions" formControlName="player_positions">
                    <option value="">Select position(s)</option>
                    <optgroup label="Goalkeeper">
                      <option value="GK">GK - Goalkeeper</option>
                    </optgroup>
                    <optgroup label="Defenders">
                      <option value="CB">CB - Center Back</option>
                      <option value="LB">LB - Left Back</option>
                      <option value="RB">RB - Right Back</option>
                      <option value="LWB">LWB - Left Wing Back</option>
                      <option value="RWB">RWB - Right Wing Back</option>
                      <option value="CB, LB">CB, LB</option>
                      <option value="CB, RB">CB, RB</option>
                    </optgroup>
                    <optgroup label="Midfielders">
                      <option value="CDM">CDM - Defensive Midfielder</option>
                      <option value="CM">CM - Central Midfielder</option>
                      <option value="CAM">CAM - Attacking Midfielder</option>
                      <option value="LM">LM - Left Midfielder</option>
                      <option value="RM">RM - Right Midfielder</option>
                      <option value="CDM, CM">CDM, CM</option>
                      <option value="CM, CAM">CM, CAM</option>
                      <option value="CM, LM">CM, LM</option>
                      <option value="CM, RM">CM, RM</option>
                    </optgroup>
                    <optgroup label="Forwards">
                      <option value="LW">LW - Left Winger</option>
                      <option value="RW">RW - Right Winger</option>
                      <option value="ST">ST - Striker</option>
                      <option value="CF">CF - Center Forward</option>
                      <option value="LW, ST">LW, ST</option>
                      <option value="RW, ST">RW, ST</option>
                      <option value="ST, CF">ST, CF</option>
                    </optgroup>
                  </select>
                  @if (playerForm.get('player_positions')?.invalid && playerForm.get('player_positions')?.touched) {
                    <span class="error">Required field</span>
                  }
                </div>
                <div class="form-group">
                  <label for="gender">Gender</label>
                  <select id="gender" formControlName="gender">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="age">Age</label>
                  <input
                    id="age"
                    type="number"
                    formControlName="age"
                    min="15"
                    max="50">
                </div>
                <div class="form-group">
                  <label for="nationality_name">Nationality</label>
                  <select id="nationality_name" formControlName="nationality_name">
                    <option value="">Select nationality</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Brazil">Brazil</option>
                    <option value="England">England</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="Italy">Italy</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Spain">Spain</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Croatia">Croatia</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Mexico">Mexico</option>
                    <option value="United States">United States</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            <!-- Club Information -->
            <section class="form-section">
              <h3>Club Information</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="club_name">Club</label>
                  <input
                    id="club_name"
                    type="text"
                    formControlName="club_name"
                    placeholder="FC Barcelona">
                </div>
                <div class="form-group">
                  <label for="league_name">League</label>
                  <select id="league_name" formControlName="league_name">
                    <option value="">Select league</option>
                    <option value="La Liga">La Liga (Spain)</option>
                    <option value="Premier League">Premier League (England)</option>
                    <option value="Serie A">Serie A (Italy)</option>
                    <option value="Bundesliga">Bundesliga (Germany)</option>
                    <option value="Ligue 1">Ligue 1 (France)</option>
                    <option value="Eredivisie">Eredivisie (Netherlands)</option>
                    <option value="Primeira Liga">Primeira Liga (Portugal)</option>
                    <option value="MLS">MLS (USA)</option>
                    <option value="Liga MX">Liga MX (Mexico)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="fifa_version">FIFA Version</label>
                  <select id="fifa_version" formControlName="fifa_version">
                    <option value="15">FIFA 15</option>
                    <option value="16">FIFA 16</option>
                    <option value="17">FIFA 17</option>
                    <option value="18">FIFA 18</option>
                    <option value="19">FIFA 19</option>
                    <option value="20">FIFA 20</option>
                    <option value="21">FIFA 21</option>
                    <option value="22">FIFA 22</option>
                    <option value="23">FIFA 23</option>
                    <option value="24">FC 24</option>
                    <option value="25">FC 25</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="fifa_update">FIFA Update</label>
                  <select id="fifa_update" formControlName="fifa_update">
                    <option value="1">Update 1</option>
                    <option value="2">Update 2</option>
                    <option value="3">Update 3</option>
                    <option value="4">Update 4</option>
                    <option value="5">Update 5</option>
                  </select>
                </div>
              </div>
            </section>

            <!-- Ratings -->
            <section class="form-section">
              <h3>Ratings</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="overall">Overall (40-99)</label>
                  <input
                    id="overall"
                    type="number"
                    formControlName="overall"
                    min="40"
                    max="99">
                </div>
                <div class="form-group">
                  <label for="potential">Potential (40-99)</label>
                  <input
                    id="potential"
                    type="number"
                    formControlName="potential"
                    min="40"
                    max="99">
                </div>
              </div>
            </section>

            <!-- Skills -->
            <section class="form-section">
              <h3>Skills (0-99)</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="pace">Pace</label>
                  <input
                    id="pace"
                    type="number"
                    formControlName="pace"
                    min="0"
                    max="99">
                </div>
                <div class="form-group">
                  <label for="shooting">Shooting</label>
                  <input
                    id="shooting"
                    type="number"
                    formControlName="shooting"
                    min="0"
                    max="99">
                </div>
                <div class="form-group">
                  <label for="passing">Passing</label>
                  <input
                    id="passing"
                    type="number"
                    formControlName="passing"
                    min="0"
                    max="99">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="dribbling">Dribbling</label>
                  <input
                    id="dribbling"
                    type="number"
                    formControlName="dribbling"
                    min="0"
                    max="99">
                </div>
                <div class="form-group">
                  <label for="defending">Defending</label>
                  <input
                    id="defending"
                    type="number"
                    formControlName="defending"
                    min="0"
                    max="99">
                </div>
                <div class="form-group">
                  <label for="physic">Physical</label>
                  <input
                    id="physic"
                    type="number"
                    formControlName="physic"
                    min="0"
                    max="99">
                </div>
              </div>
            </section>

            <!-- Physical Characteristics -->
            <section class="form-section">
              <h3>Physical Characteristics</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="height_cm">Height (cm)</label>
                  <input
                    id="height_cm"
                    type="number"
                    formControlName="height_cm"
                    min="150"
                    max="220">
                </div>
                <div class="form-group">
                  <label for="weight_kg">Weight (kg)</label>
                  <input
                    id="weight_kg"
                    type="number"
                    formControlName="weight_kg"
                    min="50"
                    max="110">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="preferred_foot">Preferred Foot</label>
                  <select id="preferred_foot" formControlName="preferred_foot">
                    <option value="Right">Right</option>
                    <option value="Left">Left</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="weak_foot">Weak Foot (1-5)</label>
                  <select id="weak_foot" formControlName="weak_foot">
                    <option value="1">★☆☆☆☆</option>
                    <option value="2">★★☆☆☆</option>
                    <option value="3">★★★☆☆</option>
                    <option value="4">★★★★☆</option>
                    <option value="5">★★★★★</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="skill_moves">Skill Moves (1-5)</label>
                  <select id="skill_moves" formControlName="skill_moves">
                    <option value="1">★☆☆☆☆</option>
                    <option value="2">★★☆☆☆</option>
                    <option value="3">★★★☆☆</option>
                    <option value="4">★★★★☆</option>
                    <option value="5">★★★★★</option>
                  </select>
                </div>
              </div>

            </section>

            <!-- Financial Information -->
            <section class="form-section">
              <h3>Financial Information</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="value_eur">Value (€)</label>
                  <input
                    id="value_eur"
                    type="number"
                    formControlName="value_eur"
                    min="0">
                </div>
                <div class="form-group">
                  <label for="wage_eur">Wage (€)</label>
                  <input
                    id="wage_eur"
                    type="number"
                    formControlName="wage_eur"
                    min="0">
                </div>
                <div class="form-group">
                  <label for="release_clause_eur">Release Clause (€)</label>
                  <input
                    id="release_clause_eur"
                    type="number"
                    formControlName="release_clause_eur"
                    min="0">
                </div>
              </div>
            </section>

            @if (error()) {
              <div class="error-message">
                {{ error() }}
              </div>
            }
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="close.emit()">
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary"
              [disabled]="playerForm.invalid || loading()">
              {{ loading() ? 'Saving...' : (isEditMode() ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      overflow-y: auto;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
      position: sticky;
      top: 0;
      background: white;
      z-index: 10;

      h2 {
        margin: 0;
        font-size: 24px;
        color: #111827;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 28px;
        color: #6b7280;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;

        &:hover {
          background: #f3f4f6;
          color: #111827;
        }
      }
    }

    .form-content {
      padding: 24px;
    }

    .form-section {
      margin-bottom: 32px;

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #374151;
        margin: 0 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #e5e7eb;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;

      label {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 6px;
      }

      input, select {
        padding: 10px 12px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.2s;

        &:focus {
          outline: none;
          border-color: #3b82f6;
        }

        &:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }
      }

      .error {
        font-size: 12px;
        color: #ef4444;
        margin-top: 4px;
      }
    }

    .error-message {
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 16px;
      font-size: 14px;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 24px;
      border-top: 1px solid #e5e7eb;
      position: sticky;
      bottom: 0;
      background: white;

      button {
        padding: 10px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .btn-secondary {
        background: white;
        color: #374151;
        border: 2px solid #e5e7eb;

        &:hover:not(:disabled) {
          background: #f3f4f6;
        }
      }

      .btn-primary {
        background: #3b82f6;
        color: white;

        &:hover:not(:disabled) {
          background: #2563eb;
        }
      }
    }

    @media (max-width: 768px) {
      .modal-content {
        max-width: 100%;
        max-height: 100vh;
        border-radius: 0;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PlayerFormModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly playersService = inject(PlayersService);
  private readonly toastService = inject(ToastService);

  // Inputs
  player = input<FifaPlayer | null>(null);

  // Outputs
  close = output<void>();
  saved = output<FifaPlayer>();

  // State
  loading = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);

  playerForm: FormGroup;

  constructor() {
    // Form initialization
    this.playerForm = this.fb.group({
      long_name: ['', Validators.required],
      short_name: ['', Validators.required],
      player_positions: ['', Validators.required],
      gender: ['M'],
      age: [18],
      nationality_name: [''],
      club_name: [''],
      league_name: [''],
      fifa_version: [new Date().getFullYear().toString()],
      fifa_update: ['1'],
      overall: [50],
      potential: [50],
      pace: [50],
      shooting: [50],
      passing: [50],
      dribbling: [50],
      defending: [50],
      physic: [50],
      height_cm: [175],
      weight_kg: [70],
      preferred_foot: ['Right'],
      weak_foot: [3],
      skill_moves: [3],
      value_eur: [0],
      wage_eur: [0],
      release_clause_eur: [0]
    });

    effect(() => {
      const playerData = this.player();
      if (playerData) {
        this.isEditMode.set(true);
        this.playerForm.patchValue(playerData);
      } else {
        this.isEditMode.set(false);
        this.playerForm.reset({
          gender: 'M',
          age: 18,
          fifa_version: new Date().getFullYear().toString(),
          fifa_update: '1',
          overall: 50,
          potential: 50,
          pace: 50,
          shooting: 50,
          passing: 50,
          dribbling: 50,
          defending: 50,
          physic: 50,
          height_cm: 175,
          weight_kg: 70,
          preferred_foot: 'Right',
          weak_foot: 3,
          skill_moves: 3,
          value_eur: 0,
          release_clause_eur: 0
        });
      }
    });
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onSubmit(): void {
    if (this.playerForm.invalid) {
      this.playerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formData = this.playerForm.value;

    // Limpiar valores nulos o vacíos para usar defaults del backend
    const cleanData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== null && value !== '' && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    const operation = this.isEditMode()
      ? this.playersService.updatePlayer(this.player()!.id, cleanData)
      : this.playersService.createPlayer(cleanData);

    operation.subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.saved.emit(response.data);
          this.close.emit();
        }
      },
      error: (err) => {
        console.error('❌ Error saving player:', err);
        console.error('❌ Error details:', err.error);
        const errorMessage = err.error?.message || err.message || 'Error saving player. Please check your authentication.';
        this.error.set(errorMessage);
        this.toastService.error(errorMessage);
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }
}
