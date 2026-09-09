import '../../core/utils/json_helpers.dart';

class NamedUser {
  const NamedUser({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.email,
    this.image,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String? email;
  final String? image;

  String get fullName => '$firstName $lastName'.trim();
  String get initials => initialsOf(firstName, lastName);

  factory NamedUser.fromJson(Map<String, dynamic> json) {
    return NamedUser(
      id: asId(json['_id'] ?? json['id']) ?? '',
      firstName: asString(json['firstName']),
      lastName: asString(json['lastName']),
      email: json['email']?.toString(),
      image: asString(json['image'] ?? json['avatar'], '').isEmpty
          ? null
          : asString(json['image'] ?? json['avatar']),
    );
  }
}

class Milestone {
  const Milestone({
    required this.id,
    required this.label,
    required this.date,
    required this.achieved,
  });

  final String id;
  final String label;
  final String date;
  final bool achieved;

  factory Milestone.fromJson(Map<String, dynamic> json) {
    return Milestone(
      id: asString(json['id']),
      label: asString(json['label']),
      date: asString(json['date']),
      achieved: asBool(json['achieved']),
    );
  }
}

class CheckInEntry {
  const CheckInEntry({
    required this.id,
    required this.mood,
    required this.sleepScore,
    this.note,
    this.createdAt,
  });

  final String id;
  final String mood;
  final int sleepScore;
  final String? note;
  final DateTime? createdAt;

  factory CheckInEntry.fromJson(Map<String, dynamic> json) {
    return CheckInEntry(
      id: asId(json['_id']) ?? '',
      mood: asString(json['mood']),
      sleepScore: asInt(json['sleepScore'], 7),
      note: asString(json['note'], '').isEmpty ? null : asString(json['note']),
      createdAt: asDate(json['createdAt']),
    );
  }
}

class LiveClassSummary {
  const LiveClassSummary({
    required this.id,
    required this.title,
    this.description,
    this.status,
    this.scheduledStart,
    this.instructor,
    this.zoomJoinUrl,
  });

  final String id;
  final String title;
  final String? description;
  final String? status;
  final DateTime? scheduledStart;
  final NamedUser? instructor;
  final String? zoomJoinUrl;

  factory LiveClassSummary.fromJson(Map<String, dynamic> json) {
    return LiveClassSummary(
      id: asId(json['_id']) ?? '',
      title: asString(json['title'], 'Live class'),
      description: json['description']?.toString(),
      status: json['status']?.toString(),
      scheduledStart: asDate(json['scheduledStart']),
      instructor: json['instructor'] is Map ? NamedUser.fromJson(asMap(json['instructor'])) : null,
      zoomJoinUrl: json['zoomJoinUrl']?.toString(),
    );
  }
}

class SubscriptionInfo {
  const SubscriptionInfo({
    this.hasActiveSubscription = false,
    this.isTrialActive = false,
    this.trialDaysRemaining = 0,
    this.planKey,
    this.planName,
    this.status,
    this.effectivePlan,
  });

  final bool hasActiveSubscription;
  final bool isTrialActive;
  final int trialDaysRemaining;
  final String? planKey;
  final String? planName;
  final String? status;
  final String? effectivePlan;

  factory SubscriptionInfo.fromDashboard(Map<String, dynamic> json) {
    final sub = asMap(json['subscription']);
    return SubscriptionInfo(
      hasActiveSubscription: asBool(json['hasActiveSubscription']),
      isTrialActive: asBool(json['isTrialActive']),
      trialDaysRemaining: asInt(json['trialDaysRemaining']),
      planKey: sub['planKey']?.toString(),
      planName: sub['planName']?.toString(),
    );
  }

  factory SubscriptionInfo.fromMine(Map<String, dynamic> json) {
    final sub = asMap(json['subscription']);
    return SubscriptionInfo(
      hasActiveSubscription: asBool(json['hasActiveSubscription']),
      isTrialActive: asBool(json['isTrialActive']),
      trialDaysRemaining: asInt(json['trialDaysRemaining']),
      planKey: sub['planKey']?.toString() ?? json['effectivePlan']?.toString(),
      planName: sub['planName']?.toString(),
      status: json['status']?.toString(),
      effectivePlan: json['effectivePlan']?.toString(),
    );
  }
}

class DashboardData {
  const DashboardData({
    required this.checkInCount,
    required this.streak,
    required this.checkIns,
    required this.milestones,
    required this.upcomingClasses,
    this.practitioner,
    this.subscription,
  });

  final int checkInCount;
  final int streak;
  final List<CheckInEntry> checkIns;
  final List<Milestone> milestones;
  final List<LiveClassSummary> upcomingClasses;
  final NamedUser? practitioner;
  final SubscriptionInfo? subscription;

  factory DashboardData.fromJson(Map<String, dynamic> json) {
    final pract = json['practitioner'];
    NamedUser? practitioner;
    if (pract is Map) {
      final map = asMap(pract);
      practitioner = NamedUser(
        id: asId(map['id'] ?? map['_id']) ?? '',
        firstName: asString(map['firstName'] ?? map['name']),
        lastName: asString(map['lastName']),
        email: map['email']?.toString(),
        image: map['avatar']?.toString() ?? map['image']?.toString(),
      );
    }
    return DashboardData(
      checkInCount: asInt(json['checkInCount']),
      streak: asInt(json['streak']),
      checkIns: asList(json['checkIns']).map((e) => CheckInEntry.fromJson(asMap(e))).toList(),
      milestones: asList(json['milestones']).map((e) => Milestone.fromJson(asMap(e))).toList(),
      upcomingClasses:
          asList(json['upcomingClasses']).map((e) => LiveClassSummary.fromJson(asMap(e))).toList(),
      practitioner: practitioner,
      subscription: json['subscriptionStatus'] is Map
          ? SubscriptionInfo.fromDashboard(asMap(json['subscriptionStatus']))
          : null,
    );
  }
}

class OfferItem {
  const OfferItem({
    required this.id,
    required this.title,
    required this.price,
    this.type,
    this.durationMinutes,
  });

  final String id;
  final String title;
  final num price;
  final String? type;
  final int? durationMinutes;

  factory OfferItem.fromJson(Map<String, dynamic> json) {
    return OfferItem(
      id: asId(json['_id']) ?? '',
      title: asString(json['title'], 'Session'),
      price: asDouble(json['price']),
      type: json['type']?.toString(),
      durationMinutes: json['durationMinutes'] == null ? null : asInt(json['durationMinutes']),
    );
  }
}

class PractitionerCard {
  const PractitionerCard({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.image,
    this.email,
    this.bio,
    this.credentials,
    this.specialties = const [],
    this.offers = const [],
    this.sessionRate = 0,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String? image;
  final String? email;
  final String? bio;
  final String? credentials;
  final List<String> specialties;
  final List<OfferItem> offers;
  final num sessionRate;

  String get fullName => '$firstName $lastName'.trim();
  String get initials => initialsOf(firstName, lastName);

  factory PractitionerCard.fromJson(Map<String, dynamic> json) {
    final user = asMap(json['user']);
    final offersRaw = json['offers'] ?? json['userOffers'] ?? [];
    return PractitionerCard(
      id: asId(user['_id'] ?? json['_id'] ?? json['user']) ?? '',
      firstName: asString(user['firstName'] ?? json['firstName']),
      lastName: asString(user['lastName'] ?? json['lastName']),
      image: (user['image'] ?? json['image'])?.toString(),
      email: (user['email'] ?? json['email'])?.toString(),
      bio: json['bio']?.toString(),
      credentials: json['credentials']?.toString(),
      specialties: asList(json['specialties']).map((e) => e.toString()).toList(),
      offers: asList(offersRaw).map((e) => OfferItem.fromJson(asMap(e))).toList(),
      sessionRate: asDouble(json['sessionRate']),
    );
  }
}

class ConnectionRecord {
  const ConnectionRecord({required this.practitionerId, required this.status});
  final String practitionerId;
  final String status;

  factory ConnectionRecord.fromJson(Map<String, dynamic> json) {
    return ConnectionRecord(
      practitionerId: asId(asMap(json['practitioner'])['_id'] ?? json['practitioner']) ?? '',
      status: asString(json['status']),
    );
  }
}

class CourseItem {
  const CourseItem({
    required this.id,
    required this.title,
    this.description,
    this.thumbnail,
    this.price = 0,
    this.isFree = true,
    this.requiredPlan,
    this.practitioner,
    this.videoCount = 0,
    this.totalSeconds = 0,
    this.enrolledIds = const [],
    this.practitionerId,
  });

  final String id;
  final String title;
  final String? description;
  final String? thumbnail;
  final num price;
  final bool isFree;
  final String? requiredPlan;
  final NamedUser? practitioner;
  final int videoCount;
  final int totalSeconds;
  final List<String> enrolledIds;
  final String? practitionerId;

  factory CourseItem.fromJson(Map<String, dynamic> json) {
    final videos = asList(json['videos']);
    final enrolled = asList(json['enrolledClients']).map((e) => asId(e) ?? e.toString()).toList();
    final pract = json['practitioner'];
    return CourseItem(
      id: asId(json['_id']) ?? '',
      title: asString(json['title']),
      description: json['description']?.toString(),
      thumbnail: json['thumbnail']?.toString(),
      price: asDouble(json['price']),
      isFree: asBool(json['isFree'], asDouble(json['price']) <= 0),
      requiredPlan: json['requiredPlan']?.toString(),
      practitioner: pract is Map ? NamedUser.fromJson(asMap(pract)) : null,
      practitionerId: pract is Map ? asId(asMap(pract)['_id']) : asId(pract),
      videoCount: videos.length,
      totalSeconds: videos.fold(0, (s, v) => s + asInt(asMap(v)['durationSeconds'])),
      enrolledIds: enrolled,
    );
  }
}

class CourseVideo {
  const CourseVideo({
    required this.id,
    required this.title,
    this.description,
    this.videoUrl,
    this.durationSeconds = 0,
  });

  final String id;
  final String title;
  final String? description;
  final String? videoUrl;
  final int durationSeconds;

  factory CourseVideo.fromJson(Map<String, dynamic> json) {
    return CourseVideo(
      id: asId(json['_id']) ?? '',
      title: asString(json['title']),
      description: json['description']?.toString(),
      videoUrl: json['videoUrl']?.toString() ?? json['url']?.toString(),
      durationSeconds: asInt(json['durationSeconds']),
    );
  }
}

class CircleItem {
  const CircleItem({
    required this.id,
    required this.name,
    this.topic,
    this.description,
    this.status,
    this.seats = 10,
    this.filled = 0,
    this.practitioner,
    this.memberIds = const [],
  });

  final String id;
  final String name;
  final String? topic;
  final String? description;
  final String? status;
  final int seats;
  final int filled;
  final NamedUser? practitioner;
  final List<String> memberIds;

  factory CircleItem.fromJson(Map<String, dynamic> json) {
    final members = asList(json['members']);
    return CircleItem(
      id: asId(json['_id']) ?? '',
      name: asString(json['name']),
      topic: json['topic']?.toString(),
      description: json['description']?.toString(),
      status: json['status']?.toString(),
      seats: asInt(json['seats'], 10),
      filled: asInt(json['seatsFilledCount'], members.length),
      practitioner:
          json['practitioner'] is Map ? NamedUser.fromJson(asMap(json['practitioner'])) : null,
      memberIds: members.map((m) => asId(asMap(m)['_id'] ?? m) ?? '').where((e) => e.isNotEmpty).toList(),
    );
  }
}

class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.content,
    this.createdAt,
    this.sender,
  });

  final String id;
  final String content;
  final DateTime? createdAt;
  final NamedUser? sender;

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: asId(json['_id']) ?? '',
      content: asString(json['content'] ?? json['text']),
      createdAt: asDate(json['createdAt']),
      sender: json['sender'] is Map ? NamedUser.fromJson(asMap(json['sender'])) : null,
    );
  }
}

