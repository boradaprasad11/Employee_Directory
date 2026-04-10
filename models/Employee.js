const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    fatherName: {
      type: String,
      required: [true, "Father name is required"],
      trim: true,
      minlength: [3, "Father name must be at least 3 characters"],
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
      validate: {
        validator: (v) => {
          const age = Math.floor(
            (Date.now() - new Date(v)) / (365.25 * 24 * 60 * 60 * 1000)
          );
          return age >= 18 && age <= 65;
        },
        message: "Age must be between 18 and 65 years",
      },
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Age must be at least 18"],
      max: [65, "Age cannot exceed 65"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: { values: ["Male", "Female", "Other"], message: "Invalid gender" },
    },
    maritalStatus: {
      type: String,
      required: [true, "Marital status is required"],
      enum: {
        values: ["Single", "Married", "Divorced", "Widowed"],
        message: "Invalid marital status",
      },
    },
    bloodGroup: {
      type: String,
      required: [true, "Blood group is required"],
      enum: {
        values: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        message: "Invalid blood group",
      },
    },
    aadhar: {
      type: String,
      required: [true, "Aadhar number is required"],
      match: [/^\d{12}$/, "Aadhar must be exactly 12 digits"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },
    fullAddress: {
      type: String,
      required: [true, "Full address is required"],
      trim: true,
      minlength: [10, "Address must be at least 10 characters"],
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^\d{6}$/, "Pincode must be exactly 6 digits"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
