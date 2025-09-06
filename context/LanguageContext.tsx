import React, { createContext, useState, useContext, ReactNode } from 'react';

const translations = {
  en: {
    scanToLogin: 'Scan to Login',
    businessLogin: 'Business Login',
    welcome: 'Welcome',
    points: 'Points',
    viewDiscounts: 'View Discounts',
    visitFacebook: 'Visit our Facebook',
    installPwa: 'Install App on your Phone',
    customerNotFound: 'Customer not found.',
    errorUnexpected: 'An unexpected error occurred.',
    error: 'Error',
    discounts: 'Discounts',
    back: 'Back',
    noDiscounts: 'No discounts available at the moment.',
    expires: 'Expires',
    giftWon: 'Congratulations!',
    giftWonMessage: 'You have earned a free gift! Show this to the staff to claim your reward.',
    close: 'Close',
    enterPhoneNumber: 'Enter Your Phone Number',
    enterPhoneNumberPrompt: 'Please enter your phone number so we can find you more easily.',
    save: 'Save',
    phoneNumber: 'Phone Number',
    // Business Page
    businessDashboard: 'Business Dashboard',
    totalCustomers: 'Total Customers',
    totalPoints: 'Total Points',
    avgPoints: 'Avg. Points/Customer',
    customerList: 'Customer List',
    searchByPhone: 'Search by phone number...',
    name: 'Name',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    addNewCustomer: 'Add New Customer',
    add: 'Add',
    scanCustomerQR: 'Scan Customer QR',
    logout: 'Logout',
    editCustomer: 'Edit Customer',
    update: 'Update',
    cancel: 'Cancel',
    confirmDelete: 'Are you sure?',
    confirmDeleteMessage: 'Do you really want to delete this customer? This process cannot be undone.',
    // Scanner Page
    scanQRCode: 'Scan QR Code',
    pointScanner: 'Point Scanner',
    scanResult: 'Scan Result',
    // Login Page
    businessAreaLogin: 'Business Area Login',
    password: 'Password',
    login: 'Login',
    email: 'Email',
    invalidCredentials: 'Invalid email or password.',
    // Signup
    customerSignup: 'Customer Signup',
    businessSignup: 'Business Signup',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signup: 'Sign Up',
    createAccount: 'Create Account',
    enterPhoneNumberToJoin: 'Enter your phone number to join our loyalty program!',
    getYourQRCode: 'Get Your QR Code',
    yourQRCodeIsReady: 'Your QR Code is Ready!',
    scanThisToLogin: 'Scan this with your phone camera to access your loyalty card.',
    goToMyCard: 'Go to My Card',
    phoneNumberExists: 'This phone number is already registered.',
    businessName: 'Business Name',
    signupSuccess: 'Signup successful! Please log in.',
    // Editor Page
    qrEditor: 'QR Code Editor',
    customizeYourQr: 'Customize the appearance of your loyalty QR codes.',
    logoUrl: 'Logo Image URL',
    qrColor: 'QR Code Color',
    eyeShape: 'Eye Shape (Corners)',
    dotStyle: 'Dot Style (Pixels)',
    saveAndApply: 'Save & Apply to All Customers',
    qrEditorDesc: 'Customize QR code colors, logos, and shapes.',
    saveSuccess: 'Settings saved and all customer QR codes have been updated!',
    saveErrorCustomers: 'Settings saved, but failed to update customer QR codes.',
    saveError: 'Failed to save settings.',
    // Customer Setup Modal
    customerSetup: 'Activate Your Card',
    customerSetupPrompt: 'Welcome! Please enter your details to get started.',
  },
  el: {
    scanToLogin: 'Σάρωση για Είσοδο',
    businessLogin: 'Είσοδος Επιχείρησης',
    welcome: 'Καλώς ήρθες',
    points: 'Πόντοι',
    viewDiscounts: 'Δείτε τις Προσφορές',
    visitFacebook: 'Επισκεφθείτε το Facebook μας',
    installPwa: 'Εγκατάσταση Εφαρμογής',
    customerNotFound: 'Ο πελάτης δεν βρέθηκε.',
    errorUnexpected: 'Παρουσιάστηκε ένα μη αναμενόμενο σφάλμα.',
    error: 'Σφάλμα',
    discounts: 'Προσφορές',
    back: 'Πίσω',
    noDiscounts: 'Δεν υπάρχουν διαθέσιμες προσφορές αυτή τη στιγμή.',
    expires: 'Λήγει',
    giftWon: 'Συγχαρητήρια!',
    giftWonMessage: 'Κερδίσατε ένα δωρεάν δώρο! Δείξτε αυτό στο προσωπικό για να το παραλάβετε.',
    close: 'Κλείσιμο',
    enterPhoneNumber: 'Εισαγάγετε τον αριθμό τηλεφώνου σας',
    enterPhoneNumberPrompt: 'Παρακαλώ εισάγετε τον αριθμό του τηλεφώνου σας για να σας βρίσκουμε πιο εύκολα.',
    save: 'Αποθήκευση',
    phoneNumber: 'Αριθμός Τηλεφώνου',
    // Business Page
    businessDashboard: 'Πίνακας Ελέγχου Επιχείρησης',
    totalCustomers: 'Σύνολο Πελατών',
    totalPoints: 'Σύνολο Πόντων',
    avgPoints: 'Μ.Ο. Πόντων/Πελάτη',
    customerList: 'Λίστα Πελατών',
    searchByPhone: 'Αναζήτηση με αριθμό τηλεφώνου...',
    name: 'Όνομα',
    actions: 'Ενέργειες',
    edit: 'Επεξεργασία',
    delete: 'Διαγραφή',
    addNewCustomer: 'Προσθήκη Νέου Πελάτη',
    add: 'Προσθήκη',
    scanCustomerQR: 'Σάρωση QR Πελάτη',
    logout: 'Αποσύνδεση',
    editCustomer: 'Επεξεργασία Πελάτη',
    update: 'Ενημέρωση',
    cancel: 'Ακύρωση',
    confirmDelete: 'Είστε σίγουροι;',
    confirmDeleteMessage: 'Θέλετε πραγματικά να διαγράψετε αυτόν τον πελάτη; Αυτή η διαδικασία δεν μπορεί να αναιρεθεί.',
    // Scanner Page
    scanQRCode: 'Σάρωση Κωδικού QR',
    pointScanner: 'Σαρωτής Πόντων',
    scanResult: 'Αποτέλεσμα Σάρωσης',
     // Login Page
    businessAreaLogin: 'Είσοδος στην Περιοχή Επιχείρησης',
    password: 'Κωδικός',
    login: 'Είσοδος',
    email: 'Email',
    invalidCredentials: 'Λάθος email ή κωδικός.',
    // Signup
    customerSignup: 'Εγγραφή Πελάτη',
    businessSignup: 'Εγγραφή Επιχείρησης',
    alreadyHaveAccount: 'Έχετε ήδη λογαριασμό;',
    dontHaveAccount: "Δεν έχετε λογαριασμό;",
    signup: 'Εγγραφή',
    createAccount: 'Δημιουργία Λογαριασμού',
    enterPhoneNumberToJoin: 'Εισαγάγετε τον αριθμό τηλεφώνου σας για να συμμετάσχετε στο πρόγραμμα επιβράβευσης!',
    getYourQRCode: 'Λήψη του QR Κωδικού σας',
    yourQRCodeIsReady: 'Ο QR Κωδικός σας είναι έτοιμος!',
    scanThisToLogin: 'Σαρώστε αυτό με την κάμερα του κινητού σας για πρόσβαση στην κάρτα επιβράβευσης.',
    goToMyCard: 'Πήγαινε στην Κάρτα μου',
    phoneNumberExists: 'Αυτός ο αριθμός τηλεφώνου είναι ήδη καταχωρημένος.',
    businessName: 'Όνομα Επιχείρησης',
    signupSuccess: 'Η εγγραφή ολοκληρώθηκε! Παρακαλώ συνδεθείτε.',
    // Editor Page
    qrEditor: 'Επεξεργαστής Κωδικών QR',
    customizeYourQr: 'Προσαρμόστε την εμφάνιση των κωδικών QR επιβράβευσης.',
    logoUrl: 'URL Εικόνας Λογοτύπου',
    qrColor: 'Χρώμα Κωδικού QR',
    eyeShape: 'Σχήμα Γωνιών',
    dotStyle: 'Στυλ Κουκκίδων',
    saveAndApply: 'Αποθήκευση & Εφαρμογή σε Όλους',
    qrEditorDesc: 'Προσαρμόστε χρώματα, λογότυπα και σχήματα στους κωδικούς QR.',
    saveSuccess: 'Οι ρυθμίσεις αποθηκεύτηκαν και όλοι οι κωδικοί QR των πελατών ενημερώθηκαν!',
    saveErrorCustomers: 'Οι ρυθμίσεις αποθηκεύτηκαν, αλλά απέτυχε η ενημέρωση των κωδικών QR των πελατών.',
    saveError: 'Αποτυχία αποθήκευσης των ρυθμίσεων.',
    // Customer Setup Modal
    customerSetup: 'Ενεργοποίηση Κάρτας',
    customerSetupPrompt: 'Καλώς ήρθες! Παρακαλώ εισάγετε τα στοιχεία σας για να ξεκινήσετε.',
  },
};

type Language = 'en' | 'el';
type Translations = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('el');

  const t = (key: keyof Translations): string => {
    return translations[language][key] || translations['en'][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};