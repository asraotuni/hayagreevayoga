# Hayagreeva Portal

A static portal for yoga therapy, Carnatic music, and astrology. Built with HTML, CSS, and JavaScript. No dependencies to install.

## Service routes

- `/`: service selection homepage.
- `/yoga-therapy/`: the full yoga portal, including introduction, location, Case Info, appointment booking, and testimonials.
- `/yoga-therapy/#case-info`, `/yoga-therapy/#book-appointment`, `/yoga-therapy/testimonials/`: direct yoga feature links.
- `/carnatic-music/`: basic Carnatic music landing page.
- `/astrology/`: basic astrology landing page.

Each service is a real directory with an index.html, so a static server can serve it directly. The Node preview also accepts paths without a trailing slash. Shared assets use root-relative URLs. No catch-all rewrite to the root index.html should be added; that would replace service pages with the service selector.

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

The yoga therapy landing page flows through the introduction, About Chandrika, areas of support, and the yoga therapy location at Hayagreeva Yoga School, Club House, Gopalan Habitat Splendour, Brookefield, Kundalahalli, Bangalore 560037. The left navigation contains Case Info, Book Appointment, and Testimonials; Book Appointment embeds Chandrika’s public Google booking schedule, and Testimonials contains client recommendations. The yoga header logo returns to the yoga landing page; All services returns to the root homepage. On small screens, the menu sits above the content. Case Info includes first/last name, date/time/place of birth, occupation, and health concerns. Required fields and future birth dates are validated before an on-page review. Details remain only in the current page; nothing is stored or submitted.

Booking, persistent case records, payments, and role-based login are reserved for future work.

## Sign in

The site includes a top-right Sign in / Profile control. AWS Amplify Gen 2 Auth is defined in `amplify/auth/resource.ts` for passwordless email OTP and Google. SMS/mobile authentication is intentionally not enabled.

Before deploying the backend, configure these Amplify secrets for the branch:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Set `AUTH_REDIRECT_URLS` as a comma-separated list of permitted application return URLs, for example `http://localhost:8000/,https://your-branch.amplifyapp.com/`. After the first backend deployment, use the Cognito domain from `amplify_outputs.json` to add Google’s required OAuth redirect URI (`https://<cognito-domain>/oauth2/idpresponse`) in Google Cloud Console. Do not put the Google client secret in source code or a frontend environment variable.

The Amplify build deploys the backend, explicitly generates `amplify_outputs.json`, and publishes it with the static site. Until the backend is deployed, the sign-in dialog remains visible but reports that authentication is not configured. Local development needs an Amplify sandbox that generates `amplify_outputs.json` before real sign-in can work.

## Appointment booking

The appointment page embeds https://calendar.app.google/cTrkzAT8y5eaLwraA. Google manages actual availability, booking, and notifications. Configure the schedule duration to one hour in Google Calendar. The portal collects preferred date, email, and counselling channel locally; these are not passed to Google automatically. Visitors must complete the Google form to book. Name fields await profile integration. A direct link is available if the embed cannot load.

Each service has a dedicated `/testimonials/` page linked from its landing page or menu. Yoga therapy contains 17 recommendations and Carnatic music contains 10, including Vaishnavi Kappagantula’s recommendation. Four recommendations covering both services appear on both pages. Astrology shows an empty state. Older `/yoga-therapy/#testimonials` links forward to the dedicated yoga testimonials page.
