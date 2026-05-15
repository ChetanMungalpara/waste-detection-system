import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
  try {
    const { userId, itemDetected, category, points } = await req.json();

    if (!userId || !itemDetected || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Find the user by their MongoDB ID
    let user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add points and push the new item to the top of their history
    user.points += points;
    user.history.unshift({
      itemDetected,
      category,
      pointsEarned: points,
      date: new Date()
    });

    // Keep history trimmed to the last 20 items to save space
    if (user.history.length > 20) {
      user.history.pop();
    }

    await user.save();

    return NextResponse.json({ 
      message: 'Points added successfully', 
      totalPoints: user.points,
      history: user.history
    }, { status: 200 });

  } catch (error) {
    console.error('Points Error:', error);
    return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
  }
}