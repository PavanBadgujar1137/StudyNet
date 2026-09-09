import 'dart:convert';

import '../../../core/utils/json_helpers.dart';

class UserProfileDetails {
  const UserProfileDetails({
    this.gender,
    this.dateOfBirth,
    this.about,
    this.contactNumber,
  });

  final String? gender;
  final String? dateOfBirth;
  final String? about;
  final String? contactNumber;

  factory UserProfileDetails.fromJson(Map<String, dynamic> json) {
    return UserProfileDetails(
      gender: asString(json['gender'], '').isEmpty ? null : asString(json['gender']),
      dateOfBirth:
          asString(json['dateOfBirth'], '').isEmpty ? null : asString(json['dateOfBirth']),
      about: asString(json['about'], '').isEmpty ? null : asString(json['about']),
      contactNumber: json['contactNumber']?.toString(),
    );
  }
}

class AppUser {
  const AppUser({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.accountType,
    this.image,
    this.activePlan,
    this.additionalDetails,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String accountType;
  final String? image;
  final String? activePlan;
  final UserProfileDetails? additionalDetails;

  String get fullName => '$firstName $lastName'.trim();
  String get initials => initialsOf(firstName, lastName);
  bool get isLearner =>
      accountType == 'Learner' || accountType == 'Client' || accountType == 'Student';

  factory AppUser.fromJson(Map<String, dynamic> json) {
    final detailsRaw = json['additionalDetails'];
    return AppUser(
      id: asId(json['_id'] ?? json['id']) ?? '',
      firstName: asString(json['firstName']),
      lastName: asString(json['lastName']),
      email: asString(json['email']),
      accountType: asString(json['accountType']),
      image: asString(json['image'], '').isEmpty ? null : asString(json['image']),
      activePlan: json['activePlan']?.toString(),
      additionalDetails: detailsRaw is Map
          ? UserProfileDetails.fromJson(asMap(detailsRaw))
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        '_id': id,
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'accountType': accountType,
        'image': image,
        'activePlan': activePlan,
        if (additionalDetails != null)
          'additionalDetails': {
            'gender': additionalDetails!.gender,
            'dateOfBirth': additionalDetails!.dateOfBirth,
            'about': additionalDetails!.about,
            'contactNumber': additionalDetails!.contactNumber,
          },
      };

  String encode() => jsonEncode(toJson());

  static AppUser? tryDecode(String? raw) {
    if (raw == null || raw.isEmpty) return null;
    try {
      return AppUser.fromJson(asMap(jsonDecode(raw)));
    } catch (_) {
      return null;
    }
  }

  AppUser copyWith({
    String? firstName,
    String? lastName,
    String? image,
    UserProfileDetails? additionalDetails,
  }) {
    return AppUser(
      id: id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email,
      accountType: accountType,
      image: image ?? this.image,
      activePlan: activePlan,
      additionalDetails: additionalDetails ?? this.additionalDetails,
    );
  }
}

class SignupDraft {
  const SignupDraft({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.password,
    required this.confirmPassword,
    this.accountType = 'Learner',
  });

  final String firstName;
  final String lastName;
  final String email;
  final String password;
  final String confirmPassword;
  final String accountType;
}
