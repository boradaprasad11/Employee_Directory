/* ══════════════════════════════════════════════
   validate.js  —  All frontend validation rules
══════════════════════════════════════════════ */

export function validateEmployee(form) {
  const errors = {};

  /* Full Name */
  if (!form.fullName?.trim())
    errors.fullName = "Full name is required.";
  else if (form.fullName.trim().length < 3)
    errors.fullName = "Name must be at least 3 characters.";

  /* Father Name */
  if (!form.fatherName?.trim())
    errors.fatherName = "Father name is required.";
  else if (form.fatherName.trim().length < 3)
    errors.fatherName = "Father name must be at least 3 characters.";

  /* DOB */
  if (!form.dob) {
    errors.dob = "Date of birth is required.";
  } else {
    const age = Math.floor(
      (Date.now() - new Date(form.dob)) / (365.25 * 24 * 60 * 60 * 1000)
    );
    if (age < 18) errors.dob = "Employee must be at least 18 years old.";
    if (age > 65) errors.dob = "Age cannot exceed 65 years.";
  }

  /* Age */
  if (!form.age && form.age !== 0)
    errors.age = "Age is required.";
  else if (Number(form.age) < 18 || Number(form.age) > 65)
    errors.age = "Age must be between 18 and 65.";

  /* Mobile */
  if (!form.mobile?.trim())
    errors.mobile = "Mobile number is required.";
  else if (!/^[6-9]\d{9}$/.test(form.mobile))
    errors.mobile = "Enter a valid 10-digit Indian mobile number.";

  /* Email */
  if (!form.email?.trim())
    errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email address.";

  /* Gender */
  if (!form.gender) errors.gender = "Please select a gender.";

  /* Marital Status */
  if (!form.maritalStatus) errors.maritalStatus = "Please select marital status.";

  /* Blood Group */
  if (!form.bloodGroup) errors.bloodGroup = "Please select a blood group.";

  /* Aadhar */
  if (!form.aadhar?.trim())
    errors.aadhar = "Aadhar number is required.";
  else if (!/^\d{12}$/.test(form.aadhar))
    errors.aadhar = "Aadhar must be exactly 12 digits.";

  /* State */
  if (!form.state?.trim()) errors.state = "State is required.";

  /* District */
  if (!form.district?.trim()) errors.district = "District is required.";

  /* Full Address */
  if (!form.fullAddress?.trim())
    errors.fullAddress = "Full address is required.";
  else if (form.fullAddress.trim().length < 10)
    errors.fullAddress = "Address must be at least 10 characters.";

  /* Pincode */
  if (!form.pincode?.trim())
    errors.pincode = "Pincode is required.";
  else if (!/^\d{6}$/.test(form.pincode))
    errors.pincode = "Pincode must be exactly 6 digits.";

  return errors;
}
 
/* Auto-calculate age from DOB */
export function calcAge(dob) {
  if (!dob) return "";
  return Math.floor(
    (Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000)
  );
}
