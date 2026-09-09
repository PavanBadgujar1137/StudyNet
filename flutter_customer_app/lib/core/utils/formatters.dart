import 'package:intl/intl.dart';

class Formatters {
  Formatters._();

  static final _inDate = DateFormat('d MMM', 'en_IN');
  static final _inLong = DateFormat('EEEE, d MMMM', 'en_IN');
  static final _time = DateFormat('h:mm a');
  static final _month = DateFormat('MMM');

  static String rupees(num amount) {
    final n = NumberFormat.decimalPattern('en_IN');
    return '₹${n.format(amount.round())}';
  }

  static String dateShort(DateTime? date) {
    if (date == null) return '';
    return _inDate.format(date.toLocal());
  }

  static String dateLong(DateTime? date) {
    if (date == null) return '';
    return _inLong.format(date.toLocal());
  }

  static String time(DateTime? date) {
    if (date == null) return '';
    return _time.format(date.toLocal());
  }

  static String monthShort(DateTime? date) {
    if (date == null) return '';
    return _month.format(date.toLocal());
  }

  static String duration(int seconds) {
    if (seconds <= 0) return '0:00';
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '$m:${s.toString().padLeft(2, '0')}';
  }

  static String durationLong(int seconds) {
    if (seconds <= 0) return '0 min';
    final h = seconds ~/ 3600;
    final m = (seconds % 3600) ~/ 60;
    return h > 0 ? '${h}h ${m}m' : '$m min';
  }

  static String practitionerTitle(String? name) {
    final n = (name ?? '').trim();
    if (n.isEmpty) return 'your practitioner';
    if (n.toLowerCase().contains('instructor') || n.startsWith('Dr.')) return n;
    return 'Dr. $n';
  }
}
