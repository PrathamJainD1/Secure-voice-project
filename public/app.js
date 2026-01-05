async function submitReport(formEl){
  const category = formEl.querySelector('#category').value;
  const title = formEl.querySelector('#title').value.trim();
  const description = formEl.querySelector('#description').value.trim();
  const incidentDate = formEl.querySelector('#date')?.value; // renamed from 'date'
  const location = formEl.querySelector('#location')?.value?.trim() || 'Not provided'; // NEW
  const isAnonymous = formEl.querySelector('#anonymous')?.checked;
  const name = formEl.querySelector('#name')?.value?.trim(); // NEW
  const email = formEl.querySelector('#email')?.value?.trim(); // NEW
  const phone = formEl.querySelector('#phone')?.value?.trim(); // NEW
  const files = formEl.querySelector('#evidence')?.files;
  const msgEl = formEl.querySelector('#formMsg');

  // Validation
  if(!category || !title || !description || !incidentDate || !location){ 
    msgEl.textContent = 'Please fill all required fields'; 
    return; 
  }
  
  msgEl.textContent = 'Submitting...';

  try {
    const fd = new FormData();
    fd.append('category', category);
    fd.append('title', title);
    fd.append('description', description);
    fd.append('incidentDate', incidentDate); // Changed from 'date'
    fd.append('location', location); // NEW
    fd.append('isAnonymous', isAnonymous ? 'true' : 'false');
    
    // Add optional contact info (only if not anonymous)
    if(!isAnonymous){
      if(name) fd.append('name', name);
      if(email) fd.append('email', email);
      if(phone) fd.append('phone', phone);
    }
    
    // Add files
    if(files && files.length){
      for(let i=0; i<files.length; i++){
        fd.append('evidenceFiles', files[i]); // Changed from 'files' to 'evidenceFiles'
      }
    }
    
    const res = await fetch(`${API_BASE}/reports`, { 
      method:'POST', 
      body: fd 
    });
    
    const data = await res.json();
    
    if(!res.ok){ 
      msgEl.textContent = data.message || 'Server error'; 
      console.error('Server response:', data);
      return; 
    }
    
    msgEl.textContent = `✅ Report submitted! Case ID: ${data.caseId}`;
    formEl.reset();
    
    setTimeout(() => {
      loadReports('#reportsContainer');
    }, 1000);
    
  } catch(err){ 
    console.error('Submit error:', err); 
    msgEl.textContent = 'Network error'; 
  }
}