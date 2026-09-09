/// Same backend the live website uses.
///
/// Default: https://api.openhand.live/api/v1
/// Local only when you pass: --dart-define=APP_ENV=development
class AppConfig {
  const AppConfig({
    required this.env,
    required this.apiBaseUrl,
    required this.webOrigin,
  });

  final String env;
  final String apiBaseUrl;
  final String webOrigin;

  bool get isProduction => env == 'production';
  bool get isDevelopment => env == 'development';
  bool get enableRequestLogging => !isProduction;

  static const String productionApi = 'https://api.openhand.live/api/v1';
  static const String productionWeb = 'https://openhand.live';
  static const String localApi = 'http://10.0.2.2:4000/api/v1';

  static const String _declaredEnv =
      String.fromEnvironment('APP_ENV', defaultValue: '');

  static const String _declaredApi =
      String.fromEnvironment('API_BASE_URL', defaultValue: '');

  static AppConfig get current {
    if (_declaredApi.isNotEmpty) {
      return AppConfig(
        env: _envName,
        apiBaseUrl: _stripSlash(_declaredApi),
        webOrigin: productionWeb,
      );
    }

    if (_envName == 'development') {
      return const AppConfig(
        env: 'development',
        apiBaseUrl: localApi,
        webOrigin: productionWeb,
      );
    }

    return const AppConfig(
      env: 'production',
      apiBaseUrl: productionApi,
      webOrigin: productionWeb,
    );
  }

  static String get _envName {
    if (_declaredEnv.isNotEmpty) return _declaredEnv.toLowerCase();
    return 'production';
  }

  static String _stripSlash(String url) {
    return url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }
}
