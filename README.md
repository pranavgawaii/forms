# PlacePro — MIT ADT University (CN-CRTP)

**PlacePro** is a premium, high-performance form builder and response management system tailored for the **CN-CRTP** department at **MIT ADT University**. Designed with a focus on minimalist aesthetics and academic professionalism, it provides a seamless experience for administrators to create, manage, and analyze campus-wide forms.

---

## ✨ Key Features

### 🛠️ Advanced Form Builder
- **Strict One-Line Inputs**: Intellectual scaling ensures that standard data (Names, Enrollments, Emails) resides in strictly single-line cards for a compact, professional look.
- **Dynamic Field Support**: Easily add short text, long paragraphs, email validation, numbers, and multiple-choice selections.
- **Instant Live Preview**: A real-time, high-fidelity preview that perfectly mirrors the respondent's view, including theme-sync and branding.

### 🎨 Premium Design System
- **Professional Light Themes**: Curated selection of academic-friendly light themes, including **Soft Lavender (Purple)**, **Sky Blue**, and **Mint Green**.
- **Symmetrical Branding**: Balanced, centered title layouts and minimalist text-based headers for a clutter-free experience.
- **Micro-Animations**: Smooth transitions and fade-ins that provide a refined, state-of-the-art feel.

### 🔐 Secure & Simplified Auth
- **Direct Login Entry**: Bypasses generic landing pages to put administrators straight into the secure portal.
- **Access Control**: Registration is disabled to maintain a secure, private environment for authorised CN-CRTP staff.
- **Password Transparency**: Integrated show/hide toggle for a modern, user-friendly authentication experience.

### 📊 Real-Time Management
- **Responses Dashboard**: Track submissions in real-time with streamlined tables and detailed view options.
- **CSV Export**: Export all response data instantly for further analysis.
- **Deadline Control**: Set precise submission deadlines to automate form availability.

---

## 🚀 Tech Stack

- **Frontend**: React (TypeScript), Vite, Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel
- **Aesthetics**: Lucide Icons, Outfit Typography, Custom Glassmorphism

---

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pranavgawaii/forms.git
   cd forms
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

---

## 📝 License

Designed and maintained by **Pranav Gawai** for **MIT ADT University (CN-CRTP)**.
