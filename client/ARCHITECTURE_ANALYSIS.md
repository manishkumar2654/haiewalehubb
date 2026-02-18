# HairnHub - Complete Architecture & Features Analysis

## 📐 Architecture Overview

### **Technology Stack**

#### **Frontend (Client)**
- **Framework**: React 19.1.0 with Vite 7.0.4
- **Styling**: Tailwind CSS 4.1.11
- **UI Components**: Ant Design 6.1.1, Lucide React
- **Routing**: React Router DOM 7.6.3
- **State Management**: React Context API
- **HTTP Client**: Axios 1.10.0
- **Authentication**: Google OAuth (@react-oauth/google)
- **PDF Generation**: @react-pdf/renderer, PDFKit
- **Maps**: Leaflet, React Leaflet
- **Date Handling**: date-fns, react-datepicker
- **Notifications**: react-toastify
- **QR Codes**: qrcode.react
- **Excel Export**: xlsx

#### **Backend (Server)**
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.16.3
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **File Upload**: Multer, Cloudinary
- **Email**: Nodemailer
- **Payment**: Razorpay
- **PDF Generation**: PDFKit
- **QR Codes**: qrcode
- **Validation**: Joi, express-validator
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston, Morgan
- **Caching**: Redis
- **Geocoding**: Custom geocodeAddress utility
- **Compression**: compression middleware

### **Architecture Pattern**
- **MVC (Model-View-Controller)** architecture
- **RESTful API** design
- **SPA (Single Page Application)** frontend
- **JWT-based authentication**
- **Role-based access control (RBAC)**

---

## 📁 File Structure

### **Client Structure (`/client`)**

```
client/
├── public/                          # Static assets
│   ├── images/                     # Image assets
│   └── bill/                       # Bill templates/assets
├── src/
│   ├── auth/                       # Authentication pages
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   ├── components/                 # Reusable components
│   │   ├── appointment/           # Appointment-related components
│   │   │   ├── AppointmentDetails.jsx
│   │   │   ├── AppointmentList.jsx
│   │   │   ├── AppointmentSearch.jsx
│   │   │   ├── AppointmentSteps.jsx
│   │   │   ├── Confirmation.jsx
│   │   │   ├── CustomerDetails.jsx
│   │   │   ├── DateTimeSelection.jsx
│   │   │   ├── RoomTypeSelection.jsx
│   │   │   ├── ServiceSelection.jsx
│   │   │   └── Summary.jsx
│   │   ├── Bill/                  # Bill generation components
│   │   │   ├── BillForm/
│   │   │   │   ├── CustomerSection.jsx
│   │   │   │   ├── InvoiceSummary.jsx
│   │   │   │   ├── ProductsSection.jsx
│   │   │   │   ├── ServicesSection.jsx
│   │   │   │   └── index.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── Modal.jsx
│   │   ├── common/                # Common/shared components
│   │   │   ├── EmailVerificationModal.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Layout.jsx
│   │   ├── home/                  # Homepage components
│   │   │   ├── BeautyMeetsNature.jsx
│   │   │   ├── BranchLocations.jsx
│   │   │   ├── CallToAction.jsx
│   │   │   ├── HeroCarousel.jsx
│   │   │   ├── ProductsSection.jsx
│   │   │   └── ServicesSection.jsx
│   │   ├── ui/                    # UI primitives
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── GoogleLoginButton.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Table.jsx
│   │   ├── AddressForm.jsx
│   │   ├── AddressList.jsx
│   │   ├── Footer.jsx
│   │   ├── MainLayout.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ScrollToTop.jsx
│   ├── context/                   # React Context providers
│   │   ├── AuthContext.jsx        # Authentication state
│   │   └── ToastContext.jsx       # Toast notifications
│   ├── pages/                     # Page components
│   │   ├── appointment/          # Appointment pages
│   │   │   ├── AppointmentBooking.jsx
│   │   │   └── MyAppointments.jsx
│   │   ├── dashboard/            # Dashboard pages
│   │   │   ├── AdminAppointmentManagement.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminEmployeeManagement.jsx
│   │   │   ├── BranchManagement.jsx
│   │   │   ├── BranchTypeManagement.jsx
│   │   │   ├── CategoryManagement.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── EmployeeRoleManagement.jsx
│   │   │   ├── OrderManagement.jsx
│   │   │   ├── ProductCategoryManagement.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   ├── ProductManagement.jsx
│   │   │   ├── RoomManagement.jsx
│   │   │   ├── SeatManagementModal.jsx
│   │   │   ├── ServiceManagement.jsx
│   │   │   ├── SubCategoryManagement.jsx
│   │   │   └── UserDashboard.jsx
│   │   ├── walkin/               # Walk-in booking pages
│   │   │   ├── CalculatePriceCell.jsx
│   │   │   ├── CustomerForm.jsx
│   │   │   ├── PaymentSummary.jsx
│   │   │   ├── ProductSelector.jsx
│   │   │   ├── QRModal.jsx
│   │   │   ├── ServiceModal.jsx
│   │   │   ├── ServiceSelector.jsx
│   │   │   ├── StatsPanel.jsx
│   │   │   ├── UpdateProductSelector.jsx
│   │   │   ├── UpdateServiceSelector.jsx
│   │   │   ├── UpdateWalkinModal.jsx
│   │   │   ├── WalkinBooking.jsx
│   │   │   ├── WalkinDetailsModal.jsx
│   │   │   └── WalkinList.jsx
│   │   ├── AboutUs.jsx
│   │   ├── AddressManagement.jsx
│   │   ├── Cart.jsx
│   │   ├── Contact.jsx
│   │   ├── CreateBillPage.jsx
│   │   ├── CreateOrderPage.jsx
│   │   ├── EditBillPage.jsx
│   │   ├── Home.jsx
│   │   ├── OrderDetails.jsx
│   │   ├── OrdersPage.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── ServiceDetailsPage.jsx
│   │   ├── Store.jsx
│   │   ├── TermsAndConditions.jsx
│   │   └── ViewBillsPage.jsx
│   ├── services/                  # API service layer
│   │   ├── api.js                 # API endpoints
│   │   └── auth.js                # Auth service
│   ├── utils/                     # Utility functions
│   │   └── constants.js           # App constants
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── vite.config.js                 # Vite configuration
└── package.json
```

