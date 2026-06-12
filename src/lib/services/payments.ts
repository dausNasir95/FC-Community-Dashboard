import type { Collection, CollectionParticipant, Payment, PaymentStatus } from "@/types/domain";

export function formatMYR(cents: number) {
  const value = cents / 100;
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  })
    .format(value)
    .replace("MYR", "RM");
}

export function calculateParticipantPayment(requiredAmount: number, verifiedPaymentTotal: number, isWaived = false) {
  if (isWaived) {
    return { total_paid: verifiedPaymentTotal, outstanding_amount: 0, payment_status: "Waived" as PaymentStatus };
  }

  const outstanding = Math.max(requiredAmount - verifiedPaymentTotal, 0);
  let status: PaymentStatus = "Unpaid";
  if (verifiedPaymentTotal > requiredAmount) status = "Overpaid";
  else if (verifiedPaymentTotal === requiredAmount && requiredAmount > 0) status = "Paid";
  else if (verifiedPaymentTotal > 0) status = "Partially Paid";

  return { total_paid: verifiedPaymentTotal, outstanding_amount: outstanding, payment_status: status };
}

export function calculateCollectionSummary(
  collection: Collection,
  participants: CollectionParticipant[],
  payments: Payment[],
) {
  const verifiedPayments = payments.filter((payment) => payment.verification_status === "Verified");
  const totalCollected = verifiedPayments.reduce((total, payment) => total + payment.amount, 0);
  const remaining = Math.max(collection.target_amount - totalCollected, 0);
  const excess = Math.max(totalCollected - collection.target_amount, 0);
  const progress = collection.target_amount > 0 ? Math.min((totalCollected * 100) / collection.target_amount, 100) : 0;

  const withTotals = participants.map((participant) => {
    const paid = verifiedPayments
      .filter((payment) => payment.collection_participant_id === participant.id)
      .reduce((total, payment) => total + payment.amount, 0);
    return { ...participant, ...calculateParticipantPayment(participant.required_amount, paid, participant.is_waived) };
  });

  return {
    collection: {
      ...collection,
      total_collected: totalCollected,
      remaining_amount: remaining,
      excess_amount: excess,
      progress_percentage: progress,
      participant_count: withTotals.length,
      paid_participant_count: withTotals.filter((participant) => participant.payment_status === "Paid" || participant.payment_status === "Overpaid" || participant.payment_status === "Waived").length,
      unpaid_participant_count: withTotals.filter((participant) => participant.payment_status === "Unpaid").length,
      partially_paid_participant_count: withTotals.filter((participant) => participant.payment_status === "Partially Paid").length,
    },
    participants: withTotals,
  };
}
