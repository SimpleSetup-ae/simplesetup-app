# Backend - Rails API

Ruby on Rails API backend for the Simple Setup Corporate Tax Registration Agent.

## Tech Stack
- Ruby on Rails 7.x
- Supabase PostgreSQL
- Clerk Authentication
- Sidekiq for background jobs
- Redis for caching and job queues

## Setup

1. Install dependencies:
   ```bash
   bundle install
   ```

2. Setup database:
   ```bash
   rails db:create db:migrate
   ```

3. Start the server:
   ```bash
   rails server -p 3001
   ```

## API Endpoints

- Authentication: `/api/auth/*`
- Companies: `/api/companies/*`
- Workflows: `/api/workflows/*`
- Documents: `/api/documents/*`
- Users: `/api/users/*`

## Development

- Run tests: `rails test`
- Console: `rails console`
- Routes: `rails routes`
