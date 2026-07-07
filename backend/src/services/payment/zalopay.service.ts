
import axios from "axios";
import crypto from "crypto";
import moment from "moment";
import db from "../../models";

const { PaymentGateway, Payment, PaymentLog } = db;

export class ZaloPayService {
  private gateway: any;

  constructor(gatewayId?: number) {
    this.gateway = null;
  }

  async initGateway(isSandbox: boolean = true) {
    this.gateway = await PaymentGateway.findOne({
      where: { provider: "ZALOPAY", isSandbox, status: "ACTIVE" },
    });
    if (!this.gateway) {
      throw new Error("ZaloPay gateway not found");
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

    const transId = `${Date.now()}`;
    const appTransId = `${moment().format("YYMMDD")}_${transId}`;
    const embedData = JSON.stringify({});
    const items = JSON.stringify([]);

    const requestData: any = {
      app_id: parseInt(this.gateway.appId),
      app_trans_id: appTransId,
      app_user: "customer",
      app_time: Date.now(),
      amount: amount,
      description: orderInfo,
      embed_data: embedData,
      item: items,
      bank_code: "",
      redirect_url: redirectUrl,
      callback_url: ipnUrl,
    };

    const macData = `${requestData.app_id}|${requestData.app_trans_id}|${requestData.app_user}|${requestData.amount}|${requestData.app_time}|${requestData.embed_data}|${requestData.item}`;
    const mac = this.createSignature(macData, this.gateway.key1);

    const paymentLog = await PaymentLog.create({
      requestData: JSON.stringify(requestData),
      logType: "REQUEST",
    });

    try {
      const response = await axios.post(
        this.gateway.apiUrl,
        null,
        {
          params: { ...requestData, mac },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      await PaymentLog.create({
        paymentId: paymentLog.id,
        responseData: JSON.stringify(response.data),
        logType: "RESPONSE",
      });

      const responseData = response.data as any;
      if (responseData.return_code !== 1) {
        throw new Error(responseData.return_message);
      }

      const payment = await Payment.create({
        orderId,
        gatewayId: this.gateway.id,
        paymentMethod: "ZALOPAY",
        amount,
        requestId: appTransId,
        paymentUrl: (responseData as any).order_url,
        qrCodeUrl: (responseData as any).qr_code,
        paymentStatus: "PENDING",
      });

      return {
        paymentId: payment.id,
        paymentUrl: (responseData as any).order_url,
        qrCodeUrl: (responseData as any).qr_code,
        requestId: appTransId,
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

    const computedMac = this.createSignature(callbackData.data, this.gateway.key2);
    if (computedMac !== callbackData.mac) {
      return { success: false, appTransId: "" };
    }

    const decryptedData = JSON.parse(callbackData.data);

    await PaymentLog.create({
      requestData: JSON.stringify(callbackData),
      logType: "CALLBACK",
    });

    return {
      success: true,
      appTransId: decryptedData.app_trans_id,
    };
  }

  async queryTransaction(appTransId: string) {
    if (!this.gateway) await this.initGateway();

    const macData = `${this.gateway.appId}|${appTransId}|${this.gateway.key1}`;
    const mac = this.createSignature(macData, this.gateway.key1);

    const response = await axios.post(
      this.gateway.apiUrl?.replace("create", "query") || "",
      null,
      { params: { app_id: this.gateway.appId, app_trans_id: appTransId, mac } }
    );

    return response.data;
  }

  async refundTransaction() {
    throw new Error("Refund not implemented yet");
  }
}

export default ZaloPayService;
