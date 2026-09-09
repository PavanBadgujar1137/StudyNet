/// One story slide for the Unsplash carousel.
class UnsplashSlide {
  const UnsplashSlide({
    required this.id,
    required this.kicker,
    required this.title,
    required this.subtitle,
  });

  final String id;
  final String kicker;
  final String title;
  final String subtitle;

  String get url => Unsplash.photo(id);
}

/// Story-led Unsplash photography for OpenHand.
class Unsplash {
  Unsplash._();

  static const Map<String, String> imageHeaders = {
    'Accept': 'image/jpeg,image/webp,image/png,*/*',
    'User-Agent': 'OpenHand/1.0 (Android; Learner App)',
  };

  static String photo(String id, {int width = 1400, int height = 900}) {
    return 'https://images.unsplash.com/$id?auto=format&fit=crop&w=$width&h=$height&q=80&fm=jpg';
  }

  static String get fallback => photo('photo-1469474968028-56623f02e42e');

  static String get login => loginSlides.first.url;
  static String get signup => signupSlides.first.url;
  static String get journey => journeySlides.first.url;
  static String get checkIn => checkInSlides.first.url;
  static String get courses => coursesSlides.first.url;
  static String get community => communitySlides.first.url;
  static String get practitioners => practitionerSlides.first.url;
  static String get circles => circleSlides.first.url;
  static String get reflections => reflectionSlides.first.url;
  static String get sessions => sessionSlides.first.url;
  static String get plans => planSlides.first.url;

  static const loginSlides = [
    UnsplashSlide(
      id: 'photo-1475483768296-6163e08872a1',
      kicker: 'Guidance',
      title: 'Someone to walk with',
      subtitle: 'You don’t have to grow in the dark.',
    ),
    UnsplashSlide(
      id: 'photo-1501785888041-af3ef285b470',
      kicker: 'Journey',
      title: 'A path that is yours',
      subtitle: 'No score. No comparison. Just the next step.',
    ),
    UnsplashSlide(
      id: 'photo-1529156069898-49953e39b3ac',
      kicker: 'Belonging',
      title: 'You are not walking alone',
      subtitle: 'A room for the words you couldn’t say yesterday.',
    ),
    UnsplashSlide(
      id: 'photo-1470252649378-9c29740c9fa8',
      kicker: 'Hope',
      title: 'Morning comes again',
      subtitle: 'Your growth. Our guidance.',
    ),
  ];

  static const signupSlides = [
    UnsplashSlide(
      id: 'photo-1500382017468-9049fed747ef',
      kicker: 'Begin',
      title: 'Your first step is enough',
      subtitle: 'A practitioner will meet you there.',
    ),
    UnsplashSlide(
      id: 'photo-1511988617509-a57c8a288659',
      kicker: 'Care',
      title: 'Held, not hurried',
      subtitle: 'Start gently. Stay as long as you need.',
    ),
    UnsplashSlide(
      id: 'photo-1501785888041-af3ef285b470',
      kicker: 'OpenHand',
      title: 'A space that is yours',
      subtitle: 'Check-ins, circles, and a guide who listens.',
    ),
  ];

  static const journeySlides = [
    UnsplashSlide(
      id: 'photo-1501785888041-af3ef285b470',
      kicker: 'Your path',
      title: 'This journey is yours',
      subtitle: 'There is no wrong pace here.',
    ),
    UnsplashSlide(
      id: 'photo-1441974231531-c6227db76b6e',
      kicker: 'Stillness',
      title: 'Light finds the quiet places',
      subtitle: 'Missed a day? Nothing breaks. Come back.',
    ),
    UnsplashSlide(
      id: 'photo-1474418397713-7ede21d49118',
      kicker: 'Presence',
      title: 'One honest check-in',
      subtitle: 'The noticing is the work.',
    ),
  ];

  static const checkInSlides = [
    UnsplashSlide(
      id: 'photo-1474418397713-7ede21d49118',
      kicker: 'Today',
      title: 'How is your heart?',
      subtitle: 'Fifteen quiet seconds. Nothing you feel is wrong.',
    ),
    UnsplashSlide(
      id: 'photo-1506126613408-eca07ce68773',
      kicker: 'Breath',
      title: 'A pause, not a test',
      subtitle: 'Only you and your practitioner see this.',
    ),
    UnsplashSlide(
      id: 'photo-1418065460487-3e41a6c84dc5',
      kicker: 'Return',
      title: 'Come back whenever',
      subtitle: 'Missed days don’t undo the path.',
    ),
  ];

  static const coursesSlides = [
    UnsplashSlide(
      id: 'photo-1497633762265-9d179a990aa6',
      kicker: 'Library',
      title: 'Learn at the pace of your life',
      subtitle: 'Lessons held by people who practice what they teach.',
    ),
    UnsplashSlide(
      id: 'photo-1434030216411-0b793f4b4173',
      kicker: 'Study',
      title: 'Knowledge that stays with you',
      subtitle: 'Watch, pause, return when you’re ready.',
    ),
    UnsplashSlide(
      id: 'photo-1488190211105-8b0e65b80b4e',
      kicker: 'Craft',
      title: 'Made for real practice',
      subtitle: 'Not content for content’s sake.',
    ),
  ];

