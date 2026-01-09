const express = require("express");
const router = express.Router();
const Service = require("../../models/Service");
const allowedWeekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
// Create
router.post("/", async (req, res, next) => {
  try {
    const {
      category,
      name,
      description,
      benefits,
      pricing,
      images,
      tags,
      isActive,
      weekdays,
      timeSlots,
    } = req.body;

    // Validate weekdays
    if (weekdays && weekdays.some((d) => !allowedWeekdays.includes(d))) {
      return res.status(400).json({ message: "Invalid weekdays provided" });
    }

    // Validate timeSlots format (basic HH:mm regex)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (timeSlots) {
      for (const slot of timeSlots) {
        if (!slot.startTime || !timeRegex.test(slot.startTime)) {
          return res.status(400).json({ message: "Invalid time slot format" });
        }
      }
    }
    let imgs = [];
    if (images && Array.isArray(images)) {
      imgs = images;
    } else if (req.files?.length) {
      imgs = req.files.map((f) => f.path);
    }
    const service = await Service.create({
      category,
      name,
      description,
      benefits,
      pricing,
      images,
      tags,
      isActive,
      weekdays,
      timeSlots,
    });

    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
});

// List (with filters)
router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.name) filter.name = { $regex: req.query.name, $options: "i" };
    const services = await Service.find(filter)
      .populate("category")
      .sort("name");
    res.json(services);
  } catch (err) {
    next(err);
  }
});

// Single
router.get("/:id", async (req, res, next) => {
  try {
    const svc = await Service.findById(req.params.id).populate("category");
    if (!svc) return res.status(404).json({ message: "Service not found" });
    res.json(svc);
  } catch (err) {
    next(err);
  }
});

// Update
router.put("/:id", async (req, res, next) => {
  try {
    const updateData = req.body;

    // Validate weekdays if present
    if (
      updateData.weekdays &&
      updateData.weekdays.some((d) => !allowedWeekdays.includes(d))
    ) {
      return res.status(400).json({ message: "Invalid weekdays provided" });
    }

    // Validate timeSlots if present
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (updateData.timeSlots) {
      for (const slot of updateData.timeSlots) {
        if (!slot.startTime || !timeRegex.test(slot.startTime)) {
          return res.status(400).json({ message: "Invalid time slot format" });
        }
      }
    }
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = updateData.images;
    } else if (req.files?.length) {
      updateData.images = req.files.map((f) => f.path);
    }
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedService)
      return res.status(404).json({ message: "Service not found" });

    res.json(updatedService);
  } catch (err) {
    next(err);
  }
});

// Delete
router.delete("/:id", async (req, res, next) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
