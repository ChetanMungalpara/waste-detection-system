import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
  try {
    // 1. Extract credentials (identifier can be email or lpuUid)
    const { identifier, password } = await req.json(); 

    if (!identifier || !password) {
      return NextResponse.json({ message: 'Please provide your LPU UID/Email and password.' }, { status: 400 });
    }

    // 2. Connect to MongoDB
    await connectToDatabase();

    // 3. Find the user by either email or lpuUid
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { lpuUid: identifier }] 
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials. User not found.' }, { status: 401 });
    }

    // 4. Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials. Incorrect password.' }, { status: 401 });
    }

    // 5. Create a JWT Token to keep the user logged in
    const token = jwt.sign(
      { userId: user._id, lpuUid: user.lpuUid },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // 6. Return success with token and user data (excluding password)
    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        name: user.name,
        email: user.email,
        lpuUid: user.lpuUid,
        points: user.points,
        history: user.history
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}