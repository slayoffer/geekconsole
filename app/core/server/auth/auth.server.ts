const isValidEmail = (email: string) => {
  const regex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  const isValidEmail = regex.test(email);

  return isValidEmail;
};

const isValidPassword = (password: string) => {
  const regex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

  const isValidPass = regex.test(password);

  return isValidPass;
};

type ValidateCredentialsArgTypes = {
  email: string;
  password: string;
};

type ValidationErrorsTypes = {
  email?: string;
  password?: string;
};

export const validateCredentials = (input: ValidateCredentialsArgTypes) => {
  const validationErrors: ValidationErrorsTypes = {};

  if (!isValidEmail(input.email)) {
    validationErrors.email = 'Invalid email address';
  }

  if (!isValidPassword(input.password)) {
    validationErrors.password =
      'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
  }

  if (Object.keys(validationErrors).length > 0) {
    return validationErrors;
  }
};
