// utils/appointmentToBillConverter.js

const Bill = require("../models/Bill");

const createBillFromAppointment = async (appointment) => {
  try {
    // Appointment se bill data prepare karein
    const billData = {
      name: appointment.userId?.name || "N/A",
      customerId:
        appointment.userId?._id?.toString()?.substring(0, 10) ||
        "APP-" + appointment.appointmentId,
      phone: appointment.userId?.phone || "0000000000",
      gender: "Other", // Default gender
      roomNo: appointment.roomId?.roomNumber || "N/A",
      date: appointment.appointmentDateTime,

      services: [
        {
          serviceName: appointment.serviceId?.name || "Appointment Service",
          duration:
            appointment.serviceId?.pricing?.[0]?.durationMinutes + " mins" ||
            "60 mins",
          staffAssigned: appointment.employeeId?.name || "Staff",
          price: appointment.servicePrice || 0,
          gst: 5, // Default GST
          discount: 0,
          total: appointment.servicePrice || 0,
        },
      ],

      products: [], // Appointment mein products nahi hote

      invoiceNumber: `APP-${appointment.appointmentId}`,
      billingDate: appointment.appointmentDateTime,
      billingTime: new Date(appointment.appointmentDateTime).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      discountPercent: 0,
      paymentMethod:
        appointment.paymentMethod === "cash"
          ? "Cash"
          : appointment.paymentMethod === "online"
          ? "UPI"
          : "Cash",

      subTotal: appointment.servicePrice + (appointment.roomPrice || 0),
      acharosAmount: 0,
      totalPrice: appointment.totalPrice || 0,
    };

    // Bill create karein
    const bill = new Bill(billData);

    // Calculate totals (existing function)
    bill.calculateTotals();

    // Save to database
    await bill.save();

    return bill;
  } catch (error) {
    console.error("Error creating bill from appointment:", error);
    throw error;
  }
};

module.exports = { createBillFromAppointment };
