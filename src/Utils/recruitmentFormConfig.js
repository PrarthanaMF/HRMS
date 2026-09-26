// ---------------------------------------------------------------------------
// "New Recruitment" — Google Form (candidate application) prefill config
// ---------------------------------------------------------------------------
// The candidate fills Name / Contact Number / Email ID / Salary Expectation
// themselves. Only Position Applied and Location are known from the vacancy
// being updated, and HR Name comes from the logged-in HR account — those
// three are passed to Google Forms as a pre-filled link, so the candidate
// sees them already filled in and only needs to fill in the rest.
//
// HOW TO WIRE UP THE REAL FIELD IDs (one-time setup, takes 2 minutes):
//   1. Open the form in Google Forms (edit mode, not the viewform link).
//   2. Click the ⋮ (three-dot) menu → "Get pre-filled link".
//   3. Type anything into "Position Applied" and "Location" (leave
//      Name/Contact/Email/Salary Expectation blank) → click "Get link".
//   4. Copy the generated URL — it will look like:
//        .../viewform?usp=pp_url&entry.111111111=X&entry.222222222=Y
//   5. Match each entry.NNNNNNNNN number to the field you typed into, and
//      paste those numbers below.
// Until this is done, the fields below are left blank and the form simply
// opens without prefill (still fully usable — the candidate can type them
// in manually) while the "?" hint on the modal reminds you to fill this in.
//
// ===========================================================================
// REQUIRED FIX — "Position Applied" / "Location" / "HR Name" still show as
// a DROPDOWN (with an arrow, "Choose") instead of the plain pre-filled value,
// and HR Name shows up blank / "This is a required question" even though a
// name was sent.
// ===========================================================================
// This is NOT something this code or the URL params can fix — a URL can only
// pre-*select* one of the options a dropdown/multiple-choice question
// already has; it can never turn that question into plain text, and if the
// value sent doesn't exactly match one of the existing choices (e.g. a name
// that isn't already listed as an option), Google Forms just leaves it
// unselected — which is exactly the blank "Choose" + required-question error
// on HR Name in the screenshot.
//
// The fix has to be made once, inside Google Forms itself:
//   1. Open the form in Google Forms (edit mode) — not the public link.
//   2. Click on the "Position Applied" question. Top-right of that question
//      is a dropdown currently set to "Dropdown" — change it to
//      "Short answer".
//   3. Do the same for "Location" and for "HR Name".
//   4. Re-generate the pre-filled link (steps above) and confirm the
//      entry.NNNN numbers below still match — they usually don't change
//      when you switch question type, but double-check.
// Once those three are "Short answer", the pre-filled value shows up
// directly as plain, already-typed text — no dropdown, no arrow, and it
// will never fail to match because a short-answer question has no fixed
// list of choices to match against.
export const RECRUITMENT_FORM_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLSebtYEisCA2extIKjDTDhf0kWZvIBF1honu1vxPRD5KXoE2ow/viewform'

// Paste the entry.NNNNNNNNN IDs here once you have them (see steps above).
export const RECRUITMENT_FORM_ENTRY_IDS = {
    positionApplied: 'entry.1834903782',
    location: 'entry.1510162874',
    hrName: 'entry.724275519',
}

/**
 * Builds a pre-filled Google Form link for the "New Recruitment" candidate
 * application form: Position Applied and Location come from the vacancy
 * being updated, HR Name comes from the currently logged-in account.
 * Salary Expectation is intentionally never pre-filled — the candidate
 * always types that in themselves.
 */
export const buildRecruitmentFormUrl = ({ position, location, hrName }) => {
    const params = new URLSearchParams({ usp: 'pp_url' })

    const {
        positionApplied,
        location: locationEntry,
        hrName: hrNameEntry,
    } = RECRUITMENT_FORM_ENTRY_IDS

    if (positionApplied && position) params.set(positionApplied, position)
    if (locationEntry && location) params.set(locationEntry, location)
    if (hrNameEntry && hrName) params.set(hrNameEntry, hrName)

    return `${RECRUITMENT_FORM_URL}?${params.toString()}`
}

// True once all three entry IDs above have been filled in
export const RECRUITMENT_FORM_IS_CONFIGURED = Boolean(
    RECRUITMENT_FORM_ENTRY_IDS.positionApplied &&
    RECRUITMENT_FORM_ENTRY_IDS.location &&
    RECRUITMENT_FORM_ENTRY_IDS.hrName
)