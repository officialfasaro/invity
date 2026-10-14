import crypto from "crypto";

export interface CustomerDetails {
  first_name: string;
  email: string;
  phone?: string;
}

export interface SnapTransactionResponse {
  token: string;
  redirect_url: string;
}

export function isMidtransProduction(): boolean {
  const serverKey = getMidtransServerKey();
  // Auto-detect environment based on Midtrans key prefix:
  // Keys starting with 'Mid-server-' (without 'SB-') are Midtrans Production keys.
  if (serverKey.startsWith("Mid-server-")) {
    return true;
  }
  if (serverKey.startsWith("SB-Mid-server-")) {
    return false;
  }
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

export function getMidtransServerKey(): string {
  return process.env.MIDTRANS_SERVER_KEY || "";
}

export function getSnapApiUrl(): string {
  return isMidtransProduction()
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

export async function createSnapTransaction(
  orderId: string,
  amount: number,
  customerDetails: CustomerDetails
): Promise<SnapTransactionResponse> {
  const serverKey = getMidtransServerKey();
  const snapApiUrl = getSnapApiUrl();
  const authHeader = Buffer.from(`${serverKey}:`).toString("base64");

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Math.round(amount),
    },
    customer_details: {
      first_name: customerDetails.first_name,
      email: customerDetails.email,
      phone: customerDetails.phone ?? "",
    },
    credit_card: {
      secure: true,
    },
  };

  // If server key is missing or is the placeholder sandbox key, return dev mock token
  if (!serverKey || serverKey.includes("YOUR_SANDBOX")) {
    return {
      token: `mock_snap_${orderId}_${Date.now()}`,
      redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/mock_snap_${orderId}`,
    };
  }

  const response = await fetch(snapApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Midtrans Sandbox API error (${response.status}): ${errorBody}`);
  }

  return response.json() as Promise<SnapTransactionResponse>;
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = getMidtransServerKey();
  const hashString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const computedHash = crypto.createHash("sha512").update(hashString).digest("hex");
  return computedHash.toLowerCase() === signatureKey.toLowerCase();
}

