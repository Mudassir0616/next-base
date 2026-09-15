import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { useDropzone } from "react-dropzone";
import moment from "moment";

const theme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          // This affects the root container of the TextField
          // Add your custom global styling here
          // For example, a global light-gray background and rounded corners:

          borderRadius: "4px",
          // Add spacing or margins if desired
          // marginBottom: "16px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // This targets the actual input element inside Outlined variants.
          // You can define border styling, focus states, etc.
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#EDEDED", // Example focus color
          },
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: "#EDEDED", // Default border color
          },
        },
        input: {
          // This targets the text inside the input
          padding: "10px",
          // Change font or color if you want:
          fontSize: "1rem",
          backgroundColor: "white",
          color: "#292929",
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          // For filled input variants if you use them
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
          // This can apply to all base input styles, including select, etc.
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
          padding: "10px !important", // Ensures the select field has 0 padding
          backgroundColor: "#292929",
          borderRadius: "4px",
        },
        select: {
          padding: "10px !important", // Ensures no extra padding inside the select field
        },
        icon: {
          color: "#333",
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          // Style checkboxes globally
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
          // Style radio buttons globally
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
          // Style switches globally
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
          // This targets the root element of the Autocomplete
          // and from there, we can nest selectors to target inner elements.
          "& .MuiAutocomplete-tag": {
            // This specifically targets the chips inside the Autocomplete.
            backgroundColor: "#00000", // Dark background for the chips
            borderRadius: "5px", // Rounded corners
            border: "1px solid #777777", // A subtle border
            color: "#eeeeee", // Light text for readability against dark background
            // You can also target inner parts of the chip:
            "& .MuiChip-label": {
              padding: "0 8px", // Adjust spacing inside the label
              fontSize: "0.9rem", // Slightly adjust font size if desired
            },
            "& .MuiChip-deleteIcon": {
              color: "#eeeeee", // Make the delete icon match the text color
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
    // Add more overrides as needed for other input types
  },
});

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
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape(
    form_config.reduce((schema, field) => {
      if (field?.required) {
        if (field.type === "select" || field.type === "radio") {
          schema[field.name] = Yup.string().required(field.validation_message);
        } else if (field.type === "number") {
          let numberSchema = Yup.number().required(field.validation_message);
          if (field.min !== undefined) {
            numberSchema = numberSchema.min(
              field.min,
              `Value must be at least ${field.min}`
            );
          }
          if (field.max !== undefined) {
            numberSchema = numberSchema.max(
              field.max,
              `Value must be at most ${field.max}`
            );
          }
          schema[field.name] = numberSchema;
        } else if (field.type === "text") {
          let stringSchema = Yup.string().required(field.validation_message);
          if (field.pattern) {
            stringSchema = stringSchema.matches(
              new RegExp(field.pattern),
              field.pattern_message || "Invalid format"
            );
          }
          schema[field.name] = stringSchema;
        } else if (field.type === "url") {
          schema[field.name] = Yup.string()
            .url("Invalid URL")
            .required(field.validation_message);
        } else if (field.type === "tel") {
          schema[field.name] = Yup.string()
            .matches(/^[0-9]{10}$/, "Invalid phone number")
            .required(field.validation_message);
        } else if (field.type === "email") {
          schema[field.name] = Yup.string()
            .email("Invalid email format")
            .required(field.validation_message);
        } else if (field.type === "date") {
          let dateSchema = Yup.date().required(field.validation_message);
          if (field.min_date) {
            const minDate = new Date(field.min_date);
            dateSchema = dateSchema.min(
              minDate,
              `Date must be at least ${minDate.toLocaleDateString()}`
            );
          }
          schema[field.name] = dateSchema;
        } else if (field.type === "checkbox") {
          schema[field.name] = Yup.boolean().oneOf(
            [true],
            field.validation_message
          );
        } else if (field.type === "switch") {
          schema[field.name] = Yup.boolean().required(field.validation_message);
        } else if (field.type === "file") {
          schema[field.name] = Yup.mixed().required(field.validation_message);
        } else if (field.type === "password") {
          schema[field.name] = Yup.string().required("Password is required");
          // .min(8, "Password must be at least 8 characters long")
          // .matches(
          //   /[a-z]/,
          //   "Password must contain at least one lowercase letter"
          // )
          // .matches(
          //   /[A-Z]/,
          //   "Password must contain at least one uppercase letter"
          // )
          // .matches(/[0-9]/, "Password must contain at least one number")
          // .matches(
          //   /[@$!%*?&#]/,
          //   "Password must contain at least one special character"
          // );
        } else if (field.type === "image") {
          schema[field.name] = Yup.mixed().required(field.validation_message);
        } else if (field.type === "multi-select-dropdown") {
          schema[field.name] = Yup.array()
            .of(Yup.string())
            .min(1, field.validation_message)
            .required(field.validation_message);
        } else if (field.type === "multi-select-checkbox") {
          schema[field.name] = Yup.array()
            .of(Yup.string())
            .min(1, field.validation_message)
            .required(field.validation_message);
        } else if (field.type === "chips") {
          let arraySchema = Yup.array()
            .of(Yup.string())
            .min(1, field.validation_message)
            .required(field.validation_message);
          if (field.max_items) {
            arraySchema = arraySchema.max(
              field.max_items,
              `You can add up to ${field.max_items} names`
            );
          }
          schema[field.name] = arraySchema;
        } else if (field.type === "slider") {
          let sliderSchema = Yup.number().required(field.validation_message);
          if (field.min !== undefined) {
            sliderSchema = sliderSchema.min(
              field.min,
              `Value must be at least ${field.min}`
            );
          }
          if (field.max !== undefined) {
            sliderSchema = sliderSchema.max(
              field.max,
              `Value must be at most ${field.max}`
            );
          }
          schema[field.name] = sliderSchema;
        } else if (field.type === "rating") {
          schema[field.name] = Yup.number().required(field.validation_message);
        } else {
          schema[field.name] = Yup.string().required(field.validation_message);
        }
      }

      return schema;
    }, {})
  );

  const initialValues = form_config.reduce((values, field) => {
    if (field.type === "date") {
      values[field.name] = field.default_date ? field.default_date : "";
    } else if (
      field.type === "multi-select-checkbox" ||
      field.type === "multi-select-dropdown" ||
      field.type === "chips"
    ) {
      values[field.name] = [];
    } else {
      values[field.name] = "";
    }
    return values;
  }, {});

  const ImageUpload = ({ field, form, className }) => {
    const onDrop = (acceptedFiles) => {
      form.setFieldValue(field.name, URL.createObjectURL(acceptedFiles[0]));
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
      <div {...getRootProps({ className: className ?? "dropzone" })}>
        <input {...getInputProps()} />
        {field.value ? (
          <div className="img-container">
            <img
              //   src={URL.createObjectURL(field.value)}
              src={field.value}
              alt="Preview"
            />
            <p>{field.value.name}</p>
          </div>
        ) : (
          <div className="upload">
            <div className="icon-container">
              <img src="/icons/upload.svg" alt="" />
            </div>
            <p>Upload Image</p>
          </div>
        )}
      </div>
    );
  };

  const FileUpload = ({ field, form }) => {
    const onDrop = (acceptedFiles) => {
      form.setFieldValue(field.name, acceptedFiles[0]);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        {field.value ? (
          <div>
            <p>{field.value.name}</p>
          </div>
        ) : (
          <p>Upload File</p>
        )}
      </div>
    );
  };

  return (
    <ThemeProvider theme={showTheme ? theme : createTheme()}>
      <Formik
        initialValues={editingValues ? editingValues : initialValues}
        validationSchema={custom_schema ? custom_schema : validationSchema}
        onSubmit={(values, { resetForm }) => {
          on_Submit(values, resetForm); // Your custom submit logic
        }}
      >
        {({ errors, touched, setFieldValue, values }) => {
          // console.log("form values", values, editingValues);
          return (
            <Form>
              <Grid container spacing={2}>
                {form_config?.map((input) => {
                  const handleClickShowPassword = () =>
                    setShowPassword(!showPassword);
                  const handleMouseDownPassword = (event) => {
                    event.preventDefault();
                  };

                  return (
                    <Grid
                      item
                      xs={input.xs}
                      sm={input.sm}
                      md={input.md}
                      lg={input.lg}
                      key={input.name}
                      className="global-form"
                    >
                      {input.type === "radio" ? (
                        <FormControl
                          component="fieldset"
                          error={
                            touched[input.name] && Boolean(errors[input.name])
                          }
                        >
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
                          {touched[input.name] &&
                            Boolean(errors[input.name]) && (
                              <div className="error">{errors[input.name]}</div>
                            )}
                        </FormControl>
                      ) : input.type === "checkbox" ? (
                        <FormControl
                          fullWidth={input.fullWidth}
                          error={
                            touched[input.name] && Boolean(errors[input.name])
                          }
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={values[input.name]}
                                onChange={(event) =>
                                  setFieldValue(
                                    input.name,
                                    event.target.checked
                                  )
                                }
                              />
                            }
                            label={input.label}
                          />
                          {touched[input.name] && errors[input.name] && (
                            <div className="error">{errors[input.name]}</div>
                          )}
                        </FormControl>
                      ) : input.type === "switch" ? (
                        <FormControl
                          fullWidth={input.fullWidth}
                          error={
                            touched[input.name] && Boolean(errors[input.name])
                          }
                        >
                          <FormControlLabel
                            control={
                              <Switch
                                checked={values[input.name]}
                                onChange={(event) =>
                                  setFieldValue(
                                    input.name,
                                    event.target.checked
                                  )
                                }
                              />
                            }
                            label={input.label}
                          />
                          {touched[input.name] && errors[input.name] && (
                            <div className="error">{errors[input.name]}</div>
                          )}
                        </FormControl>
                      ) : input.type === "date" ? (
                        <FormControl fullWidth={input.fullWidth}>
                          <LocalizationProvider
                            dateAdapter={AdapterDateFns}
                            key={input.name}
                          >
                            <Field name={input.name}>
                              {({ field }) => (
                                <>
                                  <label>{input.label}</label>

                                  <DatePicker
                                    {...field}
                                    value={
                                      values[input.name]
                                        ? new Date(values[input.name]) // Convert string to Date
                                        : null // Handle undefined or null values
                                    }
                                    minDate={
                                      input.min_date
                                        ? input.min_date
                                        : undefined
                                    }
                                    onChange={(date) => {
                                      setFieldValue(
                                        input.name,
                                        moment(date).format("YYYY-MM-DD")
                                      );
                                    }}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        InputLabelProps={{
                                          shrink: input.shrink,
                                        }}
                                        error={
                                          touched[input.name] &&
                                          Boolean(errors[input.name])
                                        }
                                        helperText={
                                          touched[input.name] &&
                                          errors[input.name]
                                        }
                                      />
                                    )}
                                  />
                                </>
                              )}
                            </Field>
                          </LocalizationProvider>
                          {touched[input.name] &&
                            Boolean(errors[input.name]) && (
                              <div className="error">{errors[input.name]}</div>
                            )}
                        </FormControl>
                      ) : input.type === "time" ? (
                        <FormControl fullWidth={input.fullWidth}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Field name={input.name}>
                              {({ field }) => {
                                // Convert the value to a Date object if it's a string (ISO format)
                                const parsedDate = values[input.name]
                                  ? new Date(values[input.name])
                                  : null;

                                return (
                                  <>
                                    <label>{input.label}</label>
                                    <TimePicker
                                      {...field}
                                      value={parsedDate}
                                      onChange={(time) =>
                                        setFieldValue(
                                          input.name,
                                          moment(time).format(
                                            "YYYY-MM-DD HH:mm:ss Z"
                                          )
                                        )
                                      }
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          error={
                                            touched[input.name] &&
                                            Boolean(errors[input.name])
                                          }
                                          helperText={
                                            touched[input.name] &&
                                            errors[input.name]
                                          }
                                        />
                                      )}
                                    />
                                  </>
                                );
                              }}
                            </Field>
                          </LocalizationProvider>
                        </FormControl>
                      ) : input.type === "date-time" ? (
                        <FormControl fullWidth={input.fullWidth}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Field name={input.name}>
                              {({ field }) => {
                                const parsedDate = values[input.name]
                                  ? new Date(values[input.name])
                                  : null;

                                return (
                                  <>
                                    <label>{input.label}</label>
                                    <DateTimePicker
                                      {...field}
                                      value={parsedDate}
                                      onChange={(datetime) =>
                                        setFieldValue(
                                          input.name,
                                          moment(datetime).format(
                                            "YYYY-MM-DD HH:mm:ss Z"
                                          )
                                        )
                                      }
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          error={
                                            touched[input.name] &&
                                            Boolean(errors[input.name])
                                          }
                                          helperText={
                                            touched[input.name] &&
                                            errors[input.name]
                                          }
                                        />
                                      )}
                                    />
                                  </>
                                );
                              }}
                            </Field>
                          </LocalizationProvider>
                        </FormControl>
                      ) : input.type === "password" && input.show_password ? (
                        <FormControl fullWidth={input.fullWidth}>
                          <label>{input.label}</label>
                          <Field name={input.name}>
                            {({ field }) => (
                              <TextField
                                {...field}
                                type={showPassword ? "text" : "password"}
                                fullWidth={input.fullWidth}
                                InputLabelProps={{
                                  shrink: input.shrink,
                                }}
                                error={
                                  touched[field.name] &&
                                  Boolean(errors[field.name])
                                }
                                helperText={
                                  touched[field.name] && errors[field.name]
                                }
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                      >
                                        {showPassword ? (
                                          <Visibility />
                                        ) : (
                                          <VisibilityOff />
                                        )}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            )}
                          </Field>
                        </FormControl>
                      ) : input.type === "image" ? (
                        <FormControl fullWidth={input.fullWidth}>
                          <label>{input.label}</label>
                          <Field name={input.name}>
                            {({ field, form }) => (
                              <ImageUpload
                                field={field}
                                form={form}
                                className={input.className}
                              />
                            )}
                          </Field>
                          {touched[input.name] &&
                            Boolean(errors[input.name]) && (
                              <div className="error">{errors[input.name]}</div>
                            )}
                        </FormControl>
                      ) : input.type === "file" ? (
                        <FormControl fullWidth={input.fullWidth}>
                          <label>{input.label}</label>
                          <Field name={input.name}>
                            {({ field, form }) => (
                              <FileUpload field={field} form={form} />
                            )}
                          </Field>
                          {touched[input.name] && errors[input.name] && (
                            <div className="error">{errors[input.name]}</div>
                          )}
                        </FormControl>
                      ) : input.type === "multi-select-checkbox" ? (
                        <FormControl
                          component="fieldset"
                          error={
                            touched[input.name] && Boolean(errors[input.name])
                          }
                        >
                          <label>{input.label}</label>
                          <Grid container>
                            {input.options.map((option) => (
                              <Grid item xs={12} sm={6} key={option.value}>
                                <label>{input.label}</label>

                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={values?.[input.name]?.includes(
                                        option.value
                                      )}
                                      onChange={(event) => {
                                        const set = new Set(
                                          values?.[input.name]
                                        );
                                        if (event.target.checked) {
                                          set.add(option.value);
                                        } else {
                                          set.delete(option.value);
                                        }
                                        setFieldValue(
                                          input.name,
                                          Array.from(set)
                                        );
                                      }}
                                    />
                                  }
                                  label={option.label}
                                />
                              </Grid>
                            ))}
                          </Grid>
                          {touched[input.name] &&
                            Boolean(errors[input.name]) && (
                              <div className="error">{errors[input.name]}</div>
                            )}
                        </FormControl>
                      ) : input.type === "multi-select-dropdown" ? (
                        <FormControl fullWidth={input.fullWidth}>
                          <Field name={input.name}>
                            {({ field }) => (
                              <>
                                <label>{input.label}</label>

                                <Select
                                  {...field}
                                  multiple
                                  value={values[input.name]}
                                  onChange={(event) =>
                                    setFieldValue(
                                      input.name,
                                      event.target.value
                                    )
                                  }
                                  renderValue={(selected) =>
                                    selected.join(", ")
                                  }
                                  error={
                                    touched[field.name] &&
                                    Boolean(errors[field.name])
                                  }
                                >
                                  {input?.options?.map((option) => (
                                    <MenuItem
                                      key={option?.value}
                                      value={option?.value}
                                    >
                                      <Checkbox
                                        checked={values?.[
                                          input?.name
                                        ]?.includes(option?.value)}
                                      />
                                      <ListItemText primary={option?.label} />
                                    </MenuItem>
                                  ))}
                                </Select>
                              </>
                            )}
                          </Field>
                          {touched[input.name] &&
                            Boolean(errors[input.name]) && (
                              <div className="error">{errors[input.name]}</div>
                            )}
                        </FormControl>
                      ) : input.type === "chips" ? (
                        <Grid
                          item
                          xs={input.xs}
                          sm={input.sm}
                          md={input.md}
                          lg={input.lg}
                          key={input.name}
                        >
                          <Field name={input.name}>
                            {({ field }) => (
                              <Autocomplete
                                multiple
                                freeSolo
                                options={[]}
                                value={values[input.name] || []}
                                onChange={(event, newValue) => {
                                  if (
                                    input.max_items &&
                                    newValue.length > input.max_items
                                  ) {
                                    newValue = newValue.slice(
                                      0,
                                      input.max_items
                                    );
                                  }
                                  setFieldValue(input.name, newValue);
                                }}
                                renderTags={(value, getTagProps) =>
                                  value?.map((option, index) => (
                                    <Chip
                                      key={index}
                                      variant="outlined"
                                      label={option}
                                      {...getTagProps({ index })}
                                    />
                                  ))
                                }
                                renderInput={(params) => (
                                  <>
                                    <label>{input.label}</label>

                                    <TextField
                                      {...params}
                                      error={
                                        touched[input.name] &&
                                        Boolean(errors[input.name])
                                      }
                                      helperText={
                                        touched[input.name] &&
                                        errors[input.name]
                                      }
                                      fullWidth={input.fullWidth}
                                    />
                                  </>
                                )}
                              />
                            )}
                          </Field>
                        </Grid>
                      ) : input.type === "slider" ? (
                        <FormControl fullWidth={input.fullWidth}>
                          <label>{input.label}</label>
                          <Field name={input.name}>
                            {({ field }) => (
                              <Slider
                                {...field}
                                value={values[input.name]}
                                onChange={(event, value) =>
                                  setFieldValue(input.name, value)
                                }
                                min={input.min}
                                max={input.max}
                                step={input.step}
                              />
                            )}
                          </Field>
                          {touched[input.name] && errors[input.name] && (
                            <div className="error">{errors[input.name]}</div>
                          )}
                        </FormControl>
                      ) : input.type === "rating" ? (
                        <FormControl fullWidth={input.fullWidth}>
                          <label>{input.label}</label>
                          <Field name={input.name}>
                            {({ field }) => (
                              <Rating
                                {...field}
                                value={values[input.name]}
                                onChange={(event, value) =>
                                  setFieldValue(input.name, value)
                                }
                              />
                            )}
                          </Field>
                          {touched[input.name] && errors[input.name] && (
                            <div className="error">{errors[input.name]}</div>
                          )}
                        </FormControl>
                      ) : input.type === "hidden" ? (
                        <Field type="hidden" name={input.name} />
                      ) : (
                        <Field name={input.name}>
                          {({ field }) => (
                            <>
                              <label>{input.label}</label>
                              <TextField
                                {...field}
                                type={input.type}
                                fullWidth={input.fullWidth}
                                placeholder={input.placeholder ?? ""}
                                select={input.type === "select"}
                                InputLabelProps={{
                                  shrink: input.shrink,
                                }}
                                rows={input.rows}
                                multiline={input.rows ? true : false}
                                error={
                                  touched[field.name] &&
                                  Boolean(errors[field.name])
                                }
                                helperText={
                                  touched[field.name] && errors[field.name]
                                }
                                onKeyPress={
                                  input.type === "number"
                                    ? (e) => {
                                        // Allow only numbers and the decimal point
                                        if (!/[0-9.]/.test(e.key)) {
                                          e.preventDefault();
                                        }
                                      }
                                    : undefined
                                }
                              >
                                {input.type === "select" &&
                                  input.options.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                              </TextField>
                            </>
                          )}
                        </Field>
                      )}
                    </Grid>
                  );
                })}
                {children} {/* Render custom fields here */}
              </Grid>

              {showSubmitBtn && (
                <Button
                  type="submit"
                  className={btnClassName}
                  style={{ marginTop: "16px" }}
                >
                  {btnText}
                </Button>
              )}
            </Form>
          );
        }}
      </Formik>
    </ThemeProvider>
  );
};

export default GlobalForm;
