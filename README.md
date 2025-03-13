# Portfolio - Roberto J. Vargas

<div align="center">
  <img src="https://raw.githubusercontent.com/RVSolutionsplus507/rvargas-portfolio-v2/main/src/assets/logorvs.webp" alt="RV Solutions Plus Logo" width="200"/>

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![i18next](https://img.shields.io/badge/i18next-26A69A?style=for-the-badge&logo=i18next&logoColor=white)](https://www.i18next.com/)

  [View Live Demo](https://rvargas.dev) | [GitHub Repository](https://github.com/RVSolutionsplus507/rvargas-portfolio-v2)
</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technologies](#️-technologies)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Usage](#-usage)
- [Deployment](#-deployment)
- [Customization](#-customization)
- [Contact](#-contact)
- [License](#-license)

## 🚀 Overview

This is my professional portfolio website showcasing my skills, projects, and experience as a Full-Stack Developer. The portfolio is designed to present a comprehensive view of my technical expertise, professional journey, and the projects I've developed throughout my career.

The site is built with modern web technologies for optimal performance and user experience, featuring a responsive design that works seamlessly across devices of all sizes.

## ✨ Features

- **Responsive Design** - Optimized for all device sizes
- **Dark/Light Mode** - Toggle between dark and light themes
- **Bilingual Support** - Available in both English and Spanish
- **Interactive UI** - Smooth animations and transitions with Framer Motion
- **Project Showcase** - Gallery of projects with detailed information and images
- **Contact Form** - EmailJS integration for direct communication
- **Resume Section** - Detailed work history with downloadable PDF versions
- **WhatsApp Integration** - Direct messaging capability via WhatsApp
- **Performance Optimized** - Fast loading times with code splitting and lazy loading

## 🛠️ Technologies

### Frontend
- **React** - UI library
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Navigation and routing
- **i18next** - Internationalization framework
- **React Hook Form** - Form validation
- **Shadcn UI** - Component library

### Tools & Utilities
- **EmailJS** - Email functionality
- **React Icons** - Icon library
- **Canvas Confetti** - Visual effects
- **React Infinite Logo Slider** - Smooth carousel for logos
- **Embla Carousel** - Lightweight carousel component

## 📁 Project Structure

```
src/
├── assets/         # Images and static files
├── components/     # Reusable components
│   ├── ui/         # Shadcn UI components
│   └── ...
├── context/        # React context providers
├── css/           # Custom CSS styles
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── pages/         # Main page components
└── traducciones/  # Translation files
    ├── en/        # English translations
    └── es/        # Spanish translations
```

## 🔧 Installation & Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/RVSolutionsplus507/rvargas-portfolio-v2.git
   cd rvargas-portfolio-v2
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Environment Variables**
   
   Create a `.env.local` file in the root directory and add your EmailJS credentials:
   ```
   VITE_EMAIL_USER_ID=your_user_id
   VITE_EMAIL_SERVICE_ID=your_service_id
   VITE_EMAIL_TEMPLATE_ID=your_template_id
   ```

4. **Start the development server**
   ```sh
   npm run dev
   ```

5. **Build for production**
   ```sh
   npm run build
   ```

## 📱 Usage

- Navigate to http://localhost:5173 (or the port shown in your terminal)
- Explore the different sections: About Me, Resume, Projects, and Contact
- Toggle between light and dark mode using the theme switcher
- Change language using the language selector
- View project details by clicking on project cards

## 🚢 Deployment

The project is configured for easy deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set up environment variables in the Vercel dashboard
3. Deploy and enjoy your live portfolio

## 🎨 Customization

To customize this portfolio for your own use:

- Replace personal information in the components and translation files
- Update project details in `src/pages/projects.jsx`
- Replace images in the `src/assets` directory
- Modify color schemes in `tailwind.config.js` and `src/index.css`
- Update resume content and download links

## 📬 Contact

- Email: rvargas@rv-solutions.net
- LinkedIn: Roberto J. Vargas
- GitHub: @RVSolutionsplus507
- Twitter: @devrvsplus

## 📄 License

© 2025 Roberto J. Vargas. All rights reserved.

<div align="center">
  <p>Made with ❤️ by Roberto J. Vargas</p>
</div>
