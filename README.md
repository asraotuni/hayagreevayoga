# Hayagreeva Yoga

An introductory website for Chandrika Saripalli, MSc Yoga Therapy. Built with HTML, CSS, and an original inline SVG illustration. No dependencies to install.

## Local preview

With Node.js 18 or later installed, run `npm run dev` and visit http://localhost:3000. Set `PORT` to use a different port.

## Build

Run `npm run build` to generate the static site in `dist/`. The repository's `amplify.yml` runs this command and publishes that folder on AWS Amplify Hosting.

## Deploy to AWS Amplify

1. Commit this project, including `amplify.yml`, and push it to your Git provider.
2. In the AWS Amplify console, create a new app, connect your Git provider, and select this repository and the branch to deploy.
3. Keep the repository root as the app root (this is not a monorepo). Use the checked-in `amplify.yml`: build command `npm run build`, output directory `dist`.
4. Save and deploy. Open the generated `amplifyapp.com` URL after the deployment succeeds. Future pushes to the connected branch can trigger automatic deployments.

This introduction page uses frontend-only Amplify Hosting. Gen 2 defines backend resources as TypeScript code; no backend resources are needed yet. When login, booking, or case reporting are added, we can add the Gen 2 backend and its deployment phase to the same project.

No dependency installation, environment variables, AWS credentials in source code, or SPA rewrite rules are required for this page. The local Node server is only for development; Amplify serves the built HTML and CSS directly. No AWS resources have been provisioned by this setup.

Build configuration reference: [AWS Amplify Hosting build specification](https://docs.aws.amazon.com/amplify/latest/userguide/yml-specification-syntax.html).

Google Fonts are optional; the page uses local serif and sans-serif fallbacks when offline. LinkedIn links open in a new tab.

Booking, case reporting, payments, and role-based login are reserved for future work.