### **Server Structure (`/server`)**

```
server/
├── config/                        # Configuration files
│   ├── cloudinary.js              # Cloudinary setup
│   ├── db.js                      # MongoDB connection
│   └── firebase.js                # Firebase admin setup
├── controllers/                   # Route controllers
│   ├── addressController.js
│   ├── appointmentController.js
│   ├── authController.js
│   ├── billController.js
│   ├── branchController.js
│   ├── branchTypeController.js
│   ├── cartController.js
│   ├── categoryController.js
│   ├── employeeRoleController.js
│   ├── orderController.js
│   ├── productCategoryController.js
│   ├── productController.js
│   ├── seatController.js
│   ├── statsController.js
│   ├── subCategoryController.js
│   ├── walkinCalculatorController.js
│   └── walkinController.js
├── middlewares/                   # Express middlewares
│   ├── authMiddleware.js          # JWT authentication
│   └── uploadMiddleware.js        # File upload handling
├── models/                        # Mongoose models
│   ├── Appointment.js
│   ├── Availability.js
│   ├── Bill.js
│   ├── Branch.js
│   ├── BranchType.js
│   ├── Cart.js
│   ├── Category.js
│   ├── EmployeeRole.js
│   ├── Order.js
│   ├── Product.js
│   ├── ProductCategory.js
│   ├── Room.js
│   ├── Seat.js
│   ├── Service.js
│   ├── SubCategory.js
│   ├── User.js
│   └── Walkin.js
├── routes/                        # API routes
│   ├── admin/                     # Admin routes
│   │   ├── branchRoutes.js
│   │   ├── categories.js
│   │   ├── rooms.js
│   │   └── services.js
│   ├── addressRoutes.js
│   ├── admin.js
│   ├── appointmentRoutes.js
│   ├── authRoutes.js
│   ├── billRoutes.js
│   ├── branchTypeRoutes.js
│   ├── cartRoutes.js
│   ├── employeeRoleRoutes.js
│   ├── orderRoutes.js
│   ├── productCategoryRoutes.js
│   ├── productRoutes.js
│   ├── seatRoutes.js
│   ├── statsRoutes.js
│   ├── subCategoryRoutes.js
│   ├── uploadRoutes.js
│   └── walkinRoutes.js
├── utils/                         # Utility functions
│   ├── appError.js                # Custom error class
│   ├── appointmentBillGenerator.js
│   ├── appointmentToBillConverter.js
│   ├── email.js                   # Email service
│   ├── emailTemplates.js
│   ├── geocodeAddress.js          # Address geocoding
│   ├── logger.js                  # Winston logger
│   └── pdfGenerator.js            # PDF generation
├── pdfs/                          # Generated PDFs
├── public/uploads/                # Uploaded files
├── temp-uploads/                   # Temporary uploads
├── dist/                          # Built frontend (served statically)
└── app.js                         # Express app entry point
```

