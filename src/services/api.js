const API_BASE_URL = process.env.REACT_APP_API_URL || 'capg-final-proj-backend-gdcvebfgdjbggte9.westindia-01.azurewebsites.net/api';

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      if (!response.ok) {
        throw new Error('Server error occurred');
      }
      // If response is OK but empty JSON, return empty object
      data = {};
    }
  } else {
    // For non-JSON responses, get text content
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || response.statusText);
    }
    // If response is OK but not JSON, return empty object
    data = {};
  }

  if (!response.ok) {
    // Add specific message for 401 Unauthorized
    if (response.status === 401) {
      throw new Error('Invalid email or password');
    }
    const errorMessage = data.message || data.error || 'Something went wrong';
    throw new Error(errorMessage);
  }

  if (data.token) {
    setToken(data.token);
  }
  return data;
};

// Headers with authentication if token exists
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

export const register = async (userData) => {
  // Transform the data to match backend expectations
  const transformedData = {
    name: `${userData.firstName} ${userData.lastName}`,
    email: userData.email,
    password: userData.password,
    role: userData.role
  };
  
  console.log('Registration request payload:', transformedData);
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(transformedData),
    });
    console.log('Registration response status:', response.status);
    console.log('Registration response headers:', Object.fromEntries(response.headers.entries()));
    
    // Try to get the response body regardless of content type
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    // Try to parse as JSON if possible
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.log('Response is not JSON:', e);
      if (!response.ok) {
        throw new Error(`Registration failed: ${responseText || response.statusText}`);
      }
      throw e;
    }
    
    if (!response.ok) {
      const errorMessage = data.message || data.error || 'Registration failed';
      // Check for email service configuration error
      if (errorMessage.includes('SMTP credentials are not set')) {
        throw new Error('Registration is currently unavailable. Please try again later or contact support.');
      }
      throw new Error(errorMessage);
    }
    
    if (data.token) {
      setToken(data.token);
    }
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials),
  });

    const data = await handleResponse(response);
    console.log('Login response:', data);

    if (data.token) {
      // Store token as is, without Bearer prefix
      setToken(data.token);
      console.log('Token stored successfully');
    } else {
      console.warn('No token received in login response');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  console.log('Initiating password reset request for:', email);
  console.log('Using API URL:', API_BASE_URL);
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email }),
    }).catch(error => {
      console.error('Fetch error:', error);
      if (error.name === 'TypeError') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    });
    
    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Get the raw response text first
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    // Try to parse as JSON if possible
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
      console.log('Parsed response:', data);
    } catch (e) {
      console.error('JSON parse error:', e);
      if (!response.ok) {
        throw new Error('Server returned an invalid response. Please try again.');
      }
      data = {};
    }

    if (!response.ok) {
      // Check for specific status codes
      switch (response.status) {
        case 404:
          throw new Error('Password reset service not found. Please contact support.');
        case 403:
          throw new Error('Access to password reset is forbidden. Please try again later.');
        case 429:
          throw new Error('Too many reset attempts. Please wait a while before trying again.');
        default:
          throw new Error(data.message || data.error || 'Failed to process password reset request');
      }
    }

    return { 
      success: true, 
      message: data.message || 'Password reset instructions have been sent to your email.' 
    };
  } catch (error) {
    console.error('Password reset error:', {
      name: error.name,
      message: error.message,
      cause: error.cause
    });
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  console.log('Initiating password reset with token');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ token, newPassword }),
    });

    console.log('Reset password response status:', response.status);
    
    // Get the raw response text first
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    // Try to parse as JSON if possible
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('Error parsing response:', e);
      if (!response.ok) {
        throw new Error(responseText || 'Server error occurred');
      }
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to reset password');
    }

    return { 
      success: true, 
      message: data.message || 'Password has been reset successfully.' 
    };
  } catch (error) {
    console.error('Reset password error details:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export const logout = () => {
  removeToken();
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Get current user's role from token (if needed)
export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

// Get user ID by email
export const getUserIdByEmail = async (email) => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // Properly encode the email parameter
    //const encodedEmail = encodeURIComponent(email);
    const response = await fetch(`${API_BASE_URL}/User/email`, {
      method: 'GET',
      headers: {
        ...getHeaders(),
        'Authorization': 'Bearer ' + token
      }
    });
    const data = await handleResponse(response);
    console.log('User ID response:', data);
    return data; // This should return the user ID
  } catch (error) {
    console.error('Error getting user ID:', error);
    throw new Error('Failed to get user ID');
  }
};

