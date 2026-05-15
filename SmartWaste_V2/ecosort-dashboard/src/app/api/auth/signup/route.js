import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
  try {
    // 1. Extract data from the request body
    const { name, email, lpuUid, password } = await req.json();

    if (!name || !email || !lpuUid || !password) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    // 2. Connect to MongoDB
    await connectToDatabase();

    // 3. Check if the user already exists (by email or LPU UID)
    const existingUser = await User.findOne({ $or: [{ email }, { lpuUid }] });
    if (existingUser) {
      return NextResponse.json({ message: 'A user with this email or LPU UID already exists.' }, { status: 409 });
    }

    // 4. Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create and save the new user
    const newUser = new User({
      name,
      email,
      lpuUid,
      password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json({ message: 'EcoSort profile created successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}