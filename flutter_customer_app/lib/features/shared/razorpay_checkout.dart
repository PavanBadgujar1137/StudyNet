import 'dart:async';

import 'package:flutter/material.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

import 'models.dart';

class PaymentResult {
  const PaymentResult({
    required this.orderId,
    required this.paymentId,
    required this.signature,
  });

  final String orderId;
  final String paymentId;
  final String signature;
}

class RazorpayCheckout {
  RazorpayCheckout();

  final Razorpay _razorpay = Razorpay();

  Future<PaymentResult> open({
    required RazorpayOrder order,
    required String name,
    required String description,
    String? email,
    String? prefillName,
  }) {
    if (order.amountPaise <= 0 || order.orderId == 'free') {
      return Future.value(
        const PaymentResult(orderId: 'free', paymentId: 'free', signature: ''),
      );
    }

    final completer = Completer<PaymentResult>();

    void success(PaymentSuccessResponse response) {
      if (!completer.isCompleted) {
        completer.complete(
          PaymentResult(
            orderId: response.orderId ?? order.orderId,
            paymentId: response.paymentId ?? '',
            signature: response.signature ?? '',
          ),
        );
      }
    }

    void failure(PaymentFailureResponse response) {
      if (!completer.isCompleted) {
        completer.completeError(
          Exception(response.message ?? 'Payment was cancelled'),
        );
      }
    }

    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, success);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, failure);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, (_) {});

    _razorpay.open({
      'key': order.key,
      'amount': order.amountPaise,
      'currency': order.currency,
      'name': name,
      'description': description,
      'order_id': order.orderId,
      'prefill': {
        if (email != null) 'email': email,
        if (prefillName != null) 'name': prefillName,
      },
      'theme': {'color': '#2563EB'},
    });

    return completer.future.whenComplete(() {
      _razorpay.clear();
    });
  }

  void dispose() {
    _razorpay.clear();
  }
}

Future<T> guardPayment<T>(
  BuildContext context,
  Future<T> Function() action,
) async {
  try {
    return await action();
  } catch (e) {
    rethrow;
  }
}
