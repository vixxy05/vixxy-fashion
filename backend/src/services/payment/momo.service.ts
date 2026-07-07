
import axios from "axios";
import crypto from "crypto";
import moment from "moment";
import db from "../../models";

const { PaymentGateway, Payment, PaymentLog } = db;

export class MoMoService {
  private gateway: any;

  constructor(gatewayId?: number) {
    this.gateway = null;
  }

  async initGateway(isSandbox: boolean = true) {
    this.gateway = await PaymentGateway.findOne({
      where: { provider: "MOMO", isSandbox, status: "ACTIVE" },
    });
    if (!this.gateway) {
      throw new Error("MoMo gateway not found");
    }
  }

  private createSignature(data: string, key: string): string {
    return crypto
      .createHmac("sha256", key)
      .update(data)
      .digest("hex");
  }

  async createPayment(
    orderId: number,
    amount: number,
    orderInfo: string,
    redirectUrl: string,
    ipnUrl: string
  ) {
    if (!this.gateway) await this.initGateway();

    const requestId = `${Date.now()}`;
    const orderIdStr = `ORD-${orderId}-${requestId}`;

    const requestData: any = {
      partnerCode: this.gateway.partnerCode,
      orderId: orderIdStr,
      requestId: requestId,
      amount: amount,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      requestType: "captureWallet",
      extraData: "",
      lang: "vi",
    };

    const rawSignature =
      `accessKey=${this.gateway.appId}&amount=${requestData.amount}&extraData=${requestData.extraData}` +
      `&ipnUrl=${requestData.ipnUrl}&orderId=${requestData.orderId}&orderInfo=${requestData.orderInfo}` +
      `&partnerCode=${requestData.partnerCode}&redirectUrl=${requestData.redirectUrl}` +
      `&requestId=${requestData.requestId}&requestType=${requestData.requestType}`;
    const signature = this.createSignature(rawSignature, this.gateway.secretKey);

    const paymentLog = await PaymentLog.create({
      requestData: JSON.stringify(requestData),
      logType: "REQUEST",
    });

    try {
      const response = await axios.post(
        this.gateway.apiUrl,
        { ...requestData, signature },
        { headers: { "Content-Type": "application/json" } }
      );

      await PaymentLog.create({
        paymentId: paymentLog.id,
        responseData: JSON.stringify(response.data),
        logType: "RESPONSE",
      });

      const responseData = response.data as any;
      if (responseData.resultCode !== 0) {
        throw new Error(responseData.message);
      }

      const payment = await Payment.create({
        orderId,
        gatewayId: this.gateway.id,
        paymentMethod: "MOMO",
        amount,
        requestId: requestId,
        transactionId: orderIdStr,
        paymentUrl: (responseData as any).payUrl,
        qrCodeUrl: (responseData as any).qrCodeUrl,
        deeplink: (responseData as any).deeplink,
        paymentStatus: "PENDING",
      });

      return {
        paymentId: payment.id,
        paymentUrl: (responseData as any).payUrl,
        qrCodeUrl: (responseData as any).qrCodeUrl,
        deeplink: (responseData as any).deeplink,
        requestId: requestId,
      };
    } catch (error: any) {
      await PaymentLog.create({
        paymentId: paymentLog.id,
        responseData: JSON.stringify(error.response?.data || error.message),
        logType: "ERROR",
      });
      throw error;
    }
  }

  async verifyCallback(callbackData: any) {
    if (!this.gateway) await this.initGateway();

    const rawSignature =
      `accessKey=${this.gateway.appId}&amount=${callbackData.amount}` +
      `&extraData=${callbackData.extraData}&message=${callbackData.message}` +
      `&orderId=${callbackData.orderId}&orderInfo=${callbackData.orderInfo}` +
      `&orderType=${callbackData.orderType}&partnerCode=${callbackData.partnerCode}` +
      `&payType=${callbackData.payType}&requestId=${callbackData.requestId}` +
      `&responseTime=${callbackData.responseTime}&resultCode=${callbackData.resultCode}` +
      `&transId=${callbackData.transId}`;
    const computedSignature = this.createSignature(rawSignature, this.gateway.secretKey);

    if (computedSignature !== callbackData.signature) {
      return { success: false, requestId: "", transactionId: "" };
    }

    await PaymentLog.create({
      requestData: JSON.stringify(callbackData),
      logType: "CALLBACK",
    });

    return {
      success: true,
      requestId: callbackData.requestId,
      transactionId: callbackData.transId,
    };
  }

  async queryTransaction(orderId: string, requestId: string) {
    if (!this.gateway) await this.initGateway();

    const rawSignature =
      `accessKey=${this.gateway.appId}&orderId=${orderId}&partnerCode=${this.gateway.partnerCode}&requestId=${requestId}`;
    const signature = this.createSignature(rawSignature, this.gateway.secretKey);

    const response = await axios.post(
      this.gateway.apiUrl?.replace("create", "query") || "",
      {
        partnerCode: this.gateway.partnerCode,
        orderId: orderId,
        requestId: requestId,
        signature: signature,
        lang: "vi",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data;
  }

  async refundTransaction() {
    throw new Error("Refund not implemented yet");
  }
}

export default MoMoService;
