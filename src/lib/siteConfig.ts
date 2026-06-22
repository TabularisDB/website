export const OG_IMAGE_URL =
  "https://tabularis.dev/img/og.png";

// emailchef-backed product-discovery survey (see SurveyPrompt.tsx).
//
// Submissions go to emailchef exactly like the newsletter/sponsor forms: a
// native POST to signupwl/<token>, with the survey answers mapped onto custom
// fields of the resulting contact. Because emailchef is a contact-list tool,
// an email is required and each answer is stored as a custom field.
//
// To wire it up: create a new emailchef form whose custom fields cover the
// survey questions, then fill in the values below from that form's embed code:
//   - `token`  : the long string in the action URL,
//                https://app.emailchef.com/signupwl/<token>/en
//   - `formId` : the hidden `form_id` value
//   - `fields` : the N in each custom field's name="field[N]" (email is -1)
//
// While `token` is left as the placeholder the survey does NOT render, so the
// site never ships a broken submit.
export const SURVEY_EMAILCHEF = {
  token: "7o22666s726q5s6964223n2237363036227q",
  formId: "7606",
  // The redirect target after a successful submit.
  redirect: "/thanks-survey",
  // emailchef custom-field ids (the N in name="field[N]"). Create these custom
  // fields on the list in emailchef, then paste their ids here. Standard fields
  // on this list: email = -1, first name = -2, last name = -3.
  fields: {
    role: "217648",
    databases: "217649",
    priorities: "217650",
    missing: "217651",
    // Newsletter opt-in — emailchef boolean field "is_newsletter" (sent as
    // "1"/"0"). Segment or automate the move to the newsletter list in
    // emailchef off this flag.
    newsletter: "217652",
  },
} as const;

// The survey only renders once the custom fields are wired up — otherwise the
// answers would POST to non-existent fields and be silently dropped.
export const SURVEY_CONFIGURED =
  !SURVEY_EMAILCHEF.fields.role.startsWith("REPLACE");
