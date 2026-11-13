export interface OfferRecord {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  designation: string;
  companyName?: string;
  offeredSalary: number;
  joiningDate: string;
  expiryDate: string;
  benefits: string[];
  status: "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED";
  signatureDataUrl?: string;
  signedAt?: string;
  createdAt: string;
}

// Empty initial offers — created only when HR approves a candidate
let inMemoryOffers: OfferRecord[] = [];

export async function createOfferRecord(data: Omit<OfferRecord, "id" | "status" | "createdAt">) {
  const newOffer: OfferRecord = {
    id: `offer-${Date.now()}`,
    ...data,
    status: "SENT",
    createdAt: new Date().toISOString(),
  };

  inMemoryOffers.unshift(newOffer);
  return newOffer;
}

export async function getAllOffers() {
  return inMemoryOffers;
}

export async function getOfferById(id: string) {
  return inMemoryOffers.find((o) => o.id === id) || null;
}

export async function getOfferByApplicationId(applicationId: string) {
  return inMemoryOffers.find((o) => o.applicationId === applicationId) || null;
}

export async function signOfferLetter(
  offerId: string,
  signatureDataUrl: string,
  accept: boolean
) {
  const offer = inMemoryOffers.find((o) => o.id === offerId);
  if (!offer) return null;

  offer.status = accept ? "ACCEPTED" : "DECLINED";
  offer.signatureDataUrl = signatureDataUrl;
  offer.signedAt = new Date().toISOString();

  return offer;
}