---

## 🎯 Features Implemented

### **1. Authentication & Authorization**

#### **User Authentication**
- ✅ Email/Password registration and login
- ✅ Google OAuth integration
- ✅ JWT-based token authentication
- ✅ Password reset via email
- ✅ Email verification system
- ✅ Phone verification (structure in place)
- ✅ Protected routes with role-based access

#### **User Roles**
- **Admin**: Full system access
- **Employee**: 
  - Manager: Admin-level access
  - Receptionist: Admin-level access
  - Service Staff: Limited access
- **User**: Customer access

#### **Security Features**
- Rate limiting (global, auth-specific, order-specific)
- Password hashing with bcrypt
- JWT token expiration
- CORS configuration
- Helmet security headers
- Input validation (Joi, express-validator)

---

### **2. Appointment Management**

#### **Appointment Booking**
- ✅ Multi-step appointment booking process
- ✅ Service selection with categories
- ✅ Room type selection (Silver, Gold, Diamond)
- ✅ Date and time selection
- ✅ Employee/staff assignment
- ✅ Customer details collection
- ✅ Appointment confirmation
- ✅ Appointment status tracking (Pending, Confirmed, Cancelled, Completed)

#### **Appointment Features**
- ✅ Appointment ID generation (APP-APP000XXX format)
- ✅ Payment status tracking (Pending, Paid, Refunded, Cash)
- ✅ Payment methods (online, cash)
- ✅ Price calculation (service + room pricing)
- ✅ Appointment search functionality
- ✅ My Appointments page for users
- ✅ Appointment management dashboard for admins
- ✅ Appointment to Bill conversion
- ✅ PDF generation for appointments

---

### **3. Walk-in Booking System**

#### **Walk-in Management**
- ✅ Create walk-in bookings
- ✅ Customer information collection
- ✅ Service selection with pricing
- ✅ Product selection with quantity
- ✅ Seat booking system
- ✅ Branch selection
- ✅ Staff assignment
- ✅ Status tracking (draft, confirmed, in_progress, completed, cancelled)

#### **Walk-in Features**
- ✅ Walk-in number generation (WN-YYMMXXXX format)
- ✅ Invoice number generation (INV-YYMMXXXX format)
- ✅ Price calculation (services + products + seats)
- ✅ Discount application
- ✅ Payment tracking (pending, paid, partially_paid)
- ✅ Payment methods (cash, card, UPI, credit)
- ✅ Due amount calculation
- ✅ QR code generation for walk-ins
- ✅ PDF generation for walk-in invoices
- ✅ Stock deduction for products
- ✅ Real-time price calculator
- ✅ Statistics panel
- ✅ Employee-specific walk-in filtering

---

### **4. E-Commerce (Product Store)**

#### **Product Management**
- ✅ Product CRUD operations
- ✅ Product categories and subcategories
- ✅ Product images (up to 4 images per product)
- ✅ Stock management:
  - Total stock
  - In-use stock
  - Available stock (auto-calculated)
- ✅ Product pricing
- ✅ Product descriptions

#### **Shopping Features**
- ✅ Product catalog/store page
- ✅ Product details page
- ✅ Shopping cart functionality
- ✅ Cart persistence
- ✅ Order creation
- ✅ Order management
- ✅ Order status tracking
- ✅ Order history
- ✅ Address management for shipping
- ✅ Multiple addresses per user

