import Registration from "../models/registration_model.js";
import { sendConfirmationEmail } from '../utils/sendMail.js';
// 🔴 RAZORPAY DISABLED - Using manual payment only
// import Razorpay from 'razorpay';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔴 RAZORPAY DISABLED - Removed Razorpay initialization
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// Event fee mapping
const eventFees = {
  'Paper Presentation': 70,
  'Tech Quiz': 70,
  'Circuit Detective': 70,
  'Bug Hunters': 70,
  'Poster Presentation': 70,
  'Project Expo': 100,
  'Debate': 0,
  'Free Fire': 200,
  'BGMI': 200,
  'cineQuest': 50,
  'Balloon Spirit': 50,
  'Rope Rumble': 50,
  'Ball Heist': 50

};

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeStringField = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const resolveEventName = (eventValue) => {
  const normalizedEvent = normalizeStringField(eventValue);
  if (!normalizedEvent) {
    return '';
  }

  const knownEvents = Object.keys(eventFees);
  const matchedEvent = knownEvents.find((knownEvent) => knownEvent.toLowerCase() === normalizedEvent.toLowerCase());
  return matchedEvent || '';
};

// 🔴 RAZORPAY DISABLED - Removed create-order endpoint
// POST /api/create-order
// export const createOrder = async (req, res) => {
//   try {
//     const { email, name, rollnumber, event } = req.body;
//     
//     // Validate required fields
//     if (!email || !name || !rollnumber || !event) {
//       console.warn('Missing required fields:', { email, name, rollnumber, event });
//       return res.status(400).json({
//         success: false,
//         message: `Missing required fields: ${!email ? 'email ' : ''}${!name ? 'name ' : ''}${!rollnumber ? 'rollnumber ' : ''}${!event ? 'event' : ''}`,
//       });
//     }
//
//     // Get fee for event
//     const amount = eventFees[event] || 70; // Default to 70 if not found
//     
//     console.log('📝 Creating Razorpay order for:', { email, name, rollnumber, event, amount });
//
//     const options = {
//       amount: amount * 100, // Convert to smallest currency unit (paise)
//       currency: "INR",
//       receipt: `receipt_${rollnumber}_${Date.now()}`,
//       notes: {
//         email,
//         name,
//         rollnumber,
//         event,
//       },
//     };
//
//     const order = await razorpay.orders.create(options);
//     console.log('✅ Razorpay order created:', order.id);
//
//     res.status(201).json({
//       success: true,
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency,
//       eventFee: amount
//     });
//   } catch (error) {
//     console.error("❌ Order creation error:", error.message);
//     console.error("Error details:", error.response?.data || error);
//     
//     res.status(400).json({
//       success: false,
//       message: error.message,
//       details: error.response?.data?.error?.description || 'Please check your Razorpay credentials',
//     });
//   }
// };

// 🔴 RAZORPAY DISABLED - Removed verify-payment endpoint
// POST /api/verify-payment
// export const verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       name,
//       email,
//       college,
//       rollnumber,
//       contactnumber,
//       whatsappnumber,
//       year,
//       department,
//       event,
//     } = req.body;
//
//     // Verify signature
//     const sign = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(sign)
//       .digest("hex");
//
//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment verification failed",
//       });
//     }
//
//     // Create registration with payment details
//     const registration = await Registration.create({
//       name,
//       email,
//       college,
//       rollnumber,
//       contactnumber,
//       whatsappnumber,
//       year,
//       department,
//       event,
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       paymentStatus: 'completed'
//     });
//
//     // Send confirmation email asynchronously (don't block registration completion)
//     sendConfirmationEmail(registration.email, registration.name, registration.event)
//       .catch((error) => {
//         console.error("Email sending failed for user:", registration.email, error);
//         // Log the error but don't fail the registration
//       });
//
//     res.status(201).json({
//       success: true,
//       data: registration,
//       message: "Registration successful! Confirmation email will be sent shortly.",
//     });
//   } catch (error) {
//     console.error("Payment verification error:", error);
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// GET /api/register
export const getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find();

    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch registrations",
    });
  }
};

