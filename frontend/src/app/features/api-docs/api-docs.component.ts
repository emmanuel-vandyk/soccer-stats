import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth: boolean;
  params?: { name: string; type: string; required: boolean; description: string }[];
  response?: string;
  example?: string;
}

interface EndpointGroup {
  title: string;
  description: string;
  endpoints: Endpoint[];
}

@Component({
  selector: 'app-api-docs',
  imports: [CommonModule],
  template: `
    <div class="api-docs">
      <header class="docs-header">
        <div class="container">
          <h1>Soccer Stats API Documentation</h1>
          <p class="subtitle">RESTful API for FIFA player statistics and data management</p>
          <div class="api-info">
            <span class="badge">Base URL: <code>http://localhost:3000/api</code></span>
            <span class="badge">Version: 1.0.0</span>
          </div>
        </div>
      </header>

      <nav class="docs-nav">
        <div class="container">
          <a (click)="scrollToSection('overview')" class="nav-link">Overview</a>
          @for (group of endpointGroups(); track group.title) {
            <a (click)="scrollToSection(group.title)" class="nav-link">{{ group.title }}</a>
          }
        </div>
      </nav>

      <main class="docs-content">
        <div class="container">
          <!-- Overview Section -->
          <section id="overview" class="section">
            <h2>Overview</h2>
            <p>The Soccer Stats API provides access to comprehensive FIFA player data, including player statistics, ratings, evolution over time, and more. All player management endpoints require authentication with a valid JWT token.</p>

            <div class="info-card">
              <h3>Authentication</h3>
              <p>Protected endpoints require a JWT token. Include it in the Authorization header:</p>
              <pre><code>Authorization: Bearer YOUR_JWT_TOKEN</code></pre>
              <p>Obtain a token by registering or logging in through the <code>/auth</code> endpoints.</p>
            </div>

            <div class="info-card">
              <h3>Response Format</h3>
              <p>All responses follow a standard format:</p>
              <pre><code>{{responseFormatExample}}</code></pre>
            </div>

            <div class="info-card">
              <h3>Pagination</h3>
              <p>List endpoints return paginated results:</p>
              <pre><code>{{paginationExample}}</code></pre>
            </div>
          </section>

          <!-- Endpoint Groups -->
          @for (group of endpointGroups(); track group.title) {
            <section [id]="group.title" class="section">
              <h2>{{ group.title }}</h2>
              <p class="group-description">{{ group.description }}</p>

              @for (endpoint of group.endpoints; track endpoint.path) {
                <div class="endpoint-card">
                  <div class="endpoint-header">
                    <span class="method" [class]="'method-' + endpoint.method.toLowerCase()">
                      {{ endpoint.method }}
                    </span>
                    <code class="path">{{ endpoint.path }}</code>
                    @if (endpoint.auth) {
                      <span class="auth-badge" title="Requires Authentication">🔒 Protected</span>
                    }
                  </div>

                  <p class="endpoint-description">{{ endpoint.description }}</p>

                  @if (endpoint.params && endpoint.params.length > 0) {
                    <div class="params-section">
                      <h4>Parameters</h4>
                      <table class="params-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Required</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (param of endpoint.params; track param.name) {
                            <tr>
                              <td><code>{{ param.name }}</code></td>
                              <td><span class="type-badge">{{ param.type }}</span></td>
                              <td>
                                @if (param.required) {
                                  <span class="required-badge">Yes</span>
                                } @else {
                                  <span class="optional-badge">No</span>
                                }
                              </td>
                              <td>{{ param.description }}</td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  }

                  @if (endpoint.example) {
                    <div class="example-section">
                      <h4>Example Request</h4>
                      <pre><code>{{ endpoint.example }}</code></pre>
                    </div>
                  }

                  @if (endpoint.response) {
                    <div class="response-section">
                      <h4>Example Response</h4>
                      <pre><code>{{ endpoint.response }}</code></pre>
                    </div>
                  }
                </div>
              }
            </section>
          }

          <!-- Features Section -->
          <section id="features" class="section">
            <h2>Features Overview</h2>
            <div class="features-grid">
              <div class="feature-card">
                <div class="feature-icon">🔍</div>
                <h3>Advanced Search</h3>
                <p>Search players by name, position, club, and multiple filters with real-time results.</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">📊</div>
                <h3>Player Analytics</h3>
                <p>Access detailed statistics, radar charts, and evolution timelines for any player.</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🏆</div>
                <h3>Top Players</h3>
                <p>Get rankings of the highest-rated players by gender, position, or overall rating.</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">📥</div>
                <h3>Data Export</h3>
                <p>Export filtered player data to CSV or Excel formats for analysis.</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🔐</div>
                <h3>Secure CRUD</h3>
                <p>Create, update, and delete player records with JWT authentication.</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">⚡</div>
                <h3>Performance</h3>
                <p>Optimized queries with caching and pagination for fast responses.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer class="docs-footer">
        <div class="container">
          <p>Soccer Stats API &copy; 2025 | Built by Emmanuel Van Dick</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .api-docs {
      min-height: 100vh;
      color: #333;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* Header */
    .docs-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 3rem 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .docs-header h1 {
      font-size: 2.5rem;
      margin: 0 0 0.5rem;
      color: #667eea;
      font-weight: 700;
    }

    .subtitle {
      font-size: 1.2rem;
      color: #666;
      margin: 0 0 1.5rem;
    }

    .api-info {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .badge {
      background: #f0f4ff;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      color: #667eea;
      font-weight: 500;
    }

    .badge code {
      background: transparent;
      color: #764ba2;
      font-weight: 600;
    }

    /* Navigation */
    .docs-nav {
      background: rgba(255, 255, 255, 0.9);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .docs-nav .container {
      display: flex;
      gap: 1.5rem;
      overflow-x: auto;
    }

    .nav-link {
      white-space: nowrap;
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.3s;
      cursor: pointer;
    }

    .nav-link:hover {
      background: #f0f4ff;
      color: #764ba2;
    }

    /* Content */
    .docs-content {
      padding: 3rem 0;
    }

    .section {
      background: white;
      border-radius: 12px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .section h2 {
      font-size: 2rem;
      color: #667eea;
      margin: 0 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 3px solid #f0f4ff;
    }

    .group-description {
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    /* Info Cards */
    .info-card {
      background: #f8f9ff;
      border-left: 4px solid #667eea;
      padding: 1.5rem;
      margin: 1.5rem 0;
      border-radius: 8px;
    }

    .info-card h3 {
      margin: 0 0 1rem;
      color: #667eea;
      font-size: 1.3rem;
    }

    .info-card p {
      margin: 0.5rem 0;
      line-height: 1.6;
    }

    /* Endpoint Cards */
    .endpoint-card {
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      transition: all 0.3s;
    }

    .endpoint-card:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }

    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .method {
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
    }

    .method-get { background: #e3f2fd; color: #1976d2; }
    .method-post { background: #e8f5e9; color: #388e3c; }
    .method-put { background: #fff3e0; color: #f57c00; }
    .method-delete { background: #ffebee; color: #d32f2f; }

    .path {
      flex: 1;
      font-size: 1.1rem;
      font-weight: 500;
      color: #333;
      font-family: 'Monaco', 'Courier New', monospace;
    }

    .auth-badge {
      background: #ffe0b2;
      color: #e65100;
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .endpoint-description {
      color: #555;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    /* Parameters Table */
    .params-section,
    .example-section,
    .response-section {
      margin-top: 1.5rem;
    }

    .params-section h4,
    .example-section h4,
    .response-section h4 {
      color: #667eea;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }

    .params-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    }

    .params-table th {
      background: #f8f9ff;
      padding: 0.8rem;
      text-align: left;
      font-weight: 600;
      color: #667eea;
      border-bottom: 2px solid #e0e0e0;
    }

    .params-table td {
      padding: 0.8rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .params-table tr:hover {
      background: #f8f9ff;
    }

    .type-badge {
      background: #e1f5fe;
      color: #0277bd;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .required-badge {
      background: #c8e6c9;
      color: #2e7d32;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .optional-badge {
      background: #ffcdd2;
      color: #c62828;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    /* Code Blocks */
    pre {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1.5rem;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    code {
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }

    /* Features Grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .feature-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      transition: transform 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      margin: 0 0 1rem;
      font-size: 1.3rem;
    }

    .feature-card p {
      margin: 0;
      opacity: 0.9;
      line-height: 1.6;
    }

    /* Footer */
    .docs-footer {
      background: rgba(255, 255, 255, 0.95);
      padding: 2rem 0;
      text-align: center;
      color: #666;
      margin-top: 3rem;
    }

    @media (max-width: 768px) {
      .docs-header h1 {
        font-size: 2rem;
      }

      .section {
        padding: 1.5rem;
      }

      .endpoint-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ApiDocsComponent {
  readonly responseFormatExample = `{
  "success": true,
  "data": { ... },
  "timestamp": "2025-11-01T10:30:00Z"
}`;

  readonly paginationExample = `{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}`;

  readonly endpointGroups = signal<EndpointGroup[]>([
    {
      title: 'Authentication',
      description: 'User registration, login, and account management endpoints.',
      endpoints: [
        {
          method: 'POST',
          path: '/auth/register',
          description: 'Register a new user account',
          auth: false,
          params: [
            { name: 'username', type: 'string', required: true, description: 'Unique username (3-30 characters)' },
            { name: 'email', type: 'string', required: true, description: 'Valid email address' },
            { name: 'password', type: 'string', required: true, description: 'Password (min 6 characters)' },
          ],
          example: `POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePass123"
}`,
          response: `{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}`
        },
        {
          method: 'POST',
          path: '/auth/login',
          description: 'Login with existing credentials',
          auth: false,
          params: [
            { name: 'email', type: 'string', required: true, description: 'User email' },
            { name: 'password', type: 'string', required: true, description: 'User password' },
          ],
          example: `POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePass123"
}`,
          response: `{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}`
        },
        {
          method: 'GET',
          path: '/auth/me',
          description: 'Get current authenticated user information',
          auth: true,
          example: `GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN`,
          response: `{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": false
  }
}`
        }
      ]
    },
    {
      title: 'Players Management (Protected)',
      description: 'CRUD operations for player data. Requires authentication.',
      endpoints: [
        {
          method: 'GET',
          path: '/players/:id/radar-stats',
          description: 'Get radar chart statistics for Chart.js visualization',
          auth: true,
          example: `GET /api/players/158023/radar-stats
