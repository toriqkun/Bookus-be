import { PrismaClient } from "@prisma/client";
import { Role, BookingStatus } from "../enum";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.create({
    data: {
      email: "bookus@library.com",
      password: hashedPassword,
      name: "Central Library",
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "madara@gmail.com",
      password: hashedPassword,
      name: "Madara Uchiha",
      role: Role.USER,
    },
  });

  await prisma.service.createMany({
    data: [
      {
        providerId: admin.id,
        title: "Bulan",
        author: "Tere Liye",
        isbn: "9786020314112",
        description:
          "Petualangan Raib, Seli, dan Ali ke Klan Matahari yang penuh bahaya.",
        coverUrl: "/uploads/book/bulan.jpeg",
        durationDays: 7,
        price: 0,
        copies: 3,
      },
      {
        providerId: admin.id,
        title: "Laskar Pelangi",
        author: "Andrea Hirata",
        isbn: "9789793062797",
        description:
          "Kisah inspiratif anak-anak Belitung yang penuh perjuangan dalam pendidikan.",
        coverUrl: "/uploads/book/laskar-pelangi.jpg",
        durationDays: 10,
        price: 0,
        copies: 5,
      },
      {
        providerId: admin.id,
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "9780132350884",
        description:
          "Panduan menulis kode yang bersih, rapi, dan maintainable.",
        coverUrl: "/uploads/book/cleancode.jpg",
        durationDays: 14,
        price: 0,
        copies: 2,
      },
    ],
  });

  const book = await prisma.service.findFirst({
    where: { title: "Bulan" },
  });

  if (book) {
    const slot = await prisma.slot.create({
      data: {
        serviceId: book.id,
        startTime: new Date("2025-10-05T09:00:00.000Z"),
        endTime: new Date("2025-10-12T09:00:00.000Z"),
      },
    });

    await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: book.id,
        slotId: slot.id,
        status: BookingStatus.PENDING,
      },
    });
  }

  console.log("✅ Seeder selesai, data awal masuk ke database.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