// POST /api/permission-letter-pdf
export const getPermissionLetterPDF = async (req, res) => {
  let doc;
  try {
    const { rollnumber, event } = req.body;
    if (!rollnumber || !event) {
      return res.status(400).json({ success: false, message: 'Roll number and event are required.' });
    }
    if (typeof rollnumber !== 'string' || typeof event !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid input type.' });
    }

    const registration = await Registration.findOne({ rollnumber: { $regex: rollnumber.trim(), $options: 'i' }, event: event.trim() });
    if (!registration) {
      return res.status(404).json({ success: false, message: 'No registration found for this roll number and event.' });
    }

    // Create QR code data
    const qrData = JSON.stringify({
      rollnumber: registration.rollnumber,
      name: registration.name,
      event: registration.event,
      college: registration.college,
      department: registration.department,
      year: registration.year,
      timestamp: new Date().toISOString()
    });

    // Generate QR code image with error handling
    let qrImage;
    try {
      qrImage = await QRCode.toDataURL(qrData, { width: 200 });
    } catch (qrError) {
      console.error("QR code generation error:", qrError);
      return res.status(500).json({ success: false, message: 'Error generating QR code.' });
    }

    // Create PDF document with wider margins to accommodate content
    doc = new PDFDocument({
      margins: { top: 50, left: 60, right: 60, bottom: 100 },
      size: 'A4'
    });

    // Set response headers BEFORE piping
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="permission_letter_${registration.rollnumber}_${registration.event.replace(/\s+/g, '_')}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Add error handling for response stream
    res.on('error', (err) => {
      console.error("Response stream error:", err);
      if (doc && !doc.writableEnded) {
        doc.end();
      }
    });

    // Add error handling for document stream BEFORE piping
    doc.on('error', (err) => {
      console.error("PDF document stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error generating PDF.' });
      } else {
        res.end();
      }
    });

    // Pipe PDF to response
    doc.pipe(res);

    // Add watermark logo
    try {
      const logoPath = path.join(__dirname, '../assets/Eclectica-logo-nobg.png');
      console.log("Adding watermark from:", logoPath);

      // Place watermark in center with visible opacity
      const logoSize = 400;
      const xPos = (595 - logoSize) / 2; // Center on A4 width
      const yPos = (842 - logoSize) / 2 - 100; // Center on A4 height, slightly higher

      doc.opacity(0.25); // 25% opacity - more visible
      doc.image(logoPath, xPos, yPos, { width: logoSize, height: logoSize });
      doc.opacity(1); // Reset to full opacity for text

      console.log("Watermark positioned at:", xPos, yPos);
    } catch (logoError) {
      console.error("Watermark error:", logoError.message);
    }

    // Add heading centered
    doc.fontSize(18).font('Helvetica-Bold').text('ECLECTICA-2K26', { align: 'center' });
    doc.fontSize(14).font('Helvetica-Bold').text('Permission Letter', { align: 'center' });
    doc.moveDown(0.5);

    // Add constant date at top right
    doc.fontSize(10).font('Helvetica').text('April 1, 2026', { align: 'right' });
    doc.moveDown(1);

    // Add letter body with proper format
    doc.fontSize(11).font('Helvetica-Bold').text('From:', { align: 'left' });
    doc.fontSize(10).font('Helvetica').text('The Coordinators', { align: 'left' });
    doc.fontSize(10).text('ECLECTICA 2K26', { align: 'left' });
    doc.fontSize(10).text('Department of Electronics and Communication Engineering', { align: 'left' });
    doc.fontSize(10).text('MITS Deemed to be University', { align: 'left' });
    doc.fontSize(10).text('Madanapalle', { align: 'left' });
    doc.moveDown(0.8);

    doc.fontSize(11).font('Helvetica-Bold').text('To:', { align: 'left' });
    doc.fontSize(10).font('Helvetica').text('The Head of the Department', { align: 'left' });
    doc.fontSize(10).text('Department of ' + (registration.department || '_______________'), { align: 'left' });
    doc.fontSize(10).text(registration.college, { align: 'left' });
    doc.moveDown(0.8);

    doc.fontSize(11).font('Helvetica-Bold').text('Subject: Request for Permission to Participate in ECLECTICA 2K26', { align: 'left' });
    doc.moveDown(0.8);

    doc.fontSize(11).font('Helvetica').text('Respected Sir/Madam,', { align: 'left' });
    doc.moveDown(0.8);

    doc.fontSize(10).font('Helvetica').text(
      'We extend our greetings from the Department of Electronics and Communication Engineering, MITS Deemed to be University.',
      { align: 'justify' }
    );
    doc.moveDown(0.5);

    doc.fontSize(10).text(
      `This is to inform you that ${registration.name} (${registration.rollnumber}), a student of your esteemed institution, has registered for the event ${registration.event} to be conducted as part of ECLECTICA 2K26, our departmental technical symposium.`,
      { align: 'justify' }
    );
    doc.moveDown(0.5);

    doc.fontSize(10).text(
      'In this regard, we kindly request you to grant  permission to participate in the above-mentioned event. We assure you that the program will be conducted in a well-organized and disciplined manner. Participation in this event will provide valuable technical exposure and contribute to the  academic and professional development.',
      { align: 'justify' }
    );
    doc.moveDown(0.5);

    doc.fontSize(10).text(
      'We shall be grateful for your kind consideration and approval.',
      { align: 'justify' }
    );
    doc.moveDown(0.8);

    doc.fontSize(10).text('Thanking you.', { align: 'left' });
    doc.moveDown(0.8);

    doc.fontSize(10).text('Yours sincerely,', { align: 'left' });
    doc.moveDown(1.5);

    doc.fontSize(10).font('Helvetica').text('The Coordinators', { align: 'left' });
    doc.fontSize(10).text('ECLECTICA 2K26', { align: 'left' });
    doc.fontSize(10).text('Department of ECE', { align: 'left' });
    doc.fontSize(10).text('MITS Deemed to be University', { align: 'left' });
    doc.fontSize(10).text('Madanapalle', { align: 'left' });

    // Add QR code at bottom left with error handling
    try {
      const qrImageBuffer = Buffer.from(qrImage.split(',')[1], 'base64');
      doc.image(qrImageBuffer, 60, 600, { width: 90, height: 90 });
    } catch (imgError) {
      console.error("QR image processing error:", imgError);
      // Continue without QR code if it fails
    }

    // Add text below QR code
    doc.fontSize(8).font('Helvetica').text('Scan this QR code to verify the student\'s registration details.', 60, 700, { width: 90, align: 'center' });


    // Add signature at bottom right
    doc.fontSize(10).font('Helvetica').text('Head of the Department', 380, 550, { width: 150, align: 'center' });
    doc.fontSize(10).text('Department of ' + (registration.department || '_______________'), 380, 560, { width: 150, align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Permission letter PDF error:", error);
    // Ensure we send a response
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    } else {
      // Headers already sent, just end the response
      if (doc && !doc.writableEnded) {
        doc.end();
      } else {
        res.end();
      }
    }
  }
};

// POST /api/registered-events
export const getRegisteredEvents = async (req, res) => {
  try {
    const { rollnumber } = req.body;
    if (!rollnumber || typeof rollnumber !== 'string') {
      return res.status(400).json({ success: false, message: 'Roll number is required.' });
    }
    const registrations = await Registration.find({ rollnumber: { $regex: rollnumber.trim(), $options: 'i' } });
    if (!registrations.length) {
      return res.status(404).json({ success: false, message: 'No registrations found for this roll number.' });
    }
    const events = registrations.map(r => r.event);
    res.json({ success: true, events });
  } catch (error) {
    console.error("Registered events error:", error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// POST /api/manual-registration (Manual registration with conditional payment proof)
export const manualRegistration = async (req, res) => {
  try {
    const name = normalizeStringField(req.body?.name);
    const email = normalizeStringField(req.body?.email);
    const college = normalizeStringField(req.body?.college);
    const rollnumber = normalizeStringField(req.body?.rollnumber);
    const contactnumber = normalizeStringField(req.body?.contactnumber);
    const whatsappnumber = normalizeStringField(req.body?.whatsappnumber);
    const year = normalizeStringField(req.body?.year);
    const department = normalizeStringField(req.body?.department);
    const rawEvent = normalizeStringField(req.body?.event);
    const event = resolveEventName(rawEvent);
    const normalizedUtrNumber = normalizeStringField(req.body?.utrNumber);

    const isDebateEvent = event === 'Debate';
    const resolvedPaymentAmount = Object.prototype.hasOwnProperty.call(eventFees, event)
      ? eventFees[event]
      : 0;

    // Validate required fields
    if (!name || !email || !college || !rollnumber || !contactnumber || 
        !whatsappnumber || !year || !department || !rawEvent) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (!event || !Object.prototype.hasOwnProperty.call(eventFees, event)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event selected'
      });
    }

    // Prevent duplicate registrations for the same participant and event.
    // This also keeps frontend retry logic idempotent on flaky mobile networks.
    const existingRegistration = await Registration.findOne({
      rollnumber: { $regex: `^${escapeRegex(rollnumber)}$`, $options: 'i' },
      event
    });

    if (existingRegistration) {
      return res.status(200).json({
        success: true,
        data: existingRegistration,
        message: 'You are already registered for this event.'
      });
    }

    // Payment proof is required only for paid events
    if (!isDebateEvent && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot is required'
      });
    }

    if (!isDebateEvent && !normalizedUtrNumber) {
      return res.status(400).json({
        success: false,
        message: 'UTR number is required'
      });
    }

    const uploadedImageUrl = (() => {
      if (isDebateEvent || !req.file) {
        return null;
      }

      if (req.file.path && /^https?:\/\//i.test(req.file.path)) {
        return req.file.path;
      }

      if (req.file.filename) {
        return `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      }

      return null;
    })();

    console.log('📝 Registering user for manual payment event:', { name, event, rollnumber });

    // Create registration with event-aware payment fields
    const registration = await Registration.create({
      name,
      email,
      college,
      rollnumber,
      contactnumber,
      whatsappnumber,
      year,
      department,
      event,
      razorpay_order_id: `MANUAL_${rollnumber}_${Date.now()}`, // Pseudo order ID
      razorpay_payment_id: isDebateEvent
        ? `FREE_${rollnumber}_${Date.now()}`
        : `SCREENSHOT_${rollnumber}_${Date.now()}`,
      razorpay_signature: isDebateEvent
        ? `FREE_EVENT_${rollnumber}`
        : `MANUAL_PAYMENT_${rollnumber}`,
      imageUrl: uploadedImageUrl,
      utrNumber: isDebateEvent ? null : normalizedUtrNumber,
      paymentStatus: isDebateEvent ? 'success' : 'pending',
      paymentAmount: resolvedPaymentAmount
    });

    console.log('✅ Manual registration created:', registration._id);

    // Send verification email to user (async, non-blocking)
    sendConfirmationEmail(
      registration.email, 
      registration.name, 
      registration.event,
      registration // Pass registration data for failed email logging
    ).then((result) => {
      if (result.success) {
        console.log('✅ Confirmation email sent successfully');
      } else {
        console.log('⚠️ Confirmation email failed - logged for admin review');
      }
    }).catch((error) => {
      console.error("Unexpected error in email handler:", registration.email, error);
    });

    res.status(201).json({
      success: true,
      data: registration,
      message: isDebateEvent
        ? 'Registration submitted successfully! Debate is free and no payment verification is needed.'
        : 'Registration submitted successfully! Your payment screenshot is being verified. You will receive confirmation email once verified.'
    });

  } catch (error) {
    console.error("Manual registration error:", error);
    const statusCode = error?.name === 'ValidationError' ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error creating registration'
    });
  }
};
