const validateLogin = (email, password) => {
    if (!email || !password) {
      return { isValid: false, message: 'Email and password are required' };
    }
  
    if (!/\S+@\S+\.\S+/.test(email)) {
      return { isValid: false, message: 'Invalid email format' };
    }
  
    return { isValid: true, message: '' };
  };
  
  module.exports = { validateLogin };
  