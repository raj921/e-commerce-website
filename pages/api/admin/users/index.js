import User from "@/models/User";
import db from "@/utils/db";
import bcryptjs from "bcryptjs";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const { name, email, password } = req.body;

  if (
    !name ||
    !email ||
    !email.includes("@") ||
    !password ||
    password.trim().length < 5
  ) {
    res.status(422).json({ message: "Validation error" });
    return;
  }

  try {
    await db.connect();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(422).json({ message: "User exists already" });
      await db.disconnect();
      return;
    }

    const hashedPassword = bcryptjs.hashSync(password);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
    });

    const user = await newUser.save();
    await db.disconnect();

    res.status(201).send({
      message: "Created user",
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    await db.disconnect();
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;
