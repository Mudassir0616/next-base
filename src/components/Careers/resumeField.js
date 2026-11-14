// The resume upload both career forms share. `accept` and `max_size` are
// enforced by GlobalForm's validation, so they must agree with `helper_text`.
export const RESUME_FIELD = {
  name: "resume",
  label: "Resume / CV",
  type: "file",
  placeholder: "Drop your resume here or browse",
  helper_text: "PDF, DOC or DOCX up to 5MB",
  accept: {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
  },
  max_size: 5 * 1024 * 1024,
  fullWidth: true,
  xs: 12,
};
