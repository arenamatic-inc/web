# Thorburn Event Booking (one-off, backend-lite)

This is a fast, disposable flow for `/events/thorburn`:

- User submits booking form (name, email, phone, ticket count)
- Seats are held for 3 hours pending payment
- Payment instructions are emailed immediately
- Admin marks paid bookings in Google Sheet
- Expired unpaid holds are automatically released

## 1) Create Google Form

Create a Google Form called **Thorburn Booking Request** with these required fields:

1. Name (short answer)
2. Email (short answer)
3. Phone (short answer)
4. Number of Tickets (short answer or dropdown)

In Form settings:
- Collect email addresses: ON (optional but recommended)
- Limit to 1 response: OFF
- Response receipt: OFF (script handles custom messaging)

Copy the public form URL.

## 2) Connect Form to Sheet

From the form: **Responses → Link to Sheets** (new spreadsheet).

In the response sheet, add these columns to row 1 (if they don’t already exist):

- booking_id
- requested_at
- status
- hold_expires_at
- paid_at
- admin_notes

Ensure these header names are exactly lower-case as above for script compatibility.

## 3) Add Apps Script

1. Open the linked sheet
2. Extensions → Apps Script
3. Paste `scripts/thorburn-booking-apps-script.js`
4. Save project
5. In `CONFIG`, set `EVENT_CAPACITY`, payment instructions, and sender details
6. Set pricing values in `CONFIG`:
   - `TICKET_PRICE` (currently 50)
   - `HST_RATE` (currently 0.13)
   - `PAYMENT_EMAIL` (currently info@ottawasnookerclub.com)

## 4) Add triggers

Create these triggers in Apps Script:

1. `onFormSubmit`
   - Event source: From spreadsheet
   - Event type: On form submit

2. `expireUnpaidHolds`
   - Time-driven
   - Every 10 or 15 minutes

Grant permissions when prompted.

## 5) Update frontend link

Set the Vite env var with your public Google Form URL:

- `frontend/.env.staging`
- `frontend/.env.production`

```dotenv
VITE_THORBURN_BOOKING_FORM_URL=https://docs.google.com/forms/d/e/.../viewform
```

Then redeploy frontend.

## 6) Ops workflow (day-of)

- New submissions become `HOLD_UNPAID`
- Script emails payment instructions + expiry time
- When payment arrives, set status to `PAID`
  - Option A: manually set `PAID`
  - Option B: run `sendPaidConfirmation("THORBURN-<row>")`
- Expired unpaid holds are auto-marked `HOLD_EXPIRED`
- Over-capacity requests are `WAITLIST`

## Optional quick improvements

- Add a “How many seats left” formula in sheet dashboard tab
- Add conditional formatting by `status`
- Create filter views for `HOLD_UNPAID` and `WAITLIST`

## Notes

- This is intentionally temporary and simple.
- Good enough for one event; replace with proper booking + payment integration later.