  static const communitySlides = [
    UnsplashSlide(
      id: 'photo-1529156069898-49953e39b3ac',
      kicker: 'Together',
      title: 'You are not walking alone',
      subtitle: 'Global, circle, and one-to-one conversations.',
    ),
    UnsplashSlide(
      id: 'photo-1543269865-cbf427effbad',
      kicker: 'Voice',
      title: 'Say it in a room that can hold it',
      subtitle: 'What is shared with care stays with care.',
    ),
    UnsplashSlide(
      id: 'photo-1511632765486-a01980e01a18',
      kicker: 'Us',
      title: 'Lean in. Be received.',
      subtitle: 'Peers on the same path, at their own speed.',
    ),
  ];

  static const practitionerSlides = [
    UnsplashSlide(
      id: 'photo-1573497019940-1c28c88b4f3e',
      kicker: 'Guides',
      title: 'Someone who can hold this with you',
      subtitle: 'Verified practitioners. Real listening.',
    ),
    UnsplashSlide(
      id: 'photo-1551836022-d5d88e9218df',
      kicker: 'Listen',
      title: 'A conversation, not a lecture',
      subtitle: 'Choose a guide. Book when you are ready.',
    ),
    UnsplashSlide(
      id: 'photo-1573496359142-b8d87734a5a2',
      kicker: 'Trust',
      title: 'Care that has been practiced',
      subtitle: 'Credentials you can see. Presence you can feel.',
    ),
  ];

  static const circleSlides = [
    UnsplashSlide(
      id: 'photo-1543269865-cbf427effbad',
      kicker: 'Circles',
      title: 'Sit with people who get it',
      subtitle: 'Small rooms. Honest talk. What is shared stays here.',
    ),
    UnsplashSlide(
      id: 'photo-1529156069898-49953e39b3ac',
      kicker: 'Peer',
      title: 'Belong without performing',
      subtitle: 'Growth is quieter when it is witnessed.',
    ),
    UnsplashSlide(
      id: 'photo-1511632765486-a01980e01a18',
      kicker: 'Hold',
      title: 'A circle is a promise',
      subtitle: 'Show up. Listen. Leave no one behind.',
    ),
  ];

  static const reflectionSlides = [
    UnsplashSlide(
      id: 'photo-1455390582262-044cdead277a',
      kicker: 'Journal',
      title: 'Put the feeling on the page',
      subtitle: 'Private prompts from someone who already cares.',
    ),
    UnsplashSlide(
      id: 'photo-1481627834876-b7833e8f5570',
      kicker: 'Ink',
      title: 'Write until it softens',
      subtitle: 'There is no deadline. There is only honesty.',
    ),
    UnsplashSlide(
      id: 'photo-1517842645767-c639042777db',
      kicker: 'Quiet',
      title: 'A page that will not judge you',
      subtitle: 'Only you and your practitioner read this.',
    ),
  ];

  static const sessionSlides = [
    UnsplashSlide(
      id: 'photo-1552664730-d307ca884978',
      kicker: 'Live',
      title: 'Show up. The room is ready.',
      subtitle: 'Zoom classes, and the notes you need after.',
    ),
    UnsplashSlide(
      id: 'photo-1524178232363-1fb2b075b655',
      kicker: 'Class',
      title: 'Learn in real time',
      subtitle: 'Your practitioner is on the other side of the call.',
    ),
    UnsplashSlide(
      id: 'photo-1522202176988-66273c2fd55f',
      kicker: 'Together',
      title: 'A live hour can change a week',
      subtitle: 'Join when you can. The recording is not the same.',
    ),
  ];

  static const planSlides = [
    UnsplashSlide(
      id: 'photo-1470252649378-9c29740c9fa8',
      kicker: 'Membership',
      title: 'Keep this space yours',
      subtitle: 'Stay with the work that is already changing you.',
    ),
    UnsplashSlide(
      id: 'photo-1500382017468-9049fed747ef',
      kicker: 'Continue',
      title: 'Dawn is a decision',
      subtitle: 'Courses, circles, and a path that stays open.',
    ),
    UnsplashSlide(
      id: 'photo-1469474968028-56623f02e42e',
      kicker: 'Belong',
      title: 'Invest in the person you are becoming',
      subtitle: 'Cancel anytime. The care is not a trap.',
    ),
  ];

  static const _covers = [
    'photo-1475483768296-6163e08872a1',
    'photo-1474418397713-7ede21d49118',
    'photo-1497633762265-9d179a990aa6',
    'photo-1501785888041-af3ef285b470',
    'photo-1529156069898-49953e39b3ac',
    'photo-1543269865-cbf427effbad',
    'photo-1455390582262-044cdead277a',
    'photo-1470252649378-9c29740c9fa8',
    'photo-1441974231531-c6227db76b6e',
    'photo-1506126613408-eca07ce68773',
  ];

  static String cover(Object seed, {int width = 1200}) {
    final index = seed.hashCode.abs() % _covers.length;
    return photo(_covers[index], width: width, height: 720);
  }
}
