# Project context

Last updated: 2026-09-13 (UTC).

## Purpose and scope

Create a yoga therapy portal for Chandrika Saripalli, MSc Yoga Therapy. The user previously created a separate finplanner project at ~/hiramyatech/finplanner hosted on AWS Amplify Gen 2 and wants this portal hosted on Amplify too.

Current scope is the introduction page only. Appointment booking, case reporting, a payment gateway, and different login interfaces are future features; none are implemented.

User-supplied profile details:
- Chandrika has worked with patients across 10+ countries.
- Conditions mentioned: diabetes, obesity, hypertension, hypothyroidism/hyperthyroidism, depression, stress, anxiety, knee pain, cervical spondylosis, and other lifestyle diseases.
- LinkedIn: https://www.linkedin.com/in/chsaripalli/

The page presents these as areas of support rather than promising cures. LinkedIn could not be fetched during implementation, so no additional profile information was independently verified.

## Implementation

- Static HTML/CSS site with a warm ivory and green responsive layout.
- `index.html`: introduction, original inline SVG meditation illustration, qualifications and international experience, areas of support, and LinkedIn links.
- `styles.css`: desktop/mobile layouts, focus styling, reduced-motion support, optional Google Fonts with fallback fonts.
- `package.json`: no dependencies; scripts for local serving and building.
- `scripts/serve.mjs`: development server at http://localhost:3000, bound to 127.0.0.1; supports the PORT environment variable.
- `scripts/build.mjs`: copies index.html and styles.css into dist/.
- `amplify.yml`: runs npm run build and publishes dist/**/*.
- `README.md`: local preview, build, and Amplify deployment instructions.

Run `npm run dev` for a local preview; `npm run build` creates hosting artifacts. dist/ is ignored by Git. The server was started during the earlier session; check whether it is still running before relying on it.

## Amplify status

The intro page is configured for frontend-only AWS Amplify Hosting. No Gen 2 backend, authentication, database, or other AWS resources have been added or provisioned by the assistant. Gen 2 backend code and a backend deployment phase can be added when backend features are implemented.

Connect the repository and dev branch in Amplify, use the repository root, and retain the checked-in amplify.yml build settings. No dependency installation, environment variables, or SPA rewrite rules are required for the current page.

The user attempted deployment and reported this repository setup error:

> There was an issue setting up your repository. Please try again later. Resource not accessible by integration (403), referring to GitHub's list-repository-webhooks endpoint.

This indicates GitHub integration permissions during repository setup, before the build. The exact installation configuration has not been inspected. Suggested resolution:

1. Sign in to GitHub as asraotuni and open https://github.com/settings/installations.
2. Configure the AWS Amplify GitHub App corresponding to the deployment region.
3. Ensure hayagreevayoga is selected for repository access, keeping existing selections.
4. Save and accept any pending Amplify permission update.
5. Restart the GitHub connection flow in Amplify and select asraotuni/hayagreevayoga, branch dev.

If the error persists, obtain the AWS region and whether the Amplify app appears in installed GitHub Apps. The user has not yet confirmed a fix or successful deployment. Do not assume a specific AWS app ID or region from other projects.

References checked:
- https://docs.aws.amazon.com/amplify/latest/userguide/yml-specification-syntax.html
- https://docs.aws.amazon.com/amplify/latest/userguide/setting-up-GitHub-access.html
- https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api

## Git and verification

- Workspace: /home/srinivas/hiramyatech/hayagreevayoga
- Branch: dev
- Bitbucket remote origin: git@bitbucket-hiramyatech:hiramyatech/hayagreevayoga.git
- GitHub remote github: git@github.com:asraotuni/hayagreevayoga.git
- Commit 0094234: Add yoga therapy introduction page and Amplify hosting configuration.
- That commit was successfully pushed to both remotes at the user's request.
- Working tree was clean before creating this context.md; this context file has not been committed or pushed.
- npm run build passed; generated files were checked against source files.
- Git whitespace and Node server syntax checks passed.
- Local HTTP checks returned 200 for the page and stylesheet. No browser visual inspection was performed.

Sandbox constraints encountered: writing Git metadata and opening/accessing the local preview port required escalation. Use the normal approval mechanism when necessary.


## Layout and Case Info update (2026-09-13)

The user requested a left menu pane and right content pane, with a Case Info tab. Implemented a responsive sidebar with Introduction, About Chandrika, Areas of support, and Case Info links; mobile navigation sits above content. Existing introduction content is retained. Hash navigation supports direct #case-info links and browser back/forward.

Case Info fields: First Name, Last Name, Date of Birth (DoB), Time of Birth (ToB), Place of Birth (PoB), health issues for which yoga therapy is required, and Occupation (Employed / Self-Employed / Home Maker / Business / Professional / Other). First/last name, DoB, occupation and health issues are required; time/place of birth are optional. Future DoB and whitespace-only required text are rejected.

New app.js handles navigation, validation, safe text-only review rendering, and clearing the form. Details stay in page memory only, including across menu changes; no backend submission or browser storage is implemented. The form explicitly explains this limit. Review is disabled until JavaScript installs its submit handler. Build and local server now include app.js. README updated. Build, syntax, whitespace, and HTML structure/artifact checks passed; browser visual testing was not available. These layout changes have not been committed or pushed.
