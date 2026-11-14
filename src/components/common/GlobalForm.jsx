import { useEffect, useMemo, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Rating,
  Select,
  Slider,
  Switch,
  TextField,
  ThemeProvider,
  createTheme,
  useTheme,
} from "@mui/material";
import {
  CloudUploadOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { useDropzone } from "react-dropzone";
import moment from "moment";

/*
 * Schema-driven form. Each `form_config` entry describes one field:
 *
 *   { name, label, type, required, validation_message, placeholder,
 *     helper_text, options, rows, xs/sm/md/lg, ... }
 *
 * Types: text (default), email, tel, url, number, password (+show_password),
 * select, radio, checkbox, switch, date, time, date-time, file, image,
 * multi-select-checkbox, multi-select-dropdown, chips, slider, rating, hidden.
 *
 * `file`/`image` also take `accept` (a react-dropzone accept map) and
 * `max_size` (bytes); both are enforced by validation, so a rejected file
 * shows an error instead of silently not attaching.
 *
 * `on_Submit(values, resetForm)` may be async. It is awaited — the submit
 * button stays disabled meanwhile — and a throw is caught here: APIBase has
 * already toasted the error, so the form just stays filled in for a retry.
 */

// Field styling layered on top of the app theme (src/theme.js) — never in
// place of it, or forms lose the site font and the raised zIndex scale that
// keeps their menus above the fixed navbar.
const FORM_THEME_OVERRIDES = {
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#EDEDED",
          },
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: "#EDEDED",
          },
        },
        input: {
          padding: "10px",
          fontSize: "1rem",
          backgroundColor: "white",
          color: "#292929",
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: "white",
          borderRadius: "4px",
          "&.Mui-focused": {
            backgroundColor: "white",
          },
        },
        input: {
          padding: "10px",
          fontSize: "1rem",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          padding: 0,
          fontSize: "1rem",
          backgroundColor: "white",
          color: "#292929",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          padding: "10px !important",
          backgroundColor: "#292929",
          borderRadius: "4px",
        },
        select: {
          padding: "10px !important",
        },
        icon: {
          color: "#333",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#3f51b5",
          "&.Mui-checked": {
            color: "#3f51b5",
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#3f51b5",
          "&.Mui-checked": {
            color: "#3f51b5",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: "#999",
          "&.Mui-checked": {
            color: "#3f51b5",
          },
        },
        track: {
          backgroundColor: "#ccc",
          ".Mui-checked + &": {
            backgroundColor: "#3f51b5",
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& .MuiAutocomplete-tag": {
            backgroundColor: "#000000",
            borderRadius: "5px",
            border: "1px solid #777777",
            color: "#eeeeee",
            "& .MuiChip-label": {
              padding: "0 8px",
              fontSize: "0.9rem",
            },
            "& .MuiChip-deleteIcon": {
              color: "#eeeeee",
            },
          },
        },
        inputRoot: {
          fontSize: "1rem",
        },
        input: {
          padding: "10px",
          fontSize: "1rem",
        },
      },
    },
  },
};

// Digits with the separators people actually type: "+91 97693 95503",
// "+1 (555) 000-0000". 7–15 digits covers national and E.164 numbers.
const PHONE_PATTERN = /^\+?[\d\s().-]+$/;
const isPhone = (value) => {
  if (!value) return true;
  const digits = String(value).replace(/\D/g, "");
  return PHONE_PATTERN.test(value) && digits.length >= 7 && digits.length <= 15;
};

const formatBytes = (bytes) =>
  bytes >= 1024 * 1024
    ? `${Math.round(bytes / (1024 * 1024))}MB`
    : `${Math.round(bytes / 1024)}KB`;

// ".pdf, .doc, .docx" from a react-dropzone accept map
const acceptedExtensions = (accept) =>
  Object.values(accept || {})
    .flat()
    .map((extension) => extension.toLowerCase());

