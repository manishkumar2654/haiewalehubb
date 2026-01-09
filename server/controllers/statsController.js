const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Service = require("../models/Service");
const Room = require("../models/Room");
const Branch = require("../models/Branch");

// Get all statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts in parallel for better performance
    const [
      totalUsers,
      totalEmployees,
      totalAppointments,
      totalOrders,
      totalProducts,
      totalServices,
      totalRooms,
      totalBranches,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "employee" }),
      Appointment.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Service.countDocuments(),
      Room.countDocuments(),
      Branch.countDocuments({ isActive: true }),
    ]);

    // Get today's date for daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get daily appointments
    const todayAppointments = await Appointment.countDocuments({
      appointmentDateTime: { $gte: today, $lt: tomorrow },
    });

    // Get appointment status breakdown
    const appointmentStatus = await Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get revenue statistics
    const revenueStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Get user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const growthRate =
      totalUsers > 0 ? Math.round((newUsersLast30Days / totalUsers) * 100) : 0;

    // Get room status breakdown
    const roomStatus = await Room.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get branch statistics
    const branchStats = await Branch.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: "$premium",
          count: { $sum: 1 },
        },
      },
    ]);

    const premiumBranches = branchStats.find((b) => b._id === true)?.count || 0;
    const standardBranches =
      branchStats.find((b) => b._id === false)?.count || 0;

    // Get recent appointments (last 10)
    const recentAppointments = await Appointment.find()
      .sort({ appointmentDateTime: -1 })
      .limit(10)
      .populate("userId", "name email")
      .populate("serviceId", "name");

    // Get appointment trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const appointmentTrend = await Appointment.aggregate([
      {
        $match: {
          appointmentDateTime: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$appointmentDateTime" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $limit: 7,
      },
    ]);

    // Calculate daily average appointments
    const avgDailyAppointments =
      appointmentTrend.length > 0
        ? Math.round(
            appointmentTrend.reduce((sum, day) => sum + day.count, 0) /
              appointmentTrend.length
          )
        : 0;

    // Get employee role breakdown
    const employeeRoles = await User.aggregate([
      {
        $match: { role: "employee" },
      },
      {
        $group: {
          _id: "$employeeRole",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get room type breakdown
    const roomTypes = await Room.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get product categories
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get service categories
    const serviceCategories = await Service.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: "$categoryData",
      },
      {
        $group: {
          _id: "$categoryData.name",
          count: { $sum: 1 },
        },
      },
    ]);

    // Response data
    const stats = {
      // Basic counts
      totalUsers,
      totalEmployees,
      totalAppointments,
      totalOrders,
      totalProducts,
      totalServices,
      totalRooms,
      totalBranches,

      // Financial
      revenue: revenueStats[0]?.totalRevenue || 0,
      avgOrderValue: revenueStats[0]?.avgOrderValue || 0,
      growthRate,

      // Daily stats
      todayAppointments,
      avgDailyAppointments,

      // Breakdowns
      appointmentStatus: appointmentStatus.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
      }, {}),

      roomStatus: roomStatus.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
      }, {}),

      branchTypes: {
        premium: premiumBranches,
        standard: standardBranches,
      },

      employeeRoles: employeeRoles.reduce((obj, item) => {
        obj[item._id || "Unassigned"] = item.count;
        return obj;
      }, {}),

      roomTypes: roomTypes.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
      }, {}),

      productCategories: productCategories.reduce((obj, item) => {
        obj[item._id || "Uncategorized"] = item.count;
        return obj;
      }, {}),

      serviceCategories: serviceCategories.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
      }, {}),

      // Trends
      appointmentTrend,
      newUsersLast30Days,

      // Recent activity
      recentAppointments: recentAppointments.map((apt) => ({
        id: apt._id,
        customer: apt.userId?.name || "Unknown",
        service: apt.serviceId?.name || "Unknown",
        date: apt.appointmentDateTime,
        status: apt.status,
      })),

      // Calculated metrics
      occupancyRate:
        totalRooms > 0
          ? Math.round(
              ((roomStatus.find((r) => r._id === "Booked")?.count || 0) /
                totalRooms) *
                100
            )
          : 0,

      conversionRate:
        totalUsers > 0 ? Math.round((totalOrders / totalUsers) * 100) : 0,
    };

    res.status(200).json({
      success: true,
      data: stats,
      message: "Dashboard statistics fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

// Get statistics by date range
exports.getStatsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get appointments in date range
    const appointments = await Appointment.find({
      appointmentDateTime: { $gte: start, $lte: end },
    });

    // Get orders in date range
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    });

    // Calculate revenue
    const revenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    // Get new users in date range
    const newUsers = await User.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    res.status(200).json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        totalAppointments: appointments.length,
        totalOrders: orders.length,
        revenue,
        newUsers,
        avgAppointmentsPerDay:
          appointments.length /
          Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))),
      },
      message: "Date range statistics fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching date range stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch date range statistics",
      error: error.message,
    });
  }
};

