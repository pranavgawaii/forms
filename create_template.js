
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const userId = 'a1c8e2d8-892c-45e8-a450-3be473c1b3fb';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTemplate() {
  console.log('Creating template for Student Placement Co-ordinator applications...');

  const { data: form, error: formError } = await supabase
    .from('forms')
    .insert({
      owner_id: userId,
      title: 'Student Placement Co-ordinator Application 2026',
      description: 'Template for selecting student representatives for the placement cell.',
      slug: 'placement-coordinator-app-' + Math.random().toString(36).slice(2, 6),
      status: 'draft',
      is_public: true,
      theme: {
        primaryColor: '#2563eb', // Blue
        backgroundColor: '#f8fafc'
      }
    })
    .select()
    .single();

  if (formError) {
    console.error('Error creating form:', formError);
    return;
  }

  const fields = [
    { label: 'Full Name', field_type: 'short_text', required: true, sort_order: 1 },
    { label: 'Roll Number / PRN', field_type: 'short_text', required: true, sort_order: 2 },
    { 
      label: 'Department/Branch', 
      field_type: 'select', 
      required: true, 
      sort_order: 3,
      options: ['CSE', 'IT', 'ECE', 'ME', 'CE', 'Aero', 'Design']
    },
    { 
      label: 'Current Year of Study', 
      field_type: 'select', 
      required: true, 
      sort_order: 4,
      options: ['2nd Year', '3rd Year']
    },
    { label: 'Current CGPA', field_type: 'number', required: true, sort_order: 5 },
    { 
      label: 'Why do you want to join the Placement Cell?', 
      field_type: 'long_text', 
      required: true, 
      sort_order: 6,
      help_text: 'Describe your motivation and what you aim to achieve.'
    },
    { 
      label: 'Relevant Experience', 
      field_type: 'long_text', 
      required: false, 
      sort_order: 7,
      help_text: 'Any previous leadership roles or event management experience.'
    },
    { label: 'Resume Link (Google Drive/GitHub)', field_type: 'short_text', required: true, sort_order: 8 },
    { label: 'WhatsApp Number', field_type: 'number', required: true, sort_order: 9 }
  ];

  const { error: fieldsError } = await supabase
    .from('form_fields')
    .insert(
      fields.map(f => ({
        ...f,
        form_id: form.id,
        options: f.options ? { choices: f.options } : null
      }))
    );

  if (fieldsError) {
    console.error('Error creating fields:', fieldsError);
  } else {
    console.log('Template created successfully!');
    console.log(`Form ID: ${form.id}`);
  }
}

createTemplate();
