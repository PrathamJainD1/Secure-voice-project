# SafeReport - Pure HTML Version

This directory contains pure HTML, CSS, and JavaScript files for the SafeReport application.

## Files

- `landing.html` - Homepage with hero section and features
- `auth.html` - Sign in and sign up forms
- `report-submission.html` - Form to submit new reports
- `user.html` - User dashboard showing submitted reports
- `resources.html` - Resources and support information
- `about.html` - About page with mission and how it works
- `privacy.html` - Privacy policy page
- `styles.css` - Shared CSS styles with design system variables

## Database Integration

All forms include TODO comments where you need to connect to your database. Look for:

```javascript
// TODO: Connect to your database
```

### Key Integration Points

1. **Authentication (auth.html)**
   - Sign in form submission
   - Sign up form submission
   - Store user credentials and create sessions

2. **Report Submission (report-submission.html)**
   - Save report data (category, title, description, etc.)
   - Handle file uploads
   - Link reports to user accounts or mark as anonymous

3. **Dashboard (user.html)**
   - Fetch user's submitted reports
   - Display report status
   - Load report updates

## Design System

The CSS uses CSS variables for consistent theming:
- Colors are defined using HSL values
- Dark theme optimized
- Responsive design included

## Usage

1. Open any HTML file in a web browser to preview
2. Connect the forms to your backend database
3. Update the navigation links as needed
4. Customize content and styling to match your brand

## Notes

- All pages are standalone and can be used independently
- Forms prevent default submission - add your database logic
- Mobile responsive design included
- Follows semantic HTML best practices for SEO
