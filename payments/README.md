# UPI payment reference

The final flow is deliberately simple:

1. Complete the booking in Chandrika's existing embedded Google appointment schedule. Google sends its normal booking confirmation.
2. Pay **₹2,000** by UPI to **chsaripalli@okicici** using the QR/ID, or by bank transfer to **ICICI Bank**, account **7427 0150 2003**, IFSC **ICIC0007427**.
3. Submit the UPI or bank transfer transaction number. The portal saves it with the signed-in login email and displays **“Your appointment is subject to payment realization.”**

There are no slot holds, Calendar API credentials, SES emails, or payment gateway. The Google schedule continues controlling availability, duration, joining details, and booking emails. The Google iframe does not expose the booking to our page, so staff match the submitted login email and reference to the booking manually. Use the same email in Google's booking form. A submitted reference is not proof that funds arrived.

## Add the condition to Google's confirmation

Google permits an appointment schedule description that appears on the booking page, in confirmation emails, and in the event description. Edit Chandrika's existing appointment schedule in Google Calendar, go to its booking-page **Description**, and add:

> Your appointment is subject to payment realization. After booking, please pay ₹2,000 by UPI to chsaripalli@okicici and submit your UPI transaction number at https://hayagreeva.hiramyatech.com/yoga-therapy/#book-appointment.

Save the schedule. This setting belongs to Google Calendar, not the embedded page. It has **not** been changed by this repository update. The wording is already displayed on the portal. See [Google's appointment schedule settings](https://support.google.com/calendar/answer/10729749).

## Deploy reference storage

Deploy the Amplify backend and frontend together. The backend adds a Cognito-authorized POST endpoint, a Lambda function, and a DynamoDB table with point-in-time recovery and retention. The endpoint is published in `amplify_outputs.json` at `custom.paymentReferences.endpoint`. No new secrets or calendar authorization are required. `AUTH_REDIRECT_URLS` must include the frontend origin for API CORS.

References are stored with the verified login email, user ID, submission time, expected INR 2,000 fee, and `paymentStatus: AWAITING_REALIZATION`. Amount and identity are server-controlled. The same reference from the same user is idempotent; reuse by another user is rejected. Up to five new references per user per UTC day are allowed. Rate-limit entries expire; payment records do not.

Staff can review the `PaymentReferences` table in the `payment-references` stack and verify the transaction against the receiving account and Google booking. There is no staff dashboard or automatic bank verification in this version. No customer email is sent by the submission endpoint. Missing configuration or storage errors never display a false success.

## Files and checks

- `config.js`: UPI ID, payee label, INR fee, payment URI.
- `upi-qr.svg`: local QR asset, generated without an external QR service.
- `appointment-payment.js`: authenticated transaction submission and on-screen acknowledgement.
- `../amplify/payments/`: reference validation/storage and API resources.

After changing UPI details, run `npm run generate:upi-qr`, update the visible fee/ID in `yoga-therapy/index.html`, then run `npm test` and `npm run build`.
