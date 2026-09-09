import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_customer_app/core/utils/validators.dart';
import 'package:flutter_customer_app/core/constants/api_paths.dart';

void main() {
  test('email validator', () {
    expect(Validators.email(null), isNotNull);
    expect(Validators.email('not-an-email'), isNotNull);
    expect(Validators.email('you@example.com'), isNull);
  });

  test('learner account types', () {
    expect(AccountTypes.isLearner('Learner'), isTrue);
    expect(AccountTypes.isLearner('Client'), isTrue);
    expect(AccountTypes.isLearner('Student'), isTrue);
    expect(AccountTypes.isLearner('Practitioner'), isFalse);
  });
}
