class ApiException implements Exception {
  const ApiException({
    required this.message,
    this.statusCode,
    this.kind = ApiErrorKind.unknown,
  });

  final String message;
  final int? statusCode;
  final ApiErrorKind kind;

  factory ApiException.network() => const ApiException(
        message: 'No internet connection. Check your network and try again.',
        kind: ApiErrorKind.network,
      );

  factory ApiException.timeout() => const ApiException(
        message: 'The request took too long. Please try again.',
        statusCode: 408,
        kind: ApiErrorKind.timeout,
      );

  factory ApiException.unauthorized([String? message]) => ApiException(
        message: message ?? 'Your session has expired. Please sign in again.',
        statusCode: 401,
        kind: ApiErrorKind.unauthorized,
      );

  @override
  String toString() => message;
}

enum ApiErrorKind {
  validation,
  unauthorized,
  forbidden,
  notFound,
  timeout,
  rateLimit,
  server,
  network,
  unknown,
}

class ErrorMapper {
  ErrorMapper._();

  static ApiException fromStatus(int? status, String? serverMessage) {
    final fallback = _fallback(status);
    final message = (serverMessage != null && serverMessage.trim().isNotEmpty)
        ? _sanitize(serverMessage)
        : fallback.message;
    return ApiException(
      message: message,
      statusCode: status,
      kind: fallback.kind,
    );
  }

  static ApiException _fallback(int? status) {
    switch (status) {
      case 400:
        return const ApiException(
          message: 'Please check the information you entered.',
          statusCode: 400,
          kind: ApiErrorKind.validation,
        );
      case 401:
        return ApiException.unauthorized();
      case 403:
        return const ApiException(
          message: 'You do not have permission to do that.',
          statusCode: 403,
          kind: ApiErrorKind.forbidden,
        );
      case 404:
        return const ApiException(
          message: 'We could not find what you were looking for.',
          statusCode: 404,
          kind: ApiErrorKind.notFound,
        );
      case 408:
        return ApiException.timeout();
      case 429:
        return const ApiException(
          message: 'Too many requests. Please wait a moment and try again.',
          statusCode: 429,
          kind: ApiErrorKind.rateLimit,
        );
      case 500:
      case 502:
      case 503:
        return const ApiException(
          message: 'Something went wrong on our side. Please try again.',
          statusCode: 500,
          kind: ApiErrorKind.server,
        );
      default:
        return const ApiException(
          message: 'Something went wrong. Please try again.',
          kind: ApiErrorKind.unknown,
        );
    }
  }

  static String _sanitize(String raw) {
    final lower = raw.toLowerCase();
    if (lower.contains('cast to') ||
        lower.contains('e11000') ||
        lower.contains('mongo') ||
        lower.contains('stack')) {
      return 'Something went wrong. Please try again.';
    }
    return raw;
  }
}