Authorization: Bearer YOUR_JWT_TOKEN`,
          response: `{
  "success": true,
  "data": {
    "labels": ["Pace", "Shooting", "Passing", "Dribbling", "Defending", "Physic"],
    "values": [85, 92, 91, 95, 35, 65]
  }
}`
        },
        {
          method: 'GET',
          path: '/players/:id/timeline',
          description: 'Get player evolution timeline across FIFA versions',
          auth: true,
          params: [
            { name: 'skill', type: 'string', required: false, description: 'Specific skill to track (e.g., "overall", "pace")' },
          ],
          example: `GET /api/players/158023/timeline?skill=overall
Authorization: Bearer YOUR_JWT_TOKEN`,
          response: `{
  "success": true,
  "data": {
    "versions": ["FIFA 20", "FIFA 21", "FIFA 22", "FIFA 23"],
    "values": [94, 93, 92, 91]
  }
}`
        },
        {
          method: 'POST',
          path: '/players',
          description: 'Create a new player record',
          auth: true,
          params: [
            { name: 'name', type: 'string', required: true, description: 'Player name' },
            { name: 'overall', type: 'number', required: true, description: 'Overall rating (1-99)' },
            { name: 'positions', type: 'string', required: true, description: 'Positions (comma-separated)' },
            { name: 'age', type: 'number', required: true, description: 'Player age' },
            { name: 'club_name', type: 'string', required: false, description: 'Club name' },
            { name: 'nationality', type: 'string', required: false, description: 'Nationality' },
            { name: 'gender', type: 'string', required: true, description: 'M or F' },
          ],
          example: `POST /api/players
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "New Player",
  "overall": 85,
  "positions": "ST, CF",
  "age": 25,
  "gender": "M"
}`
        },
        {
          method: 'PUT',
          path: '/players/:id',
          description: 'Update an existing player',
          auth: true,
          example: `PUT /api/players/158023
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "overall": 92,
  "club_name": "Updated Club"
}`
        },
        {
          method: 'DELETE',
          path: '/players/:id',
          description: 'Delete a player record',
          auth: true,
          example: `DELETE /api/players/158023
Authorization: Bearer YOUR_JWT_TOKEN`
        },
        {
          method: 'GET',
          path: '/players/export',
          description: 'Export player data to CSV or Excel format with applied filters',
          auth: true,
          params: [
            { name: 'format', type: 'string', required: true, description: 'Export format: "csv" or "xlsx"' },
            { name: 'name', type: 'string', required: false, description: 'Filter by player name' },
            { name: 'position', type: 'string', required: false, description: 'Filter by position' },
            { name: 'overallMin', type: 'number', required: false, description: 'Minimum overall rating' },
            { name: 'overallMax', type: 'number', required: false, description: 'Maximum overall rating' },
            { name: 'fifaVersion', type: 'string', required: false, description: 'FIFA version' },
            { name: 'clubName', type: 'string', required: false, description: 'Club name' },
            { name: 'gender', type: 'string', required: false, description: 'M or F' },
          ],
          example: `GET /api/players/export?format=xlsx&position=ST&overallMin=85
Authorization: Bearer YOUR_JWT_TOKEN

// Returns a binary file (Blob) for download`
        }
      ]
    }
  ]);

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
