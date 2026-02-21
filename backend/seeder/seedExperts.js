import mongoose from "mongoose";
import dotenv from "dotenv";
import Expert from "../models/Expert.js";
import connectDB from "../config/db.js";

dotenv.config();
await connectDB();

const experts = [
    // TECHNOLOGY
    {
        name: "Arjun Rao",
        category: "Technology",
        experience: 9,
        rating: 4.8,
        bio: "Senior full-stack developer specializing in scalable web applications.",
        availableSlots: [
            { date: new Date("2026-02-22"), slots: ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "03:00 PM"] },
            { date: new Date("2026-02-23"), slots: ["10:30 AM", "12:00 PM", "02:00 PM", "04:00 PM", "05:30 PM"] },
            { date: new Date("2026-02-24"), slots: ["09:00 AM", "11:30 AM", "01:30 PM", "04:00 PM"] },
            { date: new Date("2026-02-26"), slots: ["10:00 AM", "02:00 PM", "04:30 PM"] }
        ]
    },
    {
        name: "Sneha Kapoor",
        category: "Technology",
        experience: 6,
        rating: 4.6,
        bio: "Cloud engineer with expertise in AWS and distributed systems.",
        availableSlots: [
            { date: new Date("2026-02-24"), slots: ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "04:00 PM"] },
            { date: new Date("2026-02-25"), slots: ["10:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"] },
            { date: new Date("2026-02-27"), slots: ["08:30 AM", "11:00 AM", "02:30 PM", "04:00 PM"] }
        ]
    },

    // MARKETING
    {
        name: "Rohan Malhotra",
        category: "Marketing",
        experience: 7,
        rating: 4.7,
        bio: "Digital marketing strategist focused on performance campaigns.",
        availableSlots: [
            { date: new Date("2026-02-22"), slots: ["10:00 AM", "11:30 AM", "01:00 PM", "03:00 PM", "05:00 PM"] },
            { date: new Date("2026-02-24"), slots: ["09:30 AM", "12:00 PM", "02:00 PM", "04:30 PM"] },
            { date: new Date("2026-02-25"), slots: ["10:30 AM", "01:30 PM", "04:00 PM", "06:00 PM"] },
            { date: new Date("2026-02-28"), slots: ["11:00 AM", "02:00 PM", "05:00 PM"] }
        ]
    },
    {
        name: "Meera Iyer",
        category: "Marketing",
        experience: 5,
        rating: 4.5,
        bio: "Brand consultant helping startups scale through storytelling.",
        availableSlots: [
            { date: new Date("2026-02-23"), slots: ["09:00 AM", "10:00 AM", "12:30 PM", "03:00 PM", "04:30 PM"] },
            { date: new Date("2026-02-24"), slots: ["11:00 AM", "01:00 PM", "03:30 PM", "05:00 PM"] },
            { date: new Date("2026-02-26"), slots: ["10:00 AM", "12:00 PM", "02:30 PM", "04:00 PM"] },
            { date: new Date("2026-03-01"), slots: ["09:30 AM", "11:30 AM", "02:00 PM"] }
        ]
    },

    // FINANCE
    {
        name: "Vikram Desai",
        category: "Finance",
        experience: 12,
        rating: 4.9,
        bio: "Investment advisor and wealth management specialist.",
        availableSlots: [
            { date: new Date("2026-02-23"), slots: ["09:30 AM", "11:00 AM", "01:00 PM", "03:00 PM"] },
            { date: new Date("2026-02-25"), slots: ["10:00 AM", "11:00 AM", "12:30 PM", "02:00 PM", "04:00 PM"] },
            { date: new Date("2026-02-27"), slots: ["09:00 AM", "11:30 AM", "02:30 PM", "04:30 PM"] },
            { date: new Date("2026-03-02"), slots: ["10:00 AM", "01:00 PM", "03:30 PM"] }
        ]
    },
    {
        name: "Anjali Shah",
        category: "Finance",
        experience: 8,
        rating: 4.6,
        bio: "Chartered accountant with expertise in tax planning.",
        availableSlots: [
            { date: new Date("2026-02-24"), slots: ["09:00 AM", "10:30 AM", "12:00 PM", "01:00 PM", "03:00 PM"] },
            { date: new Date("2026-02-26"), slots: ["09:30 AM", "11:00 AM", "02:00 PM", "04:00 PM"] },
            { date: new Date("2026-02-28"), slots: ["10:00 AM", "12:30 PM", "03:30 PM", "05:00 PM"] }
        ]
    },

    // DESIGN
    {
        name: "Kabir Mehta",
        category: "Design",
        experience: 6,
        rating: 4.7,
        bio: "UI/UX designer creating user-centered digital experiences.",
        availableSlots: [
            { date: new Date("2026-02-22"), slots: ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"] },
            { date: new Date("2026-02-23"), slots: ["10:30 AM", "01:00 PM", "03:00 PM", "05:00 PM"] },
            { date: new Date("2026-02-25"), slots: ["09:30 AM", "12:00 PM", "02:30 PM", "04:30 PM"] },
            { date: new Date("2026-02-27"), slots: ["11:00 AM", "01:30 PM", "04:00 PM"] }
        ]
    },
    {
        name: "Pooja Nair",
        category: "Design",
        experience: 4,
        rating: 4.4,
        bio: "Graphic designer specializing in branding and identity.",
        availableSlots: [
            { date: new Date("2026-02-24"), slots: ["10:00 AM", "11:30 AM", "01:00 PM", "03:30 PM"] },
            { date: new Date("2026-02-26"), slots: ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "03:00 PM"] },
            { date: new Date("2026-02-28"), slots: ["11:00 AM", "01:30 PM", "04:00 PM", "05:30 PM"] },
            { date: new Date("2026-03-01"), slots: ["10:30 AM", "02:00 PM", "04:30 PM"] }
        ]
    },

    // HEALTH
    {
        name: "Dr. Neha Gupta",
        category: "Health",
        experience: 10,
        rating: 4.9,
        bio: "Certified nutritionist and wellness coach.",
        availableSlots: [
            { date: new Date("2026-02-23"), slots: ["08:00 AM", "09:30 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"] },
            { date: new Date("2026-02-24"), slots: ["08:30 AM", "10:00 AM", "12:30 PM", "03:00 PM", "05:00 PM"] },
            { date: new Date("2026-02-26"), slots: ["09:00 AM", "11:30 AM", "01:30 PM", "04:30 PM"] },
            { date: new Date("2026-03-02"), slots: ["08:00 AM", "10:30 AM", "02:00 PM"] }
        ]
    },
    {
        name: "Rahul Bansal",
        category: "Health",
        experience: 7,
        rating: 4.6,
        bio: "Fitness trainer and strength conditioning expert.",
        availableSlots: [
            { date: new Date("2026-02-22"), slots: ["06:00 AM", "08:00 AM", "10:00 AM", "04:00 PM", "06:00 PM"] },
            { date: new Date("2026-02-25"), slots: ["07:00 AM", "09:00 AM", "11:30 AM", "03:00 PM", "05:00 PM"] },
            { date: new Date("2026-02-27"), slots: ["06:30 AM", "08:30 AM", "12:00 PM", "04:30 PM"] },
            { date: new Date("2026-03-01"), slots: ["07:00 AM", "09:30 AM", "05:00 PM"] }
        ]
    },

    // LEGAL
    {
        name: "Adv. Priyanka Verma",
        category: "Legal",
        experience: 11,
        rating: 4.8,
        bio: "Corporate lawyer with experience in startup compliance.",
        availableSlots: [
            { date: new Date("2026-02-24"), slots: ["09:30 AM", "11:00 AM", "01:30 PM", "03:00 PM", "05:00 PM"] },
            { date: new Date("2026-02-25"), slots: ["10:00 AM", "12:00 PM", "02:30 PM", "04:00 PM"] },
            { date: new Date("2026-02-27"), slots: ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"] }
        ]
    },
    {
        name: "Aman Khurana",
        category: "Legal",
        experience: 9,
        rating: 4.5,
        bio: "Legal consultant specializing in intellectual property.",
        availableSlots: [
            { date: new Date("2026-02-23"), slots: ["10:00 AM", "11:30 AM", "01:00 PM", "03:00 PM"] },
            { date: new Date("2026-02-26"), slots: ["09:30 AM", "11:00 AM", "02:00 PM", "03:30 PM", "05:00 PM"] },
            { date: new Date("2026-02-28"), slots: ["10:30 AM", "01:00 PM", "04:00 PM"] },
            { date: new Date("2026-03-03"), slots: ["11:00 AM", "02:30 PM", "04:30 PM"] }
        ]
    },

    // EDUCATION
    {
        name: "Shalini Tripathi",
        category: "Education",
        experience: 13,
        rating: 4.9,
        bio: "Career counselor and academic mentor.",
        availableSlots: [
            { date: new Date("2026-02-22"), slots: ["09:00 AM", "10:30 AM", "12:00 PM", "01:00 PM", "03:00 PM"] },
            { date: new Date("2026-02-24"), slots: ["09:30 AM", "11:00 AM", "02:00 PM", "04:00 PM"] },
            { date: new Date("2026-02-25"), slots: ["10:00 AM", "12:30 PM", "03:30 PM", "05:00 PM"] },
            { date: new Date("2026-02-27"), slots: ["09:00 AM", "11:30 AM", "02:30 PM"] }
        ]
    },
    {
        name: "Manish Tandon",
        category: "Education",
        experience: 8,
        rating: 4.6,
        bio: "STEM educator and curriculum advisor.",
        availableSlots: [
            { date: new Date("2026-02-23"), slots: ["09:00 AM", "10:30 AM", "01:00 PM", "03:00 PM"] },
            { date: new Date("2026-02-25"), slots: ["10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM", "05:30 PM"] },
            { date: new Date("2026-02-26"), slots: ["09:30 AM", "12:00 PM", "02:30 PM", "04:30 PM"] },
            { date: new Date("2026-03-01"), slots: ["10:00 AM", "01:30 PM", "04:00 PM"] }
        ]
    },

    // BUSINESS
    {
        name: "Karan Oberoi",
        category: "Business",
        experience: 15,
        rating: 4.9,
        bio: "Startup mentor and growth strategist.",
        availableSlots: [
            { date: new Date("2026-02-23"), slots: ["09:30 AM", "11:00 AM", "12:00 PM", "02:30 PM", "05:00 PM"] },
            { date: new Date("2026-02-25"), slots: ["10:00 AM", "12:30 PM", "03:00 PM", "04:30 PM"] },
            { date: new Date("2026-02-27"), slots: ["09:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"] },
            { date: new Date("2026-03-02"), slots: ["10:30 AM", "01:00 PM", "03:30 PM"] }
        ]
    },
    {
        name: "Ishita Mehra",
        category: "Business",
        experience: 9,
        rating: 4.7,
        bio: "Business operations consultant for scaling companies.",
        availableSlots: [
            { date: new Date("2026-02-24"), slots: ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "04:00 PM"] },
            { date: new Date("2026-02-26"), slots: ["09:30 AM", "11:00 AM", "01:30 PM", "03:00 PM", "05:00 PM"] },
            { date: new Date("2026-02-28"), slots: ["10:00 AM", "12:30 PM", "03:00 PM", "04:30 PM"] },
            { date: new Date("2026-03-03"), slots: ["09:00 AM", "11:30 AM", "02:00 PM"] }
        ]
    }
];

const seedData = async () => {
    try {
        await Expert.deleteMany();
        await Expert.insertMany(experts);
        console.log("✅ Experts Seeded Successfully");
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();