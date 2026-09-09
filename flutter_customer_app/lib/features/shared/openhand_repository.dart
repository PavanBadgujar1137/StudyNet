import '../../../core/constants/api_paths.dart';
import '../../../core/errors/api_exception.dart';
import '../../../core/network/api_client.dart';
import '../../../core/utils/json_helpers.dart';
import 'models.dart';

class OpenHandRepository {
  OpenHandRepository(this._api);
  final ApiClient _api;

  Future<DashboardData> clientDashboard() async {
    final data = await _api.get(ApiPaths.clientDashboard);
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not load dashboard'));
    }
    return DashboardData.fromJson(asMap(data['data']));
  }

  Future<SubscriptionInfo> mySubscription() async {
    final data = await _api.get(ApiPaths.subscriptionMine);
    return SubscriptionInfo.fromMine(data);
  }

  Future<void> submitCheckIn({
    required String mood,
    required int sleepScore,
    String note = '',
  }) async {
    final data = await _api.post(ApiPaths.checkins, data: {
      'mood': mood,
      'sleepScore': sleepScore,
      'note': note,
      'isPrivate': false,
    });
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not save check-in'));
    }
  }

  Future<List<PractitionerCard>> practitioners() async {
    final data = await _api.get(ApiPaths.practitioners);
    return asList(data['practitioners']).map((e) => PractitionerCard.fromJson(asMap(e))).toList();
  }

  Future<List<ConnectionRecord>> myConnections() async {
    final data = await _api.get(ApiPaths.myConnections);
    return asList(data['connections']).map((e) => ConnectionRecord.fromJson(asMap(e))).toList();
  }

  Future<RazorpayOrder> bookOffer(String offerId) async {
    final data = await _api.post(ApiPaths.bookOffer, data: {'offerId': offerId});
    if (data['isFreeSession'] == true) {
      return RazorpayOrder(key: '', orderId: 'free', amountPaise: 0, meta: data);
    }
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not create booking'));
    }
    final order = asMap(data['razorpayOrder'] ?? data['order']);
    return RazorpayOrder(
      key: asString(data['key']),
      orderId: asString(order['id']),
      amountPaise: asInt(order['amount'], asInt(data['amount']) * 100),
      currency: asString(order['currency'], 'INR'),
      meta: {
        'bookingId': asId(data['bookingId']) ?? asId(asMap(data['booking'])['_id']),
        'amount': data['amount'],
        'offerTitle': data['offerTitle'],
        'practitionerName': data['practitionerName'],
      },
    );
  }

  Future<void> verifyOfferBooking({
    required String bookingId,
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    final data = await _api.post(ApiPaths.verifyOfferBooking, data: {
      'bookingId': bookingId,
      'razorpay_order_id': orderId,
      'razorpay_payment_id': paymentId,
      'razorpay_signature': signature,
    });
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not verify payment'));
    }
  }

  Future<void> connectPractitioner({
    required String practitionerId,
    required num amountPaid,
    required String orderId,
    required String paymentId,
    required String signature,
    String? offerId,
  }) async {
    final data = await _api.post(ApiPaths.connectPractitioner, data: {
      'practitionerId': practitionerId,
      'amountPaid': amountPaid,
      'razorpay_order_id': orderId,
      'razorpay_payment_id': paymentId,
      'razorpay_signature': signature,
      if (offerId != null) 'offerId': offerId,
    });
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not send connection request'));
    }
  }

  Future<List<CourseItem>> courses() async {
    final data = await _api.get(ApiPaths.courses);
    return asList(data['courses']).map((e) => CourseItem.fromJson(asMap(e))).toList();
  }

  Future<List<CourseVideo>> courseVideos(String courseId) async {
    final data = await _api.get(ApiPaths.courseVideos(courseId));
    return asList(data['videos']).map((e) => CourseVideo.fromJson(asMap(e))).toList();
  }

  Future<RazorpayOrder> buyCourse(String courseId) async {
    final data = await _api.post(ApiPaths.buyCourse, data: {'courseId': courseId});
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not create course order'));
    }
    final order = asMap(data['order']);
    return RazorpayOrder(
      key: asString(data['key']),
      orderId: asString(order['id']),
      amountPaise: asInt(order['amount']),
      currency: asString(order['currency'], 'INR'),
      meta: {
        'courseTitle': data['courseTitle'],
        'practitionerName': data['practitionerName'],
      },
    );
  }

  Future<void> verifyCoursePayment({
    required String courseId,
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    final data = await _api.post(ApiPaths.verifyCoursePayment, data: {
      'courseId': courseId,
      'razorpay_order_id': orderId,
      'razorpay_payment_id': paymentId,
      'razorpay_signature': signature,
    });
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Payment verification failed'));
    }
  }

  Future<List<PlanItem>> plans() async {
    final data = await _api.get(ApiPaths.plans);
    return asList(data['plans']).map((e) => PlanItem.fromJson(asMap(e))).toList();
  }

  Future<RazorpayOrder> createSubscription(String planKey) async {
    final data = await _api.post(ApiPaths.subscriptionCreate, data: {'planKey': planKey});
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not create subscription order'));
    }
    final order = asMap(data['order']);
    return RazorpayOrder(
      key: asString(data['key']),
      orderId: asString(order['id']),
      amountPaise: asInt(order['amount']),
      currency: asString(order['currency'], 'INR'),
      meta: {'planKey': data['planKey'] ?? planKey, 'planName': data['planName']},
    );
  }

  Future<void> verifySubscription({
    required String planKey,
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    final data = await _api.post(ApiPaths.subscriptionVerify, data: {
      'planKey': planKey,
      'razorpay_order_id': orderId,
      'razorpay_payment_id': paymentId,
      'razorpay_signature': signature,
    });
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not verify subscription'));
    }
  }

  Future<List<CircleItem>> circles() async {
    final data = await _api.get(ApiPaths.circlesAll);
    return asList(data['circles']).map((e) => CircleItem.fromJson(asMap(e))).toList();
  }

  Future<void> joinCircle(String id) async {
    final data = await _api.post(ApiPaths.circleJoin(id), data: {});
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not join this Circle'));
    }
  }

  Future<List<ReflectionPrompt>> reflections() async {
    final data = await _api.get(ApiPaths.reflections);
    return asList(data['prompts']).map((e) => ReflectionPrompt.fromJson(asMap(e))).toList();
  }

  Future<void> answerReflection({
    required String promptId,
    required String answerText,
    required String action,
    bool isPrivate = false,
  }) async {
    final data = await _api.post(ApiPaths.reflectionAnswer, data: {
      'promptId': promptId,
      'answerText': answerText,
      'action': action,
      'isPrivate': isPrivate,
    });
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not save reflection'));
    }
  }

  Future<List<LiveClassSummary>> upcomingLive() async {
    final data = await _api.get(ApiPaths.liveUpcoming);
    final list = data['data'] ?? data['classes'] ?? data['upcoming'];
    return asList(list).map((e) => LiveClassSummary.fromJson(asMap(e))).toList();
  }

  Future<Map<String, dynamic>> joinLive(String classId) async {
    final data = await _api.post(ApiPaths.liveJoin(classId), data: {});
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not join class'));
    }
    return asMap(data['data']);
  }

  Future<List<ChatMessage>> globalChat() async {
    final data = await _api.get(ApiPaths.chatGlobal);
    return asList(data['data']).map((e) => ChatMessage.fromJson(asMap(e))).toList();
  }

  Future<void> sendGlobal(String content) async {
    final data = await _api.post(ApiPaths.chatGlobal, data: {'content': content});
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not send message'));
    }
  }

  Future<List<ChatMessage>> groupChat(String id) async {
    final data = await _api.get(ApiPaths.chatGroup(id));
    return asList(data['data']).map((e) => ChatMessage.fromJson(asMap(e))).toList();
  }

  Future<void> sendGroup(String id, String content) async {
    final data = await _api.post(ApiPaths.chatGroup(id), data: {'content': content});
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not send message'));
    }
  }

  Future<List<ChatMessage>> directChat(String userId) async {
    final data = await _api.get(ApiPaths.chatDirect(userId));
    return asList(data['data']).map((e) => ChatMessage.fromJson(asMap(e))).toList();
  }

  Future<void> sendDirect(String userId, String content) async {
    final data = await _api.post(ApiPaths.chatDirect(userId), data: {'content': content});
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not send message'));
    }
  }

  Future<List<NamedUser>> contacts() async {
    final data = await _api.get(ApiPaths.chatContacts);
    return asList(data['data']).map((e) => NamedUser.fromJson(asMap(e))).toList();
  }

  Future<List<BookingItem>> myBookings() async {
    final data = await _api.get(ApiPaths.myBookings);
    return asList(data['bookings']).map((e) => BookingItem.fromJson(asMap(e))).toList();
  }
}