#### **Order Management**
- ✅ Order creation with items
- ✅ Shipping address selection
- ✅ Payment methods (COD, ONLINE)
- ✅ Order pricing (items, tax, shipping, total)
- ✅ Payment status tracking
- ✅ Delivery status tracking
- ✅ Order details page
- ✅ Order history page
- ✅ Razorpay payment integration

---

### **5. Bill Generation System**

#### **Bill Management**
- ✅ Create bills manually
- ✅ Edit bills
- ✅ View bills
- ✅ Delete bills
- ✅ Bill/invoice number generation (INV-XXXXXXX format)

#### **Bill Features**
- ✅ Customer information (name, ID, phone, gender)
- ✅ Service addition with:
  - Service name, duration, staff
  - Price, GST, discount
  - Total calculation
- ✅ Product addition with:
  - Product name, quantity, unit price
  - GST, discount
  - Total calculation
- ✅ Room number assignment
- ✅ Payment method (Cash, UPI, Card)
- ✅ Discount percentage
- ✅ Acharos amount
- ✅ Subtotal and total calculation
- ✅ PDF generation with branded template
- ✅ PDF download functionality
- ✅ Bill templates with header/footer

---

### **6. Branch & Location Management**

#### **Branch Management**
- ✅ Branch CRUD operations
- ✅ Branch types (Silver, Gold, Diamond)
- ✅ Branch status (active/inactive)
- ✅ Branch location with geocoding
- ✅ Branch-specific services
- ✅ Branch-specific staff
- ✅ Branch statistics

#### **Seat Management**
- ✅ Seat CRUD operations
- ✅ Seat types
- ✅ Seat status (available, occupied)
- ✅ Seat booking for walk-ins
- ✅ Bulk seat creation
- ✅ Branch-specific seats

---

### **7. Service Management**

#### **Service Features**
- ✅ Service CRUD operations
- ✅ Service categories
- ✅ Service subcategories
- ✅ Service pricing by room type
- ✅ Service duration
- ✅ Service availability
- ✅ Service details page
- ✅ Service selection in appointments
- ✅ Service selection in walk-ins

---

### **8. Room Management**

#### **Room Features**
- ✅ Room CRUD operations
- ✅ Room types (Silver, Gold, Diamond)
- ✅ Room pricing
- ✅ Room availability
- ✅ Branch-specific rooms
- ✅ Room assignment in appointments

---

### **9. Employee Management**

#### **Employee Features**
- ✅ Employee registration
- ✅ Employee ID generation (EMP-YYYY-DEPT-XXXX format)
- ✅ Employee roles (Manager, Receptionist, Service Staff)
- ✅ Shift management (morning, night)
- ✅ Working location assignment
- ✅ Employee status (occupied, free) for service staff
- ✅ Employee dashboard
- ✅ Employee-specific appointments/walk-ins
- ✅ Employee role management

---

### **10. Category & Subcategory Management**

#### **Category Features**
- ✅ Category CRUD operations
- ✅ Category for services
- ✅ Subcategory CRUD operations
- ✅ Product category management
- ✅ Product subcategory management
- ✅ Category hierarchy

---

### **11. Dashboard & Analytics**

#### **Admin Dashboard**
- ✅ Real-time statistics
- ✅ Appointment statistics
- ✅ Order statistics
- ✅ Revenue tracking
- ✅ Branch-wise statistics
- ✅ Date range filtering
- ✅ Employee management interface
- ✅ Product management interface
- ✅ Service management interface
- ✅ Category management interface
- ✅ Branch management interface

#### **User Dashboard**
- ✅ User profile information
- ✅ Order history
- ✅ Appointment history
- ✅ Address management

#### **Employee Dashboard**
- ✅ Employee-specific view
- ✅ Assigned appointments
- ✅ Assigned walk-ins
- ✅ Status management

---

### **12. File Upload & Media Management**

#### **Upload Features**
- ✅ Image upload to Cloudinary
- ✅ Multiple image support
- ✅ File validation
- ✅ PDF generation and storage
- ✅ QR code generation
- ✅ Static file serving with caching

---

### **13. Email System**

#### **Email Features**
- ✅ Email verification
- ✅ Password reset emails
- ✅ Email templates
- ✅ Nodemailer integration
- ✅ Email verification tokens

