const express = require('express');

const router = express.Router();

// Get Resources (public endpoint)
router.get('/', async (req, res) => {
  try {
    // You can store resources in MongoDB or return static data
    const resources = [
      {
        id: 1,
        title: 'National Harassment Hotline',
        description: 'Available 24/7 for immediate support',
        contact: '1-800-XXX-XXXX',
        type: 'hotline'
      },
      {
        id: 2,
        title: 'Legal Aid Services',
        description: 'Free legal consultation and support',
        contact: 'legal@example.com',
        website: 'https://example.com',
        type: 'legal'
      },
      {
        id: 3,
        title: 'Counseling Services',
        description: 'Professional mental health support',
        contact: '1-800-YYY-YYYY',
        type: 'counseling'
      },
      {
        id: 4,
        title: 'Online Support Community',
        description: 'Connect with others who understand',
        website: 'https://support-community.example.com',
        type: 'community'
      }
    ];

    res.json({ resources });
  } catch (error) {
    console.error('Fetch resources error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

module.exports = router;