// Get branch-specific statistics
exports.getBranchStats = async (req, res) => {
  try {
    const { branchId } = req.params;

    // Get branch details
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Get rooms in this branch
    const rooms = await Room.find({ branch: branchId });

    // Get appointments for rooms in this branch
    const roomIds = rooms.map((room) => room._id);
    const appointments = await Appointment.find({
      roomId: { $in: roomIds },
    });

    // Get employees working at this branch
    const employees = await User.find({
      workingLocation: branch.name,
      role: "employee",
    });

    // Calculate room occupancy
    const availableRooms = rooms.filter((r) => r.status === "Available").length;
    const bookedRooms = rooms.filter((r) => r.status === "Booked").length;
    const maintenanceRooms = rooms.filter(
      (r) => r.status === "Maintenance"
    ).length;

    const stats = {
      branch: {
        id: branch._id,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        premium: branch.premium,
        isActive: branch.isActive,
      },
      rooms: {
        total: rooms.length,
        available: availableRooms,
        booked: bookedRooms,
        maintenance: maintenanceRooms,
        occupancyRate:
          rooms.length > 0 ? Math.round((bookedRooms / rooms.length) * 100) : 0,
      },
      appointments: {
        total: appointments.length,
        upcoming: appointments.filter(
          (a) => new Date(a.appointmentDateTime) > new Date()
        ).length,
        completed: appointments.filter((a) => a.status === "Completed").length,
        cancelled: appointments.filter((a) => a.status === "Cancelled").length,
      },
      employees: {
        total: employees.length,
        byRole: employees.reduce((acc, emp) => {
          const role = emp.employeeRole || "Unassigned";
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {}),
      },
      revenue: {
        // Calculate estimated revenue from appointments
        estimated: appointments.reduce(
          (sum, apt) => sum + (apt.totalPrice || 0),
          0
        ),
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
      message: "Branch statistics fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching branch stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch branch statistics",
      error: error.message,
    });
  }
};

// Get real-time statistics (for dashboard widgets)
exports.getRealTimeStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's stats
    const [
      todayAppointments,
      todayNewUsers,
      todayOrders,
      availableRooms,
      activeEmployees,
    ] = await Promise.all([
      Appointment.countDocuments({
        appointmentDateTime: { $gte: today, $lt: tomorrow },
      }),
      User.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
      }),
      Order.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
      }),
      Room.countDocuments({ status: "Available" }),
      User.countDocuments({
        role: "employee",
        status: "active",
      }),
    ]);

    // Get next 3 appointments
    const nextAppointments = await Appointment.find({
      appointmentDateTime: { $gte: new Date() },
      status: { $in: ["Confirmed", "Pending"] },
    })
      .sort({ appointmentDateTime: 1 })
      .limit(3)
      .populate("userId", "name")
      .populate("serviceId", "name");

    res.status(200).json({
      success: true,
      data: {
        today: {
          appointments: todayAppointments,
          newUsers: todayNewUsers,
          orders: todayOrders,
        },
        availability: {
          rooms: availableRooms,
          employees: activeEmployees,
        },
        upcomingAppointments: nextAppointments.map((apt) => ({
          id: apt._id,
          customer: apt.userId?.name || "Guest",
          service: apt.serviceId?.name || "Unknown",
          time: apt.appointmentDateTime,
          room: apt.roomId?.roomNumber || "TBD",
        })),
        timestamp: new Date(),
      },
      message: "Real-time statistics fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching real-time stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch real-time statistics",
      error: error.message,
    });
  }
};
