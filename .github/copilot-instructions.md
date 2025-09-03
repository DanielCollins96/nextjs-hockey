# Next.js Hockey Statistics Application

Next.js Hockey is a React-based web application for NHL hockey statistics and team information. The application uses AWS Amplify for authentication and API functionality, PostgreSQL for data storage, and integrates with external NHL APIs for real-time data.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Development Setup
- Install dependencies: `npm install` -- takes 2 minutes. NEVER CANCEL. Set timeout to 180+ seconds.
- Start development server: `npm run dev` -- starts in 5 seconds at http://localhost:3000
- Lint code: `npm run lint` -- runs in 10 seconds. Shows warnings but succeeds.
- **CRITICAL DATABASE LIMITATION**: `npm run build` -- FAILS due to PostgreSQL database dependency during static generation. This is expected behavior.

### Build and Production Limitations  
- **NEVER attempt `npm run build` without database connection** - it will always fail on pages with `getStaticProps`/`getStaticPaths` that query the database
- The application requires a connected PostgreSQL database for:
  - Teams data (`/teams` page)
  - Player statistics (`/players` page) 
  - Draft information (`/drafts` page)
  - Build-time static generation
- Production deployment happens via Vercel with proper database connectivity

### Development Workflow
- ALWAYS run development mode for testing: `npm run dev`
- ALWAYS test changes in browser at http://localhost:3000
- ALWAYS run `npm run lint` before committing changes
- NEVER CANCEL long-running operations - wait for completion

## Validation

### Manual Testing Scenarios
Always manually validate changes by testing these scenarios in development mode:

1. **Homepage functionality**:
   - Navigate to http://localhost:3000
   - Verify hockey puck animation displays
   - Test search box (will show errors without database - this is expected)
   - Verify navigation header links are present

2. **Authentication flows**:
   - Click "Login" button to access `/login` page
   - Verify login form displays with email/password fields
   - Navigate to `/signup` page via "Create account" link
   - Test form validation (requires AWS Amplify setup for full functionality)

3. **Navigation testing**:
   - Test all header navigation links
   - Verify page routing works (Teams/Players/Drafts may show errors without database)
   - Check responsive design behavior

4. **Error handling**:
   - Database connection errors are expected and normal in development
   - Verify error boundaries display properly
   - Check browser console for unexpected JavaScript errors

### Known Limitations in Development
- **Database pages will show errors** - Teams, Players, and Drafts pages require PostgreSQL connection
- **External API calls may fail** - NHL API dependencies may cause timeouts
- **Authentication requires AWS setup** - Login/signup flows need Amplify configuration
- **Build process fails** - This is expected without database connectivity

## Key Project Structure

### Critical Files and Directories
- `pages/` - Next.js page components and API routes
  - `pages/index.js` - Homepage with team search and hockey puck animation
  - `pages/teams/` - Team statistics pages (requires database)
  - `pages/players/` - Player statistics pages (requires database) 
  - `pages/drafts/` - NHL draft information (requires database)
  - `pages/login.js` - AWS Amplify authentication
  - `pages/signup.js` - User registration
  - `pages/api/` - API routes and server functions

- `components/` - Reusable React components
  - `Layout.js` - Main application layout and navigation
  - `TeamBox.jsx` - Team display component
  - `Table.jsx` - Data table component for statistics
  - `LoginForm.jsx` - Authentication form component

- `lib/` - Database and utility functions
  - `lib/queries.js` - PostgreSQL database queries
  - `lib/db.js` - Database connection configuration

- `contexts/Auth.js` - AWS Amplify authentication context
- `aws-exports.js` - AWS Amplify configuration (auto-generated)
- `amplify/` - AWS Amplify backend configuration

### Configuration Files
- `next.config.js` - Next.js configuration with Sentry integration
- `tailwind.config.js` - Tailwind CSS styling configuration
- `package.json` - Dependencies and npm scripts
- `.eslintrc.json` - ESLint code quality rules

## Common Development Tasks

### Making Code Changes
1. Start development server: `npm run dev`
2. Make changes to files in `pages/`, `components/`, or `lib/`
3. Test in browser at http://localhost:3000
4. Run linting: `npm run lint`
5. Commit changes (build is handled by deployment pipeline)

### Working with Authentication
- Authentication uses AWS Amplify Cognito
- Login/signup forms are functional but require AWS backend setup
- User context is available via `UseAuth()` hook from `contexts/Auth.js`
- Test authentication flows in development mode

### Working with Database Features
- Database queries are in `lib/queries.js`
- PostgreSQL connection configuration in `lib/db.js`
- Pages requiring database will show errors in development - this is expected
- Always test UI components that don't depend on database data

### Styling and UI
- Uses Tailwind CSS for styling
- Components follow responsive design patterns
- Test UI changes across different screen sizes
- Framer Motion used for animations (hockey puck on homepage)

## Troubleshooting

### Common Issues and Solutions

**Build fails with database errors**:
- Expected behavior - do not attempt to fix
- Use development mode (`npm run dev`) for all testing

**Teams/Players/Drafts pages show errors**:
- Expected without database connection
- Focus testing on UI components and routing

**ESLint warnings**:
- React hooks dependency warnings are known issues
- Import/export warnings for API routes are acceptable
- Fix only new warnings introduced by your changes

**Performance and timeouts**:
- External NHL API calls may be slow or fail
- Database queries may timeout in development
- These are infrastructure issues, not code problems

### Development Environment Issues
- Clear `node_modules` and reinstall if dependencies are corrupted: `rm -rf node_modules package-lock.json && npm install`
- Restart development server if hot reloading stops working
- Check browser console for client-side JavaScript errors

## Time Estimates

- **Dependency installation**: 2 minutes (npm install)
- **Development server start**: 5 seconds
- **Linting**: 10 seconds  
- **Hot reload after changes**: 1-3 seconds
- **Page navigation in browser**: 1-2 seconds
- **Database-dependent pages**: Will timeout/error (expected)

## Repository Output Examples

### Working commands and outputs:

```bash
# Install dependencies (takes ~2 minutes)
npm install
# Expected: Successful installation with some deprecation warnings

# Start development  
npm run dev
# Expected: "Ready in X.Xs" and server at http://localhost:3000

# Run linting
npm run lint  
# Expected: Some warnings about React hooks, but exits successfully

# Directory structure
ls -la
# Expected: .git/ .next/ amplify/ components/ contexts/ lib/ pages/ node_modules/ public/ styles/
```

### Expected error scenarios:

```bash
# Build attempt (will fail)
npm run build
# Expected: Database connection errors and build failure - DO NOT FIX

# Teams page access in browser
# Expected: Server error with database connection failure - NORMAL BEHAVIOR
```

## Validation Checklist

Before completing any changes, ensure:
- [ ] Development server starts successfully (`npm run dev`)
- [ ] Homepage loads with hockey puck animation at http://localhost:3000  
- [ ] Navigation header links are functional
- [ ] Login page loads with form fields
- [ ] ESLint runs without new errors (`npm run lint`)
- [ ] Browser console shows no unexpected JavaScript errors
- [ ] Authentication flows display properly (even if backend is not connected)
- [ ] UI components render correctly across different screen sizes

Remember: Database connectivity errors are expected in development environment. Focus validation on UI functionality, routing, and client-side behavior.