class ReflectionPrompt {
  const ReflectionPrompt({
    required this.id,
    required this.promptText,
    required this.status,
    this.answerText,
    this.isPrivate = false,
    this.createdAt,
    this.practitioner,
  });

  final String id;
  final String promptText;
  final String status;
  final String? answerText;
  final bool isPrivate;
  final DateTime? createdAt;
  final NamedUser? practitioner;

  factory ReflectionPrompt.fromJson(Map<String, dynamic> json) {
    return ReflectionPrompt(
      id: asId(json['_id']) ?? '',
      promptText: asString(json['promptText']),
      status: asString(json['status'], 'pending'),
      answerText: json['answerText']?.toString(),
      isPrivate: asBool(json['isPrivate']),
      createdAt: asDate(json['createdAt']),
      practitioner:
          json['practitioner'] is Map ? NamedUser.fromJson(asMap(json['practitioner'])) : null,
    );
  }
}

class PlanItem {
  const PlanItem({
    required this.planKey,
    required this.name,
    required this.tagline,
    required this.monthlyFee,
    this.features = const [],
  });

  final String planKey;
  final String name;
  final String tagline;
  final num monthlyFee;
  final List<String> features;

  bool get isLearnerPlan =>
      planKey == 'beginner' || planKey == 'advance' || planKey == 'champion';

