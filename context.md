# Project context

Last updated: 2026-09-13 (UTC).

## Purpose and scope

Create a yoga therapy portal for Chandrika Saripalli, MSc Yoga Therapy. The user previously created a separate finplanner project at ~/hiramyatech/finplanner hosted on AWS Amplify Gen 2 and wants this portal hosted on Amplify too.

Current scope includes the introduction, portal navigation, and a preview-only Case Info form. Book Appointment has a placeholder panel; Testimonials displays four user-supplied recommendations. Actual appointment booking, persistent case reporting, a payment gateway, and different login interfaces remain future features.

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
- Commit c697950 (Add portal sidebar and case information form), including context.md, was successfully pushed on dev to both Bitbucket and GitHub. Subsequent portal updates were committed as f0602da and pushed to both remotes; only the latest context save is uncommitted.
- npm run build passed; generated files were checked against source files.
- Git whitespace and Node server syntax checks passed.
- Local HTTP checks returned 200 for the page and stylesheet. No browser visual inspection was performed.

Sandbox constraints encountered: writing Git metadata and opening/accessing the local preview port required escalation. Use the normal approval mechanism when necessary.


## Layout and Case Info update (2026-09-13)

The user requested a left menu pane and right content pane, with a Case Info tab. Implemented a responsive sidebar with Introduction, About Chandrika, Areas of support, and Case Info links; mobile navigation sits above content. Existing introduction content is retained. Hash navigation supports direct #case-info links and browser back/forward.

Case Info fields: First Name, Last Name, Date of Birth (DoB), Time of Birth (ToB), Place of Birth (PoB), health issues for which yoga therapy is required, and Occupation (Employed / Self-Employed / Home Maker / Business / Professional / Other). First/last name, DoB, occupation and health issues are required; time/place of birth are optional. Future DoB and whitespace-only required text are rejected.

New app.js handles navigation, validation, safe text-only review rendering, and clearing the form. Details stay in page memory only, including across menu changes; no backend submission or browser storage is implemented. The form explicitly explains this limit. Review is disabled until JavaScript installs its submit handler. Build and local server now include app.js. README updated. Build, syntax, whitespace, and HTML structure/artifact checks passed; browser visual testing was not available. These layout changes were committed as c697950 and pushed to both remotes.


## Local preview cache fix and new menus (2026-09-13)

The user reported no sidebar at localhost:8000. Inspection outside the sandbox found a Python HTTP server on port 8000 serving the current HTML, CSS, and app.js exactly. Browser caching was suspected, not conclusively proven. Added version query parameters to stylesheet/script URLs in index.html and Cache-Control: no-store to the Node development server. Rebuilt and verified the versioned URLs on port 8000. The user then confirmed the layout looked good. On screens 640px wide or less, navigation appears above the content instead of on the left.

Current asset URLs: styles.css?v=testimonials-4 and app.js?v=portal-menus-2. These are manual cache versions, not automatic content hashes.

