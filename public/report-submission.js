const reportForm = document.getElementById('reportForm');
const anonymousCheckbox = document.getElementById('anonymous');
const contactInfoSection = document.getElementById('contactInfo');

// ✅ Toggle contact info section based on anonymous checkbox
anonymousCheckbox.addEventListener('change', (e) => {
  if (e.target.checked) {
    // Anonymous - hide contact info
    contactInfoSection.style.display = 'none';
    // Clear contact fields
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
  } else {
    // Not anonymous - show contact info
    contactInfoSection.style.display = 'block';
  }
});

reportForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const category = document.getElementById('category').value;
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const incidentDate = document.getElementById('incident-date').value;
  const location = document.getElementById('location').value;
  const isAnonymous = document.getElementById('anonymous').checked;
  const files = document.getElementById('files').files;

  // ✅ Get contact info (only if not anonymous)
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;

  // ✅ Validate required fields
  if (!category || !title || !description || !incidentDate || !location) {
    alert('❌ Please fill in all required fields');
    return;
  }

  // ✅ Use correct backend field names
  const formData = new FormData();
  formData.append('category', category);
  formData.append('title', title);
  formData.append('description', description);
  formData.append('incidentDate', incidentDate);
  formData.append('location', location);
  formData.append('isAnonymous', isAnonymous);

  // ✅ Add contact info only if not anonymous
  if (!isAnonymous) {
    if (name) formData.append('name', name);
    if (email) formData.append('email', email);
    if (phone) formData.append('phone', phone);
  }

  // ✅ Use correct field name for Multer
  for (let i = 0; i < files.length; i++) {
    formData.append('evidenceFiles', files[i]);
  }

  // Show loading state
  const submitButton = reportForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = 'Submitting...';
  submitButton.disabled = true;

  try {
    const response = await fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    // ✅ Backend returns `caseId`, not `reportId`
    if (response.ok) {
      console.log('✅ Report submitted successfully:', result);
      
      // Hide the form
      reportForm.style.display = 'none';

      // Show success message with case ID
      const successMessage = document.getElementById('successMessage');
      const caseIdDisplay = document.getElementById('caseIdDisplay');
      caseIdDisplay.textContent = result.caseId;
      successMessage.style.display = 'block';

      // Scroll to success message
      successMessage.scrollIntoView({ behavior: 'smooth' });

      // Reset form for potential future use (though hidden)
      reportForm.reset();
    } else {
      console.error('❌ Server error:', result);
      alert(`❌ Failed to submit report: ${result.message || 'Unknown error'}`);
      
      // Reset button state
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  } catch (err) {
    console.error('❌ Error submitting report:', err);
    alert('❌ Network error. Please check your connection and try again.');
    
    // Reset button state
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
  }
});