// Types whose control has no helper-text slot of its own, so `helper_text` is
// rendered under them. TextField types use TextField's `helperText`, and the
// dropzones print it inside the drop area.
const OWN_HELPER_TEXT = new Set([
  "radio",
  "checkbox",
  "switch",
  "date",
  "time",
  "date-time",
  "multi-select-checkbox",
  "multi-select-dropdown",
  "chips",
  "slider",
  "rating",
]);

// "" from an empty number input means "no value", not NaN
const emptyToUndefined = (value, original) =>
  original === "" || original === null ? undefined : value;

const fieldSchema = (field) => {
  const message =
    field.validation_message || `${field.label || field.name} is required`;
  const required = Boolean(field.required);

  const withRange = (schema) => {
    let ranged = schema;
    if (field.min !== undefined) {
      ranged = ranged.min(field.min, `Value must be at least ${field.min}`);
    }
    if (field.max !== undefined) {
      ranged = ranged.max(field.max, `Value must be at most ${field.max}`);
    }
    return ranged;
  };

  switch (field.type) {
    case "number":
    case "slider":
    case "rating": {
      const schema = withRange(
        Yup.number().typeError("Enter a number").transform(emptyToUndefined),
      );
      return required ? schema.required(message) : schema.nullable();
    }

    case "email": {
      const schema = Yup.string().email("Invalid email format");
      return required ? schema.required(message) : schema;
    }

    case "tel": {
      const schema = Yup.string().test(
        "phone",
        "Invalid phone number",
        isPhone,
      );
      return required ? schema.required(message) : schema;
    }

    case "url": {
      const schema = Yup.string().url("Invalid URL");
      return required ? schema.required(message) : schema;
    }

    case "date":
    case "time":
    case "date-time": {
      let schema = Yup.date().typeError("Invalid date").nullable();
      if (field.min_date) {
        const minDate = new Date(field.min_date);
        schema = schema.min(
          minDate,
          `Date must be on or after ${minDate.toLocaleDateString()}`,
        );
      }
      return required ? schema.required(message) : schema;
    }

    case "checkbox":
      return required
        ? Yup.boolean().oneOf([true], message)
        : Yup.boolean();

    case "switch":
      return Yup.boolean();

    case "file":
    case "image": {
      const extensions = acceptedExtensions(field.accept);
      let schema = Yup.mixed().nullable();

      if (extensions.length) {
        schema = schema.test(
          "file-type",
          `Accepted formats: ${extensions.join(", ")}`,
          (file) =>
            !file?.name ||
            extensions.some((extension) =>
              file.name.toLowerCase().endsWith(extension),
            ),
        );
      }
      if (field.max_size) {
        schema = schema.test(
          "file-size",
          `File must be ${formatBytes(field.max_size)} or smaller`,
          (file) => !file?.size || file.size <= field.max_size,
        );
      }
      return required ? schema.required(message) : schema;
    }

    case "multi-select-dropdown":
    case "multi-select-checkbox":
    case "chips": {
      let schema = Yup.array().of(Yup.string());
      if (field.max_items) {
        schema = schema.max(
          field.max_items,
          `You can add up to ${field.max_items} items`,
        );
      }
      return required ? schema.min(1, message).required(message) : schema;
    }

    default: {
      let schema = Yup.string();
      if (field.pattern) {
        schema = schema.matches(new RegExp(field.pattern), {
          message: field.pattern_message || "Invalid format",
          excludeEmptyString: true,
        });
      }
      return required ? schema.required(message) : schema;
    }
  }
};

const initialValue = (field) => {
  switch (field.type) {
    case "date":
      return field.default_date || "";
    case "multi-select-checkbox":
    case "multi-select-dropdown":
    case "chips":
      return [];
    case "checkbox":
    case "switch":
      return false;
    case "slider":
      return field.min ?? 0;
    case "rating":
    case "file":
    case "image":
      return null;
    default:
      return "";
  }
};