  factory PlanItem.fromJson(Map<String, dynamic> json) {
    return PlanItem(
      planKey: asString(json['planKey'] ?? json['key']),
      name: asString(json['name']),
      tagline: asString(json['tagline']),
      monthlyFee: asDouble(json['monthlyFee'] ?? json['price']),
      features: asList(json['features']).map((e) => e.toString()).toList(),
    );
  }
}

class BookingItem {
  const BookingItem({
    required this.id,
    required this.status,
    this.amount,
    this.scheduledAt,
    this.practitioner,
    this.offerTitle,
  });

  final String id;
  final String status;
  final num? amount;
  final DateTime? scheduledAt;
  final NamedUser? practitioner;
  final String? offerTitle;

  factory BookingItem.fromJson(Map<String, dynamic> json) {
    final offer = asMap(json['offer']);
    return BookingItem(
      id: asId(json['_id']) ?? '',
      status: asString(json['status']),
      amount: json['amount'] == null ? null : asDouble(json['amount']),
      scheduledAt: asDate(json['scheduledAt']),
      practitioner:
          json['practitioner'] is Map ? NamedUser.fromJson(asMap(json['practitioner'])) : null,
      offerTitle: offer['title']?.toString(),
    );
  }
}

class RazorpayOrder {
  const RazorpayOrder({
    required this.key,
    required this.orderId,
    required this.amountPaise,
    this.currency = 'INR',
    this.meta = const {},
  });

  final String key;
  final String orderId;
  final int amountPaise;
  final String currency;
  final Map<String, dynamic> meta;
}
