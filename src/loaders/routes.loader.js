import authRoutes from "../routes/auth/authRoutes.js";
import loginActivity from "../routes/login-activity/loginActivityRoutes.js";
import advisorRoutes from "../routes/core-routes/advisorRoutes.js";
import tourRoutes from "../routes/core-routes/tourRoutes.js";
import hotelRoutes from "../routes/core-routes/hotelRoutes.js";
import driverRoutes from "../routes/core-routes/driverRoutes.js";
import dashboardRoutes from "../routes/core-routes/dashboardRoutes.js";
import documentRoutes from "../routes/docuemts-guests/documentRoutes.js";
import guestRoutes from "../routes/docuemts-guests/guestRoutes.js";
import itineraryRoutes from "../routes/docuemts-guests/itineraryRoutes.js";
import transportRoutes from "../routes/transport-activites/transportRoutes.js";
import activityRoutes from "../routes/transport-activites/activityRoutes.js";
import tourOtherDetailRoutes from "../routes/transport-activites/tourOtherDetailRoutes.js";
import queryRoutes from "../routes/query-tickets/queryRoutes.js";
import travelTicketRoutes from "../routes/query-tickets/travelTicketRoutes.js";
import additionalCostRoutes from "../routes/financial/additionalCostRoutes.js";
import clientAccountRoutes from "../routes/client-account/clientAccountRoutes.js";
import paymentRoutes from "../routes/financial/paymentRoutes.js";
import realTimeRoutes from "../routes/realtime-users/realTimeUpdateRoutes.js";
import getTeamMember from "../routes/realtime-users/userRoutes.js";
import notificationRoutes from "../routes/notifications/notificationRoutes.js";
import invoiceRoutes from "../routes/invoice-city/invoiceRoutes.js";
import cityRoutes from "../routes/invoice-city/cityRoutes.js";
import clientDashboardRoutes from "../routes/client-account/clientDashboardRoutes.js";
import emailRoutes from "../routes/invoice-city/emailRoutes.js";

const loadRoutes = (app) => {
  // AUTH
  app.use("/api/v1/auth", authRoutes);

  // LOGIN ACTIVITY
  app.use("/api/v1", loginActivity);

  // NOTIFICATIONS
  app.use("/api/v1/notifications", notificationRoutes);

  // CORE MODULES
  app.use("/api/v1/advisors", advisorRoutes);
  app.use("/api/v1/tours", tourRoutes);
  app.use("/api/v1/hotels", hotelRoutes);
  app.use("/api/v1/drivers", driverRoutes);
  app.use("/api/v1/dashboard", dashboardRoutes);

  // DOCUMENTS & GUESTS
  app.use("/api/v1/documents", documentRoutes);
  app.use("/api/guests", guestRoutes);
  app.use("/api/itinerary", itineraryRoutes);

  // TRANSPORT & ACTIVITIES
  app.use("/api/v1/transports", transportRoutes);
  app.use("/api/v1/activities", activityRoutes);
  app.use("/api/v1/tour-other-details", tourOtherDetailRoutes);

  // QUERY & TICKETS
  app.use("/api/queries", queryRoutes);
  app.use("/api/tickets", travelTicketRoutes);

  // CLIENT ACCOUNT & DASHBOARD
   app.use("/api/client-account", clientAccountRoutes);
   app.use("/api/v1/client-dashboard", clientDashboardRoutes);

  // FINANCIAL
  app.use("/api/additional-cost", additionalCostRoutes);
  app.use("/api/payments", paymentRoutes);

  // REALTIME & USERS
  app.use("/api/v1/realtime", realTimeRoutes);
  app.use("/api/v1/user", getTeamMember);

  // INVOICE & CITY
  app.use("/api/invoice", invoiceRoutes);
  app.use("/api", cityRoutes);
  app.use("/api/email", emailRoutes);

};

export default loadRoutes;