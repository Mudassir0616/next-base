import { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { ContactApi } from "@/api/api";
import { validateEmail } from "@/utils/functionUtils";
import { useRouter } from "next/router";
import { East } from "@mui/icons-material";
import { usePopupForm } from "@/context/usePopupForm";

const AUTO_OPEN_DELAY = 120000; // two minutes
const SUBMITTED_KEY = "popupFormSubmitted";
const DISMISSED_KEY = "popupFormDismissed";

// letters in any script, spaces and the punctuation real names carry
// (O'Brien, Jean-Luc, J. R. R.)
const NAME_PATTERN = /^[\p{L}\p{M}\s'’.-]*$/u;

const EMPTY_FORM = {
  full_name: "",
  company_name: "",
  email: "",
  message: "",
};

// localStorage throws in some privacy modes; an unreadable store simply means
// the prompt is offered again, and an unwritable one that it isn't retired.
const readFlag = (key) => {
  try {
    return Boolean(localStorage.getItem(key));
  } catch {
    return false;
  }
};

const writeFlag = (key) => {
  try {
    localStorage.setItem(key, "true");
  } catch (error) {
    console.error("Could not persist the popup state:", error);
  }
};

// Once the visitor has sent the form or closed it, it never opens on its own again.
const isRetired = () => readFlag(SUBMITTED_KEY) || readFlag(DISMISSED_KEY);

const PopupForm = () => {
  const router = useRouter();

  // open state lives in the context so any page can raise this form
  const { open, openPopup, closePopup } = usePopupForm();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // The prompt is offered once, two minutes in. Sending the form or closing it
  // retires it for good — from then on it only opens when something calls
  // openPopup(). Deliberately not keyed on `open`, so opening or closing the
  // form cannot restart the countdown.
  useEffect(() => {
    if (isRetired()) return;

    const timer = setTimeout(() => {
      // re-checked at fire time: the visitor may have opened and dismissed it
      // by hand while the countdown was running
      if (!isRetired()) openPopup();
    }, AUTO_OPEN_DELAY);

    return () => clearTimeout(timer);
  }, [openPopup]);

  // closing by any route — the X, the backdrop, Escape — retires the prompt
  const dismissPopup = () => {
    writeFlag(DISMISSED_KEY);
    closePopup();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "full_name" && !NAME_PATTERN.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Remove error when user starts fixing field
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    try {
      // Map the popup fields onto the Contact model of the CMS
      await ContactApi.post("", {
        full_name: formData.full_name,
        company_name: formData.company_name,
        email: formData.email,
        requirement: formData.message,
        journey_path: window.location.href,
      });

      writeFlag(SUBMITTED_KEY);
      toast.success("Form submitted successfully!");

      setFormData(EMPTY_FORM);
      setErrors({});
      closePopup();
      router.push("/thank-you");
    } catch (error) {
      // APIBase has already toasted the reason
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={Boolean(open)}
      onClose={dismissPopup}
      aria-labelledby="popup-form-title"
      // z-index deliberately left to the theme: it lifts the whole MUI overlay
      // scale above the navbar. See the zIndex note in src/theme.js.
    >
      <Box
        // Lenis is still running behind the popup and preventDefaults every
        // wheel event, so the box has to opt its own scrolling back in
        data-lenis-prevent
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: "80%", md: "70%", lg: "60%", xl: "50%" },
          // a laptop viewport is shorter than the form: cap it and scroll
          maxHeight: "90vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          padding: "10px",
          borderRadius: "12px",
          // MUI focuses the dialog itself on open; the fields show focus instead
          outline: "none",
        }}
        // the dialog shell (size, scroll, padding) lives in `sx`; the layout
        // inside it is `.popup-form` in main.scss
        className="popup-form-modal"
      >
        <div className="popup-form">
          <div className="img-container">
            <img
              src="/images/popup-frame.jpg"
              alt=""
              // a clone without the file shows the panel's gradient, not a
              // broken-image icon
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="form-container">
            <button
              className="cancel"
              onClick={dismissPopup}
              aria-label="Close"
            >
              <CloseIcon sx={{ fontSize: "25px" }} />
            </button>
            <h5 id="popup-form-title">
              What <span>Challenge</span> Are You Looking To Solve?
            </h5>

            <div style={{ marginTop: "20px" }}>
              <div className="form-group">
                <div className="input">
                  <label htmlFor="popup-full-name">
                    Full Name <span>*</span>
                  </label>
                  <input
                    id="popup-full-name"
                    type="text"
                    name="full_name"
                    autoComplete="name"
                    placeholder={"Enter full name"}
                    value={formData.full_name}
                    aria-invalid={Boolean(errors.full_name)}
                    aria-describedby={errors.full_name ? "popup-full_name-error" : undefined}
                    onChange={handleChange}
                  />
                  {errors.full_name && (
                    <span className="error" id="popup-full_name-error">{errors.full_name}</span>
                  )}
                </div>

                <div className="input">
                  <label htmlFor="popup-company-name">Company Name</label>
                  <input
                    id="popup-company-name"
                    type="text"
                    name="company_name"
                    autoComplete="organization"
                    placeholder={"Company name"}
                    value={formData.company_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input">
                <label htmlFor="popup-email">
                  Email Address <span>*</span>
                </label>
                <input
                  id="popup-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder={"your@email.com"}
                  value={formData.email}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "popup-email-error" : undefined}
                  onChange={handleChange}
                />
                {errors.email && <span className="error" id="popup-email-error">{errors.email}</span>}
              </div>

              <div className="input">
                <label htmlFor="popup-message">
                  Message <span>*</span>
                </label>
                <textarea
                  id="popup-message"
                  name="message"
                  rows={5}
                  placeholder={"Enter your message"}
                  value={formData.message}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "popup-message-error" : undefined}
                  onChange={handleChange}
                />
                {errors.message && (
                  <span className="error" id="popup-message-error">{errors.message}</span>
                )}
              </div>

              <button
                className="cta-btn"
                onClick={handleSubmit}
                disabled={submitting}
                aria-busy={submitting}
              >
                Send Enquiry <East />
              </button>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default PopupForm;
