import 'package:dio/dio.dart';

import '../../../core/constants/api_paths.dart';
import '../../../core/errors/api_exception.dart';
import '../../../core/network/api_client.dart';
import '../../../core/utils/json_helpers.dart';
import 'user_model.dart';

class AuthSession {
  const AuthSession({required this.token, required this.user});
  final String token;
  final AppUser user;
}

class AuthRepository {
  AuthRepository(this._api);
  final ApiClient _api;

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final data = await _api.post(ApiPaths.login, data: {
      'email': email.trim(),
      'password': password,
    });
    return _sessionFrom(data);
  }

  Future<void> sendOtp(String email) async {
    final data = await _api.post(ApiPaths.sendOtp, data: {
      'email': email.trim(),
      'checkUserPresent': true,
    });
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not send OTP'));
    }
  }

  Future<AuthSession> signup({
    required SignupDraft draft,
    required String otp,
  }) async {
    final data = await _api.post(ApiPaths.signup, data: {
      'accountType': draft.accountType,
      'firstName': draft.firstName.trim(),
      'lastName': draft.lastName.trim(),
      'email': draft.email.trim(),
      'password': draft.password,
      'confirmPassword': draft.confirmPassword,
      'otp': otp.trim(),
    });
    return _sessionFrom(data);
  }

  Future<void> requestPasswordReset(String email) async {
    final data = await _api.post(ApiPaths.resetPasswordToken, data: {
      'email': email.trim(),
    });
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not send reset email'));
    }
  }

  Future<void> resetPassword({
    required String token,
    required String password,
    required String confirmPassword,
  }) async {
    final data = await _api.post(ApiPaths.resetPassword, data: {
      'token': token,
      'password': password,
      'confirmPassword': confirmPassword,
    });
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not reset password'));
    }
  }

  Future<void> changePassword({
    required String oldPassword,
    required String newPassword,
  }) async {
    final data = await _api.post(ApiPaths.changePassword, data: {
      'oldPassword': oldPassword,
      'newPassword': newPassword,
    });
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Could not update password'));
    }
  }

  Future<AppUser> getUserDetails() async {
    final data = await _api.get(ApiPaths.userDetails);
    return AppUser.fromJson(asMap(data['data'] ?? data['user']));
  }

  Future<AppUser> updateProfile(Map<String, dynamic> body) async {
    final data = await _api.put(ApiPaths.updateProfile, data: body);
    return AppUser.fromJson(asMap(data['updatedUserDetails'] ?? data['data'] ?? data['user']));
  }

  Future<AppUser> updateDisplayPicture(String filePath) async {
    final name = filePath.split(RegExp(r'[\\/]')).last;
    final form = FormData.fromMap({
      'displayPicture': await MultipartFile.fromFile(filePath, filename: name),
    });
    final data = await _api.put(ApiPaths.updateDisplayPicture, data: form);
    return AppUser.fromJson(asMap(data['data']));
  }

  Future<void> deleteProfile() async {
    await _api.delete(ApiPaths.deleteProfile);
  }

  AuthSession _sessionFrom(Map<String, dynamic> data) {
    if (data['success'] != true) {
      throw ApiException(message: asString(data['message'], 'Authentication failed'));
    }
    final token = asString(data['token']);
    final user = AppUser.fromJson(asMap(data['user']));
    if (token.isEmpty || user.id.isEmpty) {
      throw const ApiException(message: 'Authentication failed');
    }
    return AuthSession(token: token, user: user);
  }
}
