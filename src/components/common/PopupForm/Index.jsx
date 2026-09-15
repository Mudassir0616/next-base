import { useEffect, useRef, useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { ContactApi } from "@/api/api";
import { validateEmail, validatePhone } from "@/utils/functionUtils";
import { useRouter } from "next/router";
import { East } from "@mui/icons-material";
import { usePopupForm } from "@/context/usePopupForm";
import { FONT_FAMILY } from "@/theme";

const AUTO_OPEN_DELAY = 120000; // two minutes
const SUBMITTED_KEY = "popupFormSubmitted";
const DISMISSED_KEY = "popupFormDismissed";

// Once the visitor has sent the form or closed it, it never opens on its own
// again; localStorage is read defensively because it throws in some privacy
// modes, and an unreadable store simply means the prompt is offered again.
const isRetired = () => {
  try {
    return Boolean(
      localStorage.getItem(SUBMITTED_KEY) ||
      localStorage.getItem(DISMISSED_KEY),
    );
  } catch (error) {
    return false;
  }
};

// The popup's other fields are plain inputs styled by `.input` in global.css,
// so the Select is dressed to match instead of carrying MUI's outlined look.
const selectStyles = {
  backgroundColor: "#FFFFFF",
  borderRadius: "5px",
  fontFamily: FONT_FAMILY,
  "& .MuiSelect-select": {
    padding: "10px 15px",
    fontSize: "16px",
    color: "#1a1a1a",
    fontFamily: FONT_FAMILY,
    "@media (max-width: 768px)": {
      fontSize: "12px",
      padding: "8px 15px",
    },
  },
  "& .MuiOutlinedInput-notchedOutline, &:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "#E6E6E6",
      borderWidth: "1px",
    },
  "& .select-placeholder": {
    color: "#6D6D6D",
    fontSize: "14px",
  },
};

const menuStyles = {
  maxHeight: 300,
  "& .MuiMenuItem-root": {
    fontFamily: FONT_FAMILY,
    fontSize: "15px",
    whiteSpace: "normal",
  },
};

const PopupForm = () => {
  const router = useRouter();

  // open state lives in the context so any page can raise this form
  const { open, openPopup, closePopup } = usePopupForm();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    company_name: "",
    email: "",
    challenge: "",
    message: "",
  });

  const [challenges, setChallenges] = useState([]);

  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // The dropdown follows the expertise areas held in the CMS
  // const fetch_challenges = async () => {
  //   try {
  //     const res = await ExpertiseCategoryApi.get(`?order_by=order_by`);
  //     setChallenges(res?.results || []);
  //   } catch (error) {
  //     console.error("Failed to fetch expertise categories:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetch_challenges();
  // }, []);

  // The prompt is offered once, two minutes in. Sending the form or closing it
  // retires it for good — from then on it only opens when something calls
  // openPopup(), like the "Request Policy" button. Deliberately not keyed on
  // `open`, so opening or closing the form cannot restart the countdown.
  useEffect(() => {
    if (isRetired()) {
      setSubmitted(true);
      return;
    }

    const timer = setTimeout(() => {
      // re-checked at fire time: the visitor may have opened and dismissed it
      // by hand while the countdown was running
      if (!isRetired()) openPopup();
    }, AUTO_OPEN_DELAY);

    return () => clearTimeout(timer);
  }, [openPopup]);

  // closing by any route — the X, the backdrop, Escape — retires the prompt
  const dismissPopup = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch (error) {
      console.error("Could not persist the popup dismissal:", error);
    }

    setSubmitted(true);
    closePopup();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "full_name") {
      // Allow only letters and spaces
      if (!/^[a-zA-Z\s]*$/.test(value)) return;
    }

    if (name === "phone_number") {
      // Allow only digits
      if (!/^\d*$/.test(value)) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove error when user starts fixing field
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async () => {
    const newErrors = {};

    // Required checks
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.challenge) {
      newErrors.challenge = "Please select a challenge";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    // Stop if errors exist
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Map the popup fields onto the Contact model of the CMS
      const payload = {
        full_name: formData.full_name,
        company_name: formData.company_name,
        email: formData.email,
        interested_in: formData.challenge,
        requirement: formData.message,
        journey_path: typeof window !== "undefined" ? window.location.href : "",
      };

      const res = await ContactApi.post("", payload);
      setFormSubmitted(true);
      localStorage.setItem(SUBMITTED_KEY, "true");

      toast.success("Form submitted successfully!");

      // optional reset
      setFormData({
        full_name: "",
        company_name: "",
        email: "",
        challenge: "",
        message: "",
      });

      setErrors({});
      closePopup();
      router.push("/thank-you");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      open={Boolean(open)}
      onClose={dismissPopup}
      aria-labelledby="popup-form-title"
      // z-index deliberately left to the theme: it lifts the whole MUI overlay
      // scale above the navbar, so the Select's menu shares this dialog's layer
      // instead of opening behind it. See the zIndex note in src/theme.js.
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
          padding: "10px ",
          borderRadius: 1,
        }}
        className="popup-form"
      >
        <div className="popup-form">
          <div className="img-container">
            <img src="/images/popup-frame.jpg" alt="" />
          </div>

          <div className="form-container">
            <button className="cancel" onClick={dismissPopup}>
              <CloseIcon sx={{ fontSize: "25px" }} />
            </button>
            <h5>
              What <span>Challenge</span> Are You Looking To Solve?
            </h5>

            <div style={{ marginTop: "20px" }}>
              <div className="form-group">
                <div className="input">
                  <label>
                    Full Name <span>*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    placeholder={"Enter full name"}
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                  {errors.full_name && (
                    <span className="error">{errors.full_name}</span>
                  )}
                </div>

                <div className="input">
                  <label> Company Name</label>
                  <input
                    type="text"
                    name="company_name"
                    placeholder={"Enter company name"}
                    value={formData.company_name}
                    onChange={handleChange}
                  />
                  {errors.company_name && (
                    <span className="error">{errors.company_name}</span>
                  )}
                </div>
              </div>

              <div className="input">
                <label htmlFor="Email Address">
                  Email Address <span>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder={"your@email.com"}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>

              {/* <div className="input">
                <label>
                  Challenge You're Looking to Solve <span>*</span>
                </label>

                <Select
                  name="challenge"
                  value={formData.challenge}
                  onChange={handleChange}
                  displayEmpty
                  fullWidth
                  // matches the plain inputs above rather than MUI's own look
                  sx={selectStyles}
                  MenuProps={{ PaperProps: { sx: menuStyles } }}
                  renderValue={(selected) =>
                    selected || (
                      <span className="select-placeholder">
                        Select a challenge
                      </span>
                    )
                  }
                >
                  {challenges.map((challenge) => (
                    <MenuItem key={challenge.id} value={challenge.title}>
                      {challenge.title}
                    </MenuItem>
                  ))}

                  <MenuItem value="Other">Other</MenuItem>
                </Select>

                {errors.challenge && (
                  <span className="error">{errors.challenge}</span>
                )}
              </div> */}

              <div className="input">
                <label>
                  Message <span>*</span>
                </label>
                <textarea
                  type="text"
                  name="message"
                  rows={5}
                  placeholder={"Enter your message"}
                  value={formData.message}
                  onChange={handleChange}
                />
                {errors.message && (
                  <span className="error">{errors.message}</span>
                )}
              </div>

              <button className="cta-btn" onClick={handleSubmit}>
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
