String? asId(dynamic value) {
  if (value == null) return null;
  if (value is String) return value;
  if (value is Map) {
    final oid = value[r'$oid'] ?? value['_id'] ?? value['id'];
    if (oid != null) return asId(oid);
  }
  return value.toString();
}

String asString(dynamic value, [String fallback = '']) {
  if (value == null) return fallback;
  return value.toString();
}

int asInt(dynamic value, [int fallback = 0]) {
  if (value == null) return fallback;
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value.toString()) ?? fallback;
}

double asDouble(dynamic value, [double fallback = 0]) {
  if (value == null) return fallback;
  if (value is double) return value;
  if (value is num) return value.toDouble();
  return double.tryParse(value.toString()) ?? fallback;
}

bool asBool(dynamic value, [bool fallback = false]) {
  if (value == null) return fallback;
  if (value is bool) return value;
  final s = value.toString().toLowerCase();
  if (s == 'true' || s == '1') return true;
  if (s == 'false' || s == '0') return false;
  return fallback;
}

DateTime? asDate(dynamic value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  if (value is int) return DateTime.fromMillisecondsSinceEpoch(value);
  if (value is Map) {
    final inner = value[r'$date'] ?? value['date'];
    if (inner != null) return asDate(inner);
  }
  return DateTime.tryParse(value.toString());
}

Map<String, dynamic> asMap(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) return Map<String, dynamic>.from(value);
  return <String, dynamic>{};
}

List<dynamic> asList(dynamic value) {
  if (value is List) return value;
  return const [];
}

String initialsOf(String? first, String? last) {
  final a = (first ?? '').trim();
  final b = (last ?? '').trim();
  final chars = '${a.isNotEmpty ? a[0] : ''}${b.isNotEmpty ? b[0] : ''}'.toUpperCase();
  return chars.isEmpty ? 'OH' : chars;
}
