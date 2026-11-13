import { prisma } from "@/lib/prisma";

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

let inMemoryOffers: OfferRecord[] = [];

export async function createOfferRecord(data: Omit<OfferRecord, "id" | "status" | "createdAt">): Promise<OfferRecord> {
  const newOffer: OfferRecord = {
    id: `offer-${Date.now()}`,
    ...data,
    status: "SENT",
    createdAt: new Date().toISOString(),
  };

  try {
    const joiningDate = new Date(data.joiningDate);
    const validJoining = isNaN(joiningDate.getTime()) ? new Date() : joiningDate;
    const expiryDate = new Date(data.expiryDate);
    const validExpiry = isNaN(expiryDate.getTime()) ? new Date(Date.now() + 7 * 86400000) : expiryDate;

    const dbOffer = await prisma.offerLetter.upsert({
      where: { applicationId: data.applicationId },
      update: {
        offeredSalary: data.offeredSalary,
        designation: data.designation,
        companyName: data.companyName,
        joiningDate: validJoining,
        expiryDate: validExpiry,
        benefits: data.benefits,
        status: "SENT",
      },
      create: {
        applicationId: data.applicationId,
        offeredSalary: data.offeredSalary,
        designation: data.designation,
        companyName: data.companyName,
        joiningDate: validJoining,
        expiryDate: validExpiry,
        benefits: data.benefits,
        status: "SENT",
      },
    });

    newOffer.id = dbOffer.id;
  } catch (e) {
    console.error("[createOfferRecord] DB error:", e);
  }

  inMemoryOffers.unshift(newOffer);
  return newOffer;
}

export async function getAllOffers(): Promise<OfferRecord[]> {
  try {
    const dbOffers = await prisma.offerLetter.findMany({
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbOffers.length > 0) {
      return dbOffers.map((o) => ({
        id: o.id,
        applicationId: o.applicationId,
        candidateName: o.application.candidate.fullName,
        candidateEmail: o.application.candidate.email,
        jobTitle: o.application.job.title,
        designation: o.designation || o.application.job.title,
        companyName: o.companyName || undefined,
        offeredSalary: Number(o.offeredSalary),
        joiningDate: o.joiningDate.toISOString().split("T")[0],
        expiryDate: o.expiryDate.toISOString().split("T")[0],
        benefits: o.benefits,
        status: o.status as any,
        signatureDataUrl: o.candidateSignatureUrl || undefined,
        signedAt: o.signatureTimestamp?.toISOString() || undefined,
        createdAt: o.createdAt.toISOString(),
      }));
    }
  } catch (e) {
    console.error("[getAllOffers] DB error:", e);
  }

  return inMemoryOffers;
}

export async function getOfferById(id: string): Promise<OfferRecord | null> {
  try {
    const o = await prisma.offerLetter.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
    });

    if (o) {
      return {
        id: o.id,
        applicationId: o.applicationId,
        candidateName: o.application.candidate.fullName,
        candidateEmail: o.application.candidate.email,
        jobTitle: o.application.job.title,
        designation: o.designation || o.application.job.title,
        companyName: o.companyName || undefined,
        offeredSalary: Number(o.offeredSalary),
        joiningDate: o.joiningDate.toISOString().split("T")[0],
        expiryDate: o.expiryDate.toISOString().split("T")[0],
        benefits: o.benefits,
        status: o.status as any,
        signatureDataUrl: o.candidateSignatureUrl || undefined,
        signedAt: o.signatureTimestamp?.toISOString() || undefined,
        createdAt: o.createdAt.toISOString(),
      };
    }
  } catch (e) {
    console.error("[getOfferById] DB error:", e);
  }

  return inMemoryOffers.find((o) => o.id === id) || null;
}

export async function getOfferByApplicationId(applicationId: string): Promise<OfferRecord | null> {
  try {
    const o = await prisma.offerLetter.findUnique({
      where: { applicationId },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
    });

    if (o) {
      return {
        id: o.id,
        applicationId: o.applicationId,
        candidateName: o.application.candidate.fullName,
        candidateEmail: o.application.candidate.email,
        jobTitle: o.application.job.title,
        designation: o.designation || o.application.job.title,
        companyName: o.companyName || undefined,
        offeredSalary: Number(o.offeredSalary),
        joiningDate: o.joiningDate.toISOString().split("T")[0],
        expiryDate: o.expiryDate.toISOString().split("T")[0],
        benefits: o.benefits,
        status: o.status as any,
        signatureDataUrl: o.candidateSignatureUrl || undefined,
        signedAt: o.signatureTimestamp?.toISOString() || undefined,
        createdAt: o.createdAt.toISOString(),
      };
    }
  } catch (e) {
    console.error("[getOfferByApplicationId] DB error:", e);
  }

  return inMemoryOffers.find((o) => o.applicationId === applicationId) || null;
}

export async function signOfferLetter(
  offerId: string,
  signatureDataUrl: string,
  accept: boolean
): Promise<OfferRecord | null> {
  try {
    await prisma.offerLetter.update({
      where: { id: offerId },
      data: {
        status: accept ? "ACCEPTED" : "DECLINED",
        candidateSignatureUrl: signatureDataUrl,
        signatureTimestamp: new Date(),
      },
    });
  } catch (e) {
    console.error("[signOfferLetter] DB error:", e);
  }

  const offer = inMemoryOffers.find((o) => o.id === offerId);
  if (offer) {
    offer.status = accept ? "ACCEPTED" : "DECLINED";
    offer.signatureDataUrl = signatureDataUrl;
    offer.signedAt = new Date().toISOString();
    return offer;
  }

  return getOfferById(offerId);
}
