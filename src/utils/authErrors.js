export function getAuthErrorMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-not-found':
      return 'No account found with this email.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in the Firebase console.'
    case 'auth/configuration-not-found':
      return 'Authentication is not enabled for this Firebase project. Enable it in the Firebase console → Authentication.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
