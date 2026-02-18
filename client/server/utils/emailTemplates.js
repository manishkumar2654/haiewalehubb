const appointmentConfirmationTemplate = (
  appointment,
  customerDetails,
  isMassageService
) => {
  const appointmentDateTime = new Date(appointment.appointmentDateTime);
  const formattedDate = appointmentDateTime.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = appointmentDateTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const hasRoomDetails = isMassageService && appointment.roomId;
  const servicePrice = appointment.servicePrice || 0;
  const roomPrice = appointment.roomPrice || 0;
  const totalPrice = servicePrice + roomPrice;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Confirmation - S.Tatsaya Spa</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #9d174d 0%, #831843 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          font-size: 28px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .section {
          margin-bottom: 25px;
          padding-bottom: 25px;
          border-bottom: 1px solid #eee;
        }
        .section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        .section-title {
          color: #9d174d;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
        }
        .detail-label {
          color: #666;
          font-weight: 500;
        }
        .detail-value {
          color: #222;
          font-weight: 600;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 10px 0;
        }
        .price-total {
          font-size: 20px;
          font-weight: 700;
          color: #9d174d;
          border-top: 2px solid #eee;
          padding-top: 15px;
          margin-top: 10px;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          background: #d1fae5;
          color: #065f46;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        .instructions {
          background: #fdf2f8;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .instructions h3 {
          color: #9d174d;
          margin-bottom: 10px;
        }
        .instructions ul {
          margin-left: 20px;
        }
        .instructions li {
          margin-bottom: 8px;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
          border-top: 1px solid #eee;
        }
        .qr-placeholder {
          text-align: center;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
          margin: 20px 0;
        }
        .qr-placeholder img {
          max-width: 150px;
          margin: 10px 0;
        }
        @media (max-width: 600px) {
          .content {
            padding: 20px;
          }
          .detail-row, .price-row {
            flex-direction: column;
            gap: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Appointment Confirmed!</h1>
          <p>Your spa experience is all set. We can't wait to pamper you!</p>
        </div>
        
        <div class="content">
          <!-- Appointment ID & Status -->
          <div class="section">
            <div class="section-title">📋 Appointment Details</div>
            <div class="detail-row">
              <span class="detail-label">Appointment ID:</span>
              <span class="detail-value">${appointment.appointmentId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="status-badge">${appointment.status}</span>
            </div>
          </div>
          
          <!-- Date & Time -->
          <div class="section">
            <div class="section-title">📅 Date & Time</div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${formattedTime}</span>
            </div>
          </div>
          
          <!-- Customer Details -->
          <div class="section">
            <div class="section-title">👤 Personal Details</div>
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${
                customerDetails?.name || appointment.userId?.name
              }</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${
                customerDetails?.phone || appointment.userId?.phone
              }</span>
            </div>
            ${
              customerDetails?.email || appointment.userId?.email
                ? `
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${
                customerDetails?.email || appointment.userId?.email
              }</span>
            </div>
            `
                : ""
            }
          </div>
          
          <!-- Service Details -->
          <div class="section">
            <div class="section-title">💆 Service Details</div>
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span class="detail-value">${appointment.serviceId?.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">${
                appointment.durationMinutes || 60
              } minutes</span>
            </div>
          </div>
          
      
<!-- Room Details (if massage) -->
${
  hasRoomDetails
    ? `
<div class="section">
  <div class="section-title">🏠 Room & Branch Details</div>
  <div class="detail-row">
    <span class="detail-label">Room Type:</span>
    <span class="detail-value">${
      appointment.roomId?.type || appointment.type
    }</span>
  </div>
  <div class="detail-row">
    <span class="detail-label">Room Number:</span>
    <span class="detail-value">${
      appointment.roomId?.roomNumber || "Will be assigned"
    }</span>
  </div>
  ${
    appointment.roomId?.branch?.name
      ? `
  <div class="detail-row">
    <span class="detail-label">Branch Name:</span>
    <span class="detail-value">${appointment.roomId.branch.name}</span>
  </div>
  `
      : ""
  }
  ${
    appointment.roomId?.branch?.address
      ? `
  <div class="detail-row">
    <span class="detail-label">Branch Address:</span>
    <span class="detail-value">${appointment.roomId.branch.address}</span>
  </div>
  `
      : ""
  }
  ${
    appointment.roomId?.branch?.phone
      ? `
  <div class="detail-row">
    <span class="detail-label">Branch Phone:</span>
    <span class="detail-value">${appointment.roomId.branch.phone}</span>
  </div>
  `
      : ""
  }
  ${
    appointment.roomId?.branch?.landline
      ? `
  <div class="detail-row">
    <span class="detail-label">Landline:</span>
    <span class="detail-value">${appointment.roomId.branch.landline}</span>
  </div>
  `
      : ""
  }
  ${
    appointment.roomId?.branch?.workingHours
      ? `
  <div class="detail-row">
    <span class="detail-label">Working Hours:</span>
    <span class="detail-value">${appointment.roomId.branch.workingHours}</span>
  </div>
  `
      : ""
  }
  ${
    appointment.roomId?.branch?.premium
      ? `
  <div class="detail-row">
    <span class="detail-label">Branch Type:</span>
    <span class="detail-value status-badge" style="background: #fef3c7; color: #92400e; margin-left: 5px;">Premium</span>
  </div>
  `
      : ""
  }
</div>
`
    : ""
}
          
          <!-- Payment Summary -->
          <div class="section">
            <div class="section-title">💰 Payment Summary</div>
            <div class="price-row">
              <span class="detail-label">Service Price:</span>
              <span class="detail-value">₹${servicePrice}</span>
            </div>
            ${
              hasRoomDetails
                ? `
            <div class="price-row">
              <span class="detail-label">Room Price:</span>
              <span class="detail-value">₹${roomPrice}</span>
            </div>
            `
                : ""
            }
            <div class="price-row price-total">
              <span>Total Amount:</span>
              <span>₹${totalPrice}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${
                appointment.paymentMethod === "online"
                  ? "Online Payment"
                  : "Pay at Counter (Cash)"
              }</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span class="detail-value">${appointment.paymentStatus}</span>
            </div>
          </div>
          
          <!-- Important Instructions -->
          <div class="instructions">
            <h3>📌 Important Information</h3>
            <ul>
              <li>Please arrive <strong>15 minutes</strong> before your scheduled appointment</li>
              <li>Bring this confirmation email or Appointment ID for verification</li>
              ${
                appointment.paymentMethod === "cash"
                  ? "<li>Please bring cash for payment when you arrive</li>"
                  : ""
              }
              <li>Cancellation policy: 2 hours prior notice required</li>
              <li>For any changes, contact us at least 1 hour in advance</li>
            </ul>
          </div>
          
        <!-- QR Code Placeholder (for future) -->
<div class="qr-placeholder">
  <p><strong>📍 Branch Location:</strong> ${
    appointment.roomId?.branch?.address || "123 Wellness Street, Spa City"
  }</p>
  <p><strong>📞 Branch Contact:</strong> ${
    appointment.roomId?.branch?.phone
      ? appointment.roomId.branch.phone
      : appointment.roomId?.branch?.landline
      ? appointment.roomId.branch.landline
      : "+91-9876543210"
  }</p>
  <p><strong>🕒 Working Hours:</strong> ${
    appointment.roomId?.branch?.workingHours || "9:00 AM - 9:00 PM"
  }</p>
</div>
        
     <div class="footer">
  <p>Thank you for choosing <strong>S.Tatsaya Spa</strong> - ${
    appointment.roomId?.branch?.name || "Main Branch"
  }</p>
  <p>We look forward to providing you with an unforgettable experience!</p>
  <p style="margin-top: 15px; font-size: 12px; color: #999;">
    Branch: ${appointment.roomId?.branch?.name || "Main Branch"}<br>
    ${
      appointment.roomId?.branch?.address
        ? `Address: ${appointment.roomId.branch.address}<br>`
        : ""
    }
    ${
      appointment.roomId?.branch?.phone
        ? `Phone: ${appointment.roomId.branch.phone}<br>`
        : ""
    }
    This is an automated email. Please do not reply to this message.<br>
    © ${new Date().getFullYear()} S.Tatsaya Spa. All rights reserved.
  </p>
</div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  appointmentConfirmationTemplate,
};