---

### **14. Payment Integration**

#### **Payment Features**
- ✅ Razorpay integration
- ✅ Online payment processing
- ✅ Cash payment option
- ✅ Payment status tracking
- ✅ Payment history
- ✅ Refund handling

---

### **15. UI/UX Features**

#### **User Interface**
- ✅ Responsive design (Tailwind CSS)
- ✅ Modern UI components (Ant Design)
- ✅ Toast notifications
- ✅ Modal dialogs
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Scroll to top functionality
- ✅ Protected route navigation
- ✅ Google Maps integration (Leaflet)
- ✅ Image carousels
- ✅ QR code display
- ✅ PDF viewer/download

#### **Pages**
- ✅ Homepage with hero carousel
- ✅ About Us page
- ✅ Contact Us page
- ✅ Terms and Conditions page
- ✅ Store page
- ✅ Product details page
- ✅ Service details page
- ✅ Cart page
- ✅ Checkout page
- ✅ Order pages
- ✅ Appointment pages
- ✅ Dashboard pages

---

### **16. API Features**

#### **API Structure**
- ✅ RESTful API design
- ✅ Versioned routes (/api/v1/)
- ✅ Rate limiting
- ✅ Error handling middleware
- ✅ Request validation
- ✅ Response compression
- ✅ Static file serving
- ✅ SPA routing fallback

#### **API Endpoints**
- ✅ Authentication endpoints
- ✅ User endpoints
- ✅ Product endpoints
- ✅ Order endpoints
- ✅ Appointment endpoints
- ✅ Walk-in endpoints
- ✅ Bill endpoints
- ✅ Address endpoints
- ✅ Cart endpoints
- ✅ Admin endpoints
- ✅ Statistics endpoints
- ✅ Upload endpoints

---

### **17. Database Models**

#### **Data Models**
- ✅ User model with roles and employee details
- ✅ Product model with stock management
- ✅ Order model with order items
- ✅ Appointment model with status tracking
- ✅ Walkin model with services/products/seats
- ✅ Bill model with services/products
- ✅ Category and Subcategory models
- ✅ Service model
- ✅ Room model
- ✅ Branch and BranchType models
- ✅ Seat model
- ✅ Cart model
- ✅ EmployeeRole model
- ✅ Availability model

---

### **18. Utilities & Helpers**

#### **Utility Functions**
- ✅ PDF generation (appointments, bills, walk-ins)
- ✅ QR code generation
- ✅ Email templates
- ✅ Address geocoding
- ✅ Logger (Winston)
- ✅ Error handling (AppError)
- ✅ Appointment to Bill converter
- ✅ Price calculator for walk-ins

---

## 🔄 Data Flow

1. **User Registration/Login** → JWT Token → Stored in localStorage → AuthContext
2. **Appointment Booking** → Service Selection → Date/Time → Employee → Payment → Confirmation
3. **Walk-in Booking** → Customer Info → Services/Products → Payment → Invoice Generation
4. **Product Order** → Cart → Checkout → Address → Payment → Order Creation
5. **Bill Generation** → Customer Info → Services/Products → Calculation → PDF Generation

---

## 🔐 Security Features

- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- Role-based access control
- Protected routes
- Email verification
- Token expiration

---

## 📊 Key Statistics

- **Total Models**: 17
- **Total Controllers**: 17
- **Total Routes**: 20+
- **Total Pages**: 50+
- **Total Components**: 30+
- **Authentication Methods**: 2 (Email/Password, Google OAuth)
- **Payment Methods**: 2 (Razorpay, Cash)
- **User Roles**: 3 main roles + 3 employee sub-roles
- **Document Generation**: PDFs for Bills, Appointments, Walk-ins
- **QR Code Support**: Yes

---

## 🚀 Deployment

- **Frontend**: Built with Vite, served from `/dist`
- **Backend**: Express server with static file serving
- **Database**: MongoDB (cloud/hosted)
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Payment**: Razorpay
- **Caching**: Redis (configured)
- **Logging**: Winston + Morgan

---

This is a comprehensive salon/spa management system with appointment booking, walk-in management, e-commerce, billing, and administrative features.