Added Book Appointment (#book-appointment) and Testimonials (#testimonials) to the sidebar at the user's request. Both open separate right-side panels. Book Appointment still has coming-soon text and no booking workflow; Testimonials was subsequently populated as described below. app.js now switches among the introduction and the three dedicated panels (Case Info, Book Appointment, Testimonials), updates the active menu, and focuses the selected panel heading. Build, JavaScript syntax, and whitespace checks passed for the menu changes.

The user asked about Razorpay integration duration only; no implementation was authorized or started. Provided an engineering estimate of roughly 1–3 working days for a tested fixed-fee, one-time payment integration, excluding account activation delays. Explained backend order creation, payment verification, records, and webhooks. Suggested starting with a fixed INR session fee and integrating appointments later. Do not treat this discussion as authorization to add payments.

The cache and menu changes were subsequently committed and pushed as part of f0602da. AWS deployment success and the earlier GitHub integration permission issue remain unconfirmed.


## Landing page flow and location (2026-09-13)

Removed Introduction, About Chandrika, and Areas of support from the left menu as requested. Their content remains in a continuous landing-page flow in index.html. Sidebar now contains only Case Info, Book Appointment, and Testimonials. Header logo and footer brand link to #home to return from other panels.

Added a location section after areas of support and before the connection section: Hayagreeva Yoga School, Club House, Gopalan Habitat Splendour, Brookefield, Kundalahalli, Bangalore 560037 (user-supplied address). Styled with a semantic address element. Updated stylesheet cache version to landing-location-3 and README. These changes were committed and pushed as part of f0602da along with the earlier cache/menu changes. Build and whitespace checks passed.


## Testimonials and latest repository status (2026-09-13)

The user supplied four LinkedIn recommendations in chat and requested publication in Testimonials. Added the supplied recommendation text in full, with names, professional descriptions, and dates:
- Sindhuja Sukumaran — July 26, 2025; yoga/mudra therapy experience for her mother.
- Kalyani R — July 24, 2025; yoga and music teaching/mentorship.
- Vaishnavi Kappagantula — July 4, 2025; Carnatic music teaching.
- Sai Susarla — June 21, 2025; holistic healing and teaching integral psychology students.

Removed LinkedIn connection-degree labels, client relationship metadata, and truncated “more” UI markers. Each recommendation has an individually scrollable, keyboard-focusable text region with its own accessible label. Cards use two columns on wide screens and one column below 900px. Names, roles, dates, and source links remain outside the scrollable text. Intro copy accurately includes yoga therapy, teaching, and music mentorship.

Each card links to the same user-provided recommendations page, not an individual recommendation permalink:
https://www.linkedin.com/in/chsaripalli/details/recommendations/?detailScreenTabIndex=0

Direct LinkedIn access failed; the supplied text was used without independent verification. No LinkedIn credentials or tokens were requested or used.

Latest commit: f0602da — Update landing page and add appointment and testimonial sections. Successfully pushed dev to both origin (Bitbucket) and github (GitHub) at the user's request. Includes README, app.js, context.md, index.html, scripts/serve.mjs, and styles.css changes. npm run build, node --check app.js, and git diff --check passed. Working tree was clean after the push. This subsequent context.md save is local and has not been committed or pushed.


## Appointment schedule integration

Built appointment preferences form: muted read-only first/last names reserved for future profile integration, desirable date (minimum today in Asia/Kolkata), appointment email, and counselling channel (Online / At therapy center). Center address appears when selected. User specified one-hour appointments.

The standard public ICS feed for chsaripalli@gmail.com returned HTTP 404. User subsequently supplied https://calendar.app.google/cTrkzAT8y5eaLwraA, which resolved with HTTP 200 to https://calendar.google.com/appointments/schedules/AcZssZ130T9uNP94Av-Y9ZELQ3BQVycvWTWxj0gdNGU6kG9EaGRfl4tFSx_8QwBqpdcCf2_s6mKIsKVt.

Embedded that Google appointment schedule with gv=true and added a direct new-tab fallback. Google controls live slots, configured duration, booking and notifications. No bookings or notification emails were sent during development. Portal preferences are NOT automatically transferred to Google; page explicitly tells users to enter the same email and channel there. No API slot extraction, calendar writes, or profile integration implemented. Continue button validates preferences and moves to the calendar with a text-only preferences summary; it does not confirm a booking. Calendar duration/working hours and actual browser booking flow have not been verified. Public endpoint HTTP check, build, JS syntax, and whitespace checks performed. These changes are uncommitted.


## Service route refactor

User expanded the portal to yoga therapy, Carnatic music, and astrology, requesting yoga features under /yoga-therapy. Moved the full previous index.html into yoga-therapy/index.html; all yoga panels are retained with hash links (/yoga-therapy/#case-info, #book-appointment, #testimonials). Root index.html is now a three-service selector. Added carnatic-music/index.html and astrology/index.html as basic landing pages, with services.css for these pages. No invented credentials or new service workflows added.

Yoga assets use root-relative /styles.css and /app.js URLs. Yoga header has an All services link back to /. Existing yoga logo returns to #home within the yoga route. scripts/build.mjs publishes all three directories and shared assets. scripts/serve.mjs handles service paths with no slash, trailing slash, and /index.html. Python localhost:8000 serves the real directories and redirects slashless paths normally. README documents routes. Avoid a root catch-all rewrite that would hide the service index pages.

Verification: npm run build, server JS syntax, whitespace, and all built local links/anchors checked. All four pages fetched successfully via localhost:8000 (following directory redirects) and matched source files. No AWS deployment or browser visual test performed. Route refactor and earlier appointment integration remain uncommitted; latest pushed commit remains f0602da.


## Standing workflow preference and commit preparation

The user explicitly requests: every time they say “commit & push”, save/update context.md FIRST, then commit and push to both repositories. Preserve this preference for future sessions.

Prepared this context update before committing the service-route refactor and appointment integration. Current scope: root service selector, full yoga portal at /yoga-therapy/, basic /carnatic-music/ and /astrology/ pages, Google appointment schedule embed and local preference form, updated build/server routes and documentation. Target branch is dev; push to origin (Bitbucket) and github (GitHub). Actual commit/push outcome must be checked in Git history and remote refs; this pre-commit note does not assert success.


## Service-specific testimonial pages

Created /yoga-therapy/testimonials/, /carnatic-music/testimonials/, and /astrology/testimonials/ as real static pages. Moved Vaishnavi Kappagantula's full recommendation, date, role, and LinkedIn reference from yoga to Carnatic music. Yoga retains Sindhuja, Kalyani, and Sai; astrology has an honest empty state. All recommendation cards retain individually scrollable, keyboard-focusable quote text and source links.

Yoga sidebar links to its new page, and legacy #testimonials URLs forward there. Music and astrology landing pages link to their respective testimonials pages. Each testimonial page links back to its service. Build and Node server include nested routes; shared services.css styles the cards. Build, syntax, whitespace and built-link/content placement checks passed. These changes are local and uncommitted. The previous service-route/booking changes were committed and pushed to both remotes as 1451c3f. Continue saving context before future commit-and-push requests.


## Additional user-supplied recommendations

Added all 19 recommendations supplied in the pasted attachment, with the opening recommendation subsequently attributed by the user to Inés Ogayar, Early Years Teacher, March 11, 2025. User supplied her profile link: https://www.linkedin.com/in/in%C3%A9s-ogayar-14b693110/. Cards continue linking to Chandrika's recommendations page as their source.

Added 14 cards to yoga and 9 to Carnatic music (four mixed-service recommendations appear on both). Total cards now: yoga 17; Carnatic music 10. Mixed-service authors: Venkata Ramesh Babu Pasupuleti (on behalf of Anjani), Kiranmayee Madakasira, Usha Chennapragada, Chalam Jayavarapu. Yoga-specific additions: Inés, Sirisha Pappu, Sreenivas Sunkavalli, Sabi Prasad, Sneha Gubba, Ramchandra Palekar, Aruna M, Vrushali Kalashetti, Pravin Kumar (Shobhana's recommendation), suma n. Music-specific additions: two distinct Krishnan Venkateswaran posts (Uma and Thulasi), Saran Kumar Palivela, Aruna Surampudi, Anusha Prayaga. Astrology unchanged, since this request was for yoga/music placement.

Preserved full supplied recommendation text, names, roles where provided, dates, and on-behalf-of attribution. Removed degree labels, LinkedIn client metadata, placeholder roles, and more markers. Kept keyboard-focusable individually scrollable text regions. No independent verification of personal health claims; these remain attributed quotes. Build, whitespace, unique IDs, expected card counts, scroll-region counts, metadata cleanup, and built/source parity checks passed. Updated README counts. Changes remain local/uncommitted along with the service-specific testimonial page work.


## Service sidebar consistency

User clarified that Testimonials must appear in the left pane for Carnatic music, like yoga. Added a persistent left service sidebar to both Carnatic music and astrology landing/testimonial pages. Sidebar contains service-home link and Testimonials menu with current-page highlighting, plus All services. Removed the temporary prominent music testimonial button/top navigation item and astrology inline testimonial link. Narrow screens place navigation above content, consistent with yoga. Shared CSS version bumped to service-sidebar-10. Changes remain uncommitted.


## Commit preparation: testimonial pages and service sidebars

Saved context before commit/push per the user's standing instruction. Pending changes include dedicated testimonial pages for all three services, Vaishnavi's move to Carnatic music, 19 additional supplied recommendations (17 yoga cards / 10 music cards overall, with four mixed-service recommendations on both), and consistent left Testimonials navigation for Carnatic music and astrology. Yoga legacy #testimonials links forward to the dedicated page. Build/server support nested routes. Source attribution, scrollable text, empty astrology state, and documentation updates are included.

Target branch dev, remotes origin (Bitbucket) and github (GitHub). Latest previous pushed commit is 1451c3f. This note precedes the new commit; verify its resulting hash and push status from Git rather than treating this note as confirmation. Build and whitespace checks have passed during implementation.

## Authentication: Google and email OTP

User requested a top-right Sign in / Profile button with Google sign-in and email plus OTP, explicitly deferring mobile plus OTP. Added the Sign in / Profile mount to all service and testimonial page headers. `auth-client.js` creates a dialog for Google federation and email OTP. It fetches `amplify_outputs.json` dynamically, configures Amplify, runs Google `signInWithRedirect`, and runs Cognito USER_AUTH with EMAIL_OTP. After sign-in it replaces the button with a profile label and lets the user sign out. It does not store any credentials or secrets in source. A missing local/deployed configuration shows a clear setup error rather than pretending to authenticate.

Added Gen 2 resources: `amplify/auth/resource.ts` enables email OTP and Google provider secrets (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`); `amplify/backend.ts` restricts Cognito USER_AUTH allowed first factors to EMAIL_OTP, deliberately excluding SMS/mobile. `AUTH_REDIRECT_URLS` is comma-separated and defaults to `http://localhost:8000/`; it must include actual Amplify application URL(s) before deployment. `amplify.yml` now runs `ampx pipeline-deploy` in the backend phase then publishes generated `amplify_outputs.json` with static artifacts. Build script and local server serve the auth client/config, and `.gitignore` omits generated outputs.

Google cannot be fully enabled until backend deployment creates the Cognito hosted UI domain. Add that generated `https://<cognito-domain>/oauth2/idpresponse` URI in Google Cloud Console and set the Google client ID/secret in Amplify branch secrets. No AWS backend deployment, Google console modification, user creation, email delivery, or real sign-in test was performed. `npm install` first encountered an expired local npm token; `npx --userconfig /dev/null npm@10.9.3 install --package-lock-only` successfully generated the dependency lockfile. It reported 25 dependency-audit vulnerabilities from the resolved dependency tree; none were automatically changed. Authentication changes are uncommitted. The build configuration explicitly runs `ampx generate outputs` after `pipeline-deploy`, so the hosted frontend receives Cognito configuration.

## Commit preparation: authentication

Saved context before commit/push per the user's standing instruction. User created Google OAuth client credentials but did not provide the values, and they must not be committed. The implementation is ready to push. After deployment, user must set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as Amplify branch secrets, set `AUTH_REDIRECT_URLS` to the deployed app URL (and localhost if wanted), then add the generated Cognito `https://<domain>/oauth2/idpresponse` URI in Google Cloud Console. No deployment or external-console changes were performed by the assistant. Target branch is dev; remotes are origin (Bitbucket) and github (GitHub).

## Amplify deployment monitoring and build-order fix

Amplify app: `hayagreevayoga` (`ddgqwvjeg0xj8`), region `ap-south-1`, branch `dev`. Commit `9b321a8` triggered jobs 6 through 10. Jobs 6–10 initially failed before source checkout with `Unable to assume specified IAM Role`; prior static-only job 5 had succeeded because it did not deploy a Gen 2 backend. The app was first assigned an SSR logging role, then updated to the correct `AmplifyConsoleServiceRole-Hayagreeva` backend deployment role. The correct role trusts `amplify.amazonaws.com`, has no boundary, and has `AdministratorAccess-Amplify` plus `AmplifyBackendDeployFullAccess` attached.

Retry job 11 successfully assumed the new role, cloned the repository, and began its backend build. It then failed because `amplify.yml` ran `npx ampx pipeline-deploy` before dependencies were installed: the only `npm ci` command was under frontend preBuild, which runs after backend build. Fixed the build order by moving `npm ci` into backend preBuild, before `pipeline-deploy` and `generate outputs`. This is a local, uncommitted deployment fix and should be committed/pushed before the next release. After that deployment, monitor for Cognito stack creation, generated `amplify_outputs.json`, frontend build and Verify success. Google secrets and callback configuration remain pending user console actions.

## Cognito user-pool failure and correction

Job 12 reached CloudFormation after the build-order fix but rolled back the auth nested stack. The visible Amplify `NoStack` error was a wrapper after rollback. CloudFormation nested events identified the real failure: `amplifyAuthUserPool4BA7F805` rejected `AllowedFirstAuthFactors` with `Invalid request provided: PASSWORD should be configured as one of the allowed first auth factors.` The backend had overridden allowed factors to only EMAIL_OTP. Corrected `amplify/backend.ts` to include `["PASSWORD", "EMAIL_OTP"]`, which Cognito requires. The portal frontend continues to request only EMAIL_OTP through USER_AUTH and still has no password UI or mobile/SMS OTP. This correction needs commit/push and a new deployment. No Google secrets, redirect URLs, or Google Cloud callback were involved in this failure.
