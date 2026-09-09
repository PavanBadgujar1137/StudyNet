import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStore {
  SecureStore({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(
                encryptedSharedPreferences: false,
                resetOnError: true,
              ),
              iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
            );

  final FlutterSecureStorage _storage;
  static const _timeout = Duration(seconds: 2);

  static const _tokenKey = 'oh_token';
  static const _userKey = 'oh_user';

  Future<void> saveToken(String token) => _write(_tokenKey, token);

  Future<String?> readToken() => _read(_tokenKey);

  Future<void> saveUserJson(String json) => _write(_userKey, json);

  Future<String?> readUserJson() => _read(_userKey);

  Future<void> clear() async {
    try {
      await Future.wait([
        _storage.delete(key: _tokenKey),
        _storage.delete(key: _userKey),
      ]).timeout(_timeout);
    } catch (_) {}
  }

  Future<String?> _read(String key) async {
    try {
      return await _storage.read(key: key).timeout(_timeout);
    } catch (_) {
      return null;
    }
  }

  Future<void> _write(String key, String value) async {
    try {
      await _storage.write(key: key, value: value).timeout(_timeout);
    } catch (_) {}
  }
}
