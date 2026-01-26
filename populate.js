const prisma = require("@prisma/client");
const dotenv = require("dotenv");
const fs = require("fs");

const cfg = dotenv.config();
const client = new prisma.PrismaClient();
const defaultSlides = [
  { name: "plannings", active: true, time: 10 },
  { name: "transport", active: true, time: 7 },
  { name: "menu", active: true, time: 10 },
  { name: "announcements", active: true, time: 7 },
  { name: "weather", active: true, time: 7 },
];
const defaultConfigs = [
  {key: "HPVersion", value:"2025.5.6"},
  {key: "HPIcals", value:"Undefined"},
  {key: "HPMode", value: "ROOM"}
]

function createRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#_!";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

let password = createRandomString(16);

console.log("THIS WILL ONLY BE DISPLAYED ONCE");
console.log("Username: admin");
console.log(`Password:${password}`);

client.$connect();

for (let line of defaultConfigs) {
  client.config.create({ data: line }).then().catch((e) => console.log(`Default config line skipped: ${line.key}`));
}

//Creating user
client.user.create({
  data:
      {
        username: "admin",
        password: await Bun.password.hash(password, {algorithm: "bcrypt", cost: 4}),
        role: ["ADMIN"],
      }
}).then(() => {
  console.log("THIS WILL ONLY BE DISPLAYED ONCE");
  console.log("Username: admin");
  console.log(`Password:${password}`);
}).catch(e => console.log("Skipped admin user creation."));

//Adding all default slides to database
for (let slide of defaultSlides) {
  client.slide.create({ data: slide }).then().catch(() => console.log(`Skipped setup for default slide ${slide.name}`));
}

client.$disconnect();