// Dropzones live outside GlobalForm: a component defined inside another's
// render is a new type on every render, so it would remount (and lose its
// state) on every keystroke anywhere in the form.
const FileUpload = ({ field, form, input }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: input.accept,
    multiple: false,
    // a rejected file is still stored, so validation can say why
    onDrop: (accepted, rejected) => {
      const file = accepted[0] || rejected[0]?.file || null;
      form.setFieldValue(field.name, file);
      form.setFieldTouched(field.name, true, false);
    },
  });

  return (
    <div {...getRootProps({ className: input.className ?? "dropzone" })}>
      <input {...getInputProps()} />
      <CloudUploadOutlined />
      <p>{field.value?.name || input.placeholder || "Upload File"}</p>
      {input.helper_text && (
        <span className="helper-text">{input.helper_text}</span>
      )}
    </div>
  );
};

const ImageUpload = ({ field, form, input }) => {
  const preview = useMemo(
    () =>
      field.value instanceof Blob ? URL.createObjectURL(field.value) : null,
    [field.value],
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: input.accept || { "image/*": [] },
    multiple: false,
    onDrop: (accepted, rejected) => {
      const file = accepted[0] || rejected[0]?.file || null;
      form.setFieldValue(field.name, file);
      form.setFieldTouched(field.name, true, false);
    },
  });

  return (
    <div {...getRootProps({ className: input.className ?? "dropzone" })}>
      <input {...getInputProps()} />
      {preview ? (
        <div className="img-container">
          <img src={preview} alt="Preview" />
          <p>{field.value?.name}</p>
        </div>
      ) : (
        <div className="upload">
          <CloudUploadOutlined />
          <p>{input.placeholder || "Upload Image"}</p>
          {input.helper_text && (
            <span className="helper-text">{input.helper_text}</span>
          )}
        </div>
      )}
    </div>
  );
};

