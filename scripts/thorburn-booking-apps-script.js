const CONFIG = {
    SHEET_NAME: "Bookings",
    EVENT_NAME: "Cliff Thorburn Exhibition",
    EVENT_DATE: "Thursday, April 9",
    HOLD_HOURS: 3,
    TICKET_PRICE: 50,
    HST_RATE: 0.13,
    PAYMENT_EMAIL: "info@ottawasnookerclub.com",
    REPLY_TO_EMAIL: "info@ottawasnookerclub.com",
    SENDER_EMAIL: "ottawasnookerclub@gmail.com",
    FROM_NAME: "Ottawa Snooker Club",
};

const SYSTEM_HEADERS = [
    "booking_id",
    "requested_at",
    "status",
    "hold_expires_at",
    "paid_at",
    "admin_notes",
    "phone",
    "tickets",
    "name",
    "email",
];

function formatMoney_(amount) {
    return amount.toFixed(2);
}

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function normalizePhone(value) {
    return String(value || "").trim();
}

function normalizeKey_(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

function getNamedValue_(namedValues, aliases) {
    const aliasSet = new Set(aliases.map(normalizeKey_));
    for (const [key, value] of Object.entries(namedValues || {})) {
        if (aliasSet.has(normalizeKey_(key))) {
            return Array.isArray(value) ? value[0] : value;
        }
    }
    return "";
}

function toInt(value, fallback = 0) {
    const parsed = parseInt(String(value || "").trim(), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function getSheet_(event) {
    if (event?.range?.getSheet) {
        return event.range.getSheet();
    }
    const byName = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
    if (byName) return byName;
    return SpreadsheetApp.getActiveSheet();
}

function now_() {
    return new Date();
}

function holdExpiry_(start) {
    return new Date(start.getTime() + CONFIG.HOLD_HOURS * 60 * 60 * 1000);
}

function getHeaderMap_(sheet) {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const map = {};
    headers.forEach((name, idx) => {
        map[String(name).trim()] = idx;
    });
    return map;
}

function findHeaderIndex_(headerMap, candidates) {
    for (const candidate of candidates) {
        if (headerMap[candidate] !== undefined) return headerMap[candidate];
    }

    const normalizedCandidates = new Set(candidates.map(normalizeKey_));
    for (const [key, index] of Object.entries(headerMap)) {
        if (normalizedCandidates.has(normalizeKey_(key))) {
            return index;
        }
    }
    return undefined;
}

function ensureSystemHeaders_(sheet) {
    const lastColumn = Math.max(sheet.getLastColumn(), 1);
    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(value => String(value || "").trim());
    const existing = new Set(headers.filter(Boolean));

    const missing = SYSTEM_HEADERS.filter(header => !existing.has(header));
    if (missing.length > 0) {
        sheet.getRange(1, lastColumn + 1, 1, missing.length).setValues([missing]);
    }
}

function countReservedTickets_(sheet, headerMap, now) {
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return 0;

    const rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    const statusIdx = findHeaderIndex_(headerMap, ["status"]);
    const ticketsIdx = findHeaderIndex_(headerMap, ["tickets", "Number of Tickets"]);
    const expiresIdx = findHeaderIndex_(headerMap, ["hold_expires_at"]);

    if (statusIdx === undefined || ticketsIdx === undefined || expiresIdx === undefined) {
        return 0;
    }

    let reserved = 0;
    rows.forEach((row) => {
        const status = String(row[statusIdx] || "").trim().toUpperCase();
        const tickets = toInt(row[ticketsIdx], 0);
        const expiresAt = row[expiresIdx] instanceof Date ? row[expiresIdx] : null;

        if (status === "PAID") {
            reserved += tickets;
            return;
        }

        if (status === "HOLD_UNPAID" && expiresAt && expiresAt.getTime() > now.getTime()) {
            reserved += tickets;
        }
    });

    return reserved;
}

function sendHoldEmail_(email, name, tickets, holdUntil, bookingId) {
    const subtotal = tickets * CONFIG.TICKET_PRICE;
    const hst = subtotal * CONFIG.HST_RATE;
    const total = subtotal + hst;
    const subject = `[${CONFIG.EVENT_NAME}] Hold placed for ${tickets} ticket(s)`;
    const body = `Hi ${name},\n\nYour booking request has been received.\n\nBooking ID: ${bookingId}\nHold expires: ${holdUntil.toLocaleString()}\n\nYour tickets will be held for 3 hours to make payment. To pay for your ${tickets} ticket(s), send email money transfer of the total below to ${CONFIG.PAYMENT_EMAIL}.\n\nTickets: ${tickets}\nPrice: ${formatMoney_(CONFIG.TICKET_PRICE)} x ${tickets} = ${formatMoney_(subtotal)}\nHST: 13% of ${formatMoney_(subtotal)} = ${formatMoney_(hst)}\nTotal: ${formatMoney_(total)}\n\nPlease include your full name in the transfer message.\nReply to this email with your payment confirmation screenshot (or confirmation number).\n\nOttawa Snooker Club`;

    MailApp.sendEmail({
        to: email,
        subject,
        body,
        name: CONFIG.FROM_NAME,
        replyTo: CONFIG.REPLY_TO_EMAIL,
    });
}

function sendSoldOutEmail_(email, name) {
    const subject = `[${CONFIG.EVENT_NAME}] Waitlist update`;
    const body = `Hi ${name},\n\nThanks for your interest in ${CONFIG.EVENT_NAME}.\nAt the moment, all seats are reserved or sold.\n\nWe have added your request to the waitlist and will contact you if seats open.\n\nOttawa Snooker Club`;

    MailApp.sendEmail({
        to: email,
        subject,
        body,
        name: CONFIG.FROM_NAME,
        replyTo: CONFIG.REPLY_TO_EMAIL,
    });
}

function sendEmailSelfTest(recipientEmail) {
    const email = normalizeEmail(recipientEmail);
    if (!email) throw new Error("recipientEmail is required");
    MailApp.sendEmail({
        to: email,
        subject: `[${CONFIG.EVENT_NAME}] Email test`,
        body: `If you received this, Apps Script mail permissions are working.\n\nExpected sender account: ${CONFIG.SENDER_EMAIL}\nReply-To: ${CONFIG.REPLY_TO_EMAIL}`,
        name: CONFIG.FROM_NAME,
        replyTo: CONFIG.REPLY_TO_EMAIL,
    });
}

function onFormSubmit(e) {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    try {
        const sheet = getSheet_(e);
        ensureSystemHeaders_(sheet);
        const headerMap = getHeaderMap_(sheet);
        const row = e.range.getRow();

        const name = String(getNamedValue_(e.namedValues, ["Name", "Full Name", "Your Name"]) || "").trim();
        const email = normalizeEmail(getNamedValue_(e.namedValues, ["Email", "Email Address", "E-mail", "E-mail Address"]));
        const phone = normalizePhone(getNamedValue_(e.namedValues, ["Phone", "Phone Number", "Mobile", "Contact Number"]));
        const tickets = toInt(getNamedValue_(e.namedValues, ["Number of Tickets", "Tickets", "Ticket Count", "How many tickets?"]), 0);

        if (!name || !email || tickets <= 0) {
            const statusIdx = findHeaderIndex_(headerMap, ["status"]);
            if (statusIdx !== undefined) {
                sheet.getRange(row, statusIdx + 1).setValue("INVALID");
            }
            if (headerMap.admin_notes !== undefined) {
                sheet.getRange(row, headerMap.admin_notes + 1).setValue(
                    `Missing/invalid fields. name=${name ? "ok" : "missing"}, email=${email ? "ok" : "missing"}, tickets=${tickets}`
                );
            }
            return;
        }

        const now = now_();
        const bookingId = `THORBURN-${row}`;

        if (headerMap.booking_id !== undefined) sheet.getRange(row, headerMap.booking_id + 1).setValue(bookingId);
        if (headerMap.name !== undefined) sheet.getRange(row, headerMap.name + 1).setValue(name);
        if (headerMap.email !== undefined) sheet.getRange(row, headerMap.email + 1).setValue(email);
        if (headerMap.phone !== undefined) sheet.getRange(row, headerMap.phone + 1).setValue(phone);
        if (headerMap.tickets !== undefined) sheet.getRange(row, headerMap.tickets + 1).setValue(tickets);
        if (headerMap.requested_at !== undefined) sheet.getRange(row, headerMap.requested_at + 1).setValue(now);

        const holdUntil = holdExpiry_(now);
        if (headerMap.status !== undefined) sheet.getRange(row, headerMap.status + 1).setValue("HOLD_UNPAID");
        if (headerMap.hold_expires_at !== undefined) sheet.getRange(row, headerMap.hold_expires_at + 1).setValue(holdUntil);
        sendHoldEmail_(email, name, tickets, holdUntil, bookingId);
    } finally {
        lock.releaseLock();
    }
}

function expireUnpaidHolds() {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    try {
        const sheet = getSheet_();
        const headerMap = getHeaderMap_(sheet);
        const lastRow = sheet.getLastRow();
        if (lastRow < 2) return;

        const rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
        const now = now_();

        const statusIdx = findHeaderIndex_(headerMap, ["status"]);
        const expiresIdx = findHeaderIndex_(headerMap, ["hold_expires_at"]);
        if (statusIdx === undefined || expiresIdx === undefined) return;

        rows.forEach((row, index) => {
            const status = String(row[statusIdx] || "").trim().toUpperCase();
            const expiresAt = row[expiresIdx] instanceof Date ? row[expiresIdx] : null;
            if (status === "HOLD_UNPAID" && expiresAt && expiresAt.getTime() <= now.getTime()) {
                const rowNum = index + 2;
                sheet.getRange(rowNum, statusIdx + 1).setValue("HOLD_EXPIRED");
            }
        });
    } finally {
        lock.releaseLock();
    }
}

function sendPaidConfirmation(bookingId) {
    const sheet = getSheet_();
    const headerMap = getHeaderMap_(sheet);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    const matchIndex = rows.findIndex((row) => String(row[headerMap.booking_id] || "").trim() === bookingId);
    if (matchIndex === -1) throw new Error(`Booking not found: ${bookingId}`);

    const rowNum = matchIndex + 2;
    const row = rows[matchIndex];
    const name = String(row[headerMap.name] || "").trim();
    const email = normalizeEmail(row[headerMap.email]);
    const tickets = toInt(row[headerMap.tickets], 0);

    sheet.getRange(rowNum, headerMap.status + 1).setValue("PAID");
    sheet.getRange(rowNum, headerMap.paid_at + 1).setValue(now_());

    const subject = `[${CONFIG.EVENT_NAME}] Payment received (${tickets} ticket${tickets === 1 ? "" : "s"})`;
    const body = `Hi ${name},\n\nPayment received and your booking is confirmed.\n\nBooking ID: ${bookingId}\nTickets: ${tickets}\nEvent date: ${CONFIG.EVENT_DATE}\n\nWe will follow up with final event details before the exhibition.\n\nOttawa Snooker Club`;

    MailApp.sendEmail({
        to: email,
        subject,
        body,
        name: CONFIG.FROM_NAME,
        replyTo: CONFIG.REPLY_TO_EMAIL,
    });
}
