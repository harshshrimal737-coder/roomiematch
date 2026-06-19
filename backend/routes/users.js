import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, age, gender, college, city, bio, questionnaire } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (college) user.college = college;
    if (city) user.city = city;
    if (bio) user.bio = bio;
    if (questionnaire) user.questionnaire = { ...user.questionnaire, ...questionnaire };

    // Check if profile is complete
    const q = user.questionnaire;
    if (user.age && user.gender && user.city && q?.sleepTime && q?.cleanliness && q?.budget) {
      user.isProfileComplete = true;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/matches - Get AI matched users
router.get('/matches', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser.isProfileComplete) {
      return res.status(400).json({ error: 'Complete your profile first' });
    }

    // Get all users except self
    const allUsers = await User.find({
      _id: { $ne: req.user._id },
      isProfileComplete: true,
      city: currentUser.city, // same city filter
    }).select('-password');

    // Calculate compatibility score for each user
    const usersWithScores = allUsers.map(user => {
      const score = calculateCompatibility(currentUser, user);
      return { ...user.toObject(), compatibilityScore: score };
    });

    // Sort by score descending
    usersWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json(usersWithScores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/explore - Get all users (no city filter)
router.get('/explore', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const { city } = req.query;

    const filter = {
      _id: { $ne: req.user._id },
      isProfileComplete: true,
    };
    if (city) filter.city = city;

    const allUsers = await User.find(filter).select('-password');

    const usersWithScores = allUsers.map(user => {
      const score = currentUser.isProfileComplete
        ? calculateCompatibility(currentUser, user)
        : 0;
      return { ...user.toObject(), compatibilityScore: score };
    });

    usersWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    res.json(usersWithScores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/like/:id
router.post('/like/:id', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Add to liked
    if (!currentUser.likedUsers.includes(req.params.id)) {
      currentUser.likedUsers.push(req.params.id);
    }

    // Check if mutual like (match!)
    let isMatch = false;
    if (targetUser.likedUsers.includes(req.user._id.toString())) {
      if (!currentUser.matches.includes(req.params.id)) {
        currentUser.matches.push(req.params.id);
        targetUser.matches.push(req.user._id);
        await targetUser.save();
        isMatch = true;
      }
    }

    await currentUser.save();
    res.json({ success: true, isMatch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/my-matches
router.get('/my-matches', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('matches', '-password');
    res.json(user.matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compatibility scoring algorithm
function calculateCompatibility(user1, user2) {
  const q1 = user1.questionnaire || {};
  const q2 = user2.questionnaire || {};
  let score = 0;
  let total = 0;

  // Sleep time (20 pts)
  if (q1.sleepTime && q2.sleepTime) {
    total += 20;
    if (q1.sleepTime === q2.sleepTime) score += 20;
    else if (q1.sleepTime === 'flexible' || q2.sleepTime === 'flexible') score += 10;
  }

  // Cleanliness (20 pts)
  if (q1.cleanliness && q2.cleanliness) {
    total += 20;
    const diff = Math.abs(q1.cleanliness - q2.cleanliness);
    score += Math.max(0, 20 - diff * 5);
  }

  // Noise tolerance (15 pts)
  if (q1.noiseTolerance && q2.noiseTolerance) {
    total += 15;
    if (q1.noiseTolerance === q2.noiseTolerance) score += 15;
    else if (q1.noiseTolerance === 'moderate' || q2.noiseTolerance === 'moderate') score += 7;
  }

  // Guests policy (10 pts)
  if (q1.guestsPolicy && q2.guestsPolicy) {
    total += 10;
    if (q1.guestsPolicy === q2.guestsPolicy) score += 10;
  }

  // Smoking (15 pts)
  if (q1.smokingPolicy && q2.smokingPolicy) {
    total += 15;
    if (q1.smokingPolicy === q2.smokingPolicy) score += 15;
    else if (q1.smokingPolicy === 'no' && q2.smokingPolicy !== 'yes') score += 5;
  }

  // Budget (10 pts)
  if (q1.budget && q2.budget) {
    total += 10;
    if (q1.budget === q2.budget) score += 10;
  }

  // Personality (10 pts)
  if (q1.personality && q2.personality) {
    total += 10;
    if (q1.personality === q2.personality) score += 10;
    else if (q1.personality === 'ambivert' || q2.personality === 'ambivert') score += 5;
  }

  return total > 0 ? Math.round((score / total) * 100) : 50;
}

export default router;