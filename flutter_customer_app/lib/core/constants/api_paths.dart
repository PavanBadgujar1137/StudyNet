class ApiPaths {
  ApiPaths._();

  static const login = '/auth/login';
  static const signup = '/auth/signup';
  static const sendOtp = '/auth/sendotp';
  static const changePassword = '/auth/changepassword';
  static const resetPasswordToken = '/auth/reset-password-token';
  static const resetPassword = '/auth/reset-password';

  static const userDetails = '/profile/getUserDetails';
  static const updateProfile = '/profile/updateProfile';
  static const updateDisplayPicture = '/profile/updateDisplayPicture';
  static const deleteProfile = '/profile/deleteProfile';
  static const enrolledCourses = '/profile/getEnrolledCourses';
  static const clientDashboard = '/profile/client-dashboard';

  static const subscriptionMine = '/payments/subscription/mine';
  static const subscriptionCreate = '/payments/subscription/create';
  static const subscriptionVerify = '/payments/subscription/verify';
  static const buyCourse = '/payments/buy-course';
  static const verifyCoursePayment = '/payments/verify-course-payment';
  static const bookOffer = '/payments/book-offer';
  static const verifyOfferBooking = '/payments/verify-offer-booking';
  static const myBookings = '/payments/my-bookings';

  static const plans = '/plans';
  static const courses = '/courses';
  static String course(String id) => '/courses/$id';
  static String courseVideos(String id) => '/courses/$id/videos';

  static const practitioners = '/practitioners';
  static const myConnections = '/practitioners/my-connections';
  static const connectPractitioner = '/practitioners/connect';

  static const checkins = '/checkins';
  static const reflections = '/reflections';
  static const reflectionAnswer = '/reflections/answer';

  static const circlesAll = '/circle/all';
  static String circleJoin(String id) => '/circle/$id/join';
  static String circleDetail(String id) => '/circle/$id';

  static const liveUpcoming = '/live/upcoming';
  static String liveClass(String id) => '/live/$id';
  static String liveJoin(String id) => '/live/$id/join';
  static String liveLeave(String id) => '/live/$id/leave';

  static const chatGlobal = '/chat/global';
  static const chatContacts = '/chat/contacts';
  static String chatGroup(String id) => '/chat/group/$id';
  static String chatDirect(String id) => '/chat/direct/$id';
}

class AccountTypes {
  AccountTypes._();

  static const learner = 'Learner';
  static const client = 'Client';
  static const student = 'Student';
  static const practitioner = 'Practitioner';
  static const instructor = 'Instructor';
  static const admin = 'Admin';
  static const orgAdmin = 'OrgAdmin';

  static const learnerAliases = {learner, client, student};

  static bool isLearner(String? type) => learnerAliases.contains(type);
}

class MoodOption {
  const MoodOption(this.key, this.label, this.symbol);
  final String key;
  final String label;
  final String symbol;
}

class Moods {
  Moods._();

  static const options = [
    MoodOption('low', 'Heavy', '◯'),
    MoodOption('challenged', 'Stretched thin', '◑'),
    MoodOption('steady', 'Steady', '◐'),
    MoodOption('energetic', 'Lighter', '◕'),
    MoodOption('peaceful', 'Good', '●'),
  ];
}

class SpecialtyFilters {
  SpecialtyFilters._();

  static const values = [
    'All',
    'Anxiety & Stress',
    'Career & Burnout',
    'Relationships',
    'CBT & Mindfulness',
    'Trauma & Grief',
  ];
}

class LearnerPlanKeys {
  LearnerPlanKeys._();

  static const beginner = 'beginner';
  static const advance = 'advance';
  static const champion = 'champion';

  static const displayNames = {
    beginner: 'Beginner',
    advance: 'Growth',
    champion: 'Premium',
  };
}
