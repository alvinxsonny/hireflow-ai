export interface OfferRecord {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  designation: string;
  offeredSalary: number;
  joiningDate: string;
  expiryDate: string;
  benefits: string[];
  status: "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED";
  signatureDataUrl?: string;
  signedAt?: string;
  createdAt: string;
}

let inMemoryOffers: OfferRecord[] = [
  {
    id: "offer-1",
    applicationId: "app-101",
    candidateName: "Alex Johnson",
    candidateEmail: "alex.johnson@example.com",
    jobTitle: "Senior Full-Stack Engineer",
    designation: "Senior Lead Full-Stack Engineer",
    offeredSalary: 145000,
    joiningDate: "2026-12-01",
    expiryDate: "2026-11-25",
    benefits: [
      "Comprehensive Health, Dental, and Vision Insurance (100% covered)",
      "Flexible Remote Work with $1,500 Home Office Stipend",
      "Unlimited Paid Time Off (PTO) and Paid Parental Leave",
      "401(k) Retirement Plan with 4% Company Match",
      "$3,000 Annual Continuing Education & Learning Budget",
    ],
    status: "SENT",
    createdAt: new Date().toISOString(),
  },
];

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
