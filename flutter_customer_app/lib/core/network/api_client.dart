import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../app/config/app_config.dart';
import '../errors/api_exception.dart';
import '../storage/secure_store.dart';
import '../utils/json_helpers.dart';

class ApiClient {
  ApiClient({
    required AppConfig config,
    required SecureStore store,
  })  : _store = store,
        _dio = Dio(
          BaseOptions(
            baseUrl: '${config.apiBaseUrl}/',
            connectTimeout: const Duration(seconds: 30),
            receiveTimeout: const Duration(seconds: 30),
            sendTimeout: const Duration(seconds: 30),
            headers: const {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _store.readToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          if (options.data is FormData) {
            options.headers.remove('Content-Type');
          }
          handler.next(options);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            onUnauthorized?.call();
          }
          handler.next(error);
        },
      ),
    );

    if (config.enableRequestLogging) {
      _dio.interceptors.add(
        LogInterceptor(
          requestBody: false,
          responseBody: false,
          error: true,
          logPrint: (obj) {
            final text = obj.toString();
            if (text.toLowerCase().contains('authorization') ||
                text.toLowerCase().contains('password') ||
                text.toLowerCase().contains('token')) {
              return;
            }
            debugPrint(text);
          },
        ),
      );
    }
  }

  final Dio _dio;
  final SecureStore _store;
  VoidCallback? onUnauthorized;

  String _url(String path) {
    final base = _dio.options.baseUrl.replaceAll(RegExp(r'/+$'), '');
    final next = path.startsWith('/') ? path : '/$path';
    return '$base$next';
  }

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? query,
  }) {
    return _send(() => _dio.get<dynamic>(_url(path), queryParameters: query));
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Object? data,
  }) {
    return _send(() => _dio.post<dynamic>(_url(path), data: data));
  }

  Future<Map<String, dynamic>> put(
    String path, {
    Object? data,
  }) {
    return _send(() => _dio.put<dynamic>(_url(path), data: data));
  }

  Future<Map<String, dynamic>> delete(String path) {
    return _send(() => _dio.delete<dynamic>(_url(path)));
  }

  Future<Map<String, dynamic>> _send(
    Future<Response<dynamic>> Function() request,
  ) async {
    try {
      final response = await request();
      final data = response.data;
      if (data is Map<String, dynamic>) return data;
      if (data is Map) return Map<String, dynamic>.from(data);
      return {'success': true, 'data': data};
    } on DioException catch (e) {
      throw _mapDio(e);
    }
  }

  ApiException _mapDio(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.sendTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return ApiException.timeout();
    }
    if (e.type == DioExceptionType.connectionError) {
      return ApiException.network();
    }
    final status = e.response?.statusCode;
    final payload = e.response?.data;
    String? serverMessage;
    if (payload is Map) {
      serverMessage = asString(payload['message'], '');
      if (serverMessage.isEmpty) {
        serverMessage = asString(payload['error'], '');
      }
      if (serverMessage.isEmpty) serverMessage = null;
      if (serverMessage != null &&
          (serverMessage.toLowerCase().contains('mail_') ||
              serverMessage.toLowerCase().contains('smtp') ||
              serverMessage.toLowerCase().contains('ebadname'))) {
        serverMessage = 'Could not send the verification email. Please try again.';
      }
    }
    return ErrorMapper.fromStatus(status, serverMessage);
  }
}