const GlobalForm = ({
  form_config,
  custom_schema,
  on_Submit,
  editingValues,
  children,
  showSubmitBtn = true,
  btnText = "Submit",
  btnClassName = "",
  showTheme = true,
}) => {
  // per password field, so revealing one doesn't reveal the others
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const outerTheme = useTheme();
  const formTheme = useMemo(
    () => createTheme(outerTheme, FORM_THEME_OVERRIDES),
    [outerTheme],
  );

  const validationSchema = useMemo(
    () =>
      Yup.object().shape(
        Object.fromEntries(
          form_config.map((field) => [field.name, fieldSchema(field)]),
        ),
      ),
    [form_config],
  );

  const initialValues = Object.fromEntries(
    form_config.map((field) => [field.name, initialValue(field)]),
  );

  const handleSubmit = async (values, { resetForm }) => {
    try {
      await on_Submit(values, resetForm);
    } catch (error) {
      // APIBase has already told the visitor what went wrong
      console.error("Form submission failed:", error?.message || error);
    }
  };

  const form = (
    <Formik
      initialValues={editingValues ? editingValues : initialValues}
      validationSchema={custom_schema ? custom_schema : validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, setFieldValue, values, isSubmitting }) => {
        const hasError = (name) => Boolean(touched[name] && errors[name]);

        const errorText = (name) =>
          hasError(name) ? <div className="error">{errors[name]}</div> : null;

        const helperText = (input) =>
          input.helper_text && !hasError(input.name) ? (
            <FormHelperText>{input.helper_text}</FormHelperText>
          ) : null;

        const pickerSlotProps = (input) => ({
          textField: {
            fullWidth: input.fullWidth,
            error: hasError(input.name),
            placeholder: input.placeholder,
          },
        });

        const renderField = (input) => {
          switch (input.type) {
            case "radio":
              return (
                <FormControl component="fieldset" error={hasError(input.name)}>
                  <label>{input.label}</label>
                  <RadioGroup
                    row
                    name={input.name}
                    value={values[input.name]}
                    onChange={(event) =>
                      setFieldValue(input.name, event.target.value)
                    }
                  >
                    {input.options.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio />}
                        label={option.label}
                      />
                    ))}
                  </RadioGroup>
                  {errorText(input.name)}
                </FormControl>
              );

            case "checkbox":
            case "switch": {
              const Control = input.type === "checkbox" ? Checkbox : Switch;
              return (
                <FormControl
                  fullWidth={input.fullWidth}
                  error={hasError(input.name)}
                >
                  <FormControlLabel
                    control={
                      <Control
                        checked={Boolean(values[input.name])}
                        onChange={(event) =>
                          setFieldValue(input.name, event.target.checked)
                        }
                      />
                    }
                    label={input.label}
                  />
                  {errorText(input.name)}
                </FormControl>
              );
            }

            case "date":
              return (
                <FormControl fullWidth={input.fullWidth}>
                  <label>{input.label}</label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={
                        values[input.name] ? new Date(values[input.name]) : null
                      }
                      minDate={
                        input.min_date ? new Date(input.min_date) : undefined
                      }
                      onChange={(date) =>
                        setFieldValue(
                          input.name,
                          date ? moment(date).format("YYYY-MM-DD") : "",
                        )
                      }
                      slotProps={pickerSlotProps(input)}
                    />
                  </LocalizationProvider>
                  {errorText(input.name)}
                </FormControl>
              );

            case "time":
            case "date-time": {
              const Picker = input.type === "time" ? TimePicker : DateTimePicker;
              return (
                <FormControl fullWidth={input.fullWidth}>
                  <label>{input.label}</label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Picker
                      value={
                        values[input.name] ? new Date(values[input.name]) : null
                      }
                      onChange={(value) =>
                        setFieldValue(
                          input.name,
                          value
                            ? moment(value).format("YYYY-MM-DD HH:mm:ss Z")
                            : "",
                        )
                      }
                      slotProps={pickerSlotProps(input)}
                    />
                  </LocalizationProvider>
                  {errorText(input.name)}
                </FormControl>
              );
            }

            case "image":
            case "file": {
              const Upload = input.type === "image" ? ImageUpload : FileUpload;
              return (
                <FormControl fullWidth={input.fullWidth}>
                  <label>{input.label}</label>
                  <Field name={input.name}>
                    {({ field, form: formik }) => (
                      <Upload field={field} form={formik} input={input} />
                    )}
                  </Field>
                  {errorText(input.name)}
                </FormControl>
              );
            }

            case "multi-select-checkbox":
              return (
                <FormControl component="fieldset" error={hasError(input.name)}>
                  <label>{input.label}</label>
                  <Grid container>
                    {input.options.map((option) => (
                      <Grid item xs={12} sm={6} key={option.value}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={values?.[input.name]?.includes(
                                option.value,
                              )}
                              onChange={(event) => {
                                const set = new Set(values?.[input.name]);
                                if (event.target.checked) {
                                  set.add(option.value);
                                } else {
                                  set.delete(option.value);
                                }
                                setFieldValue(input.name, Array.from(set));
                              }}
                            />
                          }
                          label={option.label}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  {errorText(input.name)}
                </FormControl>
              );

            case "multi-select-dropdown":
              return (
                <FormControl fullWidth={input.fullWidth}>
                  <label>{input.label}</label>
                  <Select
                    name={input.name}
                    multiple
                    value={values[input.name]}
                    onChange={(event) =>
                      setFieldValue(input.name, event.target.value)
                    }
                    renderValue={(selected) =>
                      selected
                        .map(
                          (value) =>
                            input.options?.find((o) => o.value === value)
                              ?.label ?? value,
                        )
                        .join(", ")
                    }
                    error={hasError(input.name)}
                  >
                    {input?.options?.map((option) => (
                      <MenuItem key={option?.value} value={option?.value}>
                        <Checkbox
                          checked={values?.[input?.name]?.includes(
                            option?.value,
                          )}
                        />
                        <ListItemText primary={option?.label} />
                      </MenuItem>
                    ))}
                  </Select>
                  {errorText(input.name)}
                </FormControl>
              );

            case "chips":
              return (
                <FormControl fullWidth={input.fullWidth}>
                  <label>{input.label}</label>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={values[input.name] || []}
                    onChange={(event, newValue) => {
                      const capped = input.max_items
                        ? newValue.slice(0, input.max_items)
                        : newValue;
                      setFieldValue(input.name, capped);
                    }}
                    renderTags={(value, getTagProps) =>
                      value?.map((option, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={key}
                            variant="outlined"
                            label={option}
                            {...tagProps}
                          />
                        );
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={input.placeholder}
                        error={hasError(input.name)}
                        fullWidth={input.fullWidth}
                      />
                    )}
                  />
                  {errorText(input.name)}
                </FormControl>
              );

            case "slider":
            case "rating": {
              const Control = input.type === "slider" ? Slider : Rating;
              return (
                <FormControl fullWidth={input.fullWidth}>
                  <label>{input.label}</label>
                  <Control
                    name={input.name}
                    value={values[input.name]}
                    onChange={(event, value) => setFieldValue(input.name, value)}
                    min={input.min}
                    max={input.max}
                    step={input.step}
                  />
                  {errorText(input.name)}
                </FormControl>
              );
            }

            case "hidden":
              return <Field type="hidden" name={input.name} />;

            default:
              return (
                <Field name={input.name}>
                  {({ field }) => {
                    const isPassword =
                      input.type === "password" && input.show_password;
                    const visible = visiblePasswords[input.name];
                    const isSelect = input.type === "select";

                    return (
                      <>
                        <label>{input.label}</label>
                        <TextField
                          {...field}
                          type={isPassword && visible ? "text" : input.type}
                          fullWidth={input.fullWidth}
                          placeholder={input.placeholder ?? ""}
                          select={isSelect}
                          slotProps={{
                            inputLabel: { shrink: input.shrink },
                            select:
                              isSelect && input.placeholder
                                ? {
                                    displayEmpty: true,
                                    renderValue: (value) =>
                                      value === "" ? (
                                        <span className="select-placeholder">
                                          {input.placeholder}
                                        </span>
                                      ) : (
                                        input.options.find(
                                          (option) => option.value === value,
                                        )?.label ?? value
                                      ),
                                  }
                                : undefined,
                            input: isPassword
                              ? {
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() =>
                                          setVisiblePasswords((prev) => ({
                                            ...prev,
                                            [input.name]: !prev[input.name],
                                          }))
                                        }
                                        onMouseDown={(event) =>
                                          event.preventDefault()
                                        }
                                        edge="end"
                                      >
                                        {visible ? (
                                          <Visibility />
                                        ) : (
                                          <VisibilityOff />
                                        )}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }
                              : undefined,
                          }}
                          rows={input.rows}
                          multiline={Boolean(input.rows)}
                          error={hasError(field.name)}
                          helperText={
                            hasError(field.name)
                              ? errors[field.name]
                              : input.helper_text
                          }
                          onKeyDown={
                            input.type === "number"
                              ? (e) => {
                                  // block letters; keep digits, the decimal
                                  // point and editing/navigation keys
                                  if (e.key.length === 1 && !/[0-9.]/.test(e.key)) {
                                    e.preventDefault();
                                  }
                                }
                              : undefined
                          }
                        >
                          {isSelect &&
                            input.options.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                        </TextField>
                      </>
                    );
                  }}
                </Field>
              );
          }
        };

        return (
          <Form noValidate>
            <Grid container spacing={2}>
              {form_config?.map((input) => (
                <Grid
                  item
                  xs={input.xs}
                  sm={input.sm}
                  md={input.md}
                  lg={input.lg}
                  key={input.name}
                  className="global-form"
                >
                  {renderField(input)}
                  {OWN_HELPER_TEXT.has(input.type) && helperText(input)}
                </Grid>
              ))}
              {children}
            </Grid>

            {showSubmitBtn && (
              <Button
                type="submit"
                className={btnClassName}
                style={{ marginTop: "16px" }}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {btnText}
              </Button>
            )}
          </Form>
        );
      }}
    </Formik>
  );

  return showTheme ? (
    <ThemeProvider theme={formTheme}>{form}</ThemeProvider>
  ) : (
    form
  );
};

export default GlobalForm;
