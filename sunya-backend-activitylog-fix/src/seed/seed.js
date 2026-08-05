import mongoose from "mongoose";
import { env } from "../config/env.js";
import { User } from "../models/User.model.js";
import { Settings } from "../models/Settings.model.js";
import { Attendance } from "../models/Attendance.model.js";
import { ROLES, ATTENDANCE_STATUS } from "../utils/constants.js";
import { logger } from "../utils/logger.js";
import { getStartOfDay } from "../services/attendance.service.js";

const sampleUsers = [
  {
    name: "Sunya Super Admin",
    email: "superadmin@sunya.com.np",
    password: "SuperAdmin@123",
    role: ROLES.SUPER_ADMIN,
    department: "Management",
    designation: "Founder / CEO",
    phone: "9800000001",
    joiningDate: new Date("2021-01-10"),
    isEmailVerified: true,
  },
  {
    name: "Aayush Sharma",
    email: "admin@sunya.com.np",
    password: "Admin@123",
    role: ROLES.ADMIN,
    department: "Operations",
    designation: "Operations Admin",
    phone: "9800000002",
    joiningDate: new Date("2021-06-15"),
    isEmailVerified: true,
  },
  {
    name: "Prabin Gurung",
    email: "manager@sunya.com.np",
    password: "Manager@123",
    role: ROLES.MANAGER,
    department: "Design",
    designation: "Creative Manager",
    phone: "9800000003",
    joiningDate: new Date("2022-02-01"),
    isEmailVerified: true,
  },
  {
    name: "Sabina Thapa",
    email: "sabina@sunya.com.np",
    password: "Employee@123",
    role: ROLES.EMPLOYEE,
    department: "Design",
    designation: "UI/UX Designer",
    phone: "9800000004",
    joiningDate: new Date("2023-03-10"),
    isEmailVerified: true,
  },
  {
    name: "Nischal Koirala",
    email: "nischal@sunya.com.np",
    password: "Employee@123",
    role: ROLES.EMPLOYEE,
    department: "Engineering",
    designation: "Full Stack Developer",
    phone: "9800000005",
    joiningDate: new Date("2023-07-01"),
    isEmailVerified: true,
  },
  {
    name: "Kriti Adhikari",
    email: "kriti@sunya.com.np",
    password: "Employee@123",
    role: ROLES.EMPLOYEE,
    department: "Marketing",
    designation: "Social Media Executive",
    phone: "9800000006",
    joiningDate: new Date("2023-09-20"),
    isEmailVerified: true,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info("Connected to MongoDB for seeding");

    await Promise.all([User.deleteMany({}), Attendance.deleteMany({}), Settings.deleteMany({})]);
    logger.info("Cleared existing users, attendance, and settings");

    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    logger.info(`Created ${createdUsers.length} sample users`);

    await Settings.create({
      officeStartTime: "09:30",
      officeEndTime: "17:30",
      minWorkingHours: 8,
      gracePeriodMinutes: 15,
      halfDayThresholdHours: 4,
    });
    logger.info("Created default office settings");

    // Seed today's attendance for employees (mix of present/late/remote)
    const today = getStartOfDay();
    const employees = createdUsers.filter((u) => u.role === ROLES.EMPLOYEE);

    const attendanceSeeds = [
      {
        user: employees[0]._id,
        date: today,
        clockIn: new Date(new Date().setHours(9, 20, 0, 0)),
        status: ATTENDANCE_STATUS.PRESENT,
      },
      {
        user: employees[1]._id,
        date: today,
        clockIn: new Date(new Date().setHours(10, 5, 0, 0)),
        status: ATTENDANCE_STATUS.LATE,
      },
      {
        user: employees[2]._id,
        date: today,
        clockIn: new Date(new Date().setHours(9, 0, 0, 0)),
        isRemote: true,
        status: ATTENDANCE_STATUS.REMOTE,
      },
    ];

    await Attendance.insertMany(attendanceSeeds);
    logger.info("Seeded sample attendance records for today");

    logger.info("Seeding completed successfully");
    logger.info("Sample login credentials:");
    sampleUsers.forEach((u) => logger.info(`  ${u.role}: ${u.email} / ${u.password}`));

    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seed();
