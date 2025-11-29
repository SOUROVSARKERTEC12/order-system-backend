"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentFlow = exports.PaymentStatus = exports.PaymentMethod = void 0;
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["Stripe"] = "stripe";
    PaymentMethod["Paypal"] = "paypal";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["Pending"] = "pending";
    PaymentStatus["Paid"] = "paid";
    PaymentStatus["Failed"] = "failed";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentFlow;
(function (PaymentFlow) {
    PaymentFlow["FRONTEND"] = "frontend";
    PaymentFlow["BACKEND"] = "backend";
})(PaymentFlow || (exports.PaymentFlow = PaymentFlow = {}));
