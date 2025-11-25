const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (for MVP)
const users = {};
const scans = {};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// ============ AUTH ENDPOINTS ============

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { userName } = req.body;
  
  if (!userName) {
    return res.status(400).json({ error: 'User name required' });
  }
  
  const userId = `user-${Date.now()}`;
  users[userId] = { 
    name: userName, 
    createdAt: new Date() 
  };
  scans[userId] = [];
  
  res.json({ 
    userId, 
    name: userName, 
    success: true 
  });
});

// ============ X-RAY ANALYSIS ENDPOINTS ============

// Analyze X-ray (simulated Cobb angle detection)
app.post('/api/analyze-xray', (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }
  
  // Simulate Cobb angle detection (0-60 degrees)
  const cobbAngle = Math.round((Math.random() * 60) * 10) / 10;
  
  // Classify severity
  let severity;
  if (cobbAngle < 25) {
    severity = 'mild';
  } else if (cobbAngle < 40) {
    severity = 'moderate';
  } else {
    severity = 'severe';
  }
  
  const scanData = {
    date: new Date().toLocaleDateString(),
    angle: cobbAngle,
    severity: severity,
    timestamp: Date.now()
  };
  
  // Store scan
  if (!scans[userId]) {
    scans[userId] = [];
  }
  scans[userId].push(scanData);
  
  res.json({
    cobbAngle,
    severity,
    date: scanData.date,
    success: true
  });
});

// Get scan history
app.get('/api/scans/:userId', (req, res) => {
  const { userId } = req.params;
  
  if (!scans[userId]) {
    return res.json([]);
  }
  
  res.json(scans[userId]);
});

// ============ CHAT/RAG ENDPOINTS ============

// Medical knowledge base (RAG)
const knowledgeBase = {
  mild: {
    exercises: "Swimming and water aerobics 3-4x weekly, Pilates 2-3x weekly, Yoga daily, Stretching 15-20 min daily, Walking 30 min daily",
    precautions: "Regular monitoring every 6-12 months. Avoid heavy lifting and high-impact sports.",
    lifestyle: "Maintain good posture, ergonomic workspace setup, take movement breaks every hour",
    diet: "Ensure adequate calcium and Vitamin D. Include anti-inflammatory foods.",
    monitoring: "Track any pain or discomfort. Schedule follow-up X-rays annually."
  },
  moderate: {
    exercises: "Physical therapy 2x weekly, Core strengthening daily, Asymmetrical exercises 3x weekly, Gentle Pilates",
    precautions: "Consult orthopedist immediately. Bracing may be recommended. Avoid contact sports.",
    lifestyle: "Posture checks every 30 mins, proper sleeping position, controlled movements only",
    diet: "High in calcium, Vitamin D, and magnesium. Consult nutritionist.",
    monitoring: "Schedule X-rays every 6 months. Track symptoms closely."
  },
  severe: {
    exercises: "Physical therapy only as prescribed by specialist. Gentle stretching under supervision. Breathing exercises.",
    precautions: "URGENT: Surgical intervention may be necessary. Consult orthopedic surgeon immediately.",
    lifestyle: "Medical supervision required at all times. Avoid strenuous activities completely.",
    diet: "Balanced diet with adequate nutrients. Work with medical team.",
    monitoring: "Regular specialist consultations required. X-rays as recommended by doctor."
  }
};

// Chat endpoint with RAG
app.post('/api/chat', (req, res) => {
  const { query, severity, userName } = req.body;
  
  if (!query || !severity) {
    return res.status(400).json({ error: 'Query and severity required' });
  }
  
  const q = query.toLowerCase();
  const data = knowledgeBase[severity] || knowledgeBase.mild;
  
  let response = `Hi ${userName}! I'm here to help you manage your ${severity} scoliosis. What would you like to know?`;
  
  // Simple RAG - keyword matching to retrieve relevant info
  if (q.includes('exercise') || q.includes('workout') || q.includes('physical')) {
    response = `**Recommended Exercises for ${severity} scoliosis:**\n\n${data.exercises}\n\n⚠️ Always start slowly and consult a physical therapist before beginning any new routine.`;
  } 
  else if (q.includes('precaution') || q.includes('warning') || q.includes('avoid') || q.includes('should i')) {
    response = `**Important Precautions:**\n${data.precautions}\n\n**Lifestyle Tips:**\n${data.lifestyle}\n\nAlways listen to your body and seek professional medical advice.`;
  } 
  else if (q.includes('lifestyle') || q.includes('daily') || q.includes('posture') || q.includes('routine')) {
    response = `**Daily Lifestyle Recommendations:**\n${data.lifestyle}\n\n**Nutrition:**\n${data.diet}\n\n**Monitoring:**\n${data.monitoring}`;
  } 
  else if (q.includes('diet') || q.includes('nutrition') || q.includes('eat') || q.includes('food')) {
    response = `**Nutritional Guidance:**\n${data.diet}\n\nConsider consulting a nutritionist for a personalized meal plan.`;
  } 
  else if (q.includes('severity') || q.includes('angle') || q.includes('condition') || q.includes('status')) {
    response = `**Your Condition:**\nYou have ${severity} scoliosis.\n\n**Cobb Angle Classifications:**\n- Mild: < 25°\n- Moderate: 25-40°\n- Severe: > 40°\n\nRegular monitoring is crucial for your health.`;
  }
  
  res.json({ 
    response,
    success: true
  });
});

// ============ ROOT & ERROR HANDLING ============

app.get('/', (req, res) => {
  res.json({ 
    message: 'Scoliosis Backend API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/analyze-xray',
      'GET /api/scans/:userId',
      'POST /api/chat'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Scoliosis Backend running on port ${PORT}`);
});