export const getUserProfile = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // First get the user's email from the token
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    const email = payload.email || payload.Email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
    
    if (!email) {
      throw new Error('Email not found in token');
    }

    console.log('Using email:', email);
    // Get user ID using email
    const userId = await getUserIdByEmail(email);
    console.log('Got user ID:', userId);
    
    // Then fetch the full profile using the ID
    const response = await fetch(`${API_BASE_URL}/User/${userId}`, {
      method: 'GET',
      headers: {
        ...getHeaders(),
        'Authorization': 'Bearer ' + token
      }
    });
    
    const data = await handleResponse(response);
    console.log('Profile response:', data);
    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw new Error('Failed to fetch profile data');
  }
};
export const updateUserProfile = async (userId, profileData) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/User/${userId}`, {
    method: 'PUT',
    headers: {
      ...getHeaders(),
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to update profile');
  }
  return response;
};

export const getInstructorCourses = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/Course`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    throw new Error('Failed to fetch courses');
  }
  return response.json();
};

export const getStudentCourses = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/Course`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    throw new Error('Failed to fetch courses');
  }
  return response.json();
};

export const createQuiz = async (quizData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/Assessment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(quizData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to create quiz');
  }
  return response.json();
};

export const getInstructorAssessments = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/Assessment`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    throw new Error('Failed to fetch assessments');
  }
  return response.json();
};

export const getAssessmentById = async (assessmentId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/Assessment/${assessmentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    throw new Error('Failed to fetch assessment');
  }
  return response.json();
};

export const updateAssessment = async (assessmentId, updatedData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/Assessment/${assessmentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(updatedData)
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    throw new Error('Failed to update assessment');
  }
  if (response.status === 204) {
    return {}; // No content, return empty object
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const deleteAssessment = async (assessmentId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/Assessment/${assessmentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    throw new Error('Failed to delete assessment');
  }
  return true;
};

export const createCourse = async (courseData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/Course`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(courseData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to create course');
  }
  return response.json();
};

export const deleteCourse = async (courseId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/Course/${courseId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to delete course');
  }
  return true;
};

export const updateCourse = async (courseId, courseData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/Course/${courseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(courseData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to update course');
  }

  // Handle empty response (204 No Content)
  if (response.status === 204) {
    return {};
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const getUserById = async (userId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/User/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    throw new Error('Failed to fetch user');
  }
  return response.json();
};

export const getAssessmentsByCourseId = async (courseId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/Assessment/course/${courseId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    throw new Error('Failed to fetch assessments for course');
  }
  return response.json();
};

export const saveAssessmentResult = async (assessmentId, resultData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/Results/assessment/${assessmentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(resultData)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to save result');
  }
  return response.json();
};

export const getStudentResultByAssessment = async (assessmentId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');
  const response = await fetch(`${API_BASE_URL}/Results/assessment/${assessmentId}/student`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
  if (!response.ok) {
    throw new Error('No result found');
  }
  return response.json();
};

export const getAllResults = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');
  const response = await fetch(`${API_BASE_URL}/Results`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch results');
  }
  return response.json();
};

export const deleteResult = async (resultId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');
  const response = await fetch(`${API_BASE_URL}/Results/${resultId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
  if (!response.ok) {
    throw new Error('Failed to delete result');
  }
  return true;
};

export const getAllInstructors = async () => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  const response = await fetch(`${API_BASE_URL}/User`, {
    method: 'GET',
    headers: {
      ...getHeaders(),
      Authorization: `Bearer ${token}`,
    },
  });
  const users = await handleResponse(response);
  // Filter instructors only
  return users.filter(user => user.role === 'Instructor');
};

export const getAllStudents = async () => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  const response = await fetch(`${API_BASE_URL}/User`, {
    method: 'GET',
    headers: {
      ...getHeaders(),
      Authorization: `Bearer ${token}`,
    },
  });
  const users = await handleResponse(response);
  // Filter students only
  return users.filter(user => user.role === 'Student');
};

export const deleteUserById = async (userId) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  const response = await fetch(`${API_BASE_URL}/User/${userId}`, {
    method: 'DELETE',
    headers: {
      ...getHeaders(),
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to delete user');
  }
  return true;
};

export const createUser = async (userData) => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  const response = await fetch(`${API_BASE_URL}/User`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to create user');
  }
  return response.json();
};
